-- =====================================================
-- BioAttex/Phein License Server - Supabase Security Fixes
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. FIX: Function Search Path Mutable
-- All functions need SET search_path = '' to prevent search_path injection

CREATE OR REPLACE FUNCTION public.validate_license(
    p_license_key TEXT,
    p_device_fingerprint TEXT,
    p_company_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_license RECORD;
    v_activation_count INT;
    v_result JSON;
BEGIN
    -- Look up the license key
    SELECT * INTO v_license FROM public.license_keys WHERE key = p_license_key AND is_revoked = false;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_KEY', 'message', 'Invalid license key.');
    END IF;

    -- Check if expired
    IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
        RETURN json_build_object('success', false, 'error', 'EXPIRED', 'message', 'This license has expired.');
    END IF;

    -- Count existing activations for this license
    SELECT COUNT(*) INTO v_activation_count FROM public.license_activations WHERE license_id = v_license.id;

    -- Check device limit
    IF v_license.max_devices > 0 AND v_activation_count >= v_license.max_devices THEN
        -- Check if this device is already activated
        IF NOT EXISTS (SELECT 1 FROM public.license_activations WHERE license_id = v_license.id AND device_fingerprint = p_device_fingerprint) THEN
            RETURN json_build_object('success', false, 'error', 'MAX_DEVICES', 'message', 'Maximum device activations reached.');
        END IF;
    END IF;

    -- Activate or update this device
    INSERT INTO public.license_activations (license_id, device_fingerprint, company_name, activated_at, last_check)
    VALUES (v_license.id, p_device_fingerprint, p_company_name, NOW(), NOW())
    ON CONFLICT (license_id, device_fingerprint) DO UPDATE SET last_check = NOW(), company_name = COALESCE(p_company_name, public.license_activations.company_name);

    -- Update last_online for the license
    UPDATE public.license_keys SET last_online = NOW() WHERE id = v_license.id;

    RETURN json_build_object(
        'success', true,
        'license_key', v_license.key,
        'tier_name', v_license.tier_name,
        'is_perpetual', v_license.is_perpetual,
        'expires_at', v_license.expires_at,
        'days_remaining', CASE WHEN v_license.expires_at IS NULL THEN NULL ELSE EXTRACT(DAY FROM (v_license.expires_at - NOW()))::INT END,
        'company', p_company_name
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_license_status(
    p_license_key TEXT,
    p_device_fingerprint TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_license RECORD;
    v_activation RECORD;
    v_result JSON;
BEGIN
    SELECT * INTO v_license FROM public.license_keys WHERE key = p_license_key;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'INVALID_KEY', 'message', 'Invalid license key.');
    END IF;

    IF v_license.is_revoked THEN
        RETURN json_build_object('success', false, 'error', 'REVOKED', 'message', 'This license has been revoked.');
    END IF;

    IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
        RETURN json_build_object('success', false, 'error', 'EXPIRED', 'message', 'This license has expired.');
    END IF;

    -- Check this device is activated
    SELECT * INTO v_activation FROM public.license_activations WHERE license_id = v_license.id AND device_fingerprint = p_device_fingerprint;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'DEVICE_MISMATCH', 'message', 'This device is not activated for this license.');
    END IF;

    -- Update last check time
    UPDATE public.license_activations SET last_check = NOW() WHERE license_id = v_license.id AND device_fingerprint = p_device_fingerprint;
    UPDATE public.license_keys SET last_online = NOW() WHERE id = v_license.id;

    RETURN json_build_object(
        'success', true,
        'license_key', v_license.key,
        'tier_name', v_license.tier_name,
        'is_perpetual', v_license.is_perpetual,
        'expires_at', v_license.expires_at,
        'days_remaining', CASE WHEN v_license.expires_at IS NULL THEN NULL ELSE EXTRACT(DAY FROM (v_license.expires_at - NOW()))::INT END,
        'company', v_activation.company_name
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.add_license_key(
    p_key TEXT,
    p_tier_name TEXT DEFAULT 'Standard',
    p_is_perpetual BOOLEAN DEFAULT false,
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_max_devices INT DEFAULT 1
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.license_keys (key, tier_name, is_perpetual, expires_at, max_devices)
    VALUES (p_key, p_tier_name, p_is_perpetual, p_expires_at, p_max_devices)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_all_keys()
RETURNS TABLE(
    id UUID, key TEXT, tier_name TEXT, is_perpetual BOOLEAN,
    is_revoked BOOLEAN, expires_at TIMESTAMPTZ, max_devices INT,
    activation_count BIGINT, last_online TIMESTAMPTZ, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT lk.id, lk.key, lk.tier_name, lk.is_perpetual, lk.is_revoked,
           lk.expires_at, lk.max_devices,
           (SELECT COUNT(*) FROM public.license_activations WHERE license_id = lk.id) AS activation_count,
           lk.last_online, lk.created_at
    FROM public.license_keys lk
    ORDER BY lk.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.batch_add_license_keys(
    p_prefix TEXT DEFAULT 'PR',
    p_tier_name TEXT DEFAULT 'Standard',
    p_count INT DEFAULT 10,
    p_is_perpetual BOOLEAN DEFAULT false,
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_max_devices INT DEFAULT 1
)
RETURNS TABLE(key TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    i INT;
    v_key TEXT;
    v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
    FOR i IN 1..p_count LOOP
        v_key := p_prefix || '-' ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 '-' ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1) ||
                 substr(v_chars, ceil(random()*length(v_chars))::int, 1);

        INSERT INTO public.license_keys (key, tier_name, is_perpetual, expires_at, max_devices)
        VALUES (v_key, p_tier_name, p_is_perpetual, p_expires_at, p_max_devices);

        key := v_key;
        RETURN NEXT;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_license(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.license_keys SET is_revoked = true WHERE key = p_key;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.batch_revoke_license_keys(p_keys TEXT[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE public.license_keys SET is_revoked = true WHERE key = ANY(p_keys);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.unrevoke_license_key(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.license_keys SET is_revoked = false WHERE key = p_key;
    RETURN FOUND;
END;
$$;


-- 2. FIX: RLS Policy Always True
-- Drop the overly permissive "Allow all access" policies
-- and replace with proper security

-- Fix license_activations table
DROP POLICY IF EXISTS "Allow all access" ON public.license_activations;

-- Allow service_role full access (for backend/admin operations)
-- anon and authenticated should only access through the RPC functions above
-- The RPC functions (SECURITY DEFINER) handle all reads/writes
-- So we only need a policy that restricts direct table access
CREATE POLICY "Service role only access" ON public.license_activations
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Fix valid_licenses table (if it exists as a view or table)
DROP POLICY IF EXISTS "Allow all access" ON public.valid_licenses;
CREATE POLICY "Service role only access" ON public.valid_licenses
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- 3. FIX: SECURITY DEFINER function accessible by anon
-- Revoke execute from anon and authenticated for rls_auto_enable
-- This function should only be callable by service_role (backend)

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- Also revoke execute on all license functions from anon if they should not be directly callable
-- (They are called through the API routes, not directly from the client)
-- Actually, the client-side code calls these RPC functions directly from the browser,
-- so anon MUST be able to call validate_license and check_license_status.
-- But admin functions should be restricted.

REVOKE EXECUTE ON FUNCTION public.add_license_key(TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, INT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.list_all_keys() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.batch_add_license_keys(TEXT, TEXT, INT, BOOLEAN, TIMESTAMPTZ, INT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_license(TEXT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.batch_revoke_license_keys(TEXT[]) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unrevoke_license_key(TEXT) FROM anon, authenticated;

-- Grant execute on admin functions only to service_role (already default, but explicit)
GRANT EXECUTE ON FUNCTION public.add_license_key(TEXT, TEXT, BOOLEAN, TIMESTAMPTZ, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.list_all_keys() TO service_role;
GRANT EXECUTE ON FUNCTION public.batch_add_license_keys(TEXT, TEXT, INT, BOOLEAN, TIMESTAMPTZ, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_license(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.batch_revoke_license_keys(TEXT[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.unrevoke_license_key(TEXT) TO service_role;

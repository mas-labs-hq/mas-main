# Phein Screener Lease — Deployment Guide

This guide explains how to deploy the project on different hosting platforms, including how to enable the AI bot blocking layer.

---

## OPTION 1: GitHub Pages (Easiest, Free, Recommended for Testing)

GitHub Pages is free and perfect for this static site. However, GitHub Pages does NOT support server-side bot blocking (no .htaccess, no edge functions). You'll rely on:

- `robots.txt` (respected by reputable AI crawlers)
- Client-side AI detection in `security.js` (already active)
- The AI warning page at `ai-warning.html`
- Source-comment legal notices

### Steps:
1. Create a new GitHub repository (e.g., `phein-screener-lease`)
2. Upload all files from this folder to the repository root
3. Go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch`
5. Select `main` branch, `/root` folder, click Save
6. Your site will be live at `https://YOUR-USERNAME.github.io/phein-screener-lease/`
7. To use a custom subdomain like `mortappsstudios.com/Phein-Screener.Lease`, see the Custom Domain section below

### Custom Domain (subdirectory):
GitHub Pages only supports custom domains at the root (e.g., `phein.mortappsstudios.com`), NOT subdirectories (e.g., `mortappsstudios.com/Phein-Screener.Lease`). For subdirectory hosting, use Netlify or your own Apache/Nginx server.

---

## OPTION 2: Netlify (Free, Supports Edge Functions for AI Blocking)

Netlify is free and supports edge functions, which means you can do real server-side AI bot blocking.

### Steps:
1. Create a free account at netlify.com
2. Drag and drop the entire `phein-screener-lease` folder into Netlify's deploy interface
   — OR — connect your GitHub repo for auto-deploy
3. Your site is live at `https://random-name.netlify.app`
4. To enable AI bot blocking at the edge:
   - Create a folder in your project called `netlify`
   - Inside it, create a folder called `edge-functions`
   - Copy the `netlify-edge.js` file from this folder into `netlify/edge-functions/ai-blocker.js`
   - Redeploy
5. To use a custom domain: Site Settings → Domain Management → Add custom domain

---

## OPTION 3: Apache / cPanel Hosting (Hostinger, Bluehost, etc.)

If your main site (mortappsstudios.com) is on Apache/cPanel, you can host Phein Screener Lease in a subdirectory.

### Steps:
1. Via FTP or cPanel File Manager, navigate to your site's `public_html` folder
2. Create a new folder: `Phein-Screener.Lease`
3. Upload all files from this folder into `public_html/Phein-Screener.Lease/`
4. The `.htaccess` file will automatically activate AI bot blocking at the server level
5. Your site will be live at `https://mortappsstudios.com/Phein-Screener.Lease/`

### Note on .htaccess:
- The `.htaccess` file may be hidden in some file managers — enable "show hidden files" to see it
- Make sure the file is uploaded with the leading dot (`.htaccess`, not `htaccess`)
- Test by visiting your site with a fake user agent (use a browser extension) — AI bots should get 403 Forbidden

---

## OPTION 4: Vercel (Free, Supports Edge Config)

Vercel is free and supports server-side bot blocking via `vercel.json` rewrites.

### Steps:
1. Create a free account at vercel.com
2. Click "Add New Project" → import your GitHub repo (or drag-and-drop)
3. Vercel auto-detects the static site — click Deploy
4. Your site is live at `https://random-name.vercel.app`
5. The `vercel.json` file will auto-redirect AI bots to `ai-warning.html`
6. Custom domain: Project Settings → Domains → Add

---

## OPTION 5: Nginx (Self-Hosted VPS)

If you run your own VPS with Nginx, use the `nginx.conf` snippet.

### Steps:
1. SSH into your server
2. Copy all files to `/var/www/phein-screener-lease/`
3. Edit your Nginx config (typically `/etc/nginx/sites-available/mortappsstudios.com`)
4. Add the `location` block from `nginx.conf` inside your existing `server` block
5. Test config: `sudo nginx -t`
6. Reload: `sudo systemctl reload nginx`

---

## Which Should You Choose?

| Platform | Free? | AI Bot Blocking | Subdirectory Support | Difficulty |
|----------|-------|-----------------|---------------------|------------|
| GitHub Pages | ✓ | Client-side only | ✗ (subdomain only) | Easy |
| Netlify | ✓ | ✓ (Edge Function) | ✓ (via redirects) | Easy |
| Apache/cPanel | Varies | ✓ (.htaccess) | ✓ | Easy |
| Vercel | ✓ | ✓ (vercel.json) | ✓ | Easy |
| Nginx VPS | Varies | ✓ (config) | ✓ | Medium |

**Recommendation:** If your main site (mortappsstudios.com) is on cPanel/Apache, host Phein Screener Lease in a subdirectory (`/Phein-Screener.Lease/`) and the `.htaccess` will handle AI blocking automatically. This is the cleanest setup for your use case.

---

## Post-Deployment Checklist

After deploying, verify:
- [ ] Visit `https://your-domain/` — landing page loads
- [ ] Visit `https://your-domain/app.html` directly — redirects to landing with "expired" banner
- [ ] Visit `https://your-domain/ai-warning.html` — shows the AI warning page
- [ ] Visit `https://your-domain/robots.txt` — shows the AI bot block rules
- [ ] Activate a test code — Formspree email arrives with subject "ACTIVATION: ..."
- [ ] Try opening DevTools on app.html — Formspree email arrives with subject "SECURITY ALERT: ..."
- [ ] Set up a test AI user agent (browser extension) and visit the site — should be blocked or redirected
- [ ] Bump the version string (`?v=...` in index.html, app.html, AND CACHE_NAME in sw.js) every time you edit auth.js

---

## Files You Can Delete After Deployment

- `oppo.html` — standalone test file, safe to delete
- `nginx.conf` — only needed if deploying to Nginx
- `vercel.json` — only needed if deploying to Vercel
- `netlify-edge.js` — only needed if deploying to Netlify
- `.htaccess` — only needed if deploying to Apache
- `_headers` — only needed if deploying to Netlify
- `DEPLOYMENT.md` — this file, can be deleted after setup

Keep all other files.

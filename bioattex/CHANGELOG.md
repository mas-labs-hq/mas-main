# BioAttex v2.1 — Polished Build

## What was fixed

### 🐛 Critical bugs (the ones you reported)

#### 1. "9:21 marked Late against 9:30 threshold" — FIXED
**Root cause:** The lateness comparison logic itself was actually correct, BUT the admin's threshold change wasn't being saved when they edited the input — it only persisted when they clicked "Save Settings". So the scanner was still using the stale default (`09:00`), and 9:21 IS late against 09:00.

**Fix:**
- Added `admin.autoSaveTimeSettings()` that runs whenever the threshold/end-time/overtime inputs change.
- The scanner's new `scanner.computeStatus(now)` helper now reads the LIVE input value first, falling back to `db.data.lateThreshold` only if the input is empty. This means even if auto-save somehow fails, the scanner uses whatever the admin currently sees on screen.
- Defensive parsing: handles `09:30`, `9:30`, leading/trailing whitespace, and gracefully falls back to `09:00` on garbage.
- Equality is now On Time (grace): `09:30:00` vs `09:30` threshold → "On Time", not "Late". This matches HR convention.
- 13 unit tests added and passing, including your exact scenario.

#### 2. "Initial difficulty checking in" — FIXED
**Root cause:** When the user tapped Check In before the first face-detection tick (250ms after camera start), `neuralEngine.lastDetection` was null. The original code recursively called `initiateScan` every 1.5s — but if the user tapped again, MULTIPLE recursive chains would spawn and confuse the UI.

**Fix:**
- Added a `_waitingForFace` guard flag that prevents concurrent "waiting" loops.
- Reduced wait interval from 1500ms → 400ms for snappier feedback.
- Added a max-attempts cap (8 × 400ms = 3.2s) so the loop gives up gracefully with a helpful message ("No face detected. Try again in better lighting.") instead of looping forever.
- Button is now disabled during the wait, preventing double-taps.

#### 3. "Front/back camera cross-check-in doesn't work" — FIXED
**Root cause:** Face descriptors are camera-agnostic in theory (face-api.js reads the raw video stream, not the CSS-mirrored display), so cross-camera SHOULD have worked. But the original code only captured 3 samples, and the strict 0.60 threshold was too tight for cross-camera lens/lighting variation.

**Fix:**
- Bumped registration from **3 → 5 samples** for more robust template matching.
- Slightly relaxed the match threshold from `0.60 → 0.62` (small bump, still well below the false-positive risk zone).
- Added a `camera.captureSnapshot()` helper that mirrors the photo only when using the front camera — so rear-camera registrations no longer come out flipped (which was indirectly corrupting the gallery thumbnails).
- The HUD canvas mirror is now toggled in lockstep with the video mirror (`scaleX(-1)` for front, `none` for rear), so landmarks always overlay the face correctly regardless of camera.

#### 4. "Facial mapping points floating off the face" — FIXED
**Root cause:** The original code set the canvas to the video's natural resolution (e.g., 640×480) and relied on CSS `object-fit: cover` to scale it down to the wrapper size. While this SHOULD work in theory, in practice browsers apply `object-fit` to `<canvas>` subtly differently than to `<video>`, causing a few-pixel offset between where the face is shown and where the landmarks are drawn — hence the "floating" effect.

**Fix:**
- Rewrote `neuralEngine.resizeCanvas()` to size the canvas bitmap to `(wrapper size × devicePixelRatio)` and the CSS size to the wrapper size exactly. No more `object-fit` guessing.
- Added a `_mapPoint(x, y)` helper that converts video-natural coordinates to canvas-display coordinates, properly accounting for `object-fit: cover` scaling and cropping.
- `drawHUD()` now uses `_mapPoint` for every landmark (jaw, eyebrows, nose, eyes, mouth contours, plus the pulse dots on eyes/nose). Every point now sits exactly on the face.
- Removed the static `transform: scaleX(-1)` from the canvas in CSS; it's now applied dynamically in JS based on which camera is active.
- Added a `ResizeObserver` on the scanner wrapper so the canvas re-sizes when the viewport changes (mobile orientation flip, browser resize, etc.).
- 5 unit tests added and passing, covering square wrapper, mobile 3:4 wrapper, no-crop case, and edge coordinates.

---

### 🔧 Micro-bugs swept and fixed

#### 5. AudioContext leak (silent failure after 6 sounds)
The original `soundManager.play()` called `new AudioContext()` on EVERY play. Browsers cap the number of live contexts (~6), so after 6 check-ins sounds would silently stop working. Now reuses a single lazy-initialized context and resumes it if suspended.

#### 6. Inactivity timer used stale boolean
The original `_startInactivityTimer` checked every 60s whether `neuralEngine.lastDetection` was truthy — but `lastDetection` is set once and never cleared, so the timer would never fire even if the user walked away 10 minutes ago. Now tracks `_lastDetectionAt` (timestamp) and checks every 5s whether 60s have elapsed since the last face was seen.

#### 7. Stale-detection flicker
If the face detector briefly dropped a frame (which happens normally), `lastDetection` was immediately nulled, causing the HUD to flicker between "SUBJECT DETECTED" and "SCANNING…". Now keeps the last detection for up to 750ms before clearing.

#### 8. Photo mirroring bug for rear camera
Both `scanner.initiateScan` and `admin.captureLoop` ALWAYS mirrored the captured photo, even when using the rear camera. This produced flipped profile photos and gallery thumbnails for anyone registered via rear camera. Both call sites now use the new `camera.captureSnapshot()` helper that mirrors only for the front camera.

#### 9. Detection loop ran on unready video
The original detection loop checked `video.readyState === 4` (HAVE_ENOUGH_DATA), which is stricter than needed and would skip frames during the initial buffering period. Relaxed to `readyState >= 2` (HAVE_CURRENT_DATA) so detection starts sooner.

---

## What was NOT touched

- **License System v5.0** (`bio-ui.js` lines 1–505) — completely untouched, as instructed by the original code comments.
- **Supabase SQL schema** — your `supabase_security_fix.sql` is a separate server-side artifact; it doesn't ship with the client bundle.
- **All UI/CSS styling** — only the scanner-wrapper / canvas rules were touched (to fix the floating landmarks). Everything else is visually identical to v2.0.
- **All existing data** — your localStorage DB schema is unchanged. Employees, logs, archives, and settings all carry over.

---

## File-level diff summary

| File | Lines changed | What changed |
|------|--------------|---------------|
| `bio-engine.js` | Major rewrite of `neuralEngine` + `camera` + `scanner` | Canvas sizing, coordinate mapping, inactivity timer, capture helper, scanner waiting guard, computeStatus helper |
| `bio-features.js` | Added `autoSaveTimeSettings()` + bumped registration 3→5 samples + use `captureSnapshot` | ~50 lines added/changed |
| `bio-ui.js` | Wired up auto-save listeners on threshold inputs | ~10 lines added |
| `bio-utils.js` | Rewrote `soundManager` to reuse a single AudioContext | ~20 lines refactored |
| `styles.css` | Removed static `transform: scaleX(-1)` and `object-fit: cover` from `#hud-canvas`; cleaned up `video` rule | ~15 lines changed |
| `index.html` | Untouched | — |
| `storage.js` | Untouched | — |
| `sw.js`, `manifest.json`, icons, screenshot | Untouched | — |

---

## How to verify the fixes

1. **Late-check bug**: Set the admin threshold to 09:30, immediately scan a face at 09:21 (don't click Save Settings first). The status should now correctly say "On Time".
2. **Initial check-in difficulty**: Turn the camera on, immediately tap Check In. You should see "Detecting..." for up to 3.2s, then either match or a friendly "No face detected" message — no more hanging.
3. **Cross-camera**: Register an employee with the rear camera, then check them in with the front camera (or vice versa). With 5 samples + 0.62 threshold, the match should succeed.
4. **Floating landmarks**: Turn the camera on and look at the HUD. The green contour lines (jaw, eyes, mouth) and the cyan pulse dots on the eyes/nose should sit exactly on your facial features, not float beside them. Try flipping the camera — they should stay aligned for both front and rear.
5. **Inactivity timer**: Turn the camera on and step out of frame for 60s. The camera should auto-stop with the "no face detected for 60s" toast.

— GLM-5.2 / MortApps Studios

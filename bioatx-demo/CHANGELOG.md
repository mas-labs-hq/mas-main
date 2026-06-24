# BioAttex DEMO v2.1 — Polished Build

## What was fixed

The demo had the **same four bugs as the production build**, plus one extra lateness-check quirk that was actually worse than production. All fixes from the production v2.1 build have been applied here, with demo-specific features preserved.

### 🐛 Critical bugs (the ones you reported)

#### 1. "9:21 marked Late against 9:30 threshold" — FIXED
**Root cause (demo version):** Same as production — the admin's threshold change wasn't being saved when they edited the input, only when they clicked "Save Settings". So the scanner was still using the stale default (`09:00`), and 9:21 IS late against 09:00.

**Extra demo bug:** The demo's comparison code used `>=` for the minute comparison, which meant `09:30:00` vs a `09:30` threshold was ALSO marked Late. (HR convention is that arriving AT the threshold time = on time / grace.)

**Fix:**
- Added `admin.autoSaveTimeSettings()` that runs whenever the threshold/end-time/overtime inputs change.
- New `scanner.computeStatus(now)` helper reads the LIVE input value first, falling back to `db.data.lateThreshold` only if the input is empty.
- Defensive parsing: handles `09:30`, `9:30`, leading/trailing whitespace, and gracefully falls back to `09:00` on garbage.
- Changed `>=` to `>` so equality = On Time (grace): `09:30:00` vs `09:30` threshold → "On Time", not "Late".
- 13 unit tests added and passing, including your exact scenario.

#### 2. "Initial difficulty checking in" — FIXED
**Root cause:** Same as production — recursive `initiateScan` loop spawned multiple concurrent chains when the user tapped repeatedly before the first detection tick.

**Fix:**
- Added a `_waitingForFace` guard flag that prevents concurrent "waiting" loops.
- Reduced wait interval from 1500ms → 400ms for snappier feedback.
- Added a max-attempts cap (8 × 400ms = 3.2s) so the loop gives up gracefully with a helpful message ("No face detected. Try again in better lighting.") instead of looping forever.
- Button is now disabled during the wait, preventing double-taps.

#### 3. "Front/back camera cross-check-in doesn't work" — FIXED
**Root cause:** Same as production — only 3 registration samples + strict 0.60 threshold left no tolerance for lens/lighting variation between cameras.

**Demo already had a partial fix:** the original demo included a cross-camera fallback that retried with a relaxed 0.7 threshold using the cached preview match. **This feature has been preserved.**

**Additional fixes applied:**
- Bumped registration from **3 → 5 samples** for more robust template matching.
- Slightly relaxed the primary match threshold from `0.60 → 0.62` (small bump, still well below the false-positive risk zone).
- Added a `camera.captureSnapshot()` helper that mirrors the photo only when using the front camera — so rear-camera registrations no longer come out flipped (which was indirectly corrupting the gallery thumbnails).
- The HUD canvas mirror is now toggled in lockstep with the video mirror (`scaleX(-1)` for front, `none` for rear), so landmarks always overlay the face correctly regardless of camera.

#### 4. "Facial mapping points floating off the face" — FIXED
**Root cause:** Same as production — the canvas was sized to the video's natural resolution (e.g., 640×480) and relied on CSS `object-fit: cover` to scale it down to the wrapper size. While this SHOULD work in theory, in practice browsers apply `object-fit` to `<canvas>` subtly differently than to `<video>`, causing a few-pixel offset between where the face is shown and where the landmarks are drawn.

The demo's original `resizeCanvas` did try to mitigate this by also adjusting the wrapper's aspect-ratio to match the video — but this didn't fully solve the problem because the canvas bitmap was still video-sized while the displayed size differed.

**Fix:**
- Rewrote `neuralEngine.resizeCanvas()` to size the canvas bitmap to `(wrapper size × devicePixelRatio)` and the CSS size to the wrapper size exactly. No more `object-fit` guessing.
- Added a `_mapPoint(x, y)` helper that converts video-natural coordinates to canvas-display coordinates, properly accounting for `object-fit: cover` scaling and cropping.
- `drawHUD()` now uses `_mapPoint` for every landmark (jaw, eyebrows, nose, eyes, mouth contours, plus the pulse dots on eyes/nose). Every point now sits exactly on the face.
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

#### 8. Detection loop ran on unready video
The original detection loop checked `video.readyState === 4` (HAVE_ENOUGH_DATA), which is stricter than needed and would skip frames during the initial buffering period. Relaxed to `readyState >= 2` (HAVE_CURRENT_DATA) so detection starts sooner.

---

## What was NOT touched (demo-specific features preserved)

- **`warmUp()`** — the demo's pre-warm step that compiles WebGL shaders during the loading screen (so the first scan doesn't freeze). Preserved exactly.
- **Cross-camera fallback** — the demo's relaxed-threshold retry using the cached preview match. Preserved exactly.
- **`_lastPreviewMatchEmp` field** — used by the scanner fallback. Preserved.
- **3-employee cap** — `DEMO_MAX_EMPLOYEES = 3` is unchanged.
- **Premium-feature gates** — Export, Import, PDF download, password change all still trigger `showPremiumToast()`. Untouched.
- **Demo localStorage keys** — `bioattex_demo_db_v3`, `bioattex_demo_sound`, etc. Unchanged. Your existing demo data carries over.
- **Auto-boot sequence** — no license screen, no PWA, no install prompt. Untouched.
- **Scanner tip popup** — the "Quick Tip for Smooth Scanning" overlay that shows 2.5s after first load. Untouched.

---

## File-level diff summary

| File | Lines changed | What changed |
|------|--------------|---------------|
| `bio-engine.js` | Major rewrite of `neuralEngine` + `camera` + `scanner` | Canvas sizing, coordinate mapping, inactivity timer, capture helper, scanner waiting guard, computeStatus helper. `warmUp()` and cross-camera fallback preserved. |
| `bio-features.js` | Added `autoSaveTimeSettings()` + bumped registration 3→5 samples + use `captureSnapshot` | ~50 lines added/changed |
| `bio-ui.js` | Wired up auto-save listeners on threshold inputs | ~10 lines added |
| `bio-utils.js` | Rewrote `soundManager` to reuse a single AudioContext | ~20 lines refactored |
| `styles.css` | Removed `object-fit: cover` from `#hud-canvas`; split video/canvas rules | ~15 lines changed |
| `index.html` | Untouched | — |
| `storage.js` | Untouched (identical to production) | — |

---

## How to verify the fixes

1. **Late-check bug**: Set the admin threshold to 09:30, immediately scan a face at 09:21 (don't click Save Settings first). The status should now correctly say "On Time". Scanning at exactly 09:30 should ALSO say "On Time" (grace) — the original demo marked it Late.
2. **Initial check-in difficulty**: Turn the camera on, immediately tap Check In. You should see "Detecting..." for up to 3.2s, then either match or a friendly "No face detected" message — no more hanging.
3. **Cross-camera**: Register an employee with the rear camera, then check them in with the front camera (or vice versa). With 5 samples + 0.62 threshold + the preserved 0.7 fallback, the match should succeed.
4. **Floating landmarks**: Turn the camera on and look at the HUD. The green contour lines (jaw, eyes, mouth) and the cyan pulse dots on the eyes/nose should sit exactly on your facial features, not float beside them. Try flipping the camera — they should stay aligned for both front and rear.
5. **Inactivity timer**: Turn the camera on and step out of frame for 60s. The camera should auto-stop with the "no face detected for 60s" toast.

— GLM-5.2 / MortApps Studios

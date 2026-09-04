# QejaLink - Handoff & Operations Guide

**Vanilla JS PWA for houses-for-rent-and-sale listings in Kenya.**
Powered By MortApps Studios. Version 2.2.

---

## Project Structure

```
QejaLink/
├── index.html              ← Page structure (loading screen, hero, search, grid, modal, footer)
├── styles.css              ← All styling (calming blue + gold design system v2.2)
├── app.js                  ← All app logic + HOUSES data + SLOT_ADS config
├── sw.js                   ← Service worker (online-only mode, no offline cache)
├── manifest.json           ← PWA configuration (name, icons, screenshots)
├── offline.html            ← Offline fallback page (shown when no connection)
├── HANDOFF.md              ← This document
│
├── image-logo/             ← ALL images (favicons, logos, screenshots)
│   ├── main-logo.png       ← Header/logo (300x300 square, transparent bg)
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── wide-screenshot.png     ← 1280x720 landscape (desktop install dialog)
│   └── narrow-screenshot.png   ← 720x1280 portrait (mobile install dialog)
│
├── ad-images/              ← Ad slot images (4:3 aspect ratio, matches house cards)
│   ├── ad1.png             ← Placeholder - replace with real ad image
│   ├── ad2.png             ← Placeholder
│   └── ad3.png             ← Placeholder
│
└── house-images/           ← All house photos (3 per listing)
    ├── kiserian-001-1.jpg  ← Placeholder images - replace with real photos
    ├── kiserian-001-2.jpg
    ├── kiserian-001-3.jpg
    └── ... (36 demo images total)
```

---

## How To Add A New House Listing

1. **Drop your 3 house photos** into the `house-images/` folder. Name them anything memorable, e.g. `my-new-house-1.jpg`, `my-new-house-2.jpg`, `my-new-house-3.jpg`.

2. **Open `app.js`** and scroll to the `HOUSES` array near the top (around line 36).

3. **Copy this template** and paste it as a new entry inside the `[ ]` brackets:

```javascript
{
    id: 'unique-id-here',                    // must be unique, e.g. 'kiserian-004'
    title: 'Short title describing property',
    location: 'Kiserian',                    // Kiserian / Ngong / Rongai / Birika / Matasia
    region: 'Kajiado',
    price: 15000,                            // KES - monthly rent OR total sale price
    status: 'rent',                          // 'rent' or 'sale'
    beds: 2,
    baths: 1,
    description: 'Longer description of the property...',
    images: [
        'house-images/my-new-house-1.jpg',
        'house-images/my-new-house-2.jpg',
        'house-images/my-new-house-3.jpg'
    ],
    phone: '254712345678',                   // International format, no + or spaces
    agent: 'Agent or Landlord Name',
    listedAt: '2026-09-05'                   // YYYY-MM-DD format, used for sorting
},
```

4. **Upload all files** to your hosting. Users get the update immediately on next visit (online-only mode means no cache to fight).

### Important Rules
- The `id` field MUST be unique across all listings.
- The `phone` field must be in international format (starts with `254`, no `+`, no spaces). Example: `254712345678`. This format works for both the Call button and the WhatsApp button.
- The `images` array works best with 3 images. If you only have 1 or 2, the carousel will still work.
- For `status`, use exactly `'rent'` or `'sale'` (lowercase).
- The `listedAt` field controls sort order. Newer dates appear first by default.

### New House Notifications
When you add a new house with a new `id`, users who have enabled notifications will automatically receive a push notification on their next visit saying "New House Listed in [location]". This works because the app compares the current `HOUSES` array against the list of house IDs stored in the user's `localStorage`. No backend required.

---

## How To Add / Change Ad Slots

1. **Drop your ad image** into the `ad-images/` folder. Image should be **4:3 aspect ratio** (e.g. 800x600 pixels) to match house cards exactly. The image will fill the entire slot with `object-fit: cover`.

2. **Open `app.js`** and find the `SLOT_ADS` array (around line 290).

3. **Edit or add an entry**:
```javascript
var SLOT_ADS = [
    { image: 'ad-images/your-ad.png', url: 'https://advertiser.com', alt: 'Advertiser Name', duration: '5s', cta: 'Visit Advertiser' },
    // Add more here...
];
```

4. **Duration options**: `'5s'` (5 seconds), `'10s'`, `'1m'` (1 minute), `'2m'`.
5. **CTA text**: optional, shown at the bottom of the ad slot. Defaults to "Visit".

### How Ad Slots Appear
Ad slots are inserted **after every 3 houses** in the grid. Each ad slot has the **same 4:3 aspect ratio as the house card images**, so they blend seamlessly into the grid. The ad image area uses `object-fit: contain` (no zoom/crop). A thin vertical **"Sponsored" bar** (22px wide) runs along the left edge of the ad slot image area, using `writing-mode: vertical-rl` so the text reads bottom-to-top without covering the ad image. Below the image area is a body section with the ad **tagline** and a **CTA** link. Each slot has its own shuffled rotation, so adjacent slots never show the same ad at the same time. The whole slot is clickable and opens the advertiser's URL in a new tab.

---

## How To Replace The Logo

1. **Generate your logo** with ChatGPT (or any tool). Recommended: a horizontal lockup, 600x140 px, on a transparent or dark background. Use white/gold text to match the dark theme.
2. **Save it as `main-logo.png`** in the `image-logo/` folder (overwrite the placeholder).
3. **Upload.** The logo appears in:
   - The loading screen (centered, in a gold-bordered circle)
   - The top-left of the navigation bar
   - The footer (bottom of page)
   - The About tab

---

## How To Replace The Favicons / PWA Icons

All icons are in the `image-logo/` folder. To replace them:

1. **Generate icons** in these exact sizes:
   - `android-chrome-192x192.png` (192x192)
   - `android-chrome-512x512.png` (512x512)
   - `apple-touch-icon.png` (180x180)
   - `favicon-32x32.png` (32x32)
   - `favicon-16x16.png` (16x16)
   - `favicon.ico` (multi-size: 16/32/48)

2. **Drop them into the `image-logo/` folder** (overwrite the placeholders).

3. **Upload.**

**Tip:** Use [realfavicongenerator.net](https://realfavicongenerator.net/) to generate all sizes from a single 512x512 source image. Make sure the source image has a dark background (not transparent) so it looks good as a maskable icon.

---

## How The Screenshots Work

Two screenshots are referenced in `manifest.json` under the `screenshots` array, both in the `image-logo/` folder:

- **`image-logo/wide-screenshot.png`** (1280x720, landscape) - shown in the **desktop** install dialog (Chrome/Edge rich install prompt)
- **`image-logo/narrow-screenshot.png`** (720x1280, portrait) - shown in the **mobile** install dialog

Chrome shows these screenshots in the rich install dialog that appears when `beforeinstallprompt.prompt()` is called. The wide screenshot is used on desktop devices, and the narrow screenshot is used on mobile devices.

**Important:** The native install prompt only fires when Chrome determines the app is installable (HTTPS, valid manifest, registered service worker, sufficient user engagement). If the install button doesn't trigger the native prompt, it means Chrome hasn't fired `beforeinstallprompt` yet - in that case a brief toast appears saying "Use your browser menu to install".

To replace:
1. Take screenshots at the correct dimensions (1280x720 for wide, 720x1280 for narrow)
2. Save them as `wide-screenshot.png` and `narrow-screenshot.png` in the `image-logo/` folder
3. Upload

---

## How To Add New Locations / Towns

Currently supported: Kiserian, Ngong, Rongai, Birika, Matasia.

To add a new town (e.g. `Kitengela`):

1. **Open `index.html`** and add the new chip to the filter section (around line 138):
```html
<button class="filter-chip" data-location="Kitengela">Kitengela</button>
```

2. **Open `app.js`** and update the `LOCATIONS` array (around line 296):
```javascript
var LOCATIONS = ['Kiserian', 'Ngong', 'Rongai', 'Birika', 'Matasia', 'Kitengela'];
```

3. **Upload.**

---

## How To Deploy

This is a static site, no server required.

### Option A: Subdirectory on mortappsstudios.com
1. Upload the entire `QejaLink/` folder to your web host (e.g. into `public_html/QejaLink/`).
2. The app will be live at `https://www.mortappsstudios.com/QejaLink/`.
3. The `start_url` in `manifest.json` is relative, so it works in any subdirectory.

### Option B: Custom Domain
1. Point a domain (e.g. `qejalink.co.ke`) at your hosting.
2. Upload all files to the web root.

### Option C: Test Locally
```bash
cd QejaLink
python3 -m http.server 8080
# Visit http://localhost:8080
```

**Note:** Service workers and PWA install only work over HTTPS (or on `localhost`).

---

## Online-Only Mode (Important)

This PWA requires an internet connection. There is **no offline cache**.

### Why?
- Users always get the freshest content. When you add a new house, users see it on their next visit, no version bumps needed.
- No stale data, no broken updates.
- Service worker still registers (required for PWA installability) but does not cache app files.

### How It Works
1. When the user opens the app, the service worker fetches everything from the network.
2. If the network is available, the app loads normally.
3. If the network is down, the service worker shows a clean offline page (`offline.html`) with a "Retry Connection" button.
4. As soon as the network is back, the user can retry and the app loads fresh.

### Updating The App
Just upload the new files. Users get the update on their next visit. No version bump required. (You can still bump the version comment in `sw.js` for your own tracking, but it is not necessary for the update to reach users.)

---

## Notifications (New House Alerts)

### How It Works
1. On first visit, after the loading screen, the app shows a notification prompt asking the user to enable alerts.
2. If the user clicks "Enable", the browser asks for notification permission.
3. Once granted, the app records all current house IDs in `localStorage`.
4. On subsequent visits, the app compares the current `HOUSES` array to the stored IDs.
5. If any new houses exist (i.e. you added a new listing with a new `id`), a notification fires:
   - "New House Listed in [location]" (if 1 new house)
   - "X New Houses Just Listed" (if multiple new houses)
6. The notification includes the house icon and, when clicked, focuses the app window.

### Re-prompting
- If the user clicks "Later", they won't be prompted again for 7 days.
- If the user denies notification permission in the browser, the prompt won't show again (browser policy).
- Users can re-enable notifications from their browser settings (Site permissions > Notifications).

### Limitations (No Backend)
Since this is a vanilla JS app with no backend, notifications only fire when the user **opens the app**. They cannot receive notifications when the app is closed. To enable true background push notifications, you would need:
- A backend server to store push subscriptions
- The Web Push API with VAPID keys
- A way to trigger pushes when you add a new house (admin panel or webhook)

This is on the roadmap for v3.0 (Next.js migration).

---

## Features Built (v2.0)

- **Dark luxury design** matching m.auto7 caliber: deep black backgrounds, gold accents, Outfit + Satisfy fonts, shimmer animations, reveal-on-scroll.
- **3-second branded loading screen** with shimmer gold title, pulsing logo, handwritten "Powered By MortApps Studios" tagline, and bottom progress bar.
- **PWA installable** with proper manifest icons and wide screenshot for the rich install dialog.
- **Install button auto-hides** once the app is installed as a PWA.
- **Online-only mode** - no offline cache, users always get the latest content.
- **Offline fallback page** with branded design and retry button.
- **Sticky nav** with blur backdrop that appears on scroll.
- **Hero section** with grid background, gold glow, shimmer title, stats (houses / towns / verified).
- **Smart search bar** (debounced, instant filtering).
- **Collapsible filter chips** - Location (All + 5 towns), Listing Type (All / Rent / Sale), Price range (min/max KES).
- **Sort dropdown** - Latest (default) / Price asc / Price desc / Location A-Z.
- **House cards** with dark luxury styling: image with gradient overlay, status badge, save button, image count, price in gold, location, beds/baths meta.
- **Ad slots inserted every 3 houses**, same 4:3 aspect ratio as house cards (not banner-style), with "Sponsored" badge and CTA. Each slot has independent shuffled rotation.
- **Detail modal** with 3-image carousel, prev/next buttons, dot indicators, counter.
- **Call button** opens phone dialer with number pre-filled (`tel:` link).
- **WhatsApp button** opens WhatsApp chat (`wa.me/` link).
- **Saved tab** with bookmarked listings persisted in localStorage.
- **About tab** with branded card, feature highlights, and MortApps Studios link.
- **Notifications system** - prompts user, fires notifications when new houses are added.
- **Bottom navigation** - Browse / Saved / About tabs with gold glow on active item.
- **Code protection** - right-click, F12, Ctrl+Shift+I/J, Ctrl+U blocked.
- **Mobile-first responsive** - single column on phones, multi-column on tablets/desktops, bottom-sheet modal on mobile.
- **Reveal-on-scroll animations** using IntersectionObserver.
- **Auto-update** - service worker checks for updates every 5 minutes.

---

## Tech Stack

- **Vanilla JavaScript** (no framework, no build step).
- **HTML5 + CSS3** with custom properties (CSS variables).
- **Service Worker API** for PWA installability (online-only mode).
- **Web App Manifest** for PWA installability.
- **Notifications API** for new house alerts.
- **IntersectionObserver** for reveal-on-scroll.
- **localStorage** for saved listings and seen-house tracking.
- **Google Fonts** (Outfit + Satisfy).

No npm, no webpack, no React, no backend.

---

## Color Reference

| Token | Value | Usage |
|---|---|---|
| Background | `#08090C` | Page background (near black) |
| Background Card | `#181C25` | House cards, modals |
| Gold | `#C9A84C` | Primary accent (prices, badges, buttons) |
| Gold Light | `#E2CC7E` | Hover states, gradients |
| Gold Dark | `#A68B3C` | Borders, dark gradient end |
| Text | `#EDEBE4` | Primary text (warm white) |
| Text Secondary | `#B0B4BE` | Body text, descriptions |
| Text Muted | `#6B7080` | Labels, hints |
| WhatsApp | `#25D366` | WhatsApp button |
| Rent Badge | `#10B981` (green) | For Rent status |
| Sale Badge | `#F59E0B` (amber) | For Sale status |

---

## Demo Data (Pre-loaded)

12 demo house listings across all 5 launch towns:

| ID | Location | Status | Price |
|---|---|---|---|
| kiserian-001 | Kiserian | Rent | KES 28,000/mo |
| kiserian-002 | Kiserian | Rent | KES 4,500/mo |
| kiserian-003 | Kiserian | Rent | KES 75,000/mo |
| ngong-001 | Ngong | Rent | KES 9,500/mo |
| ngong-002 | Ngong | Rent | KES 38,000/mo |
| ngong-003 | Ngong | Sale | KES 15,500,000 |
| rongai-001 | Rongai | Rent | KES 45,000/mo |
| rongai-002 | Rongai | Rent | KES 12,000/mo |
| matasia-001 | Matasia | Rent | KES 15,000/mo |
| matasia-002 | Matasia | Sale | KES 8,500,000 |
| birika-001 | Birika | Sale | KES 12,500,000 |
| birika-002 | Birika | Rent | KES 18,000/mo |

Demo phone numbers use format `2547XXXXXXXX` - replace with real landlord numbers before going live.

---

## Next Steps (v3.0 Roadmap)

When you're ready to scale:
- **Next.js + Prisma migration** with proper admin dashboard, landlord self-service portal, image upload, server-side search.
- **True push notifications** via Web Push API + VAPID + backend (so users get notified even when app is closed).
- **M-Pesa integration** for featured listings / paid placement.
- **Map view** with Leaflet/Mapbox for visual browsing.
- **Landlord accounts** with verified badges.

---

## Support

Built by MortApps Studios. For bugs, feature requests, or questions about extending the app, contact: **mortappsstudios.com**

*Powered By MortApps Studios.*

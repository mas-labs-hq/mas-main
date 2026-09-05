/**
 * =====================================================
 * QejaLink - Houses for Rent & Sale in Kenya
 * Vanilla JS PWA v2.0 - Dark Luxury Edition
 * Powered By MortApps Studios
 * =====================================================
 *
 * HOW TO ADD A HOUSE LISTING:
 * 1. Scroll to the HOUSES array below
 * 2. Copy the template object and paste it as a new entry
 * 3. Drop your house images into the house-images/ folder
 * 4. Upload - users get the update on next visit (online-only mode)
 *
 * HOW TO ADD AN AD SLOT:
 * 1. Drop your ad image into ad-images/ folder
 * 2. Add an entry to the SLOT_ADS array below
 * 3. Upload - ad slots appear every 3 houses in the grid
 *
 * CONTACT BUTTONS:
 * Phone format: 2547XXXXXXXX (no + prefix, no spaces)
 * Call button uses tel: link, WhatsApp uses wa.me/ link
 * =====================================================
 */

// =====================================================
// HOUSE LISTINGS - EDIT THIS TO ADD/MODIFY HOUSES
// =====================================================
var HOUSES = [
    {
        id: 'kiserian-001',
        title: 'Modern 2-Bedroom Bungalow, Kiserian',
        location: 'Kiserian',
        region: 'Kajiado',
        price: 28000,
        status: 'rent',
        beds: 2,
        baths: 1,
        description: 'Spacious modern bungalow in a quiet residential area of Kiserian. Features a master ensuite, ample parking, water and electricity included. Walking distance to Kiserian town center and matatu stage. Perfect for a small family.',
        images: [
            'house-images/Modern2-BedroomBungalow.Kiserian.jpg',
            'house-images/Modern2-BedroomBungalow.Kiserian-pic2.jpg',
            'house-images/Modern2-BedroomBungalow.Kiserian-pic3.jpg'
        ],
        phone: '254712345678',
        agent: 'Jane Wanjiru',
        listedAt: '2026-08-15'
    },
    {
        id: 'ngong-001',
        title: 'Cozy Bedsitter with Own Bathroom, Ngong',
        location: 'Ngong',
        region: 'Kajiado',
        price: 9500,
        status: 'rent',
        beds: 1,
        baths: 1,
        description: 'Affordable bedsitter in Ngong town. Tiled floors, fitted kitchenette, and a private bathroom. Reliable water supply and good security. Close to Ngong market and the railway matatu stage.',
        images: [
            'house-images/CozyBedsitterwithOwnBathroom.Ngong.jpg',
            'house-images/CozyBedsitterwithOwnBathroom.Ngong-pic2.jpg',
            'house-images/CozyBedsitterwithOwnBathroom.Ngong-pic3.jpg'
        ],
        phone: '254723456789',
        agent: 'Peter Mwangi',
        listedAt: '2026-08-20'
    },
    {
        id: 'rongai-001',
        title: 'Spacious 3-Bedroom Maisonette, Ongata Rongai',
        location: 'Rongai',
        region: 'Kajiado',
        price: 45000,
        status: 'rent',
        beds: 3,
        baths: 2,
        description: 'Beautiful 3-bedroom maisonette in Ongata Rongai with a private garden. Master bedroom is ensuite. DSQ available on request. Gated compound with 24/7 security. 10 minutes walk to Tuala stage and nearby supermarkets.',
        images: [
            'house-images/Spacious3-BedroomMaisonette.Ongata Rongai.jpg',
            'house-images/Spacious3-BedroomMaisonette.Ongata Rongai-pic2.jpg',
            'house-images/Spacious3-BedroomMaisonette.Ongata Rongai-pic3.jpg'
        ],
        phone: '254734567890',
        agent: 'Mary Akinyi',
        listedAt: '2026-08-22'
    },
    {
        id: 'matasia-001',
        title: '1-Bedroom Apartment, Matasia',
        location: 'Matasia',
        region: 'Kajiado',
        price: 15000,
        status: 'rent',
        beds: 1,
        baths: 1,
        description: 'Newly built 1-bedroom apartment in Matasia. Modern finishes, fitted kitchen cabinets, balcony with a view. Borehole water plus county supply. Easy access to Ngong-Kiserian road.',
        images: [
            'house-images/1-BedroomApartment.Matasia.jpg',
            'house-images/1-BedroomApartment.Matasia-pic2.jpg',
            'house-images/1-BedroomApartment.Matasia-pic3.jpg'
        ],
        phone: '254745678901',
        agent: 'Samuel Kiptoo',
        listedAt: '2026-08-25'
    },
    {
        id: 'birika-001',
        title: '4-Bedroom House for Sale, Birika',
        location: 'Birika',
        region: 'Kajiado',
        price: 12500000,
        status: 'sale',
        beds: 4,
        baths: 3,
        description: 'Prime 4-bedroom house on a 50x100 plot in Birika. All bedrooms ensuite, large living and dining area, modern kitchen, and a closed garage. Title deed ready. Perfect for a growing family looking to own a home in a serene environment.',
        images: [
            'house-images/4-BedroomHouseforSale.Birika.jpg',
            'house-images/4-BedroomHouseforSale.Birika-pic2.jpg',
            'house-images/4-BedroomHouseforSale.Birika-pic3.jpg'
        ],
        phone: '254756789012',
        agent: 'Grace Njeri',
        listedAt: '2026-08-28'
    },
    {
        id: 'kiserian-002',
        title: 'Single Room for Rent, Kiserian',
        location: 'Kiserian',
        region: 'Kajiado',
        price: 4500,
        status: 'rent',
        beds: 1,
        baths: 1,
        description: 'Affordable single room in Kiserian, ideal for students or young professionals. Shared bathroom and kitchen. Walking distance to Kiserian market and shopping center.',
        images: [
            'house-images/SingleRoomforRent.Kiserian.jpg'
        ],
        phone: '254767890123',
        agent: 'John Kamau',
        listedAt: '2026-08-30'
    },
    {
        id: 'ngong-002',
        title: '3-Bedroom House, Ngong Hills View',
        location: 'Ngong',
        region: 'Kajiado',
        price: 38000,
        status: 'rent',
        beds: 3,
        baths: 2,
        description: 'Beautiful house with a stunning view of the Ngong Hills. Spacious compound, ample parking, and a mature garden. Quiet neighborhood with reliable water and electricity.',
        images: [
            'house-images/3-BedroomHouse.NgongHills View.jpg',
            'house-images/3-BedroomHouse.NgongHills View-pic2.jpg',
            'house-images/3-BedroomHouse.NgongHills View-pic3.jpg'
        ],
        phone: '254778901234',
        agent: 'Esther Wambui',
        listedAt: '2026-09-01'
    },
    {
        id: 'rongai-002',
        title: 'Studio Apartment, Tuala Road Rongai',
        location: 'Rongai',
        region: 'Kajiado',
        price: 12000,
        status: 'rent',
        beds: 1,
        baths: 1,
        description: 'Modern studio apartment along Tuala Road. Open-plan kitchen and living area, private bathroom, and a small balcony. Reliable water and electricity. Close to multimedia university.',
        images: [
            'house-images/StudioApartment.TualaRoadRongai.jpg',
            'house-images/StudioApartment.TualaRoadRongai-pic2.jpg',
            'house-images/StudioApartment.TualaRoadRongai-pic3.jpg'
        ],
        phone: '254789012345',
        agent: 'David Otieno',
        listedAt: '2026-09-02'
    },
    {
        id: 'matasia-002',
        title: 'Half-Acre Plot with 2-Bedroom House, Matasia',
        location: 'Matasia',
        region: 'Kajiado',
        price: 8500000,
        status: 'sale',
        beds: 2,
        baths: 1,
        description: 'Half-acre plot in Matasia with a 2-bedroom house. Plenty of space for expansion or subdivision. Title deed available. Quiet residential area with easy road access.',
        images: [
            'house-images/Half-AcrePlotwith2-BedroomHouse.Matasia.jpg',
            'house-images/Half-AcrePlotwith2-BedroomHouse.Matasia-pic2.jpg',
            'house-images/Half-AcrePlotwith2-BedroomHouse.Matasia-pic3.jpg'
        ],
        phone: '254790123456',
        agent: 'Daniel Mutua',
        listedAt: '2026-09-03'
    },
    {
        id: 'kiserian-003',
        title: 'Luxury 4-Bedroom Villa, Kiserian',
        location: 'Kiserian',
        region: 'Kajiado',
        price: 75000,
        status: 'rent',
        beds: 4,
        baths: 4,
        description: 'Executive 4-bedroom villa in a gated community in Kiserian. All bedrooms ensuite, fitted modern kitchen, swimming pool access, and a private garden. 24-hour security with CCTV. Perfect for executive families.',
        images: [
            'house-images/Luxury4-BedroomVilla.Kiserian.jpg',
            'house-images/Luxury4-BedroomVilla.Kiserian-pic2.jpg',
            'house-images/Luxury4-BedroomVilla.Kiserian-pic3.jpg'
        ],
        phone: '254701234567',
        agent: 'Sarah Hassan',
        listedAt: '2026-09-03'
    },
    {
        id: 'birika-002',
        title: '2-Bedroom House for Rent, Birika',
        location: 'Birika',
        region: 'Kajiado',
        price: 18000,
        status: 'rent',
        beds: 2,
        baths: 1,
        description: 'Comfortable 2-bedroom house in Birika. Spacious living room, fitted kitchen, and a private bathroom. Borehole water and electricity connected. Quiet area along the main road.',
        images: [
            'house-images/2-BedroomHouseforRent.Birika.jpg',
            'house-images/2-BedroomHouseforRent.Birika-pic2.jpg',
            'house-images/2-BedroomHouseforRent.Birika-pic3.jpg'
        ],
        phone: '254712345670',
        agent: 'Faith Chebet',
        listedAt: '2026-09-04'
    },
    {
        id: 'ngong-003',
        title: '3-Bedroom Bungalow for Sale, Ngong',
        location: 'Ngong',
        region: 'Kajiado',
        price: 15500000,
        status: 'sale',
        beds: 3,
        baths: 2,
        description: 'Spacious 3-bedroom bungalow on a 40x80 plot in Ngong. Modern fittings, large windows for natural light, and a paved driveway. Title deed ready. Walking distance to Ngong town.',
        images: [
            'house-images/3-BedroomBungalowforSale.Ngong.jpg',
            'house-images/3-BedroomBungalowforSale.Ngong-pic2.jpg',
            'house-images/3-BedroomBungalowforSale.Ngong-pic3.jpg'
        ],
        phone: '254723456701',
        agent: 'James Kariuki',
        listedAt: '2026-09-04'
    }
];

// =====================================================
// ADVERTISEMENT CONFIGURATION - SLOT ADS
// Duration options: '5s' (5 sec), '10s' (10 sec), '1m' (1 min), '2m' (2 min)
// Ad slots appear every 3 houses in the grid, same size as house cards
// =====================================================
var SLOT_ADS = [
    { image: 'ad-images/ad1.jpg', url: 'https://www.pepsodent.com/bd/home.html', alt: 'MortApps Studios', duration: '5s', cta: 'Visit Website', tagline: 'Smile with Confidence' },
    { image: 'ad-images/ad2.jpg', url: 'https://yellow.co.ke/kartasi-industries-ltd-nairobi', alt: 'Advertisement', duration: '5s', cta: 'Learn More', tagline: 'Africa\'s favourite' },
    { image: 'ad-images/ad3.jpg', url: 'https://manji.co.ke/', alt: 'Advertisement', duration: '5s', cta: 'Learn More', tagline: 'Bite into happiness' }
];

// =====================================================
// LOCATIONS (used by filter chips)
// =====================================================
var LOCATIONS = ['Kiserian', 'Ngong', 'Rongai', 'Birika', 'Matasia'];

// =====================================================
// STATE
// =====================================================
var currentFilters = {
    search: '', location: '', status: '',
    priceMin: null, priceMax: null, sort: 'default'
};
var currentTab = 'browse';
var savedHouses = JSON.parse(localStorage.getItem('qejalink_saved') || '[]');
var seenHouseIds = JSON.parse(localStorage.getItem('qejalink_seen_houses') || '[]');
var currentImageIndex = 0;
var currentHouse = null;

// Ad rotation state
var adTimers = {};
var currentAdIndices = {};
var adRotationOrder = {};

// PWA install state
var deferredInstallPrompt = null;

// =====================================================
// INITIALIZATION
// =====================================================
function init() {
    // Register service worker (online-only)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(reg) {
                console.log('[QejaLink] SW registered (online-only)');
                // Check for SW updates every 5 minutes (catches updates fast)
                setInterval(function() {
                    reg.update().catch(function() {});
                }, 300000);
                // Listen for SW messages
                navigator.serviceWorker.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'SW_READY') {
                        console.log('[QejaLink] SW ready:', event.data.version);
                    }
                });
            })
            .catch(function(err) { console.warn('[QejaLink] SW registration failed:', err); });
    }

    // 3-second loading screen
    setTimeout(hideLoadingScreen, 3000);

    // Wire up UI
    bindSearch();
    bindFilters();
    bindSort();
    bindTabs();
    bindModal();
    bindNav();
    bindNotifications();

    // Initial render
    cleanSavedHouses();
    renderHouses();
    renderSavedHouses();
    updateSavedBadge();
    updateStats();

    // Init PWA install
    initPWAInstall();

    // Init reveal-on-scroll observer
    initRevealObserver();

    // Check for new houses and notify (after a small delay so loading screen finishes)
    setTimeout(checkForNewHouses, 4000);
}

function hideLoadingScreen() {
    var loading = document.getElementById('loadingScreen');
    var app = document.getElementById('app');
    if (loading) {
        loading.classList.add('fade-out');
        setTimeout(function() {
            loading.style.display = 'none';
            loading.classList.remove('fade-out');
        }, 500);
    }
    if (app) app.classList.remove('hidden');
    console.log('[QejaLink] App loaded');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// =====================================================
// NAVIGATION (sticky nav scroll effect)
// =====================================================
function bindNav() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                if (window.scrollY > 30) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// =====================================================
// REVEAL ON SCROLL
// =====================================================
function initRevealObserver() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: show everything immediately
        document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
        return;
    }
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
}

// =====================================================
// SEARCH & FILTERS
// =====================================================
function bindSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var debounceTimer = null;
    input.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            currentFilters.search = e.target.value.toLowerCase().trim();
            renderHouses();
        }, 200);
    });
}

function bindFilters() {
    var toggle = document.getElementById('filterToggle');
    var panel = document.getElementById('filtersPanel');
    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            panel.classList.toggle('hidden');
            toggle.classList.toggle('active');
            if (!panel.classList.contains('hidden')) {
                setTimeout(function() { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
            }
        });
    }

    // Location chips
    document.querySelectorAll('[data-location]').forEach(function(chip) {
        chip.addEventListener('click', function() {
            document.querySelectorAll('[data-location]').forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            currentFilters.location = chip.getAttribute('data-location');
            renderHouses();
        });
    });

    // Status chips
    document.querySelectorAll('[data-status]').forEach(function(chip) {
        chip.addEventListener('click', function() {
            document.querySelectorAll('[data-status]').forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            currentFilters.status = chip.getAttribute('data-status');
            renderHouses();
        });
    });

    // Price range
    var minInput = document.getElementById('filterPriceMin');
    var maxInput = document.getElementById('filterPriceMax');
    if (minInput) {
        minInput.addEventListener('input', function(e) {
            currentFilters.priceMin = e.target.value ? parseInt(e.target.value, 10) : null;
        });
    }
    if (maxInput) {
        maxInput.addEventListener('input', function(e) {
            currentFilters.priceMax = e.target.value ? parseInt(e.target.value, 10) : null;
        });
    }

    var applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            renderHouses();
            if (panel) panel.classList.add('hidden');
            if (toggle) toggle.classList.remove('active');
        });
    }
    var clearBtn = document.getElementById('clearFilters');
    if (clearBtn) clearBtn.addEventListener('click', resetAll);
}

function bindSort() {
    var sort = document.getElementById('sortBy');
    if (!sort) return;
    sort.addEventListener('change', function(e) {
        currentFilters.sort = e.target.value;
        renderHouses();
    });
}

function resetAll() {
    currentFilters = { search: '', location: '', status: '', priceMin: null, priceMax: null, sort: 'default' };
    var input = document.getElementById('searchInput');
    if (input) input.value = '';
    document.querySelectorAll('[data-location]').forEach(function(c) { c.classList.remove('active'); });
    document.querySelector('[data-location=""]').classList.add('active');
    document.querySelectorAll('[data-status]').forEach(function(c) { c.classList.remove('active'); });
    document.querySelector('[data-status=""]').classList.add('active');
    var min = document.getElementById('filterPriceMin');
    if (min) min.value = '';
    var max = document.getElementById('filterPriceMax');
    if (max) max.value = '';
    var sort = document.getElementById('sortBy');
    if (sort) sort.value = 'default';
    renderHouses();
}

// =====================================================
// FILTER LOGIC
// =====================================================
function filterHouses(houses) {
    var f = currentFilters;
    return houses.filter(function(h) {
        if (f.search) {
            var haystack = (h.title + ' ' + h.location + ' ' + h.region + ' ' + h.description + ' ' + h.agent).toLowerCase();
            if (haystack.indexOf(f.search) === -1) return false;
        }
        if (f.location && h.location !== f.location) return false;
        if (f.status && h.status !== f.status) return false;
        if (f.priceMin !== null && h.price < f.priceMin) return false;
        if (f.priceMax !== null && h.price > f.priceMax) return false;
        return true;
    });
}

function sortHouses(houses) {
    var sorted = houses.slice();
    switch (currentFilters.sort) {
        case 'price-asc': sorted.sort(function(a, b) { return a.price - b.price; }); break;
        case 'price-desc': sorted.sort(function(a, b) { return b.price - a.price; }); break;
        case 'location': sorted.sort(function(a, b) { return a.location.localeCompare(b.location); }); break;
        default:
            // Default: sort by listedAt desc (newest first)
            sorted.sort(function(a, b) {
                var da = a.listedAt || ''; var db = b.listedAt || '';
                return db.localeCompare(da);
            });
    }
    return sorted;
}

// =====================================================
// RENDER HOUSE GRID (with ad slots every 3 houses)
// =====================================================
function renderHouses() {
    var grid = document.getElementById('houseGrid');
    var empty = document.getElementById('emptyState');
    var count = document.getElementById('resultsCount');
    if (!grid) return;

    // Clear any existing ad timers to prevent memory leaks
    clearAdTimers();

    var filtered = sortHouses(filterHouses(HOUSES));

    if (count) {
        var total = HOUSES.length;
        var shown = filtered.length;
        if (currentFilters.search || currentFilters.location || currentFilters.status || currentFilters.priceMin !== null || currentFilters.priceMax !== null) {
            count.innerHTML = '<strong>' + shown + '</strong> of ' + total + ' houses match your search';
        } else {
            count.innerHTML = '<strong>' + total + '</strong> house' + (total !== 1 ? 's' : '') + ' available';
        }
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }
    if (empty) empty.classList.add('hidden');

    var html = '';
    filtered.forEach(function(house, idx) {
        html += renderHouseCard(house, idx);
        // Insert an ad slot AFTER EVERY 3 HOUSES (only when there are more than 3 results)
        if ((idx + 1) % 3 === 0 && filtered.length > 3) {
            html += renderAdSlot('grid_ad_' + idx);
        }
    });
    grid.innerHTML = html;

    // Wire up card clicks + save buttons
    grid.querySelectorAll('.house-card').forEach(function(card) {
        var id = card.getAttribute('data-id');
        card.addEventListener('click', function(e) {
            if (e.target.closest('.house-save-btn')) return;
            openHouseModal(id);
        });
        var saveBtn = card.querySelector('.house-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleSave(id);
            });
        }
    });

    // Initialize ad slots - each gets its own shuffled rotation
    grid.querySelectorAll('.ad-slot').forEach(function(slot, i) {
        initIndividualSlot(slot, slot.id || ('grid_ad_' + i));
    });
}

function renderHouseCard(house, idx) {
    var isSaved = savedHouses.indexOf(house.id) !== -1;
    var priceStr = formatPrice(house.price, house.status);
    var imgHtml = '';
    if (house.images && house.images.length > 0) {
        imgHtml = '<img src="' + house.images[0] + '" alt="' + escapeHtml(house.title) + '" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML=getPlaceholderHtml()">';
    } else {
        imgHtml = getPlaceholderHtml();
    }
    var statusLabel = house.status === 'rent' ? 'For Rent' : 'For Sale';
    var imageCount = house.images ? house.images.length : 0;
    var delay = (idx * 0.06).toFixed(2);

    return '' +
    '<article class="house-card" data-id="' + house.id + '" style="animation-delay:' + delay + 's">' +
        '<div class="house-card-image">' +
            imgHtml +
            '<span class="house-status-badge ' + house.status + '">' + statusLabel + '</span>' +
            '<button class="house-save-btn ' + (isSaved ? 'saved' : '') + '" aria-label="Save">' +
                '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
            '</button>' +
            (imageCount > 1 ? '<span class="house-image-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' + imageCount + '</span>' : '') +
        '</div>' +
        '<div class="house-card-body">' +
            '<div class="house-card-price">' + priceStr + '</div>' +
            '<div class="house-card-title">' + escapeHtml(house.title) + '</div>' +
            '<div class="house-card-location">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
                escapeHtml(house.location) + ', ' + escapeHtml(house.region) +
            '</div>' +
            '<div class="house-card-meta">' +
                '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M22 4v16M2 8h20M2 16h20M6 4v4M18 4v4"/></svg>' + house.beds + ' Bed' + (house.beds !== 1 ? 's' : '') + '</span>' +
                '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1 0L3 6M9 12H3M9 18H3M21 6l-2.5-2.5a1.5 1.5 0 0 0-1 0L15 6M21 12h-6M21 18h-6"/></svg>' + house.baths + ' Bath' + (house.baths !== 1 ? 's' : '') + '</span>' +
            '</div>' +
        '</div>' +
    '</article>';
}

function renderAdSlot(slotId) {
    return '' +
    '<div class="ad-slot" id="' + slotId + '">' +
        '<div class="ad-slot-image-wrap">' +
            '<div class="ad-slot-sponsored">Sponsored</div>' +
            '<div class="ad-slot-image">' +
                '<div class="ad-slot-inner"></div>' +
            '</div>' +
        '</div>' +
        '<div class="ad-slot-body">' +
            '<div class="ad-slot-tagline"></div>' +
            '<div class="ad-slot-cta">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
                '<span class="ad-slot-cta-text">Visit</span>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function getPlaceholderHtml() {
    return '<div class="house-card-image-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>';
}

function formatPrice(price, status) {
    var formatted = price.toLocaleString('en-KE');
    var currency = 'KES';
    var period = status === 'rent' ? '/mo' : '';
    return '<span class="currency">' + currency + '</span> ' + formatted + '<span class="period">' + period + '</span>';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function updateStats() {
    var statTotal = document.getElementById('statTotal');
    if (statTotal) statTotal.textContent = HOUSES.length;
}

// =====================================================
// HOUSE DETAIL MODAL
// =====================================================
function bindModal() {
    var modal = document.getElementById('houseModal');
    if (!modal) return;
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeHouseModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeHouseModal();
    });
}

function openHouseModal(id) {
    var house = HOUSES.find(function(h) { return h.id === id; });
    if (!house) return;
    currentHouse = house;
    currentImageIndex = 0;

    var modal = document.getElementById('houseModal');
    var body = document.getElementById('modalBody');
    if (!modal || !body) return;

    var priceStr = formatPrice(house.price, house.status);
    var statusLabel = house.status === 'rent' ? 'For Rent' : 'For Sale';
    var images = house.images || [];
    var imagesHtml = '';
    if (images.length > 0) {
        imagesHtml = '<img src="' + images[0] + '" alt="' + escapeHtml(house.title) + '" onerror="this.parentElement.innerHTML=getDetailPlaceholderHtml()">';
    } else {
        imagesHtml = getDetailPlaceholderHtml();
    }

    body.innerHTML = '' +
        '<div class="house-detail-images" id="detailCarousel">' +
            imagesHtml +
            (images.length > 1 ?
                '<button class="carousel-nav prev" onclick="prevImage()" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
                '<button class="carousel-nav next" onclick="nextImage()" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>' +
                '<div class="carousel-dots" id="carouselDots"></div>' +
                '<div class="carousel-counter"><span id="imgCounter">1</span> / ' + images.length + '</div>'
            : '') +
        '</div>' +
        '<div class="detail-section">' +
            '<div class="detail-status-row">' +
                '<span class="detail-status-badge ' + house.status + '">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="detail-price">' + priceStr + '</div>' +
            '<div class="detail-title">' + escapeHtml(house.title) + '</div>' +
            '<div class="detail-location">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
                escapeHtml(house.location) + ', ' + escapeHtml(house.region) + ' County' +
            '</div>' +
            '<div class="detail-meta-grid">' +
                '<div class="detail-meta-item"><div class="value">' + house.beds + '</div><div class="label">Bedrooms</div></div>' +
                '<div class="detail-meta-item"><div class="value">' + house.baths + '</div><div class="label">Bathrooms</div></div>' +
                '<div class="detail-meta-item"><div class="value">' + (house.images ? house.images.length : 0) + '</div><div class="label">Photos</div></div>' +
            '</div>' +
            '<p class="detail-description">' + escapeHtml(house.description) + '</p>' +
            '<div class="detail-agent">' +
                '<div class="detail-agent-label">Listed By</div>' +
                '<div class="detail-agent-name">' + escapeHtml(house.agent) + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="detail-contact-row">' +
            '<a href="tel:' + house.phone + '" class="contact-btn call">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
                'Call' +
            '</a>' +
            '<a href="https://wa.me/' + house.phone + '" target="_blank" rel="noopener" class="contact-btn whatsapp">' +
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.31999C16.2 4.89999 14.2 4 12 4C7.6 4 4 7.6 4 12C4 13.4 4.4 14.7 5 15.9L4 20L8.2 19C9.4 19.5 10.7 19.8 12 19.8C16.4 19.8 20 16.2 20 11.8C20 9.59999 19 7.69999 17.6 6.31999ZM12 18.4C10.8 18.4 9.7 18.1 8.7 17.6L8.5 17.5L6.2 18.1L6.8 15.9L6.7 15.7C6.2 14.7 5.9 13.6 5.9 12.4C5.9 8.79999 9 5.7 12.6 5.7C14.4 5.7 16 6.4 17.3 7.7C18.6 9 19.3 10.6 19.3 12.4C19.3 16 16 18.4 12 18.4ZM15.5 14C15.3 13.9 14.3 13.4 14.1 13.4C13.9 13.3 13.8 13.3 13.6 13.5C13.5 13.7 13 14.2 12.9 14.3C12.8 14.5 12.6 14.5 12.4 14.4C12.2 14.3 11.5 14.1 10.7 13.4C10.1 12.8 9.7 12.1 9.6 11.9C9.5 11.7 9.6 11.5 9.7 11.4C9.8 11.3 9.9 11.1 10 11C10.1 10.9 10.1 10.8 10.2 10.6C10.3 10.5 10.2 10.3 10.2 10.2C10.1 10.1 9.7 9.09999 9.5 8.69999C9.3 8.19999 9.1 8.29999 9 8.29999C8.9 8.29999 8.7 8.29999 8.6 8.29999C8.4 8.29999 8.2 8.49999 8.1 8.69999C7.9 8.89999 7.4 9.39999 7.4 10.4C7.4 11.4 8.1 12.4 8.2 12.5C8.3 12.7 9.6 14.7 11.6 15.6C13.6 16.5 13.6 16.2 14 16.2C14.4 16.2 15.3 15.7 15.5 15.2C15.7 14.7 15.7 14.2 15.6 14.2C15.6 14.1 15.5 14.1 15.5 14Z"></path></svg>' +
                'WhatsApp' +
            '</a>' +
        '</div>';

    if (images.length > 1) {
        setTimeout(function() {
            var dots = document.getElementById('carouselDots');
            if (dots) {
                dots.innerHTML = images.map(function(_, i) {
                    return '<span class="carousel-dot' + (i === 0 ? ' active' : '') + '" onclick="goToImage(' + i + ')"></span>';
                }).join('');
            }
        }, 0);
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeHouseModal() {
    var modal = document.getElementById('houseModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
    currentHouse = null;
}

function prevImage() {
    if (!currentHouse || !currentHouse.images) return;
    currentImageIndex = (currentImageIndex - 1 + currentHouse.images.length) % currentHouse.images.length;
    updateCarousel();
}

function nextImage() {
    if (!currentHouse || !currentHouse.images) return;
    currentImageIndex = (currentImageIndex + 1) % currentHouse.images.length;
    updateCarousel();
}

function goToImage(idx) {
    if (!currentHouse || !currentHouse.images) return;
    currentImageIndex = idx;
    updateCarousel();
}

function updateCarousel() {
    var carousel = document.getElementById('detailCarousel');
    var counter = document.getElementById('imgCounter');
    var dots = document.getElementById('carouselDots');
    if (!carousel || !currentHouse.images) return;
    var img = carousel.querySelector('img');
    if (img) {
        img.style.opacity = '0';
        setTimeout(function() {
            img.src = currentHouse.images[currentImageIndex];
            img.style.opacity = '1';
        }, 200);
    }
    if (counter) counter.textContent = (currentImageIndex + 1);
    if (dots) {
        dots.querySelectorAll('.carousel-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === currentImageIndex);
        });
    }
}

function getDetailPlaceholderHtml() {
    return '<div class="detail-image-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>';
}

// =====================================================
// SAVED HOUSES (cleaned of stale IDs)
// =====================================================
function cleanSavedHouses() {
    // Remove saved IDs that no longer exist in the HOUSES array
    var validIds = HOUSES.map(function(h) { return h.id; });
    var cleaned = savedHouses.filter(function(id) { return validIds.indexOf(id) !== -1; });
    if (cleaned.length !== savedHouses.length) {
        savedHouses = cleaned;
        localStorage.setItem('qejalink_saved', JSON.stringify(savedHouses));
        console.log('[QejaLink] Cleaned stale saved house IDs');
    }
}

function toggleSave(id) {
    var idx = savedHouses.indexOf(id);
    if (idx === -1) savedHouses.push(id);
    else savedHouses.splice(idx, 1);
    localStorage.setItem('qejalink_saved', JSON.stringify(savedHouses));
    renderHouses();
    renderSavedHouses();
    updateSavedBadge();
}

function updateSavedBadge() {
    var badge = document.getElementById('savedBadge');
    if (!badge) return;
    // Only count saved houses that still exist
    var validIds = HOUSES.map(function(h) { return h.id; });
    var count = savedHouses.filter(function(id) { return validIds.indexOf(id) !== -1; }).length;
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderSavedHouses() {
    var grid = document.getElementById('savedGrid');
    var empty = document.getElementById('savedEmpty');
    if (!grid) return;
    // Filter to only houses that still exist
    var validIds = HOUSES.map(function(h) { return h.id; });
    var saved = HOUSES.filter(function(h) { return savedHouses.indexOf(h.id) !== -1 && validIds.indexOf(h.id) !== -1; });
    if (saved.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }
    if (empty) empty.classList.add('hidden');
    var html = '';
    saved.forEach(function(house, idx) { html += renderHouseCard(house, idx); });
    grid.innerHTML = html;
    grid.querySelectorAll('.house-card').forEach(function(card) {
        var id = card.getAttribute('data-id');
        card.addEventListener('click', function(e) {
            if (e.target.closest('.house-save-btn')) return;
            openHouseModal(id);
        });
        var saveBtn = card.querySelector('.house-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleSave(id);
            });
        }
    });
}

// =====================================================
// TABS
// =====================================================
function bindTabs() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function() {
            switchTab(item.getAttribute('data-tab'));
        });
    });
    var params = new URLSearchParams(window.location.search);
    var tabParam = params.get('tab');
    if (tabParam && ['browse', 'saved', 'about'].indexOf(tabParam) !== -1) {
        switchTab(tabParam);
    }
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-tab') === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(function(panel) {
        panel.classList.toggle('active', panel.id === 'tab-' + tab);
    });
    if (tab === 'saved') renderSavedHouses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =====================================================
// AD SLOT ROTATION
// =====================================================
function clearAdTimers() {
    for (var slotId in adTimers) {
        clearTimeout(adTimers[slotId]);
        delete adTimers[slotId];
    }
    adRotationOrder = {};
    currentAdIndices = {};
}

function createShuffledOrder(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    for (var j = arr.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
    }
    return arr;
}

function initIndividualSlot(container, slotId) {
    if (!container || SLOT_ADS.length === 0) return;
    if (container.getAttribute('data-ad-init') === '1') return;
    container.setAttribute('data-ad-init', '1');
    adRotationOrder[slotId] = createShuffledOrder(SLOT_ADS.length);
    currentAdIndices[slotId] = 0;
    showSlotAd(container, slotId, 0);
    if (SLOT_ADS.length > 1) scheduleNextSlot(container, slotId);
}

function showSlotAd(container, slotId, positionIndex) {
    if (!container || SLOT_ADS.length === 0) return;
    var rotationOrder = adRotationOrder[slotId];
    var adIndex = rotationOrder[positionIndex % rotationOrder.length];
    var ad = SLOT_ADS[adIndex];
    var inner = container.querySelector('.ad-slot-inner');
    if (inner) {
        inner.innerHTML = '<img src="' + ad.image + '" alt="' + escapeHtml(ad.alt) + '" onerror="this.style.display=\'none\'">';
    }
    var taglineEl = container.querySelector('.ad-slot-tagline');
    if (taglineEl && ad.tagline) taglineEl.textContent = ad.tagline;
    var ctaText = container.querySelector('.ad-slot-cta-text');
    if (ctaText && ad.cta) ctaText.textContent = ad.cta;
    container.onclick = function(e) { e.stopPropagation(); window.open(ad.url, '_blank'); };
    container.style.cursor = 'pointer';
    currentAdIndices[slotId] = positionIndex;
}

function scheduleNextSlot(container, slotId) {
    var currentIdx = currentAdIndices[slotId];
    var rotationOrder = adRotationOrder[slotId];
    var adIndex = rotationOrder[currentIdx % rotationOrder.length];
    var ad = SLOT_ADS[adIndex];
    var ms = parseDuration(ad.duration);
    adTimers[slotId] = setTimeout(function() {
        var next = (currentAdIndices[slotId] + 1) % rotationOrder.length;
        showSlotAd(container, slotId, next);
        scheduleNextSlot(container, slotId);
    }, ms);
}

function parseDuration(d) {
    if (!d) return 5000;
    if (typeof d === 'number') return d;
    d = String(d).toLowerCase();
    if (d.indexOf('s') !== -1) return parseInt(d, 10) * 1000;
    if (d.indexOf('m') !== -1) return parseInt(d, 10) * 60 * 1000;
    return parseInt(d, 10) || 5000;
}

// =====================================================
// PWA INSTALL (hide button after install)
// =====================================================
function initPWAInstall() {
    var btn = document.getElementById('installBtn');

    // If already installed (running as PWA), hide button immediately
    if (isPWAInstalled()) {
        if (btn) btn.classList.add('installed');
        console.log('[QejaLink] Already installed as PWA, install button hidden');
        return;
    }

    window.addEventListener('beforeinstallprompt', function(e) {
        console.log('[QejaLink] beforeinstallprompt fired - install available');
        e.preventDefault();
        deferredInstallPrompt = e;
        if (btn) btn.classList.remove('installed');
    });

    window.addEventListener('appinstalled', function() {
        console.log('[QejaLink] App installed, hiding install button');
        deferredInstallPrompt = null;
        if (btn) btn.classList.add('installed');
    });

    if (btn) {
        btn.addEventListener('click', function() {
            console.log('[QejaLink] Install button clicked, deferredInstallPrompt available:', !!deferredInstallPrompt);
            if (deferredInstallPrompt) {
                // Trigger the native PWA install prompt immediately
                deferredInstallPrompt.prompt();
                deferredInstallPrompt.userChoice.then(function(choice) {
                    console.log('[QejaLink] Install choice:', choice.outcome);
                    deferredInstallPrompt = null;
                    if (choice.outcome === 'accepted') {
                        if (btn) btn.classList.add('installed');
                    }
                }).catch(function(err) {
                    console.error('[QejaLink] Install prompt error:', err);
                });
            } else {
                // No deferred prompt available - show brief toast (not instructions)
                showInstallToast();
            }
        });
    }
}

function showInstallToast() {
    var toast = document.getElementById('installToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'installToast';
        toast.className = 'install-toast';
        toast.innerHTML = '' +
            '<div class="install-toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>' +
            '<div class="install-toast-text"><strong>Install QejaLink:</strong> Use your browser menu and select "Install app" or "Add to Home Screen".</div>';
        document.body.appendChild(toast);
    }
    setTimeout(function() { toast.classList.add('show'); }, 50);
    setTimeout(function() { toast.classList.remove('show'); }, 5000);
}

function isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches ||
           window.navigator.standalone === true;
}

// =====================================================
// NOTIFICATIONS (new house alerts)
// =====================================================
function bindNotifications() {
    var laterBtn = document.getElementById('notifLater');
    var enableBtn = document.getElementById('notifEnable');
    var testBtn = document.getElementById('testNotifBtn');
    var aboutEnableBtn = document.getElementById('enableNotifBtn');

    if (laterBtn) {
        laterBtn.addEventListener('click', function() {
            dismissNotifPrompt();
            localStorage.setItem('qejalink_notif_dismissed_until', String(Date.now() + (7 * 24 * 60 * 60 * 1000)));
        });
    }

    if (enableBtn) {
        enableBtn.addEventListener('click', function() {
            requestNotificationPermission();
        });
    }

    if (aboutEnableBtn) {
        aboutEnableBtn.addEventListener('click', function() {
            requestNotificationPermission();
        });
    }

    if (testBtn) {
        testBtn.addEventListener('click', sendTestNotification);
    }

    // Update notification status display
    updateNotifStatus();
}

function shouldShowNotifPrompt() {
    // Don't show if already granted or denied
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return false;
    if (Notification.permission === 'denied') return false;
    // Don't show if dismissed recently
    var dismissedUntil = parseInt(localStorage.getItem('qejalink_notif_dismissed_until') || '0', 10);
    if (Date.now() < dismissedUntil) return false;
    // Don't show if user has already seen the prompt before
    if (localStorage.getItem('qejalink_notif_prompted') === '1') return false;
    return true;
}

function showNotifPrompt() {
    var prompt = document.getElementById('notifPrompt');
    if (!prompt) return;
    localStorage.setItem('qejalink_notif_prompted', '1');
    setTimeout(function() { prompt.classList.add('show'); }, 500);
    // Auto-hide after 15s if no action
    setTimeout(function() {
        if (!prompt.classList.contains('hidden') && prompt.classList.contains('show')) {
            prompt.classList.remove('show');
        }
    }, 15000);
}

function dismissNotifPrompt() {
    var prompt = document.getElementById('notifPrompt');
    if (prompt) {
        prompt.classList.remove('show');
        setTimeout(function() { prompt.classList.add('hidden'); }, 400);
    }
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('[QejaLink] Notifications not supported');
        alert('Notifications are not supported in this browser.');
        dismissNotifPrompt();
        updateNotifStatus();
        return;
    }
    Notification.requestPermission().then(function(permission) {
        console.log('[QejaLink] Notification permission:', permission);
        if (permission === 'granted') {
            // Show a welcome notification immediately so user sees it working
            showNotification(
                'QejaLink Alerts Enabled!',
                'You will now be notified when new houses are listed in your area. Tap to continue browsing.'
            );
            // Mark all current houses as seen so we only notify for FUTURE additions
            seenHouseIds = HOUSES.map(function(h) { return h.id; });
            localStorage.setItem('qejalink_seen_houses', JSON.stringify(seenHouseIds));
        }
        dismissNotifPrompt();
        updateNotifStatus();
    }).catch(function(err) {
        console.error('[QejaLink] Notification permission error:', err);
        updateNotifStatus();
    });
}

function updateNotifStatus() {
    var status = document.getElementById('notifStatus');
    if (!status) return;
    if (!('Notification' in window)) {
        status.textContent = 'Notifications are not supported in this browser.';
        status.className = 'notif-status unsupported';
        return;
    }
    if (Notification.permission === 'granted') {
        status.textContent = 'Notifications are enabled. You will receive alerts when new houses are listed.';
        status.className = 'notif-status granted';
        var enableBtn = document.getElementById('enableNotifBtn');
        if (enableBtn) enableBtn.style.display = 'none';
    } else if (Notification.permission === 'denied') {
        status.textContent = 'Notifications are blocked. Please enable them in your browser site settings.';
        status.className = 'notif-status denied';
        var enableBtn2 = document.getElementById('enableNotifBtn');
        if (enableBtn2) enableBtn2.style.display = 'none';
    } else {
        status.textContent = 'Notifications are not enabled yet. Enable them to get alerts for new listings.';
        status.className = 'notif-status default';
    }
}

function sendTestNotification() {
    if (!('Notification' in window)) {
        alert('Notifications are not supported in this browser.');
        return;
    }
    if (Notification.permission === 'granted') {
        showNotification(
            'QejaLink Test Notification',
            'Notifications are working! You will receive alerts like this when new houses are listed in your area.'
        );
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                showNotification(
                    'QejaLink Test Notification',
                    'Notifications are working! You will receive alerts like this when new houses are listed.'
                );
                seenHouseIds = HOUSES.map(function(h) { return h.id; });
                localStorage.setItem('qejalink_seen_houses', JSON.stringify(seenHouseIds));
            }
            updateNotifStatus();
        });
    } else {
        alert('Notifications are blocked. Please enable them in your browser settings: Site settings > Notifications > Allow.');
    }
}

function showNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        var notif = new Notification(title, {
            body: body,
            icon: 'image-logo/android-chrome-192x192.png',
            badge: 'image-logo/favicon-32x32.png',
            tag: 'qejalink-' + Date.now(),
            requireInteraction: false
        });
        notif.onclick = function() {
            window.focus();
            notif.close();
        };
    } catch (e) {
        console.warn('[QejaLink] Notification failed:', e);
    }
}

function checkForNewHouses() {
    // First time visiting? Don't notify, just record what exists
    if (seenHouseIds.length === 0) {
        seenHouseIds = HOUSES.map(function(h) { return h.id; });
        localStorage.setItem('qejalink_seen_houses', JSON.stringify(seenHouseIds));
        // Show notification prompt to new users
        if (shouldShowNotifPrompt()) showNotifPrompt();
        return;
    }

    // Find houses that weren't here last time
    var newHouses = HOUSES.filter(function(h) {
        return seenHouseIds.indexOf(h.id) === -1;
    });

    // Update the seen list
    seenHouseIds = HOUSES.map(function(h) { return h.id; });
    localStorage.setItem('qejalink_seen_houses', JSON.stringify(seenHouseIds));

    if (newHouses.length === 0) {
        // No new houses, but still show prompt if appropriate
        if (shouldShowNotifPrompt()) showNotifPrompt();
        return;
    }

    // We have new houses! Notify if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
        if (newHouses.length === 1) {
            var h = newHouses[0];
            showNotification('New House Listed in ' + h.location, h.title + ' - ' + formatPricePlain(h.price, h.status) + '. Tap to view.');
        } else {
            // Group multiple new houses
            var locations = [];
            newHouses.forEach(function(h) {
                if (locations.indexOf(h.location) === -1) locations.push(h.location);
            });
            showNotification(
                newHouses.length + ' New Houses Just Listed',
                'New listings in: ' + locations.join(', ') + '. Tap to browse.'
            );
        }
    } else if (shouldShowNotifPrompt()) {
        // Permission not granted yet, show the prompt
        showNotifPrompt();
    }
}

function formatPricePlain(price, status) {
    var formatted = price.toLocaleString('en-KE');
    var period = status === 'rent' ? '/mo' : '';
    return 'KES ' + formatted + period;
}

// =====================================================
// EXPOSE FOR INLINE HANDLERS
// =====================================================
window.openHouseModal = openHouseModal;
window.closeHouseModal = closeHouseModal;
window.prevImage = prevImage;
window.nextImage = nextImage;
window.goToImage = goToImage;
window.resetAll = resetAll;
window.switchTab = switchTab;
window.sendTestNotification = sendTestNotification;
window.getPlaceholderHtml = getPlaceholderHtml;
window.getDetailPlaceholderHtml = getDetailPlaceholderHtml;

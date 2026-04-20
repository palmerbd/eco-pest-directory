// ══════════════════════════════════════════════════════════════════════════════
// TIER 4 EXPANSION SCRAPER — Bay Area CA, Indiana, Utah, South Carolina,
//                             Alabama, Oklahoma, Pennsylvania Interior
//
// Target: Arthur Murray, Fred Astaire, Dance With Me + independent ballroom
// Goal:  Push directory from 2,451 → 2,800+ studios across 45+ states
//
// INSTRUCTIONS:
// 1. Open http://5.78.144.42/wp-admin/ in your browser, stay logged in
// 2. Open DevTools → Console
// 3. Paste and run Step 1 (load Maps SDK), wait for "Maps ready ✅"
// 4. Paste and run Step 2 (init service)
// 5. Paste and run Step 3 (run all searches — takes ~2-4 min, ~150 queries)
// 6. When "ALL SEARCHES COMPLETE" appears, check window._t4_collected.length
// 7. Paste and run Step 4 (import to WordPress — takes ~10-20 min)
// 8. Paste and run Step 5 (enrich descriptions)
//
// EXPECTED YIELD BY REGION:
//   Bay Area / CA (9 cities):   ~80-120 studios
//   Indiana (6 cities):         ~50-70  studios
//   Utah (7 cities):            ~40-60  studios
//   South Carolina (6 cities):  ~30-50  studios
//   Alabama (6 cities):         ~20-35  studios
//   Oklahoma (5 cities):        ~25-40  studios
//   Pennsylvania interior (8):  ~15-25  studios
//   ─────────────────────────────────────────
//   Total projected:            ~260-400 new studios
// ══════════════════════════════════════════════════════════════════════════════


// ─── STEP 1: Load Google Maps SDK ────────────────────────────────────────────
// Paste this block first. Wait for "Maps ready ✅" before running Step 2.

(function() {
  const key = 'AIzaSyCF4sF-gp29l9KiP7j0Xriezbb_S9rLdL4';
  if (window._mapsLoaded) { console.log('Maps already loaded ✅'); return; }
  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=_mapsReady`;
  window._mapsReady = () => { window._mapsLoaded = true; console.log('Maps ready ✅'); };
  document.head.appendChild(s);
})();


// ─── STEP 2: Initialize PlacesService ────────────────────────────────────────
// Run after "Maps ready ✅" appears above.

(function() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  window._map = new google.maps.Map(div, { center: { lat: 37.5, lng: -100.0 }, zoom: 4 });
  window._svc = new google.maps.places.PlacesService(window._map);
  window._t4_collected = [];
  window._t4_seen_ids  = new Set();
  console.log('PlacesService ready ✅ — Tier 4 search initialized');
  console.log('7 markets: Bay Area · Indiana · Utah · South Carolina · Alabama · Oklahoma · PA Interior');
  console.log('~150 queries queued. Estimated time: 2-4 minutes.');
})();


// ─── STEP 3: Run All Searches ─────────────────────────────────────────────────
// ~150 queries across 7 expansion markets. Takes approximately 2-4 minutes.
// Watch the counter in console. When "ALL SEARCHES COMPLETE" appears, run Step 4.

(function() {
  const queries = [

    // ══════════════════════════════════════════════════════════════════════════
    // BAY AREA / CALIFORNIA EXPANSION
    // CA has 205 studios but concentrated in SD + LA. Bay Area (7.7M) is thin.
    // ══════════════════════════════════════════════════════════════════════════

    // ── San Francisco ──────────────────────────────────────────────────────────
    'Arthur Murray dance studio San Francisco CA',
    'Fred Astaire dance studio San Francisco CA',
    'Dance With Me dance studio San Francisco CA',
    'ballroom dance studio San Francisco CA',
    'private ballroom dance lessons San Francisco CA',
    'latin dance studio San Francisco CA',
    'salsa dance studio San Francisco CA',
    'tango dance studio San Francisco CA',
    'swing dance studio San Francisco CA',
    'wedding dance lessons San Francisco CA',

    // ── San Jose ───────────────────────────────────────────────────────────────
    'Arthur Murray dance studio San Jose CA',
    'Fred Astaire dance studio San Jose CA',
    'ballroom dance studio San Jose CA',
    'private ballroom dance lessons San Jose CA',
    'latin dance studio San Jose CA',
    'salsa dance studio San Jose CA',
    'wedding dance lessons San Jose CA',

    // ── Oakland / East Bay ─────────────────────────────────────────────────────
    'Arthur Murray dance studio Oakland CA',
    'Fred Astaire dance studio Oakland CA',
    'ballroom dance studio Oakland CA',
    'salsa dance studio Oakland CA',
    'tango dance studio Oakland CA',
    'Arthur Murray dance studio Fremont CA',
    'ballroom dance studio Fremont CA',
    'Arthur Murray dance studio Hayward CA',
    'ballroom dance studio Berkeley CA',
    'private dance lessons Berkeley CA',

    // ── South Bay / Silicon Valley ─────────────────────────────────────────────
    'Arthur Murray dance studio Santa Clara CA',
    'Fred Astaire dance studio Santa Clara CA',
    'ballroom dance studio Santa Clara CA',
    'Arthur Murray dance studio Sunnyvale CA',
    'ballroom dance studio Sunnyvale CA',
    'Arthur Murray dance studio Milpitas CA',
    'ballroom dance studio San Mateo CA',
    'private dance lessons Palo Alto CA',
    'Arthur Murray dance studio Campbell CA',
    'ballroom dance studio Mountain View CA',

    // ── East Bay / Contra Costa ────────────────────────────────────────────────
    'Arthur Murray dance studio Walnut Creek CA',
    'Fred Astaire dance studio Walnut Creek CA',
    'ballroom dance studio Walnut Creek CA',
    'Arthur Murray dance studio Pleasanton CA',
    'Fred Astaire dance studio Pleasanton CA',
    'ballroom dance studio Pleasanton CA',
    'Arthur Murray dance studio Concord CA',
    'ballroom dance studio Concord CA',
    'Arthur Murray dance studio San Ramon CA',


    // ══════════════════════════════════════════════════════════════════════════
    // INDIANA  (Indianapolis is top-30 US metro; currently only 2 studios)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Indianapolis ───────────────────────────────────────────────────────────
    'Arthur Murray dance studio Indianapolis IN',
    'Fred Astaire dance studio Indianapolis IN',
    'Dance With Me dance studio Indianapolis IN',
    'ballroom dance studio Indianapolis IN',
    'private ballroom dance lessons Indianapolis IN',
    'latin dance studio Indianapolis IN',
    'salsa dance studio Indianapolis IN',
    'wedding dance lessons Indianapolis IN',
    'competition dance studio Indianapolis IN',
    'Arthur Murray dance studio Carmel IN',
    'Fred Astaire dance studio Carmel IN',
    'ballroom dance studio Carmel IN',
    'Arthur Murray dance studio Fishers IN',
    'ballroom dance studio Fishers IN',
    'Arthur Murray dance studio Greenwood IN',

    // ── Fort Wayne ─────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Fort Wayne IN',
    'Fred Astaire dance studio Fort Wayne IN',
    'ballroom dance studio Fort Wayne IN',
    'private dance lessons Fort Wayne IN',

    // ── Smaller Indiana Markets ────────────────────────────────────────────────
    'ballroom dance studio Bloomington IN',
    'ballroom dance studio South Bend IN',
    'Arthur Murray dance studio South Bend IN',
    'ballroom dance studio Evansville IN',
    'Arthur Murray dance studio Evansville IN',


    // ══════════════════════════════════════════════════════════════════════════
    // UTAH  (BYU in Provo makes this the strongest ballroom culture in the US)
    // Currently only 3 studios — massive undercount.
    // ══════════════════════════════════════════════════════════════════════════

    // ── Salt Lake City ─────────────────────────────────────────────────────────
    'Arthur Murray dance studio Salt Lake City UT',
    'Fred Astaire dance studio Salt Lake City UT',
    'Dance With Me dance studio Salt Lake City UT',
    'ballroom dance studio Salt Lake City UT',
    'private ballroom dance lessons Salt Lake City UT',
    'latin dance studio Salt Lake City UT',
    'salsa dance studio Salt Lake City UT',
    'wedding dance lessons Salt Lake City UT',
    'competition dance studio Salt Lake City UT',
    'Arthur Murray dance studio Sandy UT',
    'ballroom dance studio Sandy UT',
    'Arthur Murray dance studio West Jordan UT',
    'ballroom dance studio Murray UT',
    'ballroom dance studio Draper UT',

    // ── Provo / BYU Corridor ───────────────────────────────────────────────────
    'Arthur Murray dance studio Provo UT',
    'Fred Astaire dance studio Provo UT',
    'ballroom dance studio Provo UT',
    'competitive ballroom dance studio Provo UT',
    'private ballroom dance lessons Provo UT',
    'ballroom dance studio Orem UT',
    'dance studio Orem UT',
    'Arthur Murray dance studio Orem UT',

    // ── Northern Utah ──────────────────────────────────────────────────────────
    'Arthur Murray dance studio Ogden UT',
    'Fred Astaire dance studio Ogden UT',
    'ballroom dance studio Ogden UT',
    'ballroom dance studio Logan UT',
    'ballroom dance studio St. George UT',
    'private dance lessons St. George UT',


    // ══════════════════════════════════════════════════════════════════════════
    // SOUTH CAROLINA  (Growing Sun Belt; 4 studios is a serious undercount)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Charleston ─────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Charleston SC',
    'Fred Astaire dance studio Charleston SC',
    'Dance With Me dance studio Charleston SC',
    'ballroom dance studio Charleston SC',
    'private ballroom dance lessons Charleston SC',
    'latin dance studio Charleston SC',
    'salsa dance studio Charleston SC',
    'wedding dance lessons Charleston SC',
    'swing dance studio Charleston SC',

    // ── Columbia ───────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Columbia SC',
    'Fred Astaire dance studio Columbia SC',
    'ballroom dance studio Columbia SC',
    'private dance lessons Columbia SC',
    'latin dance studio Columbia SC',
    'wedding dance lessons Columbia SC',

    // ── Greenville / Upstate ───────────────────────────────────────────────────
    'Arthur Murray dance studio Greenville SC',
    'Fred Astaire dance studio Greenville SC',
    'ballroom dance studio Greenville SC',
    'private dance lessons Greenville SC',
    'Arthur Murray dance studio Spartanburg SC',
    'ballroom dance studio Spartanburg SC',
    'Arthur Murray dance studio Rock Hill SC',
    'ballroom dance studio Rock Hill SC',
    'ballroom dance studio Myrtle Beach SC',
    'Arthur Murray dance studio Myrtle Beach SC',
    'private dance lessons Hilton Head SC',


    // ══════════════════════════════════════════════════════════════════════════
    // ALABAMA  (Currently 0 studios — entire state uncovered)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Birmingham ─────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Birmingham AL',
    'Fred Astaire dance studio Birmingham AL',
    'Dance With Me dance studio Birmingham AL',
    'ballroom dance studio Birmingham AL',
    'private ballroom dance lessons Birmingham AL',
    'latin dance studio Birmingham AL',
    'salsa dance studio Birmingham AL',
    'wedding dance lessons Birmingham AL',
    'Arthur Murray dance studio Hoover AL',
    'ballroom dance studio Hoover AL',
    'Arthur Murray dance studio Vestavia Hills AL',

    // ── Huntsville ─────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Huntsville AL',
    'Fred Astaire dance studio Huntsville AL',
    'ballroom dance studio Huntsville AL',
    'private dance lessons Huntsville AL',
    'wedding dance lessons Huntsville AL',

    // ── Other Alabama Markets ─────────────────────────────────────────────────
    'Arthur Murray dance studio Mobile AL',
    'Fred Astaire dance studio Mobile AL',
    'ballroom dance studio Mobile AL',
    'Arthur Murray dance studio Montgomery AL',
    'ballroom dance studio Montgomery AL',
    'ballroom dance studio Auburn AL',
    'dance studio Tuscaloosa AL',


    // ══════════════════════════════════════════════════════════════════════════
    // OKLAHOMA  (Currently 0 studios — OKC and Tulsa are sizeable markets)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Oklahoma City ──────────────────────────────────────────────────────────
    'Arthur Murray dance studio Oklahoma City OK',
    'Fred Astaire dance studio Oklahoma City OK',
    'Dance With Me dance studio Oklahoma City OK',
    'ballroom dance studio Oklahoma City OK',
    'private ballroom dance lessons Oklahoma City OK',
    'latin dance studio Oklahoma City OK',
    'salsa dance studio Oklahoma City OK',
    'wedding dance lessons Oklahoma City OK',
    'swing dance studio Oklahoma City OK',
    'Arthur Murray dance studio Edmond OK',
    'ballroom dance studio Edmond OK',
    'Arthur Murray dance studio Norman OK',
    'ballroom dance studio Norman OK',

    // ── Tulsa ──────────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Tulsa OK',
    'Fred Astaire dance studio Tulsa OK',
    'ballroom dance studio Tulsa OK',
    'private dance lessons Tulsa OK',
    'latin dance studio Tulsa OK',
    'wedding dance lessons Tulsa OK',
    'Arthur Murray dance studio Broken Arrow OK',
    'ballroom dance studio Broken Arrow OK',


    // ══════════════════════════════════════════════════════════════════════════
    // PENNSYLVANIA INTERIOR  (PA has 10 studios — all in Philly/Pittsburgh)
    // Allentown (3rd largest PA city), Harrisburg, Lehigh Valley underserved
    // ══════════════════════════════════════════════════════════════════════════

    // ── Lehigh Valley (Allentown / Bethlehem) ─────────────────────────────────
    'Arthur Murray dance studio Allentown PA',
    'Fred Astaire dance studio Allentown PA',
    'ballroom dance studio Allentown PA',
    'private dance lessons Allentown PA',
    'wedding dance lessons Allentown PA',
    'Arthur Murray dance studio Bethlehem PA',
    'ballroom dance studio Bethlehem PA',
    'latin dance studio Allentown PA',

    // ── Harrisburg / Central PA ────────────────────────────────────────────────
    'Arthur Murray dance studio Harrisburg PA',
    'Fred Astaire dance studio Harrisburg PA',
    'ballroom dance studio Harrisburg PA',
    'private dance lessons Harrisburg PA',
    'ballroom dance studio York PA',
    'Arthur Murray dance studio York PA',
    'ballroom dance studio Lancaster PA',
    'Arthur Murray dance studio Lancaster PA',
    'private dance lessons Reading PA',
    'ballroom dance studio Reading PA',

    // ── NEPA (Scranton / Wilkes-Barre) ────────────────────────────────────────
    'ballroom dance studio Scranton PA',
    'Arthur Murray dance studio Scranton PA',
    'ballroom dance studio Wilkes-Barre PA',
    'ballroom dance studio State College PA',
  ];

  window._t4_search_queue = [...queries];
  window._t4_search_done  = 0;
  window._t4_search_total = queries.length;

  console.log('Queuing ' + window._t4_search_total + ' searches across 7 expansion markets...');

  function nextSearch() {
    if (window._t4_search_queue.length === 0) {
      console.log('\n✅ ALL SEARCHES COMPLETE');
      console.log('Total unique studios collected: ' + window._t4_collected.length);
      console.log('Run Step 4 to import them into WordPress.');
      window._t4_searches_done = true;
      return;
    }

    const query = window._t4_search_queue.shift();
    window._t4_search_done++;

    window._svc.textSearch({ query }, (results, status) => {
      if (status === 'OK' && results) {
        let added = 0;
        results.forEach(r => {
          if (!window._t4_seen_ids.has(r.place_id)) {
            window._t4_seen_ids.add(r.place_id);
            window._t4_collected.push(r);
            added++;
          }
        });
        console.log('[' + window._t4_search_done + '/' + window._t4_search_total + '] "' + query + '" → ' + results.length + ' results, ' + added + ' new | Total: ' + window._t4_collected.length);
      } else {
        console.warn('[' + window._t4_search_done + '/' + window._t4_search_total + '] "' + query + '" → ' + status);
      }
      setTimeout(nextSearch, 400);  // 400ms between queries to avoid rate limits
    });
  }

  nextSearch();
})();


// ─── CHECK PROGRESS (run anytime during Step 3) ───────────────────────────────
// window._t4_collected.length
// window._t4_collected.map(p => p.name + ' — ' + p.formatted_address)
// window._t4_search_done + '/' + window._t4_search_total + ' queries complete'


// ─── STEP 4: Import to WordPress ─────────────────────────────────────────────
// Run AFTER Step 3 finishes ("ALL SEARCHES COMPLETE" in console).
// Fetches full place details and creates WP posts for each unique studio.
// Automatically skips duplicates by detecting slug conflicts.

(function() {
  function detectChain(name) {
    const n = name.toLowerCase();
    if (n.includes('arthur murray'))  return 'arthur_murray';
    if (n.includes('fred astaire'))   return 'fred_astaire';
    if (n.includes('dance with me'))  return 'dance_with_me';
    return 'independent';
  }

  function inferStyles(name) {
    const n = name.toLowerCase();
    const styles = ['ballroom', 'latin', 'tango', 'waltz', 'foxtrot'];
    if (n.includes('arthur murray') || n.includes('fred astaire') || n.includes('dance with me')) {
      styles.push('swing', 'salsa');
    }
    if (n.includes('salsa'))      styles.push('salsa');
    if (n.includes('swing'))      styles.push('swing');
    if (n.includes('latin'))      styles.push('latin');
    if (n.includes('tango'))      styles.push('tango');
    if (n.includes('wedding'))    styles.push('wedding');
    if (n.includes('zydeco'))     styles.push('swing');
    return [...new Set(styles)];
  }

  function slugify(str) {
    return str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);
  }

  function parseAddr(components) {
    const get = (type) => {
      const c = (components || []).find(c => c.types.includes(type));
      return c ? c.long_name : '';
    };
    return {
      street: [get('street_number'), get('route')].filter(Boolean).join(' '),
      city:   get('locality') || get('sublocality') || get('neighborhood'),
      state:  get('administrative_area_level_1'),
      zip:    get('postal_code'),
    };
  }

  function parseHours(opening_hours) {
    const days = { mon:'', tue:'', wed:'', thu:'', fri:'', sat:'', sun:'' };
    if (!opening_hours?.weekday_text) return days;
    const dayMap = ['mon','tue','wed','thu','fri','sat','sun'];
    opening_hours.weekday_text.forEach((line, i) => {
      const parts = line.split(': ');
      days[dayMap[i]] = parts[1] || '';
    });
    return days;
  }

  function stripNulls(acf) {
    const clean = {};
    for (const [k, v] of Object.entries(acf)) {
      clean[k] = (v === null || v === undefined)
        ? (k.includes('rating') || k.includes('count') ? 0 : '')
        : v;
    }
    return clean;
  }

  function buildPost(place, addr, hours) {
    const styles = inferStyles(place.name);
    const slug   = slugify(place.name + '-' + (addr.city || addr.state || 'usa'));

    const acf = {
      studio_phone:           place.formatted_phone_number || '',
      studio_address_street:  addr.street,
      studio_address_city:    addr.city,
      studio_address_state:   addr.state,
      studio_address_zip:     addr.zip,
      studio_website:         place.website || '',
      studio_rating:          place.rating  || 0,
      studio_review_count:    place.user_ratings_total || 0,
      studio_google_maps_url: place.url || '',
      studio_dance_styles:    styles,
      studio_hours_mon:       hours.mon,
      studio_hours_tue:       hours.tue,
      studio_hours_wed:       hours.wed,
      studio_hours_thu:       hours.thu,
      studio_hours_fri:       hours.fri,
      studio_hours_sat:       hours.sat,
      studio_hours_sun:       hours.sun,
      studio_amenities:       ['private_lessons'],
    };

    return {
      title:   place.name,
      slug,
      status: 'publish',
      excerpt: `Private dance lessons in ${addr.city || addr.state}. ${styles.join(', ')}.`,
      acf:    stripNulls(acf),
    };
  }

  // ── Import loop ──────────────────────────────────────────────────────────────
  window._t4_created = 0;
  window._t4_failed  = 0;
  window._t4_skipped = 0;
  window._t4_errors  = [];
  window._t4_idx     = 0;
  window._t4_done    = false;

  const NONCE  = wpApiSettings.nonce;
  const PLACES = window._t4_collected;

  if (!PLACES || PLACES.length === 0) {
    console.error('No studios collected. Run Step 3 first and wait for "ALL SEARCHES COMPLETE".');
    return;
  }

  console.log('Starting import of ' + PLACES.length + ' studios...');
  console.log('Estimated time: ' + Math.ceil(PLACES.length * 0.55 / 60) + '–' + Math.ceil(PLACES.length * 0.75 / 60) + ' minutes.');

  const DETAIL_FIELDS = [
    'name','formatted_phone_number','website','rating','user_ratings_total',
    'url','address_components','opening_hours','types','place_id',
  ];

  function processNext() {
    if (window._t4_idx >= PLACES.length) {
      window._t4_done = true;
      console.log('\n✅ IMPORT COMPLETE');
      console.log('Created: ' + window._t4_created + ' | Failed: ' + window._t4_failed + ' | Skipped (duplicates): ' + window._t4_skipped);
      if (window._t4_errors.length > 0) {
        console.log('Errors:', window._t4_errors);
      }
      console.log('\nDirectory total is now approximately ' + (2451 + window._t4_created) + ' studios.');
      console.log('Run Step 5 to generate descriptions for new studios.');
      return;
    }

    const place = PLACES[window._t4_idx++];

    window._svc.getDetails({ placeId: place.place_id, fields: DETAIL_FIELDS }, (detail, status) => {
      if (status !== 'OK') {
        console.warn('[' + window._t4_idx + '/' + PLACES.length + '] ❌ getDetails failed: ' + place.name + ': ' + status);
        window._t4_failed++;
        window._t4_errors.push({ name: place.name, error: status });
        setTimeout(processNext, 200);
        return;
      }

      const addr  = parseAddr(detail.address_components);
      const hours = parseHours(detail.opening_hours);
      const body  = buildPost(detail, addr, hours);

      fetch('/wp-json/wp/v2/dance_studio', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
        body:    JSON.stringify(body),
      })
      .then(r => r.json())
      .then(res => {
        if (res.id) {
          window._t4_created++;
          if (window._t4_created % 25 === 0) {
            console.log('── Milestone: ' + window._t4_created + ' studios created so far ──');
          }
          console.log('[' + window._t4_idx + '/' + PLACES.length + '] ✅ ' + detail.name + ' (' + addr.city + ', ' + addr.state + ') → id ' + res.id);
        } else if (
          (res.message || '').toLowerCase().includes('slug') ||
          (res.message || '').toLowerCase().includes('exist') ||
          res.code === 'term_exists'
        ) {
          window._t4_skipped++;
          console.log('[' + window._t4_idx + '/' + PLACES.length + '] ⏭ Duplicate: ' + detail.name);
        } else {
          window._t4_failed++;
          window._t4_errors.push({ name: detail.name, error: res.message || JSON.stringify(res) });
          console.warn('[' + window._t4_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + res.message);
        }
      })
      .catch(err => {
        window._t4_failed++;
        window._t4_errors.push({ name: detail.name, error: err.message });
        console.warn('[' + window._t4_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + err.message);
      })
      .finally(() => setTimeout(processNext, 350));
    });
  }

  processNext();
})();


// ─── CHECK IMPORT PROGRESS ────────────────────────────────────────────────────
// `${window._t4_idx}/${window._t4_collected.length} — created: ${window._t4_created}, skipped: ${window._t4_skipped}, done: ${window._t4_done}`


// ─── STEP 5: Enrich Descriptions ─────────────────────────────────────────────
// Run after import completes. Generates rich descriptions for any studio whose
// excerpt still starts with "Private dance lessons in" (the import placeholder).

(async function() {
  const NONCE = wpApiSettings.nonce;
  let page = 1, allStudios = [];

  console.log('Fetching all studios for description enrichment...');
  while (true) {
    const r = await fetch(`/wp-json/wp/v2/dance_studio?per_page=100&page=${page}&_fields=id,slug,title,excerpt,acf`, {
      headers: { 'X-WP-Nonce': NONCE }
    });
    if (!r.ok) break;
    const batch = await r.json();
    if (!batch.length) break;
    allStudios = allStudios.concat(batch);
    if (batch.length < 100) break;
    page++;
  }

  const toEnrich = allStudios.filter(s => {
    const ex = (s.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();
    return ex.startsWith('Private dance lessons in') || ex === '';
  });

  console.log('Studios needing description enrichment: ' + toEnrich.length + ' of ' + allStudios.length + ' total');
  console.log('Estimated enrichment time: ~' + Math.ceil(toEnrich.length * 0.2 / 60) + ' minutes.');

  const CITY_FLAVOR = {
    'San Francisco': 'in one of the West Coast\'s most vibrant cultural cities',
    'Oakland':       'in the culturally rich East Bay',
    'San Jose':      'in the heart of Silicon Valley',
    'Berkeley':      'in the eclectic and arts-forward East Bay',
    'Indianapolis':  'in the heart of Indiana\'s capital city',
    'Salt Lake City':'in the heart of Utah, home to some of the country\'s most dedicated ballroom dancers',
    'Provo':         'near Brigham Young University, one of the nation\'s premier collegiate ballroom dance programs',
    'Charleston':    'in one of the South\'s most historic and culturally rich cities',
    'Birmingham':    'in Alabama\'s largest city',
    'Huntsville':    'in the fast-growing Rocket City',
    'Oklahoma City': 'in the heart of the Sooner State\'s capital',
    'Tulsa':         'in Tulsa, Oklahoma\'s second-largest city',
  };

  const TEMPLATES = {
    arthur_murray: (name, city, state, styles, flavor) =>
      `${name} is an Arthur Murray franchise dance studio ${flavor || 'in ' + city + ', ' + state}, offering private ballroom and Latin dance lessons for beginners through advanced students. Instruction covers ${styles.slice(0,4).join(', ')} and more through a structured curriculum with over 80 years of teaching experience behind it. Whether you are preparing for social dancing, a wedding first dance, or competitive ballroom events, the professionally trained instructors guide you at your own pace in a welcoming environment.`,

    fred_astaire: (name, city, state, styles, flavor) =>
      `${name} is a Fred Astaire Dance Studio ${flavor || 'in ' + city + ', ' + state}, providing professional instruction in ${styles.slice(0,4).join(', ')} and more. The studio serves students at every level — from absolute beginners to competitive dancers — with individualized lesson plans and a warm, encouraging atmosphere. Fred Astaire studios have been developing confident, skilled dancers for over 75 years.`,

    dance_with_me: (name, city, state, styles, flavor) =>
      `${name} is a Dance With Me franchise studio ${flavor || 'in ' + city + ', ' + state}, offering high-quality private instruction in ${styles.slice(0,4).join(', ')}. Known for combining technical rigor with a genuine love of social dancing, Dance With Me studios welcome students of all ages and experience levels in a vibrant, community-focused environment.`,

    independent: (name, city, state, styles, flavor) =>
      `${name} is a private dance studio ${flavor || 'in ' + city + ', ' + state}, offering professional instruction in ${styles.slice(0,4).join(', ')}. With personalized attention and flexible scheduling, the studio helps students build confidence and skill at every level — from complete beginners to experienced dancers looking to refine their technique. Private lessons are tailored to your goals, whether that is social dancing, a wedding first dance, or competitive performance.`,
  };

  function detectChain(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('arthur murray'))  return 'arthur_murray';
    if (n.includes('fred astaire'))   return 'fred_astaire';
    if (n.includes('dance with me'))  return 'dance_with_me';
    return 'independent';
  }

  let enriched = 0;
  for (const studio of toEnrich) {
    const acf    = studio.acf || {};
    const city   = acf.studio_address_city  || '';
    const state  = acf.studio_address_state || '';
    const styles = Array.isArray(acf.studio_dance_styles) && acf.studio_dance_styles.length
      ? acf.studio_dance_styles
      : ['ballroom', 'latin', 'tango', 'waltz'];
    const name     = (studio.title?.rendered || studio.slug).replace(/&#8217;/g, "'").replace(/&amp;/g, '&');
    const chain    = detectChain(name);
    const template = TEMPLATES[chain] || TEMPLATES.independent;
    const flavor   = CITY_FLAVOR[city] || null;

    const description = template(name, city, state, styles, flavor);

    const res = await fetch(`/wp-json/wp/v2/dance_studio/${studio.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
      body:    JSON.stringify({ excerpt: description }),
    }).then(r => r.json());

    if (res.id) {
      enriched++;
      if (enriched % 25 === 0) {
        console.log('Enriched ' + enriched + '/' + toEnrich.length + ' descriptions...');
      }
    } else {
      console.warn('Failed to enrich: ' + name + ' — ' + (res.message || JSON.stringify(res)));
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n✅ DESCRIPTION ENRICHMENT COMPLETE — ' + enriched + '/' + toEnrich.length + ' updated');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Run the tagline generator to fill studio_tagline for all new studios');
  console.log('   (paste the _genTagline + _runTaglines script from prior session)');
  console.log('2. Trigger ISR revalidation by saving any studio post, or wait ~30 min');
  console.log('3. Check ballroomdancedirectory.com/studios — new state/city filters should appear');
  console.log('4. Update docs/coverage-analysis.html with new totals');
})();

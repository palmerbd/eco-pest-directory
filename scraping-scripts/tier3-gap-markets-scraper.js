// ══════════════════════════════════════════════════════════════════════════════
// TIER 3 GAP MARKETS SCRAPER — Florida, Virginia/DC, Ohio, Michigan,
//                               North Carolina, Missouri, Louisiana
//
// Target: Arthur Murray, Fred Astaire, Dance With Me + independent ballroom
// Goal:  Fill geographic gaps identified in coverage analysis.
//        Projected yield: 600–900 new studios → 1,750–2,050 total
//
// INSTRUCTIONS:
// 1. Open http://5.78.144.42/wp-admin/ in your browser, stay logged in
// 2. Open DevTools → Console
// 3. Paste and run Step 1 (load Maps SDK), wait for "Maps ready ✅"
// 4. Paste and run Step 2 (init service)
// 5. Paste and run Step 3 (run all searches — takes ~8-12 min, 200+ queries)
// 6. When "ALL SEARCHES COMPLETE" appears, check window._t3_collected.length
// 7. Paste and run Step 4 (import to WordPress — takes ~15-25 min)
// 8. Paste and run Step 5 (enrich descriptions)
//
// EXPECTED YIELD BY REGION:
//   Florida (11 cities):     ~180-250 studios
//   Virginia / DC (9 areas): ~100-150 studios
//   Ohio (6 cities):         ~80-120 studios
//   Michigan (6 cities):     ~70-110 studios
//   North Carolina (7 cities):~80-120 studios
//   Missouri (2 cities):     ~50-80  studios
//   Louisiana (2 cities):    ~40-70  studios
//   ─────────────────────────────────────────
//   Total projected:         ~600-900 new studios
// ══════════════════════════════════════════════════════════════════════════════


// ─── STEP 1: Load Google Maps SDK ────────────────────────────────────────────
// Paste this block first. The API key is pre-filled from .env.local.
// Wait for "Maps ready ✅" before running Step 2.

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
// Center set to Tennessee — geographically central to all 7 target regions.

(function() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  window._map = new google.maps.Map(div, { center: { lat: 36.17, lng: -86.78 }, zoom: 5 });
  window._svc = new google.maps.places.PlacesService(window._map);
  window._t3_collected = [];
  window._t3_seen_ids  = new Set();
  console.log('PlacesService ready ✅ — Tier 3 search initialized (FL + VA/DC + OH + MI + NC + MO + LA)');
  console.log('About to run 200+ queries across 7 gap regions. Estimated time: 8-12 minutes.');
})();


// ─── STEP 3: Run All Searches ─────────────────────────────────────────────────
// ~210 queries covering 7 gap regions. Takes approximately 8-12 minutes.
// Watch the counter in console. When "ALL SEARCHES COMPLETE" appears, run Step 4.

(function() {
  const queries = [

    // ══════════════════════════════════════════════════════════════════════════
    // FLORIDA  (largest gap: 24 studios vs. ~250 expected for state this size)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Tampa / St. Petersburg / Clearwater ──────────────────────────────────
    'Arthur Murray dance studio Tampa FL',
    'Fred Astaire dance studio Tampa FL',
    'Dance With Me dance studio Tampa FL',
    'ballroom dance studio Tampa FL',
    'private ballroom dance lessons Tampa FL',
    'latin dance studio Tampa FL',
    'salsa dance studio Tampa FL',
    'tango dance studio Tampa FL',
    'wedding dance lessons Tampa FL',
    'swing dance studio Tampa FL',

    'Arthur Murray dance studio St. Petersburg FL',
    'Fred Astaire dance studio St. Petersburg FL',
    'ballroom dance studio St. Petersburg FL',
    'private dance lessons St. Petersburg FL',

    'Arthur Murray dance studio Clearwater FL',
    'Fred Astaire dance studio Clearwater FL',
    'ballroom dance studio Clearwater FL',
    'Arthur Murray dance studio Brandon FL',
    'Arthur Murray dance studio Wesley Chapel FL',
    'Arthur Murray dance studio Sarasota FL',
    'Fred Astaire dance studio Sarasota FL',
    'ballroom dance studio Sarasota FL',
    'private dance lessons Sarasota FL',

    // ── Orlando / Central Florida ─────────────────────────────────────────────
    'Arthur Murray dance studio Orlando FL',
    'Fred Astaire dance studio Orlando FL',
    'Dance With Me dance studio Orlando FL',
    'ballroom dance studio Orlando FL',
    'private ballroom dance lessons Orlando FL',
    'latin dance studio Orlando FL',
    'salsa dance studio Orlando FL',
    'tango dance studio Orlando FL',
    'wedding dance lessons Orlando FL',
    'swing dance studio Orlando FL',

    'Arthur Murray dance studio Kissimmee FL',
    'Fred Astaire dance studio Kissimmee FL',
    'ballroom dance studio Kissimmee FL',
    'Arthur Murray dance studio Lake Mary FL',
    'Arthur Murray dance studio Altamonte Springs FL',
    'Arthur Murray dance studio Winter Park FL',
    'Fred Astaire dance studio Winter Park FL',
    'private dance lessons Winter Park FL',

    // ── Miami / Fort Lauderdale / Palm Beach ──────────────────────────────────
    'Arthur Murray dance studio Fort Lauderdale FL',
    'Fred Astaire dance studio Fort Lauderdale FL',
    'ballroom dance studio Fort Lauderdale FL',
    'latin dance studio Fort Lauderdale FL',
    'salsa dance studio Fort Lauderdale FL',
    'private dance lessons Fort Lauderdale FL',

    'Arthur Murray dance studio Boca Raton FL',
    'Fred Astaire dance studio Boca Raton FL',
    'ballroom dance studio Boca Raton FL',
    'Arthur Murray dance studio West Palm Beach FL',
    'Fred Astaire dance studio West Palm Beach FL',
    'ballroom dance studio West Palm Beach FL',
    'private dance lessons West Palm Beach FL',
    'Arthur Murray dance studio Delray Beach FL',
    'Arthur Murray dance studio Pembroke Pines FL',
    'Fred Astaire dance studio Pembroke Pines FL',
    'Arthur Murray dance studio Hollywood FL',
    'ballroom dance studio Hollywood FL',

    // ── Jacksonville / Northeast Florida ──────────────────────────────────────
    'Arthur Murray dance studio Jacksonville FL',
    'Fred Astaire dance studio Jacksonville FL',
    'ballroom dance studio Jacksonville FL',
    'private dance lessons Jacksonville FL',
    'latin dance studio Jacksonville FL',
    'Arthur Murray dance studio Jacksonville Beach FL',
    'Arthur Murray dance studio Fleming Island FL',

    // ── Panhandle + North Florida ──────────────────────────────────────────────
    'Arthur Murray dance studio Tallahassee FL',
    'Fred Astaire dance studio Tallahassee FL',
    'ballroom dance studio Tallahassee FL',
    'Arthur Murray dance studio Pensacola FL',
    'ballroom dance studio Pensacola FL',
    'Arthur Murray dance studio Gainesville FL',
    'ballroom dance studio Gainesville FL',
    'Arthur Murray dance studio Ocala FL',
    'Arthur Murray dance studio Daytona Beach FL',
    'ballroom dance studio Daytona Beach FL',
    'Arthur Murray dance studio Melbourne FL',
    'ballroom dance studio Melbourne FL',
    'Arthur Murray dance studio Cape Coral FL',
    'Fred Astaire dance studio Cape Coral FL',
    'ballroom dance studio Cape Coral FL',
    'Arthur Murray dance studio Naples FL',
    'Fred Astaire dance studio Naples FL',
    'ballroom dance studio Naples FL',


    // ══════════════════════════════════════════════════════════════════════════
    // VIRGINIA / WASHINGTON DC  (major political/cultural corridor, underserved)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Washington DC Metro ────────────────────────────────────────────────────
    'Arthur Murray dance studio Washington DC',
    'Fred Astaire dance studio Washington DC',
    'Dance With Me dance studio Washington DC',
    'ballroom dance studio Washington DC',
    'private ballroom dance lessons Washington DC',
    'latin dance studio Washington DC',
    'salsa dance studio Washington DC',
    'tango dance studio Washington DC',
    'wedding dance lessons Washington DC',

    'Arthur Murray dance studio Arlington VA',
    'Fred Astaire dance studio Arlington VA',
    'ballroom dance studio Arlington VA',
    'private dance lessons Arlington VA',

    'Arthur Murray dance studio Alexandria VA',
    'Fred Astaire dance studio Alexandria VA',
    'ballroom dance studio Alexandria VA',

    'Arthur Murray dance studio Tysons Corner VA',
    'Fred Astaire dance studio Tysons VA',
    'ballroom dance studio Tysons VA',
    'Arthur Murray dance studio Fairfax VA',
    'Fred Astaire dance studio Fairfax VA',
    'ballroom dance studio Fairfax VA',
    'Arthur Murray dance studio Reston VA',
    'Arthur Murray dance studio Herndon VA',
    'Arthur Murray dance studio McLean VA',
    'ballroom dance studio McLean VA',

    // ── Richmond ───────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Richmond VA',
    'Fred Astaire dance studio Richmond VA',
    'ballroom dance studio Richmond VA',
    'private dance lessons Richmond VA',
    'latin dance studio Richmond VA',
    'Arthur Murray dance studio Midlothian VA',
    'Arthur Murray dance studio Chesterfield VA',

    // ── Hampton Roads / Virginia Beach / Norfolk ───────────────────────────────
    'Arthur Murray dance studio Virginia Beach VA',
    'Fred Astaire dance studio Virginia Beach VA',
    'ballroom dance studio Virginia Beach VA',
    'Arthur Murray dance studio Norfolk VA',
    'Fred Astaire dance studio Norfolk VA',
    'ballroom dance studio Norfolk VA',
    'private dance lessons Norfolk VA',
    'Arthur Murray dance studio Chesapeake VA',
    'Arthur Murray dance studio Newport News VA',
    'ballroom dance studio Newport News VA',


    // ══════════════════════════════════════════════════════════════════════════
    // OHIO  (Midwest's most populous state, only 6% of directory currently)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Columbus ───────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Columbus OH',
    'Fred Astaire dance studio Columbus OH',
    'Dance With Me dance studio Columbus OH',
    'ballroom dance studio Columbus OH',
    'private ballroom dance lessons Columbus OH',
    'latin dance studio Columbus OH',
    'wedding dance lessons Columbus OH',
    'Arthur Murray dance studio Dublin OH',
    'Arthur Murray dance studio Westerville OH',
    'Arthur Murray dance studio Worthington OH',

    // ── Cleveland ──────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Cleveland OH',
    'Fred Astaire dance studio Cleveland OH',
    'ballroom dance studio Cleveland OH',
    'private dance lessons Cleveland OH',
    'Arthur Murray dance studio Beachwood OH',
    'Arthur Murray dance studio Strongsville OH',
    'Arthur Murray dance studio Westlake OH',
    'ballroom dance studio Strongsville OH',

    // ── Cincinnati ─────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Cincinnati OH',
    'Fred Astaire dance studio Cincinnati OH',
    'ballroom dance studio Cincinnati OH',
    'private dance lessons Cincinnati OH',
    'latin dance studio Cincinnati OH',
    'Arthur Murray dance studio Mason OH',
    'Arthur Murray dance studio Blue Ash OH',

    // ── Akron / Dayton / Toledo ────────────────────────────────────────────────
    'Arthur Murray dance studio Akron OH',
    'Fred Astaire dance studio Akron OH',
    'ballroom dance studio Akron OH',
    'Arthur Murray dance studio Dayton OH',
    'Fred Astaire dance studio Dayton OH',
    'ballroom dance studio Dayton OH',
    'Arthur Murray dance studio Toledo OH',
    'ballroom dance studio Toledo OH',


    // ══════════════════════════════════════════════════════════════════════════
    // MICHIGAN  (Great Lakes region, minimal representation currently)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Detroit Metro ──────────────────────────────────────────────────────────
    'Arthur Murray dance studio Detroit MI',
    'Fred Astaire dance studio Detroit MI',
    'ballroom dance studio Detroit MI',
    'private dance lessons Detroit MI',
    'latin dance studio Detroit MI',

    'Arthur Murray dance studio Ann Arbor MI',
    'Fred Astaire dance studio Ann Arbor MI',
    'ballroom dance studio Ann Arbor MI',
    'private dance lessons Ann Arbor MI',

    'Arthur Murray dance studio Dearborn MI',
    'Fred Astaire dance studio Dearborn MI',
    'Arthur Murray dance studio Livonia MI',
    'Arthur Murray dance studio Sterling Heights MI',
    'ballroom dance studio Sterling Heights MI',
    'Arthur Murray dance studio Troy MI',
    'Fred Astaire dance studio Troy MI',
    'ballroom dance studio Troy MI',
    'Arthur Murray dance studio Novi MI',
    'Arthur Murray dance studio Farmington Hills MI',
    'Arthur Murray dance studio Southfield MI',
    'ballroom dance studio Southfield MI',

    // ── Grand Rapids ───────────────────────────────────────────────────────────
    'Arthur Murray dance studio Grand Rapids MI',
    'Fred Astaire dance studio Grand Rapids MI',
    'ballroom dance studio Grand Rapids MI',
    'private dance lessons Grand Rapids MI',

    // ── Lansing / Flint ────────────────────────────────────────────────────────
    'Arthur Murray dance studio Lansing MI',
    'ballroom dance studio Lansing MI',
    'Arthur Murray dance studio Flint MI',


    // ══════════════════════════════════════════════════════════════════════════
    // NORTH CAROLINA  (fast-growing Sun Belt state, underrepresented)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Raleigh / Durham / Research Triangle ───────────────────────────────────
    'Arthur Murray dance studio Raleigh NC',
    'Fred Astaire dance studio Raleigh NC',
    'Dance With Me dance studio Raleigh NC',
    'ballroom dance studio Raleigh NC',
    'private ballroom dance lessons Raleigh NC',
    'latin dance studio Raleigh NC',
    'wedding dance lessons Raleigh NC',

    'Arthur Murray dance studio Durham NC',
    'Fred Astaire dance studio Durham NC',
    'ballroom dance studio Durham NC',
    'private dance lessons Durham NC',

    'Arthur Murray dance studio Chapel Hill NC',
    'ballroom dance studio Chapel Hill NC',
    'Arthur Murray dance studio Cary NC',
    'Fred Astaire dance studio Cary NC',
    'ballroom dance studio Cary NC',
    'Arthur Murray dance studio Morrisville NC',

    // ── Charlotte ──────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Charlotte NC',
    'Fred Astaire dance studio Charlotte NC',
    'Dance With Me dance studio Charlotte NC',
    'ballroom dance studio Charlotte NC',
    'private dance lessons Charlotte NC',
    'latin dance studio Charlotte NC',
    'salsa dance studio Charlotte NC',
    'Arthur Murray dance studio Concord NC',
    'Arthur Murray dance studio Huntersville NC',
    'Arthur Murray dance studio Matthews NC',
    'Arthur Murray dance studio Ballantyne NC',

    // ── Greensboro / Winston-Salem ─────────────────────────────────────────────
    'Arthur Murray dance studio Greensboro NC',
    'Fred Astaire dance studio Greensboro NC',
    'ballroom dance studio Greensboro NC',
    'Arthur Murray dance studio Winston-Salem NC',
    'Fred Astaire dance studio Winston-Salem NC',
    'ballroom dance studio Winston-Salem NC',
    'Arthur Murray dance studio High Point NC',

    // ── Wilmington / Asheville ─────────────────────────────────────────────────
    'Arthur Murray dance studio Wilmington NC',
    'ballroom dance studio Wilmington NC',
    'Arthur Murray dance studio Asheville NC',
    'ballroom dance studio Asheville NC',
    'private dance lessons Asheville NC',


    // ══════════════════════════════════════════════════════════════════════════
    // MISSOURI  (Kansas City + St. Louis — both underserved)
    // ══════════════════════════════════════════════════════════════════════════

    // ── Kansas City ────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Kansas City MO',
    'Fred Astaire dance studio Kansas City MO',
    'Dance With Me dance studio Kansas City MO',
    'ballroom dance studio Kansas City MO',
    'private ballroom dance lessons Kansas City MO',
    'latin dance studio Kansas City MO',
    'salsa dance studio Kansas City MO',
    'wedding dance lessons Kansas City MO',
    'Arthur Murray dance studio Overland Park KS',  // KC metro extends into KS
    'Fred Astaire dance studio Overland Park KS',
    'ballroom dance studio Overland Park KS',
    'Arthur Murray dance studio Lenexa KS',
    'Arthur Murray dance studio Olathe KS',
    'ballroom dance studio Lee\'s Summit MO',
    'Arthur Murray dance studio Lee\'s Summit MO',

    // ── St. Louis ──────────────────────────────────────────────────────────────
    'Arthur Murray dance studio St. Louis MO',
    'Fred Astaire dance studio St. Louis MO',
    'Dance With Me dance studio St. Louis MO',
    'ballroom dance studio St. Louis MO',
    'private ballroom dance lessons St. Louis MO',
    'latin dance studio St. Louis MO',
    'wedding dance lessons St. Louis MO',
    'Arthur Murray dance studio Chesterfield MO',
    'Fred Astaire dance studio Chesterfield MO',
    'ballroom dance studio Chesterfield MO',
    'Arthur Murray dance studio Ballwin MO',
    'Arthur Murray dance studio O\'Fallon MO',
    'ballroom dance studio Clayton MO',


    // ══════════════════════════════════════════════════════════════════════════
    // LOUISIANA  (New Orleans + Baton Rouge — culturally rich, underserved)
    // ══════════════════════════════════════════════════════════════════════════

    // ── New Orleans ────────────────────────────────────────────────────────────
    'Arthur Murray dance studio New Orleans LA',
    'Fred Astaire dance studio New Orleans LA',
    'Dance With Me dance studio New Orleans LA',
    'ballroom dance studio New Orleans LA',
    'private ballroom dance lessons New Orleans LA',
    'latin dance studio New Orleans LA',
    'salsa dance studio New Orleans LA',
    'tango dance studio New Orleans LA',
    'swing dance studio New Orleans LA',
    'zydeco dance lessons New Orleans LA',
    'wedding dance lessons New Orleans LA',
    'Arthur Murray dance studio Metairie LA',
    'Fred Astaire dance studio Metairie LA',
    'ballroom dance studio Metairie LA',
    'private dance lessons Slidell LA',

    // ── Baton Rouge ────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Baton Rouge LA',
    'Fred Astaire dance studio Baton Rouge LA',
    'ballroom dance studio Baton Rouge LA',
    'private dance lessons Baton Rouge LA',
    'latin dance studio Baton Rouge LA',
    'Arthur Murray dance studio Shreveport LA',
    'ballroom dance studio Shreveport LA',
    'Arthur Murray dance studio Lafayette LA',
    'ballroom dance studio Lafayette LA',
  ];

  window._t3_search_queue = [...queries];
  window._t3_search_done  = 0;
  window._t3_search_total = queries.length;

  console.log('Queuing ' + window._t3_search_total + ' searches across 7 gap regions...');

  function nextSearch() {
    if (window._t3_search_queue.length === 0) {
      console.log('\n✅ ALL SEARCHES COMPLETE');
      console.log('Total unique studios collected: ' + window._t3_collected.length);
      console.log('Run Step 4 to import them into WordPress.');
      window._t3_searches_done = true;
      return;
    }

    const query = window._t3_search_queue.shift();
    window._t3_search_done++;

    window._svc.textSearch({ query }, (results, status) => {
      if (status === 'OK' && results) {
        let added = 0;
        results.forEach(r => {
          if (!window._t3_seen_ids.has(r.place_id)) {
            window._t3_seen_ids.add(r.place_id);
            window._t3_collected.push(r);
            added++;
          }
        });
        console.log('[' + window._t3_search_done + '/' + window._t3_search_total + '] "' + query + '" → ' + results.length + ' results, ' + added + ' new | Total: ' + window._t3_collected.length);
      } else {
        console.warn('[' + window._t3_search_done + '/' + window._t3_search_total + '] "' + query + '" → ' + status);
      }
      setTimeout(nextSearch, 400);  // 400ms between queries to avoid rate limits
    });
  }

  nextSearch();
})();


// ─── CHECK PROGRESS (run anytime during Step 3) ───────────────────────────────
// window._t3_collected.length
// window._t3_collected.map(p => p.name + ' — ' + p.formatted_address)
// window._t3_search_done + '/' + window._t3_search_total + ' queries complete'


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
      styles.push('swing', 'cha_cha', 'rumba', 'viennese_waltz');
    }
    if (n.includes('salsa'))           styles.push('salsa');
    if (n.includes('swing'))           styles.push('swing');
    if (n.includes('latin'))           styles.push('latin');
    if (n.includes('tango'))           styles.push('tango');
    if (n.includes('wedding'))         styles.push('wedding');
    if (n.includes('zydeco'))          styles.push('swing');  // closest match
    if (n.includes('hip') || n.includes('hip-hop')) styles.push('hip_hop');
    if (n.includes('contemporary'))    styles.push('contemporary');
    if (n.includes('jazz'))            styles.push('jazz');
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
  window._t3_created = 0;
  window._t3_failed  = 0;
  window._t3_skipped = 0;
  window._t3_errors  = [];
  window._t3_idx     = 0;
  window._t3_done    = false;

  const NONCE  = wpApiSettings.nonce;
  const PLACES = window._t3_collected;

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
    if (window._t3_idx >= PLACES.length) {
      window._t3_done = true;
      console.log('\n✅ IMPORT COMPLETE');
      console.log('Created: ' + window._t3_created + ' | Failed: ' + window._t3_failed + ' | Skipped (duplicates): ' + window._t3_skipped);
      if (window._t3_errors.length > 0) {
        console.log('Errors:', window._t3_errors);
      }
      console.log('\nDirectory total is now approximately ' + (1139 + window._t3_created) + ' studios.');
      console.log('Run Step 5 to generate descriptions for new studios.');
      return;
    }

    const place = PLACES[window._t3_idx++];

    window._svc.getDetails({ placeId: place.place_id, fields: DETAIL_FIELDS }, (detail, status) => {
      if (status !== 'OK') {
        console.warn('[' + window._t3_idx + '/' + PLACES.length + '] ❌ getDetails failed: ' + place.name + ': ' + status);
        window._t3_failed++;
        window._t3_errors.push({ name: place.name, error: status });
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
          window._t3_created++;
          if (window._t3_created % 25 === 0) {
            console.log('── Milestone: ' + window._t3_created + ' studios created so far ──');
          }
          console.log('[' + window._t3_idx + '/' + PLACES.length + '] ✅ ' + detail.name + ' (' + addr.city + ', ' + addr.state + ') → id ' + res.id);
        } else if (
          (res.message || '').toLowerCase().includes('slug') ||
          (res.message || '').toLowerCase().includes('exist') ||
          res.code === 'term_exists'
        ) {
          window._t3_skipped++;
          console.log('[' + window._t3_idx + '/' + PLACES.length + '] ⏭ Duplicate: ' + detail.name);
        } else {
          window._t3_failed++;
          window._t3_errors.push({ name: detail.name, error: res.message || JSON.stringify(res) });
          console.warn('[' + window._t3_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + res.message);
        }
      })
      .catch(err => {
        window._t3_failed++;
        window._t3_errors.push({ name: detail.name, error: err.message });
        console.warn('[' + window._t3_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + err.message);
      })
      .finally(() => setTimeout(processNext, 350));
    });
  }

  processNext();
})();


// ─── CHECK IMPORT PROGRESS ────────────────────────────────────────────────────
// `${window._t3_idx}/${window._t3_collected.length} — created: ${window._t3_created}, skipped: ${window._t3_skipped}, done: ${window._t3_done}`


// ─── STEP 5: Enrich Descriptions ─────────────────────────────────────────────
// Run after import completes. Generates rich, original descriptions for any
// studio whose excerpt still starts with "Private dance lessons in" (the
// placeholder set during import). Skips studios that already have real content.

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

  // Region-specific description templates (beyond standard chain templates)
  const CITY_FLAVOR = {
    'New Orleans':    'in the heart of one of America\'s great music and dance cities',
    'Washington':     'in the nation\'s capital',
    'Miami':          'in South Florida\'s vibrant Latin dance scene',
    'Nashville':      'in Music City',
    'Charlotte':      'in the heart of the New South',
  };

  const TEMPLATES = {
    arthur_murray: (name, city, state, styles) =>
      `${name} is an Arthur Murray franchise dance studio in ${city}, ${state}, offering private ballroom and Latin dance lessons for beginners through advanced students. Instruction covers ${styles.slice(0,4).join(', ')} and more through a structured curriculum with over 80 years of teaching experience behind it. Whether you are preparing for social dancing, a wedding first dance, or competitive ballroom events, the professionally trained instructors guide you at your own pace in a welcoming environment.`,

    fred_astaire: (name, city, state, styles) =>
      `${name} is a Fred Astaire Dance Studio in ${city}, ${state}, providing professional instruction in ${styles.slice(0,4).join(', ')} and more. The studio serves students at every level — from absolute beginners to competitive dancers — with individualized lesson plans and a warm, encouraging atmosphere. Fred Astaire studios have been developing confident, skilled dancers for over 75 years.`,

    dance_with_me: (name, city, state, styles) =>
      `${name} is a Dance With Me franchise studio in ${city}, ${state}, offering high-quality private instruction in ${styles.slice(0,4).join(', ')}. Known for combining technical rigor with a genuine love of social dancing, Dance With Me studios welcome students of all ages and experience levels in a vibrant, community-focused environment.`,

    independent: (name, city, state, styles) =>
      `${name} is a private dance studio in ${city}, ${state}, offering professional instruction in ${styles.slice(0,4).join(', ')}. With personalized attention and flexible scheduling, the studio helps students build confidence and skill at every level — from complete beginners to experienced dancers looking to refine their technique. Private lessons are tailored to your goals, whether that is social dancing, a wedding first dance, or competitive performance.`,
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

    const description = template(name, city, state, styles);

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
  console.log('1. Go to WP Admin → Dance Studios and spot-check new entries in FL, VA/DC, OH, MI, NC, MO, LA');
  console.log('2. Run the tagline generator (from prior session) to fill studio_tagline for new studios');
  console.log('3. Trigger ISR revalidation by saving any studio post, or wait ~30 min for cache refresh');
  console.log('4. Check ballroomdancedirectory.com/studios — new studios should appear in state/city filters');
  console.log('5. Update docs/coverage-analysis.html to reflect new totals');
})();

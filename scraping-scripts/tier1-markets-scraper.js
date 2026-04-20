// ══════════════════════════════════════════════════════════════════════════════
// TIER 1 EXPANSION SCRAPER
// Target: Arthur Murray, Fred Astaire, Dance With Me + independent ballroom
// Markets: Las Vegas NV | Phoenix AZ | Scottsdale AZ | Minneapolis MN |
//          Nashville TN | Boston MA
//
// INSTRUCTIONS:
// 1. Open http://5.78.144.42/wp-admin/ in your browser, stay logged in
// 2. Open DevTools → Console
// 3. Paste and run Step 1 (load Maps SDK), wait for "Maps ready ✅"
// 4. Paste and run Step 2 (init service)
// 5. Paste and run Step 3 (run all searches — takes ~4-6 min)
// 6. Check window._t1_collected.length — should be 120-200+ results
// 7. Paste and run Step 4 (import to WordPress)
// 8. Paste and run Step 5 (enrich descriptions)
//
// ESTIMATED RESULTS: 150-250 new unique studios
// ESTIMATED API COST: ~$3-5 (well within $200/month free tier)
// ══════════════════════════════════════════════════════════════════════════════


// ─── STEP 1: Load Google Maps SDK ────────────────────────────────────────────
// Paste this block first. Replace YOUR_API_KEY with your actual key.
// Wait for "Maps ready ✅" before running Step 2.

(function() {
  const key = 'YOUR_API_KEY'; // ← paste your GCP API key here
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
  window._map = new google.maps.Map(div, { center: { lat: 36.17, lng: -115.14 }, zoom: 5 });
  window._svc = new google.maps.places.PlacesService(window._map);
  window._t1_collected = [];
  window._t1_seen_ids  = new Set();
  console.log('PlacesService ready ✅ — Tier 1 search initialized');
})();


// ─── STEP 3: Run All Tier 1 Market Searches ───────────────────────────────────
// ~70 queries covering 6 metros. Takes approximately 4-6 minutes.
// Watch console for progress. When "ALL SEARCHES COMPLETE" appears, run Step 4.

(function() {
  const queries = [

    // ── LAS VEGAS, NV ─────────────────────────────────────────────────────────
    'Arthur Murray dance studio Las Vegas NV',
    'Fred Astaire dance studio Las Vegas NV',
    'Dance With Me dance studio Las Vegas NV',
    'Arthur Murray dance studio Henderson NV',
    'Fred Astaire dance studio Henderson NV',
    'Arthur Murray dance studio Summerlin Las Vegas',
    'Fred Astaire dance studio North Las Vegas NV',
    'ballroom dance studio Las Vegas NV',
    'ballroom dance studio Henderson NV',
    'private ballroom dance lessons Las Vegas NV',
    'latin dance studio Las Vegas NV',
    'competitive ballroom dance studio Las Vegas',

    // ── PHOENIX, AZ ───────────────────────────────────────────────────────────
    'Arthur Murray dance studio Phoenix AZ',
    'Fred Astaire dance studio Phoenix AZ',
    'Dance With Me dance studio Phoenix AZ',
    'Arthur Murray dance studio Tempe AZ',
    'Fred Astaire dance studio Tempe AZ',
    'Arthur Murray dance studio Chandler AZ',
    'Fred Astaire dance studio Chandler AZ',
    'Arthur Murray dance studio Mesa AZ',
    'Fred Astaire dance studio Mesa AZ',
    'Arthur Murray dance studio Glendale AZ',
    'Arthur Murray dance studio Gilbert AZ',
    'ballroom dance studio Phoenix AZ',
    'ballroom dance studio Tempe AZ',
    'private ballroom dance lessons Phoenix AZ',
    'latin dance studio Phoenix AZ',

    // ── SCOTTSDALE, AZ ────────────────────────────────────────────────────────
    'Arthur Murray dance studio Scottsdale AZ',
    'Fred Astaire dance studio Scottsdale AZ',
    'Dance With Me dance studio Scottsdale AZ',
    'Arthur Murray dance studio Paradise Valley AZ',
    'ballroom dance studio Scottsdale AZ',
    'private ballroom dance lessons Scottsdale AZ',
    'latin dance studio Scottsdale AZ',
    'competitive ballroom dance Scottsdale AZ',

    // ── MINNEAPOLIS, MN ───────────────────────────────────────────────────────
    'Arthur Murray dance studio Minneapolis MN',
    'Fred Astaire dance studio Minneapolis MN',
    'Dance With Me dance studio Minneapolis MN',
    'Arthur Murray dance studio St Paul MN',
    'Fred Astaire dance studio St Paul MN',
    'Arthur Murray dance studio Edina MN',
    'Fred Astaire dance studio Bloomington MN',
    'Arthur Murray dance studio Plymouth MN',
    'Arthur Murray dance studio Eden Prairie MN',
    'ballroom dance studio Minneapolis MN',
    'ballroom dance studio St Paul MN',
    'private ballroom dance lessons Minneapolis MN',
    'latin dance studio Minneapolis MN',
    'swing dance studio Minneapolis MN',

    // ── NASHVILLE, TN ─────────────────────────────────────────────────────────
    'Arthur Murray dance studio Nashville TN',
    'Fred Astaire dance studio Nashville TN',
    'Dance With Me dance studio Nashville TN',
    'Arthur Murray dance studio Brentwood TN',
    'Fred Astaire dance studio Brentwood TN',
    'Arthur Murray dance studio Franklin TN',
    'Fred Astaire dance studio Murfreesboro TN',
    'Arthur Murray dance studio Murfreesboro TN',
    'ballroom dance studio Nashville TN',
    'private ballroom dance lessons Nashville TN',
    'latin dance studio Nashville TN',
    'wedding dance lessons Nashville TN',

    // ── BOSTON, MA ────────────────────────────────────────────────────────────
    'Arthur Murray dance studio Boston MA',
    'Fred Astaire dance studio Boston MA',
    'Dance With Me dance studio Boston MA',
    'Arthur Murray dance studio Cambridge MA',
    'Fred Astaire dance studio Cambridge MA',
    'Arthur Murray dance studio Newton MA',
    'Fred Astaire dance studio Newton MA',
    'Arthur Murray dance studio Brookline MA',
    'Arthur Murray dance studio Woburn MA',
    'Fred Astaire dance studio Wellesley MA',
    'Arthur Murray dance studio Natick MA',
    'ballroom dance studio Boston MA',
    'ballroom dance studio Cambridge MA',
    'private ballroom dance lessons Boston MA',
    'latin dance studio Boston MA',
    'competitive ballroom dance Boston MA',
  ];

  window._t1_search_queue = [...queries];
  window._t1_search_done  = 0;
  window._t1_search_total = queries.length;

  function nextSearch() {
    if (window._t1_search_queue.length === 0) {
      console.log('\n✅ ALL SEARCHES COMPLETE');
      console.log('Total unique studios collected: ' + window._t1_collected.length);
      console.log('Run Step 4 to import them into WordPress.');
      window._t1_searches_done = true;
      return;
    }

    const query = window._t1_search_queue.shift();
    window._t1_search_done++;

    window._svc.textSearch({ query }, (results, status) => {
      if (status === 'OK' && results) {
        let added = 0;
        results.forEach(r => {
          if (!window._t1_seen_ids.has(r.place_id)) {
            window._t1_seen_ids.add(r.place_id);
            window._t1_collected.push(r);
            added++;
          }
        });
        console.log('[' + window._t1_search_done + '/' + window._t1_search_total + '] "' + query + '" → ' + results.length + ' results, ' + added + ' new | Total: ' + window._t1_collected.length);
      } else {
        console.warn('[' + window._t1_search_done + '/' + window._t1_search_total + '] "' + query + '" → ' + status);
      }
      setTimeout(nextSearch, 400);
    });
  }

  nextSearch();
})();


// ─── CHECK PROGRESS (run anytime during Step 3) ───────────────────────────────
// window._t1_collected.length
// window._t1_collected.map(p => p.name)


// ─── STEP 4: Import to WordPress ─────────────────────────────────────────────
// Run AFTER Step 3 finishes ("ALL SEARCHES COMPLETE" in console).
// Fetches full details and creates WP posts for each unique studio.

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
      styles.push('swing');
      styles.push('wedding');
      styles.push('competitive');
    }
    if (n.includes('salsa'))   styles.push('salsa');
    if (n.includes('swing'))   styles.push('swing');
    if (n.includes('latin'))   styles.push('latin');
    if (n.includes('tango'))   styles.push('tango');
    if (n.includes('wedding')) styles.push('wedding');
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
    const chain  = detectChain(place.name);
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
      // studio_chain is NOT a registered WP REST ACF field — omit to avoid "Invalid parameter(s): acf"
      // Chain can be inferred from studio name (arthur murray / fred astaire / dance with me)
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
  window._t1_created = 0;
  window._t1_failed  = 0;
  window._t1_skipped = 0;
  window._t1_errors  = [];
  window._t1_idx     = 0;
  window._t1_done    = false;

  const NONCE  = wpApiSettings.nonce;
  const PLACES = window._t1_collected;

  if (!PLACES || PLACES.length === 0) {
    console.error('No studios collected. Run Step 3 first and wait for "ALL SEARCHES COMPLETE".');
    return;
  }

  console.log('Starting import of ' + PLACES.length + ' studios...');

  const DETAIL_FIELDS = [
    'name','formatted_phone_number','website','rating','user_ratings_total',
    'url','address_components','opening_hours','types','place_id',
  ];

  function processNext() {
    if (window._t1_idx >= PLACES.length) {
      window._t1_done = true;
      console.log('\n✅ IMPORT COMPLETE');
      console.log('Created: ' + window._t1_created + ' | Failed: ' + window._t1_failed + ' | Skipped: ' + window._t1_skipped);
      if (window._t1_errors.length > 0) console.log('Errors:', window._t1_errors);
      console.log('Run Step 5 to generate descriptions for new studios.');
      return;
    }

    const place = PLACES[window._t1_idx++];

    window._svc.getDetails({ placeId: place.place_id, fields: DETAIL_FIELDS }, (detail, status) => {
      if (status !== 'OK') {
        console.warn('[' + window._t1_idx + '/' + PLACES.length + '] ❌ getDetails failed: ' + place.name + ': ' + status);
        window._t1_failed++;
        window._t1_errors.push({ name: place.name, error: status });
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
          window._t1_created++;
          console.log('[' + window._t1_idx + '/' + PLACES.length + '] ✅ ' + detail.name + ' (' + addr.city + ', ' + addr.state + ') → id ' + res.id);
        } else if ((res.message || '').toLowerCase().includes('slug') || res.code === 'term_exists') {
          window._t1_skipped++;
          console.log('[' + window._t1_idx + '/' + PLACES.length + '] ⏭ Duplicate: ' + detail.name);
        } else {
          window._t1_failed++;
          window._t1_errors.push({ name: detail.name, error: res.message || JSON.stringify(res) });
          console.warn('[' + window._t1_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + res.message);
        }
      })
      .catch(err => {
        window._t1_failed++;
        window._t1_errors.push({ name: detail.name, error: err.message });
        console.warn('[' + window._t1_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + err.message);
      })
      .finally(() => setTimeout(processNext, 350));
    });
  }

  processNext();
})();


// ─── CHECK IMPORT PROGRESS ────────────────────────────────────────────────────
// `${window._t1_idx}/${window._t1_collected.length} — created: ${window._t1_created}, skipped: ${window._t1_skipped}, done: ${window._t1_done}`


// ─── STEP 5: Enrich Descriptions ─────────────────────────────────────────────
// Run after import completes. Generates original descriptions for studios
// that still have placeholder excerpts.

(async function() {
  const NONCE = wpApiSettings.nonce;
  let page = 1, allStudios = [];

  // Fetch all studios with placeholder excerpts
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

  // Filter to only studios with auto-generated placeholder excerpts
  const toEnrich = allStudios.filter(s => {
    const ex = (s.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();
    return ex.startsWith('Private dance lessons in') || ex === '';
  });

  console.log('Studios needing description enrichment: ' + toEnrich.length + ' of ' + allStudios.length);

  const TEMPLATES = {
    arthur_murray: (name, city, state, styles) =>
      `${name} is an Arthur Murray franchise dance studio in ${city}, ${state}, offering private ballroom and Latin dance lessons for beginners through advanced students. Instruction covers ${styles.join(', ')} in a structured curriculum developed over decades of teaching. Whether you are preparing for social dancing, a wedding, or competitive events, the professionally trained instructors guide you at your own pace.`,
    fred_astaire: (name, city, state, styles) =>
      `${name} is a Fred Astaire Dance Studio in ${city}, ${state}, providing professional instruction in ${styles.join(', ')} and more. The studio serves students at all levels — from first-timers to competitive dancers — with personalized lesson plans and a supportive environment that has defined the Fred Astaire brand for over 75 years.`,
    dance_with_me: (name, city, state, styles) =>
      `${name} is a Dance With Me franchise studio in ${city}, ${state}, offering high-quality private instruction in ${styles.join(', ')}. Known for a vibrant social dance culture, Dance With Me studios combine technical training with a genuine love of partner dance, welcoming students of all ages and experience levels.`,
    independent: (name, city, state, styles) =>
      `${name} is a private dance studio in ${city}, ${state}, offering professional instruction in ${styles.join(', ')}. With personalized attention and flexible scheduling, the studio helps students build confidence and skill at every level — from complete beginners to experienced dancers refining their technique.`,
  };

  let enriched = 0;
  for (const studio of toEnrich) {
    const acf    = studio.acf || {};
    const city   = acf.studio_address_city  || '';
    const state  = acf.studio_address_state || '';
    const chain  = acf.studio_chain || 'independent';
    const styles = Array.isArray(acf.studio_dance_styles) ? acf.studio_dance_styles : ['ballroom', 'latin'];
    const name   = studio.title?.rendered || studio.slug;

    const template = TEMPLATES[chain] || TEMPLATES.independent;
    const description = template(name, city, state, styles);

    const res = await fetch(`/wp-json/wp/v2/dance_studio/${studio.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
      body:    JSON.stringify({ excerpt: description }),
    }).then(r => r.json());

    if (res.id) {
      enriched++;
      if (enriched % 10 === 0) console.log('Enriched ' + enriched + '/' + toEnrich.length + ' descriptions...');
    } else {
      console.warn('Failed to enrich: ' + name + ' — ' + (res.message || JSON.stringify(res)));
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n✅ DESCRIPTION ENRICHMENT COMPLETE — ' + enriched + '/' + toEnrich.length + ' updated');
})();

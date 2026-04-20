// ══════════════════════════════════════════════════════════════════════════════
// TIER 2 MARKETS SCRAPER — San Diego + Portland
// Target: Arthur Murray, Fred Astaire, Dance With Me + independent ballroom
// Goal: Push directory toward 1,000+ total studios for SEO authority
//
// INSTRUCTIONS:
// 1. Open http://5.78.144.42/wp-admin/ in your browser, stay logged in
// 2. Open DevTools → Console
// 3. Paste and run Step 1 (load Maps SDK), wait for "Maps ready ✅"
// 4. Paste and run Step 2 (init service)
// 5. Paste and run Step 3 (run all searches — takes ~2-3 min)
// 6. Check window._t2_collected.length — should be 50-100+ results
// 7. Paste and run Step 4 (import to WordPress)
// 8. Paste and run Step 5 (enrich descriptions)
//
// EXPECTED YIELD:
//   San Diego:  ~40-60 studios (large metro, strong dance scene)
//   Portland:   ~20-35 studios (smaller metro but active scene)
//   Total:      ~60-95 new studios → pushes past 1,000 in directory
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
  window._map = new google.maps.Map(div, { center: { lat: 32.72, lng: -117.15 }, zoom: 6 });
  window._svc = new google.maps.places.PlacesService(window._map);
  window._t2_collected = [];
  window._t2_seen_ids  = new Set();
  console.log('PlacesService ready ✅ — Tier 2 search initialized (San Diego + Portland)');
})();


// ─── STEP 3: Run All Searches ─────────────────────────────────────────────────
// ~40 queries covering both metros + suburbs. Takes approximately 2-3 minutes.
// Watch console for progress. When "ALL SEARCHES COMPLETE" appears, run Step 4.

(function() {
  const queries = [

    // ── SAN DIEGO ─────────────────────────────────────────────────────────────
    // Franchise sweeps
    'Arthur Murray dance studio San Diego CA',
    'Fred Astaire dance studio San Diego CA',
    'Dance With Me dance studio San Diego CA',

    // San Diego neighborhoods + suburbs (spread out metro)
    'Arthur Murray dance studio Chula Vista CA',
    'Arthur Murray dance studio El Cajon CA',
    'Arthur Murray dance studio Escondido CA',
    'Arthur Murray dance studio Carlsbad CA',
    'Arthur Murray dance studio Oceanside CA',
    'Arthur Murray dance studio La Mesa CA',
    'Arthur Murray dance studio Santee CA',
    'Arthur Murray dance studio Poway CA',
    'Fred Astaire dance studio Chula Vista CA',
    'Fred Astaire dance studio Escondido CA',
    'Fred Astaire dance studio Carlsbad CA',
    'Fred Astaire dance studio El Cajon CA',

    // Independent / general ballroom
    'ballroom dance studio San Diego CA',
    'ballroom dance studio Chula Vista CA',
    'private ballroom dance lessons San Diego CA',
    'latin dance studio San Diego CA',
    'salsa dance studio San Diego CA',
    'tango dance studio San Diego CA',
    'swing dance studio San Diego CA',
    'wedding dance lessons San Diego CA',
    'ballroom dance studio Carlsbad CA',
    'ballroom dance studio Encinitas CA',
    'private dance lessons Del Mar CA',

    // ── PORTLAND ──────────────────────────────────────────────────────────────
    // Franchise sweeps
    'Arthur Murray dance studio Portland OR',
    'Fred Astaire dance studio Portland OR',
    'Dance With Me dance studio Portland OR',

    // Portland suburbs (metro spans both sides of river + suburbs)
    'Arthur Murray dance studio Beaverton OR',
    'Arthur Murray dance studio Hillsboro OR',
    'Arthur Murray dance studio Gresham OR',
    'Arthur Murray dance studio Lake Oswego OR',
    'Arthur Murray dance studio Tigard OR',
    'Fred Astaire dance studio Beaverton OR',
    'Fred Astaire dance studio Hillsboro OR',
    'Fred Astaire dance studio Vancouver WA',  // Portland metro extends into SW Washington
    'Arthur Murray dance studio Vancouver WA',

    // Independent / general ballroom
    'ballroom dance studio Portland OR',
    'private ballroom dance lessons Portland OR',
    'latin dance studio Portland OR',
    'salsa dance studio Portland OR',
    'tango dance studio Portland OR',
    'swing dance studio Portland OR',
    'wedding dance lessons Portland OR',
    'ballroom dance studio Beaverton OR',
    'ballroom dance studio Lake Oswego OR',
    'ballroom dance studio Vancouver WA',
  ];

  window._t2_search_queue = [...queries];
  window._t2_search_done  = 0;
  window._t2_search_total = queries.length;

  function nextSearch() {
    if (window._t2_search_queue.length === 0) {
      console.log('\n✅ ALL SEARCHES COMPLETE');
      console.log('Total unique studios collected: ' + window._t2_collected.length);
      console.log('Run Step 4 to import them into WordPress.');
      window._t2_searches_done = true;
      return;
    }

    const query = window._t2_search_queue.shift();
    window._t2_search_done++;

    window._svc.textSearch({ query }, (results, status) => {
      if (status === 'OK' && results) {
        let added = 0;
        results.forEach(r => {
          if (!window._t2_seen_ids.has(r.place_id)) {
            window._t2_seen_ids.add(r.place_id);
            window._t2_collected.push(r);
            added++;
          }
        });
        console.log('[' + window._t2_search_done + '/' + window._t2_search_total + '] "' + query + '" → ' + results.length + ' results, ' + added + ' new | Total: ' + window._t2_collected.length);
      } else {
        console.warn('[' + window._t2_search_done + '/' + window._t2_search_total + '] "' + query + '" → ' + status);
      }
      setTimeout(nextSearch, 400);
    });
  }

  nextSearch();
})();


// ─── CHECK PROGRESS (run anytime during Step 3) ───────────────────────────────
// window._t2_collected.length
// window._t2_collected.map(p => p.name)


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
      // studio_chain is NOT a registered WP REST ACF field — inferred from name
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
  window._t2_created = 0;
  window._t2_failed  = 0;
  window._t2_skipped = 0;
  window._t2_errors  = [];
  window._t2_idx     = 0;
  window._t2_done    = false;

  const NONCE  = wpApiSettings.nonce;
  const PLACES = window._t2_collected;

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
    if (window._t2_idx >= PLACES.length) {
      window._t2_done = true;
      console.log('\n✅ IMPORT COMPLETE');
      console.log('Created: ' + window._t2_created + ' | Failed: ' + window._t2_failed + ' | Skipped (duplicates): ' + window._t2_skipped);
      if (window._t2_errors.length > 0) console.log('Errors:', window._t2_errors);
      console.log('\nRun Step 5 to generate descriptions for new studios.');
      console.log('After enrichment, trigger ISR revalidation or wait for cache refresh.');
      return;
    }

    const place = PLACES[window._t2_idx++];

    window._svc.getDetails({ placeId: place.place_id, fields: DETAIL_FIELDS }, (detail, status) => {
      if (status !== 'OK') {
        console.warn('[' + window._t2_idx + '/' + PLACES.length + '] ❌ getDetails failed: ' + place.name + ': ' + status);
        window._t2_failed++;
        window._t2_errors.push({ name: place.name, error: status });
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
          window._t2_created++;
          console.log('[' + window._t2_idx + '/' + PLACES.length + '] ✅ ' + detail.name + ' (' + addr.city + ', ' + addr.state + ') → id ' + res.id);
        } else if ((res.message || '').toLowerCase().includes('slug') || res.code === 'term_exists') {
          window._t2_skipped++;
          console.log('[' + window._t2_idx + '/' + PLACES.length + '] ⏭ Duplicate: ' + detail.name);
        } else {
          window._t2_failed++;
          window._t2_errors.push({ name: detail.name, error: res.message || JSON.stringify(res) });
          console.warn('[' + window._t2_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + res.message);
        }
      })
      .catch(err => {
        window._t2_failed++;
        window._t2_errors.push({ name: detail.name, error: err.message });
        console.warn('[' + window._t2_idx + '/' + PLACES.length + '] ❌ ' + detail.name + ': ' + err.message);
      })
      .finally(() => setTimeout(processNext, 350));
    });
  }

  processNext();
})();


// ─── CHECK IMPORT PROGRESS ────────────────────────────────────────────────────
// `${window._t2_idx}/${window._t2_collected.length} — created: ${window._t2_created}, skipped: ${window._t2_skipped}, done: ${window._t2_done}`


// ─── STEP 5: Enrich Descriptions ─────────────────────────────────────────────
// Run after import completes. Generates original descriptions for studios
// that still have placeholder excerpts (starts with "Private dance lessons in").

(async function() {
  const NONCE = wpApiSettings.nonce;
  let page = 1, allStudios = [];

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

    const template    = TEMPLATES[chain] || TEMPLATES.independent;
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
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Go to WP Admin → Dance Studios and verify new San Diego + Portland entries look correct');
  console.log('2. Trigger ISR revalidation by saving any studio post (or wait for 30-min cache expiry)');
  console.log('3. Check ballroomdancedirectory.com/studios — new studios should appear in San Diego + Portland city filters');
})();

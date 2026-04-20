// ══════════════════════════════════════════════════════════════════════════════
// TEXAS FRANCHISE STUDIO SCRAPER
// Target: Arthur Murray, Fred Astaire, Dance With Me — All Texas locations
// Run from: WP Admin browser console at http://5.78.144.42/wp-admin/
// Note: Dallas and Houston already scraped (March 2026). This adds the rest.
//
// INSTRUCTIONS:
// 1. Open http://5.78.144.42/wp-admin/ in your browser, stay logged in
// 2. Open DevTools → Console
// 3. Paste and run Step 1 (load Maps SDK), wait for "Maps ready"
// 4. Paste and run Step 2 (init service)
// 5. Paste and run Step 3 (run all searches — takes ~5 min)
// 6. Check window._texas_collected.length — should be 30-80+ results
// 7. Paste and run Step 4 (import to WordPress)
// ══════════════════════════════════════════════════════════════════════════════


// ─── STEP 1: Load Google Maps SDK ────────────────────────────────────────────
// Paste this block first. Replace YOUR_API_KEY with your actual key.
// Wait for "Maps ready ✅" before running Step 2.

(function() {
  const key = 'YOUR_API_KEY'; // ← paste your GCP API key here
  if (window._mapsLoaded) { console.log('Maps already loaded'); return; }
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
  window._map = new google.maps.Map(div, { center: { lat: 30.27, lng: -97.74 }, zoom: 6 });
  window._svc = new google.maps.places.PlacesService(window._map);
  window._texas_collected = [];
  window._texas_seen_ids  = new Set();
  console.log('PlacesService ready ✅ — Texas search initialized');
})();


// ─── STEP 3: Run All Texas Franchise Searches ─────────────────────────────────
// This runs ~45 sequential textSearch queries across all Texas metros.
// Each query returns up to 20 results. Takes approximately 3-5 minutes.
// Watch the console for progress. When "ALL SEARCHES COMPLETE" appears, run Step 4.

(function() {
  const queries = [
    // Statewide franchise sweeps (cast the widest net first)
    'Arthur Murray dance studio Texas',
    'Fred Astaire dance studio Texas',
    'Dance With Me dance studio Texas',

    // Austin / Central Texas
    'Arthur Murray dance studio Austin TX',
    'Fred Astaire dance studio Austin TX',
    'Dance With Me studio Austin TX',
    'Arthur Murray dance studio Round Rock TX',
    'ballroom dance studio Austin TX',

    // San Antonio
    'Arthur Murray dance studio San Antonio TX',
    'Fred Astaire dance studio San Antonio TX',
    'ballroom dance studio San Antonio TX',

    // Fort Worth / Arlington (DFW west side — supplements existing Dallas data)
    'Arthur Murray dance studio Fort Worth TX',
    'Fred Astaire dance studio Fort Worth TX',
    'Arthur Murray dance studio Arlington TX',
    'ballroom dance studio Fort Worth TX',

    // El Paso
    'Arthur Murray dance studio El Paso TX',
    'Fred Astaire dance studio El Paso TX',
    'ballroom dance studio El Paso TX',

    // Corpus Christi
    'Arthur Murray dance studio Corpus Christi TX',
    'Fred Astaire dance studio Corpus Christi TX',
    'ballroom dance lessons Corpus Christi TX',

    // Lubbock
    'Arthur Murray dance studio Lubbock TX',
    'Fred Astaire dance studio Lubbock TX',
    'ballroom dance studio Lubbock TX',

    // Amarillo
    'Arthur Murray dance studio Amarillo TX',
    'Fred Astaire dance studio Amarillo TX',
    'ballroom dance studio Amarillo TX',

    // Rio Grande Valley (McAllen / Brownsville / Harlingen)
    'Arthur Murray dance studio McAllen TX',
    'Fred Astaire dance studio McAllen TX',
    'ballroom dance studio McAllen TX',
    'ballroom dance studio Brownsville TX',

    // Midland / Odessa (Permian Basin)
    'Arthur Murray dance studio Midland TX',
    'Fred Astaire dance studio Midland TX',
    'ballroom dance studio Midland TX',
    'ballroom dance studio Odessa TX',

    // Waco
    'Arthur Murray dance studio Waco TX',
    'Fred Astaire dance studio Waco TX',
    'ballroom dance lessons Waco TX',

    // Tyler / East Texas
    'Arthur Murray dance studio Tyler TX',
    'ballroom dance studio Tyler TX',

    // Abilene
    'Arthur Murray dance studio Abilene TX',
    'ballroom dance studio Abilene TX',

    // Beaumont / Southeast Texas
    'Arthur Murray dance studio Beaumont TX',
    'ballroom dance studio Beaumont TX',

    // Killeen / Temple / Waco corridor
    'Arthur Murray dance studio Killeen TX',
    'Arthur Murray dance studio Temple TX',

    // College Station / Bryan
    'ballroom dance studio College Station TX',
    'Arthur Murray dance studio College Station TX',

    // Wichita Falls / North Texas
    'Arthur Murray dance studio Wichita Falls TX',
    'ballroom dance studio Wichita Falls TX',
  ];

  window._search_queue = [...queries];
  window._search_done  = 0;
  window._search_total = queries.length;

  function nextSearch() {
    if (window._search_queue.length === 0) {
      console.log(`\n✅ ALL SEARCHES COMPLETE`);
      console.log(`Total unique studios collected: ${window._texas_collected.length}`);
      console.log(`Run Step 4 to import them into WordPress.`);
      return;
    }

    const query = window._search_queue.shift();
    window._search_done++;

    window._svc.textSearch({ query }, (results, status) => {
      if (status === 'OK' && results) {
        let added = 0;
        results.forEach(r => {
          if (!window._texas_seen_ids.has(r.place_id)) {
            window._texas_seen_ids.add(r.place_id);
            window._texas_collected.push(r);
            added++;
          }
        });
        console.log(`[${window._search_done}/${window._search_total}] "${query}" → ${results.length} results, ${added} new | Total: ${window._texas_collected.length}`);
      } else {
        console.warn(`[${window._search_done}/${window._search_total}] "${query}" → ${status}`);
      }
      setTimeout(nextSearch, 400); // 400ms between queries to avoid rate limiting
    });
  }

  nextSearch();
})();


// ─── CHECK PROGRESS (run anytime during Step 3) ───────────────────────────────
// window._texas_collected.length
// window._texas_collected.map(p => p.name)  // see all collected studio names


// ─── STEP 4: Import to WordPress ─────────────────────────────────────────────
// Run AFTER Step 3 finishes ("ALL SEARCHES COMPLETE" in console).
// This fetches full details for each studio and creates WP posts.
// Expected runtime: ~45-90 seconds for 60-80 studios.

(function() {
  // ── Helper: detect franchise chain from name ────────────────────────────────
  function detectChain(name) {
    const n = name.toLowerCase();
    if (n.includes('arthur murray'))      return 'arthur_murray';
    if (n.includes('fred astaire'))       return 'fred_astaire';
    if (n.includes('dance with me'))      return 'dance_with_me';
    return 'independent';
  }

  // ── Helper: infer dance styles ───────────────────────────────────────────────
  function inferStyles(name) {
    const n = name.toLowerCase();
    const styles = ['ballroom', 'latin', 'tango', 'waltz', 'foxtrot'];
    if (n.includes('arthur murray') || n.includes('fred astaire') || n.includes('dance with me')) {
      styles.push('wedding');
      styles.push('competitive'); // ACF key is 'competitive' not 'competition'
    }
    if (n.includes('salsa')) styles.push('salsa');
    if (n.includes('swing')) styles.push('swing');
    return [...new Set(styles)];
  }

  // ── Helper: build slug ───────────────────────────────────────────────────────
  function slugify(str) {
    return str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);
  }

  // ── Helper: parse address components ────────────────────────────────────────
  function parseAddr(components) {
    const get = (type) => {
      const c = (components || []).find(c => c.types.includes(type));
      return c ? c.long_name : '';
    };
    const num    = get('street_number');
    const street = get('route');
    return {
      street: num && street ? `${num} ${street}` : (street || ''),
      city:   get('locality') || get('sublocality') || get('neighborhood'),
      state:  get('administrative_area_level_1'),
      zip:    get('postal_code'),
    };
  }

  // ── Helper: parse opening hours ─────────────────────────────────────────────
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

  // ── Helper: clean nulls for ACF ─────────────────────────────────────────────
  function stripNulls(acf) {
    const clean = {};
    for (const [k, v] of Object.entries(acf)) {
      if (v === null || v === undefined) {
        clean[k] = (k.includes('rating') || k.includes('count')) ? 0 : '';
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  // ── Build WP post body ────────────────────────────────────────────────────────
  function buildPost(place, addr, hours) {
    const chain  = detectChain(place.name);
    const styles = inferStyles(place.name);
    const slug   = slugify(place.name + '-' + (addr.city || 'texas'));

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
      excerpt: `Private dance lessons in ${addr.city || 'Texas'}. ${styles.join(', ')}.`,
      acf:    stripNulls(acf),
    };
  }

  // ── Import loop ────────────────────────────────────────────────────────────────
  window._tx_created = 0;
  window._tx_failed  = 0;
  window._tx_skipped = 0;
  window._tx_errors  = [];
  window._tx_idx     = 0;
  window._tx_done    = false;

  const NONCE  = wpApiSettings.nonce;
  const PLACES = window._texas_collected;

  if (!PLACES || PLACES.length === 0) {
    console.error('No studios collected. Run Step 3 first and wait for "ALL SEARCHES COMPLETE".');
    return;
  }

  console.log(`Starting import of ${PLACES.length} studios...`);

  const DETAIL_FIELDS = [
    'name','formatted_phone_number','website','rating','user_ratings_total',
    'url','address_components','opening_hours','types','place_id',
  ];

  function processNext() {
    if (window._tx_idx >= PLACES.length) {
      window._tx_done = true;
      console.log(`\n✅ IMPORT COMPLETE`);
      console.log(`Created: ${window._tx_created} | Failed: ${window._tx_failed} | Skipped: ${window._tx_skipped}`);
      if (window._tx_errors.length > 0) {
        console.log('Errors:', window._tx_errors);
      }
      console.log('Now run the description enrichment script to generate descriptions for the new studios.');
      return;
    }

    const place = PLACES[window._tx_idx++];

    window._svc.getDetails({ placeId: place.place_id, fields: DETAIL_FIELDS }, (detail, status) => {
      if (status !== 'OK') {
        console.warn(`[${window._tx_idx}/${PLACES.length}] ❌ getDetails failed for ${place.name}: ${status}`);
        window._tx_failed++;
        window._tx_errors.push({ name: place.name, error: status });
        setTimeout(processNext, 200);
        return;
      }

      const addr  = parseAddr(detail.address_components);
      const hours = parseHours(detail.opening_hours);
      const body  = buildPost(detail, addr, hours);

      // Skip non-Texas results (statewide searches sometimes return neighboring states)
      if (addr.state && addr.state !== 'Texas' && addr.state !== 'TX') {
        console.log(`[${window._tx_idx}/${PLACES.length}] ⏭ Skipped (not TX): ${detail.name} — ${addr.city}, ${addr.state}`);
        window._tx_skipped++;
        setTimeout(processNext, 100);
        return;
      }

      fetch('/wp-json/wp/v2/dance_studio', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
        body:    JSON.stringify(body),
      })
      .then(r => r.json())
      .then(res => {
        if (res.id) {
          window._tx_created++;
          console.log(`[${window._tx_idx}/${PLACES.length}] ✅ ${detail.name} (${addr.city}, TX) → id ${res.id}`);
        } else if (res.code === 'term_exists' || (res.message || '').includes('slug')) {
          // Duplicate slug = already exists in WP
          window._tx_skipped++;
          console.log(`[${window._tx_idx}/${PLACES.length}] ⏭ Duplicate: ${detail.name}`);
        } else {
          window._tx_failed++;
          window._tx_errors.push({ name: detail.name, error: res.message || JSON.stringify(res) });
          console.warn(`[${window._tx_idx}/${PLACES.length}] ❌ ${detail.name}: ${res.message}`);
        }
      })
      .catch(err => {
        window._tx_failed++;
        window._tx_errors.push({ name: detail.name, error: err.message });
        console.warn(`[${window._tx_idx}/${PLACES.length}] ❌ ${detail.name}: ${err.message}`);
      })
      .finally(() => setTimeout(processNext, 350));
    });
  }

  processNext();
})();


// ─── CHECK IMPORT PROGRESS (run anytime during Step 4) ───────────────────────
// `${window._tx_idx}/${window._texas_collected.length} — created: ${window._tx_created}, failed: ${window._tx_failed}, done: ${window._tx_done}`


// ─── STEP 5: Enrich Descriptions ─────────────────────────────────────────────
// After import completes, run this to generate original descriptions
// for all studios that still have placeholder excerpts.
// Paste into console and run.

(async function() {
  const NONCE = wpApiSettings.nonce;
  let page = 1, allStudios = [];

  // Fetch all studios
  while (true) {
    const r = await fetch(`/wp-json/wp/v2/dance_studio?per_page=100&page=${page}&_fields=id,slug,title,excerpt`, {
      headers: { 'X-WP-Nonce': NONCE }
    });
    if (!r.ok) break;
    const batch = await r.json();
    if (!batch.length) break;
    allStudios = allStudios.concat(batch);
    if (batch.length < 100) break;
    page++;
  }

  // Filter to studios with generic placeholder excerpts
  const needsDescription = allStudios.filter(s => {
    const ex = s.excerpt?.rendered || '';
    return ex.includes('Private dance lessons in') && ex.includes('ballroom');
  });

  console.log(`${needsDescription.length} studios need description enrichment`);

  const CHAIN_TEMPLATES = {
    arthur_murray: [
      (s) => `${s} is an Arthur Murray franchise studio bringing decades of proven dance instruction to the local community. Known for personalized coaching and a welcoming atmosphere, this location offers private lessons in ballroom, Latin, and social dancing for all levels.`,
      (s) => `Arthur Murray has been teaching the world to dance since 1912, and ${s} carries that tradition forward with expert instructors and a structured curriculum. Private lessons here are tailored to your pace, your goals, and your schedule.`,
    ],
    fred_astaire: [
      (s) => `${s} is a Fred Astaire Dance Studios franchise location dedicated to the gold standard in American ballroom instruction. With a comprehensive syllabus and professionally trained instructors, this studio serves dancers from first-timers to seasoned competitors.`,
      (s) => `Inspired by the elegance of Fred Astaire himself, ${s} offers private dance instruction that combines technical excellence with genuine passion for the art. Whether your goal is a wedding dance or competition training, this studio delivers results.`,
    ],
    dance_with_me: [
      (s) => `${s} is a Dance With Me studio bringing the energy and expertise of professional ballroom competition to private instruction. Known for their appearance on Dancing with the Stars, Dance With Me studios offer a premium experience for serious dance students.`,
    ],
    independent: [
      (s) => `${s} is a private dance studio offering personalized instruction in ballroom and Latin dance styles. With a focus on one-on-one coaching, students progress at their own pace in a supportive and professional environment.`,
      (s) => `At ${s}, every student receives the kind of focused attention that group classes simply cannot match. Whether you're preparing for a special event or pursuing a new passion, private instruction here is tailored to exactly where you are and where you want to go.`,
      (s) => `${s} brings expert dance instruction to the local community, with a curriculum designed around the individual student. Private lessons in ballroom, Latin, and social dance styles are available for all ages and experience levels.`,
    ],
  };

  function detectChain(title) {
    const n = title.toLowerCase();
    if (n.includes('arthur murray'))  return 'arthur_murray';
    if (n.includes('fred astaire'))   return 'fred_astaire';
    if (n.includes('dance with me'))  return 'dance_with_me';
    return 'independent';
  }

  function generateDescription(studio) {
    const chain     = detectChain(studio.title.rendered);
    const templates = CHAIN_TEMPLATES[chain] || CHAIN_TEMPLATES.independent;
    const template  = templates[studio.id % templates.length];
    return template(studio.title.rendered);
  }

  let updated = 0, failed = 0;

  for (const studio of needsDescription) {
    const description = generateDescription(studio);
    try {
      const r = await fetch(`/wp-json/wp/v2/dance_studio/${studio.id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
        body:    JSON.stringify({ excerpt: description }),
      });
      const res = await r.json();
      if (res.id) {
        updated++;
        console.log(`[${updated}] ✅ ${studio.title.rendered}`);
      } else {
        failed++;
        console.warn(`❌ ${studio.title.rendered}:`, res.message);
      }
    } catch(e) {
      failed++;
      console.warn(`❌ ${studio.title.rendered}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 250)); // 250ms between updates
  }

  console.log(`\n✅ Description enrichment complete: ${updated} updated, ${failed} failed`);
})();

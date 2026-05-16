/**
 * run-full-audit.js
 * =================
 * Browser-console script. Paste into the WP admin console at http://5.78.144.42/wp-admin/
 *
 * What it does:
 *   1. Fetches ALL dance_studio posts from WordPress (paged, all ~4,400+)
 *   2. Sends them in batches of 25 to /api/crawl-audit on Vercel
 *   3. Collects every AuditResult into window._auditResults
 *   4. When done, downloads bdd-studios-full-audit.csv to your browser
 *
 * CSV columns:
 *   wp_id, name, city, address, phone, website, has_website,
 *   email, email_status,
 *   has_ssl, mobile_ready, platform, cms_version,
 *   copyright_year, has_flash, html_doctype, last_modified,
 *   site_age_signal, flags
 *
 * Settings:
 */
const BATCH_SIZE    = 25;        // max 25 per crawl-audit call
const DELAY_MS      = 2000;      // ms between batches (be gentle on Vercel)
const AUDIT_URL     = 'https://www.ballroomdancedirectory.com/api/crawl-audit';
const WP_BASE       = 'http://5.78.144.42/wp-json/wp/v2';
const WP_AUTH       = 'Basic ' + btoa('danceadmin:KxIp Xqlw Q1ae cryw 3jb1 0fhO');
const PER_PAGE      = 100;       // WP REST max per page

// ── State ────────────────────────────────────────────────────────────────────
window._auditResults  = [];
window._auditRunning  = true;
window._auditStop     = false;   // set to true in console to abort
window._auditProgress = { fetched: 0, total: 0, batched: 0, errors: 0 };

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function escCsv(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function resultsToCsv(rows) {
  const headers = [
    'wp_id','name','city','address','phone','website','has_website',
    'email','email_status',
    'has_ssl','mobile_ready','platform','cms_version',
    'copyright_year','has_flash','html_doctype','last_modified',
    'site_age_signal','flags',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    const a = r.audit || {};
    lines.push([
      escCsv(r.wp_id),
      escCsv(r.name),
      escCsv(r.city),
      escCsv(r.address),
      escCsv(r.phone),
      escCsv(r.website),
      escCsv(r.has_website),
      escCsv(r.email),
      escCsv(r.email_status),
      escCsv(a.has_ssl),
      escCsv(a.mobile_ready),
      escCsv(a.platform),
      escCsv(a.cms_version),
      escCsv(a.copyright_year),
      escCsv(a.has_flash),
      escCsv(a.html_doctype),
      escCsv(a.last_modified),
      escCsv(a.site_age_signal),
      escCsv(a.flags),
    ].join(','));
  }
  return lines.join('\n');
}

function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Step 1: Fetch all studios from WP ────────────────────────────────────────
async function fetchAllStudios() {
  console.log('[Audit] Fetching studio list from WordPress...');
  const studios = [];

  // Get total count first
  const probe = await fetch(
    `${WP_BASE}/dance_studio?per_page=1&_fields=id&status=publish`,
    { headers: { Authorization: WP_AUTH } }
  );
  const total = parseInt(probe.headers.get('X-WP-Total') || '0', 10);
  const pages = Math.ceil(total / PER_PAGE);
  window._auditProgress.total = total;
  console.log(`[Audit] ${total} studios across ${pages} pages`);

  // Fetch all pages in parallel (safe — just reading WP)
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1);
  const pageResults = await Promise.all(pageNums.map(p =>
    fetch(
      `${WP_BASE}/dance_studio?per_page=${PER_PAGE}&page=${p}&status=publish` +
      `&_fields=id,title,acf`,
      { headers: { Authorization: WP_AUTH } }
    ).then(r => r.json())
  ));

  for (const page of pageResults) {
    if (!Array.isArray(page)) continue;
    for (const post of page) {
      const acf = post.acf || {};
      studios.push({
        wp_id:   post.id,
        name:    post.title?.rendered?.replace(/&#\d+;/g, c =>
                   String.fromCharCode(parseInt(c.slice(2), 10))) || '',
        city:    [acf.studio_address_city, acf.studio_address_state]
                   .filter(Boolean).join(', '),
        address: acf.studio_address_street || '',
        phone:   acf.studio_phone || '',
        website: acf.studio_website || '',
      });
    }
  }

  window._auditProgress.fetched = studios.length;
  console.log(`[Audit] Loaded ${studios.length} studios`);
  return studios;
}

// ── Step 2: Run audit in batches ─────────────────────────────────────────────
async function runAuditBatches(studios) {
  const batches = [];
  for (let i = 0; i < studios.length; i += BATCH_SIZE) {
    batches.push(studios.slice(i, i + BATCH_SIZE));
  }

  console.log(`[Audit] ${batches.length} batches of up to ${BATCH_SIZE} studios`);

  for (let b = 0; b < batches.length; b++) {
    if (window._auditStop) {
      console.warn('[Audit] Stopped by user (window._auditStop = true)');
      break;
    }

    const batch = batches[b];
    try {
      const res  = await fetch(AUDIT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ studios: batch }),
      });
      const data = await res.json();

      if (Array.isArray(data.results)) {
        window._auditResults.push(...data.results);
        window._auditProgress.batched = window._auditResults.length;
        console.log(
          `[Audit] Batch ${b + 1}/${batches.length} done` +
          ` | ${data.with_email}/${data.with_website} emails found` +
          ` | Total so far: ${window._auditResults.length}`
        );
      } else {
        console.error(`[Audit] Batch ${b + 1} unexpected response:`, data);
        window._auditProgress.errors++;
      }
    } catch (err) {
      console.error(`[Audit] Batch ${b + 1} failed:`, err.message);
      window._auditProgress.errors++;
    }

    if (b < batches.length - 1) await sleep(DELAY_MS);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('=== BDD Full Studio Audit ===');
    console.log('Monitor: window._auditProgress');
    console.log('Stop:    window._auditStop = true');
    console.log('Results: window._auditResults');

    const studios = await fetchAllStudios();
    await runAuditBatches(studios);

    window._auditRunning = false;

    const csv      = resultsToCsv(window._auditResults);
    const filename = `bdd-studios-full-audit-${new Date().toISOString().slice(0,10)}.csv`;
    downloadCsv(csv, filename);

    // Summary
    const results = window._auditResults;
    const withSite    = results.filter(r => r.has_website === 'Yes').length;
    const withEmail   = results.filter(r => r.email).length;
    const modern      = results.filter(r => r.audit?.site_age_signal === 'Modern').length;
    const aging       = results.filter(r => r.audit?.site_age_signal === 'Aging').length;
    const outdated    = results.filter(r => r.audit?.site_age_signal === 'Outdated').length;

    console.log('\n=== AUDIT COMPLETE ===');
    console.log(`Total studios:   ${results.length}`);
    console.log(`Have website:    ${withSite} (${Math.round(withSite/results.length*100)}%)`);
    console.log(`No website:      ${results.length - withSite}`);
    console.log(`Email found:     ${withEmail} (${Math.round(withEmail/withSite*100)}% of sites)`);
    console.log(`Modern sites:    ${modern}`);
    console.log(`Aging sites:     ${aging}`);
    console.log(`Outdated sites:  ${outdated}`);
    console.log(`CSV downloaded:  ${filename}`);
    console.log(`Batch errors:    ${window._auditProgress.errors}`);

  } catch (err) {
    window._auditRunning = false;
    console.error('[Audit] Fatal error:', err);
  }
})();

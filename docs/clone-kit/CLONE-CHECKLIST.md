# CLONE CHECKLIST — NEW DIRECTORY SETUP
> Execute in order. Each step must complete before the next begins.
> All steps are performed autonomously by the AI unless marked **[DON]**.

---

## PRE-FLIGHT — GATHER INPUTS

Before touching any infrastructure, confirm:

- [ ] **Niche** — e.g. "yoga studios", "BJJ gyms", "music schools"
- [ ] **Domain** — e.g. `yogastudiodirectory.com` (already purchased?)
- [ ] **Google Maps search terms** — e.g. `"yoga studio"`, `"hot yoga"`, `"yoga classes"` (3–5 terms)
- [ ] **CPT slug** — the WordPress custom post type slug for this niche, e.g. `yoga_studio`
- [ ] **GitHub repo name** — e.g. `yoga-directory`
- [ ] **Vercel project name** — e.g. `yoga-studio-directory`
- [ ] **Supabase project name** — e.g. `yoga-directory`
- [ ] **Hetzner server name** — e.g. `yoga-directory-wp`
- [ ] **Color palette** — primary dark color, accent/gold color (or use defaults from BDD)

---

## STEP 1 — FORK THE GITHUB REPO

```bash
# In sandbox — clone BDD, create new repo for this directory
cd /tmp
git clone https://[PAT]@github.com/palmerbd/[bdd-repo].git new-dir
cd new-dir
git remote remove origin
git remote add origin https://[PAT]@github.com/palmerbd/[new-repo-name].git
git push -u origin main
```

**[DON]** — Create the new empty GitHub repo at `github.com/palmerbd/[new-repo-name]` first (no README, no .gitignore — just empty). Then give Claude the repo URL.

---

## STEP 2 — PROVISION HETZNER VPS

**[DON]** — Log into Hetzner Cloud console → New Project → Create Server:
- **Location:** Hillsboro, OR (us-west) or Ashburn, VA (us-east)
- **OS:** Ubuntu 22.04 LTS
- **Plan:** CPX11 (2 vCPU, 2 GB RAM, 40 GB) — $6.99/mo
- **SSH key:** Add Don's existing SSH key if available, or generate new one
- **Server name:** `[niche]-directory-wp`
- Note the IP address and share with Claude

---

## STEP 3 — INSTALL LEMP STACK ON HETZNER

SSH in and run the full stack install. Claude writes a script; Desktop Commander executes it.

```bash
ssh root@[SERVER_IP]

# System update
apt update && apt upgrade -y

# Nginx
apt install -y nginx

# MySQL
apt install -y mysql-server
mysql_secure_installation  # set root password

# PHP 8.3
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring \
               php8.3-xml php8.3-zip php8.3-intl php8.3-bcmath

# WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## STEP 4 — INSTALL WORDPRESS (HEADLESS)

```bash
# Create database
mysql -u root -p[MYSQL_ROOT_PASS] -e "
  CREATE DATABASE [niche]_directory_wp;
  CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'wppass2024';
  GRANT ALL PRIVILEGES ON [niche]_directory_wp.* TO 'wp_user'@'localhost';
  FLUSH PRIVILEGES;
"

# Create web root
mkdir -p /var/www/[niche]directory
cd /var/www/[niche]directory

# Download and configure WP
wp core download --allow-root
wp config create \
  --dbname=[niche]_directory_wp \
  --dbuser=wp_user \
  --dbpass=wppass2024 \
  --dbprefix=dd_ \
  --allow-root

wp core install \
  --url="http://[SERVER_IP]" \
  --title="[Niche] Directory API" \
  --admin_user=danceadmin \
  --admin_password=DanceAdmin2026! \
  --admin_email=bpalmer@abilenewebsitedesign.com \
  --allow-root

# Disable front-end themes (headless — WP is API only)
wp option update blogdescription "" --allow-root
wp option update show_on_front page --allow-root
```

---

## STEP 5 — CONFIGURE NGINX FOR WORDPRESS

Create `/etc/nginx/sites-available/[niche]directory`:

```nginx
server {
    listen 80;
    server_name [SERVER_IP] [wp-subdomain.domain.com];

    root /var/www/[niche]directory;
    index index.php index.html;

    # Block direct PHP file access (security)
    location ~* /uploads/.*\.php$ { deny all; }
    location = /xmlrpc.php       { deny all; }
    location = /wp-login.php     { allow all; }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/[niche]directory /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## STEP 5b — SSL + CLOUDFLARE (HTTPS on WP subdomain)

Do this after nginx is working on port 80 and DNS is pointed.

**Prerequisite:** `wp.[domain.com]` DNS A record already points to this server IP, and Cloudflare proxy (orange cloud) is ON.

```bash
# Create self-signed cert (3650-day — Cloudflare handles the real cert)
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/wp.key \
  -out /etc/nginx/ssl/wp.crt \
  -subj "/C=US/ST=TX/L=Abilene/O=WP/CN=localhost"
```

Update the nginx config at `/etc/nginx/sites-available/[niche]directory` — add an SSL server block:

```nginx
# HTTP → redirect to HTTPS
server {
    listen 80;
    server_name wp.[domain.com];
    return 301 https://$host$request_uri;
}

# HTTPS — Cloudflare Full mode (accepts self-signed)
server {
    listen 443 ssl;
    server_name wp.[domain.com];

    ssl_certificate     /etc/nginx/ssl/wp.crt;
    ssl_certificate_key /etc/nginx/ssl/wp.key;

    root /var/www/[niche]directory;
    index index.php index.html;

    location ~* /uploads/.*\.php$ { deny all; }
    location = /xmlrpc.php       { deny all; }
    location = /wp-login.php     { allow all; }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

**In Cloudflare dashboard:** SSL/TLS → Overview → set to **Full** (not Flexible, not Full Strict).

**Update WP siteurl/home to HTTPS:**
```bash
wp option update siteurl 'https://wp.[domain.com]' --path=/var/www/[niche]directory --allow-root
wp option update home    'https://wp.[domain.com]' --path=/var/www/[niche]directory --allow-root
```

**Verify:** `curl -I https://wp.[domain.com]/wp-json` should return `200 OK`.

---

## STEP 6 — INSTALL REQUIRED WP PLUGINS

```bash
cd /var/www/[niche]directory

# Via WP-CLI (free plugins)
wp plugin install wp-graphql --activate --allow-root
wp plugin install custom-post-type-ui --activate --allow-root
wp plugin install jwt-authentication-for-wp-rest-api --activate --allow-root
wp plugin install wordpress-seo --activate --allow-root
wp plugin install wordfence --activate --allow-root

# ACF Pro — [DON] Download zip from advancedcustomfields.com/pro → upload via WP Admin
# Plugins → Add New → Upload Plugin → activate → enter license key
```

**WP-Config additions needed for JWT auth:**

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

**⚠️ WORDFENCE AND BULK IMPORTS — READ BEFORE RUNNING ANY IMPORT SCRIPTS:**

Wordfence actively blocks bulk REST API writes. Two failure modes:
1. **Brute-force lockout on JWT token endpoint** — repeated POSTs to `/jwt-auth/v1/token` (e.g., re-fetching token at start of batches) triggers Wordfence's login protection. Your script's IP gets temporarily blocked. Symptom: 403 on token fetch, then 401 on all subsequent API calls.
2. **Rate limiting on rapid POST requests** — sending 50+ POST requests/minute to `/wp/v2/[cpt_slug]` triggers WAF rate limiting. Symptom: 403 responses mid-import, recovers after ~5 minutes.

**Fix — whitelist your import script's IP before any bulk import session:**
- WP Admin → Wordfence → Firewall → Allowlisted IPs
- Add the IP address your import script runs from
- For Desktop Commander scripts running on Don's Windows machine: add Don's current external IP (google "my ip")
- Remove from whitelist after import is done

**Alternative — install Wordfence AFTER all data import is complete.** Since the site isn't live yet during scrape/import, you can defer Wordfence installation to Step 14 (post-launch hardening). This avoids all import interference.

---

## STEP 7 — CREATE CUSTOM POST TYPE IN WP

Via WP Admin → CPT UI → Add New Post Type:
- **Post Type Slug:** `[niche_slug]` — e.g. `yoga_studio` (matches what `lib/wordpress.ts` will query)
- **Plural Label:** e.g. "Yoga Studios"
- **Singular Label:** e.g. "Yoga Studio"
- **REST API base:** same as slug
- **Show in REST API:** Yes
- **Show in GraphQL:** Yes (WPGraphQL will auto-detect)

---

## STEP 8 — CREATE ACF FIELD GROUP

Import the BDD ACF field group JSON (adapted for new niche) via WP Admin → ACF → Tools → Import.

**Core fields to keep (rename labels, same field names):**
- `studio_city`, `studio_state`, `studio_zip`, `studio_address`
- `studio_phone`, `studio_email`, `studio_website`
- `studio_rating`, `studio_review_count`
- `studio_tier` (free/claimed/paid)
- `studio_chain` → rename to `[niche]_chain` or remove if no franchise chains
- `dance_styles` → replace with `[niche]_specialties` (checkbox field, new values)
- `private_lesson_rate` → rename for niche (e.g. `session_rate`, `class_rate`)
- `studio_description`, `studio_tagline`
- `google_maps_url`, `yelp_url`, `facebook_url`, `instagram_url`
- `founded_year`, `amenities`
- `hours_monday` through `hours_sunday`

Assign the field group to post type: `[niche_slug]`

---

## STEP 9 — MYSQL TUNING (prevent OOM crash on 2GB RAM)

```bash
cat >> /etc/mysql/mysql.conf.d/mysqld.cnf << 'EOF'
[mysqld]
innodb_buffer_pool_size = 256M
innodb_redo_log_capacity = 134217728
max_connections = 50
EOF

systemctl restart mysql
```

---

## STEP 10 — CREATE SUPABASE PROJECT

**[DON]** — Log into supabase.com → New Project:
- **Name:** `[niche]-directory`
- **Database password:** save securely
- **Region:** US East or US West

Once created, copy:
- Project URL: `https://[ref].supabase.co`
- Anon key (public)
- Service role key (secret — for API routes only)

Run the database migrations (copy from BDD `supabase/migrations/` — all 5 files apply unchanged):
- `001_claims.sql`
- `002_stripe.sql`
- `003_gbp_connections.sql`
- `004_studio_profiles.sql`
- `005_competition_claims.sql`

Run via Supabase SQL editor → paste each file in order.

---

## STEP 11 — CREATE VERCEL PROJECT

**[DON]** — Log into vercel.com → Add New Project → Import from GitHub:
- Select `palmerbd/[new-repo-name]`
- **Framework:** Next.js (auto-detected)
- **Root directory:** leave as `/` (or `dance-directory/` if monorepo)
- **Project name:** `[niche]-studio-directory`

Set environment variables (Settings → Environment Variables):

```
WP_API_URL                = https://wp.[domain.com]/wp-json
NEXT_PUBLIC_WP_API_URL    = https://wp.[domain.com]/wp-json
NEXT_PUBLIC_SUPABASE_URL  = https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
SUPABASE_SERVICE_ROLE_KEY = [service role key]
RESEND_API_KEY            = [from resend.com]
RESEND_FROM_EMAIL         = leads@[domain.com]
STRIPE_SECRET_KEY         = [from stripe.com]
STRIPE_WEBHOOK_SECRET     = [from stripe webhook config]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [from stripe.com]
```

> **Why HTTPS subdomain (not bare IP):** Vercel serverless functions require HTTPS for external API calls in production. The Cloudflare-proxied `wp.[domain.com]` subdomain handles SSL termination and lets Vercel reach the WP REST API without certificate errors. Direct IP (`http://[SERVER_IP]/wp-json`) causes SSL errors on Vercel's runtime even if the IP works locally.

---

## STEP 12 — POINT DOMAIN DNS

At domain registrar (Namecheap / Cloudflare):
- `[domain.com]` → CNAME to `cname.vercel-dns.com` (or A record to Vercel IP)
- `www.[domain.com]` → same
- `wp.[domain.com]` → A record to Hetzner server IP (for WP admin access)

Add domain to Vercel project → Settings → Domains → Add `www.[domain.com]` and `[domain.com]`.

---

## STEP 13 — RUN THE NICHE SWAP

Apply all changes from `NICHE-SWAP-GUIDE.md` to the cloned codebase. Commit and push — Vercel deploys automatically.

---

## STEP 14 — BEGIN DATA SCRAPE

See `AUTONOMOUS-WORKFLOW.md` → "Google Maps Scrape" section.

Target: 3,000–5,000 listings minimum before launch. Run in batches of 20–50 cities.

---

## STEP 15 — VERIFY LAUNCH READINESS

- [ ] Homepage loads at `www.[domain.com]`
- [ ] `/studios` (or `/[listings]`) page shows listings
- [ ] Single listing page renders at `/studios/[slug]`
- [ ] WP Admin accessible at `http://wp.[domain.com]/wp-admin`
- [ ] Supabase auth flow works (claim a test listing)
- [ ] Stripe checkout works in test mode
- [ ] Resend email delivers a test lead
- [ ] Vercel shows green deployment
- [ ] Google Search Console property created, sitemap submitted

---

## INFRASTRUCTURE REFERENCE TABLE

| Resource | BDD (original) | New Directory |
|---|---|---|
| GitHub | palmerbd/[bdd-repo] | palmerbd/[new-repo] |
| Vercel | ballroom-dance-directory | [new-project] |
| Live domain | greenpestdirectory.com | [new domain] |
| Hetzner server | 178.156.197.177 | [new IP] |
| WP subdomain | wp.greenpestdirectory.com | wp.[new-domain.com] |
| WP Admin URL | https://wp.greenpestdirectory.com/wp-admin | https://wp.[new-domain.com]/wp-admin |
| WP REST API | https://wp.greenpestdirectory.com/wp-json | https://wp.[new-domain.com]/wp-json |
| WP user | danceadmin / DanceAdmin2026!BDD | danceadmin / DanceAdmin2026! |
| DB name | dance_directory_wp | [niche]_directory_wp |
| DB user/pass | wp_user / wppass2024 | wp_user / wppass2024 |
| CPT slug | pest_company | [niche_slug] |
| Supabase | [bdd ref] | [new ref] |
| SSL | Self-signed + Cloudflare Full | Self-signed + Cloudflare Full |

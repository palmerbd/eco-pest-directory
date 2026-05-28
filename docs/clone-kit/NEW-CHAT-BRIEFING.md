# NEW COWORK CHAT — DIRECTORY PROJECT BRIEFING
> Drop this file at the start of every new Cowork chat session for a new niche directory.
> Read it fully before asking any questions or taking any action.

---

## WHO YOU'RE WORKING WITH

**Don Palmer** — `bpalmer@abilenewebsitedesign.com` — Abilene, TX.
Experienced web developer and designer. Business owner building a portfolio of niche online directories. He operates at the strategy/business level and delegates all technical execution to you. He does not run commands manually — **you run everything autonomously**.

**How Don communicates:**
- Direct answers first, reasoning second. No excessive options lists.
- Business-level framing. Translate technical details into clear decisions.
- He will say "go ahead and do it" — that means execute fully without check-ins.
- He will say "continue from where you left off" when resuming — check memory files and pick up the task.
- He does NOT want to be asked clarifying questions for things you can figure out from context.

---

## THE PLATFORM — WHAT YOU'RE BUILDING

A **niche online business directory** — the same architecture used for `ballroomdancedirectory.com`. Every directory in this portfolio uses the identical stack, just swapped for a different niche.

**Business model:**
1. Scrape 3,000–5,000 businesses in the niche from Google Maps API → import to WordPress → serve as free listings
2. Business owners can claim their listing (free, verified by email)
3. Paid Featured tier ($49/mo via Stripe) unlocks: lead capture form, Featured badge, priority placement, photo gallery, custom description, social links, promo banner
4. SEO at scale via 4,000+ individual listing pages + city hub pages → organic traffic → owners pay to convert leads

**Architecture: Headless WordPress + Next.js**
- **WordPress** (Hetzner VPS, CPX11 ~$7/mo) — headless data layer only. Custom post type for listings, ACF fields, WPGraphQL, REST API. No public-facing WP pages.
- **Next.js 16** (Vercel) — public frontend. App Router, ISR (revalidate per page type), TypeScript, Tailwind v4.
- **Supabase** — auth (owner accounts), claims table, studio_profiles, photos, Google Business Profile connections
- **Stripe** — Featured tier subscriptions ($49/mo)
- **Resend** — transactional email (lead notifications to owners)
- **GitHub** (palmerbd account) — source control, Vercel auto-deploys on push to main

**The source repository** (BDD — the original, fully built directory):
- GitHub: `github.com/palmerbd/[bdd-repo-name]`
- Live: `ballroomdancedirectory.com`
- Vercel project: `ballroom-dance-directory.vercel.app`
- WP backend: `http://5.78.218.239/wp-json` (IP direct, no domain on WP)

**This new directory** being built in this chat:
- Niche: **[FILL IN WHEN STARTING CHAT]**
- Domain: **[FILL IN WHEN STARTING CHAT]**
- GitHub repo: **[FILL IN — create new or fork BDD repo]**
- Vercel project: **[FILL IN after creation]**
- Hetzner server IP: **[FILL IN after provisioning]**
- Supabase project: **[FILL IN after creation]**

---

## YOUR OPERATING ENVIRONMENT

You run inside a **Linux VM sandbox** at `/sessions/[session-id]/`. This is NOT Don's computer.

**Don's computer** is a Windows 11 machine. You reach it via **Desktop Commander MCP** (`mcp__Desktop_Commander__*` tools). This is how you run things autonomously.

**Key Windows paths:**
- Node.js: `C:\Program Files\nodejs\node.exe`
- Workspace: `C:\Users\fxtra\OneDrive\Desktop\Online Directories\[Niche]\Web Developer\`
- Batch files: `C:\Users\fxtra\run-[taskname].bat` (created here to avoid path-with-spaces issues)
- GitHub PAT: stored in git credentials, scope `repo`, account `palmerbd`, no expiration

**The path-with-spaces problem:** The workspace folder path contains spaces. Node.js commands fail when the path is quoted inline in cmd. Always solve this by writing a `.bat` file to `C:\Users\fxtra\` that uses `pushd` to cd first:
```batch
@echo off
pushd "C:\Users\fxtra\OneDrive\Desktop\Online Directories\[Niche]\Web Developer"
"C:\Program Files\nodejs\node.exe" script-name.js
popd
```
Then run the bat file: `C:\Users\fxtra\run-[name].bat`

**Git push workflow:** The workspace `.git/` directory has stale Windows lock files. Always push via a fresh clone in the sandbox:
```bash
cd /tmp && git clone https://[PAT]@github.com/palmerbd/[repo].git tmp-repo
cp -r /path/to/changed/files tmp-repo/
cd tmp-repo && git add . && git commit -m "message" && git push origin main
```
Vercel auto-deploys on push to main — no manual deploy step needed.

**Sandbox HTTPS is blocked** — outbound HTTPS from the sandbox goes through a proxy that blocks it. Use Chrome MCP or Desktop Commander for any outbound HTTP calls from within the chat.

---

## AUTONOMOUS WORKFLOW RULES

1. **Run everything yourself.** Don does not open terminals, run scripts, or execute commands. You use Desktop Commander to do it on his machine.
2. **Write scripts, don't type commands interactively.** Write a `.js` file to the workspace, then run it via a batch file.
3. **Save progress after every batch.** Any scraping or data script must write results to CSV after each batch so it can be resumed if interrupted.
4. **Resume-safe scripts.** Always skip rows that already have data (check if field is filled before processing).
5. **Deploy = git push.** Vercel watches main branch. Push → deploy. No Vercel CLI needed.
6. **Read Desktop Commander output** with `read_process_output` after `start_process`. Use `interact_with_process` to send additional input to a running process.
7. **Check memory files first** when resuming a session. Memory is at `/sessions/[id]/mnt/.auto-memory/`.

---

## REFERENCE FILES IN THIS REPO

Read these autonomously as needed — do not ask Don to find them:

| File | Purpose |
|---|---|
| `docs/clone-kit/CLONE-CHECKLIST.md` | Step-by-step infra setup for a new directory |
| `docs/clone-kit/NICHE-SWAP-GUIDE.md` | Every file/string to change when adapting for a new niche |
| `docs/clone-kit/AUTONOMOUS-WORKFLOW.md` | Pattern library — scraping, importing, deploying |
| `docs/KITT-CONTEXT.md` (in dance-directory) | Full technical context on BDD codebase |
| `STATUS.md` | Current project status |
| `pipeline.md` | Scraping pipeline notes |

---

## FIRST STEPS WHEN STARTING A NEW DIRECTORY

1. Read `CLONE-CHECKLIST.md` — follow it in order
2. Read `NICHE-SWAP-GUIDE.md` — understand what changes for this niche before touching any code
3. Ask Don: what is the niche, what is the domain, do you have a Hetzner account ready?
4. Provision Hetzner server, fork GitHub repo, set up Vercel — all autonomously per the checklist
5. Begin Google Maps scrape for the niche (see `AUTONOMOUS-WORKFLOW.md`)

# State 17 Consulting website

The public site for State 17 Consulting LLC, a boutique venture architecture firm run by Jim Pushor. Live at https://state17consulting.com/.

It is a single static HTML page plus a few supporting files. No framework, no build step, no JavaScript-rendered content: everything a visitor, a search engine or an AI answer engine needs is in the HTML source.

| Path | What it is |
|---|---|
| `index.html` | The landing page: rotating one-word hero, "in plain terms" summary, four audience cards, fee schedule, contact form. Structured data (JSON-LD: ProfessionalService, Person, WebSite, FAQPage) is in the `<head>`. |
| `thanks.html` | Shown after the contact form is submitted. |
| `clients/index.html` | Placeholder for the client workspace. To be gated with Cloudflare Access later; there is no auth in this repo. |
| `404.html` | Not-found page. Cloudflare Pages serves it automatically. |
| `functions/api/contact.js` | Cloudflare Pages Function that receives the contact form and emails it via Resend. |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawler and answer-engine files. `llms.txt` is a plain-text summary of the firm drawn from the page copy. |

## Run it locally

From the repo root, either:

```sh
npx serve .
```

or

```sh
python3 -m http.server 8000
```

Then open http://localhost:3000/ (serve) or http://localhost:8000/ (Python). The contact form will not send locally with these servers; it only works on Cloudflare Pages where the Function runs. To test the Function locally, use Wrangler:

```sh
npx wrangler pages dev . --binding RESEND_API_KEY=re_xxx
```

## Editing the page

**Hero words.** Find the `HERO SLIDES` comment in the body of `index.html`. Each `<article class="slide">` is one slide: a word, a statement, and a drawn SVG backdrop. Add, remove or reorder the `<article>` blocks; the dots and rotation adjust themselves. The first slide holds the page's only `<h1>`; later slides use `<p class="h1">`. Keep it that way so the outline has a single H1. Rotation speed is `ROTATE_MS` in the script at the bottom of the file (10 seconds). To use a photo instead of the drawings, set `--hero-image` in the `:root` block at the top of the `<style>`.

**Cards.** Find the `CARDS` comment. Each `<li>` is one audience: a title and number in `.head`, a typical problem in `.ex`, a quote in `.quote`, and a link to the fee schedule. Copy a whole `<li>` to add one. The grid is four across on desktop, two on tablet, one on phones.

**Fee table.** The `<table>` in the fees section. One `<tr>` per service. The row with class `rec` is the recurring Decision Review and can be removed if not wanted.

**Structured data.** If you change a service, its length, who the firm works with, or the FAQ answers, update the JSON-LD block in the `<head>` and `llms.txt` so they say the same thing as the visible page.

**Contact form.** The form posts `name`, `email`, `business`, `decision`, `timing` and a hidden honeypot `website` to `/api/contact`. The Function validates them, discards any submission with the honeypot filled, emails jim@state17consulting.com, and redirects to `/thanks.html`.

## Deploys

Every push to `main` deploys to Cloudflare Pages. Pull requests and other branches get preview URLs. There is nothing to build.

## One-time setup in Cloudflare

Two things to do once in the Cloudflare dashboard:

1. **Create the Pages project.** Workers & Pages → Create → Pages → Connect to Git → pick `jpush1773/state17-site`. Production branch `main`. Framework preset: None. Build command: leave empty. Build output directory: `/`. Save and deploy. Functions in `functions/` are picked up automatically.
2. **Add the Resend key.** In the Pages project → Settings → Variables and Secrets → add `RESEND_API_KEY` (Production, and Preview if you want previews to send) with the API key from Resend. Mark it as a secret. Redeploy once after adding it.

For Resend to send from `@state17consulting.com`, the domain must be verified in Resend (Domains → Add domain → add the DKIM and SPF records it gives you at your DNS provider). The Function sends from `website@state17consulting.com` by default; set `CONTACT_FROM` as a second variable to use a different sender.

Later: to gate `/clients/`, add a Cloudflare Access application for `state17consulting.com/clients/*`. No code change is needed.

## DNS at Squarespace Domains

The site needs `state17consulting.com` and `www.state17consulting.com` to point at Cloudflare Pages. The recommended route is to let Cloudflare manage DNS for the domain, because Squarespace Domains does not allow a CNAME on the root (apex) domain, and Pages needs one there.

**Recommended: move DNS to Cloudflare, keep the domain registered at Squarespace.**

1. In Cloudflare: Add a site → `state17consulting.com` → Free plan. Cloudflare scans and imports the existing records (check that the Google Workspace / email MX records came across before continuing). Cloudflare gives you two nameservers, like `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`.
2. At Squarespace Domains: open the domain → DNS → Nameservers → Use custom nameservers → enter the two Cloudflare nameservers. Propagation takes up to 24 hours, usually much less.
3. In Cloudflare Pages: the project → Custom domains → add `state17consulting.com`, then add `www.state17consulting.com`. Cloudflare creates the CNAME records in the zone for you and issues certificates.
4. Optional: in the Cloudflare zone, Rules → Redirect Rules → redirect `www.state17consulting.com/*` to `https://state17consulting.com/$1` (301) so the canonical URL is the apex.

**Alternative, if you'd rather leave DNS at Squarespace:** add these records in Squarespace DNS settings, then add both hostnames under Custom domains in the Pages project.

| Type | Host | Value |
|---|---|---|
| CNAME | `www` | `state17-site.pages.dev` |

The apex cannot be a CNAME at Squarespace, so the root domain would have to be forwarded to `www` using Squarespace's domain forwarding, and the canonical URL in `index.html`, the JSON-LD and `sitemap.xml` would need to change to `https://www.state17consulting.com/`. That is why the nameserver route is recommended.

Do not remove the existing MX or TXT records for email when changing DNS.

## Conventions

See `CLAUDE.md`. In short: static HTML only, light theme only, no prices on the page, no invented testimonials or client names, keep the structured data and `llms.txt` in sync with the visible copy.

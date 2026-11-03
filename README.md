# State 17 Consulting website

The public site for State 17 Consulting LLC, a boutique venture architecture firm run by Jim Pushor. Live at https://state17consulting.com/, hosted on Firebase Hosting.

It is a single static HTML page plus a few supporting files. No framework, no build step, no JavaScript-rendered content: everything a visitor, a search engine or an AI answer engine needs is in the HTML source.

| Path | What it is |
|---|---|
| `index.html` | The landing page: rotating one-word hero, "in plain terms" summary, four audience cards, fee schedule, contact form. Structured data (JSON-LD: ProfessionalService, Person, WebSite, FAQPage) is in the `<head>`. |
| `thanks.html` | Shown after the contact form is submitted. |
| `clients/index.html` | Placeholder for the client workspace. Not gated yet; there is no auth in this repo. |
| `404.html` | Not-found page. Firebase Hosting serves it automatically. |
| `functions/` | Cloud Function for Firebase (`contact`) that receives the contact form and emails it via Resend. `firebase.json` rewrites `/api/contact` to it. |
| `firebase.json`, `.firebaserc` | Firebase Hosting and Functions config. |
| `.github/workflows/deploy.yml` | Deploys on every push to `main`. |
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

Then open http://localhost:3000/ (serve) or http://localhost:8000/ (Python). The contact form will not send locally with these servers; it only works on Firebase where the function runs. To run the function tests:

```sh
cd functions && npm install && npm test
```

To run the whole site with the function locally, use the Firebase emulator (needs `firebase-tools` and a `functions/.secret.local` file containing `RESEND_API_KEY=re_xxx`):

```sh
firebase emulators:start --only hosting,functions
```

## Editing the page

**Hero words.** Find the `HERO SLIDES` comment in the body of `index.html`. Each `<article class="slide">` is one slide: a word, a statement, and a drawn SVG backdrop. Add, remove or reorder the `<article>` blocks; the dots and rotation adjust themselves. The first slide holds the page's only `<h1>`; later slides use `<p class="h1">`. Keep it that way so the outline has a single H1. Rotation speed is `ROTATE_MS` in the script at the bottom of the file (10 seconds). To use a photo instead of the drawings, set `--hero-image` in the `:root` block at the top of the `<style>`.

**Cards.** Find the `CARDS` comment. Each `<li>` is one audience: a title and number in `.head`, a typical problem in `.ex`, a quote in `.quote`, and a link to the fee schedule. Copy a whole `<li>` to add one. The grid is four across on desktop, two on tablet, one on phones.

**Fee table.** The `<table>` in the fees section. One `<tr>` per service. The row with class `rec` is the recurring Decision Review and can be removed if not wanted.

**Structured data.** If you change a service, its length, who the firm works with, or the FAQ answers, update the JSON-LD block in the `<head>` and `llms.txt` so they say the same thing as the visible page.

**Contact form.** The form posts `name`, `email`, `business`, `decision`, `timing` and a hidden honeypot `website` to `/api/contact`. The Function validates them, discards any submission with the honeypot filled, emails jim@state17consulting.com, and redirects to `/thanks.html`.

## Deploys

Every push to `main` runs the GitHub Action in `.github/workflows/deploy.yml`, which runs the function tests and deploys Hosting and the Cloud Function to Firebase. There is nothing to build for the site itself.

## One-time setup in Firebase / Google Cloud

Prerequisite: `npm install -g firebase-tools` and `firebase login`.

1. **Create the Firebase project.** At https://console.firebase.google.com create a project (for example `state17-site`), or add Firebase to an existing Google Cloud project. Google Analytics is not needed; turn it off. Put the project ID in `.firebaserc` if it is not `state17-site`.
2. **Upgrade to the Blaze plan.** Project settings → Usage and billing → Blaze. Cloud Functions require it. The contact form's traffic will stay inside the free quota, but a billing account has to be attached.
3. **Enable Hosting** in the console (Build → Hosting → Get started), and once, from the repo root, run `firebase deploy --only hosting --project <project-id>` to confirm it works. The site is live at `<project-id>.web.app`.
4. **Store the Resend key** as a secret:

   ```sh
   firebase functions:secrets:set RESEND_API_KEY --project <project-id>
   ```

   Optional: `firebase functions:secrets:set CONTACT_FROM` to use a sender other than `website@state17consulting.com` (add `"CONTACT_FROM"` to the `secrets` list in `functions/index.js` if you do).
5. **Deploy the function once by hand** so the APIs get enabled and permissions prompted: `firebase deploy --only functions --project <project-id>`. Answer yes to enabling Cloud Functions, Cloud Build, Artifact Registry and Secret Manager.
6. **Wire up GitHub Actions.** Create a service account for deploys:

   ```sh
   gcloud iam service-accounts create github-deploy --project <project-id>
   for role in roles/firebasehosting.admin roles/cloudfunctions.admin roles/run.admin roles/iam.serviceAccountUser roles/secretmanager.viewer roles/artifactregistry.reader roles/serviceusage.serviceUsageConsumer; do
     gcloud projects add-iam-policy-binding <project-id> --member "serviceAccount:github-deploy@<project-id>.iam.gserviceaccount.com" --role "$role"
   done
   gcloud secrets add-iam-policy-binding RESEND_API_KEY --project <project-id> --member "serviceAccount:github-deploy@<project-id>.iam.gserviceaccount.com" --role roles/secretmanager.admin
   gcloud iam service-accounts keys create sa.json --iam-account github-deploy@<project-id>.iam.gserviceaccount.com
   ```

   In the GitHub repo → Settings → Secrets and variables → Actions, add `FIREBASE_SERVICE_ACCOUNT` (the full contents of `sa.json`) and `FIREBASE_PROJECT_ID`. Delete `sa.json` locally afterwards. The secret binding on the last line is needed because the deploy grants the function's runtime account access to the secret. If a deploy fails on a permission, add the role the error names.

For Resend to send from `@state17consulting.com`, the domain must be verified in Resend (Domains → Add domain → add the DKIM and SPF records it gives you at your DNS provider).

## DNS at Squarespace Domains

Firebase Hosting uses A records, which Squarespace supports at the root domain, so DNS stays at Squarespace.

1. In the Firebase console → Hosting → Add custom domain → `state17consulting.com`. Firebase shows a TXT record for verification and one or more A records.
2. At Squarespace Domains → the domain → DNS → Custom records, add exactly what the console shows. Typically:

   | Type | Host | Value |
   |---|---|---|
   | TXT | `@` | `hosting-site=<project-id>` (as shown by Firebase) |
   | A | `@` | the IP addresses Firebase lists (one record per address) |

   Remove any existing Squarespace A records on `@` so the domain stops pointing at Squarespace. Leave MX and other TXT records for email alone.
3. Back in Firebase, click Verify. Certificate provisioning takes from a few minutes to 24 hours.
4. Add `www.state17consulting.com` as a second custom domain and choose the option to redirect it to `state17consulting.com`. Firebase will give you A records for the `www` host; add those at Squarespace the same way.

## Conventions

See `CLAUDE.md`. In short: static HTML only, light theme only, no prices on the page, no invented testimonials or client names, keep the structured data and `llms.txt` in sync with the visible copy.

# CLAUDE.md

Public website for State 17 Consulting LLC, a boutique venture architecture firm run by Jim Pushor. Deployed to Firebase Hosting from `main` by GitHub Actions. See README.md for setup and DNS.

## Conventions

- **Static HTML only.** No framework, no build step, no bundler, no JavaScript-rendered content. All text must be in the HTML source so search engines and AI answer engines can read it. The only JS is the hero rotation in `index.html`.
- **Light theme only.** `color-scheme: light` is deliberate. Do not add a dark mode. Accent is `#1F7A5C`.
- **No prices on the page.** Every service is "Fixed fee" or "Fixed annual fee", quoted after the introductory call. Never add dollar figures.
- **No invented testimonials or client names.** Card quotes say "Testimonial to come." until Jim supplies real ones. Do not fabricate quotes, names, companies or results.
- **Single H1.** The first hero slide holds the only `<h1>`; other slides use `<p class="h1">`.
- **Keep structured data in sync with visible copy.** When services, lengths, audiences or FAQ answers change, update the JSON-LD graph in the `<head>` of `index.html` and `llms.txt` to match. The JSON-LD must stay valid JSON.
- **All canonical URLs are `https://state17consulting.com/`** (apex, trailing slash) in the canonical tag, Open Graph tags, JSON-LD and sitemap.
- **No analytics or tracking.** No third-party scripts beyond Google Fonts.
- **Contact form** posts to `/api/contact`, which `firebase.json` rewrites to the `contact` Cloud Function in `functions/` (Resend API, key in the Firebase secret `RESEND_API_KEY`). Logic lives in `functions/contact.js` with tests in `functions/contact.test.js`; run `npm test` in `functions/` after changing it. Keep the honeypot field `website`.
- **`/clients/`** is a placeholder with no auth. Gating is deferred; do not build auth unless asked.
- New pages copy the style of `thanks.html`: same fonts, top bar and footer.

## Check before committing

Serve the folder locally (`python3 -m http.server 8000`), open it, confirm no console errors, and confirm the JSON-LD still parses:

```sh
python3 -c "import re,json,sys;s=open('index.html').read();json.loads(re.search(r'<script type=\"application/ld\+json\">(.*?)</script>',s,re.S).group(1));print('JSON-LD ok')"
```

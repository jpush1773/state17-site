# Roadmap to 1.0

The site is live at https://state17consulting.com (0.1, 2026-11-03). This is the
path from "a page exists" to "the page and the socials bring in the right calls,
and we can see that they do."

Written for Jim and for any Claude Code session working on this repo. Load the
`state17-counsel` skill before writing anything a reader will see.

## What 1.0 means

Not a feature list. A state:

1. A stranger who fits one of the four situations can read the site, recognise
   themselves, and request a call without a single question left unanswered.
2. The site carries proof that is real: Jim's face and story, real testimonials,
   real decision notes, and a body of written point of view.
3. LinkedIn and the site say the same thing in the same voice, on a cadence Jim
   can sustain for a year without it feeling like a second job.
4. Every call request can be traced to where it came from, without a tracking
   script, so Jim knows what is working and what to stop.
5. The infrastructure is boring: secure, fast, accessible, monitored, and needs
   nothing from Jim between content changes.

ROI is measured in introductory calls requested by people who fit, and in
engagements that follow. Jim sets the targets; the roadmap only makes them
countable.

## Principles

- **Proof before polish.** A photo and one true testimonial beat any redesign.
- **One channel done well.** LinkedIn. Everything else points at the site.
- **Subtract first.** Every release should remove or shorten something too.
- **First-party measurement only.** No tracking scripts. The form, the inbox,
  Search Console and LinkedIn's own analytics are enough to see what works.
- **Nothing invented.** No made-up quotes, names, results or numbers. Ever.
- **No prices on the page.** Fees follow the question.

## Measurement without tracking

This is how ROI gets counted while keeping the no-analytics rule:

| Signal | Source | Cost |
|---|---|---|
| Call requests, and which page or post sent them | Hidden `source` field on the form filled from the referrer and any `?s=` tag on links Jim shares. Included in the email. | One small change to the form and function (0.2). |
| How people found Jim | Optional "How did you hear about me?" field on the form. | Same change. |
| Search impressions, clicks, queries | Google Search Console and Bing Webmaster Tools. DNS verification, no script. | Free, one-time setup. |
| Post reach and profile views | LinkedIn's native analytics. | Free. |
| Which calls became engagements | A one-sheet Jim keeps: date, source, fit (yes/no), outcome. | Five minutes a week. |

Revisit at 0.6 whether a cookieless, script-based counter is worth relaxing the
rule for. Default answer is no.

## Releases

Each release is small enough to ship in one or two sessions. Dates are targets,
not promises. Items marked **Jim** need something only Jim can supply.

### 0.2 Foundation (target: week of 2026-11-10)

The unglamorous things that make everything after this countable and trustworthy.

- [ ] Form: hidden `source` field (referrer + `?s=` tag) and optional "How did
      you hear about me?" field. Function includes both in the email. Tests updated.
- [ ] Function: short plain-text confirmation to the visitor from
      website@state17consulting.com ("Got it. I'll reply within two business days.").
- [ ] Google Search Console and Bing Webmaster Tools verified by DNS TXT. Submit
      the sitemap. **Jim** adds the TXT records at Squarespace.
- [ ] DMARC record (`p=none` with a reporting address) so Resend and Microsoft 365
      mail both stay deliverable. **Jim** adds it. Never touch MX or SPF.
- [x] Favicon set and a real Open Graph image (1200×630) so links look right on
      LinkedIn and in iMessage. Shipped 2026-11-04 with identity study 01
      (`assets/favicon.svg`, `assets/apple-touch-icon.png`, `assets/og.png`).
- [ ] Thanks page offers a scheduling link so a visitor can book the twenty minutes
      directly. Google Calendar appointment schedule (included in Workspace).
      **Jim** creates the schedule and sends the link.
- [ ] Disconnect the old Squarespace website from the domain and cancel its
      subscription. **Jim**, in Squarespace.
- [ ] `security.txt`, HSTS header, basic CSP. No functional change.

### 0.3 Proof (target: 2026-12-05)

Replace every placeholder with something true. This release matters more than
any other.

- [ ] **Jim**: a photo, and a 150-word bio that says where he has been and what
      he has actually run. The manufacturing operator story is the proof of
      judgement. Say it plainly.
- [ ] `/about/` page: photo, bio, how Jim works, what he will not do.
- [ ] **Jim**: two or three real testimonials with written permission. Name and
      role, or role and industry if the person prefers. Add a quote block back
      to a card only when there is a real quote for it. The placeholders were
      removed in 0.1.
- [ ] **Jim**: two decision notes from past work, anonymised with permission.
      Each one page: the situation, the question, what was tested, what was
      decided, what happened. No numbers Jim cannot stand behind.
- [ ] `/how-it-works/` page: the shape of an engagement week by week, what the
      client supplies, what they receive, what "done" looks like for each of the
      three services.
- [ ] Update JSON-LD (Person gets `image`, `description`, `sameAs` for LinkedIn;
      add `review` only if testimonials are real) and llms.txt.

### 0.4 Point of view (starts 2026-11-17, ongoing)

The thing that compounds. Short essays on the site, each the source for the
week's LinkedIn posts.

- [ ] `/notes/` section: index page plus one static HTML page per note. Same
      template as thanks.html. `Article` JSON-LD, RSS feed, sitemap entries.
- [ ] Cadence: one note every two weeks. 600 to 900 words. Written for one of
      the four situations. Title is the question the reader is asking.
- [ ] First six titles, drafted with the `state17-counsel` skill from Jim's notes
      and calls, confirmed by Jim before publishing. Candidates:
      - "The pitch was fine. The architecture wasn't."
      - "When a bill-of-materials problem is really a product problem."
      - "Not yet is a valid answer."
      - "What a pass line is and why we agree it before we start."
      - "Forty years of engineering knowledge, none of it searchable."
      - "Why I don't bill by the hour."
- [ ] Each note ends with the same single ask: request an introductory call.

### 0.5 LinkedIn, aligned (starts 2026-11-10, in parallel)

One channel, done consistently. Everything here uses the house voice.

- [ ] Profile rewrite so headline, about and experience match the site's
      positioning. Headline is the site's one-line description, not a job title.
      Banner is the same wordmark as the OG image. Featured: the site and the
      latest note.
- [ ] Company page for State 17 Consulting LLC with the same text and image, so
      the logo shows on Jim's experience entry. Posts go out as Jim, not the page.
- [ ] Cadence Jim can keep: two posts a week, each a smaller version of the
      current note or a single observation from the week. One useful comment a
      day on posts by a chosen list of twenty people in the audience: owners,
      investors, operators. Comments are the growth act. Posts are the proof.
- [ ] A posting checklist in the skill: situation first, one idea, no hashtag
      piles, no engagement bait, nothing about a client without written approval.
- [ ] Other networks: claim the handle, point the bio at the site, do not post.
      Revisit a newsletter at 1.0 when there are ten notes to seed it with.
- [ ] Inclusive by default: alt text on every image, captions on any video,
      plain language, examples beyond manufacturing, gender-neutral copy.

### 0.6 Trust and infrastructure (target: 2027-01-16)

Make the site boring in the best way.

- [ ] Accessibility audit against WCAG 2.2 AA. Keyboard, contrast, focus,
      reduced motion for the hero rotation, labels. Fix everything found.
- [ ] Performance budget: fonts self-hosted or `font-display: swap`, images
      sized, Lighthouse 95+ on mobile. Keep the page under a few hundred KB.
- [ ] Uptime check on the homepage and the contact function (a free external
      monitor hitting `/` and expecting 200, no script on the page).
- [ ] DMARC moves to `p=quarantine` once reports look clean.
- [ ] `/privacy/` page: one screen stating what the form collects, who receives
      it, and that there is no tracking. A trust signal, not boilerplate.
- [ ] Decide, in writing, whether to keep the no-script rule or add a cookieless
      counter. Default: keep the rule.
- [ ] Monthly: npm audit in `functions/`, Node runtime current, Resend key
      rotated annually.

### 0.7 The conversion loop (target: 2027-02-13)

Tighten the path from reader to call using what the first months taught.

- [ ] Rewrite the form questions from the language real visitors used in their
      submissions and calls.
- [ ] A short "Is this a fit?" block above the form: three sentences on who
      should and should not write in.
- [ ] Reply templates for Jim: fit, not a fit, not yet. Same voice. Sent by hand.
- [ ] Decision Review page for past clients, explaining the quarterly rhythm and
      the client workspace (still no auth until there is a client to need it).
- [ ] Review the one-sheet: which sources produced calls, which calls produced
      engagements. Stop what did not work. Do more of what did.

### 1.0 (target: 2027-03-13)

Ship when all five statements under "What 1.0 means" are true and Jim can show
a quarter of the one-sheet with sources filled in. Then:

- [ ] Write the 1.0 note: what the site is, how it was built, what it costs to
      run, what it brought in. Honest numbers or none.
- [ ] Decide on the newsletter and the client workspace from real demand.

## Weekly rhythm (from 0.4 on)

| When | What | Time |
|---|---|---|
| Monday | Write or finish the note in progress. | 90 min, every other week |
| Tue, Thu | One LinkedIn post, drawn from the note. | 15 min each |
| Daily | One useful comment on someone else's post. | 10 min |
| Friday | Update the one-sheet. Reply to anything open. | 15 min |
| Monthly | Search Console and LinkedIn analytics glance. Note one change to make. | 20 min |

## Decisions Jim owns

Recorded here so they are not re-asked.

| Decision | Status |
|---|---|
| Keep no-analytics rule through 0.6 | Default yes; revisit at 0.6 |
| LinkedIn is the only active channel until 1.0 | Proposed |
| Testimonials use real names only with written permission | Proposed |
| Decision notes are anonymised and approved by the client | Proposed |
| Scheduling via Google Calendar appointment schedule | Proposed |
| Newsletter deferred to 1.0 | Proposed |

## Not on the roadmap

Dark mode. A blog platform or CMS. A chatbot. Paid ads before 1.0. Video before
there are ten notes. Client login auth before there is a client who needs it.
Any page that exists to rank rather than to help.

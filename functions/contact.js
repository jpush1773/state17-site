/**
 * POST /api/contact
 *
 * Receives the introductory-call form from index.html, validates it,
 * drops honeypot submissions, and emails the request to Jim via Resend.
 *
 * Environment:
 *   RESEND_API_KEY  required. Stored as a Firebase secret
 *                   (firebase functions:secrets:set RESEND_API_KEY).
 *   CONTACT_FROM    optional. Sender address; the domain must be verified in
 *                   Resend. Defaults to "State 17 website <website@state17consulting.com>".
 */

const TO = "jim@state17consulting.com";
const DEFAULT_FROM = "State 17 website <website@state17consulting.com>";
const THANKS = "/thanks.html";

export const FIELDS = [
  { name: "name", label: "Name", max: 200 },
  { name: "email", label: "Email", max: 200 },
  { name: "business", label: "What the business does and your role", max: 2000 },
  { name: "decision", label: "The decision you're facing", max: 4000 },
  { name: "timing", label: "When it needs to be made", max: 200 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v) {
  if (Array.isArray(v)) v = v[0];
  return typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function errorPage(res, status, title, message) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} · State 17 Consulting</title><meta name="robots" content="noindex">
<style>
:root{color-scheme:light}
body{margin:0;background:#fff;color:#1B2420;font-family:"Source Serif 4",Georgia,"Times New Roman",serif;font-size:1.0625rem;line-height:1.6}
.wrap{max-width:40rem;margin:0 auto;padding:4rem 20px}
h1{font-family:"Archivo","Helvetica Neue",Arial,sans-serif;font-weight:800;font-size:2rem;line-height:1.05;margin:0 0 1rem;color:#1F7A5C}
a{color:#1F7A5C}
</style></head><body><div class="wrap"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>
<p><a href="/#contact">Back to the form</a></p></div></body></html>`;
  res.status(status).set("Content-Type", "text/html; charset=utf-8").send(html);
}

/**
 * Express-style handler. `env` is passed in so it can be tested without
 * touching process.env; `sendEmail` can be swapped out for tests.
 */
export async function handleContact(req, res, env, sendEmail = resendEmail) {
  if (req.method === "GET") return res.redirect(302, "/#contact");
  if (req.method !== "POST") return res.status(405).set("Allow", "POST").send("Method Not Allowed");

  const form = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real visitors never see this field. Bots that fill it are
  // dropped without sending anything. They get the thank-you page so the
  // rejection is not obvious to them.
  if (clean(form.website) !== "") return res.redirect(303, THANKS);

  const data = {};
  for (const f of FIELDS) {
    const v = clean(form[f.name]);
    if (!v) return errorPage(res, 400, "Something is missing", `Please fill in "${f.label}" and send the form again.`);
    if (v.length > f.max) return errorPage(res, 400, "That's a bit long", `"${f.label}" is limited to ${f.max} characters.`);
    data[f.name] = v;
  }
  if (!EMAIL_RE.test(data.email) || /[\n\r]/.test(data.email)) {
    return errorPage(res, 400, "Check the email address", "That email address does not look right. Please go back and correct it.");
  }

  if (!env.RESEND_API_KEY) {
    return errorPage(res, 500, "Not configured", "The contact form is not set up yet. Please email jim@state17consulting.com directly.");
  }

  const subjectName = data.name.replace(/\s+/g, " ").slice(0, 80);
  const text = [
    `Introductory call request from the website`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    ``,
    `What the business does and their role:`,
    data.business,
    ``,
    `The decision they're facing:`,
    data.decision,
    ``,
    `When it needs to be made:`,
    data.timing,
    ``,
    `Sent ${new Date().toISOString()}`,
  ].join("\n");

  const ok = await sendEmail(env, {
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: [TO],
    reply_to: data.email,
    subject: `Introductory call request: ${subjectName}`,
    text,
  });
  if (!ok) {
    return errorPage(res, 502, "Couldn't send", "The message could not be sent just now. Please try again or email jim@state17consulting.com.");
  }

  return res.redirect(303, THANKS);
}

async function resendEmail(env, message) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!r.ok) console.error("Resend error", r.status, await r.text().catch(() => ""));
    return r.ok;
  } catch (e) {
    console.error("Resend request failed", e);
    return false;
  }
}

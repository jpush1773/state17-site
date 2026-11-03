/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Receives the introductory-call form from index.html, validates it,
 * drops honeypot submissions, and emails the request to Jim via Resend.
 *
 * Environment variables (set in the Cloudflare Pages dashboard):
 *   RESEND_API_KEY  required. Resend API key.
 *   CONTACT_FROM    optional. Sender address; the domain must be verified in
 *                   Resend. Defaults to "State 17 website <website@state17consulting.com>".
 */

const TO = "jim@state17consulting.com";
const DEFAULT_FROM = "State 17 website <website@state17consulting.com>";
const THANKS = "/thanks.html";

const FIELDS = [
  { name: "name", label: "Name", max: 200 },
  { name: "email", label: "Email", max: 200 },
  { name: "business", label: "What the business does and your role", max: 2000 },
  { name: "decision", label: "The decision you're facing", max: 4000 },
  { name: "timing", label: "When it needs to be made", max: 200 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v) {
  return typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function errorPage(status, title, message) {
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
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return errorPage(400, "That didn't come through", "The form data could not be read. Please go back and try again.");
  }

  // Honeypot: real visitors never see this field. Bots that fill it are
  // dropped without sending anything. They get the thank-you page so the
  // rejection is not obvious to them.
  if (clean(form.get("website")) !== "") {
    return Response.redirect(new URL(THANKS, request.url).toString(), 303);
  }

  const data = {};
  for (const f of FIELDS) {
    const v = clean(form.get(f.name));
    if (!v) return errorPage(400, "Something is missing", `Please fill in "${f.label}" and send the form again.`);
    if (v.length > f.max) return errorPage(400, "That's a bit long", `"${f.label}" is limited to ${f.max} characters.`);
    data[f.name] = v;
  }
  if (!EMAIL_RE.test(data.email) || /[\n\r]/.test(data.email)) {
    return errorPage(400, "Check the email address", "That email address does not look right. Please go back and correct it.");
  }

  if (!env.RESEND_API_KEY) {
    return errorPage(500, "Not configured", "The contact form is not set up yet. Please email jim@state17consulting.com directly.");
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

  let res;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [TO],
        reply_to: data.email,
        subject: `Introductory call request: ${subjectName}`,
        text,
      }),
    });
  } catch {
    return errorPage(502, "Couldn't send", "The message could not be sent just now. Please try again or email jim@state17consulting.com.");
  }

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return errorPage(502, "Couldn't send", "The message could not be sent just now. Please try again or email jim@state17consulting.com.");
  }

  return Response.redirect(new URL(THANKS, request.url).toString(), 303);
}

// A GET on this path just goes back to the form.
export async function onRequestGet({ request }) {
  return Response.redirect(new URL("/#contact", request.url).toString(), 302);
}

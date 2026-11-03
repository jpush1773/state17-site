import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "./contact.js";

function mockRes() {
  const r = { statusCode: 200, headers: {}, body: null, location: null };
  r.status = (c) => { r.statusCode = c; return r; };
  r.set = (k, v) => { r.headers[k] = v; return r; };
  r.send = (b) => { r.body = b; return r; };
  r.redirect = (c, l) => { r.statusCode = c; r.location = l; return r; };
  return r;
}
const good = { name: "Ada", email: "ada@example.com", business: "Widgets, CEO", decision: "Buy a competitor", timing: "Q1" };
const env = { RESEND_API_KEY: "re_test" };
const run = (body, e = env) => {
  const sent = [];
  const res = mockRes();
  return handleContact({ method: "POST", body }, res, e, async (_, m) => { sent.push(m); return true; }).then(() => ({ res, sent }));
};

test("valid submission sends and redirects", async () => {
  const { res, sent } = await run(good);
  assert.equal(res.statusCode, 303); assert.equal(res.location, "/thanks.html");
  assert.equal(sent.length, 1); assert.deepEqual(sent[0].to, ["jim@state17consulting.com"]); assert.equal(sent[0].reply_to, good.email);
});
test("honeypot is dropped silently", async () => {
  const { res, sent } = await run({ ...good, website: "spam" });
  assert.equal(res.statusCode, 303); assert.equal(sent.length, 0);
});
test("bad email rejected", async () => { assert.equal((await run({ ...good, email: "nope" })).res.statusCode, 400); });
test("missing field rejected", async () => { assert.equal((await run({ ...good, decision: "" })).res.statusCode, 400); });
test("no api key is a 500", async () => { assert.equal((await run(good, {})).res.statusCode, 500); });
test("GET redirects to form", async () => {
  const res = mockRes(); await handleContact({ method: "GET" }, res, env); assert.equal(res.statusCode, 302); assert.equal(res.location, "/#contact");
});

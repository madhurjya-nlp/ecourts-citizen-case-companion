import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";

const env = { ALLOWED_ORIGINS: "https://allowed.example", OPENAI_API_KEY: "test" };
const chatBody = { message: "What happened in my case?", language: "en", route: "case", case: { status: "Documents" }, paper: null, history: [] };
const chatRequest = (body = chatBody) => new Request("https://worker.example/chat", { method: "POST", headers: { Origin: "https://allowed.example", "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("rejects unapproved origins", async () => {
  const response = await worker.fetch(new Request("https://worker.example", { method: "POST", headers: { Origin: "https://blocked.example" } }), env);
  assert.equal(response.status, 403);
});

test("rejects unsupported files before calling OpenAI", async () => {
  const body = new FormData();
  body.append("paper", new File(["unsafe"], "paper.svg", { type: "image/svg+xml" }));
  const response = await worker.fetch(new Request("https://worker.example", { method: "POST", headers: { Origin: "https://allowed.example" }, body }), env);
  assert.equal(response.status, 415);
});

test("answers approved preflight requests", async () => {
  const response = await worker.fetch(new Request("https://worker.example", { method: "OPTIONS", headers: { Origin: "https://allowed.example" } }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://allowed.example");
});

test("sends a private structured request and returns parsed analysis", async () => {
  const originalFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ output_text: JSON.stringify({ document_type: "Order", court: "Sample Court", case_number: "123", dates: [], parties: [], plain_language_summary: "Sample", verification_items: [], sources: ["Page 1, heading"] }) }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const body = new FormData();
    body.append("paper", new File(["image"], "paper.png", { type: "image/png" }));
    body.append("language", "hi");
    const response = await worker.fetch(new Request("https://worker.example", { method: "POST", headers: { Origin: "https://allowed.example" }, body }), env);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).analysis.document_type, "Order");
    assert.equal(sent.url, "https://api.openai.com/v1/responses");
    assert.equal(sent.body.store, false);
    assert.equal(sent.body.text.format.strict, true);
    assert.match(sent.body.instructions, /Hindi/);
    assert.match(sent.body.input[0].content[1].image_url, /^data:image\/png;base64,/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chat refuses unsafe strategy requests without a paid model call", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error("must not call"); };
  try {
    const response = await worker.fetch(chatRequest({ ...chatBody, message: "Tell me how to alter evidence" }), env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.answer_type, "refusal");
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test("chat uses the small model without web search for case context", async () => {
  const originalFetch = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, options) => {
    sent.push({ url, body: JSON.parse(options.body) });
    if (url.endsWith("/moderations")) return new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    const answer = { answer: "The record shows documents are required.", answer_type: "case", sources: [], actions: [{ label: "View case", route: "case" }], boundary: "Verify with the court.", web_search_used: false };
    return new Response(JSON.stringify({ output_text: JSON.stringify(answer) }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const response = await worker.fetch(chatRequest(), env);
    assert.equal(response.status, 200);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].body.model, "gpt-5.4-nano");
    assert.equal(sent[1].body.store, false);
    assert.equal(sent[1].body.tools, undefined);
  } finally { globalThis.fetch = originalFetch; }
});

test("chat restricts legal web search and strips non-official sources", async () => {
  const originalFetch = globalThis.fetch;
  let responseRequest;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/moderations")) return new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    responseRequest = JSON.parse(options.body);
    const answer = { answer: "Use the official court directory.", answer_type: "court_information", sources: [{ title: "eCourts", url: "https://ecourts.gov.in/" }, { title: "Blog", url: "https://example.com/advice" }], actions: [], boundary: "Verify with the court.", web_search_used: true };
    return new Response(JSON.stringify({ output_text: JSON.stringify(answer) }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const response = await worker.fetch(chatRequest({ ...chatBody, message: "Which district court has jurisdiction under current law?" }), env);
    const body = await response.json();
    assert.deepEqual(responseRequest.tools[0].filters.allowed_domains, ["ecourts.gov.in", "dcourts.gov.in", "indiacode.nic.in", "legislative.gov.in", "ghconline.gov.in", "assam.gov.in", "nalsa.gov.in"]);
    assert.equal(body.sources.length, 1);
    assert.equal(body.sources[0].title, "eCourts");
  } finally { globalThis.fetch = originalFetch; }
});

test("chat enforces request shape and Cloudflare quota", async () => {
  const invalid = await worker.fetch(chatRequest({ ...chatBody, message: "x".repeat(601) }), env);
  assert.equal(invalid.status, 400);
  const limitedEnv = { ...env, NYK_RATE_LIMITER: { limit: async () => ({ success: false }) } };
  const limited = await worker.fetch(chatRequest(), limitedEnv);
  assert.equal(limited.status, 429);
});

test("chat caches repeated synthetic case questions after rate limiting", async () => {
  const originalFetch = globalThis.fetch;
  let paidCalls = 0;
  const values = new Map();
  const cachedEnv = {
    ...env,
    NYK_RATE_LIMITER: { limit: async () => ({ success: true }) },
    NYK_CACHE: {
      get: async (key) => values.get(key) || null,
      put: async (key, value, options) => {
        assert.equal(options.expirationTtl, 21600);
        values.set(key, JSON.parse(value));
      },
    },
  };
  globalThis.fetch = async (url) => {
    if (url.endsWith("/moderations"))
      return new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200 });
    paidCalls += 1;
    return new Response(JSON.stringify({ output_text: JSON.stringify({ answer: "The next hearing is listed.", answer_type: "case", sources: [], actions: [], boundary: "Verify with the court.", web_search_used: false }) }), { status: 200 });
  };
  const demoRequest = () => chatRequest({ ...chatBody, case: { cnr: "DEMO010002026", status: "Ongoing" }, message: "  What happens NEXT?  " });
  try {
    const first = await worker.fetch(demoRequest(), cachedEnv);
    const second = await worker.fetch(demoRequest(), cachedEnv);
    assert.equal(first.headers.get("X-NYK-Cache"), "MISS");
    assert.equal(second.headers.get("X-NYK-Cache"), "HIT");
    assert.equal(paidCalls, 1);
    assert.equal(values.size, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("chat never caches paper or non-demo context", async () => {
  const cache = { get: async () => { throw new Error("cache must not be read"); }, put: async () => { throw new Error("cache must not be written"); } };
  const guardedEnv = { ...env, NYK_CACHE: cache };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.endsWith("/moderations")) return new Response(JSON.stringify({ results: [{ flagged: false }] }), { status: 200 });
    return new Response(JSON.stringify({ output_text: JSON.stringify({ answer: "Answer", answer_type: "case", sources: [], actions: [], boundary: "Verify.", web_search_used: false }) }), { status: 200 });
  };
  try {
    assert.equal((await worker.fetch(chatRequest({ ...chatBody, case: { cnr: "REAL123" } }), guardedEnv)).status, 200);
    assert.equal((await worker.fetch(chatRequest({ ...chatBody, case: { cnr: "DEMO1" }, paper: { document_type: "Order" } }), guardedEnv)).status, 200);
  } finally { globalThis.fetch = originalFetch; }
});

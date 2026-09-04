import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";

const env = { ALLOWED_ORIGINS: "https://allowed.example", OPENAI_API_KEY: "test" };

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

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const LANGUAGE_NAMES = { en: "English", as: "Assamese", hi: "Hindi" };

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["document_type", "court", "case_number", "dates", "parties", "plain_language_summary", "verification_items", "sources"],
  properties: {
    document_type: { type: "string" },
    court: { type: "string" },
    case_number: { type: "string" },
    dates: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "value", "confidence"], properties: { label: { type: "string" }, value: { type: "string" }, confidence: { type: "string", enum: ["high", "medium", "low"] } } } },
    parties: { type: "array", items: { type: "object", additionalProperties: false, required: ["role", "name", "confidence"], properties: { role: { type: "string" }, name: { type: "string" }, confidence: { type: "string", enum: ["high", "medium", "low"] } } } },
    plain_language_summary: { type: "string" },
    verification_items: { type: "array", items: { type: "string" } },
    sources: { type: "array", items: { type: "string" } }
  }
};

function cors(origin, allowed) {
  return { "Access-Control-Allow-Origin": allowed.has(origin) ? origin : "null", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" };
}
function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
function bytesToBase64(bytes) {
  let output = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) output += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(output);
}
function contentFor(file, base64) {
  const dataUrl = `data:${file.type};base64,${base64}`;
  return file.type === "application/pdf"
    ? { type: "input_file", filename: file.name || "court-paper.pdf", file_data: dataUrl }
    : { type: "input_image", image_url: dataUrl, detail: "high" };
}
function outputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  for (const item of payload.output || []) for (const part of item.content || []) if (part.type === "output_text") return part.text;
  return "";
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = new Set(String(env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean));
    const headers = cors(origin, allowed);
    if (request.method === "OPTIONS") return allowed.has(origin) ? new Response(null, { status: 204, headers }) : json({ error: "Origin not allowed" }, 403, headers);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
    if (!allowed.has(origin)) return json({ error: "Origin not allowed" }, 403, headers);
    if (!env.OPENAI_API_KEY) return json({ error: "Analysis service is not configured" }, 503, headers);
    let form;
    try { form = await request.formData(); } catch { return json({ error: "Invalid upload" }, 400, headers); }
    const file = form.get("paper");
    const language = LANGUAGE_NAMES[form.get("language")] || LANGUAGE_NAMES.en;
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) return json({ error: "Use a PDF, JPG or PNG file" }, 415, headers);
    if (!file.size || file.size > MAX_BYTES) return json({ error: "File must be 10 MB or smaller" }, 413, headers);
    const base64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
    let apiResponse;
    try {
      apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-5.6-luna",
          store: false,
          max_output_tokens: 1800,
          instructions: `You explain Indian court papers to citizens. Extract only what is visible. Never infer legal advice, guilt, rights, deadlines, or mandatory actions. Use "Not found" when absent. Mark uncertain, handwritten, faded, cut-off, or ambiguous values low confidence. Write the explanation in ${language}. Source references must identify a page and visible section or region.`,
          input: [{ role: "user", content: [{ type: "input_text", text: "Analyse this court paper and return the structured citizen-facing record." }, contentFor(file, base64)] }],
          text: { format: { type: "json_schema", name: "court_paper_analysis", strict: true, schema } }
        })
      });
    } catch {
      return json({ error: "Analysis service is temporarily unavailable" }, 502, headers);
    }
    let payload;
    try { payload = await apiResponse.json(); }
    catch { return json({ error: "Analysis service returned an invalid response" }, 502, headers); }
    if (!apiResponse.ok) return json({ error: "OpenAI analysis failed" }, 502, headers);
    try { return json({ analysis: JSON.parse(outputText(payload)) }, 200, headers); }
    catch { return json({ error: "Analysis returned an invalid result" }, 502, headers); }
  }
};

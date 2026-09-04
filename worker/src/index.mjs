const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const LANGUAGE_NAMES = { en: "English", as: "Assamese", hi: "Hindi" };
const OFFICIAL_DOMAINS = ["ecourts.gov.in", "dcourts.gov.in", "indiacode.nic.in", "legislative.gov.in", "ghconline.gov.in", "assam.gov.in", "nalsa.gov.in"];
const chatSchema = {
  type: "object", additionalProperties: false,
  required: ["answer", "answer_type", "sources", "actions", "boundary", "web_search_used"],
  properties: {
    answer: { type: "string" },
    answer_type: { type: "string", enum: ["case", "paper", "court_information", "legal_reference", "refusal", "limitation"] },
    sources: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["title", "url"], properties: { title: { type: "string" }, url: { type: "string" } } } },
    actions: { type: "array", maxItems: 3, items: { type: "object", additionalProperties: false, required: ["label", "route"], properties: { label: { type: "string" }, route: { type: "string" } } } },
    boundary: { type: "string" }, web_search_used: { type: "boolean" }
  }
};

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
function officialUrl(url) {
  try { const host = new URL(url).hostname; return OFFICIAL_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)); }
  catch { return false; }
}
function needsWebSearch(message) {
  return /\b(current|latest|today|act|section|article|constitution|jurisdiction|which court|legal aid|district court|high court|local court|law)\b|वर्तमान|कानून|धारा|संविधान|अदालत|আইন|সংবিধান|আদালত/i.test(message);
}
function localRefusal(message, language) {
  const blocked = /system prompt|ignore (all|previous)|reveal instructions|alter evidence|destroy evidence|coach (a )?witness|evade (the )?police|predict (the )?(case|outcome)|guarantee (a )?(win|bail)/i.test(message);
  if (!blocked) return null;
  const answers = {
    English: "I cannot help with that request. I can explain the available court record, help locate an official service, or provide general court information.",
    Assamese: "এই অনুৰোধত মই সহায় কৰিব নোৱাৰোঁ। উপলব্ধ আদালতৰ ৰেকৰ্ড বুজোৱা, চৰকাৰী সেৱা বিচৰা বা সাধাৰণ আদালত তথ্য দিয়াত সহায় কৰিব পাৰোঁ।",
    Hindi: "मैं इस अनुरोध में सहायता नहीं कर सकता। मैं उपलब्ध अदालत रिकॉर्ड समझा सकता हूँ, आधिकारिक सेवा खोज सकता हूँ या सामान्य अदालती जानकारी दे सकता हूँ।"
  };
  return { answer: answers[language], answer_type: "refusal", sources: [], actions: [{ label: "Open Help", route: "help" }], boundary: "AI assistance, not a court record or legal advice.", web_search_used: false };
}
function validateChatBody(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const allowed = new Set(["message", "language", "route", "case", "paper", "history"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) return null;
  if (typeof value.message !== "string" || !value.message.trim() || value.message.length > 600) return null;
  if (!Object.hasOwn(LANGUAGE_NAMES, value.language) || typeof value.route !== "string" || value.route.length > 40) return null;
  if (value.case !== null && (typeof value.case !== "object" || JSON.stringify(value.case).length > 1500)) return null;
  if (value.paper !== null && (typeof value.paper !== "object" || JSON.stringify(value.paper).length > 6000)) return null;
  if (!Array.isArray(value.history) || value.history.length > 4 || value.history.some((item) => !item || !["user", "assistant"].includes(item.role) || typeof item.text !== "string" || item.text.length > 700)) return null;
  return value;
}
async function handleChat(request, env, headers) {
  let body;
  try { body = validateChatBody(await request.json()); } catch { body = null; }
  if (!body) return json({ error: "Invalid chat request" }, 400, headers);
  if (env.NYK_RATE_LIMITER) {
    const key = request.headers.get("CF-Connecting-IP") || "anonymous";
    const { success } = await env.NYK_RATE_LIMITER.limit({ key });
    if (!success) return json({ error: "NYK is at its short-term request limit. Please try again later." }, 429, headers);
  }
  const language = LANGUAGE_NAMES[body.language];
  const refused = localRefusal(body.message, language);
  if (refused) return json(refused, 200, headers);
  let moderation;
  try {
    moderation = await fetch("https://api.openai.com/v1/moderations", { method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "omni-moderation-latest", input: body.message }) });
    const moderationBody = await moderation.json();
    if (!moderation.ok) throw new Error();
    if (moderationBody.results?.[0]?.flagged) return json({ ...localRefusal("alter evidence", language), answer_type: "refusal" }, 200, headers);
  } catch { return json({ error: "Safety check is temporarily unavailable" }, 502, headers); }
  const useSearch = needsWebSearch(body.message);
  const compactContext = JSON.stringify({ route: body.route, case: body.case, paper: body.paper, history: body.history });
  const requestBody = {
    model: env.OPENAI_CHAT_MODEL || "gpt-5.4-nano", store: false, max_output_tokens: 700, reasoning: { effort: "none" },
    instructions: `You are NYK AI, a restricted citizen assistance layer for Indian courts. Answer in ${language}. Use only supplied case/document context and, when enabled, official web results. Explain and route; never give personalised legal advice, strategy, outcome predictions, or unsupported mandatory directions. Distinguish official facts from AI explanation. If evidence is insufficient, say so. Sources must be official URLs returned by search or relevant official service links. Keep the answer under 350 words.`,
    input: [{ role: "user", content: [{ type: "input_text", text: `Context: ${compactContext}\n\nCitizen question: ${body.message}` }] }],
    text: { format: { type: "json_schema", name: "nyk_answer", strict: true, schema: chatSchema } }
  };
  if (useSearch) requestBody.tools = [{ type: "web_search", search_context_size: "low", filters: { allowed_domains: OFFICIAL_DOMAINS } }];
  let response;
  try { response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(requestBody) }); }
  catch { return json({ error: "NYK is temporarily unavailable" }, 502, headers); }
  let payload;
  try { payload = await response.json(); } catch { return json({ error: "NYK returned an invalid response" }, 502, headers); }
  if (!response.ok) return json({ error: "NYK could not complete this request" }, 502, headers);
  try {
    const result = JSON.parse(outputText(payload));
    result.sources = (result.sources || []).filter((source) => officialUrl(source.url)).slice(0, 4);
    result.web_search_used = useSearch;
    return json(result, 200, headers);
  } catch { return json({ error: "NYK returned an invalid answer" }, 502, headers); }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    const origin = request.headers.get("Origin") || "";
    const allowed = new Set(String(env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean));
    const headers = cors(origin, allowed);
    if (request.method === "OPTIONS") return allowed.has(origin) ? new Response(null, { status: 204, headers }) : json({ error: "Origin not allowed" }, 403, headers);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
    if (!allowed.has(origin)) return json({ error: "Origin not allowed" }, 403, headers);
    if (!env.OPENAI_API_KEY) return json({ error: "Analysis service is not configured" }, 503, headers);
    if (path === "/chat") return handleChat(request, env, headers);
    if (path !== "/") return json({ error: "Not found" }, 404, headers);
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

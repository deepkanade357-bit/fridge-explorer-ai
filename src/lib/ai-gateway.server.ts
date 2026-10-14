// Server-only helpers for calling Lovable AI (Responses API) with raw fetch + SSE.
const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
export const CHAT_MODEL = "openai/gpt-6-astra";

export function getApiKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return key;
}

export async function callResponses(request: Request, body: Record<string, unknown>) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Lovable-API-Key": getApiKey(),
    "X-Lovable-AIG-SDK": "fetch",
  });
  const runId = request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim();
  if (runId) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
  return fetch(GATEWAY_URL, {
    method: "POST",
    signal: request.signal,
    headers,
    body: JSON.stringify({
      model: CHAT_MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      ...body,
    }),
  });
}

export function aigHeaders(upstream: Headers, init?: HeadersInit) {
  const h = new Headers(init);
  const exposed: string[] = [];
  upstream.forEach((v, k) => {
    if (k.toLowerCase().startsWith("x-lovable-aig-")) {
      h.set(k, v);
      exposed.push(k);
    }
  });
  if (exposed.length) h.set("Access-Control-Expose-Headers", exposed.join(", "));
  return h;
}

export async function errorFromUpstream(res: Response) {
  let message = "";
  try {
    const j = await res.json();
    message = j?.error?.message || j?.message || "";
  } catch {
    /* ignore */
  }
  const code =
    res.status === 429 ? "rate_limit" : res.status === 402 ? "credits" : res.status === 403 ? "denied" : res.status === 400 ? "bad_request" : "upstream";
  return Response.json({ error: code, message }, { status: res.status, headers: aigHeaders(res.headers) });
}

/** Consume a Responses SSE stream server-side and return the final output text. */
export async function collectText(res: Response): Promise<{ text: string; refused: boolean }> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let refused = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "response.refusal.delta") refused = true;
          else if (ev.type === "error" || ev.type === "response.failed")
            throw new Error(ev.error?.message || ev.response?.error?.message || "AI request failed");
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
  return { text, refused };
}

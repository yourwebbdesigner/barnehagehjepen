// Cloudflare Pages Function – backend-proxy for Anthropic API
// Plassering: functions/api/ai.js  →  tilgjengelig på /api/ai

const ALLOWED_ORIGINS = [
  "https://barnehagehjelpen.pages.dev",
  "https://barnehagehjelpen.no",
  "https://www.barnehagehjelpen.no",
];

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return json({ error: "Bruk POST" }, 405, request);
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Ugyldig JSON i forespørselen" }, 400, request);
    }

    const { prompt, system, max_tokens: reqTokens, image } = body || {};
    if (typeof prompt !== "string") return json({ error: "Mangler 'prompt' (string)" }, 400, request);
    if (prompt.length < 5) return json({ error: "Forespørselen er for kort" }, 400, request);
    if (prompt.length > 20000) return json({ error: "Forespørselen er for lang (maks 20000 tegn)" }, 400, request);
    const maxTokens = Math.min(Math.max(parseInt(reqTokens) || 1800, 500), 4096);

    // Bygg meldingsinnhold – støtter valgfritt bilde (base64) for vision/OCR
    let messageContent;
    if (image && typeof image.data === "string" && typeof image.media_type === "string") {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const mediaType = allowedTypes.includes(image.media_type) ? image.media_type : "image/jpeg";
      messageContent = [
        { type: "image", source: { type: "base64", media_type: mediaType, data: image.data } },
        { type: "text", text: prompt },
      ];
    } else {
      messageContent = prompt;
    }

    const apiKey = (env.ANTHROPIC_API_KEY || "").replace(/[\s\r\n\t"']/g, "");
    if (!apiKey) {
      return json({ error: "ANTHROPIC_API_KEY mangler i miljøvariabler" }, 500, request);
    }

    // Bygg API-payload – bruker system-felt + prompt caching for raskere og billigere gjentatte kall
    const apiPayload = {
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: messageContent }],
    };
    if (system && typeof system === "string" && system.length > 10) {
      apiPayload.system = [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];
    }

    let anthropicResponse;
    try {
      anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
        body: JSON.stringify(apiPayload),
        signal: AbortSignal.timeout(25000),
      });
    } catch (e) {
      if (e.name === "TimeoutError" || e.name === "AbortError") {
        return json({ error: "AI brukte for lang tid – prøv igjen" }, 504, request);
      }
      console.error("[AI] Nettverksfeil:", e.message);
      return json({ error: "AI-tjenesten er utilgjengelig" }, 502, request);
    }

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text().catch(() => "");
      console.error(`[AI] Anthropic HTTP ${anthropicResponse.status}: ${errText.slice(0, 300)}`);
      if (anthropicResponse.status === 429) return json({ error: "AI-tjenesten er overbelastet, prøv igjen" }, 429, request);
      return json({ error: "Kunne ikke generere innhold" }, 502, request);
    }

    const data = await anthropicResponse.json();
    const tekst = Array.isArray(data.content)
      ? data.content.map(b => b.text || "").join("\n").trim()
      : "";

    // For vision-forespørsler (bilde vedlagt) er tom tekst et gyldig svar – dokumentet hadde ingen lesbar tekst
    if (!tekst && !image) {
      return json({ error: "AI ga tomt svar" }, 502, request);
    }

    return json({ text: tekst }, 200, request);

  } catch (e) {
    console.error("[AI] Uventet feil:", e);
    return json({ error: "Intern serverfeil" }, 500, request);
  }
}

// ═══════════════════════════════════════════════════════════════
//  Backend-endpoint for AI-generering
//
//  Deploy som:
//    Vercel:  legg filen i /api/ai.js
//    Netlify: legg filen i /netlify/functions/ai.js (med små justeringer)
//
//  Krever miljøvariabel:
//    ANTHROPIC_API_KEY = sk-ant-...   (hent fra console.anthropic.com)
//
//  Frontend må deretter sette:
//    window.__BH_AI_ENDPOINT = "/api/ai";
//  før Barnehagehjelpen-komponenten monteres. F.eks. i index.html før React-init.
// ═══════════════════════════════════════════════════════════════

// Enkel in-memory rate limit (IP -> [timestamps])
// MERK: Dette er per-instans. På Vercel kan flere instanser kjøre parallelt,
// så for ekte rate limiting bør du bruke Upstash Redis eller Vercel KV.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;  // 1 minutt
const RATE_LIMIT_MAX = 10;             // 10 forespørsler per minutt per IP

function rateLimitOk(ip) {
  const now = Date.now();
  const liste = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (liste.length >= RATE_LIMIT_MAX) return false;
  liste.push(now);
  rateLimitMap.set(ip, liste);
  // Rydd opp gamle entries hvis kartet blir stort
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap) {
      if (v.every(t => now - t > RATE_LIMIT_WINDOW_MS)) rateLimitMap.delete(k);
    }
  }
  return true;
}

export default async function handler(req, res) {
  // CORS: tillat din egen domene. Bytt ut * med eksakt domene i produksjon.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Bruk POST" });

  try {
    // Hent IP for rate limiting
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "ukjent";
    if (!rateLimitOk(ip)) {
      console.warn(`[AI] Rate limit: ${ip}`);
      return res.status(429).json({ error: "For mange forespørsler. Vent ett minutt." });
    }

    // Valider input
    const { prompt } = req.body || {};
    if (typeof prompt !== "string") {
      return res.status(400).json({ error: "Mangler 'prompt' (string)" });
    }
    if (prompt.length < 10) {
      return res.status(400).json({ error: "Forespørselen er for kort" });
    }
    if (prompt.length > 8000) {
      return res.status(400).json({ error: "Forespørselen er for lang (maks 8000 tegn)" });
    }

    // Sjekk API-nøkkel
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[AI] ANTHROPIC_API_KEY mangler i miljøvariabler");
      return res.status(500).json({ error: "Server-konfigurasjonsfeil" });
    }

    // Ring Anthropic med timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28_000);  // litt under Vercels 30s grense

    let anthropicResponse;
    try {
      anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === "AbortError") {
        console.warn("[AI] Timeout mot Anthropic");
        return res.status(504).json({ error: "AI brukte for lang tid" });
      }
      console.error("[AI] Nettverksfeil mot Anthropic:", e.message);
      return res.status(502).json({ error: "AI-tjenesten er utilgjengelig" });
    }
    clearTimeout(timeoutId);

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text().catch(() => "");
      console.error(`[AI] Anthropic HTTP ${anthropicResponse.status}: ${errText.slice(0, 300)}`);
      // Gi nyttig kode tilbake til klienten uten å lekke detaljer
      if (anthropicResponse.status === 429) return res.status(429).json({ error: "AI-tjenesten er overbelastet, prøv igjen" });
      if (anthropicResponse.status >= 500) return res.status(502).json({ error: "AI-tjeneste-feil" });
      return res.status(502).json({ error: "Kunne ikke generere innhold" });
    }

    const data = await anthropicResponse.json();
    const tekst = Array.isArray(data.content)
      ? data.content.map(b => b.text || "").join("\n").trim()
      : "";

    if (!tekst || tekst.length < 20) {
      console.warn("[AI] Tomt svar fra Anthropic");
      return res.status(502).json({ error: "AI ga tomt svar" });
    }

    // Suksess
    console.log(`[AI] OK (${tekst.length} tegn, ip=${ip})`);
    return res.status(200).json({ text: tekst });

  } catch (e) {
    // Catch-all – aldri la serveren krasje stille
    console.error("[AI] Uventet feil:", e);
    return res.status(500).json({ error: "Intern serverfeil" });
  }
}

// ─────────────────────────────────────────────────────────────────
//  DEPLOYMENT-OPPSKRIFT (Vercel – enklest)
//
//  1. Opprett konto på vercel.com
//  2. Installer: npm i -g vercel
//  3. I prosjektmappen: legg denne filen i `api/ai.js`
//  4. Sett env: `vercel env add ANTHROPIC_API_KEY` (lim inn nøkkelen)
//  5. Deploy: `vercel --prod`
//  6. I frontend: legg dette i <head> før React laster:
//       <script>window.__BH_AI_ENDPOINT = "/api/ai";</script>
//
//  Kostnader:
//    • Vercel hobby-plan: gratis, mer enn nok for de fleste
//    • Anthropic API: typisk 0,01-0,05 kr per generering
// ─────────────────────────────────────────────────────────────────

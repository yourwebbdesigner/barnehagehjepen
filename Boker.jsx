import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { sanitizeForPrompt } from './data/ai-data.js';

const CSS = `
  .bk-fade { animation: bk-fadeIn 0.3s ease both; }
  @keyframes bk-fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .bk-kort {
    background: var(--c-card);
    border: 1.5px solid var(--c-divider);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: 'Nunito', sans-serif;
    transition: all 0.18s;
  }
  .bk-kort:hover {
    border-color: #4178bd;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(44,91,142,0.12);
  }

  .bk-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
  }

  .bk-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .bk-btn:disabled { opacity: 0.6; cursor: default; }
  .bk-btn-hoved { background: linear-gradient(135deg,#2c5b8e,#4178bd); color:#fff; box-shadow:0 3px 10px rgba(44,91,142,0.3); }
  .bk-btn-hoved:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 5px 16px rgba(44,91,142,0.35); }
  .bk-btn-sek { background:var(--c-lg2); color:var(--c-g); }
  .bk-btn-sek:hover:not(:disabled) { filter:brightness(0.92); }
  .bk-btn-fare { background:#fdecea; color:#c62828; }
  .bk-btn-fare:hover:not(:disabled) { background:#f8d7d7; }

  .bk-input {
    width: 100%;
    padding: 11px 13px;
    border: 1.5px solid var(--c-input-border);
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    color: var(--c-t);
    background: var(--c-input-bg);
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
    margin-bottom: 12px;
  }
  .bk-input:focus { border-color:#4178bd; background:var(--c-w); }

  .bk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
  @media (max-width: 520px) { .bk-grid { grid-template-columns: 1fr; } }

  .bk-tom {
    text-align: center;
    padding: 48px 16px;
    color: #8898ad;
    font-family: 'Nunito', sans-serif;
  }

  [data-theme="dark"] .bk-kort {
    background: var(--c-card);
    border-color: var(--c-divider);
    color: var(--c-t);
  }
  [data-theme="dark"] .bk-kort:hover { border-color: var(--c-lg); }
  [data-theme="dark"] .bk-btn-sek { background: var(--c-lg2); color: var(--c-g); }
  [data-theme="dark"] .bk-btn-sek:hover:not(:disabled) { background: var(--c-input-bg); }
  [data-theme="dark"] .bk-btn-fare { background: #2a0808; color: #ff9090; }
  [data-theme="dark"] .bk-btn-fare:hover:not(:disabled) { background: #3a0e0e; }
  [data-theme="dark"] .bk-input {
    background: var(--c-input-bg);
    color: var(--c-input-t);
    border-color: var(--c-input-border);
  }
  [data-theme="dark"] .bk-input:focus { background: var(--c-input-bg); border-color: var(--c-lg); }
  [data-theme="dark"] .bk-tom { color: var(--c-gr); }
  [data-theme="dark"] [style*="background:linear-gradient(135deg,#f0f7ff"],
  [data-theme="dark"] [style*="background: linear-gradient(135deg,#f0f7ff"] {
    background: var(--c-lg2) !important;
  }
  [data-theme="dark"] [style*="background:#f8e7f6"],
  [data-theme="dark"] [style*="background: #f8e7f6"] {
    background: #2a0a2a !important; color: #d07ac8 !important;
  }
  [data-theme="dark"] [style*="background:#d8e6f5"],
  [data-theme="dark"] [style*="background: #d8e6f5"] {
    background: #0e1e38 !important; color: #90b4d8 !important;
  }
  [data-theme="dark"] [style*="background:#fdebd0"],
  [data-theme="dark"] [style*="background: #fdebd0"] {
    background: #2a1500 !important; color: #ffba7a !important;
  }
`;

const KATEGORIER = [
  { id:"samlingsstund", navn:"Samlingsstund", ikon:"🎭", farge:"#1f4068", lys:"#d8e6f5" },
  { id:"vennskap",      navn:"Vennskap",      ikon:"🤝", farge:"#2d6a4f", lys:"#d8f3dc" },
  { id:"følelser",      navn:"Følelser",      ikon:"💛", farge:"#e67e22", lys:"#fdebd0" },
  { id:"natur",         navn:"Natur",         ikon:"🌿", farge:"#00695c", lys:"#e0f2f1" },
  { id:"språk",         navn:"Språk",         ikon:"🗣️", farge:"#b5179e", lys:"#f8e7f6" },
];

// ── SUPABASE CRUD ──────────────────────────────────────────────────────────

async function hentAlleBoker() {
  const { data, error } = await supabase
    .from("boker").select("*").order("created_at", { ascending: false });
  if (error) console.error("[hentAlleBoker]", error);
  return data || [];
}

async function lagreBok(bok) {
  if (bok.id) {
    const { id, created_at, ...rest } = bok;
    const { data, error } = await supabase.from("boker")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    return { ok: !error, data, feil: error?.message };
  }
  const { data, error } = await supabase.from("boker").insert(bok).select().single();
  return { ok: !error, data, feil: error?.message };
}

async function slettBok(id) {
  const { error } = await supabase.from("boker").delete().eq("id", id);
  return !error;
}

async function hentFavorittIds(uid) {
  if (!uid) return [];
  const { data, error } = await supabase.from("boker_favoritter")
    .select("bok_id").eq("user_id", uid);
  if (error) console.error("[hentFavorittIds]", error);
  return (data || []).map(r => r.bok_id);
}

async function toggleFavoritt(uid, bokId, erFav) {
  if (erFav) {
    const { error } = await supabase.from("boker_favoritter").delete()
      .eq("user_id", uid).eq("bok_id", bokId);
    return !error;
  } else {
    const { error } = await supabase.from("boker_favoritter").insert({ user_id: uid, bok_id: bokId });
    return !error;
  }
}

async function lastOppFil(fil, userId) {
  if (!userId) return { ok: false, feil: "Bruker-ID mangler – logg inn på nytt" };
  if (fil.type === "text/plain" || fil.name.endsWith(".txt")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ ok:true, tekst:e.target.result, navn:fil.name, type:"tekst" });
      reader.onerror = () => resolve({ ok:false, feil:"Kunne ikke lese filen" });
      reader.readAsText(fil, "UTF-8");
    });
  }
  if (fil.type === "application/pdf" || fil.name.endsWith(".pdf")) {
    const filNavn = `${userId}/${Date.now()}_${fil.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("boker-filer").upload(filNavn, fil);
    if (error) return { ok:false, feil:error.message };
    return { ok:true, sti:filNavn, navn:fil.name, type:"pdf" };
  }
  return { ok:false, feil:"Ugyldig filtype. Bruk .txt eller .pdf" };
}

// ── HJELPERE ───────────────────────────────────────────────────────────────

function kategoriFor(id) {
  return KATEGORIER.find(k => k.id === id) || { ikon:"📚", farge:"#5d7390", lys:"#f0f4f8", navn:id };
}

function kortDato(dato) {
  if (!dato) return "";
  return new Date(dato).toLocaleDateString("nb-NO", { day:"numeric", month:"short", year:"numeric" });
}

const labelStil = { display:"block", fontWeight:700, fontSize:12, color:"var(--c-t)", marginBottom:4 };
const inputBase = { width:"100%", padding:"11px 13px", border:"1.5px solid var(--c-input-border)", borderRadius:10, fontFamily:"'Nunito',sans-serif", fontSize:14, color:"var(--c-t)", background:"var(--c-input-bg)", boxSizing:"border-box", outline:"none", marginBottom:12 };

// ── BOK-KORT ───────────────────────────────────────────────────────────────

function BokKort({ bok, erFav, onFav, onAapne, kanRedigere, onRediger, onSlett }) {
  const kat = kategoriFor(bok.kategori);
  return (
    <div className="bk-kort bk-fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span className="bk-badge" style={{ background:kat.lys, color:kat.farge }}>
          {kat.ikon} {kat.navn}
        </span>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          <button onClick={e => { e.stopPropagation(); onFav(bok.id, erFav); }}
            style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", padding:"0 2px", lineHeight:1 }}
            title={erFav ? "Fjern fra favoritter" : "Legg til favoritter"}>
            {erFav ? "⭐" : "☆"}
          </button>
        </div>
      </div>

      <div onClick={() => onAapne(bok)} style={{ cursor:"pointer" }}>
        <div style={{ fontWeight:800, color:"#1a2c45", fontSize:15, lineHeight:1.3, marginBottom:4 }}>
          {bok.tittel}
        </div>
        {bok.forfatter && (
          <div style={{ fontSize:12, color:"#5d7390", marginBottom:4 }}>av {bok.forfatter}</div>
        )}
        {bok.beskrivelse && (
          <div style={{ fontSize:12, color:"#3d5a7a", lineHeight:1.5,
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {bok.beskrivelse}
          </div>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
        <div style={{ display:"flex", gap:6 }}>
          {bok.fil_sti && <span style={{ fontSize:10, color:"#8898ad" }}>📎 PDF</span>}
          {bok.ai_generert && <span style={{ fontSize:10, color:"#8898ad" }}>🤖 AI</span>}
          {bok.innhold && !bok.fil_sti && <span style={{ fontSize:10, color:"#8898ad" }}>📝 Tekst</span>}
        </div>
        {kanRedigere && (
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={e => { e.stopPropagation(); onRediger(bok); }}
              className="bk-btn bk-btn-sek" style={{ padding:"4px 10px", fontSize:11 }}>✏️</button>
            <button onClick={e => { e.stopPropagation(); onSlett(bok); }}
              className="bk-btn bk-btn-fare" style={{ padding:"4px 10px", fontSize:11 }}>🗑️</button>
          </div>
        )}
      </div>
      <div style={{ fontSize:10, color:"#aab5c5" }}>{kortDato(bok.created_at)}</div>
    </div>
  );
}

// ── DETALJ ─────────────────────────────────────────────────────────────────

async function åpnePdf(sti) {
  try {
    const { data, error } = await supabase.storage.from("boker-filer").createSignedUrl(sti, 300);
    if (error || !data?.signedUrl) { alert("Kunne ikke åpne filen – prøv igjen"); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  } catch { alert("Kunne ikke åpne filen – sjekk internettilkoblingen"); }
}

function BokDetalj({ bok, erFav, onFav, kanRedigere, onRediger, onSlett, onTilbake }) {
  const kat = kategoriFor(bok.kategori);
  return (
    <div className="bk-fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:8 }}>
        <button onClick={onTilbake} className="bk-btn bk-btn-sek">← Tilbake</button>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => onFav(bok.id, erFav)} className="bk-btn"
            style={{ background:erFav ? "#fff9c4" : "#f0f4f8", color:erFav ? "#b8860b" : "#5d7390" }}>
            {erFav ? "⭐ Favoritt" : "☆ Legg til favoritter"}
          </button>
          {kanRedigere && (
            <>
              <button onClick={() => onRediger(bok)} className="bk-btn bk-btn-sek">✏️ Rediger</button>
              <button onClick={() => onSlett(bok)} className="bk-btn bk-btn-fare">🗑️ Slett</button>
            </>
          )}
        </div>
      </div>

      <div style={{ background:kat.lys, border:`1.5px solid ${kat.farge}30`, borderRadius:16, padding:"20px", marginBottom:20 }}>
        <span className="bk-badge" style={{ background:"#fff", color:kat.farge, marginBottom:10, display:"inline-flex" }}>
          {kat.ikon} {kat.navn}
        </span>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:"#1a2c45", margin:"8px 0 4px", lineHeight:1.2 }}>
          {bok.tittel}
        </h2>
        {bok.forfatter && <div style={{ fontSize:13, color:"#5d7390", marginBottom:6 }}>av {bok.forfatter}</div>}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {(bok.alder_fra || bok.alder_til) && (
            <span style={{ fontSize:11, color:"#5d7390" }}>👶 {bok.alder_fra}–{bok.alder_til} år</span>
          )}
          {bok.ai_generert && <span style={{ fontSize:11, color:"#5d7390" }}>🤖 AI-generert</span>}
          <span style={{ fontSize:11, color:"#5d7390" }}>{kortDato(bok.created_at)}</span>
        </div>
      </div>

      {bok.beskrivelse && (
        <div style={{ background:"var(--c-lg2)", borderRadius:12, padding:"12px 15px", marginBottom:16, fontSize:14, color:"var(--c-gr)", lineHeight:1.6, fontStyle:"italic" }}>
          {bok.beskrivelse}
        </div>
      )}

      {bok.innhold && (
        <div style={{ background:"var(--c-card)", border:"1.5px solid var(--c-divider)", borderRadius:14, padding:"22px", lineHeight:1.85, color:"var(--c-t)", fontSize:15, whiteSpace:"pre-wrap", fontFamily:"'Nunito',sans-serif" }}>
          {bok.innhold}
        </div>
      )}

      {bok.fil_sti && (
        <div style={{ marginTop:16, padding:"14px 16px", background:"#d8e6f5", borderRadius:12, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:28 }}>📄</span>
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:"#1a2c45" }}>{bok.fil_navn || "PDF-fil"}</div>
            <button onClick={() => åpnePdf(bok.fil_sti)}
              style={{ background:"none", border:"none", padding:0, fontSize:12, color:"#2c5b8e", fontWeight:700, textDecoration:"underline", cursor:"pointer", fontFamily:"inherit" }}>
              Åpne / last ned PDF →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SKJEMA ─────────────────────────────────────────────────────────────────

function BokForm({ bok, aktivBruker, onLagre, onAvbryt, laster }) {
  const tom = { tittel:"", forfatter:"", kategori:"samlingsstund", beskrivelse:"", innhold:"", alder_fra:1, alder_til:6, ai_generert:false };
  const [form, setForm] = useState(bok ? { ...bok } : tom);
  const [opplaster, setOpplaster] = useState(false);
  const [opplastFeil, setOpplastFeil] = useState("");
  const [feil, setFeil] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const håndterFil = async (e) => {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setOpplaster(true); setOpplastFeil("");
    try {
      const r = await lastOppFil(fil, aktivBruker.id);
      if (!r.ok) { setOpplastFeil(r.feil); return; }
      if (r.tekst) { set("innhold", r.tekst); set("fil_navn", r.navn); }
      else { set("fil_sti", r.sti); set("fil_navn", r.navn); }
    } catch (err) {
      setOpplastFeil("Opplasting feilet – prøv igjen");
    } finally {
      setOpplaster(false);
    }
  };

  const håndterLagre = (e) => {
    e.preventDefault();
    if (!form.tittel.trim()) { setFeil("Tittel er påkrevd"); return; }
    onLagre({ ...form, user_id:aktivBruker.id });
  };

  return (
    <form onSubmit={håndterLagre} className="bk-fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#1a2c45" }}>
          {bok?.id ? "✏️ Rediger bok" : "📖 Ny bok / fortelling"}
        </div>
        <button type="button" onClick={onAvbryt} className="bk-btn bk-btn-sek">← Avbryt</button>
      </div>

      {feil && (
        <div style={{ background:"#fdecea", color:"#c62828", padding:"10px 12px", borderRadius:9, fontSize:12, marginBottom:12, fontWeight:700, borderLeft:"4px solid #c62828" }}>
          ⚠️ {feil}
        </div>
      )}

      <label style={labelStil}>Tittel *</label>
      <input className="bk-input" value={form.tittel} onChange={e => set("tittel", e.target.value)} placeholder="Tittel på bok eller fortelling" />

      <label style={labelStil}>Forfatter</label>
      <input className="bk-input" value={form.forfatter || ""} onChange={e => set("forfatter", e.target.value)} placeholder="Forfatter eller kilde" />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div>
          <label style={labelStil}>Kategori</label>
          <select className="bk-input" value={form.kategori} onChange={e => set("kategori", e.target.value)}>
            {KATEGORIER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.navn}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStil}>Aldersgruppe (år)</label>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:2 }}>
            <input type="number" min={1} max={6} className="bk-input"
              style={{ width:60, marginBottom:0, textAlign:"center" }}
              value={form.alder_fra} onChange={e => set("alder_fra", parseInt(e.target.value) || form.alder_fra)} />
            <span style={{ color:"#5d7390", fontSize:13, flexShrink:0 }}>–</span>
            <input type="number" min={1} max={6} className="bk-input"
              style={{ width:60, marginBottom:0, textAlign:"center" }}
              value={form.alder_til} onChange={e => set("alder_til", parseInt(e.target.value) || form.alder_til)} />
          </div>
        </div>
      </div>

      <label style={labelStil}>Kort beskrivelse</label>
      <textarea className="bk-input" style={{ minHeight:72, resize:"vertical" }}
        value={form.beskrivelse || ""} onChange={e => set("beskrivelse", e.target.value)}
        placeholder="Kort beskrivelse av innholdet..." />

      <label style={labelStil}>Innhold / fortellingstekst</label>
      <textarea className="bk-input" style={{ minHeight:160, resize:"vertical" }}
        value={form.innhold || ""} onChange={e => set("innhold", e.target.value)}
        placeholder="Skriv inn eller lim inn teksten her..." />

      <label style={labelStil}>Last opp fil <span style={{ color:"#8898ad", fontWeight:600 }}>(.txt eller .pdf)</span></label>
      <div style={{ marginBottom:14 }}>
        <input type="file" accept=".txt,.pdf" onChange={håndterFil}
          style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#5d7390" }} />
        {opplaster && <div style={{ fontSize:12, color:"#2c5b8e", marginTop:6 }}>⏳ Laster opp...</div>}
        {opplastFeil && <div style={{ fontSize:12, color:"#c62828", marginTop:6 }}>⚠️ {opplastFeil}</div>}
        {form.fil_navn && !opplaster && <div style={{ fontSize:12, color:"#2d6a4f", marginTop:6 }}>✅ {form.fil_navn}</div>}
        {form.fil_sti && <div style={{ fontSize:11, color:"#8898ad", marginTop:3 }}>PDF lagret – vises som nedlastingslenke</div>}
      </div>

      <button type="submit" disabled={laster} className="bk-btn bk-btn-hoved"
        style={{ width:"100%", padding:14, fontSize:15 }}>
        {laster ? "⏳ Lagrer..." : bok?.id ? "💾 Oppdater" : "📖 Legg til bok"}
      </button>
    </form>
  );
}

// ── AI-FORTELLING ──────────────────────────────────────────────────────────

function AiFortellingView({ aktivBruker, onLagre, onAvbryt }) {
  const [form, setForm] = useState({ tema:"", kategori:"samlingsstund", aldersgruppe:"3-6", lengde:"medium", karakterer:"", ønsker:"" });
  const [genererer, setGenererer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [feil, setFeil] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const lengdeMap = {
    kort: "ca. 200-300 ord, 3-4 avsnitt, enkel og repeterende struktur – egnet for korte samlinger",
    medium: "ca. 400-600 ord, 5-7 avsnitt med god oppbygging og spenningskurve",
    lang: "ca. 700-1000 ord, 8-12 avsnitt med karakterutvikling og tematisk dybde",
  };

  const generer = async () => {
    if (!form.tema.trim()) { setFeil("Skriv inn tema eller beskrivelse"); return; }
    setGenererer(true); setFeil(""); setResultat(null);
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 28000);
    try {
      const ekstra = (form.karakterer ? " Karakterer: " + sanitizeForPrompt(form.karakterer, 100) + "." : "") + (form.ønsker ? " Spesielle ønsker: " + sanitizeForPrompt(form.ønsker, 200) + "." : "");
      const system = `Du er en kreativ forfatter av barnebøker for norske barnehager. Skriv en pedagogisk og engasjerende fortelling egnet for barn på ${form.aldersgruppe} år. Lengde: ${lengdeMap[form.lengde]}. Bruk varmt, enkelt bokmål. Svar KUN med et JSON-objekt (ingen annen tekst) i dette formatet:\n{"tittel":"...","beskrivelse":"En setning om hva fortellingen handler om","innhold":"Selve fortellingens tekst med avsnitt adskilt av \\n\\n"}`;
      const prompt = `Tema: ${sanitizeForPrompt(form.tema, 100)}.${ekstra} Kategori: ${form.kategori}. Aldersgruppe: ${form.aldersgruppe} år.`;
      const r = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ system, prompt, max_tokens:1400 }), signal: ctrl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      const jsonMatch = (d.text || "").match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Ugyldig svar fra AI");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.tittel || !parsed.innhold) throw new Error("AI-svar manglet påkrevde felt (tittel/innhold)");
      setResultat(parsed);
    } catch (e) {
      console.error("[AI Fortelling]", e);
      if (e.name === "AbortError") setFeil("AI brukte for lang tid – prøv igjen.");
      else if (e.message?.includes("manglet")) setFeil("AI ga et ufullstendig svar – prøv igjen.");
      else if (e.message?.startsWith("HTTP")) setFeil("Serverfeil (" + e.message + ") – prøv igjen.");
      else setFeil("AI-generering feilet – prøv igjen.");
    } finally { clearTimeout(tid); setGenererer(false); }
  };

  const lagre = async () => {
    if (!resultat) return;
    setLagrer(true);
    const [fra, til] = form.aldersgruppe.split("-").map(Number);
    await onLagre({ tittel:resultat.tittel, beskrivelse:resultat.beskrivelse, innhold:resultat.innhold, kategori:form.kategori, alder_fra:fra||1, alder_til:til||6, ai_generert:true, user_id:aktivBruker.id });
    setLagrer(false);
  };

  return (
    <div className="bk-fade">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#1a2c45" }}>🤖 AI-fortelling</div>
        <button type="button" onClick={onAvbryt} className="bk-btn bk-btn-sek">← Tilbake</button>
      </div>

      <div style={{ background:"linear-gradient(135deg,#1f4068,#5b2d8e)", borderRadius:16, padding:"16px 20px", color:"#fff", marginBottom:20 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, marginBottom:4 }}>✨ La AI skrive fortellingen</div>
        <div style={{ fontSize:12, opacity:.88 }}>Beskriv hva du vil ha – AI lager en original norsk barnehagefortelling skreddersydd til din gruppe.</div>
      </div>

      {feil && <div style={{ background:"#fdecea", color:"#c62828", padding:"10px 12px", borderRadius:9, fontSize:12, marginBottom:12, fontWeight:700 }}>⚠️ {feil}</div>}

      {!resultat ? (
        <>
          <label style={labelStil}>Tema / Hva handler fortellingen om? *</label>
          <textarea className="bk-input" style={{ minHeight:80, resize:"vertical" }}
            value={form.tema} onChange={e => set("tema", e.target.value)}
            placeholder={"Eks: En liten frosk som er redd for mørket og lærer å være modig.\nEller: Vennskap mellom et barn og et ekorn i skogen..."} />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={labelStil}>Kategori</label>
              <select className="bk-input" value={form.kategori} onChange={e => set("kategori", e.target.value)}>
                {KATEGORIER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.navn}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStil}>Aldersgruppe</label>
              <select className="bk-input" value={form.aldersgruppe} onChange={e => set("aldersgruppe", e.target.value)}>
                {[["1-3","1-3 år (småbarn)"],["3-5","3-5 år"],["3-6","3-6 år (hele gruppen)"],["4-6","4-6 år (storbarn)"],["5-6","5-6 år (skolestartere)"]].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={labelStil}>Lengde</label>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[["kort","📄 Kort","~5 min"],["medium","📃 Medium","~10 min"],["lang","📜 Lang","~15 min"]].map(([v,e,t]) => (
              <button key={v} type="button" onClick={() => set("lengde", v)}
                style={{ flex:1, padding:"10px 6px", border:"1.5px solid", borderColor:form.lengde===v?"#2c5b8e":"var(--c-input-border)", borderRadius:10, background:form.lengde===v?"#e8f0fb":"var(--c-lg2)", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:form.lengde===v?"#2c5b8e":"var(--c-gr)", cursor:"pointer", textAlign:"center", lineHeight:1.6 }}>
                {e}<br/><span style={{ fontWeight:600, fontSize:10 }}>{t}</span>
              </button>
            ))}
          </div>

          <label style={labelStil}>Karakterer <span style={{ fontWeight:600, color:"#8898ad" }}>(valgfritt)</span></label>
          <input className="bk-input" value={form.karakterer} onChange={e => set("karakterer", e.target.value)}
            placeholder="Eks: Maja (5 år), Bjørnen Bruno, Skogsfeen..." />

          <label style={labelStil}>Ekstra ønsker <span style={{ fontWeight:600, color:"#8898ad" }}>(valgfritt)</span></label>
          <input className="bk-input" value={form.ønsker} onChange={e => set("ønsker", e.target.value)}
            placeholder="Eks: Inkluder en sang, avslutt med et spørsmål til barna, eventyrpreg..." />

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {["En liten ulv som vil bli venn med sauene","Et barn som mister bamsen sin og finner nye venner","Prinsessen som ikke ville sove","Trollet som lærte å dele"].map(eks => (
              <button key={eks} type="button" onClick={() => set("tema", eks)}
                style={{ padding:"5px 10px", borderRadius:20, border:"1px solid var(--c-input-border)", background:"var(--c-lg2)", fontFamily:"'Nunito',sans-serif", fontSize:11, color:"var(--c-g)", cursor:"pointer" }}>
                {eks}
              </button>
            ))}
          </div>

          <button onClick={generer} disabled={genererer || !form.tema.trim()} className="bk-btn bk-btn-hoved"
            style={{ width:"100%", padding:14, fontSize:15 }}>
            {genererer ? "✨ Skriver fortelling..." : "✨ Generer fortelling"}
          </button>
        </>
      ) : (
        <div className="bk-fade">
          <div style={{ background:"var(--c-lg2)", border:"1.5px solid var(--c-divider)", borderRadius:16, padding:20, marginBottom:16 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:"var(--c-t)", marginBottom:6 }}>{resultat.tittel}</div>
            {resultat.beskrivelse && (
              <div style={{ fontSize:13, color:"var(--c-gr)", fontStyle:"italic", marginBottom:14 }}>{resultat.beskrivelse}</div>
            )}
            <div style={{ background:"var(--c-card)", borderRadius:12, padding:"18px 20px", fontSize:15, lineHeight:1.9, color:"var(--c-t)", whiteSpace:"pre-wrap", fontFamily:"'Nunito',sans-serif", border:"1px solid var(--c-divider)", maxHeight:440, overflowY:"auto" }}>
              {resultat.innhold}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setResultat(null)} className="bk-btn bk-btn-sek" style={{ flex:1, padding:12 }}>
              🔄 Generer på nytt
            </button>
            <button onClick={lagre} disabled={lagrer} className="bk-btn bk-btn-hoved" style={{ flex:2, padding:12, fontSize:14 }}>
              {lagrer ? "⏳ Lagrer..." : "📖 Lagre i biblioteket"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HOVED-KOMPONENT ────────────────────────────────────────────────────────

export default function BokerSide({ aktivBruker }) {
  const [visning, setVisning] = useState("liste");
  const [boker, setBoker] = useState([]);
  const [favorittIds, setFavorittIds] = useState([]);
  const [laster, setLaster] = useState(true);
  const [lagrerBok, setLagrerBok] = useState(false);
  const [søk, setSøk] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("alle");
  const [aktivTab, setAktivTab] = useState("alle");
  const [aktivBok, setAktivBok] = useState(null);
  const [slettBekreft, setSlettBekreft] = useState(null);
  const [melding, setMelding] = useState("");
  const [visMaks, setVisMaks] = useState(20);
  const kanRedigere = (bok) => aktivBruker?.admin || bok?.user_id === aktivBruker?.id;

  useEffect(() => { last(); }, [aktivBruker?.id]);

  const last = async () => {
    setLaster(true);
    const [b, f] = await Promise.all([
      hentAlleBoker(),
      hentFavorittIds(aktivBruker?.id),
    ]);
    setBoker(b);
    setFavorittIds(f);
    setLaster(false);
  };

  const visM = (m) => { setMelding(m); setTimeout(() => setMelding(""), 3000); };

  const håndterFav = async (bokId, erFav) => {
    if (!aktivBruker?.id) return;
    const ok = await toggleFavoritt(aktivBruker.id, bokId, erFav);
    if (ok) setFavorittIds(f => erFav ? f.filter(id => id !== bokId) : [...f, bokId]);
  };

  const håndterLagre = async (data) => {
    setLagrerBok(true);
    const r = await lagreBok(data);
    if (r.ok) {
      await last();
      setVisning("liste");
      setAktivBok(null);
      visM(data.id ? "✅ Boken er oppdatert" : "✅ Ny bok lagt til");
    } else {
      visM("⚠️ Lagring feilet: " + (r.feil || "ukjent feil"));
    }
    setLagrerBok(false);
  };

  const håndterSlettKlikk = (bok) => setSlettBekreft(bok);

  const håndterSlettBekreft = async () => {
    if (!slettBekreft) return;
    const ok = await slettBok(slettBekreft.id);
    setSlettBekreft(null);
    if (ok) {
      await last();
      if (visning === "detalj") { setVisning("liste"); setAktivBok(null); }
      visM("✅ Boken er slettet");
    } else {
      visM("⚠️ Sletting feilet");
    }
  };

  const filtrert = boker.filter(b => {
    if (aktivTab === "favoritter" && !favorittIds.includes(b.id)) return false;
    if (kategoriFilter !== "alle" && b.kategori !== kategoriFilter) return false;
    if (søk) {
      const s = søk.toLowerCase();
      return ((b.tittel||"").toLowerCase().includes(s) || (b.forfatter||"").toLowerCase().includes(s) || (b.beskrivelse||"").toLowerCase().includes(s));
    }
    return true;
  });
  const synligBoker = filtrert.slice(0, visMaks);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily:"'Nunito',sans-serif", maxWidth:900, margin:"0 auto" }}>

        {/* Toast-melding */}
        {melding && (
          <div className="bk-fade" style={{ position:"fixed", top:16, right:16, zIndex:999, background:melding.startsWith("⚠️") ? "#fdecea" : "#d8f3dc", color:melding.startsWith("⚠️") ? "#c62828" : "#1b5e47", padding:"12px 18px", borderRadius:12, fontWeight:800, fontSize:13, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", pointerEvents:"none" }}>
            {melding}
          </div>
        )}

        {/* Slett-modal */}
        {slettBekreft && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
            <div style={{ background:"var(--c-card)", borderRadius:18, padding:28, maxWidth:360, width:"100%", textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.22)" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
              <div style={{ fontWeight:800, color:"var(--c-t)", marginBottom:8, fontSize:16 }}>
                Slett «{slettBekreft.tittel}»?
              </div>
              <div style={{ fontSize:13, color:"var(--c-gr)", marginBottom:22 }}>Dette kan ikke angres.</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setSlettBekreft(null)} className="bk-btn bk-btn-sek" style={{ flex:1 }}>Avbryt</button>
                <button onClick={håndterSlettBekreft} className="bk-btn bk-btn-fare" style={{ flex:1 }}>Slett</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LISTE ── */}
        {visning === "liste" && (
          <div className="bk-fade">
            {/* Hero */}
            <div style={{ background:"linear-gradient(135deg,#1f4068,#3a72b0)", borderRadius:20, padding:"24px 22px 20px", color:"#fff", marginBottom:20, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-20, right:-10, fontSize:90, opacity:.1, pointerEvents:"none" }}>📚</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, marginBottom:4 }}>📚 Bøker & Fortellinger</div>
              <div style={{ fontSize:13, opacity:.88, marginBottom:16 }}>Pedagogisk bibliotek for barnehagen · {boker.length} {boker.length === 1 ? "bok" : "bøker"}</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={() => setVisning("ny")} className="bk-btn"
                  style={{ background:"rgba(255,255,255,0.95)", color:"#1f4068", fontSize:13, padding:"9px 16px" }}>
                  + Legg til bok
                </button>
                <button onClick={() => setVisning("ai-fortelling")} className="bk-btn"
                  style={{ background:"rgba(255,255,255,0.18)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.5)", fontSize:13, padding:"9px 16px" }}>
                  🤖 AI-fortelling
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, background:"var(--c-lg2)", borderRadius:11, padding:4, marginBottom:14 }}>
              {[["alle","📚 Alle"], ["favoritter","⭐ Favoritter"]].map(([id, navn]) => (
                <button key={id} onClick={() => setAktivTab(id)}
                  style={{ flex:1, padding:"8px", background:aktivTab===id ? "var(--c-w)" : "transparent", border:"none", borderRadius:8, fontSize:13, fontWeight:800, color:aktivTab===id ? "var(--c-g)" : "var(--c-gr)", cursor:"pointer", boxShadow:aktivTab===id ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily:"'Nunito',sans-serif" }}>
                  {navn}{id==="favoritter" && favorittIds.length > 0 ? ` (${favorittIds.length})` : ""}
                </button>
              ))}
            </div>

            {/* Søk */}
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--c-lg2)", border:"1.5px solid var(--c-divider)", borderRadius:12, padding:"10px 14px", marginBottom:14 }}>
              <span style={{ fontSize:16, color:"#8898ad" }}>🔍</span>
              <input value={søk} onChange={e => setSøk(e.target.value)}
                placeholder="Søk etter tittel, forfatter..."
                style={{ border:"none", background:"transparent", fontFamily:"'Nunito',sans-serif", fontSize:14, color:"#1a2c45", outline:"none", flex:1 }} />
              {søk && (
                <button onClick={() => setSøk("")}
                  style={{ background:"none", border:"none", color:"#8898ad", cursor:"pointer", fontSize:16, padding:0 }}>✕</button>
              )}
            </div>

            {/* Kategori-filter */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              <button onClick={() => setKategoriFilter("alle")}
                style={{ padding:"6px 13px", borderRadius:20, fontSize:12, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif", background:kategoriFilter==="alle" ? "#1f4068" : "#e8eff8", color:kategoriFilter==="alle" ? "#fff" : "#5d7390", transition:"all 0.15s" }}>
                Alle
              </button>
              {KATEGORIER.map(k => (
                <button key={k.id} onClick={() => setKategoriFilter(k.id)}
                  style={{ padding:"6px 13px", borderRadius:20, fontSize:12, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"'Nunito',sans-serif", background:kategoriFilter===k.id ? k.farge : k.lys, color:kategoriFilter===k.id ? "#fff" : k.farge, transition:"all 0.15s" }}>
                  {k.ikon} {k.navn}
                </button>
              ))}
            </div>

            {/* Grid */}
            {laster ? (
              <div className="bk-tom">⏳ Laster biblioteket...</div>
            ) : filtrert.length === 0 ? (
              <div className="bk-tom">
                <div style={{ fontSize:48, marginBottom:10 }}>📖</div>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>
                  {aktivTab === "favoritter" ? "Ingen favoritter ennå" : "Ingen bøker funnet"}
                </div>
                <div style={{ fontSize:13 }}>
                  {aktivTab === "favoritter"
                    ? "Legg til bøker som favoritter ved å trykke ☆ på et kort"
                    : søk ? "Prøv et annet søkeord" : "Trykk «+ Legg til bok» for å komme i gang"}
                </div>
              </div>
            ) : (
              <>
                <div className="bk-grid">
                  {synligBoker.map(b => (
                    <BokKort key={b.id} bok={b}
                      erFav={favorittIds.includes(b.id)}
                      onFav={håndterFav}
                      onAapne={bok => { setAktivBok(bok); setVisning("detalj"); }}
                      kanRedigere={kanRedigere(b)}
                      onRediger={bok => { setAktivBok(bok); setVisning("rediger"); }}
                      onSlett={håndterSlettKlikk}
                      />
                  ))}
                </div>
                {filtrert.length > visMaks && (
                  <button onClick={()=>setVisMaks(v=>v+20)} style={{width:"100%",marginTop:12,padding:"11px",background:"#f0f5ff",color:"#2c5b8e",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                    Vis flere ({filtrert.length - visMaks} gjenstår)
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DETALJ ── */}
        {visning === "detalj" && aktivBok && (
          <BokDetalj bok={aktivBok}
            erFav={favorittIds.includes(aktivBok.id)}
            onFav={håndterFav}
            kanRedigere={kanRedigere(aktivBok)}
            onRediger={bok => { setAktivBok(bok); setVisning("rediger"); }}
            onSlett={håndterSlettKlikk}
            onTilbake={() => { setVisning("liste"); setAktivBok(null); }}
            />
        )}

        {/* ── SKJEMA ── */}
        {(visning === "ny" || visning === "rediger") && (
          <BokForm
            bok={visning === "rediger" ? aktivBok : null}
            aktivBruker={aktivBruker}
            onLagre={håndterLagre}
            onAvbryt={() => { setVisning("liste"); setAktivBok(null); }}
            laster={lagrerBok} />
        )}

        {/* ── AI-FORTELLING ── */}
        {visning === "ai-fortelling" && (
          <AiFortellingView
            aktivBruker={aktivBruker}
            onLagre={håndterLagre}
            onAvbryt={() => setVisning("liste")} />
        )}

      </div>

    </>
  );
}

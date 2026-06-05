import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { TEGNEARK, TEGNEKAT, SvgPlaceholder } from './data/tegneark.jsx';
import { FAGOMRADER } from './data/rammeplan.js';

import { C, escapeHTML } from './utils.js';
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}
function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span data-fag={f.id} className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
}

export async function hentUserTegneark(userId) {
  const { data } = await supabase.from("user_tegneark").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}
async function lagreUserTegneark(ark) {
  const { data, error } = await supabase.from("user_tegneark").insert(ark).select().single();
  return { data, error };
}
async function slettUserTegneark(id, userId) {
  return await supabase.from("user_tegneark").delete().eq("id", id).eq("user_id", userId);
}

function AiTegnearkView({ aktivBruker, onLagre, onAvbryt }) {
  const [form, setForm] = useState({ tema:"", alder:"3-6", fagomrade:"", vanskelighet:"enkel" });
  const [genererer, setGenererer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [feil, setFeil] = useState(null);
  const [lagrer, setLagrer] = useState(false);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const generer = async () => {
    if (!form.tema.trim()) return;
    setGenererer(true); setFeil(null); setResultat(null);
    const prompt = `Lag et tegneark-opplegg for barn i alderen ${form.alder} år.\n\nTema: ${form.tema}${form.fagomrade?"\nFagområde: "+form.fagomrade:""}${form.vanskelighet?"\nVanskelighetsgrad: "+form.vanskelighet:""}\n\nSvar KUN med gyldig JSON:\n{\n  "tittel": "tittel på tegnearket",\n  "ikon": "ett passende emoji",\n  "oppgave": "fire nummererte tegnetrinn (1. ... 2. ... 3. ... 4. ...)",\n  "samtale": "tre åpne samtalespørsmål separert med spørsmålstegn",\n  "mal": "rammeplanmål – én setning",\n  "kategori": "passende kategori (dyr/natur/mennesker/mat/sport/teknologi/romfart/musikk/festlig/folelser)",\n  "alder": "${form.alder} år",\n  "rammeplan": ["id-er fra: kropp, kunst, natur, antall, etikk, naermiljo, kommunikasjon"]\n}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 28000);
    try {
      const res = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ system:"Du er en erfaren barnehagelærer. Skriv alltid på norsk bokmål. Svar KUN med gyldig JSON.", prompt, max_tokens:800 }), signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const raw = json.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Ugyldig svar fra AI");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.tittel || !parsed.oppgave || !parsed.samtale) throw new Error("AI-svar manglet påkrevde felt");
      setResultat(parsed);
    } catch(e) {
      console.error("[AI Tegneark]", e);
      const kategorier = form.fagomrade ? TEGNEARK.filter(t => t.kategori === form.fagomrade || t.rammeplan?.some(r => form.fagomrade.toLowerCase().includes(r))) : TEGNEARK;
      const pool = kategorier.length > 0 ? kategorier : TEGNEARK;
      const fbT = pool[Math.floor(Math.random() * pool.length)];
      setResultat({ tittel: fbT.tittel, ikon: fbT.ikon, oppgave: fbT.oppgave, samtale: fbT.samtale, mal: fbT.mal, kategori: fbT.kategori, alder: form.alder + " år", rammeplan: fbT.rammeplan || [] });
      setFeil("ℹ️ AI var utilgjengelig – viser eksisterende tegneark som forslag");
    } finally { clearTimeout(tid); setGenererer(false); }
  };
  const lagre = async () => {
    if (!resultat || !aktivBruker?.id) return;
    setLagrer(true);
    const { data, error } = await lagreUserTegneark({ user_id:aktivBruker.id, tittel:resultat.tittel||"Tegneark", ikon:resultat.ikon||"🖍️", oppgave:resultat.oppgave||"", samtale:resultat.samtale||"", mal:resultat.mal||"", kategori:resultat.kategori||"natur", alder:resultat.alder||form.alder+" år", rammeplan:resultat.rammeplan||[], ai_generert:true });
    setLagrer(false);
    if (error) { setFeil("Feil ved lagring: "+error.message); return; }
    onLagre(data);
  };
  return (
    <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
      <Tilbake onClick={onAvbryt}/>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:4}}>🤖 AI-tegneark</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:18}}>La AI lage et unikt tegneark med oppgave, samtale og rammeplankoblinger</p>
      {!resultat ? (
        <>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Tema / motiv *</label>
            <input value={form.tema} onChange={e=>setForm(p=>({...p,tema:e.target.value}))} placeholder="f.eks. dinosaurer, romskip, bakeri, norsk natur..." style={iS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Aldersgruppe</label>
              <select value={form.alder} onChange={e=>setForm(p=>({...p,alder:e.target.value}))} style={iS}>
                <option value="1-3">1–3 år</option>
                <option value="2-4">2–4 år</option>
                <option value="3-6">3–6 år</option>
                <option value="4-6">4–6 år</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Vanskelighetsgrad</label>
              <select value={form.vanskelighet} onChange={e=>setForm(p=>({...p,vanskelighet:e.target.value}))} style={iS}>
                <option value="enkel">Enkel</option>
                <option value="middels">Middels</option>
                <option value="utfordrende">Utfordrende</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Fagområde (valgfritt)</label>
            <select value={form.fagomrade} onChange={e=>setForm(p=>({...p,fagomrade:e.target.value}))} style={iS}>
              <option value="">– Velg –</option>
              {FAGOMRADER.map(f=><option key={f.id} value={f.navn}>{f.ikon} {f.navn}</option>)}
            </select>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <button className="btn" onClick={generer} disabled={genererer||!form.tema.trim()} style={{width:"100%",padding:"12px 0",fontSize:14,background:genererer?C.gr:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff"}}>
            {genererer?"⏳ Genererer tegneark...":"✨ Generer tegneark"}
          </button>
        </>
      ) : (
        <div className="fade">
          <div style={{background:"#f5f9fd",borderRadius:12,padding:18,marginBottom:16,border:"1.5px solid #c4d6ec"}}>
            <div style={{fontWeight:800,fontSize:18,color:C.t,marginBottom:2}}>{resultat.ikon} {resultat.tittel}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:14}}>{resultat.kategori} · {resultat.alder}</div>
            <div style={{background:"#fff9c4",borderRadius:9,padding:"10px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:5,textTransform:"uppercase"}}>🖍️ Tegneoppgave</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{resultat.oppgave}</div>
            </div>
            <div style={{background:"#e8f5e9",borderRadius:9,padding:"10px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#2e7d32",fontSize:11,marginBottom:5,textTransform:"uppercase"}}>💬 Samtale</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{resultat.samtale}</div>
            </div>
            <div style={{background:"#e3f2fd",borderRadius:9,padding:"10px 13px"}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:11,marginBottom:4,textTransform:"uppercase"}}>📖 Mål</div>
              <div style={{fontSize:13,color:C.t}}>{resultat.mal}</div>
            </div>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={lagre} disabled={lagrer} style={{flex:1,padding:"11px 0",fontSize:14,background:lagrer?C.gr:"#2e7d32",color:"#fff"}}>
              {lagrer?"⏳ Lagrer...":"💾 Lagre i Mine tegneark"}
            </button>
            <button className="btn" onClick={()=>setResultat(null)} style={{padding:"11px 18px",fontSize:13,background:C.lg2,color:C.t}}>↩ Prøv igjen</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Finn en ekte SVG fra TEGNEARK-databasen som passer kategorien.
// Bedre enn SvgPlaceholder for AI-genererte ark.
function matchSvg(kategori, tittel = '') {
  const matches = TEGNEARK.filter(t => t.kategori === kategori);
  if (matches.length === 0) return <SvgPlaceholder />;
  // Bruk tittel som seed for konsistent valg
  const seed = tittel.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return matches[seed % matches.length].svg;
}

export default function TegnearkSide({ ctx }) {
  const { aktivBruker, vis, preselectTegneark, setPreselectTegneark, favoritter, toggleFav, setGlobalUserTegneark } = ctx;

    const [tkat, setTkat] = useState("alle");
    const [valgtT, setValgtT] = useState(() => preselectTegneark ? TEGNEARK.find(t => t.id === preselectTegneark) || null : null);
    const [lokalToast, setLokalToast] = useState("");
    const [visAiPanel, setVisAiPanel] = useState(false);
    const [userTegneark, setUserTegneark] = useState([]);
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const favSet = new Set(favoritter?.tegneark || []);

    useEffect(() => {
      if (!aktivBruker?.id) return;
      hentUserTegneark(aktivBruker.id).then(ut => {
        setUserTegneark(ut);
        if (preselectTegneark && !valgtT) {
          const funnet = ut.find(t => "user_"+t.id === preselectTegneark);
          if (funnet) setValgtT({ id:"user_"+funnet.id, tittel:funnet.tittel, ikon:funnet.ikon||"🖍️", kategori:funnet.kategori||"natur", alder:funnet.alder, rammeplan:funnet.rammeplan||[], svg:matchSvg(funnet.kategori||"natur", funnet.tittel||""), oppgave:funnet.oppgave, samtale:funnet.samtale, mal:funnet.mal, _erMin:true, _dbId:funnet.id });
        }
      });
    }, [aktivBruker?.id]);

    useEffect(() => {
      if (preselectTegneark) setPreselectTegneark(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const userMapped = userTegneark.map(t => ({ id:"user_"+t.id, tittel:t.tittel, ikon:t.ikon||"🖍️", kategori:t.kategori||"natur", alder:t.alder, rammeplan:t.rammeplan||[], svg:matchSvg(t.kategori||"natur", t.tittel||""), oppgave:t.oppgave, samtale:t.samtale, mal:t.mal, _erMin:true, _dbId:t.id }));
    const alleData = [...userMapped, ...TEGNEARK];
    const data = tkat==="favoritter"
      ? alleData.filter(t=>favSet.has(t.id))
      : tkat==="mine"
      ? userMapped
      : (tkat==="alle" ? alleData : alleData.filter(t=>t.kategori===tkat));

    const trygtFilnavn = (s) => String(s||"tegneark").toLowerCase().replace(/[^a-z0-9æøå]+/gi,"_").replace(/^_+|_+$/g,"").slice(0,50) || "tegneark";

    const byggUtskriftsHTML = (ark, { selvstendig = true } = {}) => {
      const svgEl = document.getElementById("svg-ark-" + ark.id);
      const svgHTML = svgEl?.innerHTML || "";
      const fagomraderHTML = ark.rammeplan.map(r => {
        const f = FAGOMRADER.find(x => x.id === r);
        return f ? `<span class="tag" style="background:${f.lys};color:${f.farge}">${escapeHTML(f.ikon)} ${escapeHTML(f.navn)}</span>` : "";
      }).join("");
      const innhold = `
        <div class="side">
          <h1>${escapeHTML(ark.ikon)} ${escapeHTML(ark.tittel)}</h1>
          <div class="tags">
            <span class="tag" style="background:#d8e6f5;color:#2c5b8e">👶 ${escapeHTML(ark.alder)}</span>
            ${fagomraderHTML}
          </div>
          <div class="svg-wrap">${svgHTML}</div>
          <div class="boks gul"><strong>🖍️ Tegneoppgave:</strong><br>${escapeHTML(ark.oppgave)}</div>
          <div class="boks gronn"><strong>💬 Samtale med barna:</strong><br>${escapeHTML(ark.samtale)}</div>
          <div class="boks bla"><strong>📖 Mål:</strong> ${escapeHTML(ark.mal)}</div>
          <div class="footer">🌿 Barnehagehjelpen – Rammeplan 2017</div>
        </div>`;
      if (!selvstendig) return innhold;
      return `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(ark.tittel)} – Barnehagehjelpen</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", "Helvetica Neue", sans-serif; background: #f3f7fc; color: #1a2c45; padding: 20px 14px; line-height: 1.5; }
  .topp { max-width: 680px; margin: 0 auto 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .knapp { padding: 10px 16px; background: #2c5b8e; color: white; border: none; border-radius: 9px; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit; }
  .knapp.sek { background: #5d7390; }
  .knapp:hover { opacity: 0.9; }
  .side { max-width: 680px; margin: 0 auto; background: white; border-radius: 16px; padding: 26px 22px; box-shadow: 0 2px 16px rgba(44,91,142,0.08); }
  h1 { color: #2c5b8e; font-size: 24px; margin-bottom: 10px; font-weight: 800; }
  .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .tag { display: inline-block; border-radius: 20px; padding: 3px 11px; font-size: 12px; font-weight: 700; }
  .svg-wrap { text-align: center; border: 2px dashed #c4d6ec; border-radius: 16px; padding: 16px; margin: 14px 0; background: #f5f9fd; }
  .svg-wrap svg { max-width: 380px; width: 100%; height: auto; }
  .boks { border-radius: 12px; padding: 14px 16px; margin: 10px 0; font-size: 14px; }
  .boks.gul { background: #fff9c4; }
  .boks.gronn { background: #e8f5e9; }
  .boks.bla { background: #e3f2fd; }
  .footer { text-align: center; font-size: 11px; color: #999; margin-top: 18px; }
  @media print {
    @page { margin: 12mm; }
    body { background: white; padding: 0; }
    .topp { display: none; }
    .side { box-shadow: none; max-width: 100%; padding: 8px; }
  }
</style>
</head>
<body>
  <div class="topp">
    <button class="knapp" onclick="window.print()">🖨️ Skriv ut</button>
    <button class="knapp sek" onclick="window.close()">✕ Lukk</button>
  </div>
${innhold}
</body>
</html>`;
    };

    const lastNed = (ark) => {
      try {
        const html = byggUtskriftsHTML(ark, { selvstendig: true });
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tegneark-${trygtFilnavn(ark.tittel)}.html`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        visLokal("✅ Filen er lastet ned");
        return true;
      } catch (e) {
        console.error("[Last ned] feilet:", e);
        visLokal("❌ Kunne ikke laste ned");
        return false;
      }
    };

    const skrivUt = (ark) => {
      let beforePrintFiret = false;
      const beforeHandler = () => { beforePrintFiret = true; };
      const afterHandler = () => {
        window.removeEventListener("beforeprint", beforeHandler);
        window.removeEventListener("afterprint", afterHandler);
      };
      try {
        if (!document.getElementById("print-styles-bh")) {
          const style = document.createElement("style");
          style.id = "print-styles-bh";
          style.textContent = `
            #print-area-bh { display: none; }
            @media print {
              @page { margin: 12mm; }
              html, body { background: white !important; }
              body > *:not(#print-area-bh) { display: none !important; }
              #print-area-bh { display: block !important; }
              #print-area-bh .side { max-width: 680px; margin: 0 auto; font-family: 'Nunito', sans-serif; color: #1a2c45; }
              #print-area-bh h1 { color: #2c5b8e; font-size: 24px; margin: 0 0 8px; font-weight: 800; }
              #print-area-bh .tags { margin-bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
              #print-area-bh .tag { display: inline-block; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 700; }
              #print-area-bh .boks { border-radius: 12px; padding: 14px 16px; margin: 10px 0; font-size: 14px; line-height: 1.6; }
              #print-area-bh .boks.gul { background: #fff9c4; }
              #print-area-bh .boks.gronn { background: #e8f5e9; }
              #print-area-bh .boks.bla { background: #e3f2fd; }
              #print-area-bh .svg-wrap { text-align: center; border: 2px dashed #c4d6ec; border-radius: 16px; padding: 14px; margin: 14px 0; background: #f5f9fd; }
              #print-area-bh .svg-wrap svg { max-width: 380px; width: 100%; height: auto; }
              #print-area-bh .footer { text-align: center; font-size: 11px; color: #999; margin-top: 16px; }
            }
          `;
          document.head.appendChild(style);
        }
        const innholdHTML = byggUtskriftsHTML(ark, { selvstendig: false });
        let area = document.getElementById("print-area-bh");
        if (!area) {
          area = document.createElement("div");
          area.id = "print-area-bh";
          document.body.appendChild(area);
        }
        area.innerHTML = innholdHTML;
        window.addEventListener("beforeprint", beforeHandler);
        window.addEventListener("afterprint", afterHandler);
        setTimeout(() => {
          try { window.print(); } catch (e) { console.warn("[Skriv ut] window.print() kastet feil:", e); }
          setTimeout(() => {
            if (!beforePrintFiret) {
              afterHandler();
              visLokal("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
              setTimeout(() => lastNed(ark), 700);
            }
          }, 1800);
        }, 100);
      } catch (e) {
        console.error("[Skriv ut] uventet feil:", e);
        afterHandler();
        visLokal("⚠️ Utskrift feilet – laster ned i stedet");
        setTimeout(() => lastNed(ark), 500);
      }
    };

    const kanDele = typeof navigator !== "undefined" && typeof navigator.share === "function";
    const del = async (ark) => {
      if (!kanDele) return kopier(ark);
      try {
        const tekst = `${ark.tittel}\n\n🖍️ Tegneoppgave:\n${ark.oppgave}\n\n💬 Samtale med barna:\n${ark.samtale}\n\n📖 Mål: ${ark.mal}\n\n👶 Alder: ${ark.alder}\n\nFra Barnehagehjelpen – Rammeplan 2017`;
        await navigator.share({ title: ark.tittel, text: tekst });
        visLokal("✅ Delt!");
      } catch (e) {
        if (e.name === "AbortError") return;
        visLokal("❌ Kunne ikke dele");
      }
    };

    const kopier = async (ark) => {
      const text = `${ark.tittel}\n\n🖍️ Tegneoppgave:\n${ark.oppgave}\n\n💬 Samtale med barna:\n${ark.samtale}\n\n📖 Mål: ${ark.mal}\n\n👶 Alder: ${ark.alder}`;
      try {
        await navigator.clipboard.writeText(text);
        visLokal("✅ Kopiert til utklippstavlen!");
      } catch {
        visLokal("❌ Kopiering støttes ikke i denne nettleseren");
      }
    };

    if (visAiPanel) return <AiTegnearkView aktivBruker={aktivBruker} onLagre={(ny) => { setUserTegneark(p => [ny, ...p]); setGlobalUserTegneark(p => [ny, ...p]); setVisAiPanel(false); }} onAvbryt={() => setVisAiPanel(false)} />;
    const slettMin = async (dbId) => {
      await slettUserTegneark(dbId, aktivBruker.id);
      setUserTegneark(p => p.filter(t => t.id !== dbId));
      setValgtT(null);
    };
    return (
      <div className="fade">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,margin:0}}>🖍️ Tegneark</h1>
          {aktivBruker&&<button className="btn" onClick={()=>setVisAiPanel(true)} style={{padding:"7px 13px",fontSize:12,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",whiteSpace:"nowrap"}}>🤖 AI-tegneark</button>}
        </div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>{alleData.length} barnevennlige tegneark fordelt på {TEGNEKAT.length-1} kategorier – klikk for å se og skrive ut</p>
        <div style={{background:"#fff8e1",borderRadius:12,padding:"11px 14px",marginBottom:14,borderLeft:"4px solid #6ba0d9",fontSize:12,color:"#795548"}}>
          <strong>💡 Slik bruker du tegnearkene:</strong> Bla i kategoriene under, åpne et ark, trykk "Skriv ut" for å skrive ut, eller "Kopier" for å lagre teksten. Alle ark er koblet til rammeplanen med samtaleforslag.
        </div>
        <div style={{marginBottom:16,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,marginLeft:-4,marginRight:-4,paddingLeft:4,paddingRight:4}}>
          <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
            {[["favoritter","⭐ Favoritter"],["mine","🤖 Mine"],...TEGNEKAT].map(([v,l])=>{
              const cnt = v==="favoritter" ? favSet.size : v==="mine" ? userMapped.length : (v==="alle" ? alleData.length : alleData.filter(t=>t.kategori===v).length);
              return (
                <button key={v} className="btn" onClick={()=>setTkat(v)} style={{padding:"7px 13px",fontSize:11,background:tkat===v?C.g:"#e8f5e9",color:tkat===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
                  <span>{l}</span>
                  <span style={{background:tkat===v?"rgba(255,255,255,0.25)":"rgba(44,91,142,0.12)",color:tkat===v?"#fff":C.g,borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800}}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>
        {valgtT ? (
          <div className="fade" style={{background:C.w,borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
            <Tilbake onClick={()=>setValgtT(null)} />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.t,flex:1,lineHeight:1.2}}>{valgtT.ikon} {valgtT.tittel}</div>
              <button className={`fav-btn ${favSet.has(valgtT.id)?"aktiv":""}`} onClick={()=>toggleFav("tegneark",valgtT.id)} title={favSet.has(valgtT.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt" style={{fontSize:20,flexShrink:0}}>
                {favSet.has(valgtT.id)?"⭐":"☆"}
              </button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              <span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtT.alder}</span>
              {(valgtT.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}
            </div>
            <div id={"svg-ark-"+valgtT.id} className="svg-wrap-hover" style={{background:"linear-gradient(135deg,#fafffe,#f0f9f4)",border:"2px solid #d8f3dc",borderRadius:16,padding:16,textAlign:"center",marginBottom:16}}>
              <div style={{maxWidth:300,margin:"0 auto"}}>{valgtT.svg}</div>
            </div>
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              <div style={{background:"#fff9c4",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>🖍️ Tegneoppgave</div>
                <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{valgtT.oppgave}</div>
              </div>
              <div style={{background:"#e8f5e9",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#2e7d32",fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>💬 Samtale med barna</div>
                <div style={{display:"grid",gap:4}}>
                  {(valgtT.samtale||"").split("?").map(s=>s.trim()).filter(s=>s.length>3).map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",fontSize:13,color:C.t,lineHeight:1.5}}>
                      <span style={{color:"#2e7d32",fontWeight:800,flexShrink:0,marginTop:1}}>•</span>
                      <span>{s}?</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"#e3f2fd",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#1565c0",fontSize:11,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>📖 Rammeplanen</div>
                <div style={{fontSize:13,color:C.t}}>{valgtT.mal}</div>
              </div>
            </div>
            {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:8,textAlign:"center"}}>{lokalToast}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="btn" onClick={()=>skrivUt(valgtT)} style={{background:C.g,color:"#fff",padding:"12px",fontSize:13,fontWeight:800}}>🖨️ Skriv ut</button>
              <button className="btn" onClick={()=>lastNed(valgtT)} style={{background:"#2c5b8e",color:"#fff",padding:"12px",fontSize:13,fontWeight:800}}>💾 Last ned</button>
              <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8f5e9",color:C.t,padding:"12px",fontSize:13,fontWeight:700}}>📋 Kopier tekst</button>
              {kanDele
                ? <button className="btn" onClick={()=>del(valgtT)} style={{background:"#fff3e0",color:"#e65100",padding:"12px",fontSize:13,fontWeight:700}}>📤 Del</button>
                : <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8eff8",color:C.t,padding:"12px",fontSize:13,fontWeight:700}}>📋 Kopier (igjen)</button>
              }
            </div>
            {valgtT._erMin && <button className="btn" onClick={()=>slettMin(valgtT._dbId)} style={{width:"100%",marginTop:8,padding:"10px",fontSize:13,background:"#ffebee",color:"#c62828",fontWeight:700}}>🗑️ Slett mitt tegneark</button>}
          </div>
        ) : (
          <>
            {data.length===0 && (
              <div style={{textAlign:"center",padding:28,color:C.gr,background:C.w,borderRadius:12}}>
                {tkat==="favoritter" ? "Du har ingen favoritt-tegneark ennå – trykk på ⭐ for å lagre" : "Ingen tegneark i denne kategorien"}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {data.map(t=>(
                <div key={t.id} className="hover fade" onClick={()=>setValgtT(t)} style={{background:C.w,borderRadius:14,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 8px rgba(44,91,142,0.08)",position:"relative"}}>
                  <button className={`fav-btn ${favSet.has(t.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("tegneark",t.id);}} style={{position:"absolute",top:7,right:7,fontSize:15,zIndex:2}} aria-label="Favoritt">
                    {favSet.has(t.id)?"⭐":"☆"}
                  </button>
                  <div style={{background:"linear-gradient(135deg,#f0f9f4,#e8f5e9)",padding:"14px 10px 10px",textAlign:"center"}}>
                    <div style={{maxWidth:120,margin:"0 auto",pointerEvents:"none"}}>{t.svg}</div>
                  </div>
                  <div style={{padding:"9px 11px 11px"}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:13,lineHeight:1.3,marginBottom:3}}>{t._erMin&&<span style={{fontSize:9,background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"1px 5px",marginRight:4,fontWeight:700}}>🤖 AI</span>}{t.tittel}</div>
                    <div style={{fontSize:10,color:C.gr,marginBottom:5}}>👶 {t.alder}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(t.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge,fontSize:9,padding:"1px 5px"}}>{f.ikon} {f.navn.split(",")[0]}</span>:null;})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

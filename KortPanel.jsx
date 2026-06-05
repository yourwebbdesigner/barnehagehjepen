import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { AKTIVITETER } from './data/aktiviteter.js';
import { hentAktivitetskort, lagreNyttAktivitetskort, oppdaterAktivitetskort, slettAktivitetskort, hentKortFavoritter } from './api.js';

import { C } from './utils.js';
import { sanitizeForPrompt } from './data/ai-data.js';

const KORT_KATEGORIER = [
  { id:"Lek",         ikon:"🎮", bg:"#e3f2fd", txt:"#1565c0" },
  { id:"Natur",       ikon:"🌿", bg:"#e8f5e9", txt:"#2e7d32" },
  { id:"Vann",        ikon:"💧", bg:"#e1f5fe", txt:"#0277bd" },
  { id:"Bevegelse",   ikon:"🏃", bg:"#fff3e0", txt:"#e65100" },
  { id:"Kreativt",    ikon:"🎨", bg:"#fce4ec", txt:"#880e4f" },
  { id:"Språk",       ikon:"💬", bg:"#f3e5f5", txt:"#6a1b9a" },
  { id:"Antall",      ikon:"🔢", bg:"#e8eaf6", txt:"#283593" },
  { id:"Musikk",      ikon:"🎵", bg:"#fbe9e7", txt:"#bf360c" },
  { id:"Ute",         ikon:"🌳", bg:"#f1f8e9", txt:"#33691e" },
  { id:"Rolig",       ikon:"🧘", bg:"#e0f2f1", txt:"#004d40" },
  { id:"Eksperiment", ikon:"🔬", bg:"#fff8e1", txt:"#ff6f00" },
  { id:"Sosialt",     ikon:"🤝", bg:"#fce4ec", txt:"#c2185b" },
];

const KORT_IKONER = [
  "🦁","🐸","🐻","🐼","🐨","🐱","🐶","🦊","🐮","🐷","🐔","🦆","🐣","🦖","🦕","🐢","🐛","🐞","🐝","🦋","🐧","🐬","🐙","🦓","🐘",
  "🌈","🌞","🌻","🌸","🌺","🌼","🌷","🍄","🌲","🌿","💧","🌊","🏔️","🍂","❄️","⛄","🌙","⭐","💫",
  "🎨","🎵","🎭","🧩","🎈","🎪","🏃","⚽","🏀","🎠","🚂","🚀","🧸","🎀","🎁",
  "🍎","🍓","🍭","🧁","🍕",
  "🤝","🔬","🧲","🎯","🦄","🏕️","🎶","🖍️","✂️","🔑"
];
import { Tilbake, FagTag } from './components.jsx';
function KortModal({ kort, onLagre, onLukk }) {
  const iS = { width:"100%", border:"1.5px solid var(--c-input-border)", borderRadius:9, padding:"9px 13px", fontSize:13, background:"var(--c-input-bg)", color:"var(--c-t)", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box", marginBottom:10 };
  const lS = { fontSize:11, fontWeight:800, color:C.gr, display:"block", marginBottom:3, marginTop:8 };
  const [form, setForm] = useState({
    title: kort?.title || "",
    description: kort?.description || "",
    category: kort?.category || "Lek",
    age_group: kort?.age_group || "3-5 år",
    materials: kort?.materials || "",
    steps: kort?.steps || "",
    curriculum_area: kort?.curriculum_area || [],
    learning_goal: kort?.learning_goal || "",
    duration: kort?.duration || "",
    difficulty: kort?.difficulty || "middels",
    indoor_outdoor: kort?.indoor_outdoor || "begge",
    icon: kort?.icon || "🎯",
    is_public: kort?.is_public || false,
    id: kort?.id || undefined,
  });
  const opd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFag = (fId) => setForm(p => ({ ...p, curriculum_area: p.curriculum_area.includes(fId) ? p.curriculum_area.filter(x=>x!==fId) : [...p.curriculum_area, fId] }));
  const kat = KORT_KATEGORIER.find(k => k.id === form.category) || KORT_KATEGORIER[0];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:350, overflowY:"auto", padding:"16px 12px", display:"flex", alignItems:"flex-start", justifyContent:"center" }} onClick={e => { if(e.target===e.currentTarget) onLukk(); }}>
      <div className="pop" style={{ background:C.w, borderRadius:18, width:"100%", maxWidth:580, boxShadow:"0 12px 40px rgba(0,0,0,0.22)", overflow:"hidden", marginTop:8 }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${kat.txt},#2c5b8e)`, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff" }}>
            {form.id ? "✏️ Rediger aktivitetskort" : "➕ Nytt aktivitetskort"}
          </div>
          <button onClick={onLukk} style={{ background:"rgba(255,255,255,0.18)", border:"none", color:"#fff", width:30, height:30, borderRadius:7, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ padding:"16px 20px 20px", overflowY:"auto", maxHeight:"76vh" }}>
          {/* Ikon-velger */}
          <label style={lS}>Ikon</label>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8, maxHeight:116, overflowY:"auto", padding:"2px 0" }}>
            {KORT_IKONER.map(i => (
              <button key={i} onClick={() => opd("icon", i)} style={{ width:34, height:34, borderRadius:8, border:form.icon===i?"2px solid var(--c-g)":"1.5px solid var(--c-input-border)", background:form.icon===i?"var(--c-lg2)":"var(--c-card)", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i}</button>
            ))}
          </div>

          <label style={lS}>Tittel *</label>
          <input value={form.title} onChange={e=>opd("title",e.target.value)} placeholder="Tittel på aktivitetskortet" style={iS}/>

          <label style={lS}>Beskrivelse</label>
          <textarea value={form.description} onChange={e=>opd("description",e.target.value)} placeholder="Kort beskrivelse av aktiviteten..." style={{ ...iS, minHeight:65, resize:"vertical" }}/>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={lS}>Kategori</label>
              <select value={form.category} onChange={e=>opd("category",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {KORT_KATEGORIER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.id}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Aldersgruppe</label>
              <select value={form.age_group} onChange={e=>opd("age_group",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["0-2 år","1-3 år","2-4 år","3-5 år","3-6 år","4-6 år","5-6 år","Alle aldre"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10 }}>
            <div>
              <label style={lS}>Tidsbruk</label>
              <select value={form.duration} onChange={e=>opd("duration",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["","5-10 min","10-15 min","15-20 min","20-30 min","30-45 min","45-60 min","Hele dagen"].map(d => <option key={d} value={d}>{d||"Ikke oppgitt"}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Vanskelighet</label>
              <select value={form.difficulty} onChange={e=>opd("difficulty",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["enkel","middels","avansert"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Inne / ute</label>
              <select value={form.indoor_outdoor} onChange={e=>opd("indoor_outdoor",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {[["inne","🏠 Inne"],["ute","🌳 Ute"],["begge","🏠🌳 Begge"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <label style={lS}>Utstyr / Materialer</label>
          <textarea value={form.materials} onChange={e=>opd("materials",e.target.value)} placeholder="Hva trenger dere?" style={{ ...iS, minHeight:55, resize:"vertical" }}/>

          <label style={lS}>Gjennomføring (steg-for-steg)</label>
          <textarea value={form.steps} onChange={e=>opd("steps",e.target.value)} placeholder={"Steg 1: ...\nSteg 2: ...\nSteg 3: ..."} style={{ ...iS, minHeight:90, resize:"vertical" }}/>

          <label style={lS}>Hensikt / Læringsmål</label>
          <textarea value={form.learning_goal} onChange={e=>opd("learning_goal",e.target.value)} placeholder="Hva skal barna lære eller oppleve?" style={{ ...iS, minHeight:55, resize:"vertical" }}/>

          <label style={lS}>Fagområder (rammeplan)</label>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12, marginTop:4 }}>
            {FAGOMRADER.map(f => (
              <button key={f.id} onClick={()=>toggleFag(f.id)} style={{ padding:"4px 10px", borderRadius:20, border:form.curriculum_area.includes(f.id)?`2px solid ${f.farge}`:"1.5px solid var(--c-input-border)", background:form.curriculum_area.includes(f.id)?f.lys:"var(--c-w)", color:form.curriculum_area.includes(f.id)?f.farge:C.gr, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
                {f.ikon} {f.id}
              </button>
            ))}
          </div>

          <label style={{ fontSize:12, fontWeight:700, color:C.t, display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom:16 }}>
            <input type="checkbox" checked={form.is_public} onChange={e=>opd("is_public",e.target.checked)} style={{ width:16, height:16, accentColor:"#2c5b8e" }}/>
            🌍 Del med alle i barnehagen (offentlig)
          </label>

          {/* Forhåndsvisning av kortet */}
          <div style={{ background:"var(--c-lg2)", borderRadius:12, padding:12, marginBottom:14, border:"1.5px solid var(--c-divider)" }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.gr, marginBottom:8 }}>FORHÅNDSVISNING</div>
            <div style={{ background:C.w, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(44,91,142,0.09)", maxWidth:240 }}>
              <div style={{ height:5, background:kat.txt }}/>
              <div style={{ padding:"10px 12px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginBottom:6 }}>{form.icon}</div>
                <div style={{ fontWeight:800, fontSize:12, color:C.t, marginBottom:3, lineHeight:1.3 }}>{form.title||"Tittel…"}</div>
                <div style={{ fontSize:10, color:C.gr, lineHeight:1.4, marginBottom:6 }}>{(form.description||"Beskrivelse…").substring(0,60)}</div>
                <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:9, fontWeight:700, background:kat.bg, color:kat.txt }}>{kat.ikon} {form.category}</span>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="btn" onClick={()=>onLagre(form,true)} style={{ flex:1, padding:"10px", fontSize:12, background:C.lg2, color:C.t }}>💾 Lagre som utkast</button>
            <button className="btn" onClick={()=>onLagre(form,false)} disabled={!form.title.trim()} style={{ flex:2, padding:"10px", fontSize:13, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff", opacity:form.title.trim()?1:0.5 }}>✅ Lagre aktivitetskort</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  AKTIVITETSKORT – Hoveddpanel
// ═══════════════════════════════════════════
export default function AktivitetskortPanel({ aktivBruker, onOppdater, preselectKortId, clearPreselectKort }) {
  const [kort, setKort] = useState([]);
  const [laster, setLaster] = useState(true);
  const [visning, setVisning] = useState("grid");
  const [sok, setSok] = useState("");
  const [filterKat, setFilterKat] = useState("alle");
  const [filterType, setFilterType] = useState("alle");
  const [valgtKort, setValgtKort] = useState(null);
  const [modalAapen, setModalAapen] = useState(false);
  const [redigererKort, setRedigererKort] = useState(null);
  const [favSet, setFavSet] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  const [bekreftSlett, setBekreftSlett] = useState(null);
  const [aiPanelAapen, setAiPanelAapen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLaster, setAiLaster] = useState(false);
  const [importerAktivVis, setImporterAktivVis] = useState(false);
  const [sokAkt, setSokAkt] = useState("");
  const [printModus, setPrintModus] = useState(false);
  const [valgtForPrint, setValgtForPrint] = useState(new Set());

  const vis = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""),2800); };
  const iS = { width:"100%", border:"1.5px solid var(--c-input-border)", borderRadius:9, padding:"9px 13px", fontSize:13, background:"var(--c-input-bg)", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" };

  useEffect(() => {
    if (!aktivBruker?.id) return;
    (async () => {
      setLaster(true);
      try {
        const [data, favs] = await Promise.all([hentAktivitetskort(aktivBruker.id), hentKortFavoritter(aktivBruker.id)]);
        setKort(data);
        setFavSet(favs);
      } catch (e) {
        console.error("Feil ved lasting av aktivitetskort:", e);
      } finally {
        setLaster(false);
      }
    })();
  }, [aktivBruker?.id]);

  useEffect(() => {
    if (!preselectKortId || kort.length === 0) return;
    const funnet = kort.find(k => k.id === preselectKortId);
    if (funnet) { setValgtKort(funnet); clearPreselectKort?.(); }
  }, [preselectKortId, kort]);

  const toggleFavKort = async (kortId) => {
    if (!aktivBruker?.id) return;
    const har = favSet.has(kortId);
    const ny = new Set(favSet);
    if (har) {
      ny.delete(kortId);
      const { error } = await supabase.from("activity_card_favorites").delete().eq("user_id", aktivBruker.id).eq("card_id", kortId);
      if (error) { vis("Kunne ikke fjerne favoritt"); return; }
    } else {
      ny.add(kortId);
      const { error } = await supabase.from("activity_card_favorites").insert({ user_id: aktivBruker.id, card_id: kortId });
      if (error) { vis("Kunne ikke legge til favoritt"); return; }
    }
    setFavSet(ny);
    vis(har ? "Fjernet fra favoritter" : "⭐ Lagt til i favoritter");
  };

  const filtrert = kort.filter(k => {
    if (filterType === "mine" && k.created_by !== aktivBruker.id) return false;
    if (filterType === "offentlige" && !k.is_public) return false;
    if (filterType === "utkast" && !k.is_draft) return false;
    if (filterType === "favoritter" && !favSet.has(k.id)) return false;
    if (filterKat !== "alle" && k.category !== filterKat) return false;
    if (sok) { const q = sok.toLowerCase(); return (k.title||"").toLowerCase().includes(q) || (k.description||"").toLowerCase().includes(q); }
    return true;
  });

  const trekkTilfeldig = () => {
    if (filtrert.length === 0) { vis("Ingen kort å trekke"); return; }
    setValgtKort(filtrert[Math.floor(Math.random() * filtrert.length)]);
  };

  const katInfo = (katId) => KORT_KATEGORIER.find(k => k.id === katId) || { ikon:"🎯", bg:"#e8eff8", txt:C.g };

  const togglePrintValg = (id) => setValgtForPrint(p => { const ny = new Set(p); ny.has(id) ? ny.delete(id) : ny.add(id); return ny; });

  const skrivUtEttKort = (k) => {
    const kat = katInfo(k.category);
    const besk = k.description ? '<div style="background:#fff9c4;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#795548;margin-bottom:4px;">🎯 Beskrivelse</div><p style="font-size:13px;line-height:1.7;">' + k.description + '</p></div>' : '';
    const steg = k.steps ? '<div style="background:#e8f5e9;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#2e7d32;margin-bottom:4px;">⚙️ Gjennomføring</div><div style="font-size:13px;line-height:1.8;white-space:pre-line;">' + k.steps + '</div></div>' : '';
    const maal = k.learning_goal ? '<div style="background:#e3f2fd;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#1565c0;margin-bottom:4px;">❓ Læringsmål</div><div style="font-size:13px;line-height:1.7;">' + k.learning_goal + '</div></div>' : '';
    const mat = k.materials ? '<div style="background:#fce4ec;border-radius:8px;padding:12px;"><div style="font-weight:bold;font-size:12px;color:#c62828;margin-bottom:4px;">🧰 Materialer</div><div style="font-size:13px;">' + k.materials + '</div></div>' : '';
    skrivUtVindu('<div style="max-width:600px;margin:0 auto;"><div style="background:#fff;border-radius:10px;border:1.5px solid #d0dff0;overflow:hidden;"><div style="height:6px;background:' + kat.txt + ';"></div><div style="padding:18px;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;"><div style="width:46px;height:46px;border-radius:10px;background:' + kat.bg + ';display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">' + (k.icon||kat.ikon) + '</div><div><div style="font-weight:bold;font-size:18px;color:#1a2a3a;">' + k.title + '</div><div style="font-size:11px;color:#888;">' + k.category + (k.age_group?' · '+k.age_group:'') + (k.duration?' · ⏱ '+k.duration:'') + (k.difficulty?' · '+k.difficulty:'') + '</div></div></div>' + besk + steg + maal + mat + '</div></div><div style="margin-top:14px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', k.title);
  };

  const skrivUtFlereKort = () => {
    const liste = kort.filter(k => valgtForPrint.has(k.id));
    if (liste.length === 0) { vis("Velg minst ett kort å skrive ut"); return; }
    const kortHtml = liste.map(k => {
      const kat = katInfo(k.category);
      const steg = k.steps ? '<div style="background:#e8f5e9;border-radius:6px;padding:9px 10px;margin-bottom:6px;"><div style="font-weight:bold;font-size:10px;color:#2e7d32;margin-bottom:3px;">⚙️ GJENNOMFØRING</div><div style="font-size:11px;line-height:1.6;white-space:pre-line;">' + k.steps + '</div></div>' : '';
      const maal = k.learning_goal ? '<div style="background:#e3f2fd;border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:10px;color:#1565c0;"><strong>❓ Læringsmål:</strong> ' + k.learning_goal + '</div>' : '';
      const mat = k.materials ? '<div style="font-size:10px;color:#666;"><strong>🧰</strong> ' + k.materials + '</div>' : '';
      return '<div style="background:#fff;border-radius:10px;border:1.5px solid #d0dff0;overflow:hidden;break-inside:avoid;page-break-inside:avoid;"><div style="height:5px;background:' + kat.txt + ';"></div><div style="padding:12px;"><div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:8px;background:' + kat.bg + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + (k.icon||kat.ikon) + '</div><div><div style="font-weight:bold;font-size:14px;color:#1a2a3a;">' + k.title + '</div><div style="font-size:10px;color:#888;">' + k.category + (k.age_group?' · '+k.age_group:'') + (k.duration?' · '+k.duration:'') + '</div></div></div>' + (k.description?'<p style="font-size:11px;color:#444;margin-bottom:7px;line-height:1.5;">' + k.description + '</p>':'') + steg + maal + mat + '</div></div>';
    }).join('');
    skrivUtVindu('<div style="max-width:720px;margin:0 auto;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' + kortHtml + '</div><div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev · ' + liste.length + ' aktivitetskort</div></div>', 'Aktivitetskort (' + liste.length + ')');
  };

  const lagreKort = async (data, erUtkast = false) => {
    try {
      const payload = { ...data, created_by: aktivBruker.id, is_custom: true, is_draft: erUtkast };
      let resultat;
      if (data.id) {
        resultat = await oppdaterAktivitetskort(data.id, payload);
        setKort(p => p.map(k => k.id === data.id ? resultat : k));
        if (valgtKort?.id === data.id) setValgtKort(resultat);
        vis(erUtkast ? "💾 Utkast oppdatert" : "✅ Kort oppdatert");
      } else {
        resultat = await lagreNyttAktivitetskort(payload);
        setKort(p => [resultat, ...p]);
        vis(erUtkast ? "💾 Utkast lagret" : "✅ Aktivitetskort lagret!");
      }
      setModalAapen(false);
      setRedigererKort(null);
      onOppdater?.();
    } catch (e) {
      console.error(e);
      vis("❌ Kunne ikke lagre kortet");
    }
  };

  const slettKort = async (id) => {
    try {
      await slettAktivitetskort(id);
      setKort(p => p.filter(k => k.id !== id));
      setValgtKort(null);
      setBekreftSlett(null);
      vis("🗑 Kort slettet");
      onOppdater?.();
    } catch { vis("❌ Kunne ikke slette"); }
  };

  const kopierKort = async (k) => {
    try {
      const kopi = { title:k.title+" (kopi)", description:k.description, category:k.category, age_group:k.age_group, materials:k.materials, steps:k.steps, curriculum_area:k.curriculum_area, learning_goal:k.learning_goal, duration:k.duration, difficulty:k.difficulty, indoor_outdoor:k.indoor_outdoor, icon:k.icon, is_public:false, created_by:aktivBruker.id, is_custom:true, is_draft:true };
      const lagret = await lagreNyttAktivitetskort(kopi);
      setKort(p => [lagret, ...p]);
      vis("📋 Kort kopiert (utkast)");
      onOppdater?.();
    } catch { vis("❌ Kopiering feilet"); }
  };

  const importerFraAktivitet = async (aktivitet) => {
    try {
      const payload = { title:aktivitet.tittel, description:aktivitet.hva, category:aktivitet.kategori||"Lek", age_group:aktivitet.alder||"3-6 år", materials:aktivitet.materialer||"", steps:aktivitet.hvordan||"", curriculum_area:aktivitet.rammeplan||[], learning_goal:aktivitet.hvorfor||"", duration:aktivitet.tid||"", difficulty:"middels", indoor_outdoor:"begge", icon:aktivitet.ikon||"🎯", source_activity_id:aktivitet.id, created_by:aktivBruker.id, is_custom:false, is_public:false, is_draft:false };
      const lagret = await lagreNyttAktivitetskort(payload);
      setKort(p => [lagret, ...p]);
      setImporterAktivVis(false);
      vis("✅ Aktivitet konvertert til kort!");
      onOppdater?.();
    } catch { vis("❌ Konvertering feilet"); }
  };

  const genererMedAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLaster(true);
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 28000);
    try {
      const system = `Du er en pedagogisk assistent for norske barnehager. Lag et detaljert aktivitetskort. Svar KUN med et JSON-objekt (ingen annen tekst) i dette formatet:
{"title":"...","description":"...","category":"Lek|Natur|Vann|Bevegelse|Kreativt|Språk|Antall|Musikk|Ute|Rolig|Eksperiment|Sosialt","age_group":"...","materials":"...","steps":"Steg 1: ...\\nSteg 2: ...\\nSteg 3: ...","curriculum_area":["kommunikasjon"],"learning_goal":"...","duration":"...","difficulty":"enkel|middels|avansert","indoor_outdoor":"inne|ute|begge","icon":"🎯","weather_tags":["sol","regn"]}`;
      const r = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ system, prompt: sanitizeForPrompt(aiPrompt, 800), max_tokens: 800 }), signal: ctrl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      const tekst = d.text || "";
      const jsonMatch = tekst.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setRedigererKort(parsed);
          setModalAapen(true);
          setAiPanelAapen(false);
          setAiPrompt("");
        } catch {
          vis("⚠️ AI-svaret hadde ikke riktig format – prøv igjen");
        }
      } else {
        vis("⚠️ AI-svaret hadde ikke riktig format");
      }
    } catch (e) {
      console.error("[AI Aktivitetskort]", e);
      vis(e.name === "AbortError" ? "⏱ AI brukte for lang tid – prøv igjen" : "❌ AI-generering feilet");
    } finally { clearTimeout(tid); setAiLaster(false); }
  };

  // ── Detaljvisning ──
  if (valgtKort) {
    const kat = katInfo(valgtKort.category);
    const erEier = valgtKort.created_by === aktivBruker.id;
    return (
      <div className="fade">
        <Tilbake onClick={() => setValgtKort(null)} />
        <div style={{ background:C.w, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 16px rgba(44,91,142,0.12)" }}>
          <div style={{ height:8, background:kat.txt }}/>
          <div style={{ padding:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:54, height:54, borderRadius:14, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{valgtKort.icon||kat.ikon}</div>
                <div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:21, color:C.t, lineHeight:1.2 }}>{valgtKort.title}</div>
                  {valgtKort.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", marginTop:4 }}>📝 Utkast</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                <button className={`fav-btn ${favSet.has(valgtKort.id)?"aktiv":""}`} onClick={()=>toggleFavKort(valgtKort.id)}>{favSet.has(valgtKort.id)?"⭐":"☆"}</button>
                <button className="btn" onClick={()=>skrivUtEttKort(valgtKort)} style={{ padding:"5px 10px", fontSize:11, background:"#e8f5e9", color:"#2e7d32" }}>🖨️ Skriv ut</button>
                {erEier && <>
                  <button className="btn" onClick={()=>{setRedigererKort(valgtKort);setModalAapen(true);}} style={{ padding:"5px 10px", fontSize:11, background:C.lg2, color:C.t }}>✏️ Rediger</button>
                  <button className="btn" onClick={()=>kopierKort(valgtKort)} style={{ padding:"5px 10px", fontSize:11, background:C.lg2, color:C.t }}>📋 Kopier</button>
                  <button className="btn" onClick={()=>setBekreftSlett(valgtKort.id)} style={{ padding:"5px 10px", fontSize:11, background:"#fce4ec", color:"#c62828" }}>🗑</button>
                </>}
              </div>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
              <span className="tag" style={{ background:kat.bg, color:kat.txt }}>{kat.ikon} {valgtKort.category}</span>
              {valgtKort.age_group && <span className="tag" style={{ background:"var(--c-lg2)", color:C.g }}>👶 {valgtKort.age_group}</span>}
              {valgtKort.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0" }}>⏱ {valgtKort.duration}</span>}
              {valgtKort.difficulty && <span className="tag" style={{ background:"#f3e5f5", color:"#6a1b9a" }}>📊 {valgtKort.difficulty}</span>}
              {valgtKort.indoor_outdoor && <span className="tag" style={{ background:"#f1f8e9", color:"#33691e" }}>{valgtKort.indoor_outdoor==="inne"?"🏠 Inne":valgtKort.indoor_outdoor==="ute"?"🌳 Ute":"🏠🌳 Begge"}</span>}
              {valgtKort.is_public && <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32" }}>🌍 Offentlig</span>}
            </div>
            {valgtKort.description && <div style={{ background:"#fff9c4", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#795548", marginBottom:4, fontSize:13 }}>🎯 Beskrivelse</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7 }}>{valgtKort.description}</div></div>}
            {valgtKort.steps && <div style={{ background:"#e8f5e9", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#2e7d32", marginBottom:4, fontSize:13 }}>⚙️ Gjennomføring</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7, whiteSpace:"pre-line" }}>{valgtKort.steps}</div></div>}
            {valgtKort.learning_goal && <div style={{ background:"#e3f2fd", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#1565c0", marginBottom:4, fontSize:13 }}>❓ Læringsmål</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7 }}>{valgtKort.learning_goal}</div></div>}
            {valgtKort.materials && <div style={{ background:"#fce4ec", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#c62828", marginBottom:4, fontSize:13 }}>🧰 Materialer</div><div style={{ color:C.t, fontSize:13 }}>{valgtKort.materials}</div></div>}
            {valgtKort.curriculum_area?.length > 0 && <div style={{ marginBottom:10 }}><div style={{ fontSize:12, fontWeight:700, color:C.gr, marginBottom:7 }}>Rammeplan:</div><div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>{valgtKort.curriculum_area.map(r=><FagTag key={r} rid={r}/>)}</div></div>}
            {valgtKort.weather_tags?.length > 0 && <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>{valgtKort.weather_tags.map(t=><span key={t} className="tag" style={{ background:"#e1f5fe", color:"#0277bd" }}>🌤 {t}</span>)}</div>}
          </div>
        </div>
        {bekreftSlett && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div className="pop" style={{ background:C.w, borderRadius:16, padding:24, maxWidth:320, width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:C.t, marginBottom:10 }}>Slette kortet?</div>
              <p style={{ fontSize:13, color:C.t, lineHeight:1.6, marginBottom:16 }}>Dette kan ikke angres.</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setBekreftSlett(null)} style={{ flex:1, padding:11, background:C.lg2, color:C.t, border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Avbryt</button>
                <button onClick={()=>slettKort(bekreftSlett)} style={{ flex:1, padding:11, background:"#c62828", color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>🗑 Slett</button>
              </div>
            </div>
          </div>
        )}
        {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
        {modalAapen && <KortModal kort={redigererKort} onLagre={lagreKort} onLukk={()=>{setModalAapen(false);setRedigererKort(null);}}/>}
      </div>
    );
  }

  // ── Import fra eksisterende aktiviteter (modal) ──
  if (importerAktivVis) {
    const allAkt = AKTIVITETER.filter(a => {
      if (!sokAkt) return true;
      return (a.tittel||"").toLowerCase().includes(sokAkt.toLowerCase());
    });
    const alleredeImportert = new Set(kort.filter(k=>k.source_activity_id).map(k=>k.source_activity_id));
    return (
      <div className="fade">
        <Tilbake onClick={()=>setImporterAktivVis(false)}/>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:C.t, marginBottom:4 }}>🔄 Importer fra aktiviteter</div>
        <p style={{ color:C.gr, fontSize:12, marginBottom:12 }}>Velg en aktivitet og konverter den til et aktivitetskort.</p>
        <input value={sokAkt} onChange={e=>setSokAkt(e.target.value)} placeholder="🔍 Søk i aktiviteter..." style={{ ...iS, marginBottom:12 }}/>
        <div style={{ display:"grid", gap:8 }}>
          {allAkt.map(a => (
            <div key={a.id} className="hover" style={{ background:C.w, borderRadius:12, padding:"12px 14px", boxShadow:"0 2px 7px rgba(44,91,142,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:C.t, fontSize:13 }}>{a.tittel}</div>
                <div style={{ fontSize:11, color:C.gr, marginTop:2 }}>{a.kategori} · {a.alder}</div>
              </div>
              {alleredeImportert.has(a.id)
                ? <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:10 }}>✅ Importert</span>
                : <button className="btn" onClick={()=>importerFraAktivitet(a)} style={{ padding:"6px 12px", fontSize:11, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff" }}>Importer →</button>
              }
            </div>
          ))}
        </div>
        {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
      </div>
    );
  }

  // ── Hovedliste / grid ──
  return (
    <div className="fade">
      {/* Topp-header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, gap:8, flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.t, margin:0 }}>🃏 Aktivitetskort</h1>
          <p style={{ color:C.gr, fontSize:12, marginTop:2 }}>{kort.length} kort · {filtrert.length} vises</p>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <button className="btn" onClick={()=>setAiPanelAapen(!aiPanelAapen)} style={{ padding:"7px 11px", fontSize:11, background:aiPanelAapen?"#4178bd":"#e3f2fd", color:aiPanelAapen?"#fff":"#1565c0" }}>🤖 AI</button>
          <button className="btn" onClick={()=>setImporterAktivVis(true)} style={{ padding:"7px 11px", fontSize:11, background:"#f3e5f5", color:"#6a1b9a" }}>🔄 Importer</button>
          <button className="btn" onClick={trekkTilfeldig} style={{ padding:"7px 11px", fontSize:11, background:"#fff8e1", color:"#ff6f00" }}>🎲 Trekk</button>
          <button className="btn" onClick={()=>{setPrintModus(!printModus);setValgtForPrint(new Set());}} style={{ padding:"7px 11px", fontSize:11, background:printModus?"#2e7d32":"#e8f5e9", color:printModus?"#fff":"#2e7d32" }}>{printModus?"✕ Avbryt":"🖨️ Velg"}</button>
          {printModus && valgtForPrint.size > 0 && <button className="btn" onClick={skrivUtFlereKort} style={{ padding:"7px 13px", fontSize:12, background:"#2e7d32", color:"#fff", fontWeight:800 }}>🖨️ Skriv ut {valgtForPrint.size}</button>}
          <button className="btn" onClick={()=>{setRedigererKort(null);setModalAapen(true);}} style={{ padding:"7px 13px", fontSize:12, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff" }}>➕ Nytt kort</button>
        </div>
      </div>

      {/* AI-panel */}
      {aiPanelAapen && (
        <div className="fade" style={{ background:"linear-gradient(135deg,#1f4068,#3a72b0)", borderRadius:14, padding:16, marginBottom:14, color:"#fff" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, marginBottom:6 }}>🤖 AI-generator for aktivitetskort</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", marginBottom:8 }}>Beskriv hva du vil ha – AI lager et komplett aktivitetskort.</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
            {["Naturtema 4-åringer, samarbeid","Vannlek sommeren, eksperimentering","Rolig inneaktivitet, språk 3-5 år","Bevegelseslek ute for hele gruppa"].map(t => (
              <button key={t} className="btn" onClick={()=>setAiPrompt(t)} style={{ padding:"4px 9px", fontSize:10, background:"rgba(255,255,255,0.15)", color:"#fff" }}>{t}</button>
            ))}
          </div>
          <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Eks: Lag et aktivitetskort for 4-åringer med naturtema og fokus på samarbeid..." style={{ ...iS, minHeight:70, resize:"vertical", marginBottom:8 }}/>
          <button className="btn" onClick={genererMedAI} disabled={aiLaster||!aiPrompt.trim()} style={{ padding:"9px 18px", fontSize:13, background:aiLaster?"rgba(255,255,255,0.5)":"#fff", color:C.g, fontWeight:800, opacity:aiPrompt.trim()?1:0.6 }}>
            {aiLaster ? "⏳ Genererer..." : "✨ Generer aktivitetskort"}
          </button>
        </div>
      )}

      {/* Søk */}
      <input value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk etter aktivitetskort..." style={{ ...iS, marginBottom:8 }}/>

      {/* Type-filter */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", marginBottom:7, paddingBottom:2 }}>
        <div style={{ display:"flex", gap:5, width:"max-content" }}>
          {[["alle","Alle"],["mine","Mine"],["offentlige","Offentlige"],["favoritter","⭐ Favoritter"],["utkast","📝 Utkast"]].map(([v,l]) => (
            <button key={v} className="btn" onClick={()=>setFilterType(v)} style={{ padding:"5px 11px", fontSize:11, background:filterType===v?C.g:C.lg2, color:filterType===v?"#fff":C.t, whiteSpace:"nowrap" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Kategori-filter */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", marginBottom:8, paddingBottom:2 }}>
        <div style={{ display:"flex", gap:5, width:"max-content" }}>
          <button className="btn" onClick={()=>setFilterKat("alle")} style={{ padding:"4px 10px", fontSize:10, background:filterKat==="alle"?C.g:C.lg2, color:filterKat==="alle"?"#fff":C.t }}>Alle</button>
          {KORT_KATEGORIER.map(k => (
            <button key={k.id} className="btn" onClick={()=>setFilterKat(k.id)} style={{ padding:"4px 10px", fontSize:10, background:filterKat===k.id?k.txt:k.bg, color:filterKat===k.id?"#fff":k.txt, whiteSpace:"nowrap" }}>
              {k.ikon} {k.id}
            </button>
          ))}
        </div>
      </div>

      {/* Visnings-toggle + tell */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:11, color:C.gr }}>Viser {filtrert.length} aktivitetskort</div>
        <div style={{ display:"flex", gap:4 }}>
          <button className="btn" onClick={()=>setVisning("grid")} style={{ padding:"4px 10px", fontSize:13, background:visning==="grid"?C.g:C.lg2, color:visning==="grid"?"#fff":C.t }}>⊞</button>
          <button className="btn" onClick={()=>setVisning("liste")} style={{ padding:"4px 10px", fontSize:13, background:visning==="liste"?C.g:C.lg2, color:visning==="liste"?"#fff":C.t }}>≡</button>
        </div>
      </div>

      {/* Tom-tilstand: ingen kort enda */}
      {!laster && kort.length === 0 && (
        <div className="fade" style={{ background:"#e8f5e9", borderRadius:12, padding:20, marginBottom:14, border:"1.5px dashed #66bb6a", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🃏</div>
          <div style={{ fontWeight:800, color:"#2e7d32", marginBottom:6, fontSize:14 }}>Ingen aktivitetskort enda</div>
          <p style={{ fontSize:12, color:"#2e7d32", lineHeight:1.6, marginBottom:12 }}>Lag ditt første kort fra bunnen, importer fra eksisterende aktiviteter, eller la AI hjelpe deg!</p>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn" onClick={()=>{setRedigererKort(null);setModalAapen(true);}} style={{ padding:"8px 14px", fontSize:12, background:"#2e7d32", color:"#fff" }}>➕ Lag nytt kort</button>
            <button className="btn" onClick={()=>setAiPanelAapen(true)} style={{ padding:"8px 14px", fontSize:12, background:"#1565c0", color:"#fff" }}>🤖 Lag med AI</button>
            <button className="btn" onClick={()=>setImporterAktivVis(true)} style={{ padding:"8px 14px", fontSize:12, background:"#6a1b9a", color:"#fff" }}>🔄 Importer aktivitet</button>
          </div>
        </div>
      )}

      {laster && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><div className="spin"/></div>}
      {!laster && filtrert.length === 0 && kort.length > 0 && (
        <div style={{ textAlign:"center", padding:28, color:C.gr }}>{sok?`Ingen treff for «${sok}»`:"Ingen kort i denne kategorien"}</div>
      )}

      {/* Grid-visning */}
      {!laster && visning === "grid" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:10 }}>
          {filtrert.map(k => {
            const kat = katInfo(k.category);
            return (
              <div key={k.id} className="hover fade" onClick={()=> printModus ? togglePrintValg(k.id) : setValgtKort(k)} style={{ background:C.w, borderRadius:14, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 10px rgba(44,91,142,0.09)", position:"relative", outline: printModus && valgtForPrint.has(k.id) ? "2.5px solid #2e7d32" : "none" }}>
                {printModus && <div style={{ position:"absolute", top:8, left:8, zIndex:2, width:20, height:20, borderRadius:5, background: valgtForPrint.has(k.id) ? "#2e7d32" : "#fff", border:"1.5px solid #2e7d32", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800 }}>{valgtForPrint.has(k.id) ? "✓" : ""}</div>}
                <div style={{ height:5, background:kat.txt }}/>
                <div style={{ padding:"14px 14px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:8 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{k.icon||kat.ikon}</div>
                    {!printModus && <button className={`fav-btn ${favSet.has(k.id)?"aktiv":""}`} onClick={e=>{e.stopPropagation();toggleFavKort(k.id);}} style={{ fontSize:15 }}>{favSet.has(k.id)?"⭐":"☆"}</button>}
                  </div>
                  <div style={{ fontWeight:800, color:C.t, fontSize:14, marginBottom:4, lineHeight:1.3 }}>{k.title}</div>
                  <div style={{ fontSize:11, color:C.gr, lineHeight:1.5, marginBottom:8 }}>{(k.description||"").substring(0,80)}{(k.description||"").length>80?"...":""}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    <span className="tag" style={{ background:kat.bg, color:kat.txt, fontSize:10 }}>{kat.ikon} {k.category}</span>
                    {k.age_group && <span className="tag" style={{ background:"var(--c-lg2)", color:C.g, fontSize:10 }}>👶 {k.age_group}</span>}
                    {k.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0", fontSize:10 }}>⏱ {k.duration}</span>}
                    {k.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", fontSize:10 }}>Utkast</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liste-visning */}
      {!laster && visning === "liste" && (
        <div style={{ display:"grid", gap:7 }}>
          {filtrert.map(k => {
            const kat = katInfo(k.category);
            return (
              <div key={k.id} className="hover fade" onClick={()=> printModus ? togglePrintValg(k.id) : setValgtKort(k)} style={{ background:C.w, borderRadius:12, padding:"13px 15px", cursor:"pointer", boxShadow:"0 2px 7px rgba(44,91,142,0.07)", borderLeft:`4px solid ${kat.txt}`, outline: printModus && valgtForPrint.has(k.id) ? "2.5px solid #2e7d32" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:18 }}>{k.icon||kat.ikon}</span>
                      <div style={{ fontWeight:800, color:C.t, fontSize:14 }}>{k.title}</div>
                    </div>
                    <div style={{ color:C.gr, fontSize:11, marginBottom:5 }}>{(k.description||"").substring(0,90)}{(k.description||"").length>90?"...":""}</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      <span className="tag" style={{ background:kat.bg, color:kat.txt, fontSize:10 }}>{k.category}</span>
                      {k.age_group && <span className="tag" style={{ background:"var(--c-lg2)", color:C.g, fontSize:10 }}>{k.age_group}</span>}
                      {k.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0", fontSize:10 }}>{k.duration}</span>}
                      {k.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", fontSize:10 }}>Utkast</span>}
                      {k.is_public && <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:10 }}>🌍</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {printModus ? <div style={{ width:20, height:20, borderRadius:5, background: valgtForPrint.has(k.id) ? "#2e7d32" : "#fff", border:"1.5px solid #2e7d32", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800 }}>{valgtForPrint.has(k.id) ? "✓" : ""}</div> : <button className={`fav-btn ${favSet.has(k.id)?"aktiv":""}`} onClick={e=>{e.stopPropagation();toggleFavKort(k.id);}} style={{ fontSize:15 }}>{favSet.has(k.id)?"⭐":"☆"}</button>}
                    <span style={{ color:C.gr, fontSize:17 }}>›</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAapen && <KortModal kort={redigererKort} onLagre={lagreKort} onLukk={()=>{setModalAapen(false);setRedigererKort(null);}}/>}
      {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
    </div>
  );
}

// ── Modul-nivå komponenter (stabile referanser – monteres ikke på nytt ved parent-render) ──



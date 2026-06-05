import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { SANGER } from './data/sanger.js';
import { FAGOMRADER } from './data/rammeplan.js';
import { C, escapeHTML, mdToHtml, stripMd, skrivUtVindu } from './utils.js';
import { sanitizeForPrompt } from './data/ai-data.js';
import { Tilbake, FagTag } from './components.jsx';

export async function hentUserSanger(userId) {
  const { data } = await supabase.from("user_sanger").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}
async function lagreUserSang(sang) {
  const { data, error } = await supabase.from("user_sanger").insert(sang).select().single();
  return { data, error };
}
async function slettUserSang(id, userId) {
  return await supabase.from("user_sanger").delete().eq("id", id).eq("user_id", userId);
}

function AiSangerView({ aktivBruker, onLagre, onAvbryt }) {
  const [form, setForm] = useState({ sjanger:"sang", tema:"", aldersgruppe:"3-6", antallVers:"2", melodi:"", fagomrade:"", ekstra:"" });
  const [genererer, setGenererer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [feil, setFeil] = useState(null);
  const [lagrer, setLagrer] = useState(false);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const generer = async () => {
    if (!form.tema.trim()) return;
    setGenererer(true); setFeil(null); setResultat(null);
    const sjangerTekst = {sang:"sang",rim:"rim",regle:"regle"}[form.sjanger]||"sang";
    const prompt = `Lag en original ${sjangerTekst} for barn i alderen ${form.aldersgruppe} år.\n\nTema: ${sanitizeForPrompt(form.tema,100)}\nAntall vers: ${form.antallVers}${form.melodi?"\nMelodi/toneleie: "+sanitizeForPrompt(form.melodi,80):""}${form.fagomrade?"\nKobling til fagområde: "+form.fagomrade:""}${form.ekstra?"\nØnsker: "+sanitizeForPrompt(form.ekstra,200):""}\n\nSvar KUN med gyldig JSON:\n{\n  "tittel": "tittel på sangen",\n  "tekst": "hele teksten med vers og evt. refreng, formatert med linjeskift",\n  "kategori": "${form.sjanger}",\n  "alder": "${form.aldersgruppe} år",\n  "melodi": "eventuell melodi-anbefaling eller null",\n  "tips": "pedagogisk tips til pedagogen eller null",\n  "rammeplan": ["id-er fra: kropp_bevegelse, kunst_kultur, natur_miljo, antall_rom_form, etikk_religion, naerlighet_vennskap, kommunikasjon_sprak"]\n}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 28000);
    try {
      const res = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ system:"Du er en erfaren barnehagelærer og forfatter av barnesanger. Skriv alltid på norsk bokmål. Svar KUN med gyldig JSON.", prompt, max_tokens:700 }), signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const raw = json.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Ugyldig svar fra AI");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.tittel || !parsed.tekst) throw new Error("AI-svar manglet påkrevde felt");
      setResultat(parsed);
    } catch(e) {
      console.error("[AI Sanger]", e);
      // Fallback: vis en tilfeldig sang fra databasen i stedet for tom feilmelding
      const sjangere = form.sjanger ? SANGER.filter(s => s.kategori === form.sjanger) : SANGER;
      const pool = sjangere.length > 0 ? sjangere : SANGER;
      const fbS = pool[Math.floor(Math.random() * pool.length)];
      setResultat({ tittel: fbS.tittel, tekst: fbS.tekst, kategori: fbS.kategori, alder: fbS.alder, melodi: fbS.melodi || null, tips: fbS.tips || null, rammeplan: fbS.rammeplan || [] });
      setFeil("ℹ️ AI var utilgjengelig – viser eksisterende sang som inspirasjon");
    } finally { clearTimeout(tid); setGenererer(false); }
  };
  const lagre = async () => {
    if (!resultat || !aktivBruker?.id) return;
    setLagrer(true);
    const { data, error } = await lagreUserSang({ user_id:aktivBruker.id, tittel:resultat.tittel, tekst:resultat.tekst, kategori:resultat.kategori||form.sjanger, alder:resultat.alder||form.aldersgruppe+" år", melodi:resultat.melodi||null, tips:resultat.tips||null, rammeplan:resultat.rammeplan||[], ai_generert:true });
    setLagrer(false);
    if (error) { setFeil("Feil ved lagring: "+error.message); return; }
    onLagre(data);
  };
  return (
    <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
      <Tilbake onClick={onAvbryt}/>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:4}}>🤖 AI-sanger</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:18}}>La AI lage en original sang, rim eller regle tilpasset barnegruppen din</p>
      {!resultat ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Sjanger</label>
              <select value={form.sjanger} onChange={e=>setForm(p=>({...p,sjanger:e.target.value}))} style={iS}>
                <option value="sang">🎤 Sang</option>
                <option value="rim">📝 Rim</option>
                <option value="regle">📣 Regle</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Aldersgruppe</label>
              <select value={form.aldersgruppe} onChange={e=>setForm(p=>({...p,aldersgruppe:e.target.value}))} style={iS}>
                <option value="1-2">1–2 år</option>
                <option value="2-3">2–3 år</option>
                <option value="3-4">3–4 år</option>
                <option value="3-6">3–6 år</option>
                <option value="4-6">4–6 år</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Tema / innhold *</label>
            <input value={form.tema} onChange={e=>setForm(p=>({...p,tema:e.target.value}))} placeholder="f.eks. dyr i skogen, årstider, vennskap, tall..." style={iS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Antall vers</label>
              <select value={form.antallVers} onChange={e=>setForm(p=>({...p,antallVers:e.target.value}))} style={iS}>
                <option value="1">1 vers</option>
                <option value="2">2 vers</option>
                <option value="3">3 vers + refreng</option>
                <option value="4">4 vers + refreng</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Fagområde (valgfritt)</label>
              <select value={form.fagomrade} onChange={e=>setForm(p=>({...p,fagomrade:e.target.value}))} style={iS}>
                <option value="">– Velg –</option>
                {FAGOMRADER.map(f=><option key={f.id} value={f.navn}>{f.ikon} {f.navn}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Melodi-ønske (valgfritt)</label>
            <input value={form.melodi} onChange={e=>setForm(p=>({...p,melodi:e.target.value}))} placeholder="f.eks. Byssan lull, enkel melodi barna kan synge..." style={iS}/>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <button className="btn" onClick={generer} disabled={genererer||!form.tema.trim()} style={{width:"100%",padding:"12px 0",fontSize:14,background:genererer?C.gr:C.g,color:"#fff"}}>
            {genererer?"⏳ Genererer sang...":"✨ Generer sang"}
          </button>
        </>
      ) : (
        <div className="fade">
          <div style={{background:"#f5f9fd",borderRadius:12,padding:18,marginBottom:16,border:"1.5px solid #c4d6ec"}}>
            <div style={{fontWeight:800,fontSize:18,color:C.t,marginBottom:4}}>{resultat.tittel}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:14}}>{resultat.kategori} · {resultat.alder}{resultat.melodi?" · 🎼 "+resultat.melodi:""}</div>
            <pre style={{whiteSpace:"pre-wrap",fontFamily:"'Nunito',sans-serif",fontSize:15,lineHeight:2,color:C.t,marginBottom:12}}>{resultat.tekst}</pre>
            {resultat.tips&&<div style={{background:"#fffde7",borderRadius:8,padding:"10px 13px",fontSize:13,color:"#795548"}}><strong>💡 Tips:</strong> {resultat.tips}</div>}
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={lagre} disabled={lagrer} style={{flex:1,padding:"11px 0",fontSize:14,background:lagrer?C.gr:"#2e7d32",color:"#fff"}}>
              {lagrer?"⏳ Lagrer...":"💾 Lagre i Mine sanger"}
            </button>
            <button className="btn" onClick={()=>setResultat(null)} style={{padding:"11px 18px",fontSize:13,background:C.lg2,color:C.t}}>↩ Prøv igjen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SangerSideComp({ favoritter, toggleFav, aktivBruker, onNyUserSang, preselectId, clearPreselect }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [visMaks, setVisMaks] = useState(20);
  const [valgt, setValgt] = useState(() => preselectId ? SANGER.find(s => s.id === preselectId) || null : null);
  const [visAiPanel, setVisAiPanel] = useState(false);
  const [userSanger, setUserSanger] = useState([]);
  const [lasterMine, setLasterMine] = useState(false);
  const favSet = new Set(favoritter?.sanger || []);

  useEffect(() => {
    if (!aktivBruker?.id) return;
    setLasterMine(true);
    hentUserSanger(aktivBruker.id)
      .then(s => {
        setUserSanger(s);
        // Prøv å åpne preselect i bruker-sanger (lastet asynkront)
        if (preselectId && !valgt) {
          const funnet = s.find(us => "user_"+us.id === preselectId);
          if (funnet) setValgt({ id:"user_"+funnet.id, tittel:funnet.tittel, tekst:funnet.tekst, kategori:funnet.kategori, alder:funnet.alder, melodi:funnet.melodi, tips:funnet.tips, rammeplan:funnet.rammeplan||[], _dbId:funnet.id, _erMin:true });
        }
      })
      .catch(() => {})
      .finally(() => setLasterMine(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivBruker?.id]);

  useEffect(() => {
    if (preselectId && clearPreselect) clearPreselect();
  }, [preselectId, clearPreselect]);

  const userSangerMapped = userSanger.map(s => ({ id:"user_"+s.id, tittel:s.tittel, tekst:s.tekst, kategori:s.kategori, alder:s.alder, melodi:s.melodi, tips:s.tips, rammeplan:s.rammeplan||[], _dbId:s.id, _erMin:true }));
  const alleData = [...userSangerMapped, ...SANGER];
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = alleData.filter(s=>{
    if (filter==="mine") return !!s._erMin && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    if (filter==="favoritter") return favSet.has(s.id) && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    return (filter==="alle"||s.kategori===filter)&&(!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
  });
  const synligData = data.slice(0, visMaks);
  const skrivUtSang = (s) => {
    const melodiHtml = s.melodi ? ' · 🎼 ' + escapeHTML(s.melodi) : '';
    const tipsHtml = s.tips ? '<div style="margin-top:12px;padding:12px;background:#fffde7;border-radius:8px;font-size:13px;"><strong>💡 Tips:</strong> ' + mdToHtml(s.tips) + '</div>' : '';
    skrivUtVindu('<div style="max-width:620px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + escapeHTML(s.tittel) + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + escapeHTML(s.kategori) + ' · ' + escapeHTML(s.alder) + melodiHtml + '</div><pre style="font-size:16px;line-height:2.1;white-space:pre-wrap;font-family:inherit;background:#f5f9fd;padding:18px;border-radius:10px;border:1px solid #c4d6ec;">' + stripMd(s.tekst) + '</pre>' + tipsHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', escapeHTML(s.tittel));
  };
  const slettMin = async (dbId) => {
    await slettUserSang(dbId, aktivBruker.id);
    setUserSanger(p => p.filter(s => s.id !== dbId));
    setValgt(null);
  };
  if (visAiPanel) return <AiSangerView aktivBruker={aktivBruker} onLagre={(ny) => { setUserSanger(p => [ny, ...p]); onNyUserSang?.(ny); setVisAiPanel(false); }} onAvbryt={() => setVisAiPanel(false)} />;
  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,margin:0}}>🎵 Sanger, Rim og Regler</h1>
        {aktivBruker&&<button className="btn" onClick={()=>setVisAiPanel(true)} style={{padding:"7px 13px",fontSize:12,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",whiteSpace:"nowrap"}}>🤖 AI-sanger</button>}
      </div>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{SANGER.length} tilgjengelige{userSangerMapped.length?" + "+userSangerMapped.length+" egne":""} – kobler språk, bevegelse og glede til rammeplanen</p>
      <input value={sok} onChange={e=>{setSok(e.target.value);setVisMaks(20);}} placeholder="🔍 Søk etter sang eller rim..." style={{...iS,marginBottom:12}}/>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16,paddingBottom:3}}>
        <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
          {[["alle","Alle"],aktivBruker?["mine",`🤖 Mine${userSangerMapped.length?" ("+userSangerMapped.length+")":""}`]:null,["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],["sang","🎤 Sanger"],["rim","📝 Rim"],["regle","📣 Regler"]].filter(Boolean).map(([v,l])=>(
            <button key={v} className="btn" onClick={()=>{setFilter(v);setVisMaks(20);}} style={{padding:"6px 13px",fontSize:11,background:filter===v?C.g:C.lg2,color:filter===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
          ))}
        </div>
      </div>
      {valgt ? (
        <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>setValgt(null)}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.t,flex:1}}>{valgt.tittel}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {valgt._erMin&&<button className="btn" onClick={()=>slettMin(valgt._dbId)} style={{padding:"5px 10px",fontSize:11,background:"#ffebee",color:"#c62828"}}>🗑 Slett</button>}
              <button className="btn" onClick={()=>skrivUtSang(valgt)} style={{padding:"5px 10px",fontSize:11,background:"#e8f5e9",color:"#2e7d32"}}>🖨️ Skriv ut</button>
              <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("sanger",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                {favSet.has(valgt.id)?"⭐":"☆"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",gap:7,margin:"10px 0 14px",flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:C.lg2,color:C.gr}}>👶 {valgt.alder}</span>
            {valgt.melodi&&<span className="tag" style={{background:C.lg2,color:C.gr}}>🎼 {valgt.melodi}</span>}
            {valgt._erMin&&<span className="tag" style={{background:C.lg2,color:C.gr}}>🤖 AI-generert</span>}
          </div>
          <pre style={{background:C.lg2,borderRadius:11,padding:16,fontSize:15,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.9,fontFamily:"'Nunito',sans-serif",marginBottom:12,border:`1px solid var(--c-divider)`}}>{valgt.tekst}</pre>
          {valgt.tips&&<div style={{background:"var(--c-lg2)",borderRadius:9,padding:12,fontSize:13,color:C.t,marginBottom:12,border:`1px solid var(--c-divider)`}}><strong>💡 Tips:</strong> {valgt.tips}</div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{(valgt.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {lasterMine&&filter==="mine"&&<div style={{textAlign:"center",padding:18,color:C.gr,fontSize:13}}>⏳ Laster dine sanger...</div>}
          {data.length===0&&!lasterMine&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="mine"?"Du har ingen AI-sanger ennå – trykk 🤖 AI-sanger for å lage din første!":filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {synligData.map(s=>(
            <div key={s.id} className="hover fade" onClick={()=>setValgt(s)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{s.tittel}{s._erMin&&<span style={{marginLeft:6,fontSize:10,background:"#ede9fe",color:"#6d28d9",borderRadius:6,padding:"1px 6px",fontWeight:700}}>🤖</span>}</div>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{s.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{s.alder}</span>
                    {(s.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
                  </div>
                </div>
                <button className={`fav-btn ${favSet.has(s.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("sanger",s.id);}} title={favSet.has(s.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                  {favSet.has(s.id)?"⭐":"☆"}
                </button>
                <span style={{color:C.gr,fontSize:17}}>›</span>
              </div>
            </div>
          ))}
          {data.length > visMaks && (
            <button onClick={()=>setVisMaks(v=>v+20)} style={{width:"100%",padding:"11px",background:C.lg2,color:C.g,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
              Vis flere ({data.length - visMaks} gjenstår)
            </button>
          )}
        </div>
      )}
    </div>
  );
}


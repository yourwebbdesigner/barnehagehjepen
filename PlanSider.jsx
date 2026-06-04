import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { hentMaanedsplaner, lagreMaanedsplaner, hentMaanedsbrev, lagreMaanedsbrev, skrivUtGenerell, lastNedPlanPDF } from './api.js';
import { RenderTekst } from './AiSide.jsx';

const C = { g:"var(--c-g)", lg:"var(--c-lg)", mint:"var(--c-mint)", bg:"var(--c-bg)", yl:"var(--c-yl)", w:"var(--c-w)", t:"var(--c-t)", gr:"var(--c-gr)", lg2:"var(--c-lg2)" };
const escapeHTML = (s) => String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mdToHtml = (s) => escapeHTML(s).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
const stripMd = (s) => String(s || "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/^#{1,3}\s+/gm, "").replace(/^[-*]\s+/gm, "• ");
function skrivUtVindu(html, tittel = "Barnehagehjelpen") {
  const w = window.open("", "_blank");
  if (!w) { alert("Popup ble blokkert. Tillat popup for å skrive ut."); return; }
  w.document.write(`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${tittel}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a2a3a;background:#fff;padding:16px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}.knapper{display:flex;gap:10px;margin-bottom:20px;justify-content:center}.print-btn{padding:9px 24px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:bold}.lukk-btn{padding:9px 18px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:bold}</style></head><body><div class="knapper no-print"><button class="lukk-btn" onclick="window.close()">← Lukk</button><button class="print-btn" onclick="window.print()">🖨️ Skriv ut</button></div>${html}</body></html>`);
  w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
}

const MAANEDER = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

export function MaanedsplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalMaanedsplaner } = ctx;

    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste");
    const [valgt, setValgt] = useState(null);
    const [m_tittel, setMTittel] = useState("");
    const [m_aar, setMAar] = useState(new Date().getFullYear());
    const [m_maaned, setMMaaned] = useState(new Date().getMonth()+1);
    const [m_tema, setMTema] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [m_fag, setMFag] = useState([]);
    const [m_uker, setMUker] = useState(["","","",""]);
    const [m_notat, setMNotat] = useState("");
    const [m_loading, setMLoading] = useState(false);
    const [m_feil, setMFeil] = useState("");
    const [m_aiLoading, setMAiLoading] = useState(false);
    const [bekreftSletting, setBekreftSletting] = useState(false);
    useEffect(()=>{
      let avbrutt=false;
      (async()=>{ if(!aktivBruker?.id){setLastet(true);return;} const liste=await hentMaanedsplaner(aktivBruker.id); if(!avbrutt){setPlaner(liste);setLastet(true);} })();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);
    const lagre=async(liste)=>{const ok=await lagreMaanedsplaner(aktivBruker.id,liste);if(!ok){setMFeil("Kunne ikke lagre");return false;}setPlaner(liste);setGlobalMaanedsplaner(liste);return true;};
    const nullstill=()=>{const n=new Date();setMTittel("");setMAar(n.getFullYear());setMMaaned(n.getMonth()+1);setMTema("");setMFag([]);setMUker(["","","",""]);setMNotat("");setMFeil("");};
    const nyPlan=()=>{nullstill();setMTema(planTema);setValgt(null);setVisning("ny");};
    const redigerPlan=(p)=>{setValgt(p);setMTittel(p.tittel||"");setMAar(p.aar||new Date().getFullYear());setMMaaned(p.maaned||1);setMTema(p.tema||"");setMFag(p.fagomrader||[]);setMUker([p.uke1||"",p.uke2||"",p.uke3||"",p.uke4||""]);setMNotat(p.notat||"");setMFeil("");setVisning("rediger");};
    const slettPlan=async(id)=>{const ok=await lagre(planer.filter(p=>p.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};
    const autoTittel=()=>m_tittel.trim()||`${MAANEDER[m_maaned-1]} ${m_aar}`;
    const lagreNy=async()=>{setMFeil("");if(!m_tema.trim()){setMFeil("Skriv et tema");return;}setMLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:autoTittel(),aar:m_aar,maaned:m_maaned,tema:m_tema.trim(),fagomrader:m_fag,uke1:m_uker[0],uke2:m_uker[1],uke3:m_uker[2],uke4:m_uker[3],notat:m_notat,opprettet:new Date().toISOString()},...planer]);setMLoading(false);if(ok){visLokal("✅ Månedsplan lagret");setVisning("liste");}};
    const lagreEndring=async()=>{setMFeil("");if(!valgt)return;setMLoading(true);const ok=await lagre(planer.map(p=>p.id===valgt.id?{...p,tittel:autoTittel(),aar:m_aar,maaned:m_maaned,tema:m_tema.trim(),fagomrader:m_fag,uke1:m_uker[0],uke2:m_uker[1],uke3:m_uker[2],uke4:m_uker[3],notat:m_notat}:p));setMLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const genererAI=async()=>{if(!m_tema.trim()){setMFeil("Skriv et tema først");return;}setMAiLoading(true);setMFeil("");const fagNavn=m_fag.filter(Boolean).map(f=>FAGOMRADER.find(x=>x.id===f)?.navn.split(",")[0]||f).join(", ")||"generelt";const prompt=`Lag en kort månedsoversikt for norsk barnehage. Tema: "${m_tema}". Fagområder: ${fagNavn}.\nSkriv KUN dette (ingen innledning, ingen forklaring):\n\n## Uke 1\n[undertema + 2-3 korte aktiviteter + 1 mål, maks 5 linjer]\n\n## Uke 2\n[samme]\n\n## Uke 3\n[samme]\n\n## Uke 4\n[samme]`;
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),32000);
    try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:900}),signal:ctrl.signal});
    if(!r.ok){let msg="Serverfeil "+r.status;try{const e=await r.json();if(e?.error)msg=e.error;}catch{}setMFeil("❌ "+msg);return;}
    const d=await r.json();const tekst=d?.text?.trim()||"";if(tekst.length>20){
      const norm=(tekst.startsWith("##")?"\n":"")+tekst;
      const deler=norm.split(/\n##\s+/).slice(1);
      const nyeUker=["","","",""].map((_,i)=>{if(!deler[i])return"";const nl=deler[i].indexOf("\n");return nl>=0?deler[i].slice(nl+1).trim():deler[i].trim();});
      if(nyeUker.some(u=>u.length>0)){setMUker(nyeUker);visLokal("✅ AI-innhold generert i ukefeltene");}
      else{setMFeil("AI returnerte innhold uten gjenkjennbar struktur – prøv igjen.");}
    }else{setMFeil("AI ga for kort svar – prøv igjen.");}}catch(e){console.error("[AI Månedsplan]",e);setMFeil(e.name==="AbortError"?"⏱ AI brukte for lang tid – prøv igjen.":e.name==="TypeError"?"❌ Nettverksfeil – sjekk internett og prøv igjen.":"❌ "+e.message);}finally{clearTimeout(tid);setMAiLoading(false);};};
    const toggleFag=(f)=>setMFag(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
    const inputStyle={width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"};
    const taStyle={...inputStyle,resize:"vertical",minHeight:90};
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 10px"}}/>Laster...</div>;
    if(visning==="les"&&valgt)return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{background:C.w,borderRadius:16,padding:"18px 16px",boxShadow:"0 2px 14px rgba(44,91,142,0.10)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>{valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[valgt.maaned-1]} {valgt.aar} {valgt.tema&&`• Tema: ${valgt.tema}`}</div>
              {valgt.fagomrader?.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>{valgt.fagomrader.map(f=>{const fg=FAGOMRADER.find(x=>x.id===f);return fg?<span data-fag={fg.id} key={f} style={{background:fg.lys,color:fg.farge,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{fg.ikon} {fg.navn.split(",")[0]}</span>:null;})}</div>}
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel||`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}${valgt.tema?" • Tema: "+valgt.tema:""}`,seksjoner:[...["uke1","uke2","uke3","uke4"].map((u,i)=>({label:`Uke ${i+1}`,tekst:valgt[u],farge:"#2c5b8e",bg:"#f5f9fd"})),{label:"Notat",tekst:valgt.notat,farge:"#795548",bg:"#fff9c4"}]})} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🖨️ Skriv ut</button>
              <button onClick={()=>lastNedPlanPDF({tittel:valgt.tittel||`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}${valgt.tema?" • Tema: "+valgt.tema:""}`,seksjoner:[...["uke1","uke2","uke3","uke4"].map((u,i)=>({label:`Uke ${i+1}`,tekst:valgt[u]})),{label:"Notat",tekst:valgt.notat}]})} style={{background:"#e8f5e9",color:"#2e7d32",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📄 PDF</button>
              <button onClick={()=>redigerPlan(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Rediger</button>
              {bekreftSletting
                ? <><button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{background:"#c62828",color:"#fff",border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:12,fontWeight:700}}>Slett</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{background:"#e8eff8",color:C.t,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>Avbryt</button></>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#ffebee",color:"#c62828",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🗑</button>}
            </div>
          </div>
          {["uke1","uke2","uke3","uke4"].map((u,i)=>valgt[u]&&(
            <div key={u} style={{background:"#f5f9fd",borderRadius:10,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid #2c5b8e"}}>
              <div style={{fontWeight:800,color:"#2c5b8e",fontSize:12,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>📅 Uke {i+1}</div>
              <RenderTekst tekst={valgt[u]}/>
            </div>
          ))}
          {valgt.notat&&<div style={{background:"#fff9c4",borderRadius:10,padding:"11px 13px",marginTop:6}}><div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:4}}>📝 NOTAT</div><div style={{fontSize:13,color:C.t,lineHeight:1.6}}>{valgt.notat}</div></div>}
        </div>
      </div>
    );
    if(visning==="ny"||visning==="rediger")return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>{visning==="ny"?"📅 Ny månedsplan":"✏️ Rediger månedsplan"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label><input type="number" value={m_aar} onChange={e=>setMAar(parseInt(e.target.value)||new Date().getFullYear())} style={inputStyle}/></div>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
            <select value={m_maaned} onChange={e=>setMMaaned(parseInt(e.target.value))} style={inputStyle}>{MAANEDER.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}</select>
          </div>
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL (valgfri)</label><input value={m_tittel} onChange={e=>setMTittel(e.target.value)} placeholder={`${MAANEDER[m_maaned-1]} ${m_aar}`} style={inputStyle}/></div>
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr}}>TEMA *</label>
            {m_tema.trim() && m_tema.trim() !== planTema && (
              <button type="button" onClick={()=>setPlanTema(m_tema.trim())} style={{background:"none",border:"none",color:"#1565c0",fontSize:10,cursor:"pointer",fontWeight:700,padding:0,fontFamily:"'Nunito',sans-serif"}}>🔗 Sett som felles tema</button>
            )}
          </div>
          <input value={m_tema} onChange={e=>setMTema(e.target.value)} placeholder={planTema||"Eks: Vennskap, Natur og årstider..."} style={inputStyle}/>
          {planTema && !m_tema.trim() && (
            <div onClick={()=>setMTema(planTema)} style={{fontSize:10,color:"#1565c0",marginTop:3,cursor:"pointer",fontWeight:600}}>← Bruk felles tema: «{planTema}»</div>
          )}
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:6}}>FAGOMRÅDER</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{FAGOMRADER.map(f=>(
            <button key={f.id} onClick={()=>toggleFag(f.id)} style={{background:m_fag.includes(f.id)?f.lys:"#f5f7fa",color:m_fag.includes(f.id)?f.farge:C.gr,border:`2px solid ${m_fag.includes(f.id)?f.farge:"#e0e7ef"}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>{f.ikon} {f.navn.split(",")[0]}</button>
          ))}</div>
        </div>
        <div style={{marginBottom:12,background:C.lg2,borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Generer innhold med AI</div>
            <button onClick={genererAI} disabled={m_aiLoading||!m_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:m_tema.trim()?1:0.5}}>{m_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
          </div>
          <div style={{fontSize:11,color:C.gr}}>{m_aiLoading?"Dette kan ta 10–25 sekunder – vennligst vent...":"Fyll ut tema og trykk Generer for å lage ukesinnhold automatisk"}</div>
        </div>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{marginBottom:10}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>UKE {i+1}</label>
            <textarea value={m_uker[i]} onChange={e=>setMUker(p=>{const ny=[...p];ny[i]=e.target.value;return ny;})} placeholder={`Aktiviteter og mål for uke ${i+1}...`} style={taStyle}/>
          </div>
        ))}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>NOTAT</label><textarea value={m_notat} onChange={e=>setMNotat(e.target.value)} placeholder="Praktisk info, merknader..." style={{...taStyle,minHeight:60}}/></div>
        {m_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>{m_feil}</div>}
        <button onClick={visning==="ny"?lagreNy:lagreEndring} disabled={m_loading} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"11px",width:"100%",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{m_loading?"⏳ Lagrer...":"💾 Lagre månedsplan"}</button>
      </div>
    );
    return(
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 10px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>📅 Månedsplaner</div>
          <button onClick={nyPlan} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",fontWeight:800,fontSize:12}}>+ Ny plan</button>
        </div>
        {lokalToast&&<div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
        {planer.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:C.gr,fontSize:13}}><div style={{fontSize:36,marginBottom:10}}>📅</div>Ingen månedsplaner ennå.<br/>Lag din første plan!</div>
        :<div>{planer.map(p=>(
          <div key={p.id} className="hover" onClick={()=>{setValgt(p);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 14px",marginBottom:8,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",cursor:"pointer",borderLeft:"3px solid #2c5b8e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[p.maaned-1]} {p.aar}{p.tema&&` • ${p.tema}`}</div>
              {p.fagomrader?.length>0&&<div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{p.fagomrader.slice(0,3).map(f=>{const fg=FAGOMRADER.find(x=>x.id===f);return fg?<span data-fag={fg.id} key={f} style={{background:fg.lys,color:fg.farge,borderRadius:6,padding:"1px 6px",fontSize:10,fontWeight:700}}>{fg.ikon}</span>:null;})}</div>}
            </div>
            <span style={{color:C.gr,fontSize:18}}>›</span>
          </div>
        ))}</div>}
      </div>
    );
  }

export default function MaanedsbrevSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalMaanedsbrev } = ctx;

    const [brev, setBrev] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste");
    const [valgt, setValgt] = useState(null);
    const [b_tittel, setBTittel] = useState("");
    const [b_aar, setBAar] = useState(new Date().getFullYear());
    const [b_maaned, setBMaaned] = useState(new Date().getMonth()+1);
    const [b_gjort, setBGjort] = useState("");
    const [b_kommende, setBKommende] = useState("");
    const [b_praktisk, setBPraktisk] = useState("");
    const [b_hilsen, setBHilsen] = useState("");
    const [b_loading, setBLoading] = useState(false);
    const [b_feil, setBFeil] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [b_aiLoading, setBAiLoading] = useState(false);
    const [bekreftSletting, setBekreftSletting] = useState(false);
    useEffect(()=>{
      let avbrutt=false;
      (async()=>{ if(!aktivBruker?.id){setLastet(true);return;} const liste=await hentMaanedsbrev(aktivBruker.id); if(!avbrutt){setBrev(liste);setLastet(true);} })();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);
    const lagre=async(liste)=>{const ok=await lagreMaanedsbrev(aktivBruker.id,liste);if(!ok){setBFeil("Kunne ikke lagre");return false;}setBrev(liste);setGlobalMaanedsbrev(liste);return true;};
    const nullstill=()=>{const n=new Date();setBTittel("");setBAar(n.getFullYear());setBMaaned(n.getMonth()+1);setBGjort("");setBKommende("");setBPraktisk("");setBHilsen("");setBFeil("");};
    const nyBrev=()=>{nullstill();setValgt(null);setVisning("ny");};
    const redigerBrev=(b)=>{setValgt(b);setBTittel(b.tittel||"");setBAar(b.aar||new Date().getFullYear());setBMaaned(b.maaned||1);setBGjort(b.gjort||"");setBKommende(b.kommende||"");setBPraktisk(b.praktisk||"");setBHilsen(b.hilsen||"");setBFeil("");setVisning("rediger");};
    const slettBrev=async(id)=>{const ok=await lagre(brev.filter(b=>b.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};
    const autoTittel=()=>b_tittel.trim()||`Månedsbrev ${MAANEDER[b_maaned-1]} ${b_aar}`;
    const lagreNy=async()=>{setBFeil("");if(!b_gjort.trim()&&!b_kommende.trim()){setBFeil("Fyll inn minst ett felt");return;}setBLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:autoTittel(),aar:b_aar,maaned:b_maaned,gjort:b_gjort,kommende:b_kommende,praktisk:b_praktisk,hilsen:b_hilsen,opprettet:new Date().toISOString()},...brev]);setBLoading(false);if(ok){visLokal("✅ Månedsbrev lagret");setVisning("liste");}};
    const lagreEndring=async()=>{setBFeil("");if(!valgt)return;setBLoading(true);const ok=await lagre(brev.map(b=>b.id===valgt.id?{...b,tittel:autoTittel(),aar:b_aar,maaned:b_maaned,gjort:b_gjort,kommende:b_kommende,praktisk:b_praktisk,hilsen:b_hilsen}:b));setBLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const genererAI=async()=>{setBAiLoading(true);const temaStr=planTema?` Månedstema: «${planTema}».`:"";const prompt=`Skriv et månedsbrev til foreldre fra norsk barnehage for ${MAANEDER[b_maaned-1]} ${b_aar}.${temaStr}\nBruk NØYAKTIG denne strukturen:\n\n## Hva vi har jobbet med\n• [punkt]\n• [punkt]\n• [punkt]\n\n## Kommende aktiviteter\n• [aktivitet/dato]\n• [aktivitet/dato]\n\n## Praktisk informasjon\n• [praktisk info]\n• [praktisk info]\n\nSkriv vennlig og engasjerende. Referer til Rammeplan 2017 og barnehagens pedagogiske arbeid.`;
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),31000);
    try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:1500}),signal:ctrl.signal});if(!r.ok)throw new Error("HTTP "+r.status);const d=await r.json();const tekst=d?.text?.trim()||"";if(tekst.length>20){
      const norm=(tekst.startsWith("##")?"\n":"")+tekst;
      const deler=norm.split(/\n##\s+/).slice(1);
      let sattNoe=false;
      deler.forEach(del=>{const lnr=del.indexOf("\n");const overskrift=lnr>=0?del.slice(0,lnr).toLowerCase().trim():del.toLowerCase().trim();const innhold=lnr>=0?del.slice(lnr+1).trim():"";if(!innhold)return;if(overskrift.includes("jobbet")||overskrift.includes("gjort")){setBGjort(innhold);sattNoe=true;}else if(overskrift.includes("kommende")||overskrift.includes("aktivitet")){setBKommende(innhold);sattNoe=true;}else if(overskrift.includes("praktisk")){setBPraktisk(innhold);sattNoe=true;}});
      if(!sattNoe)setBGjort(tekst);
      visLokal("✅ AI-innhold generert");
    }}catch(e){console.error("[AI Månedsbrev]",e);visLokal(e.name==="AbortError"?"⏱ AI-tidsavbrudd":"ℹ️ AI ikke tilgjengelig");}finally{clearTimeout(tid);setBAiLoading(false);};};
    const kopierBrev=(b)=>{const tekst=`${b.tittel}\n\n${b.gjort?"Vi har jobbet med:\n"+b.gjort+"\n\n":""}${b.kommende?"Kommende:\n"+b.kommende+"\n\n":""}${b.praktisk?"Praktisk info:\n"+b.praktisk+"\n\n":""}${b.hilsen?"Hilsen,\n"+b.hilsen:""}`.trim();navigator.clipboard?.writeText(tekst).then(()=>visLokal("✅ Kopiert")).catch(()=>visLokal("ℹ️ Kopiering ikke støttet"));};
    const inputStyle={width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"};
    const taStyle={...inputStyle,resize:"vertical",minHeight:90};
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 10px"}}/>Laster...</div>;
    if(visning==="les"&&valgt)return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{background:C.w,borderRadius:16,padding:"20px 18px",boxShadow:"0 2px 14px rgba(44,91,142,0.10)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>{valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[valgt.maaned-1]} {valgt.aar}</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel||`Månedsbrev ${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,seksjoner:[{label:"📚 Hva vi har jobbet med",tekst:valgt.gjort,farge:"#1565c0",bg:"#e3f2fd"},{label:"📅 Kommende aktiviteter",tekst:valgt.kommende,farge:"#2e7d32",bg:"#e8f5e9"},{label:"ℹ️ Praktisk informasjon",tekst:valgt.praktisk,farge:"#795548",bg:"#fff9c4"},{label:"Hilsen",tekst:valgt.hilsen,farge:"#5d7390",bg:"#f5f9fd"}]})} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🖨️ Skriv ut</button>
              <button onClick={()=>lastNedPlanPDF({tittel:valgt.tittel||`Månedsbrev ${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,seksjoner:[{label:"📚 Hva vi har jobbet med",tekst:valgt.gjort},{label:"📅 Kommende aktiviteter",tekst:valgt.kommende},{label:"ℹ️ Praktisk informasjon",tekst:valgt.praktisk},{label:"Hilsen",tekst:valgt.hilsen}]})} style={{background:"#e8f5e9",color:"#2e7d32",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📄 PDF</button>
              <button onClick={()=>kopierBrev(valgt)} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📋 Kopier</button>
              <button onClick={()=>redigerBrev(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Rediger</button>
              {bekreftSletting
                ? <><button onClick={()=>{setBekreftSletting(false);slettBrev(valgt.id);}} style={{background:"#c62828",color:"#fff",border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:12,fontWeight:700}}>Slett</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{background:"#e8eff8",color:C.t,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>Avbryt</button></>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#ffebee",color:"#c62828",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🗑</button>}
            </div>
          </div>
          {[{felt:valgt.gjort,label:"📚 Hva vi har jobbet med",bg:"#e3f2fd",col:"#1565c0"},{felt:valgt.kommende,label:"📅 Kommende aktiviteter",bg:"#e8f5e9",col:"#2e7d32"},{felt:valgt.praktisk,label:"ℹ️ Praktisk informasjon",bg:"#fff9c4",col:"#795548"}].filter(s=>s.felt).map(({felt,label,bg,col})=>(
            <div key={label} style={{background:bg,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontWeight:800,color:col,fontSize:12,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
              <RenderTekst tekst={felt}/>
            </div>
          ))}
          {valgt.hilsen&&<div style={{textAlign:"right",marginTop:16,fontStyle:"italic",color:C.gr,fontSize:13}}>Hilsen,<br/><strong style={{color:C.t}}>{valgt.hilsen}</strong></div>}
        </div>
      </div>
    );
    if(visning==="ny"||visning==="rediger")return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>{visning==="ny"?"📨 Nytt månedsbrev":"✏️ Rediger månedsbrev"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label><input type="number" value={b_aar} onChange={e=>setBAar(parseInt(e.target.value)||new Date().getFullYear())} style={inputStyle}/></div>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
            <select value={b_maaned} onChange={e=>setBMaaned(parseInt(e.target.value))} style={inputStyle}>{MAANEDER.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}</select>
          </div>
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL (valgfri)</label><input value={b_tittel} onChange={e=>setBTittel(e.target.value)} placeholder={`Månedsbrev ${MAANEDER[b_maaned-1]} ${b_aar}`} style={inputStyle}/></div>
        {planTema && (
          <div style={{background:"#e3f2fd",borderRadius:10,padding:"10px 13px",marginBottom:10,borderLeft:"4px solid #1565c0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#1565c0",marginBottom:2}}>🎯 FELLES TEMA AKTIVT</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1a2c45"}}>«{planTema}»</div>
              <div style={{fontSize:11,color:"#5d7390",marginTop:1}}>Brukes automatisk i AI-generering av brevet</div>
            </div>
            <button onClick={()=>setPlanTema("")} style={{background:"transparent",border:"1px solid #90caf9",color:"#1565c0",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>✕ Fjern</button>
          </div>
        )}
        <div style={{marginBottom:12,background:C.lg2,borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Generer brev med AI</div>
            <button onClick={genererAI} disabled={b_aiLoading} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700}}>{b_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
          </div>
          <div style={{fontSize:11,color:C.gr}}>Trykk Generer for å lage brevinnhold for {MAANEDER[b_maaned-1]}{planTema?` med tema «${planTema}»`:""}</div>
        </div>
        {[{label:"📚 HVA VI HAR JOBBET MED",val:b_gjort,setter:setBGjort,ph:"Beskriv hva dere har arbeidet med denne måneden..."},{label:"📅 KOMMENDE AKTIVITETER",val:b_kommende,setter:setBKommende,ph:"Turer, arrangementer, tema-dager..."},{label:"ℹ️ PRAKTISK INFORMASJON",val:b_praktisk,setter:setBPraktisk,ph:"Klær, frister, beskjeder..."}].map(({label,val,setter,ph})=>(
          <div key={label} style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>{label}</label><textarea value={val} onChange={e=>setter(e.target.value)} placeholder={ph} style={taStyle}/></div>
        ))}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>HILSEN</label><input value={b_hilsen} onChange={e=>setBHilsen(e.target.value)} placeholder="Eks: Personalet på Revegruppen" style={inputStyle}/></div>
        {b_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>{b_feil}</div>}
        <button onClick={visning==="ny"?lagreNy:lagreEndring} disabled={b_loading} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"11px",width:"100%",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{b_loading?"⏳ Lagrer...":"💾 Lagre månedsbrev"}</button>
      </div>
    );
    return(
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 10px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>📨 Månedsbrev</div>
          <button onClick={nyBrev} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",fontWeight:800,fontSize:12}}>+ Nytt brev</button>
        </div>
        {lokalToast&&<div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
        {brev.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:C.gr,fontSize:13}}><div style={{fontSize:36,marginBottom:10}}>📨</div>Ingen månedsbrev ennå.<br/>Lag ditt første brev!</div>
        :<div>{brev.map(b=>(
          <div key={b.id} className="hover" onClick={()=>{setValgt(b);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 14px",marginBottom:8,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",cursor:"pointer",borderLeft:"3px solid #2d6a4f",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,color:C.t,fontSize:14}}>{b.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[b.maaned-1]} {b.aar}</div>
              {b.gjort&&<div style={{fontSize:11,color:C.gr,marginTop:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:220}}>{b.gjort.split("\n")[0]}</div>}
            </div>
            <span style={{color:C.gr,fontSize:18}}>›</span>
          </div>
        ))}</div>}
      </div>
    );
  }

// ─── Hjelpkomponent for sorterbar aktivitet i ukeplan (dnd-kit krever eget komponent på modul-nivå) ───




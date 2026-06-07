import React, { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { hentKalenderplaner, lagreKalenderplaner, sjekkPlanKonflikt } from './api.js';
import { C, escapeHTML, mdToHtml, stripMd, skrivUtVindu } from './utils.js';
import { sanitizeForPrompt } from './data/ai-data.js';
import { UnsavedDialog, KonfliktDialog } from './UnsavedDialog.jsx';
import { useUnsavedGuard } from './hooks.js';

export default function MaanedskalenderSide({ ctx }) {
  const { aktivBruker, navigerTil, planTema, setGlobalKalenderplaner, preselectPlanId, setPreselectPlanId, sesjonsStart } = ctx;

    const MAANEDER_KAL = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];
    const UKEDAGER = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
    const EVENT_TYPER = {
      aktivitet:{farge:"#1565c0",bg:"#e3f2fd",label:"Aktivitet",ikon:"🎨"},
      tur:{farge:"#2e7d32",bg:"#e8f5e9",label:"Tur",ikon:"🌲"},
      bursdag:{farge:"#6a1b9a",bg:"#f3e5f5",label:"Bursdag",ikon:"🎂"},
      praktisk:{farge:"#f57c00",bg:"#fff3e0",label:"Praktisk",ikon:"📋"},
    };
    const [planer,setPlaner]=useState([]);
    const [lastet,setLastet]=useState(false);
    const [visning,setVisning]=useState("liste");
    const [valgt,setValgt]=useState(null);
    const [lokalToast,setLokalToast]=useState("");
    const visLokal=m=>{setLokalToast(m);setTimeout(()=>setLokalToast(""),3000);};
    const [bekreftSletting,setBekreftSletting]=useState(false);
    const [printModus,setPrintModus]=useState(false);
    const { harEndringer: kalHar, setHarEndringer: kalSetHar, bekreftDest: kalDest, sjekkNavigasjon: kalSjekk, bekreftNavigasjon: kalBekreft, avbrytNavigasjon: kalAvbryt, nullstillGuard: kalNullstill } = useUnsavedGuard();
    const [kalKonflikt, setKalKonflikt] = useState(false);
    const [kalLasterKonflikt, setKalLasterKonflikt] = useState(false);
    const [kalVentende, setKalVentende] = useState(null);
    const [k_tittel,setKTittel]=useState("");
    const [k_aar,setKAar]=useState(new Date().getFullYear());
    const [k_maaned,setKMaaned]=useState(new Date().getMonth()+1);
    const [k_tema,setKTema]=useState("");
    const [k_events,setKEvents]=useState({});
    const [k_loading,setKLoading]=useState(false);
    const [k_feil,setKFeil]=useState("");
    const [k_aiLoading,setKAiLoading]=useState(false);
    const [aktivDag,setAktivDag]=useState(null);
    const [nyEvent,setNyEvent]=useState({type:"aktivitet",tekst:"",ikon:""});

    useEffect(()=>{
      let avbrutt=false;
      (async()=>{if(!aktivBruker?.id){setLastet(true);return;}const liste=await hentKalenderplaner(aktivBruker.id);if(!avbrutt){setPlaner(liste);setLastet(true);}})();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);

    const lagre=async(liste,tving=false)=>{
      if(!tving){const hk=await sjekkPlanKonflikt(aktivBruker.id,"maanedsplaner",sesjonsStart);if(hk){setKalKonflikt(true);setKalVentende(liste);return false;}}
      const ok=await lagreKalenderplaner(aktivBruker.id,liste);if(!ok){setKFeil("Kunne ikke lagre");return false;}
      setKalKonflikt(false);setKalVentende(null);setPlaner(liste);if(setGlobalKalenderplaner)setGlobalKalenderplaner(liste);kalNullstill();return true;};
    const kalLastInn=async()=>{setKalLasterKonflikt(true);const l=await hentKalenderplaner(aktivBruker.id);setPlaner(l);if(setGlobalKalenderplaner)setGlobalKalenderplaner(l);setKalKonflikt(false);setKalVentende(null);kalNullstill();setVisning("liste");setKalLasterKonflikt(false);};
    const kalOverskriver=async()=>{if(kalVentende)await lagre(kalVentende,true);};

    const nyPlan=()=>{setValgt(null);setKTittel("");setKAar(new Date().getFullYear());setKMaaned(new Date().getMonth()+1);setKTema(planTema);setKEvents({});setKFeil("");kalNullstill();setVisning("ny");};
    const redigerPlan=p=>{setValgt(p);setKTittel(p.tittel||"");setKAar(p.aar);setKMaaned(p.maaned);setKTema(p.tema||"");setKEvents(p.events||{});setKFeil("");kalNullstill();setVisning("rediger");};
    useEffect(()=>{ if(!preselectPlanId||!lastet||planer.length===0)return; const p=planer.find(p=>p.id===preselectPlanId); if(p){setValgt(p);setVisning("les");setPreselectPlanId?.(null);} },[preselectPlanId,lastet,planer.length]);

    const leggTilEvent=()=>{
      if(!nyEvent.tekst.trim())return;
      const ikon=nyEvent.ikon||EVENT_TYPER[nyEvent.type]?.ikon||"📅";
      const event={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),type:nyEvent.type,tekst:nyEvent.tekst.trim(),ikon};
      kalSetHar(true);
      setKEvents(prev=>({...prev,[aktivDag]:[...(prev[aktivDag]||[]),event]}));
      setNyEvent({type:"aktivitet",tekst:"",ikon:""});
    };
    const slettEvent=(dag,id)=>setKEvents(prev=>({...prev,[dag]:(prev[dag]||[]).filter(e=>e.id!==id)}));

    const lagreNy=async()=>{if(!k_tittel.trim()){setKFeil("Skriv en tittel");return;}if(Object.keys(k_events).length===0){setKFeil("Kalenderen er tom – legg til minst én hendelse eller bruk AI-generering.");return;}setKLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:k_tittel.trim(),aar:k_aar,maaned:k_maaned,tema:k_tema.trim(),events:k_events,opprettet:new Date().toISOString()},...planer]);setKLoading(false);if(ok){visLokal("✅ Kalender lagret");setVisning("liste");}};
    const lagreEndring=async()=>{if(!valgt)return;if(!k_tittel.trim()){setKFeil("Skriv en tittel");return;}setKLoading(true);const ok=await lagre(planer.map(p=>p.id===valgt.id?{...p,tittel:k_tittel.trim(),aar:k_aar,maaned:k_maaned,tema:k_tema.trim(),events:k_events}:p));setKLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const slettPlan=async id=>{const ok=await lagre(planer.filter(p=>p.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};

    const genererAI=async()=>{
      if(!k_tema.trim()){setKFeil("Skriv et tema først");return;}
      setKAiLoading(true);setKFeil("");
      const mNavn=MAANEDER_KAL[k_maaned-1];
      const antallDager=new Date(k_aar,k_maaned,0).getDate();
      const sikkertTema = sanitizeForPrompt(k_tema, 100);
      const prompt=`Du er pedagog i norsk barnehage. Lag en fullstendig månedsoversikt for ${mNavn} ${k_aar} (${antallDager} dager) med tema "${sikkertTema}".\nDekk ALLE hverdager (mandag–fredag) med minst én hendelse per dag – ca. 18–22 hendelser totalt.\nTyper: aktivitet (daglig pedagogisk aktivitet), tur (uteaktivitet/tur), bursdag (markering), praktisk (info til foreldre).\nReturner KUN gyldig JSON uten markdown, eksempel:\n{"events":{"1":[{"type":"aktivitet","tekst":"Samlingsstund: tema ${sikkertTema}","ikon":"🎨"}],"2":[{"type":"tur","tekst":"Skogstur","ikon":"🌲"}],"3":[{"type":"aktivitet","tekst":"Forming og kreativitet","ikon":"✂️"}]}}\nBruk dagtall som nøkler (1–${antallDager}). Hopp over lørdager og søndager. Varier aktivitetene gjennom måneden.`;
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),28000);
      try{
        const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:1100}),signal:ctrl.signal});
        if(!r.ok){const d=await r.json().catch(()=>({}));setKFeil("❌ "+(d.error||"Serverfeil "+r.status));return;}
        const d=await r.json();const raw=d.text||"";
        const m=raw.match(/\{[\s\S]*\}/);
        if(!m){setKFeil("❌ AI svarte uten JSON – prøv igjen.");return;}
        let parsed;try{parsed=JSON.parse(m[0]);}catch{setKFeil("❌ AI-svaret var ikke gyldig JSON – prøv igjen.");return;}
        if(parsed.events&&Object.keys(parsed.events).length>0){
          setKEvents(prev=>{const ny={...prev};Object.entries(parsed.events).forEach(([dag,evts])=>{ny[dag]=[...(ny[dag]||[]),...(Array.isArray(evts)?evts:[]).map(e=>({...e,id:Date.now().toString(36)+Math.random().toString(36).slice(2,5)}))];});return ny;});
          const antHend=Object.values(parsed.events).reduce((s,a)=>s+(a?.length||0),0);
          visLokal(`✨ AI la til ${antHend} hendelser i kalenderen`);
        }else{setKFeil("❌ AI fant ingen hendelser å legge til – prøv igjen.");}
      }catch(e){
        console.error("[AI Kalender]",e);
        if(e.name==="AbortError")setKFeil("⏱ AI brukte for lang tid – prøv igjen.");
        else if(e.name==="TypeError")setKFeil("❌ Nettverksfeil – sjekk internett og prøv igjen.");
        else setKFeil("❌ "+e.message);
      }finally{clearTimeout(tid);setKAiLoading(false);}
    };

    const kalenderGrid=(aar,maaned,events,redigerbar)=>{
      const forste=new Date(aar,maaned-1,1);
      const siste=new Date(aar,maaned,0);
      const startUkedag=(forste.getDay()+6)%7;
      const antallDager=siste.getDate();
      const celler=[];
      for(let i=0;i<startUkedag;i++)celler.push(null);
      for(let d=1;d<=antallDager;d++)celler.push(d);
      while(celler.length%7!==0)celler.push(null);
      const iDag=new Date();const erIDag=(d)=>d&&aar===iDag.getFullYear()&&maaned===iDag.getMonth()+1&&d===iDag.getDate();
      return(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {UKEDAGER.map(u=><div key={u} style={{textAlign:"center",fontSize:10,fontWeight:800,color:C.gr,padding:"4px 0"}}>{u}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {celler.map((d,i)=>{
              const dagEvents=(events||{})[String(d)]||[];
              return(
                <div key={i} onClick={()=>{if(d&&redigerbar){setAktivDag(String(d));setNyEvent({type:"aktivitet",tekst:"",ikon:""});}}}
                  style={{minHeight:printModus?54:64,borderRadius:7,border:erIDag(d)?"2px solid "+C.g:"1px solid var(--c-divider)",background:d?C.w:"var(--c-lg2)",padding:"3px 4px",cursor:d&&redigerbar?"pointer":undefined,position:"relative",overflow:"hidden"}}>
                  {d&&<div style={{fontSize:11,fontWeight:erIDag(d)?900:700,color:erIDag(d)?C.g:C.t,marginBottom:2}}>{d}</div>}
                  {dagEvents.map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
                    <div key={ev.id} style={{background:t.bg,color:t.farge,borderRadius:4,fontSize:9,padding:"1px 4px",marginBottom:1,display:"flex",alignItems:"center",gap:2,whiteSpace:"nowrap",overflow:"hidden"}}>
                      <span>{ev.ikon||t.ikon}</span><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{ev.tekst}</span>
                      {redigerbar&&<button aria-label="Slett hendelse" onClick={e=>{e.stopPropagation();slettEvent(String(d),ev.id);}} style={{marginLeft:"auto",background:"none",border:"none",color:t.farge,cursor:"pointer",fontSize:9,padding:0,flexShrink:0}}>✕</button>}
                    </div>
                  );})}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const skrivUtKalender=(p)=>{
      const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
      const mNavn=MAANEDER_KAL[(p.maaned||1)-1];
      const forste=new Date(p.aar,p.maaned-1,1);
      const antDager=new Date(p.aar,p.maaned,0).getDate();
      const startUkedag=(forste.getDay()+6)%7;
      const celler=[];
      for(let i=0;i<startUkedag;i++)celler.push(null);
      for(let d=1;d<=antDager;d++)celler.push(d);
      while(celler.length%7!==0)celler.push(null);
      const typeBg={aktivitet:"#dbeafe",tur:"#dcfce7",bursdag:"#f3e8ff",praktisk:"#fef9c3"};
      const typeCol={aktivitet:"#1e40af",tur:"#166534",bursdag:"#7e22ce",praktisk:"#854d0e"};
      const rader=[];
      for(let r=0;r<celler.length/7;r++){
        const cHtml=celler.slice(r*7,r*7+7).map(d=>{
          if(!d)return`<td style="background:#f8f8f8;border:1px solid #e0e0e0;"></td>`;
          const evts=(p.events||{})[String(d)]||[];
          const eHtml=evts.map(e=>`<div style="background:${typeBg[e.type]||"#f0f0f0"};color:${typeCol[e.type]||"#333"};border-radius:3px;padding:1px 5px;font-size:8px;margin-bottom:1px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${esc(e.ikon||"")} ${esc(e.tekst)}</div>`).join("");
          return`<td style="border:1px solid #ccc;padding:4px;vertical-align:top;height:72px;"><div style="font-size:11px;font-weight:700;color:#1a2c45;margin-bottom:3px">${d}</div>${eHtml}</td>`;
        }).join("");
        rader.push(`<tr>${cHtml}</tr>`);
      }
      const html=`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${esc(p.tittel)} – Barnehagehjelpen</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,"Segoe UI",sans-serif;color:#1a2c45;background:#fff;padding:16px}
.topp{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:8px}
h1{font-size:20px;color:#2c5b8e}p{font-size:12px;color:#5d7390;margin-top:3px}
.knapper{display:flex;gap:8px}.knapp{padding:8px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}
.lukk{padding:8px 14px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}
table{width:100%;border-collapse:collapse;table-layout:fixed}
th{background:#2c5b8e;color:#fff;padding:6px 4px;text-align:center;font-size:11px;border:1px solid #1a4063}
.legend{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}
.leg-item{display:flex;align-items:center;gap:4px;font-size:10px}
.leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
@media print{@page{margin:10mm;size:portrait}.knapper{display:none}body{padding:0}}</style>
</head><body>
<div class="topp"><div><h1>🗓 ${esc(p.tittel)}</h1><p>${mNavn} ${p.aar}${p.tema?" • Tema: "+esc(p.tema):""}</p></div>
<div class="knapper"><button class="lukk" onclick="window.close()">← Lukk</button><button class="knapp" onclick="window.print()">🖨️ Skriv ut</button></div></div>
<table><thead><tr>${["Man","Tir","Ons","Tor","Fre","Lør","Søn"].map(d=>`<th>${d}</th>`).join("")}</tr></thead>
<tbody>${rader.join("")}</tbody></table>
<div class="legend"><div class="leg-item"><div class="leg-dot" style="background:#dbeafe"></div>Aktivitet</div><div class="leg-item"><div class="leg-dot" style="background:#dcfce7"></div>Tur</div><div class="leg-item"><div class="leg-dot" style="background:#f3e8ff"></div>Bursdag</div><div class="leg-item"><div class="leg-dot" style="background:#fef9c3"></div>Praktisk</div></div>
</body></html>`;
      const v=window.open("","_blank","width=900,height=720");
      if(!v){
        try{
          const blob=new Blob([html],{type:"text/html;charset=utf-8"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");
          a.href=url;a.download=`kalender-${esc(p.tittel).replace(/[^a-zA-Z0-9æøåÆØÅ]/g,"-")}.html`;
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          setTimeout(()=>URL.revokeObjectURL(url),1500);
          visLokal("💾 Popup blokkert – kalender lastet ned som HTML");
        }catch{visLokal("⚠️ Popup blokkert – tillat popup for å skrive ut");}
        return;
      }
      v.document.write(html);v.document.close();v.focus();
      setTimeout(()=>v.print(),400);
    };

    if(!lastet)return<div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster...</div>;

    // VISNING: Ny / Rediger
    if(visning==="ny"||visning==="rediger"){
      const erRediger=visning==="rediger";
      return(
        <div className="fade">
          <UnsavedDialog bekreftDest={kalDest} onBekreft={kalBekreft} onAvbryt={kalAvbryt}/>
          <button onClick={()=>kalSjekk("liste",setVisning)} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger kalender":"🗓 Ny månedskalender"}</div>
          {k_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"9px 12px",fontSize:12,marginBottom:12}}>{k_feil}</div>}
          <div style={{background:C.w,borderRadius:13,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL</label>
            <input value={k_tittel} onChange={e=>setKTittel(e.target.value)} placeholder="F.eks. 'September – Blå avdeling'" style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid var(--c-input-border)",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:10}}>
              <div>
                <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label>
                <input type="number" value={k_aar} onChange={e=>setKAar(parseInt(e.target.value)||new Date().getFullYear())} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid var(--c-input-border)",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
                <select value={k_maaned} onChange={e=>setKMaaned(parseInt(e.target.value))} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid var(--c-input-border)",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}>
                  {MAANEDER_KAL.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}
                </select>
              </div>
            </div>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TEMA</label>
            <input value={k_tema} onChange={e=>setKTema(e.target.value)} placeholder={planTema||"F.eks. Natur og årstider"} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid var(--c-input-border)",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}/>
          </div>

          <div style={{background:C.lg2,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Fyll med AI</div>
              <button onClick={genererAI} disabled={k_aiLoading||!k_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:k_tema.trim()?1:0.5}}>{k_aiLoading?"⏳ Genererer...":"✨ Generer hendelser"}</button>
            </div>
            <div style={{fontSize:11,color:C.gr}}>{k_aiLoading?"Henter hendelser fra AI – ca. 10 sek...":"Fyll ut tema og la AI foreslå aktiviteter, turer og hendelser"}</div>
          </div>

          <div style={{background:C.w,borderRadius:13,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>KALENDER — {MAANEDER_KAL[k_maaned-1]} {k_aar}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:10}}>Klikk på en dag for å legge til hendelser</div>
            {kalenderGrid(k_aar,k_maaned,k_events,true)}
          </div>

          {aktivDag&&(
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setAktivDag(null)} onKeyDown={e=>e.key==="Escape"&&setAktivDag(null)} tabIndex={-1}>
              <div onClick={e=>e.stopPropagation()} style={{background:"var(--c-card)",borderRadius:14,padding:18,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.t,marginBottom:12}}>{MAANEDER_KAL[k_maaned-1]} {aktivDag}</div>
                {(k_events[aktivDag]||[]).length>0&&(
                  <div style={{marginBottom:12}}>
                    {(k_events[aktivDag]||[]).map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
                      <div key={ev.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:t.bg,borderRadius:7,marginBottom:4}}>
                        <span>{ev.ikon||t.ikon}</span><span style={{flex:1,fontSize:12,color:t.farge}}>{ev.tekst}</span>
                        <button aria-label="Slett hendelse" onClick={()=>slettEvent(aktivDag,ev.id)} style={{background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                    );})}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  {Object.entries(EVENT_TYPER).map(([k,v])=><button key={k} onClick={()=>setNyEvent(p=>({...p,type:k}))} style={{padding:"5px 8px",borderRadius:7,border:nyEvent.type===k?"2px solid "+v.farge:"1.5px solid var(--c-divider)",background:nyEvent.type===k?v.bg:"var(--c-w)",color:v.farge,fontSize:11,fontWeight:700,cursor:"pointer"}}>{v.ikon} {v.label}</button>)}
                </div>
                <input value={nyEvent.tekst} onChange={e=>setNyEvent(p=>({...p,tekst:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&leggTilEvent()} placeholder="Beskriv hendelsen..." style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1.5px solid var(--c-input-border)",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
                  <button onClick={leggTilEvent} disabled={!nyEvent.tekst.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Legg til</button>
                  <button onClick={()=>setAktivDag(null)} style={{background:"var(--c-lg2)",color:C.t,border:"none",borderRadius:8,padding:"9px 14px",fontSize:13,cursor:"pointer"}}>Lukk</button>
                </div>
              </div>
            </div>
          )}

          <button onClick={erRediger?lagreEndring:lagreNy} disabled={k_loading} style={{width:"100%",padding:"13px",fontSize:14,fontWeight:800,background:k_loading?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:11,cursor:k_loading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",marginTop:4}}>
            {k_loading?"Lagrer...":"💾 Lagre kalender"}
          </button>
        </div>
      );
    }

    // VISNING: Les enkelt-kalender
    if(visning==="les"&&valgt){
      const mNavn=MAANEDER_KAL[(valgt.maaned||1)-1];
      const totalEvents=Object.values(valgt.events||{}).reduce((s,a)=>s+(a||[]).length,0);
      return(
        <div className="fade">
          <button onClick={()=>{setVisning("liste");setPrintModus(false);}} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>🗓 {valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{mNavn} {valgt.aar}{valgt.tema&&" • "+valgt.tema} • {totalEvents} hendelser</div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>setPrintModus(p=>!p)} style={{background:printModus?"#1565c0":"var(--c-lg2)",color:printModus?"#fff":C.t,border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{printModus?"📺 Skjermvisning":"🖨️ Utskriftsmodus"}</button>
              <button onClick={()=>skrivUtKalender(valgt)} style={{background:"#2c5b8e",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>🖨️ Skriv ut</button>
              <button onClick={()=>redigerPlan(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Rediger</button>
            </div>
          </div>
          {lokalToast&&<div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
          <div style={{background:C.w,borderRadius:13,padding:printModus?10:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            {printModus&&<div style={{textAlign:"center",marginBottom:8}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:"#2c5b8e"}}>{valgt.tittel}</div>
              <div style={{fontSize:11,color:"#666"}}>{mNavn} {valgt.aar}{valgt.tema&&" • "+valgt.tema}</div>
            </div>}
            {!printModus&&<div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{mNavn} {valgt.aar}</div>}
            {kalenderGrid(valgt.aar,valgt.maaned,valgt.events,false)}
          </div>
          <div style={{background:C.lg2,borderRadius:10,padding:"10px 13px",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:11,color:C.gr,marginBottom:6,textTransform:"uppercase"}}>Hendelser denne måneden</div>
            {Object.entries(valgt.events||{}).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([dag,evts])=>evts.map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
              <div key={ev.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--c-divider)"}}>
                <span style={{fontSize:11,fontWeight:700,color:C.gr,minWidth:22,textAlign:"right"}}>{dag}.</span>
                <span style={{background:t.bg,color:t.farge,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700}}>{ev.ikon||t.ikon} {ev.tekst}</span>
              </div>
            );}))}
          </div>
          {bekreftSletting
            ?<div style={{display:"flex",gap:8}}><button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft sletting</button><button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:"var(--c-lg2)",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button></div>
            :<button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",width:"100%"}}>🗑 Slett kalender</button>}
        </div>
      );
    }

    // VISNING: Liste
    return(
      <div className="fade">
        <KonfliktDialog vis={kalKonflikt} onLastInn={kalLastInn} onOverskriver={kalOverskriver} lasterInn={kalLasterKonflikt}/>
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🗓 Månedskalender</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Ekte kalendervisning med hendelser, turer og bursdager per dag</p>
        <button onClick={nyPlan} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#1565c0,#1976d2)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(21,101,192,0.3)",marginBottom:12}}>🗓 Lag ny kalender</button>
        {lokalToast&&<div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
        {planer.length===0?<div style={{textAlign:"center",padding:34,background:C.w,borderRadius:12,boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
          <div style={{fontSize:42,marginBottom:9}}>🗓</div>
          <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen kalendre ennå</div>
          <div style={{fontSize:12,color:C.gr,lineHeight:1.6,maxWidth:280,margin:"0 auto"}}>Lag månedsoversikter med aktiviteter, turer og bursdager. AI kan hjelpe deg å fylle inn hendelser.</div>
        </div>:(
          <div style={{display:"grid",gap:9}}>
            {planer.map(p=>{const mN=MAANEDER_KAL[(p.maaned||1)-1];const antall=Object.values(p.events||{}).reduce((s,a)=>s+(a||[]).length,0);return(
              <div key={p.id} className="hover" onClick={()=>{setValgt(p);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",borderLeft:"3px solid #1565c0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
                  <span style={{fontSize:10,color:C.gr,background:"var(--c-lg2)",padding:"2px 8px",borderRadius:7,fontWeight:700,flexShrink:0}}>{mN} {p.aar}</span>
                </div>
                {p.tema&&<div style={{fontSize:12,color:C.gr,marginTop:2}}>{p.tema}</div>}
                <div style={{fontSize:11,color:C.gr,marginTop:4}}>{antall} hendelser</div>
              </div>
            );})}
          </div>
        )}
      </div>
    );
  }



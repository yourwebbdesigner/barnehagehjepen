import React, { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS as dndCSS } from "@dnd-kit/utilities";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { hentUkeplaner, lagreUkeplaner, komprimerBilde, sjekkPlanKonflikt } from './api.js';
import { C, escapeHTML, skrivUtVindu } from './utils.js';
import { sanitizeForPrompt } from './data/ai-data.js';
import { KonfliktDialog } from './UnsavedDialog.jsx';
function SortableAktivitetItem({ a, tidCol, tidBg, dager, dag, slettFn, flyttFn }) {
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:a.id});
  return(
    <div ref={setNodeRef} style={{transform:dndCSS.Transform.toString(transform),transition,opacity:isDragging?0.5:1,display:"flex",alignItems:"center",gap:5,background:tidBg,borderRadius:6,padding:"4px 7px",marginBottom:3}}>
      <span {...attributes} {...listeners} aria-label="Dra for å flytte" role="button" tabIndex={0} style={{cursor:"grab",color:tidCol,fontSize:14,lineHeight:1,touchAction:"none",padding:"4px 3px",minWidth:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>⠿</span>
      <span style={{flex:1,fontSize:11,color:"var(--c-t)"}}>{a.tekst}</span>
      <div style={{display:"flex",gap:2,flexShrink:0}}>
        {dager.filter(x=>x!==dag).map(t2=><button key={t2} type="button" title={"Flytt til "+t2} onClick={()=>flyttFn(dag,a.id,t2)} style={{background:"none",border:"none",color:"var(--c-gr)",cursor:"pointer",fontSize:9,padding:"0 2px",lineHeight:1}}>→{t2.slice(0,3)}</button>)}
        <button type="button" onClick={()=>slettFn(dag,a.id)} style={{background:"none",border:"none",color:"#c62828",cursor:"pointer",fontSize:11,padding:0,lineHeight:1}}>✕</button>
      </div>
    </div>
  );
}

export default function UkeplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalUkeplaner, preselectPlanId, setPreselectPlanId, sesjonsStart } = ctx;

    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);
    const [harEndringer, setHarEndringer] = useState(false);
    const [bekreftNavigerBort, setBekreftNavigerBort] = useState(null); // lagrer destinasjon
    const [konflikt, setKonflikt] = useState(false);
    const [lasterKonflikt, setLasterKonflikt] = useState(false);
    const [ventendeLagring, setVentendeLagring] = useState(null);

    // Blokkér nettleserfane-lukking / oppdatering ved ulagrede endringer
    useEffect(() => {
      if (!harEndringer) return;
      const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }, [harEndringer]);

    // Skjema-state
    const tomDag = () => ({ bilde:"", farge:"", ansvarlig:"", maaltid:"", aktiviteter:[] });
    const migrerDag = (dag) => {
      if (!dag) return tomDag();
      if (Array.isArray(dag.aktiviteter)) return { bilde:dag.bilde||"", farge:dag.farge||"", ansvarlig:dag.ansvarlig||"", maaltid:dag.maaltid||"", aktiviteter:dag.aktiviteter };
      const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
      const akt=[];
      (dag.formiddag||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"formiddag",tekst:t}));
      (dag.ettermiddag||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"ettermiddag",tekst:t}));
      (dag.notat||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"notat",tekst:t}));
      return { bilde:dag.bilde||"", farge:dag.farge||"", ansvarlig:dag.ansvarlig||"", maaltid:dag.maaltid||"", aktiviteter:akt };
    };
    const [u_tittel, setUTittel] = useState("");
    const [u_uke, setUUke] = useState("");
    const [u_tema, setUTema] = useState("");
    const [u_dager, setUDager] = useState({
      mandag: tomDag(), tirsdag: tomDag(), onsdag: tomDag(),
      torsdag: tomDag(), fredag: tomDag()
    });
    const [u_loading, setULoading] = useState(false);
    const [u_feil, setUFeil] = useState("");
    const [u_aiLoading, setUAiLoading] = useState(false);
    const [bildevelgerForDag, setBildevelgerForDag] = useState(null);
    const [bildeOpplaster, setBildeOpplaster] = useState(false);
    const [nyAktivitet, setNyAktivitet] = useState({});
    const dndSensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
      useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } })
    );
    const DAG_FARGER_DEF = { mandag:"#1565c0",tirsdag:"#0277bd",onsdag:"#6a1b9a",torsdag:"#c62828",fredag:"#2d6a4f" };
    const TID_FARGER = { formiddag:{label:"Formiddag",col:"#1565c0",bg:"#e3f2fd"}, ettermiddag:{label:"Ettermiddag",col:"#6a1b9a",bg:"#f3e5f5"}, notat:{label:"Notat",col:"#5d7390",bg:"#f5f9fd"} };
    const FARGEVALG = ["","#1565c0","#6a1b9a","#2d6a4f","#c62828","#f57c00"];

    // Emoji-bibliotek for raske visuelle markeringer
    const EMOJI_BIBLIOTEK = [
      "🇳🇴","🎨","🏃","🌳","🍂","❄️","🌸","☀️","🌧️","🎵",
      "📚","🎭","🍎","🥕","🍰","🥖","🐰","🐻","🦋","🐟",
      "⚽","🚌","🏛️","🎪","🎂","🎁","💝","✏️","🖍️","🎯",
      "🌈","⭐","💧","🔥","🌙","🌞","🍪","🍵","📷","📅",
      "🎉","🚂","🏠","👫","💃","🎲","🎈","🎀","🏞️","🌻"
    ];

    // Last ukeplaner
    useEffect(() => {
      let avbrutt = false;
      (async () => {
        if (!aktivBruker?.id) { setLastet(true); return; }
        const liste = await hentUkeplaner(aktivBruker.id);
        if (!avbrutt) { setPlaner(liste); setLastet(true); }
      })();
      return () => { avbrutt = true; };
    }, [aktivBruker?.id]);

    // Åpne spesifikk plan fra søkeresultat
    useEffect(() => {
      if (!preselectPlanId || !lastet || planer.length === 0) return;
      const plan = planer.find(p => p.id === preselectPlanId);
      if (plan) { lesPlan(plan); setPreselectPlanId?.(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectPlanId, lastet, planer.length]);

    const lagre = async (oppdatertListe, tving = false) => {
      if (!tving) {
        const harKonflikt = await sjekkPlanKonflikt(aktivBruker.id, "ukeplaner", sesjonsStart);
        if (harKonflikt) { setKonflikt(true); setVentendeLagring(oppdatertListe); return false; }
      }
      const ok = await lagreUkeplaner(aktivBruker.id, oppdatertListe);
      if (!ok) { setUFeil("Kunne ikke lagre – muligens fordi lagring er blokkert i dette miljøet"); return false; }
      setKonflikt(false); setVentendeLagring(null);
      setPlaner(oppdatertListe);
      setGlobalUkeplaner(oppdatertListe);
      return true;
    };

    const konfliktLastInn = async () => {
      setLasterKonflikt(true);
      const liste = await hentUkeplaner(aktivBruker.id);
      setPlaner(liste);
      setGlobalUkeplaner(liste);
      setKonflikt(false); setVentendeLagring(null); setHarEndringer(false);
      setVisning("liste");
      setLasterKonflikt(false);
    };
    const konfliktOverskriver = async () => {
      if (ventendeLagring) await lagre(ventendeLagring, true);
    };

    const nyPlan = () => {
      setValgt(null);
      setUTittel(""); setUUke(""); setUTema(planTema);
      setUDager({
        mandag: tomDag(), tirsdag: tomDag(), onsdag: tomDag(),
        torsdag: tomDag(), fredag: tomDag()
      });
      setUFeil(""); setHarEndringer(false); setVisning("ny");
    };

    const redigerPlan = (p) => {
      setValgt(p);
      setUTittel(p.tittel); setUUke(p.uke || ""); setUTema(p.tema || "");
      const dg = p.dager || {};
      setUDager({
        mandag: migrerDag(dg.mandag), tirsdag: migrerDag(dg.tirsdag), onsdag: migrerDag(dg.onsdag),
        torsdag: migrerDag(dg.torsdag), fredag: migrerDag(dg.fredag)
      });
      setUFeil(""); setHarEndringer(false); setVisning("rediger");
    };

    const lesPlan = (p) => { setValgt(p); setVisning("les"); };

    const oppdaterDag = (dag, felt, verdi) => {
      setUDager(prev => ({ ...prev, [dag]: { ...prev[dag], [felt]: verdi } }));
      setHarEndringer(true);
    };

    const leggTilAktivitet = (dag, tid) => {
      const tekst = (nyAktivitet[dag+tid]||"").trim();
      if (!tekst) return;
      const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5);
      setUDager(prev=>({...prev,[dag]:{...prev[dag],aktiviteter:[...(prev[dag].aktiviteter||[]),{id,tid,tekst}]}}));
      setNyAktivitet(p=>({...p,[dag+tid]:""}));
      setHarEndringer(true);
    };
    const slettAktivitet = (dag, id) => {
      setUDager(prev=>({...prev,[dag]:{...prev[dag],aktiviteter:(prev[dag].aktiviteter||[]).filter(a=>a.id!==id)}}));
    };
    const handleDagDragEnd = (dag, event) => {
      const {active,over} = event;
      if (!over||active.id===over.id) return;
      setUDager(prev=>{
        const akt=[...(prev[dag].aktiviteter||[])];
        const oldIdx=akt.findIndex(a=>a.id===active.id);
        const newIdx=akt.findIndex(a=>a.id===over.id);
        if(oldIdx<0||newIdx<0)return prev;
        return {...prev,[dag]:{...prev[dag],aktiviteter:arrayMove(akt,oldIdx,newIdx)}};
      });
    };
    const flyttAktivitet = (fraDag, aktivitetId, tilDag) => {
      setUDager(prev=>{
        const akt=(prev[fraDag].aktiviteter||[]).find(a=>a.id===aktivitetId);
        if(!akt)return prev;
        return {...prev,
          [fraDag]:{...prev[fraDag],aktiviteter:(prev[fraDag].aktiviteter||[]).filter(a=>a.id!==aktivitetId)},
          [tilDag]:{...prev[tilDag],aktiviteter:[...(prev[tilDag].aktiviteter||[]),{...akt}]}
        };
      });
    };

    const fyllMedAI = async () => {
      if(!u_tema.trim()){setUFeil("Skriv et tema først");return;}
      setUAiLoading(true);setUFeil("");
      const sikkertTema = sanitizeForPrompt(u_tema, 100);
      const prompt=`Du er pedagog i norsk barnehage. Fyll en ukeplan med tema "${sikkertTema}" for uke ${u_uke||"?"}.
Returner KUN gyldig JSON uten markdown:
{"mandag":{"formiddag":"9:00 Samling","ettermiddag":"12:30 Utelek"},"tirsdag":{"formiddag":"...","ettermiddag":"...","maaltid":"Varm mat"},"onsdag":{"formiddag":"...","ettermiddag":"..."},"torsdag":{"formiddag":"...","ettermiddag":"..."},"fredag":{"formiddag":"...","ettermiddag":"...","notat":"Kortdag"}}`;
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),28000);
      try{
        const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:800}),signal:ctrl.signal});
        if(!r.ok){const d=await r.json().catch(()=>({}));setUFeil("❌ "+(d.error||"Serverfeil "+r.status));return;}
        const d=await r.json();const raw=d.text||"";
        const m=raw.match(/\{[\s\S]*\}/);if(!m)throw new Error("Ingen JSON");
        const parsed=JSON.parse(m[0]);
        const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
        const str=v=>typeof v==="string"?v.trim():"";
        const dagNavn=["mandag","tirsdag","onsdag","torsdag","fredag"];
        setUDager(prev=>{const ny={...prev};dagNavn.forEach(dag=>{if(!parsed[dag])return;const p=parsed[dag];const akt=[];const fm=str(p.formiddag);const em=str(p.ettermiddag);const no=str(p.notat);if(fm)akt.push({id:uid(),tid:"formiddag",tekst:fm});if(em)akt.push({id:uid(),tid:"ettermiddag",tekst:em});if(no)akt.push({id:uid(),tid:"notat",tekst:no});ny[dag]={...ny[dag],aktiviteter:akt,maaltid:str(p.maaltid)||ny[dag].maaltid||""};});return ny;});
        setHarEndringer(true); visLokal("✨ AI fylte inn aktiviteter for alle dager");
      }catch(e){console.error("[AI Ukeplan]",e);setUFeil(e.name==="AbortError"?"⏱ Tidsavbrudd – prøv igjen.":"❌ AI utilgjengelig");}
      finally{clearTimeout(tid);setUAiLoading(false);}
    };

    const settBilde = (dag, bildeData) => {
      oppdaterDag(dag, "bilde", bildeData);
      setBildevelgerForDag(null);
    };

    const lastOppBilde = async (dag, fil) => {
      if (!fil) return;
      if (!fil.type.startsWith("image/")) { setUFeil("Filen må være et bilde"); return; }
      if (fil.size > 4 * 1024 * 1024) { setUFeil("Bildet er for stort (maks 4 MB før komprimering)"); return; }
      setBildeOpplaster(true); setUFeil("");
      try {
        const komprimert = await komprimerBilde(fil, 300, 0.8);
        settBilde(dag, komprimert);
      } catch (e) {
        console.error("[Ukeplan bilde]", e);
        setUFeil("Kunne ikke lese bildet");
      } finally {
        setBildeOpplaster(false);
      }
    };

    const lagreNy = async () => {
      setUFeil("");
      if (!u_tittel.trim()) { setUFeil("Skriv en tittel"); return; }
      setULoading(true);
      const nyttObjekt = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
        tittel: u_tittel.trim(),
        uke: u_uke.trim(),
        tema: u_tema.trim(),
        dager: u_dager,
        opprettet: new Date().toISOString(),
        oppdatert: new Date().toISOString(),
      };
      const ok = await lagre([nyttObjekt, ...planer]);
      setULoading(false);
      if (ok) { setHarEndringer(false); vis("✅ Ukeplan lagret"); setVisning("liste"); }
    };

    const lagreEndring = async () => {
      setUFeil("");
      if (!valgt) return;
      if (!u_tittel.trim()) { setUFeil("Skriv en tittel"); return; }
      setULoading(true);
      const oppdatert = planer.map(p => p.id === valgt.id
        ? { ...p, tittel: u_tittel.trim(), uke: u_uke.trim(), tema: u_tema.trim(), dager: u_dager, oppdatert: new Date().toISOString() }
        : p);
      const ok = await lagre(oppdatert);
      setULoading(false);
      if (ok) { setHarEndringer(false); vis("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettPlan = async (id) => {
      const oppdatert = planer.filter(p => p.id !== id);
      const ok = await lagre(oppdatert);
      if (ok) { vis("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    // Bygg HTML for utskrift/nedlasting
    const byggHTML = (p) => {
      const dagNavn = { mandag:"MANDAG", tirsdag:"TIRSDAG", onsdag:"ONSDAG", torsdag:"TORSDAG", fredag:"FREDAG" };
      const erEmoji = (b) => b && !b.startsWith("data:");
      const dagerHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const data = p.dager?.[d] || {};
        const bildeHTML = data.bilde
          ? (erEmoji(data.bilde)
            ? `<div class="emoji">${escapeHTML(data.bilde)}</div>`
            : `<img src="${data.bilde}" alt="" class="dag-bilde"/>`)
          : "";
        return `
          <th>
            <div class="dag-tittel">${dagNavn[d]}</div>
            ${bildeHTML}
          </th>`;
      }).join("");
      const renderDagInnhold = (raw) => {
        if (!raw) return "";
        const data = Array.isArray(raw.aktiviteter) ? raw : (() => {
          const akt=[];
          if(raw.formiddag)(raw.formiddag).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"formiddag",tekst:t}));
          if(raw.ettermiddag)(raw.ettermiddag).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"ettermiddag",tekst:t}));
          if(raw.notat)(raw.notat).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"notat",tekst:t}));
          return {...raw, aktiviteter:akt};
        })();
        const TID_LABEL={formiddag:"Formiddag",ettermiddag:"Ettermiddag",notat:"Notat"};
        const TID_COL={formiddag:"#1565c0",ettermiddag:"#6a1b9a",notat:"#5d7390"};
        let html="";
        if(data.ansvarlig||data.maaltid)html+=`<div class="meta">${data.ansvarlig?`👤 ${escapeHTML(data.ansvarlig)} `:""}${data.maaltid?`🍽 ${escapeHTML(data.maaltid)}`:""}</div>`;
        ["formiddag","ettermiddag","notat"].forEach(tid=>{
          const akt=(data.aktiviteter||[]).filter(a=>a.tid===tid);
          if(!akt.length)return;
          html+=`<div class="felt"><strong style="color:${TID_COL[tid]}">${TID_LABEL[tid]}:</strong><br>${akt.map(a=>`• ${escapeHTML(a.tekst)}`).join("<br>")}</div>`;
        });
        return html;
      };
      const innholdHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const data = p.dager?.[d] || {};
        return `<td>${renderDagInnhold(data)}</td>`;
      }).join("");
      return `<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(p.tittel)} – Barnehagehjelpen</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,"Segoe UI",sans-serif;background:#fff;color:#1a2c45;padding:20px}
  .topp{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
  h1{font-size:24px;color:#2c5b8e}
  .meta{font-size:13px;color:#5d7390;margin-top:4px}
  .knapp{padding:9px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  table{width:100%;border-collapse:collapse;table-layout:fixed;border:2px solid #2c5b8e}
  th{background:#2c5b8e;color:#fff;padding:8px 6px;text-align:center;border:1px solid #1a4063;font-size:13px;vertical-align:top}
  th .dag-tittel{font-size:13px;font-weight:800;margin-bottom:4px}
  th .emoji{font-size:24px;line-height:1;margin-top:3px}
  th .dag-bilde{display:block;width:48px;height:48px;border-radius:5px;object-fit:cover;margin:4px auto 0;border:1px solid rgba(255,255,255,0.3)}
  td{border:1px solid #c4d6ec;padding:10px 8px;vertical-align:top;height:200px;font-size:11px;line-height:1.4}
  .felt{margin-bottom:8px;color:#1a2c45}
  .felt strong{color:#2c5b8e;display:block;margin-bottom:2px;font-size:10px;text-transform:uppercase;letter-spacing:0.4px}
  .felt.notat{color:#5d7390}
  @media print{@page{margin:10mm;size:landscape}.topp .knapp{display:none}body{padding:0}}
</style></head>
<body>
  <div class="topp">
    <div>
      <h1>📅 ${escapeHTML(p.tittel)}</h1>
      <div class="meta">${p.uke ? "Uke " + escapeHTML(p.uke) : ""}${p.uke && p.tema ? " • " : ""}${p.tema ? "Tema: " + escapeHTML(p.tema) : ""}</div>
    </div>
    <button class="knapp" onclick="window.print()">🖨️ Skriv ut</button>
  </div>
  <table>
    <thead><tr>${dagerHTML}</tr></thead>
    <tbody><tr>${innholdHTML}</tr></tbody>
  </table>
</body></html>`;
    };

    const skrivUt = (p) => {
      let beforePrintFiret = false;
      const beforeHandler = () => { beforePrintFiret = true; };
      const afterHandler = () => {
        window.removeEventListener("beforeprint", beforeHandler);
        window.removeEventListener("afterprint", afterHandler);
      };
      try {
        // Sett opp print-stiler (én gang) som skjuler resten av appen
        if (!document.getElementById("ukeplan-print-styles")) {
          const style = document.createElement("style");
          style.id = "ukeplan-print-styles";
          style.textContent = `
            #ukeplan-print-area { display: none; }
            @media print {
              @page { margin: 10mm; size: landscape; }
              html, body { background: white !important; }
              body > *:not(#ukeplan-print-area) { display: none !important; }
              #ukeplan-print-area { display: block !important; }
              #ukeplan-print-area { font-family: 'Nunito', sans-serif; color: #1a2c45; }
              #ukeplan-print-area h1 { font-size: 22px; color: #2c5b8e; margin: 0 0 4px; }
              #ukeplan-print-area .meta { font-size: 12px; color: #5d7390; margin-bottom: 12px; }
              #ukeplan-print-area table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 2px solid #2c5b8e; }
              #ukeplan-print-area th { background: #2c5b8e; color: #fff; padding: 8px 6px; text-align: center; border: 1px solid #1a4063; font-size: 13px; vertical-align: top; }
              #ukeplan-print-area th .emoji { font-size: 22px; line-height: 1; margin-top: 3px; }
              #ukeplan-print-area th img { display: block; width: 44px; height: 44px; border-radius: 5px; object-fit: cover; margin: 4px auto 0; border: 1px solid rgba(255,255,255,0.3); }
              #ukeplan-print-area td { border: 1px solid #c4d6ec; padding: 8px 6px; vertical-align: top; height: 180px; font-size: 11px; line-height: 1.4; }
              #ukeplan-print-area .felt { margin-bottom: 7px; color: #1a2c45; }
              #ukeplan-print-area .felt strong { color: #2c5b8e; display: block; margin-bottom: 2px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; }
              #ukeplan-print-area .felt.notat { color: #5d7390; }
            }
          `;
          document.head.appendChild(style);
        }

        // Bygg utskriftsinnhold som direkte HTML (ikke selvstendig dokument)
        const erEmoji = (b) => b && !b.startsWith("data:");
        const dagNavn = { mandag:"MANDAG", tirsdag:"TIRSDAG", onsdag:"ONSDAG", torsdag:"TORSDAG", fredag:"FREDAG" };
        const dagerHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
          const data = p.dager?.[d] || {};
          const bildeHTML = data.bilde
            ? (erEmoji(data.bilde) ? `<div class="emoji">${escapeHTML(data.bilde)}</div>` : `<img src="${data.bilde}" alt=""/>`)
            : "";
          return `<th><div>${dagNavn[d]}</div>${bildeHTML}</th>`;
        }).join("");
        const innholdHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
          const raw = p.dager?.[d] || {};
          const akt=Array.isArray(raw.aktiviteter)?raw.aktiviteter:(()=>{const a=[];if(raw.formiddag)(raw.formiddag).split('\n').filter(Boolean).forEach(t=>a.push({tid:"formiddag",tekst:t}));if(raw.ettermiddag)(raw.ettermiddag).split('\n').filter(Boolean).forEach(t=>a.push({tid:"ettermiddag",tekst:t}));if(raw.notat)(raw.notat).split('\n').filter(Boolean).forEach(t=>a.push({tid:"notat",tekst:t}));return a;})();
          const meta=(raw.ansvarlig||raw.maaltid)?`<div class="felt meta">${raw.ansvarlig?`👤 ${escapeHTML(raw.ansvarlig)} `:""}${raw.maaltid?`🍽 ${escapeHTML(raw.maaltid)}`:""}</div>`:"";
          const innhTids=["formiddag","ettermiddag","notat"].map(tid=>{const ts=akt.filter(a=>a.tid===tid);return ts.length?`<div class="felt"><strong>${tid.charAt(0).toUpperCase()+tid.slice(1)}:</strong>${ts.map(a=>`<br>• ${escapeHTML(a.tekst)}`).join("")}</div>`:""}).join("");
          return `<td>${meta}${innhTids}</td>`;
        }).join("");

        let area = document.getElementById("ukeplan-print-area");
        if (!area) {
          area = document.createElement("div");
          area.id = "ukeplan-print-area";
          document.body.appendChild(area);
        }
        area.innerHTML = `
          <h1>📅 ${escapeHTML(p.tittel)}</h1>
          <div class="meta">${p.uke ? "Uke " + escapeHTML(p.uke) : ""}${p.uke && p.tema ? " • " : ""}${p.tema ? "Tema: " + escapeHTML(p.tema) : ""}</div>
          <table><thead><tr>${dagerHTML}</tr></thead><tbody><tr>${innholdHTML}</tr></tbody></table>
        `;

        window.addEventListener("beforeprint", beforeHandler);
        window.addEventListener("afterprint", afterHandler);

        setTimeout(() => {
          try { window.print(); }
          catch (e) { console.warn("[Ukeplan utskrift] window.print() kastet:", e); }

          // Fallback: hvis beforeprint ikke fyrte, er print-dialogen blokkert – last ned i stedet
          setTimeout(() => {
            if (!beforePrintFiret) {
              afterHandler();
              visLokal("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
              setTimeout(() => lastNed(p), 700);
            }
          }, 1800);
        }, 100);
      } catch (e) {
        console.error("[Ukeplan utskrift] uventet feil:", e);
        afterHandler();
        lastNed(p);
      }
    };

    const lastNed = (p) => {
      try {
        const html = byggHTML(p);
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `ukeplan-${p.tittel.replace(/[^a-zA-Z0-9æøåÆØÅ]/g,"-")}-${new Date().toISOString().slice(0,10)}.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 1500);
        visLokal("✅ Lastet ned");
      } catch (e) {
        console.error("[Ukeplan nedlasting]", e);
        visLokal("❌ Nedlasting feilet");
      }
    };

    const dupliser = async (p) => {
      const kopi = {
        ...JSON.parse(JSON.stringify(p)), // dyp kopi
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
        tittel: `${p.tittel} (kopi)`,
        opprettet: new Date().toISOString(),
        oppdatert: new Date().toISOString(),
      };
      const ok = await lagre([kopi, ...planer]);
      if (ok) { visLokal("✅ Plan duplisert – finn den øverst i listen"); setVisning("liste"); }
    };

    const kopier = async (p) => {
      const erEmoji = (b) => b && !b.startsWith("data:");
      const tekst = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const raw = p.dager?.[d] || {};
        const data = migrerDag(raw);
        const dagN = d.charAt(0).toUpperCase() + d.slice(1);
        const emojiPrefix = erEmoji(data.bilde) ? data.bilde + " " : "";
        const linjer = [];
        const tidLabel = { formiddag:"Formiddag", ettermiddag:"Ettermiddag", notat:"Notat" };
        ["formiddag","ettermiddag","notat"].forEach(tid => {
          const akt = (data.aktiviteter||[]).filter(a=>a.tid===tid);
          if (akt.length) linjer.push(`  ${tidLabel[tid]}: ${akt.map(a=>a.tekst).join(", ")}`);
        });
        if (data.ansvarlig) linjer.push(`  Ansvarlig: ${data.ansvarlig}`);
        if (data.maaltid) linjer.push(`  Måltid: ${data.maaltid}`);
        return `${emojiPrefix}${dagN}:\n${linjer.length ? linjer.join("\n") : "  -"}`;
      }).join("\n\n");
      const full = `${p.tittel}\n${p.uke ? "Uke " + p.uke : ""}${p.tema ? "\nTema: " + p.tema : ""}\n\n${tekst}`;
      try {
        await navigator.clipboard.writeText(full);
        visLokal("✅ Kopiert");
      } catch {
        visLokal("❌ Kopiering støttes ikke i denne nettleseren");
      }
    };

    const filtrert = planer.filter(p => {
      if (!sok) return true;
      const s = sok.toLowerCase();
      return p.tittel.toLowerCase().includes(s) || (p.tema||"").toLowerCase().includes(s);
    });

    const iS = {width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:14,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10,outline:"none"};
    const labelStil = {display:"block",fontWeight:700,color:C.t,fontSize:12,marginBottom:5};

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // VISNING: Ny / Rediger
    if (visning === "ny" || visning === "rediger") {
      const erRediger = visning === "rediger";
      const tilbake = () => {
        if (harEndringer) { setBekreftNavigerBort("liste"); return; }
        setHarEndringer(false); setVisning("liste");
      };
      return (
        <div className="fade">
          {bekreftNavigerBort && (
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
              <div style={{background:"var(--c-w)",borderRadius:14,padding:22,maxWidth:340,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#c62828",marginBottom:8}}>⚠️ Ulagrede endringer</div>
                <p style={{fontSize:13,color:"var(--c-t)",lineHeight:1.6,marginBottom:16}}>Du har endringer som ikke er lagret. Vil du forlate skjemaet uten å lagre?</p>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setBekreftNavigerBort(null)} style={{flex:1,padding:"11px",background:"var(--c-lg2)",color:"var(--c-t)",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bli her</button>
                  <button onClick={()=>{setHarEndringer(false);setBekreftNavigerBort(null);setVisning(bekreftNavigerBort);}} style={{flex:1,padding:"11px",background:"#c62828",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Forlat uten å lagre</button>
                </div>
              </div>
            </div>
          )}
          <button onClick={tilbake} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger ukeplan":"📅 Ny ukeplan"}</div>

          {lokalToast && <div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",padding:"9px 13px",borderRadius:9,fontSize:12,marginBottom:10,fontWeight:700,textAlign:"center"}}>{lokalToast}</div>}
          {u_feil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {u_feil}</div>}

          <div style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <label style={labelStil}>Tittel</label>
            <input type="text" value={u_tittel} onChange={e=>{setUTittel(e.target.value);setHarEndringer(true);}} style={iS} placeholder="F.eks. 'Ukeplan blå avdeling'"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:9}}>
              <div>
                <label style={labelStil}>Uke (nr.)</label>
                <input type="text" value={u_uke} onChange={e=>{setUUke(e.target.value);setHarEndringer(true);}} style={iS} placeholder="22" inputMode="numeric"/>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <label style={{...labelStil,marginBottom:0}}>Tema</label>
                  {u_tema.trim() && u_tema.trim() !== planTema && (
                    <button type="button" onClick={()=>setPlanTema(u_tema.trim())} style={{background:"none",border:"none",color:"#1565c0",fontSize:10,cursor:"pointer",fontWeight:700,padding:0,fontFamily:"'Nunito',sans-serif"}}>🔗 Sett som felles</button>
                  )}
                </div>
                <input type="text" value={u_tema} onChange={e=>{setUTema(e.target.value);setHarEndringer(true);}} style={iS} placeholder={planTema||"F.eks. 17. mai og mangfold"}/>
                {planTema && !u_tema.trim() && (
                  <div onClick={()=>setUTema(planTema)} style={{fontSize:10,color:"#1565c0",marginTop:3,cursor:"pointer",fontWeight:600}}>← Bruk felles tema: «{planTema}»</div>
                )}
              </div>
            </div>
          </div>

          <div style={{background:C.lg2,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Fyll med AI</div>
              <button onClick={fyllMedAI} disabled={u_aiLoading||!u_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:u_tema.trim()?1:0.5}}>{u_aiLoading?"⏳ Genererer...":"✨ Fyll alle dager"}</button>
            </div>
            <div style={{fontSize:11,color:C.gr}}>{u_aiLoading?"Henter aktiviteter fra AI – ca. 10 sek...":"Skriv tema og la AI fylle inn aktiviteter for hele uken"}</div>
          </div>

          {["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagBilde = u_dager[d].bilde;
            const dagFarge = u_dager[d].farge || DAG_FARGER_DEF[d];
            const erEmoji = dagBilde && !dagBilde.startsWith("data:");
            const dAgAkt = u_dager[d].aktiviteter || [];
            return (
              <div key={d} style={{background:C.w,borderRadius:11,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(44,91,142,0.06)",borderLeft:`3px solid ${dagFarge}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontWeight:800,color:dagFarge,fontSize:14}}>{dagN}</div>
                    <div style={{display:"flex",gap:4}}>{FARGEVALG.map(f=><button key={f||"ingen"} type="button" onClick={()=>oppdaterDag(d,"farge",f)} style={{width:14,height:14,borderRadius:"50%",border:(u_dager[d].farge||"")===f?"2px solid #333":"1.5px solid #ccc",background:f||DAG_FARGER_DEF[d],cursor:"pointer",padding:0}}/>)}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {dagBilde ? (<>
                      {erEmoji?<span style={{fontSize:22,lineHeight:1}}>{dagBilde}</span>:<img src={dagBilde} alt="" style={{width:32,height:32,borderRadius:6,objectFit:"cover",border:"1px solid #d8e6f5"}}/>}
                      <button type="button" aria-label="Slett bilde" onClick={()=>oppdaterDag(d,"bilde","")} style={{background:"#fdecea",color:"#c62828",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,padding:0}}>✕</button>
                    </>) : (
                      <button type="button" onClick={()=>setBildevelgerForDag(d)} style={{background:"#e8eff8",color:dagFarge,border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>📷 Bilde</button>
                    )}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <label style={{...labelStil,fontSize:10}}>Ansvarlig</label>
                    <input value={u_dager[d].ansvarlig||""} onChange={e=>oppdaterDag(d,"ansvarlig",e.target.value)} placeholder="Navn..." style={{...iS,marginBottom:0,padding:"7px 10px",fontSize:12}}/>
                  </div>
                  <div>
                    <label style={{...labelStil,fontSize:10}}>Måltid</label>
                    <input value={u_dager[d].maaltid||""} onChange={e=>oppdaterDag(d,"maaltid",e.target.value)} placeholder="Frokost, lunsj..." style={{...iS,marginBottom:0,padding:"7px 10px",fontSize:12}}/>
                  </div>
                </div>

                {["formiddag","ettermiddag","notat"].map(tid=>{
                  const tidAkt=dAgAkt.filter(a=>a.tid===tid);
                  const tidInfo=TID_FARGER[tid];
                  return(
                    <div key={tid} style={{marginBottom:8}}>
                      <div style={{fontSize:9,fontWeight:800,color:tidInfo.col,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{tidInfo.label}</div>
                      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={e=>handleDagDragEnd(d,e)}>
                        <SortableContext items={tidAkt.map(a=>a.id)} strategy={verticalListSortingStrategy}>
                          {tidAkt.map(a=><SortableAktivitetItem key={a.id} a={a} tidCol={tidInfo.col} tidBg={tidInfo.bg} dager={["mandag","tirsdag","onsdag","torsdag","fredag"]} dag={d} slettFn={slettAktivitet} flyttFn={flyttAktivitet}/>)}
                        </SortableContext>
                      </DndContext>
                      <div style={{display:"flex",gap:5,marginTop:2}}>
                        <input value={nyAktivitet[d+tid]||""} onChange={e=>setNyAktivitet(p=>({...p,[d+tid]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&leggTilAktivitet(d,tid)} placeholder={`+ Legg til ${tidInfo.label.toLowerCase()}...`} style={{flex:1,padding:"5px 8px",borderRadius:7,border:"1.5px dashed #d0dff0",fontSize:11,fontFamily:"'Nunito',sans-serif",background:tidInfo.bg,color:C.t,outline:"none"}}/>
                        <button type="button" onClick={()=>leggTilAktivitet(d,tid)} style={{background:tidInfo.col,color:"#fff",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* BILDEVELGER-MODAL */}
          {bildevelgerForDag && (
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBildevelgerForDag(null)} onKeyDown={e=>e.key==="Escape"&&setBildevelgerForDag(null)} tabIndex={-1}>
              <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:18,maxWidth:420,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.t,marginBottom:6}}>📷 Velg bilde for {bildevelgerForDag.charAt(0).toUpperCase()+bildevelgerForDag.slice(1)}</div>
                <p style={{fontSize:12,color:C.gr,marginBottom:14,lineHeight:1.5}}>Velg en emoji nedenfor, eller last opp et eget bilde.</p>

                <div style={{fontSize:11,fontWeight:800,color:C.t,marginBottom:6,textTransform:"uppercase",letterSpacing:0.4}}>Emoji-bibliotek</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(40px, 1fr))",gap:5,marginBottom:14,maxHeight:220,overflowY:"auto",padding:6,background:"#f5f9fd",borderRadius:9}}>
                  {EMOJI_BIBLIOTEK.map(e => (
                    <button key={e} type="button" onClick={()=>settBilde(bildevelgerForDag, e)}
                      style={{fontSize:22,padding:"6px 4px",background:"#fff",border:"1px solid #e8eff8",borderRadius:6,cursor:"pointer",lineHeight:1,fontFamily:"inherit"}}>
                      {e}
                    </button>
                  ))}
                </div>

                <div style={{fontSize:11,fontWeight:800,color:C.t,marginBottom:6,textTransform:"uppercase",letterSpacing:0.4}}>Eller last opp eget bilde</div>
                <label style={{display:"block",padding:"11px",background:"#e8eff8",color:C.t,borderRadius:9,cursor:bildeOpplaster?"wait":"pointer",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:10}}>
                  {bildeOpplaster ? "⏳ Behandler ..." : "📁 Velg bilde fra enheten"}
                  <input type="file" accept="image/*" disabled={bildeOpplaster}
                    onChange={e=>lastOppBilde(bildevelgerForDag, e.target.files?.[0])}
                    style={{display:"none"}}/>
                </label>

                <button type="button" onClick={()=>setBildevelgerForDag(null)}
                  style={{width:"100%",padding:"10px",background:"transparent",color:C.gr,border:"1px solid #e8eff8",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                  Avbryt
                </button>
              </div>
            </div>
          )}

          <button onClick={erRediger?lagreEndring:lagreNy} disabled={u_loading} style={{width:"100%",padding:"13px",fontSize:14,fontWeight:800,background:u_loading?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:11,cursor:u_loading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.25)",marginTop:6}}>
            {u_loading?"Lagrer ...":(erRediger?"💾 Lagre endringer":"💾 Lagre ukeplan")}
          </button>
        </div>
      );
    }

    // VISNING: Les enkelt-plan
    if (visning === "les" && valgt) {
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{background:C.w,borderRadius:14,padding:16,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:6}}>📅 {valgt.tittel}</div>
            <div style={{fontSize:12,color:C.gr,marginBottom:0}}>
              {valgt.uke && <span style={{marginRight:10}}>Uke {valgt.uke}</span>}
              {valgt.tema && <span><strong>Tema:</strong> {valgt.tema}</span>}
            </div>
          </div>

          {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
            <button onClick={()=>skrivUt(valgt)} style={{background:"#2c5b8e",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button onClick={()=>lastNed(valgt)} style={{background:"#1565c0",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>💾 Last ned</button>
            <button onClick={()=>kopier(valgt)} style={{background:C.mint,color:C.g,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📋 Kopier tekst</button>
            <button onClick={()=>redigerPlan(valgt)} style={{background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
            <button onClick={()=>dupliser(valgt)} style={{background:"#e8f5e9",color:"#2e7d32",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📑 Dupliser</button>
          </div>

          {["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
            const raw = valgt.dager?.[d] || {};
            const data = migrerDag(raw);
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagFarge = data.farge || DAG_FARGER_DEF[d];
            const erEmoji = data.bilde && !data.bilde.startsWith("data:");
            const harInnhold = data.aktiviteter?.length > 0 || data.ansvarlig || data.maaltid;
            return (
              <div key={d} style={{background:C.w,borderRadius:11,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(44,91,142,0.06)",borderLeft:`3px solid ${dagFarge}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{fontWeight:800,color:dagFarge,fontSize:14,flex:1}}>{dagN}</div>
                  {data.ansvarlig&&<span style={{fontSize:10,color:C.gr,background:"#f5f9fd",borderRadius:6,padding:"2px 7px"}}>{data.ansvarlig}</span>}
                  {data.maaltid&&<span style={{fontSize:10,color:"#f57c00",background:"#fff3e0",borderRadius:6,padding:"2px 7px"}}>🍽 {data.maaltid}</span>}
                  {data.bilde && (erEmoji?<span style={{fontSize:24,lineHeight:1}}>{data.bilde}</span>:<img src={data.bilde} alt="" style={{width:38,height:38,borderRadius:7,objectFit:"cover",border:"1px solid #d8e6f5"}}/>)}
                </div>
                {!harInnhold ? (
                  <div style={{fontSize:12,color:C.gr,fontStyle:"italic"}}>– ingen plan –</div>
                ) : (
                  <>
                    {["formiddag","ettermiddag","notat"].map(tid=>{
                      const tidAkt=(data.aktiviteter||[]).filter(a=>a.tid===tid);
                      if(!tidAkt.length)return null;
                      const ti=TID_FARGER[tid];
                      return(
                        <div key={tid} style={{marginBottom:8}}>
                          <div style={{fontSize:9,fontWeight:800,color:ti.col,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{ti.label}</div>
                          {tidAkt.map(a=>(
                            <div key={a.id} style={{background:ti.bg,borderRadius:6,padding:"4px 9px",marginBottom:3,fontSize:12,color:"#1a2c45"}}>{a.tekst}</div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}

          {bekreftSletting
            ? <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft sletting</button>
                <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
              </div>
            : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",width:"100%",marginTop:8}}>🗑 Slett ukeplan</button>
          }
          <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}{valgt.oppdatert!==valgt.opprettet && " • Sist endret: "+new Date(valgt.oppdatert).toLocaleDateString("no-NO")}</div>
        </div>
      );
    }

    // VISNING: Liste (default)
    return (
      <div className="fade">
        <KonfliktDialog vis={konflikt} onLastInn={konfliktLastInn} onOverskriver={konfliktOverskriver} lasterInn={lasterKonflikt} />
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📅 Ukeplaner</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Mandag–fredag med formiddag, ettermiddag og notat</p>

        <button onClick={nyPlan} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.2)",marginBottom:12}}>📅 Lag ny ukeplan</button>

        {planer.length > 0 && (
          <input type="text" value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk i ukeplaner ..." style={{...iS,marginBottom:12}}/>
        )}

        {planer.length === 0 ? (
          <div style={{textAlign:"center",padding:34,background:C.w,borderRadius:12,boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
            <div style={{fontSize:42,marginBottom:9}}>📅</div>
            <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen ukeplaner ennå</div>
            <div style={{fontSize:12,color:C.gr,lineHeight:1.6,maxWidth:280,margin:"0 auto"}}>Lag uke-for-uke planer med tema, samlingsstund, aktiviteter og notater. Skriv ut eller last ned for å henge opp.</div>
          </div>
        ) : filtrert.length === 0 ? (
          <div style={{textAlign:"center",padding:24,background:C.w,borderRadius:12,color:C.gr,fontSize:13}}>Ingen treff på søket</div>
        ) : (
          <div style={{display:"grid",gap:9}}>
            <div style={{fontSize:11,color:C.gr}}>{filtrert.length} av {planer.length} ukeplaner</div>
            {filtrert.map(p => (
              <div key={p.id} className="hover" onClick={()=>lesPlan(p)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:5}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14,lineHeight:1.3,flex:1,wordBreak:"break-word"}}>{p.tittel}</div>
                  {p.uke && <div style={{fontSize:10,color:C.gr,whiteSpace:"nowrap",flexShrink:0,background:"#e8eff8",padding:"2px 8px",borderRadius:7,fontWeight:700}}>Uke {p.uke}</div>}
                </div>
                {p.tema && <div style={{fontSize:12,color:C.gr,lineHeight:1.5}}>{p.tema}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Ukeplaner lagres automatisk i skyen og er tilgjengelige på alle enheter når du er innlogget. Bruk "💾 Last ned"-knappen for lokal backup.
        </div>
      </div>
    );
  }




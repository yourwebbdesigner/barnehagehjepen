import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { hentArsplaner, lagreArsplaner, skrivUtGenerell, lastNedPlanPDF } from './api.js';

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
function AIKnapper({ seksjonId, aiAktiv, aiLoading, aiTekst, utforSeksjonAI, aksepterForslag, avvisForslag }) {
  const erAktivSeksjon = aiAktiv?.seksjonId === seksjonId;
  const handlinger = [
    { id:"start",        label:"✨ Hjelp meg starte",  bg:"linear-gradient(135deg,#2c5b8e,#4178bd)", col:"#fff" },
    { id:"profesjonell", label:"✨ Mer profesjonell",   bg:"#e8eff8", col:C.g },
    { id:"rammeplan",    label:"✨ Tilpass Rammeplan",  bg:"#d8f3dc", col:"#2d6a4f" },
    { id:"forkort",      label:"✨ Forkort teksten",    bg:"#fff8e1", col:"#795548" },
    { id:"alternativ",   label:"✨ Gi flere forslag",   bg:"#f3e5f5", col:"#6a1b9a" },
  ];
  return (
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
        {handlinger.map(h => {
          const erDenne = erAktivSeksjon && aiAktiv?.handling === h.id && aiLoading;
          return (
            <button key={h.id} disabled={aiLoading && erAktivSeksjon} onClick={() => utforSeksjonAI(seksjonId, h.id)}
              style={{background:h.bg,color:h.col,border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:aiLoading&&erAktivSeksjon?"wait":"pointer",fontFamily:"'Nunito',sans-serif",opacity:aiLoading&&erAktivSeksjon?0.65:1,transition:"opacity 0.15s"}}>
              {erDenne ? "⏳ Genererer..." : h.label}
            </button>
          );
        })}
      </div>
      {erAktivSeksjon && aiTekst && (
        <div ref={el => el && el.scrollIntoView({ behavior:"smooth", block:"nearest" })} className="fade" style={{background:C.lg2,border:"2px solid var(--c-g)",borderRadius:10,padding:12,marginTop:10}}>
          <div style={{fontSize:11,fontWeight:800,color:C.g,marginBottom:6}}>✨ AI-forslag – klikk "Bruk" for å legge inn i seksjonen:</div>
          <div style={{fontSize:12,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.6,marginBottom:8,maxHeight:220,overflowY:"auto"}}>{aiTekst}</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={() => aksepterForslag(seksjonId)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✅ Bruk forslaget</button>
            <button onClick={avvisForslag} style={{background:"transparent",color:C.gr,border:"1px solid var(--c-divider)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avvis</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArsplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema } = ctx;

    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [lagrer, setLagrer] = useState(false);
    const [planFeil, setPlanFeil] = useState("");
    const [ap, setAp] = useState(null); // plan under redigering

    // Lokal toast – unngår å trigge parent re-render som resetter state
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(() => setLokalToast(""), 3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

    // AI-state
    const [aiAktiv, setAiAktiv] = useState(null); // { seksjonId, handling }
    const [aiTekst, setAiTekst] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const SEKSJONER = [
      { id:"om_barnehagen",         navn:"Om barnehagen",                  ikon:"🏫", beskrivelse:"Navn, beliggenhet, avdelinger, aldersgrupper og antall barn og ansatte" },
      { id:"verdigrunnlag",         navn:"Verdigrunnlag",                  ikon:"💫", beskrivelse:"Barnehagens kjerneverdier, menneskesyn og pedagogisk grunnholdning" },
      { id:"pedagogisk_profil",     navn:"Pedagogisk profil",              ikon:"📚", beskrivelse:"Pedagogisk grunnsyn, metoder, satsningsområder og barnesyn" },
      { id:"omsorg_lek_laering",    navn:"Omsorg, lek, læring og danning", ikon:"🌱", beskrivelse:"Hvordan barnehagen ivaretar barnets helhetlige utvikling" },
      { id:"fagomrader",            navn:"Rammeplanens fagområder",        ikon:"📖", beskrivelse:"Arbeid med de 7 fagområdene fra Rammeplanen for barnehagen 2017" },
      { id:"samarbeid_foresatte",   navn:"Samarbeid med foresatte",        ikon:"🤝", beskrivelse:"Foreldresamarbeid, foreldremøter, daglig dialog og medvirkning" },
      { id:"dokumentasjon_vurd",    navn:"Dokumentasjon og vurdering",     ikon:"📋", beskrivelse:"Metoder for dokumentasjon, systematisk vurdering og refleksjon" },
      { id:"overganger",            navn:"Overganger",                     ikon:"🎓", beskrivelse:"Tilvenning, overgang mellom avdelinger og overgang til skolen" },
    ];

    const MANEDER = [
      { id:"august",    navn:"August",    ikon:"🌾", farge:"#e67e22" },
      { id:"september", navn:"September", ikon:"🍂", farge:"#c0392b" },
      { id:"oktober",   navn:"Oktober",   ikon:"🎃", farge:"#8e44ad" },
      { id:"november",  navn:"November",  ikon:"🍁", farge:"#2c3e50" },
      { id:"desember",  navn:"Desember",  ikon:"🎄", farge:"#2980b9" },
      { id:"januar",    navn:"Januar",    ikon:"❄️", farge:"#3498db" },
      { id:"februar",   navn:"Februar",   ikon:"❤️", farge:"#e91e63" },
      { id:"mars",      navn:"Mars",      ikon:"🌷", farge:"#27ae60" },
      { id:"april",     navn:"April",     ikon:"🐣", farge:"#f39c12" },
      { id:"mai",       navn:"Mai",       ikon:"🇳🇴", farge:"#c0392b" },
      { id:"juni",      navn:"Juni",      ikon:"☀️", farge:"#f1c40f" },
      { id:"juli",      navn:"Juli",      ikon:"🏖️", farge:"#e67e22" },
    ];

    const skrivUtArsplan = (p) => {
      const sek = SEKSJONER.filter(s=>p.seksjoner?.[s.id]?.trim()).map(s=>({label:`${s.ikon} ${s.navn}`,tekst:p.seksjoner[s.id],farge:"#2c5b8e",bg:"#f5f9fd"}));
      const hjulMnd = MANEDER.filter(m=>p.arshjul?.[m.id]?.tema||p.arshjul?.[m.id]?.aktiviteter);
      if(hjulMnd.length>0){
        const hjulTekst=hjulMnd.map(m=>{const d=p.arshjul[m.id];const l=[];if(d.tema)l.push("Tema: "+d.tema);if(d.aktiviteter)l.push(d.aktiviteter);if(d.notat)l.push("("+d.notat+")");return m.ikon+" "+m.navn+"\n"+l.join("\n");}).join("\n\n");
        sek.push({label:"📅 Årshjul",tekst:hjulTekst,farge:"#52b788",bg:"#e8f5e9"});
      }
      skrivUtGenerell({tittel:p.tittel||"Årsplan",meta:[p.barnehage,p.avdeling,p.alder,p.aar].filter(Boolean).join(" • "),seksjoner:sek});
    };

    const tomArsplan = () => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      tittel: "", barnehage: "", avdeling: "", alder: "",
      aar: new Date().getFullYear() + "/" + (new Date().getFullYear()+1),
      seksjoner: Object.fromEntries(SEKSJONER.map(s => [s.id, ""])),
      arshjul: Object.fromEntries(MANEDER.map(m => [m.id, { tema:"", aktiviteter:"", notat:"" }])),
      opprettet: new Date().toISOString(),
      oppdatert: new Date().toISOString(),
    });

    useEffect(() => {
      let avbrutt = false;
      (async () => {
        if (!aktivBruker?.id) { setLastet(true); return; }
        const liste = await hentArsplaner(aktivBruker.id);
        if (!avbrutt) { setPlaner(liste); setLastet(true); }
      })();
      return () => { avbrutt = true; };
    }, [aktivBruker?.id]);

    const lagreListe = async (oppdatertListe) => {
      const ok = await lagreArsplaner(aktivBruker.id, oppdatertListe);
      if (!ok) { setPlanFeil("Kunne ikke lagre – muligens fordi lagring er blokkert"); return false; }
      setPlaner(oppdatertListe);
      return true;
    };

    const nyPlan = () => { setAp(tomArsplan()); setPlanFeil(""); setAiAktiv(null); setAiTekst(""); setVisning("ny"); };
    const redigerPlan = (p) => { setAp({ ...p, seksjoner:{...p.seksjoner}, arshjul:{...p.arshjul} }); setPlanFeil(""); setAiAktiv(null); setAiTekst(""); setVisning("rediger"); };
    const lesPlan = (p) => { setValgt(p); setVisning("les"); };

    const oppdaterSeksjon = (id, tekst) => setAp(prev => ({ ...prev, seksjoner: { ...prev.seksjoner, [id]: tekst } }));
    const oppdaterArshjul = (maaned, felt, verdi) => setAp(prev => ({ ...prev, arshjul: { ...prev.arshjul, [maaned]: { ...prev.arshjul[maaned], [felt]: verdi } } }));

    const lagreNy = async () => {
      if (!ap?.tittel?.trim()) { setPlanFeil("Skriv en tittel for årsplanen"); return; }
      setLagrer(true);
      const ny = { ...ap, opprettet: new Date().toISOString(), oppdatert: new Date().toISOString() };
      const ok = await lagreListe([ny, ...planer]);
      setLagrer(false);
      if (ok) { visLokal("✅ Årsplan lagret"); setVisning("liste"); }
    };

    const lagreEndring = async () => {
      if (!ap?.tittel?.trim()) { setPlanFeil("Skriv en tittel for årsplanen"); return; }
      setLagrer(true);
      const oppdatert = planer.map(p => p.id === ap.id ? { ...ap, oppdatert: new Date().toISOString() } : p);
      const ok = await lagreListe(oppdatert);
      setLagrer(false);
      if (ok) { visLokal("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettPlan = async (id) => {
      const ny = planer.filter(p => p.id !== id);
      const ok = await lagreListe(ny);
      if (ok) { visLokal("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    // ── AI-hjelper (gjenbruker samme mønster som AiSideComp) ──
    const kallAI = async (prompt, onResultat, maxTokens = 1500) => {
      const AI_ENDPOINT = (typeof window !== "undefined" && window.__BH_AI_ENDPOINT) || "/api/ai";
      const BRUK_BACKEND = AI_ENDPOINT !== "https://api.anthropic.com/v1/messages";
      const body = BRUK_BACKEND
        ? { prompt, max_tokens: maxTokens }
        : { model:"claude-sonnet-4-6", max_tokens: maxTokens, messages:[{ role:"user", content:prompt }] };
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 31000);
      try {
        const r = await fetch(AI_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), signal:ctrl.signal });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json();
        let tekst = "";
        if (typeof data?.text === "string") tekst = data.text.trim();
        else if (Array.isArray(data?.content)) tekst = data.content.map(b => b.text||"").join("\n").trim();
        onResultat(tekst.length > 10 ? tekst : null);
      } catch(e) {
        console.warn("[Årsplan AI]", e);
        onResultat(null);
      } finally {
        clearTimeout(tid);
      }
    };

    const byggSeksjonPrompt = (seksjonId, handling, plan) => {
      const s = SEKSJONER.find(x => x.id === seksjonId);
      const eks = plan?.seksjoner?.[seksjonId] || "";
      const ctx = `Barnehage: "${plan?.barnehage||"ikke oppgitt"}". Avdeling: "${plan?.avdeling||"ikke oppgitt"}". Alder: "${plan?.alder||"ikke oppgitt"}". Barnehageår: ${plan?.aar||"2025/2026"}.${planTema?` Overordnet satsningsområde/tema for barnehagen: «${planTema}». La dette temaet prege innholdet.`:""}`;
      const base = `Du er en erfaren norsk barnehagelærer med dyp kjennskap til Rammeplan for barnehagen (2017). Svar ALLTID på norsk bokmål. Svar kun med selve teksten – ingen innledning eller kommentarer rundt teksten.\n\nKontekst: ${ctx}\nSeksjon: ${s?.navn} – ${s?.beskrivelse}\n\n`;
      if (handling === "start") return base + `Lag et pedagogisk og gjennomarbeidet førsteutkast for seksjonen "${s?.navn}" i årsplanen. Teksten skal:\n- Være konkret og direkte anvendbar for barnehagepersonalet\n- Forankres i Rammeplan for barnehagen 2017 med korrekt fagspråk\n- Ha varmt, profesjonelt og inviterende språk\n- Være 150–300 ord\n\nLever kun selve teksten for seksjonen.`;
      if (handling === "profesjonell") return base + `Eksisterende tekst:\n${eks}\n\nForbedre teksten. Gjør språket mer presist, profesjonelt og pedagogisk forankret. Behold alt meningsinnhold. Svar med den forbedrede teksten.`;
      if (handling === "rammeplan") return base + `Eksisterende tekst:\n${eks}\n\nReskriv teksten slik at den tydeligere kobler til Rammeplan for barnehagen 2017. Bruk fagspråket korrekt. Referer til relevante fagområder og verdier. Svar med den oppdaterte teksten.`;
      if (handling === "forkort") return base + `Eksisterende tekst:\n${eks}\n\nForkort teksten til omtrent halvparten av lengden. Behold de viktigste poengene. Svar med den forkortede teksten.`;
      if (handling === "alternativ") return base + `Eksisterende tekst:\n${eks}\n\nLag en alternativ formulering med litt annen vinkling, men same pedagogiske innhold. Svar med kun den alternative teksten.`;
      return base;
    };

    const utforSeksjonAI = async (seksjonId, handling) => {
      setAiAktiv({ seksjonId, handling });
      setAiLoading(true);
      setAiTekst("");
      await kallAI(byggSeksjonPrompt(seksjonId, handling, ap), (tekst) => {
        setAiLoading(false);
        if (tekst) { setAiTekst(tekst); visLokal("✨ AI-forslag klart"); }
        else { setAiAktiv(null); visLokal("ℹ️ AI utilgjengelig – skriv selv"); }
      });
    };

    const utforArshjulAI = async (maaned) => {
      const sesId = "arshjul_" + maaned;
      setAiAktiv({ seksjonId: sesId, handling:"maaned" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".${planTema?` Satsningsområde/tema: «${planTema}».`:""}`;
      const sesong = { august:"sommer/høst", september:"tidlig høst", oktober:"midthøst", november:"senhøst", desember:"vinter/jul", januar:"vinter", februar:"vinter/karneval", mars:"vinter/vår", april:"vår/påske", mai:"vår/17. mai", juni:"sommer" };
      const m = MANEDER.find(x => x.id === maaned);
      const prompt = `Du er en erfaren norsk barnehagelærer. Svar kun med JSON – ingen annen tekst, ingen markdown.\nLag et pedagogisk forslag for ${m?.navn} (årstid: ${sesong[maaned]||maaned}) for en norsk barnehage.\nKontekst: ${ctx}\nFormat: {"tema":"...","aktiviteter":"...","notat":"..."}\n- tema: ett inspirerende månedstema (maks 6 ord)\n- aktiviteter: 3–4 konkrete aktiviteter koblet til Rammeplanen (2–3 linjer)\n- notat: 1–2 pedagogiske merknader til personalet`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const jsonMatch = tekst.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Ingen JSON i svar");
            const d = JSON.parse(jsonMatch[0]);
            if (d.tema || d.aktiviteter) {
              oppdaterArshjul(maaned, "tema", d.tema||"");
              oppdaterArshjul(maaned, "aktiviteter", d.aktiviteter||"");
              oppdaterArshjul(maaned, "notat", d.notat||"");
              visLokal("✨ Forslag lagt inn for " + m?.navn);
            } else { visLokal("ℹ️ AI ga uventet format"); }
          } catch (e) { console.error("[AI Årshjul]", e); visLokal("ℹ️ AI utilgjengelig"); }
        } else { visLokal("ℹ️ AI utilgjengelig"); }
      });
    };

    const utforKomplettArshjul = async () => {
      setAiAktiv({ seksjonId:"arshjul_alle", handling:"alle" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".${planTema?` Satsningsområde/tema: «${planTema}». La dette gjennomsyre årshjulet.`:""}`;
      const prompt = `Du er en erfaren norsk barnehagelærer. Svar kun med JSON – ingen annen tekst.\nLag et komplett årshjul for barnehageåret august–juni. Kontekst: ${ctx}\nKrav: tema maks 6 ord. aktiviteter: 2 aktiviteter på EN LINJE atskilt med " | ", med fagområde i parentes, f.eks. "Skogstur og naturobservasjon (Natur og miljø) | Samlingsstund om årstider (Kommunikasjon)". notat: 1 setning.\nFormat (alle 11 måneder):\n{"august":{"tema":"...","aktiviteter":"...","notat":"..."},"september":{"tema":"...","aktiviteter":"...","notat":"..."},"oktober":{"tema":"...","aktiviteter":"...","notat":"..."},"november":{"tema":"...","aktiviteter":"...","notat":"..."},"desember":{"tema":"...","aktiviteter":"...","notat":"..."},"januar":{"tema":"...","aktiviteter":"...","notat":"..."},"februar":{"tema":"...","aktiviteter":"...","notat":"..."},"mars":{"tema":"...","aktiviteter":"...","notat":"..."},"april":{"tema":"...","aktiviteter":"...","notat":"..."},"mai":{"tema":"...","aktiviteter":"...","notat":"..."},"juni":{"tema":"...","aktiviteter":"...","notat":"..."}}`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const jsonMatch = tekst.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Ingen JSON i svar");
            const d = JSON.parse(jsonMatch[0]);
            setAp(prev => {
              const nyArshjul = { ...prev.arshjul };
              MANEDER.forEach(m => {
                if (d[m.id]) nyArshjul[m.id] = { tema:d[m.id].tema||"", aktiviteter:d[m.id].aktiviteter||"", notat:d[m.id].notat||"" };
              });
              return { ...prev, arshjul: nyArshjul };
            });
            visLokal("✨ Komplett årshjul generert!");
          } catch (e) { console.error("[AI Komplett årshjul]", e); visLokal("ℹ️ AI utilgjengelig"); }
        } else { visLokal("ℹ️ AI utilgjengelig"); }
      }, 1200);
    };

    const aksepterForslag = (seksjonId) => { oppdaterSeksjon(seksjonId, aiTekst); setAiTekst(""); setAiAktiv(null); visLokal("✅ Forslag lagt inn"); };
    const avvisForslag = () => { setAiTekst(""); setAiAktiv(null); };

    const iS = { width:"100%", border:"1.5px solid #d8e6f5", borderRadius:10, padding:"11px 13px", fontSize:13, background:"#f5f9fd", color:C.t, fontFamily:"'Nunito',sans-serif", boxSizing:"border-box", outline:"none", resize:"vertical" };
    const labelStil = { display:"block", fontWeight:700, color:C.t, fontSize:12, marginBottom:5 };

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // ── REDIGERING / NY ──────────────────────────────────────────
    if ((visning === "ny" || visning === "rediger") && ap) {
      const erRediger = visning === "rediger";

      return (
        <div className="fade">
          {lokalToast && <div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
          <button onClick={() => setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>{erRediger ? "✏️ Rediger årsplan" : "📆 Ny årsplan"}</div>
          <p style={{color:C.gr,fontSize:12,marginBottom:14,lineHeight:1.5}}>Fyll ut seksjonene og bruk AI-knappene for hjelp. Du bestemmer alltid innholdet.</p>

          {planFeil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {planFeil}</div>}

          {planTema && (
            <div style={{background:"#e3f2fd",borderRadius:10,padding:"10px 13px",marginBottom:12,borderLeft:"4px solid #1565c0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#1565c0",marginBottom:2}}>🎯 FELLES TEMA AKTIVT</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a2c45"}}>«{planTema}»</div>
                <div style={{fontSize:11,color:"#5d7390",marginTop:1}}>Brukes i alle AI-forslag for seksjoner og årshjul</div>
              </div>
              <button onClick={()=>setPlanTema("")} style={{background:"transparent",border:"1px solid #90caf9",color:"#1565c0",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>✕ Fjern</button>
            </div>
          )}

          {/* Grunninfo */}
          <div style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:14}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:10}}>📋 Grunninfo</div>
            <label style={labelStil}>Tittel på årsplanen *</label>
            <input value={ap.tittel} onChange={e => setAp(p => ({...p, tittel:e.target.value}))} style={{...iS, resize:"none", marginBottom:10}} placeholder="F.eks. 'Årsplan Solbakken barnehage 2025/2026'"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
              <div>
                <label style={labelStil}>Barnehage</label>
                <input value={ap.barnehage} onChange={e => setAp(p => ({...p, barnehage:e.target.value}))} style={{...iS, marginBottom:0}} placeholder="Barnehagens navn"/>
              </div>
              <div>
                <label style={labelStil}>Avdeling</label>
                <input value={ap.avdeling} onChange={e => setAp(p => ({...p, avdeling:e.target.value}))} style={{...iS, marginBottom:0}} placeholder="Avdelingsnavn"/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:9}}>
              <div>
                <label style={labelStil}>Aldersgruppe</label>
                <input value={ap.alder} onChange={e => setAp(p => ({...p, alder:e.target.value}))} style={{...iS, marginBottom:0}} placeholder="F.eks. 3–6 år"/>
              </div>
              <div>
                <label style={labelStil}>Barnehageår</label>
                <input value={ap.aar} onChange={e => setAp(p => ({...p, aar:e.target.value}))} style={{...iS, marginBottom:0}} placeholder="2025/2026"/>
              </div>
            </div>
          </div>

          {/* Seksjoner */}
          {SEKSJONER.map(s => (
            <div key={s.id} style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12,borderLeft:"4px solid #2c5b8e"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <span style={{fontSize:18}}>{s.ikon}</span>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t}}>{s.navn}</div>
              </div>
              <div style={{fontSize:11,color:C.gr,marginBottom:9,lineHeight:1.5}}>{s.beskrivelse}</div>
              <textarea
                value={ap.seksjoner[s.id] || ""}
                onChange={e => oppdaterSeksjon(s.id, e.target.value)}
                rows={5}
                style={{...iS, marginBottom:0, minHeight:100}}
                placeholder={`Skriv om ${s.navn.toLowerCase()} her, eller bruk AI-hjelp nedenfor …`}
              />
              <AIKnapper seksjonId={s.id} aiAktiv={aiAktiv} aiLoading={aiLoading} aiTekst={aiTekst} utforSeksjonAI={utforSeksjonAI} aksepterForslag={aksepterForslag} avvisForslag={avvisForslag} />
            </div>
          ))}

          {/* Årshjul */}
          <div style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:14,borderLeft:"4px solid #52b788"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:18}}>📅</span>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t}}>Årshjul / Månedskalender</div>
              </div>
              <button disabled={aiLoading && aiAktiv?.seksjonId === "arshjul_alle"} onClick={utforKomplettArshjul}
                style={{background:"linear-gradient(135deg,#2d6a4f,#52b788)",color:"#fff",border:"none",borderRadius:9,padding:"7px 12px",fontSize:11,fontWeight:800,cursor:aiLoading&&aiAktiv?.seksjonId==="arshjul_alle"?"wait":"pointer",fontFamily:"'Nunito',sans-serif",whiteSpace:"nowrap",opacity:aiLoading&&aiAktiv?.seksjonId==="arshjul_alle"?0.65:1}}>
                {aiLoading && aiAktiv?.seksjonId === "arshjul_alle" ? "⏳ Genererer..." : "✨ Generer komplett årshjul"}
              </button>
            </div>
            <div style={{fontSize:11,color:C.gr,marginBottom:14,lineHeight:1.5}}>Legg til tema, aktiviteter og notater for alle månedene (august–juni). Bruk AI-knappen for raskt forslag.</div>

            {MANEDER.map(m => {
              const mData = ap.arshjul?.[m.id] || { tema:"", aktiviteter:"", notat:"" };
              const erAiMaaned = aiAktiv?.seksjonId === "arshjul_" + m.id && aiLoading;
              return (
                <div key={m.id} style={{background:"#f5f9fd",borderRadius:11,padding:11,marginBottom:10,borderLeft:`3px solid ${m.farge}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                    <div style={{fontWeight:800,color:m.farge,fontSize:13}}>{m.ikon} {m.navn}</div>
                    <button disabled={aiLoading} onClick={() => utforArshjulAI(m.id)}
                      style={{background:"rgba(44,91,142,0.08)",color:C.g,border:"1px solid #d8e6f5",borderRadius:7,padding:"4px 9px",fontSize:10,fontWeight:700,cursor:aiLoading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",whiteSpace:"nowrap",opacity:aiLoading?0.55:1}}>
                      {erAiMaaned ? "⏳..." : "✨ Forslag"}
                    </button>
                  </div>
                  <div style={{display:"grid",gap:6}}>
                    <input value={mData.tema} onChange={e => oppdaterArshjul(m.id,"tema",e.target.value)} style={{...iS, marginBottom:0, fontSize:12}} placeholder="Månedstema …"/>
                    <textarea value={mData.aktiviteter} onChange={e => oppdaterArshjul(m.id,"aktiviteter",e.target.value)} rows={2} style={{...iS, marginBottom:0, fontSize:12, minHeight:50}} placeholder="Aktiviteter og pedagogisk innhold …"/>
                    <input value={mData.notat} onChange={e => oppdaterArshjul(m.id,"notat",e.target.value)} style={{...iS, marginBottom:0, fontSize:11}} placeholder="Notat til personalet …"/>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={erRediger ? lagreEndring : lagreNy} disabled={lagrer}
            style={{width:"100%",padding:"13px",fontSize:14,fontWeight:800,background:lagrer?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:11,cursor:lagrer?"wait":"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.25)",marginTop:4}}>
            {lagrer ? "Lagrer ..." : (erRediger ? "💾 Lagre endringer" : "💾 Lagre årsplan")}
          </button>
        </div>
      );
    }

    // ── LES ENKELT-PLAN ──────────────────────────────────────────
    if (visning === "les" && valgt) {
      return (
        <div className="fade">
          <button onClick={() => setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{background:"linear-gradient(135deg,#2c5b8e,#4178bd)",borderRadius:14,padding:"18px 18px 16px",color:"#fff",marginBottom:14}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,marginBottom:6}}>📆 {valgt.tittel}</div>
            <div style={{fontSize:12,opacity:0.88,display:"flex",flexWrap:"wrap",gap:8}}>
              {valgt.barnehage && <span>🏫 {valgt.barnehage}</span>}
              {valgt.avdeling && <span>📌 {valgt.avdeling}</span>}
              {valgt.alder && <span>👶 {valgt.alder}</span>}
              {valgt.aar && <span>📅 {valgt.aar}</span>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            <button onClick={()=>skrivUtArsplan(valgt)} style={{background:"#e3f2fd",color:"#1565c0",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button onClick={()=>{const sek=SEKSJONER.filter(s=>valgt.seksjoner?.[s.id]?.trim()).map(s=>({label:`${s.ikon} ${s.navn}`,tekst:valgt.seksjoner[s.id]}));lastNedPlanPDF({tittel:valgt.tittel||"Årsplan",meta:[valgt.barnehage,valgt.avdeling,valgt.alder,valgt.aar].filter(Boolean).join(" • "),seksjoner:sek});}} style={{background:"#e8f5e9",color:"#2e7d32",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📄 PDF</button>
            <button onClick={() => redigerPlan(valgt)} style={{background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
            {bekreftSletting
              ? <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft</button>
                  <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:C.lg2,color:C.t,padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                </div>
              : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
            }
          </div>

          {SEKSJONER.map(s => {
            const tekst = valgt.seksjoner?.[s.id];
            if (!tekst?.trim()) return null;
            return (
              <div key={s.id} style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 1px 5px rgba(44,91,142,0.07)",marginBottom:10,borderLeft:"4px solid #2c5b8e"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <span style={{fontSize:16}}>{s.ikon}</span>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t}}>{s.navn}</div>
                </div>
                <div style={{fontSize:13,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.7}}>{tekst}</div>
              </div>
            );
          })}

          {valgt.arshjul && MANEDER.some(m => valgt.arshjul[m.id]?.tema || valgt.arshjul[m.id]?.aktiviteter) && (
            <div style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 1px 5px rgba(44,91,142,0.07)",marginBottom:10,borderLeft:"4px solid #52b788"}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:14}}>📅 Årshjul</div>
              {MANEDER.map(m => {
                const d = valgt.arshjul[m.id];
                if (!d?.tema && !d?.aktiviteter) return null;
                return (
                  <div key={m.id} style={{marginBottom:12}}>
                    <div style={{fontWeight:800,color:m.farge,fontSize:13,marginBottom:4}}>{m.ikon} {m.navn}</div>
                    {d.tema && <div style={{fontSize:12,fontWeight:700,color:C.t,marginBottom:2}}>Tema: {d.tema}</div>}
                    {d.aktiviteter && <div style={{fontSize:12,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.5,marginBottom:d.notat?2:0}}>{d.aktiviteter}</div>}
                    {d.notat && <div style={{fontSize:11,color:C.gr,fontStyle:"italic"}}>{d.notat}</div>}
                    <div style={{height:1,background:"#e8eff8",marginTop:10}}/>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>
            Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}
            {valgt.oppdatert !== valgt.opprettet && " • Sist endret: " + new Date(valgt.oppdatert).toLocaleDateString("no-NO")}
          </div>
        </div>
      );
    }

    // ── LISTE (standard) ──────────────────────────────────────────
    const filtrert = planer.filter(p => {
      if (!sok) return true;
      const s = sok.toLowerCase();
      return p.tittel.toLowerCase().includes(s) || (p.barnehage||"").toLowerCase().includes(s) || (p.avdeling||"").toLowerCase().includes(s);
    });

    return (
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📆 Årsplaner</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Fullstendige årsplaner med AI-assistanse og interaktivt årshjul</p>

        <button onClick={nyPlan} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.2)",marginBottom:12}}>📆 Lag ny årsplan</button>

        {planer.length > 0 && (
          <input type="text" value={sok} onChange={e => setSok(e.target.value)} placeholder="🔍 Søk i årsplaner …"
            style={{width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:13,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:12,outline:"none"}}/>
        )}

        {planer.length === 0 ? (
          <div style={{textAlign:"center",padding:34,background:C.w,borderRadius:12,boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
            <div style={{fontSize:42,marginBottom:9}}>📆</div>
            <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen årsplaner ennå</div>
            <div style={{fontSize:12,color:C.gr,lineHeight:1.7,maxWidth:290,margin:"0 auto"}}>
              Lag en komplett årsplan med pedagogisk grunnsyn, rammeplanens fagområder og årshjul. AI hjelper deg med alle seksjoner.
            </div>
          </div>
        ) : filtrert.length === 0 ? (
          <div style={{textAlign:"center",padding:24,background:C.w,borderRadius:12,color:C.gr,fontSize:13}}>Ingen treff på søket</div>
        ) : (
          <div style={{display:"grid",gap:9}}>
            <div style={{fontSize:11,color:C.gr}}>{filtrert.length} av {planer.length} årsplan{planer.length > 1 ? "er" : ""}</div>
            {filtrert.map(p => (
              <div key={p.id} className="hover" onClick={() => lesPlan(p)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:5}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14,lineHeight:1.3,flex:1,wordBreak:"break-word"}}>📆 {p.tittel}</div>
                  {p.aar && <div style={{fontSize:10,color:C.gr,whiteSpace:"nowrap",flexShrink:0,background:"#e8eff8",padding:"2px 8px",borderRadius:7,fontWeight:700}}>{p.aar}</div>}
                </div>
                {(p.barnehage || p.avdeling) && <div style={{fontSize:12,color:C.gr,lineHeight:1.5}}>{p.barnehage}{p.avdeling ? " • " + p.avdeling : ""}</div>}
                {p.alder && <div style={{fontSize:11,color:C.gr,marginTop:2}}>👶 {p.alder}</div>}
                {MANEDER.some(m => p.arshjul?.[m.id]?.tema) && <div style={{fontSize:10,color:"#52b788",marginTop:4,fontWeight:700}}>📅 Årshjul inkludert</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Årsplaner lagres automatisk i skyen og er tilgjengelige på alle enheter når du er innlogget. Bruk "💾 Last ned"-knappen for lokal backup.
        </div>
      </div>
    );
  }




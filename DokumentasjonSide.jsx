import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import DokumentSkanner from "./DokumentSkanner.jsx";
import { FAGOMRADER } from './data/rammeplan.js';
import { hentDokumentasjon, lagreDokumentasjon } from './api.js';

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
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}
function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span data-fag={f.id} className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
}
export default function DokumentasjonSide({ ctx }) {
  const { aktivBruker, vis, setGlobalDokumentasjon } = ctx;

    const [dok, setDok] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [filterFag, setFilterFag] = useState("alle");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

    // Skjema-state
    const [d_tittel, setDTittel] = useState("");
    const [d_dato, setDDato] = useState(()=>new Date().toISOString().slice(0,10));
    const [d_fag, setDFag] = useState([]);
    const [d_fortelling, setDFortelling] = useState("");
    const [d_refleksjon, setDRefleksjon] = useState("");
    const [d_loading, setDLoading] = useState(false);
    const [d_feil, setDFeil] = useState("");

    // Dokumentskanner (steg-for-steg)
    const [visSkanner, setVisSkanner] = useState(false);

    // OCR-skanner state
    const [skannLoading, setSkannLoading] = useState(false);
    const skannRef = useRef(null);

    const kjorOCR = async (fil) => {
      if (!fil) return;
      setSkannLoading(true);
      try {
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.onerror = rej;
          reader.readAsDataURL(fil);
        });
        // Skaler ned til maks 1400px og konverter til JPEG
        const b64 = await new Promise(res => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1400;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            res(c.toDataURL("image/jpeg", 0.88).replace(/^data:image\/jpeg;base64,/, ""));
          };
          img.src = dataUrl;
        });
        // Les tekst via Claude Vision
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 60000);
        try {
          const r = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: "Du er en OCR-assistent. Trekk ut ALL tekst fra dette bildet nøyaktig slik den fremstår. Bevar linjeskift og avsnitt. Svar kun med den ekstraherte teksten – ingen forklaring eller kommentar. Hvis det ikke finnes lesbar tekst, svar med tom streng.",
              image: { data: b64, media_type: "image/jpeg" },
              max_tokens: 2000,
            }),
            signal: ctrl.signal,
          });
          if (r.ok) {
            const d = await r.json();
            const lest = (d?.text || "").trim();
            if (lest) {
              setDFortelling(prev => prev ? prev + "\n\n" + lest : lest);
              visLokal("✅ Tekst lest fra bilde – sjekk og rediger ved behov");
            } else {
              visLokal("ℹ️ Ingen lesbar tekst funnet – prøv med bedre belysning");
            }
          } else {
            visLokal("❌ Skanning feilet – prøv igjen");
          }
        } finally {
          clearTimeout(tid);
        }
      } catch (e) {
        console.warn("[OCR]", e);
        visLokal("❌ Skanning feilet – prøv igjen");
      } finally {
        setSkannLoading(false);
      }
    };

    // Last dokumentasjon ved oppstart
    useEffect(() => {
      let avbrutt = false;
      (async () => {
        if (!aktivBruker?.id) { setLastet(true); return; }
        const liste = await hentDokumentasjon(aktivBruker.id);
        if (!avbrutt) { setDok(liste); setLastet(true); }
      })();
      return () => { avbrutt = true; };
    }, [aktivBruker?.id]);

    const lagre = async (oppdatertListe) => {
      const ok = await lagreDokumentasjon(aktivBruker.id, oppdatertListe);
      if (!ok) { setDFeil("Kunne ikke lagre – muligens fordi lagring er blokkert i dette miljøet"); return false; }
      setDok(oppdatertListe);
      setGlobalDokumentasjon(oppdatertListe);
      return true;
    };

    const nyttDokument = () => {
      setValgt(null);
      setDTittel(""); setDDato(new Date().toISOString().slice(0,10));
      setDFag([]); setDFortelling(""); setDRefleksjon(""); setDFeil("");
      setVisning("ny");
    };

    const redigerDokument = (d) => {
      setValgt(d);
      setDTittel(d.tittel); setDDato(d.dato); setDFag(d.fag || []);
      setDFortelling(d.fortelling); setDRefleksjon(d.refleksjon || "");
      setDFeil(""); setVisning("rediger");
    };

    const lesDokument = (d) => { setValgt(d); setVisning("les"); };

    const lagreNytt = async () => {
      setDFeil("");
      if (!d_tittel.trim()) { setDFeil("Skriv en tittel"); return; }
      if (!d_fortelling.trim() || d_fortelling.trim().length < 20) { setDFeil("Praksisfortellingen må være minst 20 tegn"); return; }
      setDLoading(true);
      const nyttDok = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
        tittel: d_tittel.trim(),
        dato: d_dato,
        fag: d_fag,
        fortelling: d_fortelling.trim(),
        refleksjon: d_refleksjon.trim(),
        opprettet: new Date().toISOString(),
        oppdatert: new Date().toISOString(),
      };
      const ok = await lagre([nyttDok, ...dok]);
      setDLoading(false);
      if (ok) { vis("✅ Dokumentasjon lagret"); setVisning("liste"); }
    };

    const lagreEndring = async () => {
      setDFeil("");
      if (!valgt) return;
      if (!d_tittel.trim()) { setDFeil("Skriv en tittel"); return; }
      if (!d_fortelling.trim() || d_fortelling.trim().length < 20) { setDFeil("Praksisfortellingen må være minst 20 tegn"); return; }
      setDLoading(true);
      const oppdatert = dok.map(d => d.id === valgt.id
        ? { ...d, tittel: d_tittel.trim(), dato: d_dato, fag: d_fag, fortelling: d_fortelling.trim(), refleksjon: d_refleksjon.trim(), oppdatert: new Date().toISOString() }
        : d);
      const ok = await lagre(oppdatert);
      setDLoading(false);
      if (ok) { vis("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettDokument = async (id) => {
      const oppdatert = dok.filter(d => d.id !== id);
      const ok = await lagre(oppdatert);
      if (ok) { vis("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    const toggleFag = (fagId) => {
      setDFag(prev => prev.includes(fagId) ? prev.filter(x=>x!==fagId) : [...prev, fagId]);
    };

    // Eksport: bygg samlet HTML-fil med alle dokumentasjoner
    const eksporterAlle = () => {
      try {
        const fagNavn = (id) => FAGOMRADER.find(f=>f.id===id)?.navn || id;
        const dokHTML = dok.map(d => `
          <article class="dok">
            <h2>${escapeHTML(d.tittel)}</h2>
            <div class="meta">📅 ${escapeHTML(d.dato)} ${d.fag?.length?"  •  🎯 "+d.fag.map(fagNavn).map(escapeHTML).join(", "):""}</div>
            <h3>Praksisfortelling</h3>
            <p>${escapeHTML(d.fortelling).replace(/\n/g,"<br>")}</p>
            ${d.refleksjon ? `<h3>Refleksjon</h3><p>${escapeHTML(d.refleksjon).replace(/\n/g,"<br>")}</p>` : ""}
          </article>`).join("");
        const html = `<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dokumentasjon – Barnehagehjelpen</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,"Segoe UI",sans-serif;background:#f3f7fc;color:#1a2c45;padding:24px 16px;line-height:1.6}
  .topp{max-width:720px;margin:0 auto 18px;display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap}
  .topp h1{font-size:22px;color:#2c5b8e}
  .knapp{padding:9px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}
  .dok{max-width:720px;margin:0 auto 18px;background:#fff;border-radius:14px;padding:22px;box-shadow:0 2px 14px rgba(44,91,142,0.08)}
  .dok h2{color:#2c5b8e;font-size:19px;margin-bottom:6px}
  .dok h3{color:#5d7390;font-size:13px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:800}
  .dok p{font-size:14px;color:#1a2c45}
  .meta{font-size:12px;color:#5d7390;margin-bottom:10px}
  @media print{@page{margin:14mm}body{background:#fff;padding:0}.topp{display:none}.dok{box-shadow:none;page-break-inside:avoid;margin-bottom:14px}}
</style></head>
<body>
  <div class="topp"><h1>📔 Pedagogisk dokumentasjon (${dok.length})</h1><button class="knapp" onclick="window.print()">🖨️ Skriv ut</button></div>
  ${dokHTML || "<p style='text-align:center;color:#5d7390'>Ingen dokumentasjon ennå.</p>"}
</body></html>`;
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `dokumentasjon-${new Date().toISOString().slice(0,10)}.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url), 1500);
        visLokal("✅ Eksportert");
      } catch (e) {
        console.error("[Dokumentasjon] eksport:", e);
        visLokal("❌ Eksport feilet");
      }
    };

    // Filter og søk
    const filtrert = dok.filter(d => {
      if (filterFag !== "alle" && !(d.fag || []).includes(filterFag)) return false;
      if (sok) {
        const s = sok.toLowerCase();
        return d.tittel.toLowerCase().includes(s) || d.fortelling.toLowerCase().includes(s) || (d.refleksjon||"").toLowerCase().includes(s);
      }
      return true;
    });

    const iS = {width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:14,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10,outline:"none"};
    const labelStil = {display:"block",fontWeight:700,color:C.t,fontSize:12,marginBottom:5};

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // VISNING: Dokumentskanner
    if (visSkanner) return (
      <div className="fade">
        <button onClick={()=>setVisSkanner(false)} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til dokumentasjon</button>
        <DokumentSkanner aktivBruker={aktivBruker} onFerdig={async (dokData)=>{
          if (dokData && aktivBruker?.id) {
            const nyttDok = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
              ...dokData,
            };
            await lagre([nyttDok, ...dok]);
          }
          setVisSkanner(false);
          visLokal("✅ Dokument skannet og lagt til i dokumentasjon");
        }}/>
      </div>
    );

    // VISNING: Ny / Rediger
    if (visning === "ny" || visning === "rediger") {
      const erRediger = visning === "rediger";
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger dokumentasjon":"📝 Ny dokumentasjon"}</div>

          {d_feil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {d_feil}</div>}
          {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:12,textAlign:"center"}}>{lokalToast}</div>}

          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <label style={labelStil}>Tittel</label>
            <input type="text" value={d_tittel} onChange={e=>setDTittel(e.target.value)} style={iS} placeholder="F.eks. 'Lek med vann i sandkassen'"/>

            <label style={labelStil}>Dato</label>
            <div style={{position:"relative",marginBottom:10}}>
              <input
                type="date"
                value={d_dato}
                onChange={e=>setDDato(e.target.value)}
                max="2099-12-31"
                style={{
                  ...iS,
                  marginBottom:0,
                  paddingRight:44,
                  minHeight:46,
                  fontSize:15,
                  color:C.t,
                  WebkitAppearance:"none",
                  appearance:"none",
                  cursor:"pointer",
                  fontFamily:"'Nunito',sans-serif",
                }}
              />
              <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:18,pointerEvents:"none",color:C.g}}>📅</span>
            </div>
            <div style={{fontSize:11,color:C.gr,marginTop:-6,marginBottom:12,paddingLeft:2}}>
              {d_dato && new Date(d_dato + "T00:00:00").toLocaleDateString("no-NO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </div>

            <label style={labelStil}>Fagområder fra rammeplanen (valgfritt)</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
              {FAGOMRADER.map(f=>(
                <button key={f.id} type="button" onClick={()=>toggleFag(f.id)} style={{padding:"8px 10px",fontSize:11,background:d_fag.includes(f.id)?f.lys:"#f5f9fd",color:d_fag.includes(f.id)?f.farge:C.t,border:d_fag.includes(f.id)?`2px solid ${f.farge}`:"2px solid #e8eff8",borderRadius:9,cursor:"pointer",fontFamily:"'Nunito',sans-serif",textAlign:"left",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                  <span>{f.ikon}</span><span style={{flex:1}}>{f.navn}</span>
                </button>
              ))}
            </div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
              <label style={{...labelStil,marginBottom:0}}>📖 Praksisfortelling (hva skjedde – min. 20 tegn)</label>
              <button type="button" disabled={skannLoading} onClick={()=>skannRef.current?.click()}
                style={{background:"linear-gradient(135deg,#2d6a4f,#52b788)",color:"#fff",border:"none",borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:800,cursor:skannLoading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",opacity:skannLoading?0.7:1,whiteSpace:"nowrap"}}>
                {skannLoading ? "⏳ Leser tekst…" : "📷 Skann tekst"}
              </button>
              <input ref={skannRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{ kjorOCR(e.target.files?.[0]); e.target.value=""; }}/>
            </div>
            <textarea value={d_fortelling} onChange={e=>setDFortelling(e.target.value)} rows={7} placeholder="Beskriv konkret hva som skjedde. Hvem var med? Hva gjorde de? Hva ble sagt? Hva la du merke til?" style={{...iS,resize:"vertical",minHeight:130,lineHeight:1.6}}/>

            <label style={labelStil}>💭 Refleksjon (valgfritt)</label>
            <textarea value={d_refleksjon} onChange={e=>setDRefleksjon(e.target.value)} rows={5} placeholder="Hva fungerte? Hva kunne vært gjort annerledes? Hva tar du med deg videre? Hvilke fagområder berørte dette?" style={{...iS,resize:"vertical",minHeight:100,lineHeight:1.6}}/>

            <button onClick={erRediger?lagreEndring:lagreNytt} disabled={d_loading} style={{width:"100%",padding:"13px",fontSize:14,fontWeight:800,background:d_loading?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:11,cursor:d_loading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.25)",marginTop:6}}>
              {d_loading?"Lagrer ...":(erRediger?"💾 Lagre endringer":"💾 Lagre dokumentasjon")}
            </button>
          </div>

          <div style={{fontSize:11,color:C.gr,marginTop:14,lineHeight:1.6,background:"#fff8e1",padding:"11px 13px",borderRadius:9,borderLeft:"3px solid #f4a261"}}>
            <strong>ℹ️ Tips:</strong> Skriv konkret om situasjoner, ikke om enkeltbarn med navn. Refleksjon kobles gjerne til rammeplanens fagområder. Bruk eksporter-knappen jevnlig for backup.
          </div>
        </div>
      );
    }

    // VISNING: Les enkelt-dokumentasjon
    if (visning === "les" && valgt) {
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{background:C.w,borderRadius:14,padding:20,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:6}}>{valgt.tittel}</div>
            <div style={{fontSize:12,color:C.gr,marginBottom:14,display:"flex",flexWrap:"wrap",gap:10}}>
              <span>📅 {new Date(valgt.dato).toLocaleDateString("no-NO",{day:"numeric",month:"long",year:"numeric"})}</span>
              {valgt.fag?.length>0 && (
                <span style={{display:"flex",gap:5,flexWrap:"wrap"}}>{valgt.fag.map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span data-fag={f.id} key={fid} style={{background:f.lys,color:f.farge,padding:"1px 8px",borderRadius:7,fontSize:10,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}</span>
              )}
            </div>

            <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:6,marginTop:6}}>📖 PRAKSISFORTELLING</div>
            <div style={{background:"#f5f9fd",borderRadius:10,padding:"13px 15px",fontSize:14,color:C.t,lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:14}}>{valgt.fortelling}</div>

            {valgt.refleksjon && (
              <>
                <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:6}}>💭 REFLEKSJON</div>
                <div style={{background:"#e8f5e9",borderRadius:10,padding:"13px 15px",fontSize:14,color:C.t,lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:14}}>{valgt.refleksjon}</div>
              </>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:6}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel,meta:new Date(valgt.dato).toLocaleDateString("no-NO",{day:"numeric",month:"long",year:"numeric"}),seksjoner:[{label:"📖 Praksisfortelling",tekst:valgt.fortelling,farge:"#2c5b8e",bg:"#f5f9fd"},{label:"💭 Refleksjon",tekst:valgt.refleksjon,farge:"#2d6a4f",bg:"#e8f5e9"}]})} style={{background:"#e3f2fd",color:"#1565c0",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
              <button onClick={()=>redigerDokument(valgt)} style={{background:"#2c5b8e",color:"#fff",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
              {bekreftSletting
                ? <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setBekreftSletting(false);slettDokument(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:C.lg2,color:C.t,padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                  </div>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
              }
            </div>
            <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}{valgt.oppdatert!==valgt.opprettet && " • Sist endret: "+new Date(valgt.oppdatert).toLocaleDateString("no-NO")}</div>
          </div>
        </div>
      );
    }

    // VISNING: Liste (default)
    return (
      <div className="fade">
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📔 Dokumentasjon</h1>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Praksisfortellinger og refleksjoner – knyttet til rammeplanen</p>
        {lokalToast && <div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}

        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <button onClick={nyttDokument} style={{flex:"1 1 140px",padding:"11px",background:"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.2)"}}>📝 Ny dokumentasjon</button>
          <button onClick={()=>setVisSkanner(true)} style={{flex:"0 0 auto",padding:"11px 15px",background:"linear-gradient(135deg,#1a3558,#2c5b8e)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📷 Skann</button>
          {dok.length > 0 && (
            <button onClick={eksporterAlle} style={{flex:"0 0 auto",padding:"11px 15px",background:"#e8f5e9",color:C.g,border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>💾 Eksporter alle</button>
          )}
        </div>

        {dok.length > 0 && (
          <>
            <input type="text" value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk i dokumentasjon ..." style={{...iS,marginBottom:8}}/>
            <div style={{display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:3}}>
              <button onClick={()=>setFilterFag("alle")} style={{padding:"5px 10px",fontSize:11,background:filterFag==="alle"?C.t:"#e8eff8",color:filterFag==="alle"?"#fff":C.t,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>Alle</button>
              {FAGOMRADER.map(f=>(
                <button key={f.id} onClick={()=>setFilterFag(f.id)} style={{padding:"5px 10px",fontSize:11,background:filterFag===f.id?f.farge:"#e8eff8",color:filterFag===f.id?"#fff":C.t,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{f.ikon} {f.navn}</button>
              ))}
            </div>
          </>
        )}

        {dok.length === 0 ? (
          <div style={{textAlign:"center",padding:34,background:C.w,borderRadius:12,boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
            <div style={{fontSize:42,marginBottom:9}}>📔</div>
            <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen dokumentasjon ennå</div>
            <div style={{fontSize:12,color:C.gr,lineHeight:1.6,maxWidth:280,margin:"0 auto"}}>Praksisfortellinger og refleksjoner er nyttige for personalmøter, foreldresamtaler og din egen utvikling. Trykk "📝 Ny dokumentasjon" for å starte.</div>
          </div>
        ) : filtrert.length === 0 ? (
          <div style={{textAlign:"center",padding:24,background:C.w,borderRadius:12,color:C.gr,fontSize:13}}>Ingen treff på søket</div>
        ) : (
          <div style={{display:"grid",gap:9}}>
            <div style={{fontSize:11,color:C.gr}}>{filtrert.length} av {dok.length} dokumentasjoner</div>
            {filtrert.map(d => (
              <div key={d.id} className="hover" onClick={()=>lesDokument(d)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:5}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14,lineHeight:1.3,flex:1,wordBreak:"break-word"}}>{d.tittel}</div>
                  <div style={{fontSize:10,color:C.gr,whiteSpace:"nowrap",flexShrink:0}}>{new Date(d.dato).toLocaleDateString("no-NO",{day:"2-digit",month:"short"})}</div>
                </div>
                <div style={{fontSize:12,color:C.gr,lineHeight:1.5,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{d.fortelling}</div>
                {d.fag?.length>0 && (
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {d.fag.slice(0,3).map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span data-fag={f.id} key={fid} style={{background:f.lys,color:f.farge,padding:"1px 7px",borderRadius:6,fontSize:9,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}
                    {d.fag.length>3 && <span style={{fontSize:10,color:C.gr}}>+{d.fag.length-3} til</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Dokumentasjon lagres automatisk i skyen og er tilgjengelig på alle enheter når du er innlogget. Bruk "💾 Eksporter alle"-knappen for lokal backup.
        </div>
      </div>
    );
  }


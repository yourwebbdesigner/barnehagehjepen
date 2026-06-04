import React from "react";
import { FAGOMRADER } from './data/rammeplan.js';
import { SANGER } from './data/sanger.js';
import { AKTIVITETER } from './data/aktiviteter.js';
import { DAGENS_TIPS, hilsen } from './data/tips.js';
import { GlobalSok } from './AktivSide.jsx';
import { RenderTekst } from './AiSide.jsx';

function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:"var(--c-mint)", color:"var(--c-t)", padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}

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
function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span data-fag={f.id} className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
}
export default function Hjem({ ctx }) {
  const { hikon, vær, værIkon, værTekst, hils, hsub, skjemaer, globalSok, setGlobalSok, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, tips, tipsFag, nesteTips, setValgtFag, setRammeSeksjon } = ctx;
  return (
    <div className="fade">
      {/* HERO */}
      <div style={{background:`linear-gradient(135deg, #2c5b8e 0%, #4178bd 50%, #6ba0d9 100%)`, borderRadius:22, padding:"28px 22px 24px", color:"#fff", marginBottom:20, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-20, right:-20, fontSize:90, opacity:.15, transform:"rotate(15deg)", pointerEvents:"none"}}>🌟</div>
        <div style={{position:"absolute", bottom:-15, left:10, fontSize:70, opacity:.12, transform:"rotate(-10deg)", pointerEvents:"none"}}>🎨</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{fontSize:28}}>{hikon}</div>
          {vær && (
            <div style={{background:"rgba(255,255,255,0.18)",borderRadius:12,padding:"8px 13px",textAlign:"center",backdropFilter:"blur(4px)",minWidth:90}}>
              <div style={{fontSize:22,lineHeight:1}}>{værIkon}</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,lineHeight:1.1,marginTop:2}}>{vær.temp}°</div>
              <div style={{fontSize:10,opacity:.9,marginTop:1}}>{værTekst}</div>
              <div style={{fontSize:10,opacity:.75,marginTop:1}}>💨 {vær.vind} m/s</div>
            </div>
          )}
        </div>
        <div style={{fontFamily:"'Fredoka One',cursive", fontSize:26, marginTop:4}}>{hils}!</div>
        <div style={{fontSize:14, opacity:.9, marginTop:3, marginBottom:18}}>{hsub}</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8}}>
          {[[SANGER.length+"","🎵","Sanger"],[AKTIVITETER.length+"","🏃","Aktiviteter"],[skjemaer.length+"","📋","Skjemaer"],[FAGOMRADER.length+"","📖","Fagområder"]].map(([n,ic,l])=>(
            <div key={l} style={{background:"rgba(255,255,255,0.22)", borderRadius:12, padding:"11px 6px", textAlign:"center", backdropFilter:"blur(4px)"}}>
              <div style={{fontSize:18}}>{ic}</div>
              <div style={{fontFamily:"'Fredoka One',cursive", fontSize:20, lineHeight:1}}>{n}</div>
              <div style={{fontSize:10, opacity:.85, marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GLOBAL SØK */}
      <GlobalSok
        verdi={globalSok}
        setVerdi={setGlobalSok}
        sokeResultat={sokeResultat}
        navigerTil={navigerTil}
        aapneAktivitet={aapneAktivitet}
        aapneSang={aapneSang}
        aapneTegneark={aapneTegneark}
        aapneFagomrade={aapneFagomrade}
        aapneRammeplan={aapneRammeplan}
        aapneAktivitetskort={aapneAktivitetskort}
        aapneDokumentasjon={aapneDokumentasjon}
        C={C}
      />

      {/* DAGENS TIPS */}
      <div style={{background:C.w, borderRadius:16, padding:"15px 18px", marginBottom:18, boxShadow:"0 2px 14px rgba(44,91,142,0.10)", borderLeft:`4px solid ${tipsFag?.farge||C.g}`}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:5}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:20}}>{tipsFag?.ikon||"💡"}</span>
            <div style={{fontFamily:"'Fredoka One',cursive", fontSize:15, color:C.t}}>Dagens pedagogiske tips</div>
          </div>
          <button onClick={nesteTips} title="Vis neste tips" aria-label="Vis neste tips"
            style={{background:"transparent", border:"1.5px solid var(--c-divider)", color:C.g, width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            🔄
          </button>
        </div>
        <div style={{fontWeight:800, color:tipsFag?.farge||C.g, fontSize:13, marginBottom:3}}>{tips.t}</div>
        <div style={{fontSize:13, color:C.gr, lineHeight:1.6}}>{tips.t2}</div>
      </div>

      {/* HURTIGTILGANG */}
      <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t, marginBottom:11}}>🚀 Hurtigtilgang</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:20}}>
        {[
          ["🎵","Sanger & Rim",`${SANGER.length} sanger og rim`,"#2c5b8e","sanger"],
          ["🏃","Aktiviteter",`${AKTIVITETER.length} ferdige aktiviteter`,"#1565c0","aktiviteter"],
          ["📚","Bøker","Pedagogisk litteratur og AI-fortelling","#00796b","boker"],
          ["🃏","Aktivitetskort","Kort til samlingsstund og lek","#f57f17","aktivitetskort"],
          ["✏️","Nytt skjema","HVA · HVORDAN · HVORFOR","#6a1b9a","skjema-ny"],
          ["🖍️","Tegneark",`${TEGNEARK.length} tegneark å skrive ut`,"#c62828","tegneark"],
          ["📖","Rammeplan","7 fagområder utdypet","#2d6a4f","rammeplan"],
          ["🤖","AI-assistent","Lag sanger, planer og mer","#37474f","ai"],
        ].map(([ic,t,u,fc,sid])=>(
          <div key={t} className="hover fade" onClick={()=>navigerTil(sid)} style={{background:C.w, borderRadius:14, padding:"16px 14px", cursor:"pointer", boxShadow:`0 2px 10px ${fc}22`, borderLeft:`4px solid ${fc}`}}>
            <div style={{fontSize:26, marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'Fredoka One',cursive", fontSize:15, color:C.t}}>{t}</div>
            <div style={{fontSize:11, color:C.gr, marginTop:2}}>{u}</div>
          </div>
        ))}
      </div>

      {/* PLANLEGGING */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t}}>📋 Planlegging</div>
        <button onClick={()=>navigerTil("planlegging")} style={{background:"#d8f3dc",color:"#2d6a4f",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Se alle →</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20}}>
        {[
          ["📅","Ukeplan","Mandag–fredag med tema","ukeplan","#1565c0"],
          ["📋","Månedsplan","Hele måneden strukturert","maanedsplan","#6a1b9a"],
          ["✉️","Månedsbrev","Brev til foreldre","maanedsbrev","#e67e22"],
          ["📆","Årsplan","Overordnet tema og mål","arsplan","#2d6a4f"],
        ].map(([ic,t,u,sideId,fc])=>(
          <div key={t} className="hover" onClick={()=>navigerTil(sideId)} style={{background:C.w, borderRadius:12, padding:"12px 13px", cursor:"pointer", boxShadow:`0 2px 8px ${fc}1f`, borderLeft:`3px solid ${fc}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <span style={{fontSize:18}}>{ic}</span>
              <div style={{fontWeight:800,color:C.t,fontSize:13}}>{t}</div>
            </div>
            <div style={{fontSize:11, color:C.gr, lineHeight:1.4}}>{u}</div>
          </div>
        ))}
      </div>

      {/* FAGOMRÅDER */}
      <div style={{background:C.w, borderRadius:16, padding:"16px 18px", boxShadow:"0 2px 10px rgba(44,91,142,0.08)", marginBottom:14}}>
        <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t, marginBottom:11}}>📖 De 7 fagområdene – klikk for å utforske</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:7}}>
          {FAGOMRADER.map(f=>(
            <div key={f.id} className="hover" onClick={()=>{setValgtFag(f);setRammeSeksjon("fagomrader");navigerTil("rammeplan");}}
              style={{background:C.lg2, borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.18s", borderLeft:`3px solid ${f.farge}`}}>
              <span style={{fontSize:20}}>{f.ikon}</span>
              <div>
                <div data-fag-color={f.id} style={{fontSize:11, fontWeight:800, color:f.farge, lineHeight:1.3}}>{f.navn}</div>
                <div style={{fontSize:9, color:C.gr, marginTop:1}}>{f.kortbeskrivelse}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:C.lg2, borderRadius:13, padding:"13px 15px", borderLeft:`4px solid ${C.g}`}}>
        <div style={{fontWeight:800, color:C.g, fontSize:12, marginBottom:4}}>🌿 Om Barnehagehjelpen</div>
        <div style={{fontSize:12, color:C.t, lineHeight:1.7}}>Alt innhold er koblet til Rammeplan 2017. Bruk AI-assistenten til å generere sanger, aktiviteter og pedagogiske planer tilpasset din barnegruppe.</div>
      </div>
    </div>
  );
}

export function MineSkjemaer({ ctx }) {
  const { skjemaer, setSkjemaer, feedback, vis, valgtSkjema, setValgtSkjema, redigerSkjemaTittel, setRedigerSkjemaTittel, setBekreftSlettSkjema, navigerTil } = ctx;
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📋 Mine skjemaer</h1>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{skjemaer.length} skjema{skjemaer.length!==1?"er":""} lagret</p>
      {feedback&&<div className="fade" style={{marginBottom:12,background:C.mint,borderRadius:8,padding:"9px 13px",color:C.g,fontWeight:700}}>{feedback}</div>}
      {skjemaer.length===0?(
        <div style={{background:C.w,borderRadius:16,padding:28,textAlign:"center",boxShadow:"0 2px 10px rgba(44,91,142,0.07)"}}>
          <div style={{fontSize:40,marginBottom:8}}>📝</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.t}}>Ingen skjemaer ennå</div>
          <div style={{color:C.gr,fontSize:12,marginTop:4,marginBottom:12}}>Lag ditt første aktivitetsskjema!</div>
          <button className="btn" onClick={()=>navigerTil("skjema-ny")} style={{background:C.g,color:"#fff",padding:"10px 18px",fontSize:13}}>✏️ Lag nytt skjema</button>
        </div>
      ):valgtSkjema?(
        <div className="fade" style={{background:C.w,borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>{setValgtSkjema(null);setRedigerSkjemaTittel(null);}} />
          {redigerSkjemaTittel !== null ? (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:C.g,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Endre navn</div>
              <div style={{display:"flex",gap:8}}>
                <input autoFocus type="text" value={redigerSkjemaTittel} onChange={e=>setRedigerSkjemaTittel(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter"&&redigerSkjemaTittel.trim()){
                      const nyTittel=redigerSkjemaTittel.trim();
                      setSkjemaer(p=>p.map(s=>s.id===valgtSkjema.id?{...s,tittel:nyTittel}:s));
                      setValgtSkjema(v=>v?{...v,tittel:nyTittel}:v);
                      setRedigerSkjemaTittel(null);
                      vis("✅ Navn oppdatert");
                    }
                    if(e.key==="Escape") setRedigerSkjemaTittel(null);
                  }}
                  style={{flex:1,padding:"9px 12px",border:`2px solid ${C.g}`,borderRadius:9,fontSize:14,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:C.t}} />
                <button className="btn" onClick={()=>{
                  const nyTittel=redigerSkjemaTittel.trim();
                  if(!nyTittel) return;
                  setSkjemaer(p=>p.map(s=>s.id===valgtSkjema.id?{...s,tittel:nyTittel}:s));
                  setValgtSkjema(v=>v?{...v,tittel:nyTittel}:v);
                  setRedigerSkjemaTittel(null);
                  vis("✅ Navn oppdatert");
                }} style={{background:C.g,color:"#fff",padding:"9px 16px",fontSize:13}}>Lagre</button>
                <button className="btn" onClick={()=>setRedigerSkjemaTittel(null)} style={{background:C.lg2,color:C.g,padding:"9px 12px",fontSize:13}}>Avbryt</button>
              </div>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:C.t,flex:1}}>{valgtSkjema.tittel}</div>
              <button className="btn" onClick={()=>setRedigerSkjemaTittel(valgtSkjema.tittel)}
                style={{background:C.lg2,color:C.g,padding:"5px 10px",fontSize:12,flexShrink:0}}>✏️ Endre navn</button>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {valgtSkjema.alder&&<span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtSkjema.alder}</span>}
            {valgtSkjema.kategori&&<span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{valgtSkjema.kategori}</span>}
            {valgtSkjema.rammeplan?.map(r=><FagTag key={r} rid={r}/>)}
          </div>
          {[
            {felt:valgtSkjema.hva, label:"🎯 HVA", bg:"#fff9c4", col:"#795548"},
            {felt:valgtSkjema.materialer, label:"📦 MATERIALER", bg:"#fce4ec", col:"#c62828"},
            {felt:valgtSkjema.hvordan, label:"⚙️ HVORDAN", bg:"#e8f5e9", col:"#2e7d32"},
            {felt:valgtSkjema.hvorfor, label:"❓ HVORFOR", bg:"#e3f2fd", col:"#1565c0"},
          ].filter(s=>s.felt).map(({felt,label,bg,col})=>(
            <div key={label} style={{background:bg,borderRadius:10,padding:"11px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:col,fontSize:12,marginBottom:7}}>{label}</div>
              <RenderTekst tekst={felt} />
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={()=>skrivUtGenerell({tittel:valgtSkjema.tittel,meta:[valgtSkjema.alder,valgtSkjema.kategori].filter(Boolean).join(" • "),seksjoner:[{label:"🎯 Hva",tekst:valgtSkjema.hva,farge:"#795548",bg:"#fff9c4"},{label:"📦 Materialer",tekst:valgtSkjema.materialer,farge:"#c62828",bg:"#fce4ec"},{label:"⚙️ Hvordan",tekst:valgtSkjema.hvordan,farge:"#2e7d32",bg:"#e8f5e9"},{label:"❓ Hvorfor",tekst:valgtSkjema.hvorfor,farge:"#1565c0",bg:"#e3f2fd"}]})} style={{background:"#e3f2fd",color:"#1565c0",padding:"8px 16px",fontSize:12,border:"none",borderRadius:9,cursor:"pointer",fontWeight:800,fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button className="btn" onClick={()=>setBekreftSlettSkjema(valgtSkjema)} style={{background:"#ffebee",color:"#c62828",padding:"8px 16px",fontSize:12}}>🗑 Slett skjema</button>
          </div>
        </div>
      ):(
        <div style={{display:"grid",gap:9}}>
          {skjemaer.map(s=>(
            <div key={s.id} className="hover" onClick={()=>setValgtSkjema(s)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{s.tittel}</div>
                  {s.hva&&<div style={{color:C.gr,fontSize:11,marginTop:2}}>{s.hva.substring(0,65)}{s.hva.length>65?"...":""}</div>}
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    {s.alder&&<span className="tag" style={{background:C.mint,color:C.g}}>{s.alder}</span>}
                    {(s.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
                  </div>
                </div>
                <span style={{color:C.gr,fontSize:17,marginLeft:7}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



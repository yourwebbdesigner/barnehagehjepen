import React, { useState, useEffect } from "react";
import { AKTIVITETER } from './data/aktiviteter.js';
import { FAGOMRADER } from './data/rammeplan.js';
import { C, escapeHTML, mdToHtml, skrivUtVindu } from './utils.js';
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}
function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span data-fag={f.id} className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
}
const AKTIV_KATS = [["alle","Alle"],["kreativ","🎨 Kreativ"],["ute","🌳 Ute"],["matematikk","🔢 Matte"],["drama","🎭 Drama"],["samtale","💬 Samtale"],["mat","🍞 Mat"],["natur","🌱 Natur"],["musikk","🎶 Musikk"],["motorikk","🏃 Motorikk"],["rollelek","🏠 Rollelek"],["språk","🗣 Språk"],["prosjekt","📋 Prosjekt"],["kunst","🎨 Kunst"]];

// Standalone-komponent for søkeboks – holder fokus selv om parent re-rendrer.
// Lokal state for input-verdien, kaller onChange-prop ved hver endring.
export function GlobalSok({ verdi, setVerdi, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, aapnePlan, C }) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none",color:C.gr}}>🔍</span>
        <input
          type="text"
          value={verdi}
          onChange={e=>setVerdi(e.target.value)}
          placeholder="Søk i alt innhold ..."
          style={{
            width:"100%",
            padding:"11px 38px 11px 38px",
            fontSize:14,
            background:C.w,
            border:"1.5px solid #d8e6f5",
            borderRadius:11,
            color:C.t,
            fontFamily:"'Nunito',sans-serif",
            outline:"none",
            boxSizing:"border-box",
            boxShadow:"0 1px 5px rgba(44,91,142,0.06)",
          }}
        />
        {verdi && (
          <button onClick={()=>setVerdi("")} aria-label="Tøm søk" style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.gr,fontSize:16,cursor:"pointer",padding:"4px 6px",lineHeight:1}}>✕</button>
        )}
      </div>

      {sokeResultat && (
        <div className="fade" style={{marginTop:9,background:C.w,borderRadius:12,boxShadow:"0 3px 14px rgba(44,91,142,0.12)",overflow:"hidden",maxHeight:420,overflowY:"auto"}}>
          {sokeResultat.total === 0 ? (
            <div style={{padding:18,textAlign:"center",color:C.gr,fontSize:13}}>
              Ingen treff på «{sokeResultat.q}»
            </div>
          ) : (
            <>
              <div style={{padding:"9px 14px",background:"#f5f9fd",fontSize:11,color:C.gr,fontWeight:700,borderBottom:"1px solid #e8eff8"}}>
                {sokeResultat.total} treff på «{sokeResultat.q}»
              </div>

              {sokeResultat.sanger.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:C.g,background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>🎵 Sanger ({sokeResultat.sanger.length})</div>
                  {sokeResultat.sanger.slice(0,5).map(s=>(
                    <div key={"s"+s.id} onClick={()=>aapneSang?.(s)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">{s.tittel}</div>
                  ))}
                  {sokeResultat.sanger.length>5 && <div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.sanger.length-5} flere – gå til Sanger</div>}
                </div>
              )}

              {sokeResultat.aktiviteter.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#e67e22",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>🏃 Aktiviteter ({sokeResultat.aktiviteter.length})</div>
                  {sokeResultat.aktiviteter.slice(0,5).map(a=>(
                    <div key={"a"+a.id} onClick={()=>aapneAktivitet(a)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">{a.tittel}</div>
                  ))}
                  {sokeResultat.aktiviteter.length>5 && <div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.aktiviteter.length-5} flere</div>}
                </div>
              )}

              {sokeResultat.tegneark.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#c62828",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>🖍️ Tegneark ({sokeResultat.tegneark.length})</div>
                  {sokeResultat.tegneark.slice(0,5).map(t=>(
                    <div key={"t"+t.id} onClick={()=>aapneTegneark(t)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t,display:"flex",alignItems:"center",gap:8}} className="hover"><span>{t.ikon}</span><span>{t.tittel}</span></div>
                  ))}
                  {sokeResultat.tegneark.length>5 && <div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.tegneark.length-5} flere</div>}
                </div>
              )}

              {sokeResultat.fagomrader.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#1565c0",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>📚 Fagområder ({sokeResultat.fagomrader.length})</div>
                  {sokeResultat.fagomrader.map(f=>(
                    <div key={"f"+f.id} onClick={()=>aapneFagomrade(f)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t,display:"flex",alignItems:"center",gap:8}} className="hover"><span>{f.ikon}</span><span>{f.navn}</span></div>
                  ))}
                </div>
              )}

              {sokeResultat.rammeplan.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>📖 Rammeplan ({sokeResultat.rammeplan.length})</div>
                  {sokeResultat.rammeplan.map(r=>(
                    <div key={"r"+r.key} onClick={()=>aapneRammeplan(r.key)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">{r.tittel}</div>
                  ))}
                </div>
              )}

              {sokeResultat.skjemaer && sokeResultat.skjemaer.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f9f3fd",textTransform:"uppercase",letterSpacing:0.5}}>📋 Mine skjemaer ({sokeResultat.skjemaer.length})</div>
                  {sokeResultat.skjemaer.slice(0,5).map(s=>(
                    <div key={"sk"+s.id} onClick={()=>{navigerTil("skjemaer");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{s.tittel||"Skjema"}</div>
                      {s.type&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{s.type}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.ukeplaner && sokeResultat.ukeplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#1565c0",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>📅 Dine ukeplaner ({sokeResultat.ukeplaner.length})</div>
                  {sokeResultat.ukeplaner.slice(0,5).map(p=>(
                    <div key={"u"+p.id} onClick={()=>aapnePlan?aapnePlan(p,"ukeplan"):(navigerTil("ukeplan"),setVerdi(""))} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.tittel}</div>
                      {(p.uke||p.tema) && <div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.uke?`Uke ${p.uke}`:""}{p.uke&&p.tema?" • ":""}{p.tema||""}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.maanedsplaner && sokeResultat.maanedsplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f9f3fd",textTransform:"uppercase",letterSpacing:0.5}}>📋 Dine planer ({sokeResultat.maanedsplaner.length})</div>
                  {sokeResultat.maanedsplaner.slice(0,5).map(p=>(
                    <div key={"mp"+p.id} onClick={()=>{navigerTil(p.type==="kalender"?"maanedskalender":"maanedsplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.type==="kalender"?"🗓️ ":"📋 "}{p.tittel}</div>
                      {p.tema&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.tema}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.maanedsbrev && sokeResultat.maanedsbrev.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#2d6a4f",background:"#f0faf4",textTransform:"uppercase",letterSpacing:0.5}}>📨 Dine månedsbrev ({sokeResultat.maanedsbrev.length})</div>
                  {sokeResultat.maanedsbrev.slice(0,5).map(b=>(
                    <div key={"mb"+b.id} onClick={()=>{navigerTil("maanedsbrev");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{b.tittel}</div>
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.arsplaner && sokeResultat.arsplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#1b5e20",background:"#f1f8e9",textTransform:"uppercase",letterSpacing:0.5}}>📆 Dine årsplaner ({sokeResultat.arsplaner.length})</div>
                  {sokeResultat.arsplaner.slice(0,5).map((p,i)=>(
                    <div key={"ap"+i} onClick={()=>{navigerTil("arsplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.tittel||"Årsplan"}</div>
                      {(p.aar||p.tema)&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.aar?p.aar+"":""}{p.aar&&p.tema?" • ":""}{p.tema||""}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.boker && sokeResultat.boker.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#00695c",background:"#e0f2f1",textTransform:"uppercase",letterSpacing:0.5}}>📚 Bøker ({sokeResultat.boker.length})</div>
                  {sokeResultat.boker.slice(0,5).map(b=>(
                    <div key={"bk"+b.id} onClick={()=>{navigerTil("boker");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{b.tittel}</div>
                      {b.forfatter&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{b.forfatter}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.aktivitetskort && sokeResultat.aktivitetskort.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#f57f17",background:"#fff8e1",textTransform:"uppercase",letterSpacing:0.5}}>🃏 Aktivitetskort ({sokeResultat.aktivitetskort.length})</div>
                  {sokeResultat.aktivitetskort.slice(0,5).map(k=>(
                    <div key={"ak"+k.id} onClick={aapneAktivitetskort} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{k.title}</div>
                      {k.category&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{k.category}{k.age_group?" · "+k.age_group:""}</div>}
                    </div>
                  ))}
                  {sokeResultat.aktivitetskort.length>5&&<div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.aktivitetskort.length-5} flere</div>}
                </div>
              )}
              {sokeResultat.dokumentasjon && sokeResultat.dokumentasjon.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#455a64",background:"#eceff1",textTransform:"uppercase",letterSpacing:0.5}}>📔 Dokumentasjon ({sokeResultat.dokumentasjon.length})</div>
                  {sokeResultat.dokumentasjon.slice(0,5).map(d=>(
                    <div key={"dk"+d.id} onClick={aapneDokumentasjon} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{d.tittel}</div>
                      {d.dato&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{d.dato}</div>}
                    </div>
                  ))}
                  {sokeResultat.dokumentasjon.length>5&&<div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.dokumentasjon.length-5} flere</div>}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AktivSideComp({ preselectId, clearPreselect, favoritter, toggleFav }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [valgt, setValgt] = useState(()=>preselectId ? AKTIVITETER.find(a=>a.id===preselectId)||null : null);
  useEffect(() => {
    // Nullstill preselect i parent etter at vi har brukt den
    if (preselectId && clearPreselect) clearPreselect();
  }, [preselectId, clearPreselect]);
  const favSet = new Set(favoritter?.aktiviteter || []);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = AKTIVITETER.filter(a=>{
    const matchSok = !sok||a.tittel.toLowerCase().includes(sok.toLowerCase())||a.hva.toLowerCase().includes(sok.toLowerCase());
    if (filter==="favoritter") return favSet.has(a.id) && matchSok;
    return (filter==="alle"||a.kategori===filter) && matchSok;
  });
  const filtre = [["alle","Alle"],["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],...AKTIV_KATS.filter(k=>k[0]!=="alle")];
  const skrivUtAktivitet = (a) => {
    const tidHtml = a.tid ? ' · ⏱ ' + escapeHTML(a.tid) : '';
    const gruppeHtml = a.gruppe ? ' · 👥 ' + escapeHTML(a.gruppe) : '';
    const matHtml = a.materialer ? '<div style="background:#fce4ec;border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#c62828;margin-bottom:4px;">🧰 Materialer</div><div style="font-size:13px;">' + mdToHtml(a.materialer) + '</div></div>' : '';
    const seksjoner = [['🎯 HVA – Beskrivelse', a.hva, '#fffde7', '#795548'], ['⚙️ HVORDAN – Gjennomføring', a.hvordan, '#e8f5e9', '#2e7d32'], ['❓ HVORFOR – Pedagogisk begrunnelse', a.hvorfor, '#e3f2fd', '#1565c0']].map(([t,v,bg,tc]) => '<div style="background:' + bg + ';border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:' + tc + ';margin-bottom:4px;">' + t + '</div><div style="font-size:13px;line-height:1.7;">' + mdToHtml(v) + '</div></div>').join('');
    skrivUtVindu('<div style="max-width:640px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + escapeHTML(a.tittel) + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + escapeHTML(a.kategori) + ' · ' + escapeHTML(a.alder) + tidHtml + gruppeHtml + '</div>' + seksjoner + matHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', escapeHTML(a.tittel));
  };
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🏃 Aktiviteter</h1>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{AKTIVITETER.length} aktiviteter med HVA · HVORDAN · HVORFOR og rammeplankoblinger</p>
      <input value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk etter aktivitet..." style={{...iS,marginBottom:12}}/>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16,paddingBottom:3}}>
        <div style={{display:"flex",gap:6,flexWrap:"nowrap",width:"max-content"}}>
          {filtre.map(([v,l])=>(
            <button key={v} className="btn" onClick={()=>setFilter(v)} style={{padding:"6px 11px",fontSize:11,background:filter===v?C.g:C.lg2,color:filter===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
          ))}
        </div>
      </div>
      {valgt ? (
        <div className="fade" style={{background:C.w,borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>setValgt(null)}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,flex:1}}>{valgt.tittel}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button className="btn" onClick={()=>skrivUtAktivitet(valgt)} style={{padding:"5px 10px",fontSize:11,background:"#e8f5e9",color:"#2e7d32"}}>🖨️ Skriv ut</button>
              <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("aktiviteter",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                {favSet.has(valgt.id)?"⭐":"☆"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>👶 {valgt.alder}</span>
            {valgt.tid&&<span className="tag" style={{background:"#e3f2fd",color:"#1565c0"}}>⏱ {valgt.tid}</span>}
            {valgt.gruppe&&<span className="tag" style={{background:"#f3e5f5",color:"#6a1b9a"}}>👥 {valgt.gruppe}</span>}
          </div>
          {[["🎯 HVA – Beskrivelse",valgt.hva,"#f59e0b"],["⚙️ HVORDAN – Gjennomføring",valgt.hvordan,"#10b981"],["❓ HVORFOR – Pedagogisk begrunnelse",valgt.hvorfor,"#3b82f6"]].map(([t,v,ac])=>(
            <div key={t} style={{background:C.lg2,borderRadius:11,padding:"12px 14px",marginBottom:10,borderLeft:`3px solid ${ac}`}}>
              <div style={{fontWeight:800,color:ac,marginBottom:4,fontSize:13}}>{t}</div>
              <div style={{color:C.t,fontSize:13,lineHeight:1.7}}>{v}</div>
            </div>
          ))}
          {valgt.materialer&&<div style={{background:C.lg2,borderRadius:11,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid #e07b39"}}><div style={{fontWeight:800,color:"#e07b39",marginBottom:4,fontSize:13}}>🧰 Materialer</div><div style={{color:C.t,fontSize:13}}>{valgt.materialer}</div></div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{(valgt.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {data.length===0&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {data.map(a=>(
            <div key={a.id} className="hover fade" onClick={()=>setValgt(a)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{a.tittel}</div>
                  <div style={{color:C.gr,fontSize:11,marginTop:2}}>{(a.hva||"").substring(0,70)}{(a.hva||"").length>70?"...":""}</div>
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{a.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{a.alder}</span>
                    {(a.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
                  </div>
                </div>
                <button className={`fav-btn ${favSet.has(a.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("aktiviteter",a.id);}} title={favSet.has(a.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                  {favSet.has(a.id)?"⭐":"☆"}
                </button>
                <span style={{color:C.gr,fontSize:17,marginLeft:2}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



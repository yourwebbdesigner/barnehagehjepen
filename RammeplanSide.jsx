import React from "react";
import { FAGOMRADER, RE } from './data/rammeplan.js';
import { AKTIVITETER } from './data/aktiviteter.js';

import { C } from './utils.js';
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}

export default function RammeplanSide({ ctx }) {
  const { rammeSeksjon, setRammeSeksjon, valgtFag, setValgtFag, setPreselectAktiv, setSide } = ctx;

    const seks=[["oversikt","📋","Oversikt"],["formal","🏛️","Formål"],["verdigrunnlag","💎","Verdigrunnlag"],["lek","🎭","Lek og læring"],["danning","💝","Omsorg og vennskap"],["medvirkning","🗣️","Medvirkning"],["fagomrader","📚","Fagområder"],["livsmestring","🌱","Livsmestring"],["pedagogisk","📋","Pedagogisk arbeid"],["samarbeid","👨‍👩‍👧","Samarbeid"],["overgang","🎒","Overgang"],["barnehageloven","⚖️","Barnehageloven"],["roller","👤","Roller"],["inkludering","♿","Inkludering"]];
    return (
      <div className="fade">
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📖 Rammeplan 2017</h1>
        <p style={{color:C.gr,fontSize:12,marginBottom:12}}>Barnehagens viktigste styringsverktøy</p>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {seks.map(([v,ic,l])=>(
            <button key={v} className="btn" onClick={()=>{setRammeSeksjon(v);setValgtFag(null);}} style={{padding:"6px 11px",fontSize:11,background:rammeSeksjon===v?C.g:C.lg2,color:rammeSeksjon===v?"#fff":C.t}}>{ic} {l}</button>
          ))}
        </div>

        {rammeSeksjon==="oversikt"&&(
          <div className="fade">
            <div style={{background:"#fff8e1",borderRadius:13,padding:"13px 15px",marginBottom:14,borderLeft:"4px solid #6ba0d9"}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:13,marginBottom:5}}>Om Rammeplan for barnehagen</div>
              <div style={{fontSize:13,color:"#5d4037",lineHeight:1.7}}>Rammeplan for barnehagen (2017) er en forskrift til barnehageloven som fastsetter verdier, innhold og oppgaver for alle norske barnehager. Den er det viktigste arbeidsverktøyet for alle som jobber i barnehage.</div>
            </div>
            <div style={{display:"grid",gap:9}}>
              {[["🏛️","Formål","Barnehageloven §1 – overordnet formål","formal"],["💎","Verdigrunnlag","Demokrati, mangfold, menneskeverd","verdigrunnlag"],["🎭","Lek og læring","Lekens plass og personalets rolle","lek"],["💝","Omsorg og vennskap","Omsorg, danning og vennskap","danning"],["🗣️","Barnets medvirkning","Rett til innflytelse og deltakelse","medvirkning"],["📚","De 7 fagområdene","Alle faglig innhold og mål","fagomrader"],["🌱","Livsmestring og helse","Trivsel, sosial kompetanse, mobbing","livsmestring"],["📋","Pedagogisk arbeid","Planlegging, vurdering, dokumentasjon","pedagogisk"],["👨‍👩‍👧","Samarbeid med foreldre","Former for godt foreldresamarbeid","samarbeid"],["🎒","Overgang til skole","Forberedelse og ansvarsfordeling","overgang"],["⚖️","Barnehageloven","§1, §2, §3, §4, §7, §8, §16, §19a, §41","barnehageloven"],["👤","Ansvar og roller","Eier, styrer, ped.leder, BUA, assistent","roller"],["♿","Inkludering","Tilrettelegging, PPT, flerspråklige, minoriteter","inkludering"]].map(([ic,t,u,v])=>(
                <div key={v} className="hover" onClick={()=>setRammeSeksjon(v)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",display:"flex",alignItems:"center",gap:11}}>
                  <span style={{fontSize:22,flexShrink:0}}>{ic}</span>
                  <div style={{flex:1}}><div style={{fontWeight:800,color:C.t,fontSize:14}}>{t}</div><div style={{color:C.gr,fontSize:11}}>{u}</div></div>
                  <span style={{color:C.gr}}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="formal"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🏛️ {RE.formal.tittel}</div>
            <div style={{background:"#fff8e1",borderRadius:12,padding:15,marginBottom:13,borderLeft:"4px solid #6ba0d9"}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:5}}>BARNEHAGELOVEN §1 – Lovtekst</div>
              <div style={{fontSize:13,color:"#5d4037",lineHeight:1.8,fontStyle:"italic"}}>{RE.formal.lovtekst}</div>
            </div>
            <div style={{background:C.w,borderRadius:12,padding:15,boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:14,marginBottom:10}}>Formålet innebærer:</div>
              {RE.formal.punkter.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:9,marginBottom:7,alignItems:"flex-start"}}>
                  <span style={{background:C.g,color:"#fff",borderRadius:"50%",width:19,height:19,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{i+1}</span>
                  <span style={{fontSize:13,color:C.t,lineHeight:1.6}}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="verdigrunnlag"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>💎 {RE.verdigrunnlag.tittel}</div>
            <div style={{background:"#e3f2fd",borderRadius:12,padding:14,marginBottom:13,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.verdigrunnlag.innhold}</div>
            <div style={{display:"grid",gap:9}}>
              {RE.verdigrunnlag.verdier.map(v=>(
                <div key={v.navn} style={{background:C.w,borderRadius:11,padding:"13px 15px",boxShadow:"0 2px 6px rgba(44,91,142,0.07)",borderLeft:`3px solid ${C.g}`}}>
                  <div style={{fontWeight:800,color:C.g,fontSize:13,marginBottom:4}}>✦ {v.navn}</div>
                  <div style={{fontSize:13,color:C.t,lineHeight:1.6}}>{v.b}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="medvirkning"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🗣️ {RE.medvirkning.tittel}</div>
            <div style={{background:"#e8f5e9",borderRadius:12,padding:14,marginBottom:12,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.medvirkning.innhold}</div>
            <div style={{background:C.w,borderRadius:12,padding:15,marginBottom:11,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:9}}>Prinsipper:</div>
              {RE.medvirkning.prinsipper.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                  <span style={{color:C.g,fontWeight:800,flexShrink:0}}>✓</span>
                  <span style={{fontSize:13,color:C.t,lineHeight:1.6}}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{background:C.w,borderRadius:12,padding:15,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:9}}>Metoder i praksis:</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {RE.medvirkning.metoder.map((m,i)=>(
                  <div key={i} style={{background:C.mint,borderRadius:8,padding:"8px 11px",fontSize:11,color:C.g,fontWeight:600}}>🗣 {m}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {rammeSeksjon==="fagomrader"&&(
          <div className="fade">
            {!valgtFag?(
              <>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>📚 De 7 fagområdene</div>
                <div style={{display:"grid",gap:9}}>
                  {FAGOMRADER.map(f=>(
                    <div key={f.id} className="hover" onClick={()=>setValgtFag(f)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:`4px solid ${f.farge}`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:24}}>{f.ikon}</span>
                          <div><div data-fag-color={f.id} style={{fontWeight:800,color:f.farge,fontSize:13}}>{f.nr}. {f.navn}</div><div style={{fontSize:11,color:C.gr}}>{f.kortbeskrivelse}</div></div>
                        </div>
                        <span style={{color:C.gr}}>›</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ):(
              <div className="fade">
                <Tilbake onClick={()=>setValgtFag(null)} />
                <div data-fag={valgtFag.id} style={{background:valgtFag.lys,borderRadius:13,padding:18,marginBottom:12,borderLeft:`5px solid ${valgtFag.farge}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <span style={{fontSize:30}}>{valgtFag.ikon}</span>
                    <div data-fag-color={valgtFag.id} style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:valgtFag.farge}}>{valgtFag.navn}</div>
                  </div>
                  <p style={{fontSize:13,color:C.t,lineHeight:1.7}}>{valgtFag.innhold}</p>
                </div>
                {[["🎯 Mål for barna",valgtFag.malBarna,valgtFag.farge],["👩‍🏫 Personalets ansvar",valgtFag.malPersonal,"✦"]].map(([tittel,liste,farge])=>(
                  <div key={tittel} style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                    <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:9}}>{tittel}</div>
                    {liste.map((m,i)=>(
                      <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                        <span style={{background:valgtFag.farge,color:"#fff",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}</span>
                        <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{m}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:8}}>📈 Progresjon</div>
                  <div data-fag={valgtFag.id} style={{background:valgtFag.lys,borderRadius:8,padding:11,fontSize:13,color:C.t,lineHeight:1.7}}>{valgtFag.progresjon}</div>
                </div>
                <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:8}}>🛠 Arbeidsmetoder</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {valgtFag.arbeidsmater.map((a,i)=><div data-fag={valgtFag.id} key={i} style={{background:valgtFag.lys,borderRadius:8,padding:"7px 10px",fontSize:11,color:valgtFag.farge,fontWeight:600}}>✓ {a}</div>)}
                  </div>
                </div>
                <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:8}}>💡 Eksempler i praksis</div>
                  {valgtFag.eksempler.map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                      <span style={{fontSize:13}}>▸</span>
                      <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{e}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:C.w,borderRadius:11,padding:13,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.gr,marginBottom:7}}>Relaterte aktiviteter:</div>
                  {AKTIVITETER.filter(a=>a.rammeplan.includes(valgtFag.id)).length>0?
                    AKTIVITETER.filter(a=>a.rammeplan.includes(valgtFag.id)).map(a=>(
                      <div key={a.id} className="hover" onClick={()=>{setPreselectAktiv(a.id);setSide("aktiviteter");}} style={{background:C.bg,borderRadius:8,padding:"8px 11px",marginBottom:6,cursor:"pointer"}}>
                        <span style={{fontWeight:700,color:C.t,fontSize:12}}>⭐ {a.tittel}</span>
                        <div style={{fontSize:10,color:C.gr}}>{a.hva?.substring(0,55)}...</div>
                      </div>
                    )):<div style={{fontSize:12,color:C.gr}}>Ingen aktiviteter koblet ennå.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {rammeSeksjon==="samarbeid"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>👨‍👩‍👧 {RE.samarbeid.tittel}</div>
            <div style={{background:"#f3e5f5",borderRadius:12,padding:14,marginBottom:12,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.samarbeid.innhold}</div>
            <div style={{display:"grid",gap:9}}>
              {RE.samarbeid.former.map(f=>(
                <div key={f.t} style={{background:C.w,borderRadius:11,padding:"13px 15px",boxShadow:"0 2px 6px rgba(44,91,142,0.07)",borderLeft:"3px solid #b5179e"}}>
                  <div style={{fontWeight:800,color:"#b5179e",fontSize:13,marginBottom:4}}>👥 {f.t}</div>
                  <div style={{fontSize:13,color:C.t,lineHeight:1.6}}>{f.b}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="overgang"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🎒 {RE.overgang.tittel}</div>
            <div style={{background:"#e3f2fd",borderRadius:12,padding:14,marginBottom:12,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.overgang.innhold}</div>
            {[["Hva barnet skal ha med seg:",RE.overgang.barnet,"#1565c0"],["Barnehagens ansvar:",RE.overgang.barnehagen,C.g]].map(([t,l,fc])=>(
              <div key={t} style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:9}}>{t}</div>
                {l.map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                    <span style={{color:fc,fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {rammeSeksjon==="lek"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🎭 {RE.lek.tittel}</div>
            <div style={{background:"#fff3e0",borderRadius:12,padding:14,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #e67e22"}}>{RE.lek.innhold}</div>

            <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:8}}>📚 Ulike former for lek</div>
            <div style={{display:"grid",gap:8,marginBottom:14}}>
              {RE.lek.typer.map((t,i)=>(
                <div key={i} style={{background:C.w,borderRadius:11,padding:"12px 14px",boxShadow:"0 2px 6px rgba(44,91,142,0.07)",borderLeft:"3px solid #e67e22"}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:3}}>{t.navn}</div>
                  <div style={{fontSize:12,color:C.gr,lineHeight:1.6}}>{t.b}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:12,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:9}}>👩‍🏫 Personalets rolle i leken</div>
              {RE.lek.personalRolle.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                  <span style={{color:"#e67e22",fontWeight:800,flexShrink:0}}>✓</span>
                  <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                </div>
              ))}
            </div>

            <div style={{background:"#fff8e1",borderRadius:12,padding:14,fontSize:12,color:"#5d4037",lineHeight:1.7,borderLeft:"4px solid #f4a261"}}>
              <div style={{fontWeight:800,marginBottom:5,color:"#795548"}}>💡 Læringssyn i barnehagen</div>
              {RE.lek.laeringssyn}
            </div>
          </div>
        )}

        {rammeSeksjon==="danning"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>💝 {RE.danning.tittel}</div>
            <div style={{background:"#fce4ec",borderRadius:12,padding:14,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #c2185b"}}>{RE.danning.innhold}</div>

            {[
              { d:RE.danning.omsorg, ic:"🤗", color:"#c2185b", bg:"#fce4ec" },
              { d:RE.danning.danning, ic:"🌱", color:"#2d6a4f", bg:"#d8f3dc" },
            ].map((blokk,bi)=>(
              <div key={bi} style={{background:C.w,borderRadius:12,padding:14,marginBottom:11,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                <div style={{fontWeight:800,color:blokk.color,fontSize:14,marginBottom:6}}>{blokk.ic} {blokk.d.tittel}</div>
                <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:10}}>{blokk.d.b}</div>
                <div style={{background:blokk.bg,borderRadius:9,padding:11}}>
                  <div style={{fontWeight:800,color:blokk.color,fontSize:11,marginBottom:6}}>KJENNETEGN</div>
                  {blokk.d.kjennetegn.map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                      <span style={{color:blokk.color,fontWeight:800,flexShrink:0}}>•</span>
                      <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{background:C.w,borderRadius:12,padding:14,marginBottom:11,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:14,marginBottom:6}}>👫 {RE.danning.vennskap.tittel}</div>
              <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:10}}>{RE.danning.vennskap.b}</div>
              <div style={{background:"#e3f2fd",borderRadius:9,padding:11}}>
                <div style={{fontWeight:800,color:"#1565c0",fontSize:11,marginBottom:6}}>HVA PERSONALET KAN GJØRE</div>
                {RE.danning.vennskap.personalArbeid.map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                    <span style={{color:"#1565c0",fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {rammeSeksjon==="livsmestring"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🌱 {RE.livsmestring.tittel}</div>
            <div style={{background:"#d8f3dc",borderRadius:12,padding:14,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #2d6a4f"}}>{RE.livsmestring.innhold}</div>

            <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:8}}>🌿 Sentrale områder</div>
            <div style={{display:"grid",gap:8,marginBottom:14}}>
              {RE.livsmestring.omrader.map((o,i)=>(
                <div key={i} style={{background:C.w,borderRadius:11,padding:"12px 14px",boxShadow:"0 2px 6px rgba(44,91,142,0.07)",borderLeft:"3px solid #2d6a4f"}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:3}}>{o.navn}</div>
                  <div style={{fontSize:12,color:C.gr,lineHeight:1.6}}>{o.b}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:11,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:9}}>👩‍🏫 Personalets arbeid</div>
              {RE.livsmestring.personalArbeid.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                  <span style={{color:"#2d6a4f",fontWeight:800,flexShrink:0}}>✓</span>
                  <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                </div>
              ))}
            </div>

            <div style={{background:"#fdecea",borderRadius:12,padding:14,fontSize:12,color:"#c62828",lineHeight:1.7,borderLeft:"4px solid #c62828"}}>
              <div style={{fontWeight:800,marginBottom:5}}>⚖️ Aktivitetsplikt (lovfestet)</div>
              {RE.livsmestring.handlingsplikt}
            </div>
          </div>
        )}

        {rammeSeksjon==="barnehageloven"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>⚖️ {RE.barnehageloven.tittel}</div>
            <div style={{background:"#fff8e1",borderRadius:12,padding:13,marginBottom:14,fontSize:12,color:"#5d4037",lineHeight:1.7,borderLeft:"4px solid #e67e22"}}>Lovtekstene er fra Lov om barnehager (barnehageloven). Loven gir rammene – Rammeplan for barnehagen (2017) utdyper innholdet.</div>
            <div style={{display:"grid",gap:10}}>
              {RE.barnehageloven.paragrafer.map((p,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                    <span style={{background:C.g,color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,flexShrink:0,whiteSpace:"nowrap"}}>{p.nr}</span>
                    <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
                  </div>
                  <div style={{fontSize:12,color:C.t,lineHeight:1.75,fontStyle:"italic",borderLeft:"3px solid #d8e6f5",paddingLeft:12}}>{p.tekst}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="roller"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>👤 {RE.roller.tittel}</div>
            <div style={{background:"#e8eff8",borderRadius:12,padding:13,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.roller.innhold}</div>
            <div style={{display:"grid",gap:10}}>
              {RE.roller.personer.map((p,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid "+p.farge}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                    <span style={{fontSize:22}}>{p.ikon}</span>
                    <div style={{fontWeight:800,color:p.farge,fontSize:15}}>{p.rolle}</div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:11,marginBottom:6}}>ANSVAR</div>
                    {p.ansvar.map((a,j)=>(
                      <div key={j} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <span style={{color:p.farge,fontWeight:800,flexShrink:0}}>✓</span>
                        <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"#f5f9fd",borderRadius:8,padding:"8px 10px",fontSize:11,color:C.gr,lineHeight:1.6}}>
                    <strong>Krav:</strong> {p.krav}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="inkludering"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>♿ {RE.inkludering.tittel}</div>
            <div style={{background:"#e8f5e9",borderRadius:12,padding:13,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #2d6a4f"}}>{RE.inkludering.innhold}</div>
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              {RE.inkludering.omrader.map((o,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid "+o.farge}}>
                  <div style={{fontWeight:800,color:o.farge,fontSize:14,marginBottom:4}}>{o.ikon} {o.navn}</div>
                  <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:8}}>{o.innhold}</div>
                  <div style={{background:"#f5f9fd",borderRadius:8,padding:10}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:10,marginBottom:6}}>TILTAK OG RETTIGHETER</div>
                    {o.tiltak.map((t,j)=>(
                      <div key={j} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <span style={{color:o.farge,fontWeight:800,flexShrink:0}}>•</span>
                        <span style={{fontSize:12,color:C.t,lineHeight:1.5}}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid #1565c0"}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:14,marginBottom:6}}>🏫 {RE.inkludering.ppt.tittel}</div>
              <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:10}}>{RE.inkludering.ppt.innhold}</div>
              <div style={{marginBottom:10}}>
                <div style={{fontWeight:800,color:C.t,fontSize:11,marginBottom:6}}>OPPGAVER</div>
                {RE.inkludering.ppt.oppgaver.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                    <span style={{color:"#1565c0",fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:C.t,lineHeight:1.5}}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#e3f2fd",borderRadius:8,padding:"8px 10px",fontSize:11,color:"#1565c0",lineHeight:1.6}}><strong>Hvem kan henvende seg?</strong> {RE.inkludering.ppt.hvemKanHenvise}</div>
            </div>
          </div>
        )}

        {rammeSeksjon==="pedagogisk"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>📋 {RE.pedagogisk.tittel}</div>
            <div style={{background:"#e3f2fd",borderRadius:12,padding:14,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #1565c0"}}>{RE.pedagogisk.innhold}</div>

            {[
              { d:RE.pedagogisk.planlegging, ic:"📅", color:"#1565c0", bg:"#e3f2fd", listKey:"former", listTitle:"FORMER" },
              { d:RE.pedagogisk.vurdering, ic:"🔍", color:"#2d6a4f", bg:"#d8f3dc", listKey:"hvordan", listTitle:"HVORDAN" },
              { d:RE.pedagogisk.dokumentasjon, ic:"📝", color:"#e67e22", bg:"#fff3e0", listKey:"former", listTitle:"FORMER" },
            ].map((blokk,bi)=>(
              <div key={bi} style={{background:C.w,borderRadius:12,padding:14,marginBottom:11,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                <div style={{fontWeight:800,color:blokk.color,fontSize:14,marginBottom:6}}>{blokk.ic} {blokk.d.tittel}</div>
                <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:10}}>{blokk.d.b}</div>
                <div style={{background:blokk.bg,borderRadius:9,padding:11}}>
                  <div style={{fontWeight:800,color:blokk.color,fontSize:11,marginBottom:6}}>{blokk.listTitle}</div>
                  {blokk.d[blokk.listKey].map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                      <span style={{color:blokk.color,fontWeight:800,flexShrink:0}}>•</span>
                      <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{background:C.w,borderRadius:12,padding:14,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
              <div style={{fontWeight:800,color:C.t,fontSize:13,marginBottom:10}}>👥 Roller og ansvar i barnehagen</div>
              {RE.pedagogisk.ansvar.map((r,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start",padding:"8px 0",borderBottom:i<RE.pedagogisk.ansvar.length-1?"1px solid #e8eff8":"none"}}>
                  <div style={{minWidth:120,flexShrink:0}}>
                    <span style={{background:"#e8eff8",color:C.g,borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:800}}>{r.rolle}</span>
                  </div>
                  <span style={{fontSize:12,color:C.gr,lineHeight:1.6,flex:1}}>{r.b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

import React, { useState, useRef } from "react";
import { supabase } from "./supabase.js";
import { oppdaterVisningsnavn, oppdaterTelefon, oppdaterAvatar, oppdaterProfilbilde, oppdaterBrukernavn, oppdaterEpost, oppdaterPassord, validerTelefon, passordStyrke, AVATAR_VALG, komprimerBilde } from './api.js';

const C = { g:"var(--c-g)", lg:"var(--c-lg)", mint:"var(--c-mint)", bg:"var(--c-bg)", yl:"var(--c-yl)", w:"var(--c-w)", t:"var(--c-t)", gr:"var(--c-gr)", lg2:"var(--c-lg2)" };
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}
function AvatarDisplay({ src, emoji, size, bg = "rgba(255,255,255,0.18)" }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:src?"#e8eff8":bg,lineHeight:1,position:"relative"}}>
      {src ? (
        <img src={src} alt="Profilbilde" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
      ) : (
        <span style={{fontSize:Math.floor(size*0.55)}}>{emoji || "👤"}</span>
      )}
    </div>
  );
}
export default function ProfilSide({ ctx }) {
  const { aktivBruker, onUserUpdate, onLogout } = ctx;

    const [seksjon, setSeksjon] = useState("oversikt"); // oversikt | navn | brukernavn | epost | passord | avatar
    const [pf_loading, setPfLoading] = useState(false);
    const [pf_feil, setPfFeil] = useState("");
    const [pf_suksess, setPfSuksess] = useState("");

    // Visningsnavn
    const [v_navn, setVNavn] = useState(aktivBruker?.visningsnavn || "");

    // Brukernavn
    const [nb_nytt, setNbNytt] = useState("");

    // E-post
    const [ne_nytt, setNeNytt] = useState("");

    // Telefon
    const [tlf_nytt, setTlfNytt] = useState(aktivBruker?.telefon || "");

    // Passord
    const [pw_gammelt, setPwGammelt] = useState("");
    const [pw_nytt, setPwNytt] = useState("");
    const [pw_bekreft, setPwBekreft] = useState("");
    const [pw_vis, setPwVis] = useState(false);

    // Profilbilde-state
    const [bildePreview, setBildePreview] = useState(null);
    const [bildeLoading, setBildeLoading] = useState(false);
    const [bekreftFjernBilde, setBekreftFjernBilde] = useState(false);
    const filInputRef = useRef(null);

    const styrke = passordStyrke(pw_nytt);

    const tilbake = () => { setSeksjon("oversikt"); setPfFeil(""); setPfSuksess(""); };

    const visBekreftelse = (msg) => {
      setPfSuksess(msg);
      setTimeout(()=>{ setPfSuksess(""); setSeksjon("oversikt"); }, 1500);
    };

    const lagreVisningsnavn = async () => {
      setPfFeil(""); setPfSuksess(""); setPfLoading(true);
      const r = await oppdaterVisningsnavn(aktivBruker.id, v_navn);
      setPfLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      visBekreftelse("✅ Visningsnavn oppdatert!");
    };

    const lagreBrukernavnEndr = async () => {
      setPfFeil(""); setPfSuksess(""); setPfLoading(true);
      const r = await oppdaterBrukernavn(aktivBruker.id, nb_nytt);
      setPfLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      setNbNytt("");
      visBekreftelse("✅ Brukernavn oppdatert!");
    };

    const lagreEpostEndr = async () => {
      setPfFeil(""); setPfSuksess(""); setPfLoading(true);
      const r = await oppdaterEpost(aktivBruker.id, ne_nytt);
      setPfLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      setNeNytt("");
      visBekreftelse("✅ Bekreftelseslenke sendt til ny e-post – klikk lenken for å bekrefte endringen.");
    };

    const lagreTelefonEndr = async () => {
      setPfFeil(""); setPfSuksess(""); setPfLoading(true);
      const r = await oppdaterTelefon(aktivBruker.id, tlf_nytt);
      setPfLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      visBekreftelse(tlf_nytt.trim() ? "✅ Telefonnummer oppdatert!" : "✅ Telefonnummer fjernet");
    };

    const lagrePassordEndr = async () => {
      setPfFeil(""); setPfSuksess("");
      if (pw_nytt !== pw_bekreft) { setPfFeil("De to nye passordene er ikke like"); return; }
      if (styrke.nivaa < 2) { setPfFeil("Passord er for svakt – velg minst 6 tegn"); return; }
      setPfLoading(true);
      const r = await oppdaterPassord(aktivBruker.id, pw_gammelt, pw_nytt);
      setPfLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      setPwGammelt(""); setPwNytt(""); setPwBekreft("");
      visBekreftelse("✅ Passord oppdatert! Du er fortsatt innlogget.");
    };

    const settAvatar = async (emoji) => {
      const r = await oppdaterAvatar(aktivBruker.id, emoji);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      visBekreftelse("✅ Avatar oppdatert!");
    };

    // Bilde: håndter filvalg, komprimer og lag forhåndsvisning
    const handleFilValg = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPfFeil(""); setPfSuksess(""); setBildeLoading(true);
      try {
        const dataUrl = await komprimerBilde(file, 400, 0.85);
        setBildePreview(dataUrl);
      } catch (err) {
        setPfFeil(err.message || "Kunne ikke behandle bildet");
        setBildePreview(null);
      }
      setBildeLoading(false);
      // Tilbakestill input slik at samme fil kan velges igjen senere
      try { e.target.value = ""; } catch (_) {}
    };

    const bekreftBilde = async () => {
      if (!bildePreview) return;
      setPfFeil(""); setBildeLoading(true);
      const r = await oppdaterProfilbilde(aktivBruker.id, bildePreview);
      setBildeLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      setBildePreview(null);
      visBekreftelse("✅ Profilbilde oppdatert!");
    };

    const avbrytBilde = () => {
      setBildePreview(null);
      setPfFeil("");
    };

    const fjernBilde = async () => {
      // Vis pen bekreftelses-modal i stedet for confirm() som er blokkert i mange webviews
      setBekreftFjernBilde(true);
    };

    const utforFjernBilde = async () => {
      setBekreftFjernBilde(false);
      setPfFeil(""); setBildeLoading(true);
      const r = await oppdaterProfilbilde(aktivBruker.id, null);
      setBildeLoading(false);
      if (!r.ok) { setPfFeil(r.feil); return; }
      onUserUpdate(r.bruker);
      visBekreftelse("✅ Profilbilde fjernet");
    };

    const iS = {width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:14,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10,outline:"none"};
    const labelStil = {display:"block",fontWeight:700,color:C.t,fontSize:12,marginBottom:5};
    const knappPrimaer = (disabled) => ({width:"100%",padding:"12px",fontSize:14,fontWeight:800,background:disabled?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:10,cursor:disabled?"wait":"pointer",fontFamily:"'Nunito',sans-serif",marginTop:4,boxShadow:"0 3px 9px rgba(44,91,142,0.25)"});

    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>👤 Min profil</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Administrer kontoen din – brukernavn, e-post, passord og avatar</p>

        {pf_feil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {pf_feil}</div>}
        {pf_suksess && <div className="fade" style={{background:"#d8f3dc",color:"#1b5e47",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #2d6a4f"}}>{pf_suksess}</div>}

        {seksjon === "oversikt" && (
          <>
            {/* Brukerkort */}
            <div style={{background:"linear-gradient(135deg,#2c5b8e,#4178bd)",borderRadius:16,padding:"20px 18px",color:"#fff",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
              <AvatarDisplay src={aktivBruker?.profilbilde} emoji={aktivBruker?.avatar} size={74}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,lineHeight:1.1,wordBreak:"break-word"}}>{aktivBruker?.visningsnavn || aktivBruker?.brukernavn || "Bruker"}</div>
                <div style={{fontSize:12,opacity:0.85,marginTop:3,wordBreak:"break-word"}}>@{aktivBruker?.brukernavn}</div>
                <div style={{fontSize:11,opacity:0.75,marginTop:2,wordBreak:"break-word"}}>📧 {aktivBruker?.epost}</div>
                {aktivBruker?.admin && <div style={{background:"#fff9c4",color:"#795548",borderRadius:8,padding:"2px 9px",fontSize:10,fontWeight:800,marginTop:6,display:"inline-block"}}>👑 ADMIN</div>}
              </div>
            </div>

            {/* Innstillingskort */}
            <div style={{display:"grid",gap:9}}>
              {[
                {id:"avatar", ikon:"📷", t:"Profilbilde og avatar", b:aktivBruker?.profilbilde ? "Eget bilde lastet opp" : `Emoji: ${aktivBruker?.avatar || "👤 (standard)"}`},
                {id:"navn", ikon:"✏️", t:"Visningsnavn", b:aktivBruker?.visningsnavn || "Ikke satt"},
                {id:"brukernavn", ikon:"@", t:"Brukernavn", b:aktivBruker?.brukernavn},
                {id:"epost", ikon:"📧", t:"E-postadresse", b:aktivBruker?.epost},
                {id:"telefon", ikon:"📱", t:"Telefonnummer", b:aktivBruker?.telefon || "Ikke satt"},
                {id:"passord", ikon:"🔒", t:"Endre passord", b:"Krever gammelt passord"},
              ].map(p=>(
                <div key={p.id} className="hover" onClick={()=>setSeksjon(p.id)} style={{background:C.w,borderRadius:11,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:22,width:36,height:36,background:C.lg2,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:800,color:C.g}}>{p.ikon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:13}}>{p.t}</div>
                    <div style={{fontSize:11,color:C.gr,marginTop:2,wordBreak:"break-word"}}>{p.b}</div>
                  </div>
                  <span style={{color:C.gr,fontSize:17}}>›</span>
                </div>
              ))}
            </div>

            <div style={{background:"#fff8e1",borderRadius:10,padding:"11px 13px",fontSize:11,color:"#795548",borderLeft:"4px solid #6ba0d9",marginTop:16,lineHeight:1.6}}>
              <strong>🔒 Om sikkerhet:</strong> Passord og autentisering håndteres av Supabase Auth. Profildata lagres i skyen og synkroniseres mellom enheter. E-postendringer krever bekreftelse.
            </div>
          </>
        )}

        {seksjon === "avatar" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>

            {/* Skjult filinput – OS-en gir mobil-bruker valg mellom kamera, galleri og filer */}
            <input
              ref={filInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
              onChange={handleFilValg}
              style={{position:"absolute",left:"-9999px",width:1,height:1,opacity:0}}
              aria-hidden="true"
            />

            {/* DEL 1: PROFILBILDE */}
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:6}}>📷 Profilbilde</div>
            <p style={{fontSize:12,color:C.gr,marginBottom:14,lineHeight:1.6}}>Last opp et bilde fra mobilkamera, galleri eller PC. Bildet beskjæres automatisk til en sirkel.</p>

            {/* Stor sentrert forhåndsvisning */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:14}}>
              {bildeLoading ? (
                <div style={{width:140,height:140,borderRadius:"50%",background:"#e8eff8",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div className="spin"/>
                </div>
              ) : (
                <div style={{width:140,height:140,borderRadius:"50%",overflow:"hidden",background:"#e8eff8",border:"4px solid #d8e6f5",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(44,91,142,0.18)"}}>
                  {bildePreview ? (
                    <img src={bildePreview} alt="Forhåndsvisning" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  ) : aktivBruker?.profilbilde ? (
                    <img src={aktivBruker.profilbilde} alt="Profilbilde" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                  ) : (
                    <span style={{fontSize:78,lineHeight:1}}>{aktivBruker?.avatar || "👤"}</span>
                  )}
                </div>
              )}
              {bildePreview && (
                <div style={{marginTop:9,padding:"5px 11px",background:"#fff8e1",borderRadius:8,fontSize:11,color:"#795548",fontWeight:700}}>📸 Forhåndsvisning – ikke lagret ennå</div>
              )}
            </div>

            {/* Knapper – byttes avhengig av tilstand */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
              {bildePreview ? (
                <>
                  <button onClick={bekreftBilde} disabled={bildeLoading} style={{flex:"1 1 140px",padding:"12px",fontSize:14,fontWeight:800,background:bildeLoading?"#ccc":"linear-gradient(135deg,#2d6a4f,#52b788)",color:"#fff",border:"none",borderRadius:10,cursor:bildeLoading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(45,106,79,0.25)"}}>{bildeLoading?"Lagrer ...":"💾 Lagre bilde"}</button>
                  <button onClick={avbrytBilde} disabled={bildeLoading} style={{flex:"0 0 auto",padding:"12px 16px",fontSize:14,fontWeight:700,background:"#e8eff8",color:C.t,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✕ Avbryt</button>
                </>
              ) : (
                <>
                  <button onClick={()=>filInputRef.current?.click()} disabled={bildeLoading} style={{flex:"1 1 140px",padding:"12px",fontSize:14,fontWeight:800,background:bildeLoading?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:10,cursor:bildeLoading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(44,91,142,0.25)"}}>
                    {bildeLoading?"Behandler ...":(aktivBruker?.profilbilde?"📷 Bytt bilde":"📷 Last opp bilde")}
                  </button>
                  {aktivBruker?.profilbilde && (
                    <button onClick={fjernBilde} disabled={bildeLoading} style={{flex:"0 0 auto",padding:"12px 16px",fontSize:14,fontWeight:700,background:"#fdecea",color:"#c62828",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Fjern bilde</button>
                  )}
                </>
              )}
            </div>

            <div style={{background:"#e8eff8",borderRadius:9,padding:"10px 12px",fontSize:11,color:C.gr,lineHeight:1.6,marginBottom:18}}>
              <strong style={{color:C.t}}>📱 Slik fungerer det:</strong> På mobil får du velge mellom kamera og galleri. Bildet komprimeres automatisk til 400×400 px og lagres lokalt på enheten din.<br/>
              <strong style={{color:C.t}}>Støttede formater:</strong> JPG, PNG, WEBP (maks 12 MB).
            </div>

            {/* DEL 2: EMOJI-AVATAR */}
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.t,marginBottom:6}}>🎨 Emoji-avatar</div>
            <p style={{fontSize:11,color:C.gr,marginBottom:12,lineHeight:1.6}}>Vises hvis du ikke har et profilbilde. Trykk på et emoji for å velge.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(54px,1fr))",gap:7}}>
              {AVATAR_VALG.map(e=>(
                <button key={e} onClick={()=>settAvatar(e)} style={{fontSize:26,padding:0,background:aktivBruker?.avatar===e?"#d8e6f5":"#f5f9fd",border:aktivBruker?.avatar===e?"2.5px solid #2c5b8e":"2px solid #e8eff8",borderRadius:11,cursor:"pointer",aspectRatio:"1",lineHeight:1,transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {seksjon === "navn" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>✏️ Visningsnavn</div>
            <p style={{fontSize:12,color:C.gr,marginBottom:12,lineHeight:1.6}}>Dette navnet vises i appen istedenfor brukernavnet ditt. Krever ikke passord å endre.</p>
            <label style={labelStil}>Visningsnavn</label>
            <input type="text" value={v_navn} onChange={e=>setVNavn(e.target.value)} placeholder="F.eks. Kari Hansen" style={iS}/>
            <button onClick={lagreVisningsnavn} disabled={pf_loading} style={knappPrimaer(pf_loading)}>{pf_loading?"Lagrer ...":"💾 Lagre"}</button>
          </div>
        )}

        {seksjon === "brukernavn" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>@ Endre brukernavn</div>
            <div style={{background:"#e8eff8",padding:"9px 12px",borderRadius:9,marginBottom:12,fontSize:12,color:C.t}}>Nåværende: <strong>{aktivBruker?.brukernavn}</strong></div>
            <label style={labelStil}>Nytt brukernavn (min. 3 tegn)</label>
            <input type="text" value={nb_nytt} onChange={e=>setNbNytt(e.target.value)} placeholder="kari_ny" style={iS} autoComplete="username"/>
            <button onClick={lagreBrukernavnEndr} disabled={pf_loading||!nb_nytt} style={knappPrimaer(pf_loading||!nb_nytt)}>{pf_loading?"Lagrer ...":"💾 Lagre endring"}</button>
          </div>
        )}

        {seksjon === "epost" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>📧 Endre e-post</div>
            <div style={{background:"#e8eff8",padding:"9px 12px",borderRadius:9,marginBottom:12,fontSize:12,color:C.t}}>Nåværende: <strong>{aktivBruker?.epost}</strong></div>
            <label style={labelStil}>Ny e-postadresse</label>
            <input type="email" value={ne_nytt} onChange={e=>setNeNytt(e.target.value)} placeholder="ny@example.no" style={iS} autoComplete="email"/>
            <div style={{background:"#e8eff8",borderRadius:8,padding:"8px 11px",fontSize:11,color:"#5d7390",marginBottom:10,lineHeight:1.5}}>
              📧 Supabase sender en bekreftelseslenke til den nye e-posten.
            </div>
            <button onClick={lagreEpostEndr} disabled={pf_loading||!ne_nytt} style={knappPrimaer(pf_loading||!ne_nytt)}>{pf_loading?"Lagrer ...":"💾 Lagre endring"}</button>
          </div>
        )}

        {seksjon === "telefon" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:8}}>📱 Telefonnummer</div>
            <p style={{fontSize:12,color:C.gr,marginBottom:14,lineHeight:1.6}}>Valgfritt. Lagres sikkert i skyen og synkroniseres på tvers av enheter. Krever ikke passord å endre.</p>
            <div style={{background:"#e8eff8",padding:"9px 12px",borderRadius:9,marginBottom:12,fontSize:12,color:C.t}}>Nåværende: <strong>{aktivBruker?.telefon || "Ikke satt"}</strong></div>
            <label style={labelStil}>Telefonnummer (la stå tomt for å fjerne)</label>
            <input type="tel" inputMode="tel" value={tlf_nytt} onChange={e=>setTlfNytt(e.target.value)} placeholder="+47 123 45 678" style={iS} autoComplete="tel"/>
            <button onClick={lagreTelefonEndr} disabled={pf_loading} style={knappPrimaer(pf_loading)}>{pf_loading?"Lagrer ...":"💾 Lagre"}</button>
          </div>
        )}

        {seksjon === "passord" && (
          <div style={{background:C.w,borderRadius:14,padding:18,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <Tilbake onClick={tilbake}/>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>🔒 Endre passord</div>
            <label style={labelStil}>Gjeldende passord</label>
            <input type={pw_vis?"text":"password"} value={pw_gammelt} onChange={e=>setPwGammelt(e.target.value)} placeholder="••••••••" style={iS} autoComplete="current-password"/>
            <label style={labelStil}>Nytt passord (min. 6 tegn)</label>
            <div style={{position:"relative"}}>
              <input type={pw_vis?"text":"password"} value={pw_nytt} onChange={e=>setPwNytt(e.target.value)} placeholder="••••••••" style={{...iS,paddingRight:60}} autoComplete="new-password"/>
              <button type="button" aria-label={pw_vis?"Skjul passord":"Vis passord"} onClick={()=>setPwVis(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:C.gr,fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>{pw_vis?"Skjul":"Vis"}</button>
            </div>
            {/* Passord-styrke-måler */}
            {pw_nytt && (
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",gap:3,marginBottom:5}}>
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} style={{flex:1,height:5,borderRadius:3,background:i<=styrke.nivaa?styrke.farge:"#e8eff8",transition:"background 0.2s"}}/>
                  ))}
                </div>
                <div style={{fontSize:11,fontWeight:700,color:styrke.farge}}>Styrke: {styrke.tekst}</div>
              </div>
            )}
            <label style={labelStil}>Bekreft nytt passord</label>
            <input type={pw_vis?"text":"password"} value={pw_bekreft} onChange={e=>setPwBekreft(e.target.value)} placeholder="••••••••" style={iS} autoComplete="new-password"/>
            <button onClick={lagrePassordEndr} disabled={pf_loading||!pw_gammelt||!pw_nytt||!pw_bekreft} style={knappPrimaer(pf_loading||!pw_gammelt||!pw_nytt||!pw_bekreft)}>{pf_loading?"Lagrer ...":"🔒 Sett nytt passord"}</button>
            <div style={{fontSize:11,color:C.gr,marginTop:11,lineHeight:1.6}}>💡 <strong>Tips for sterkt passord:</strong> minst 8 tegn, bland store og små bokstaver, tall og spesialtegn.</div>
          </div>
        )}

        {bekreftFjernBilde && (
          <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBekreftFjernBilde(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:22,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>🗑 Fjerne profilbildet?</div>
              <p style={{fontSize:13,color:C.t,lineHeight:1.6,marginBottom:16}}>
                Profilbildet ditt vil bli fjernet, og avataren {aktivBruker?.avatar || "👤"} vises i stedet. Du kan laste opp et nytt bilde når som helst.
              </p>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setBekreftFjernBilde(false)} style={{flex:1,padding:"11px",background:"#e8eff8",color:C.t,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                <button onClick={utforFjernBilde} style={{flex:1,padding:"11px",background:"#c62828",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Fjern bilde</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }




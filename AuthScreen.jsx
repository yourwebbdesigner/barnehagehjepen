import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { passordStyrke, validerTelefon, diagnostiserStorage, hentProfil, sendTilbakestillEpost, publiskBruker, AVATAR_VALG, registrerBruker, loggInnBruker } from './api.js';
import { supportMailto } from './data/faq.js';

import { C } from './utils.js';
// ═══════════════════════════════════════════
function VilkaarModal({ type, onLukk }) {
  const erPersonvern = type === "personvern";
  return (
    <div
      onClick={onLukk}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,30,55,0.65)",
        zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, maxWidth: 560, width: "100%",
          maxHeight: "88vh", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#2c5b8e,#4178bd)",
          borderRadius: "18px 18px 0 0", padding: "18px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#fff" }}>
              {erPersonvern ? "🔒 Personvernerklæring" : "📋 Bruksvilkår"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              Barnehagehjelpen · Sist oppdatert mai 2026
            </div>
          </div>
          <button
            onClick={onLukk}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10,
              color: "#fff", fontSize: 18, cursor: "pointer", padding: "6px 11px",
              fontWeight: 700, lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Innhold */}
        <div style={{ overflowY: "auto", padding: "22px 24px", flex: 1 }}>
          {erPersonvern ? (
            <>
              <Section ikon="🏢" tittel="Behandlingsansvarlig">
                Barnehagehjelpen v/Joel Ingvoldstad er behandlingsansvarlig for personopplysninger som samles inn via denne tjenesten. Kontakt: <a href="mailto:Barnehagehjelpen@hotmail.com" style={{color:"#2c5b8e",fontWeight:700}}>Barnehagehjelpen@hotmail.com</a>
              </Section>
              <Section ikon="⚖️" tittel="Behandlingsgrunnlag (GDPR art. 6)">
                Behandlingen av dine personopplysninger er basert på <strong>samtykke</strong> (GDPR art. 6 nr. 1 bokstav a), som du gir ved registrering og aksept av disse vilkårene. Du kan trekke tilbake samtykket når som helst ved å slette kontoen din.
              </Section>
              <Section ikon="🛠" tittel="Databehandlere og tredjeparter">
                <p>Tjenesten benytter følgende tredjepartsleverandører som behandler data på vegne av oss:</p>
                <ul style={ulStil}>
                  <li><strong>Supabase Inc. (USA)</strong> – database, autentisering og fillagring. Dataoverføring til USA er sikret gjennom Standard Contractual Clauses (SCC).</li>
                  <li><strong>Cloudflare Inc. (USA)</strong> – nettverksbeskyttelse, DDoS-beskyttelse og ytelsesoptimalisering. Fungerer som nettverksproxy.</li>
                  <li><strong>Anthropic, PBC (USA)</strong> – AI-generering av pedagogisk innhold. Tekst du skriver inn i AI-assistenten sendes til Anthropic for behandling. Anthropic lagrer ikke input utover det som er nødvendig for svargenereringen. Se Anthropics personvernerklæring for detaljer.</li>
                </ul>
                <p style={{marginTop:8, fontSize:12, color:"#795548"}}>⚠️ Alle tre leverandører er amerikanske selskaper. Dataoverføringer er sikret gjennom EU-godkjente mekanismer (SCC/Privacy Framework), men du bør være oppmerksom på at data kan behandles utenfor EU/EØS.</p>
              </Section>
              <Section ikon="📂" tittel="Data som lagres">
                <ul style={ulStil}>
                  <li>E-postadresse og brukernavn (nødvendig for konto)</li>
                  <li>Telefonnummer (valgfritt)</li>
                  <li>Pedagogisk innhold du oppretter: ukeplaner, årsplaner, skjemaer, dokumentasjon, sanger og tegneark</li>
                  <li>Tidspunkt for samtykke til personvern og bruksvilkår</li>
                  <li>Tekniske logger ved feilsøking (midlertidig)</li>
                </ul>
              </Section>
              <Section ikon="🎯" tittel="Formål med lagringen">
                <ul style={ulStil}>
                  <li>Innlogging og autentisering</li>
                  <li>Lagring og synkronisering av pedagogisk innhold på tvers av enheter</li>
                  <li>AI-generering av innhold på brukerens forespørsel</li>
                  <li>Sikker drift og feilsøking</li>
                  <li>Dokumentasjon av samtykke (lovpålagt)</li>
                </ul>
              </Section>
              <Section ikon="⏱" tittel="Lagringstid">
                Personopplysninger og brukerinnhold lagres så lenge kontoen er aktiv. Ved sletting av konto slettes alle tilknyttede personopplysninger og brukerdata innen 30 dager. Tekniske logger slettes løpende.
              </Section>
              <Section ikon="👶" tittel="Særlig om barns personvern">
                <p style={{fontWeight:700, color:"#c62828", marginBottom:6}}>Viktig for barnehageansatte:</p>
                <p>Barnehagehjelpen er et verktøy for <strong>pedagogisk planlegging</strong> – ikke for lagring av personopplysninger om enkeltbarn. Barnehageloven §23 og GDPR stiller strenge krav til behandling av barns personopplysninger.</p>
                <ul style={ulStil}>
                  <li>Lagre <strong>ikke</strong> navn, fødselsdato, helseopplysninger eller andre personopplysninger om enkeltbarn i tjenesten</li>
                  <li>Last <strong>ikke</strong> opp bilder som identifiserer enkeltbarn</li>
                  <li>Barnehagen er selv behandlingsansvarlig for data de legger inn, og må sikre at bruken er i samsvar med barnehagens egne personvernrutiner</li>
                </ul>
              </Section>
              <Section ikon="⚖️" tittel="Dine rettigheter (GDPR)">
                <ul style={ulStil}>
                  <li><strong>Innsyn</strong> – be om kopi av alle opplysninger vi har om deg</li>
                  <li><strong>Retting</strong> – be om å få feilaktige opplysninger rettet</li>
                  <li><strong>Sletting</strong> – be om at kontoen og all data slettes («retten til å bli glemt»)</li>
                  <li><strong>Dataportabilitet</strong> – be om å få utlevert dine data i maskinlesbart format</li>
                  <li><strong>Innsigelse</strong> – protestere mot behandlingen av dine opplysninger</li>
                </ul>
                <p style={{marginTop:8}}>Send forespørsel til <a href="mailto:Barnehagehjelpen@hotmail.com" style={{color:"#2c5b8e",fontWeight:700}}>Barnehagehjelpen@hotmail.com</a>. Vi besvarer henvendelser innen 30 dager.</p>
              </Section>
              <Section ikon="🏛" tittel="Klagerett">
                Hvis du mener vi behandler personopplysningene dine i strid med personvernregelverket, har du rett til å klage til <strong>Datatilsynet</strong> (datatilsynet.no).
              </Section>
              <Section ikon="🔐" tittel="Sikkerhet">
                Passord lagres aldri i klartekst – Supabase Auth håndterer sikker hashing. All kommunikasjon er kryptert med HTTPS/TLS. Tilgang til data er begrenset via Row Level Security (RLS) i databasen.
              </Section>
            </>
          ) : (
            <>
              <Section ikon="✅" tittel="Om tjenesten">
                Barnehagehjelpen er et pedagogisk planleggingsverktøy for norske barnehageansatte. Tjenesten er utviklet i tråd med Rammeplan for barnehagen (2017) og skal brukes i samsvar med norsk lov, herunder barnehageloven, opplæringsloven og personvernregelverket (GDPR).
              </Section>
              <Section ikon="👤" tittel="Hvem kan bruke tjenesten">
                Tjenesten er forbeholdt <strong>voksne personer (18 år eller eldre)</strong> som er ansatt i eller jobber med norske barnehager. Tjenesten er ikke beregnet for direkte bruk av barn.
              </Section>
              <Section ikon="🛡" tittel="Beskyttelse av barns personvern">
                <p style={{fontWeight:700, color:"#c62828", marginBottom:6}}>Dette er ditt ansvar som ansatt:</p>
                <ul style={ulStil}>
                  <li>Lagre <strong>aldri</strong> navn, fødselsdato, helseopplysninger, bilder eller andre personopplysninger om enkeltbarn i tjenesten</li>
                  <li>Pedagogiske planer og dokumentasjon skal utformes uten identifiserbare opplysninger om enkeltbarn</li>
                  <li>Barnehagen er selv behandlingsansvarlig og må ha eget rettslig grunnlag for all behandling av barns personopplysninger</li>
                  <li>Taushetsplikten etter barnehageloven §23 gjelder for alt du skriver inn – del ikke sensitiv informasjon om barn eller familier</li>
                </ul>
              </Section>
              <Section ikon="👥" tittel="Ditt ansvar for innhold">
                <ul style={ulStil}>
                  <li>Du er ansvarlig for alt innhold du oppretter, lagrer og deler via tjenesten</li>
                  <li>Innhold du deler med kolleger via Samarbeid-funksjonen er ditt ansvar</li>
                  <li>Du skal ikke dele innloggingsopplysninger med andre</li>
                  <li>Ved bruk av AI-assistenten: ikke skriv inn personopplysninger om enkeltbarn i prompten</li>
                </ul>
              </Section>
              <Section ikon="🚫" tittel="Forbud mot misbruk">
                <p>Det er ikke tillatt å:</p>
                <ul style={ulStil}>
                  <li>Lagre personopplysninger om barn i strid med GDPR og barnehageloven</li>
                  <li>Laste opp eller distribuere bilder eller informasjon som kan identifisere enkeltbarn</li>
                  <li>Sende spam, massemeldinger eller uønsket innhold</li>
                  <li>Forsøke å få uautorisert tilgang til andres kontoer</li>
                  <li>Bruke automatiserte verktøy (bots, scrapers) uten tillatelse</li>
                  <li>Omgå sikkerhetstiltak</li>
                </ul>
              </Section>
              <Section ikon="⚠️" tittel="Konsekvenser ved misbruk">
                Brudd på disse vilkårene kan føre til at kontoen din begrenses, suspenderes eller slettes. Ved alvorlige brudd, særlig brudd på barns personvern, forbeholder vi oss retten til å rapportere forholdet til Datatilsynet eller annen relevant myndighet.
              </Section>
              <Section ikon="🏛" tittel="Gjeldende lov">
                Disse vilkårene er underlagt <strong>norsk lov</strong>. Tvister løses ved norske domstoler.
              </Section>
              <Section ikon="🔄" tittel="Endringer i vilkårene">
                Vi kan oppdatere disse vilkårene ved behov. Vesentlige endringer varsles via tjenesten. Fortsatt bruk etter varsling regnes som aksept av de nye vilkårene.
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #e8eff8", padding: "14px 24px",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onLukk}
            style={{
              background: "linear-gradient(135deg,#2c5b8e,#4178bd)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 24px", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "'Nunito',sans-serif",
            }}
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}

const ulStil = { paddingLeft: 18, marginTop: 6, lineHeight: 1.9 };

function Section({ ikon, tittel, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontWeight: 800, color: "#1a2c45", fontSize: 13,
        marginBottom: 6, display: "flex", alignItems: "center", gap: 7,
      }}>
        <span>{ikon}</span>{tittel}
      </div>
      <div style={{ fontSize: 12.5, color: "#3a4a5c", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  AUTH SCREEN – innlogging, registrering, glemt passord
// ═══════════════════════════════════════════
export default function AuthScreen({ onLoginSuccess }) {
  const [modus, setModus] = useState("login"); // login | register | glemt
  const [loading, setLoading] = useState(false);
  const [feil, setFeil] = useState("");
  const [suksess, setSuksess] = useState("");

  // Login
  const [li_epost, setLiEpost] = useState("");
  const [li_pw, setLiPw] = useState("");
  const [visPassord, setVisPassord] = useState(false);
  const [huskMeg, setHuskMeg] = useState(localStorage.getItem("bh_husk_meg") !== "false");

  // Register
  const [r_brukernavn, setRBrukernavn] = useState("");
  const [r_epost, setREpost] = useState("");
  const [r_telefon, setRTelefon] = useState("");
  const [r_passord, setRPassord] = useState("");
  const [r_passord2, setRPassord2] = useState("");

  // Modaler
  const [visModal, setVisModal] = useState(null); // "personvern" | "bruksvilkaar" | null

  // Vilkår-checkbox
  const [vilkaarAkseptert, setVilkaarAkseptert] = useState(false);

  // E-postbekreftelse
  const [bekreftEpostAdresse, setBekreftEpostAdresse] = useState(null);

  // Glemt passord
  const [g_epost, setGEpost] = useState("");

  const skiftModus = (m) => { setModus(m); setFeil(""); setSuksess(""); setBekreftEpostAdresse(null); };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setFeil(""); setSuksess("");
    if (!li_epost.trim()) { setFeil("E-postadresse er påkrevd"); return; }
    if (!/\S+@\S+\.\S+/.test(li_epost)) { setFeil("Skriv en gyldig e-postadresse"); return; }
    if (!li_pw) { setFeil("Passord er påkrevd"); return; }
    setLoading(true);
    try { localStorage.setItem("bh_husk_meg", huskMeg ? "true" : "false"); } catch {}
    try {
      const r = await loggInnBruker({ epost: li_epost, passord: li_pw });
      if (!r.ok) { setFeil(r.feil); return; }
      try { sessionStorage.setItem("bh_sesjon", "1"); } catch {}
      setSuksess("✅ Innlogget!");
      setTimeout(() => onLoginSuccess(r.bruker), 400);
    } catch (err) {
      setFeil("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    setFeil(""); setSuksess("");
    if (!vilkaarAkseptert) { setFeil("Du må godta personvernerklæringen og bruksvilkårene for å opprette konto"); return; }
    if (r_passord !== r_passord2) { setFeil("Passordene er ikke like"); return; }
    setLoading(true);
    try {
      const r = await registrerBruker({
        brukernavn: r_brukernavn, epost: r_epost,
        passord: r_passord, telefon: r_telefon,
      });
      if (!r.ok) { setFeil(r.feil); return; }
      if (r.bekreftEpost) { setBekreftEpostAdresse(r.epost); return; }
      setSuksess(r.bruker.admin ? "✅ Konto opprettet! Du er admin (første bruker)." : "✅ Konto opprettet!");
      setTimeout(() => onLoginSuccess(r.bruker), 700);
    } catch (err) {
      setFeil("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const handleGlemtPassord = async (e) => {
    e?.preventDefault?.();
    setFeil("");
    if (!g_epost.trim()) { setFeil("Skriv e-postadressen din"); return; }
    setLoading(true);
    try {
      const r = await sendTilbakestillEpost(g_epost);
      if (!r.ok) { setFeil(r.feil); return; }
      setSuksess("✅ E-post sendt! Sjekk innboksen for en lenke for å tilbakestille passordet.");
    } catch {
      setFeil("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const inputStil = {
    width: "100%", padding: "12px 13px", fontSize: 14,
    border: "1.5px solid #d8e6f5", borderRadius: 10,
    background: "#f5f9fd", color: "#1a2c45",
    fontFamily: "'Nunito',sans-serif", boxSizing: "border-box",
    marginBottom: 10,
  };
  const labelStil = { display: "block", fontWeight: 700, color: "#1a2c45", fontSize: 12, marginBottom: 4 };
  const knappStil = (akt) => ({
    width: "100%", padding: "13px", fontSize: 14, fontWeight: 800,
    background: akt ? "#ccc" : "linear-gradient(135deg,#2c5b8e,#4178bd)",
    color: "#fff", border: "none", borderRadius: 11,
    cursor: akt ? "wait" : "pointer", fontFamily: "'Nunito',sans-serif",
    marginTop: 4, boxShadow: "0 3px 9px rgba(44,91,142,0.25)",
  });

  return (
    <>
      {visModal && <VilkaarModal type={visModal} onLukk={() => setVisModal(null)} />}
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1f4068 0%,#3a72b0 50%,#6ba0d9 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 14px",fontFamily:"'Nunito',sans-serif"}}>
        <div style={{width:"100%",maxWidth:420}}>
          <div style={{textAlign:"center",marginBottom:22,color:"#fff"}}>
            <div style={{fontSize:46,marginBottom:6}}>🌿</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:28,lineHeight:1.1}}>Barnehagehjelpen</div>
            <div style={{fontSize:13,opacity:0.85,marginTop:5}}>Rammeplan 2017 – din pedagogiske medhjelper</div>
          </div>

          <div style={{background:"#fff",borderRadius:18,padding:22,boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
            {!bekreftEpostAdresse && modus !== "glemt" && (
              <div style={{display:"flex",background:"#e8eff8",borderRadius:11,padding:4,marginBottom:18}}>
                <button onClick={()=>skiftModus("login")} type="button"
                  style={{flex:1,padding:"9px",background:modus==="login"?"#fff":"transparent",border:"none",borderRadius:8,fontSize:13,fontWeight:800,color:modus==="login"?"#2c5b8e":"#5d7390",cursor:"pointer",boxShadow:modus==="login"?"0 1px 4px rgba(0,0,0,0.08)":"none",fontFamily:"'Nunito',sans-serif"}}>
                  🔑 Logg inn
                </button>
                <button onClick={()=>skiftModus("register")} type="button"
                  style={{flex:1,padding:"9px",background:modus==="register"?"#fff":"transparent",border:"none",borderRadius:8,fontSize:13,fontWeight:800,color:modus==="register"?"#2c5b8e":"#5d7390",cursor:"pointer",boxShadow:modus==="register"?"0 1px 4px rgba(0,0,0,0.08)":"none",fontFamily:"'Nunito',sans-serif"}}>
                  ✨ Ny konto
                </button>
              </div>
            )}

            {!bekreftEpostAdresse && modus === "glemt" && (
              <div style={{marginBottom:14}}>
                <button onClick={()=>skiftModus("login")} type="button"
                  style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:12,cursor:"pointer",fontWeight:700,padding:0}}>
                  ← Tilbake til innlogging
                </button>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1a2c45",marginTop:8}}>🔓 Glemt passord</div>
              </div>
            )}

            {!bekreftEpostAdresse && feil && (
              <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 12px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>
                ⚠️ {feil}
              </div>
            )}
            {!bekreftEpostAdresse && suksess && (
              <div className="fade" style={{background:"#d8f3dc",color:"#1b5e47",padding:"10px 12px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #2d6a4f"}}>
                {suksess}
              </div>
            )}

            {/* E-POSTBEKREFTELSE */}
            {bekreftEpostAdresse && (
              <div style={{textAlign:"center",padding:"8px 4px 4px"}}>
                <div style={{
                  width:70,height:70,borderRadius:"50%",
                  background:"linear-gradient(135deg,#c8f5d0,#a3e6b2)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  margin:"0 auto 16px",fontSize:34,
                  boxShadow:"0 4px 18px rgba(45,106,79,0.22)",
                }}>✅</div>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"#1b5e47",marginBottom:6}}>
                  Verifisering sendt!
                </div>
                <p style={{fontSize:13.5,color:"#2a3a4c",lineHeight:1.7,marginBottom:6}}>
                  Vi har sendt en bekreftelseslenke til e-postadressen din:
                </p>
                <div style={{
                  background:"#f0f7ff",border:"1.5px solid #c3d9f5",
                  borderRadius:9,padding:"8px 14px",fontSize:13,
                  fontWeight:800,color:"#2c5b8e",marginBottom:14,wordBreak:"break-all",
                }}>
                  {bekreftEpostAdresse}
                </div>
                <div style={{
                  background:"#f0faf2",border:"1.5px solid #b7e4c7",
                  borderRadius:11,padding:"13px 15px",marginBottom:20,textAlign:"left",
                }}>
                  <p style={{fontSize:13,color:"#1b5e47",lineHeight:1.8,margin:0,fontWeight:700}}>
                    Slik aktiverer du kontoen:
                  </p>
                  <p style={{fontSize:13,color:"#3a4a5c",lineHeight:1.8,margin:"6px 0 0"}}>
                    1. Sjekk innboksen din<br/>
                    2. Åpne e-posten fra Barnehagehjelpen<br/>
                    3. Trykk på bekreftelseslenken for å aktivere kontoen
                  </p>
                  <p style={{fontSize:12,color:"#5d7390",marginTop:8,marginBottom:0}}>
                    Finner du ikke e-posten? Sjekk spam/søppelpost-mappen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => skiftModus("login")}
                  style={{
                    width:"100%",padding:"12px",fontSize:14,fontWeight:800,
                    background:"linear-gradient(135deg,#2c5b8e,#4178bd)",
                    color:"#fff",border:"none",borderRadius:11,cursor:"pointer",
                    fontFamily:"'Nunito',sans-serif",
                    boxShadow:"0 3px 9px rgba(44,91,142,0.25)",
                  }}
                >
                  🔑 Gå til innlogging
                </button>
              </div>
            )}

            {/* LOGIN */}
            {!bekreftEpostAdresse && modus === "login" && (
              <form onSubmit={handleLogin}>
                <label style={labelStil}>E-postadresse</label>
                <input type="email" value={li_epost} onChange={e=>setLiEpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" required />
                <label style={labelStil}>Passord</label>
                <div style={{position:"relative"}}>
                  <input type={visPassord?"text":"password"} value={li_pw} onChange={e=>setLiPw(e.target.value)} style={{...inputStil,paddingRight:60}} autoComplete="current-password" placeholder="••••••••" required />
                  <button type="button" aria-label={visPassord?"Skjul passord":"Vis passord"} onClick={()=>setVisPassord(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:"#5d7390",fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>
                    {visPassord?"Skjul":"Vis"}
                  </button>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#3a4a5c",fontWeight:600,marginBottom:14,cursor:"pointer",userSelect:"none"}}>
                  <input type="checkbox" checked={huskMeg} onChange={e=>setHuskMeg(e.target.checked)}
                    style={{width:16,height:16,accentColor:"#2c5b8e",cursor:"pointer"}} />
                  Husk meg på denne enheten
                </label>
                <button type="submit" disabled={loading} style={knappStil(loading)}>
                  {loading?"🔐 Logger inn ...":"🔑 Logg inn"}
                </button>
                <div style={{textAlign:"center",marginTop:14}}>
                  <button type="button" onClick={()=>skiftModus("glemt")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:12,cursor:"pointer",fontWeight:700,textDecoration:"underline"}}>
                    Glemt passord?
                  </button>
                </div>
                <div style={{textAlign:"center",marginTop:10}}>
                  <a href={supportMailto()} style={{color:"#8898ad",fontSize:11,fontWeight:600,textDecoration:"none"}}>
                    📧 Kontakt support
                  </a>
                </div>
              </form>
            )}

            {/* REGISTRER */}
            {!bekreftEpostAdresse && modus === "register" && (
              <form onSubmit={handleRegister}>
                <label style={labelStil}>Brukernavn (min. 3 tegn)</label>
                <input type="text" value={r_brukernavn} onChange={e=>setRBrukernavn(e.target.value)} style={inputStil} autoComplete="username" placeholder="kari_barnehagelaerer" required minLength={3} />
                <label style={labelStil}>E-postadresse</label>
                <input type="email" value={r_epost} onChange={e=>setREpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" required />
                <label style={labelStil}>Telefonnummer <span style={{color:"#8898ad",fontWeight:600,fontSize:10}}>(valgfritt)</span></label>
                <input type="tel" value={r_telefon} onChange={e=>setRTelefon(e.target.value)} style={inputStil} autoComplete="tel" placeholder="+47 123 45 678" inputMode="tel" />
                <label style={labelStil}>Passord (min. 6 tegn)</label>
                <div style={{position:"relative"}}>
                  <input type={visPassord?"text":"password"} value={r_passord} onChange={e=>setRPassord(e.target.value)} style={{...inputStil,paddingRight:60}} autoComplete="new-password" placeholder="••••••••" required minLength={6} />
                  <button type="button" aria-label={visPassord?"Skjul passord":"Vis passord"} onClick={()=>setVisPassord(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:"#5d7390",fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>
                    {visPassord?"Skjul":"Vis"}
                  </button>
                </div>
                <label style={labelStil}>Bekreft passord</label>
                <input type={visPassord?"text":"password"} value={r_passord2} onChange={e=>setRPassord2(e.target.value)} style={inputStil} autoComplete="new-password" placeholder="••••••••" required minLength={6} />

                {/* Vilkår-samtykke */}
                <div style={{
                  background: vilkaarAkseptert ? "#f0f7ff" : "#f8f9fc",
                  border: `1.5px solid ${vilkaarAkseptert ? "#4178bd" : "#d8e6f5"}`,
                  borderRadius: 10, padding: "12px 14px", marginBottom: 14, marginTop: 4,
                  transition: "border-color 0.2s, background 0.2s",
                }}>
                  <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",userSelect:"none"}}>
                    <input
                      type="checkbox"
                      checked={vilkaarAkseptert}
                      onChange={e => setVilkaarAkseptert(e.target.checked)}
                      style={{width:17,height:17,accentColor:"#2c5b8e",cursor:"pointer",marginTop:1,flexShrink:0}}
                    />
                    <span style={{fontSize:12.5,color:"#2a3a4c",fontWeight:600,lineHeight:1.6}}>
                      Jeg har lest og godtar{" "}
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setVisModal("personvern"); }}
                        style={{
                          background:"none",border:"none",padding:0,
                          color:"#2c5b8e",fontWeight:800,fontSize:12.5,
                          cursor:"pointer",textDecoration:"underline",
                          fontFamily:"'Nunito',sans-serif",
                        }}
                      >
                        personvernerklæringen
                      </button>
                      {" "}og{" "}
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setVisModal("bruksvilkaar"); }}
                        style={{
                          background:"none",border:"none",padding:0,
                          color:"#2c5b8e",fontWeight:800,fontSize:12.5,
                          cursor:"pointer",textDecoration:"underline",
                          fontFamily:"'Nunito',sans-serif",
                        }}
                      >
                        bruksvilkårene
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button type="submit" disabled={loading || !vilkaarAkseptert} style={{
                  ...knappStil(loading),
                  opacity: (!loading && !vilkaarAkseptert) ? 0.5 : undefined,
                }}>
                  {loading?"✨ Oppretter konto ...":"✨ Opprett konto"}
                </button>
                <div style={{fontSize:11,color:"#5d7390",textAlign:"center",marginTop:12,lineHeight:1.5}}>
                  Konto opprettes i Supabase Auth – data synkroniseres mellom enheter.
                </div>
              </form>
            )}

            {/* GLEMT PASSORD */}
            {!bekreftEpostAdresse && modus === "glemt" && (
              <form onSubmit={handleGlemtPassord}>
                <p style={{fontSize:12,color:"#5d7390",marginBottom:12,lineHeight:1.6}}>
                  Skriv e-postadressen din, så sender vi en lenke for å tilbakestille passordet.
                </p>
                <label style={labelStil}>E-postadresse</label>
                <input type="email" value={g_epost} onChange={e=>setGEpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" />
                <button type="submit" disabled={loading} style={knappStil(loading)}>
                  {loading?"Sender ...":"📧 Send tilbakestillingslenke"}
                </button>
              </form>
            )}
          </div>

          <div style={{textAlign:"center",marginTop:18,color:"rgba(255,255,255,0.85)",fontSize:11,lineHeight:1.6}}>
            🔒 Sikret med Supabase Auth<br/>
            Første registrerte bruker blir automatisk admin
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  ADMIN PANEL – kun for admin-brukere
// ═══════════════════════════════════════════
export function AdminPanel({ aktivBruker }) {
  const [brukere, setBrukere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [bekreftSlett, setBekreftSlett] = useState(null);  // id på bruker som skal bekreftes slettet

  const visM = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""), 3000); };

  const last = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("user_profiles").select("*").order("created_at");
      setBrukere(data || []);
    } catch (e) {
      console.error("Admin: feil ved lasting av brukere:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { last(); }, []);

  const slettBruker = async (id) => {
    if (id === aktivBruker?.id) { visM("⚠️ Kan ikke slette deg selv"); return; }
    setBekreftSlett(id);
  };

  const utforSletting = async () => {
    if (!bekreftSlett) return;
    const { error } = await supabase.from("user_profiles").delete().eq("id", bekreftSlett);
    setBekreftSlett(null);
    if (error) { visM("⚠️ Sletting feilet: " + error.message); return; }
    visM("✅ Brukerprofil slettet – husk å slette auth-kontoen i Supabase Dashboard");
    last();
  };

  const settAdmin = async (id, verdi) => {
    const { error } = await supabase.from("user_profiles").update({ is_admin: verdi }).eq("id", id);
    if (error) { visM("⚠️ Oppdatering feilet: " + error.message); return; }
    visM(verdi?"✅ Gjort til admin":"✅ Fjernet admin-rettigheter");
    last();
  };

  return (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"#1a2c45",marginBottom:3}}>👑 Admin-panel</div>
      <p style={{color:"#5d7390",fontSize:12,marginBottom:14}}>Administrer brukerkontoer ({brukere.length} totalt)</p>
      {feedback && <div className="fade" style={{marginBottom:12,background:"#d8e6f5",borderRadius:8,padding:"9px 13px",color:"#2c5b8e",fontWeight:700,fontSize:12}}>{feedback}</div>}
      {loading && <div style={{padding:18,textAlign:"center",color:"#5d7390"}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>}
      {!loading && brukere.length === 0 && <div style={{padding:18,textAlign:"center",color:"#5d7390"}}>Ingen brukere</div>}
      {!loading && brukere.map(u => (
        <div key={u.id} style={{background:C.lg2,borderRadius:12,padding:"13px 15px",marginBottom:9,boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
            <div>
              <div style={{fontWeight:800,color:"#1a2c45",fontSize:14}}>{u.brukernavn} {u.is_admin&&<span style={{background:"#fff9c4",color:"#795548",borderRadius:8,padding:"1px 7px",fontSize:9,marginLeft:5,fontWeight:800}}>👑 ADMIN</span>}{u.id===aktivBruker.id&&<span style={{background:"#d8f3dc",color:"#1b5e47",borderRadius:8,padding:"1px 7px",fontSize:9,marginLeft:5,fontWeight:800}}>DU</span>}</div>
              <div style={{fontSize:11,color:"#5d7390",marginTop:2}}>📧 {u.epost}</div>
              <div style={{fontSize:10,color:"#5d7390",marginTop:2}}>📅 Opprettet: {u.created_at ? new Date(u.created_at).toLocaleDateString("no-NO") : "–"}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            {u.id !== aktivBruker.id && (
              <>
                <button onClick={()=>settAdmin(u.id, !u.is_admin)} style={{background:"#e8eff8",color:"#2c5b8e",padding:"5px 10px",fontSize:11,border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>
                  {u.is_admin?"Fjern admin":"Gjør til admin"}
                </button>
                <button onClick={()=>slettBruker(u.id)} style={{background:"#fdecea",color:"#c62828",padding:"5px 10px",fontSize:11,border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>
                  🗑 Slett
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      <div style={{background:"#fff8e1",borderRadius:10,padding:"10px 12px",fontSize:11,color:"#795548",borderLeft:"4px solid #f4a261",marginTop:14,lineHeight:1.6}}>
        <strong>⚠️ Viktig om sletting:</strong> «Slett»-knappen fjerner brukerprofilen og all data, men selve innloggingskontoen (e-post + passord) lever videre i Supabase Auth. For å hindre brukeren i å logge inn igjen må du også slette auth-kontoen i <strong>Supabase Dashboard → Authentication → Users</strong>.
      </div>
      <div style={{background:"#e8f5e9",borderRadius:10,padding:"10px 12px",fontSize:11,color:"#2e7d32",borderLeft:"4px solid #52b788",marginTop:8,lineHeight:1.6}}>
        <strong>ℹ️ Om data:</strong> Alle brukerdata lagres sikkert i skyen via Supabase og er tilgjengelig på alle enheter. Passord håndteres av Supabase Auth og lagres aldri i klartekst.
      </div>

      {/* Bekreftelses-modal for sletting (fungerer der confirm() er blokkert) */}
      {bekreftSlett && (() => {
        const brukerSomSlettes = brukere.find(u => u.id === bekreftSlett);
        return (
          <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBekreftSlett(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:22,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#c62828",marginBottom:10}}>🗑 Slette bruker?</div>
              <p style={{fontSize:13,color:"#1a2c45",lineHeight:1.6,marginBottom:8}}>
                Vil du slette <strong>{brukerSomSlettes?.brukernavn || "denne brukeren"}</strong>? All profildata og innhold slettes permanent.
              </p>
              <p style={{fontSize:11,color:"#795548",lineHeight:1.6,marginBottom:16,background:"#fff8e1",borderRadius:7,padding:"8px 10px"}}>
                ⚠️ Innloggingskontoen slettes <strong>ikke</strong> automatisk. Gå til Supabase Dashboard → Authentication → Users for å blokkere tilgang helt.
              </p>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setBekreftSlett(null)} style={{flex:1,padding:"11px",background:"#e8eff8",color:"#1a2c45",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                <button onClick={utforSletting} style={{flex:1,padding:"11px",background:"#c62828",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


// ═══════════════════════════════════════════
//  AKTIVITETSKORT – Lag eget kort (modal)
// ═══════════════════════════════════════════




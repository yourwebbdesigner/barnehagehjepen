import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";
import { FAGOMRADER } from './data/rammeplan.js';
import { SANGER } from './data/sanger.js';
import { AKTIVITETER } from './data/aktiviteter.js';
import { TEGNEARK } from './data/tegneark.jsx';
import { ALDER_GRUPPER, ARSTID_HOYTID, VANSKELIGHET, INNHOLDSTYPER, SAMLING_MAL, PROSJEKT_MAL, UKEPLAN_MAL, BARNEHAGE_SYSTEM, AI_EKSEMPLER } from './data/ai-data.js';

import { C } from './utils.js';
function byggPrompt({ type, fagomrade, alder, arstid, vanskelighet, brukertekst, alleFagomrader }) {
  const fag = FAGOMRADER.find(f=>f.id===fagomrade);
  const ald = ALDER_GRUPPER.find(a=>a.id===alder);
  const ars = ARSTID_HOYTID.find(a=>a.id===arstid);
  const van = VANSKELIGHET.find(v=>v.id===vanskelighet);
  const inntype = INNHOLDSTYPER.find(i=>i.id===type);

  // Alle valgte fagområder (for flerfaglig støtte)
  const valgteFag = (alleFagomrader && alleFagomrader.length > 0)
    ? alleFagomrader.map(id => FAGOMRADER.find(f=>f.id===id)).filter(Boolean)
    : (fag ? [fag] : []);

  // user-meldingen inneholder det spesifikke oppdraget (varierer per forespørsel)
  let sys = `═══ OPPDRAG ═══\nDu skal lage: ${inntype?.navn || type}\nBeskrivelse: ${inntype?.beskrivelse || ""}\n\n`;

  if (valgteFag.length > 1) {
    sys += `═══ VALGTE FAGOMRÅDER (${valgteFag.length} stk.) ═══\n`;
    valgteFag.forEach(f => {
      sys += `\n▸ ${f.ikon} ${f.navn}\n`;
      sys += `  Rammeplanen: ${f.innhold.slice(0,200)}...\n`;
      sys += `  Mål for barna: ${f.malBarna.slice(0,3).join(" • ")}\n`;
      sys += `  Progresjon: ${f.progresjon}\n`;
    });
    sys += `\nKoble innholdet tydelig til alle ${valgteFag.length} fagområdene ovenfor.\n\n`;
  } else if (fag && fagomrade !== "alle") {
    sys += `═══ FAGOMRÅDE: ${fag.navn} ${fag.ikon} ═══\n`;
    sys += `Hva rammeplanen sier: ${fag.innhold}\n`;
    sys += `Mål for barna: ${fag.malBarna.join(" • ")}\n`;
    sys += `Arbeidsmåter: ${fag.arbeidsmater.join(", ")}\n`;
    sys += `Progresjon: ${fag.progresjon}\n\n`;
  } else if (fagomrade === "alle") {
    sys += `═══ TVERRFAGLIG (alle 7 fagområder) ═══\n`;
    FAGOMRADER.forEach(f => {
      sys += `${f.ikon} ${f.navn}: ${f.malBarna.slice(0,2).join("; ")}\n`;
    });
    sys += `\nKoble innholdet til minst 3 fagområder fra listen ovenfor.\n\n`;
  }
  if (ald) {
    sys += `═══ ALDER: ${ald.navn} ═══\nFokus: ${ald.fokus}\nTilpass språk, tidslengde og kompleksitet til denne alderen.\n\n`;
  }
  if (ars && arstid !== "ingen") sys += `═══ ÅRSTID/HØYTID: ${ars.navn} ═══\nMåneder: ${ars.maaneder}. Motiver: ${ars.motiv}.\n\n`;
  if (van) sys += `═══ VANSKELIGHETSGRAD: ${van.navn} ═══\n${van.beskrivelse}\n\n`;
  // Type-spesifikke instruksjoner
  const formater = {
    aktivitet: `Bruk ALLTID denne strukturen (markdown-format, kompakt og punktvis):\n\n## 🎯 Aktivitet\nKort, tydelig tittel og beskrivelse (1-2 linjer).\n\n## 🏷️ Fagområder\n• [fagområde fra rammeplanen]\n• [fagområde]\n\n## 📦 Du trenger\n• [materiale 1]\n• [materiale 2]\n• [materiale 3]\n\n## ⚙️ Gjennomføring\n\n### 1. Forberedelse\nKort og konkret.\n\n### 2. Aktivitet\nKort og konkret.\n\n### 3. Samtale og refleksjon\nKort og konkret.\n\n## 💬 Samtalespørsmål\n• [åpent spørsmål]\n• [åpent spørsmål]\n• [åpent spørsmål]\n\n## ❓ Pedagogisk hensikt\n1-2 linjer: hva barna erfarer og hvorfor aktiviteten er verdifull.\n\n## 📖 Rammeplan 2017\n### [emoji + fagområdenavn]\n• [relevant punkt fra rammeplanen]\n• [relevant punkt]`,
    samling: `Bruk dette formatet (kort og direkte – maks 200 ord totalt):\n📌 TITTEL\n🏷️ FAGOMRÅDER: [navngi relevante fagområder]\n🌅 ÅPNING (2-3 linjer)\n🎯 HOVEDDEL (3-5 konkrete steg)\n🌙 AVSLUTNING (1-2 linjer)\n💬 ETT SAMTALE-SPØRSMÅL`,
    sang: `Lag en ORIGINAL sang/regle. Format (maks 150 ord):\n🎵 TITTEL\n🏷️ FAGOMRÅDER: [relevante fagområder]\n🎼 MELODI: [melodiforslag]\n📝 TEKST: [2-3 vers eller en regle]\n💃 BEVEGELSER: [1-2 linjer]`,
    tegneark: `Format (maks 200 ord):\n🖍️ TITTEL\n🏷️ FAGOMRÅDER: [relevante fagområder]\n🎨 MOTIV: [kort beskrivelse]\n📝 TEGNEOPPGAVE: [1-2 linjer]\n💬 SAMTALE (3 åpne spørsmål)`,
    prosjekt: `Format (maks 250 ord):\n📚 PROSJEKTTITTEL\n🏷️ FAGOMRÅDER: [relevante fagområder]\n⏱️ VARIGHET\nUKE 1–2: [fokus]\nUKE 3–4: [fokus]\n👶 BARNAS MEDVIRKNING: [1-2 linjer]\n📸 DOKUMENTASJON: [1 linje]`,
    ukeplan: `Format:\n📅 UKETEMA\n🏷️ FAGOMRÅDER: [relevante fagområder]\nMAN: [aktivitet]\nTIR: [aktivitet]\nONS: [aktivitet]\nTOR: [aktivitet]\nFRE: [aktivitet]\n💬 SAMLINGSTEMA`,
    manedsplan: `Format (maks 250 ord):\n🗓️ MÅNEDSTEMA\n🏷️ FAGOMRÅDER: [alle relevante fagområder]\nUKE 1: [tema og aktivitet]\nUKE 2: [tema og aktivitet]\nUKE 3: [tema og aktivitet]\nUKE 4: [tema og aktivitet]\n🎉 MARKERINGER: [hvis aktuelt]`,
    arsplan: `Lag en pedagogisk årsplan. Format:\n📆 OVERORDNET TEMA FOR ÅRET\n🎯 PEDAGOGISK GRUNNSYN (kort, knyttet til rammeplanen)\n🌿 SATSNINGSOMRÅDER (2-3 hovedområder fra fagområdene)\n\n📅 ÅRSHJUL (måned for måned):\nAUGUST – tilvenning og bli kjent\nSEPTEMBER – tema og fokus\nOKTOBER – tema og fokus\nNOVEMBER – tema og fokus\nDESEMBER – jul og advent\nJANUAR – tema og fokus\nFEBRUAR – tema og fokus\nMARS – tema og fokus\nAPRIL – tema og fokus (påske)\nMAI – tema og fokus (17. mai)\nJUNI – tema og fokus, sommeravslutning\n\n🤝 SAMARBEID HJEM-BARNEHAGE\n📊 VURDERING OG DOKUMENTASJON\n🎓 OVERGANGER (tilvenning, til skole)\n💡 NOTAT TIL PERSONALET`,
    manedsbrev: `Lag et månedsbrev til foreldre. Varmt, konkret og inviterende språk. Format:\n✉️ MÅNED OG ÅR\n💝 HILSEN (kort åpning)\n\n🌟 DETTE HAR VI GJORT (3-5 høydepunkter fra måneden, konkrete fortellinger uten å nevne enkeltbarn)\n\n📚 PEDAGOGISK FOKUS (fagområder vi har jobbet med, knyttet til rammeplanen)\n\n📅 DETTE SKJER FREMOVER (kommende uker)\n\n📌 PRAKTISK INFO (klær, husk på, viktige datoer)\n\n💬 SAMTALETIPS (hva kan dere snakke med barna deres om hjemme?)\n\n🙏 AVSLUTNING (takk, ønske god måned)`,
    samtale: `Lag 5-7 åpne, filosofiske eller undrende spørsmål. Format:\n💬 TEMA\n🎯 RAMMEPLAN-MÅL\n👶 ALDER\n1. [spørsmål]\n2. [spørsmål]\n...\n✨ VEILEDNING TIL VOKSNE (hvordan lede samtalen, lytte aktivt, ikke vurdere svar)`,
    fritekst: `Svar konkret, praktisk og fagligt. Strukturer svaret med overskrifter og kulepunkter når det passer.`,
  };
  sys += `═══ FORMAT FOR SVARET ═══\n${formater[type] || formater.fritekst}\n\n`;
  sys += `═══ KRAV ═══\n• Kortfattet og direkte – følg ordgrensene i formatet\n• Konkret og praktisk – kan brukes i morgen uten videre bearbeiding\n• Norsk bokmål, varmt og profesjonelt språk\n• Spørsmål til barn: åpne og undrende, aldri ja/nei-spørsmål\n• I gjennomføringsstegene: beskriv kun hva personalet gjør konkret\n\n`;
  if (brukertekst && brukertekst.trim()) sys += `═══ BRUKERENS EKSTRA ØNSKE ═══\n${brukertekst.trim()}\n\n`;
  sys += `Lever et komplett, brukbart svar nå.`;
  return { system: BARNEHAGE_SYSTEM, user: sys };
}

// Fallback-generator: bygger et innholdsrikt svar fra databasen når AI ikke svarer
function fallbackInnhold({ type, fagomrade, alder, arstid, vanskelighet }) {
  const fag = FAGOMRADER.find(f=>f.id===fagomrade);
  const ars = ARSTID_HOYTID.find(a=>a.id===arstid);
  const ald = ALDER_GRUPPER.find(a=>a.id===alder);
  const fagNavn = fag ? `${fag.ikon} ${fag.navn}` : "🌿 Tverrfaglig";
  const fagId = fagomrade && fagomrade !== "alle" ? fagomrade : "natur";
  const arstidNavn = ars && arstid !== "ingen" ? ars.navn : "";
  const aldNavn = ald?.navn || "Hele gruppa";

  if (type === "samling") {
    const liste = SAMLING_MAL[fagId] || SAMLING_MAL.natur;
    const m = liste[Math.floor(Math.random()*liste.length)];
    return `📌 ${m.tittel}${arstidNavn?" – "+arstidNavn:""}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}${fag?": "+fag.malBarna.slice(0,2).join("; "):""}\n\n👶 ALDER: ${aldNavn}\n⏱️ VARIGHET: ${m.varighet}\n\n🌅 ÅPNING\n${m.apning}\n\n🎯 HOVEDDEL\n${m.hoved}\n\n🌙 AVSLUTNING\n${m.avslutning}\n\n💬 SAMTALE-SPØRSMÅL\n• Hva likte du best?\n• Hva tenkte du på underveis?\n• Hva vil du vi skal gjøre neste gang?\n\n✨ VOKSENROLLEN\nVær til stede, lytt, still åpne spørsmål, gi alle barn taletid.`;
  }

  if (type === "prosjekt") {
    const liste = PROSJEKT_MAL[fagId] || PROSJEKT_MAL.natur;
    const p = liste[0];
    return `📚 PROSJEKT: ${p.tittel}${arstidNavn?" ("+arstidNavn+")":""}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}: ${p.mal}\n\n👶 ALDER: ${aldNavn}\n⏱️ VARIGHET: ${p.varighet}\n\n📋 UKE-FOR-UKE PLAN\n${p.faser.map(f=>"• "+f).join("\n")}\n\n👶 BARNAS MEDVIRKNING\nLa barna komme med ideer i hver fase. Bruk barnas spørsmål som drivkraft. Endre kursen hvis barnas interesse går en annen vei.\n\n📦 MATERIELL\nSamles underveis ut fra hva prosjektet utvikler seg til. Voksne forbereder hovedmateriale før hver uke.\n\n📸 DOKUMENTASJON\nFoto, lydopptak, sitater fra barna, tegninger. Heng opp i barnehagen og del med foreldre ukentlig.`;
  }

  if (type === "ukeplan") {
    const u = UKEPLAN_MAL[arstid] || UKEPLAN_MAL.ingen;
    return `📅 UKEPLAN: ${u.tema}${arstidNavn?" – "+arstidNavn:""}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}\n\n👶 ALDER: ${aldNavn}\n\nMANDAG: ${u.mandag}\nTIRSDAG: ${u.tirsdag}\nONSDAG: ${u.onsdag}\nTORSDAG: ${u.torsdag}\nFREDAG: ${u.fredag}\n\n💬 SAMLINGSSTUND-TEMA\nKnytt opp mot ukens tema hver dag.\n\n📝 NOTAT TIL PERSONALET\nVær fleksibel – la barnas interesser styre detaljene. Dokumenter underveis med foto og sitater. Bruk garderoben og turene aktivt.`;
  }

  if (type === "manedsplan") {
    const u = UKEPLAN_MAL[arstid] || UKEPLAN_MAL.ingen;
    return `🗓️ MÅNEDSTEMA: ${u.tema}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}${fag?": "+fag.malBarna.slice(0,3).join("; "):""}\n\n👶 ALDER: ${aldNavn}\n\nUKE 1: ${u.mandag} (intro-aktivitet)\nUKE 2: ${u.tirsdag} (utforsking)\nUKE 3: ${u.onsdag} (skapende arbeid)\nUKE 4: ${u.torsdag} (avslutning og deling)\n\n📚 BØKER OG SANGER\nVelg 2-3 bøker og 3-4 sanger som passer temaet. Repeter dem gjennom hele måneden.\n\n🎉 HØYTID/MARKERINGER\n${arstidNavn || "Tilpass etter kalenderen"}\n\n📸 DOKUMENTASJON\nUkentlig oppdatering på vegg eller digital tavle. Månedsbrev til foreldrene med bilder og barnas sitater.`;
  }

  if (type === "aktivitet") {
    const matching = AKTIVITETER.filter(a=>!fag||a.rammeplan?.includes(fagomrade));
    const a = matching[Math.floor(Math.random()*matching.length)] || AKTIVITETER[0];
    return `📌 ${a.tittel}${arstidNavn?" – "+arstidNavn:""}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}\nHensikt: ${a.hensikt||"Læring gjennom lek og utforsking"}\n\n👶 ALDER: ${a.alder||aldNavn}\n⏱️ VARIGHET: ${a.tid||"20-30 min"}\n\n📦 MATERIALER\n${a.materialer||"Tilpass etter tilgjengelige ressurser"}\n\n📝 SLIK GJØR DU\n${a.hvordan||"Tilrettelegg, presenter for barna, la dem utforske, oppsummer sammen."}\n\n💬 SAMTALE MED BARNA\n• Hva tror dere skjer?\n• Hva la du merke til?\n• Hva vil du prøve neste gang?\n\n✨ TIPS\nTilpass tempo og kompleksitet til den aktuelle barnegruppen. La barna ta initiativ.`;
  }

  if (type === "tegneark") {
    const matching = TEGNEARK.filter(t=>!fag||t.rammeplan?.includes(fagomrade));
    const t = matching[Math.floor(Math.random()*matching.length)] || TEGNEARK[0];
    return `🖍️ ${t.tittel}${arstidNavn?" ("+arstidNavn+")":""}\n\n🎯 RAMMEPLAN-MÅL\n${fagNavn}: ${t.mal}\n\n👶 ALDER: ${t.alder}\n\n📝 TEGNEOPPGAVE\n${t.oppgave}\n\n💬 SAMTALE-SPØRSMÅL\n${t.samtale}\n\n✨ UTVIDELSE\n• La barna lage egne tegninger fritt etterpå\n• Heng tegningene opp på veggen og lag en utstilling\n• Bruk tegningene som utgangspunkt for fortelling`;
  }

  if (type === "sang") {
    const matching = SANGER.filter(s=>!fag||s.rammeplan?.includes(fagomrade));
    const s = matching[Math.floor(Math.random()*matching.length)] || SANGER[0];
    return `🎵 ${s.tittel}\n\n🎼 MELODI: ${s.melodi}\n👶 ALDER: ${s.alder}\n🎯 RAMMEPLAN: ${fagNavn}\n\n📝 TEKST\n${s.tekst}\n\n💃 BEVEGELSER OG TIPS\n${s.tips}`;
  }

  if (type === "samtale") {
    const sporsmal = {
      kommunikasjon: ["Hva er en god venn?","Hvilket ord liker du best?","Hva er det fineste du har hørt?","Hva betyr det å lytte?"],
      kropp: ["Hva er kroppen din god til?","Hvilken mat smaker best?","Hvorfor må vi sove?","Hva gjør deg sterk?"],
      kunst: ["Hva er vakkert?","Hvilken farge føles glad ut?","Kan en sang være trist?","Hva vil du lage?"],
      natur: ["Hvor kommer regnet fra?","Hva tenker en sommerfugl?","Hvor sover dyrene om natten?","Hva er det rareste i naturen?"],
      antall: ["Hva er stort?","Kan man telle skyer?","Hva er forskjell på mange og noen?","Hvor langt er langt?"],
      etikk: ["Hva er rettferdig?","Når er det ok å si nei?","Hvordan vet vi hva som er riktig?","Hva er en hemmelighet?"],
      naermiljo: ["Hvem bor i nabolaget vårt?","Hva er hjem?","Hvor er du fra?","Hvem hjelper oss?"],
    };
    const liste = sporsmal[fagId] || sporsmal.etikk;
    return `💬 SAMTALESPØRSMÅL\n\n🎯 RAMMEPLAN: ${fagNavn}\n👶 ALDER: ${aldNavn}\n\n${liste.map((q,i)=>`${i+1}. ${q}`).join("\n")}\n\n✨ VEILEDNING TIL VOKSNE\n• Sett dere i ring og tenn et lys\n• Still ett spørsmål av gangen\n• La barna tenke før de svarer\n• Aldri korriger eller vurder svarene\n• Speile det barna sier: "Du tenker at..."\n• Avslutt med å samle trådene`;
  }

  // fritekst eller ukjent
  return `🌿 INNHOLD KNYTTET TIL RAMMEPLANEN\n\n🎯 FAGOMRÅDE: ${fagNavn}\n👶 ALDER: ${aldNavn}\n${arstidNavn?"🍂 ÅRSTID: "+arstidNavn+"\n":""}\n${fag?"📖 OM FAGOMRÅDET\n"+fag.innhold+"\n\n":""}${fag?"🎯 MÅL FOR BARNA\n"+fag.malBarna.map(m=>"• "+m).join("\n")+"\n\n":""}${fag?"📝 ARBEIDSMÅTER\n"+fag.arbeidsmater.slice(0,5).map(m=>"• "+m).join("\n")+"\n\n":""}${fag?"💡 KONKRETE EKSEMPLER\n"+fag.eksempler.map(e=>"• "+e).join("\n"):""}\n\nDette er hentet fra databasen. Prøv igjen for et helt nytt AI-generert svar.`;
}


// Delt tekst-renderer: håndterer ##/### overskrifter, punktlister og nummererte steg
function renderInline(tekst) {
  const deler = tekst.split(/(\*\*[^*\n]+\*\*)/g);
  if (deler.length === 1) return tekst;
  return deler.map((d, i) =>
    d.startsWith("**") && d.endsWith("**")
      ? <strong key={i} style={{fontWeight:800}}>{d.slice(2,-2)}</strong>
      : d
  );
}

export function RenderTekst({ tekst }) {
  if (!tekst) return null;
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"var(--c-t, #1a2c45)"}}>
      {tekst.split("\n").map((l, i) => {
        const t = l.trim();
        if (!t) return <div key={i} style={{height:4}}/>;
        if (t.startsWith("## ")) return <div key={i} style={{fontWeight:800,color:"#fff",background:"#2c5b8e",fontSize:11,marginTop:i===0?0:12,marginBottom:4,padding:"4px 9px",borderRadius:6,display:"inline-block"}}>{renderInline(t.slice(3))}</div>;
        if (t.startsWith("### ")) return <div key={i} style={{fontWeight:700,color:"#2c5b8e",fontSize:12,marginTop:8,marginBottom:3,borderLeft:"3px solid #2c5b8e",paddingLeft:7}}>{renderInline(t.slice(4))}</div>;
        if (/^[-•*]\s/.test(t)) return <div key={i} style={{display:"flex",gap:6,marginBottom:3,paddingLeft:6,lineHeight:1.5}}><span style={{color:"#2d7d4f",fontWeight:700,flexShrink:0}}>•</span><span>{renderInline(t.replace(/^[-•*]\s*/,""))}</span></div>;
        if (/^\d+[.)]\s/.test(t)) {
          const nr = t.match(/^\d+/)[0];
          return <div key={i} style={{display:"flex",gap:8,marginBottom:5,alignItems:"flex-start"}}><span style={{background:"#2c5b8e",color:"#fff",borderRadius:"50%",minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:2}}>{nr}</span><span style={{lineHeight:1.55}}>{renderInline(t.replace(/^\d+[.)]\s*/,""))}</span></div>;
        }
        return <div key={i} style={{lineHeight:1.6,marginBottom:2,paddingLeft:2}}>{renderInline(t)}</div>;
      })}
    </div>
  );
}

// Hjelper: finn relevante eksempler basert på brukerens valg
function relevanteEksempler({ type, fagomrade, alder, arstid }, maks=4) {
  const liste = AI_EKSEMPLER[type] || [];
  // Støtt både string (gammelt) og array (nytt) for fagomrade
  const fagArr = Array.isArray(fagomrade) ? fagomrade : [fagomrade];
  const harAlle = fagArr.includes("alle") || fagArr.length === 0;
  // Score: jo flere match, jo høyere score
  const scored = liste.map(e => {
    let score = 0;
    if (fagArr.includes(e.fag)) score += 3;
    if (e.fag === "alle" && harAlle) score += 2;
    if (e.alder === alder) score += 2;
    if (arstid && arstid !== "ingen" && e.arstid === arstid) score += 3;
    if (!e.arstid && (!arstid || arstid === "ingen")) score += 0.5;
    return { ...e, score };
  });
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, maks);
}

// Standalone AI component — keeps its own state so typing doesn't unmount the textarea
export default function AiSideComp({ onLagreSomSkjema, initialType, clearInitialType }) {
  const [type, setType] = useState(initialType || "aktivitet");
  const [fagomrade, setFagomrade] = useState(["alle"]);
  const [alder, setAlder] = useState("3-4");
  const [arstid, setArstid] = useState("ingen");
  const [vanskelighet, setVanskelighet] = useState("middels");
  const [brukertekst, setBrukertekst] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultat, setAiResultat] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiVisFilter, setAiVisFilter] = useState(true);
  const [lagringsTittel, setLagringsTittel] = useState("");
  const [aiCooldown, setAiCooldown] = useState(false);

  // Hvis parent sender initialType (f.eks. fra hurtigknapp på Hjem), oppdater type og nullstill prop
  useEffect(() => {
    if (initialType) {
      setType(initialType);
      setAiResultat("");
      setAiVisFilter(true);
      setLagringsTittel("");
      if (clearInitialType) clearInitialType();
    }
  }, [initialType, clearInitialType]);

  // Trekk ut tittel automatisk når AI-svar kommer inn
  useEffect(() => {
    if (!aiResultat) { setLagringsTittel(""); return; }
    const linje1 = aiResultat.split("\n").find(l => l.trim()) || "";
    const eksTittel = linje1.replace(/^[^\p{L}\p{N}]+/u, "").slice(0, 80);
    setLagringsTittel(eksTittel);
  }, [aiResultat]);

  const visMelding = (m) => { setAiFeedback(m); setTimeout(()=>setAiFeedback(""), 3000); };

  const genAI = async () => {
    setAiLoading(true); setAiResultat(""); setAiFeedback(""); setLagringsTittel("");

    // Konverter fagomrade-array til parametere som passer eksisterende prompt-bygging.
    // Primær = første valgte (eller "alle" hvis ingen). Ekstra = de andre valgte fagområdene
    // som sendes som ekstra kontekst i brukertekst.
    const fagListe = Array.isArray(fagomrade) ? fagomrade : [fagomrade];
    const rensetFag = fagListe.filter(f => f && f !== "alle");
    let primaerFag, ekstraFagTekst = "";
    if (rensetFag.length === 0) {
      primaerFag = "alle";
    } else if (rensetFag.length === 1) {
      primaerFag = rensetFag[0];
    } else if (rensetFag.length <= 3) {
      primaerFag = rensetFag[0];
      const fagNavn = rensetFag.map(id => FAGOMRADER.find(f => f.id === id)?.navn.split(",")[0]).filter(Boolean);
      ekstraFagTekst = `Kombiner følgende fagområder fra rammeplanen: ${fagNavn.join(", ")}. `;
    } else {
      primaerFag = "alle";
      ekstraFagTekst = `Tverrfaglig innhold (${rensetFag.length} fagområder valgt). `;
    }

    const utvidetBrukertekst = ekstraFagTekst + (brukertekst || "");
    const params = { type, fagomrade: primaerFag, alder, arstid, vanskelighet, brukertekst: utvidetBrukertekst, alleFagomrader: rensetFag };
    const { system: aiSystem, user: aiPrompt } = byggPrompt(params);
    const fallback = fallbackInnhold(params);

    // Token-grenser tilpasset 29s server-timeout (redusert for å unngå timeout)
    const tokenMap = { aktivitet:1500, prosjekt:1800, arsplan:2000, manedsplan:1500, ukeplan:1200 };
    const ønsketTokens = tokenMap[type] || 1400;

    const AI_ENDPOINT = (typeof window !== "undefined" && window.__BH_AI_ENDPOINT) || "/api/ai";
    const BRUK_BACKEND = AI_ENDPOINT !== "https://api.anthropic.com/v1/messages";

    // Bygg request basert på endpoint-type – sender system separat for bedre kvalitet og caching
    const requestBody = BRUK_BACKEND
      ? { system: aiSystem, prompt: aiPrompt, max_tokens: ønsketTokens }
      : {
          model: "claude-sonnet-4-6",
          max_tokens: ønsketTokens,
          system: aiSystem,
          messages: [{ role: "user", content: aiPrompt }],
        };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Hjelpefunksjon: ett forsøk
    const forsok = async () => {
      const r = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      if (!r.ok) {
        const status = r.status;
        let detalj = "";
        try { detalj = (await r.text()).slice(0, 200); } catch (_) {}
        const err = new Error(`HTTP ${status}${detalj ? ": " + detalj : ""}`);
        err.status = status;
        err.transient = status >= 500 || status === 429;
        throw err;
      }
      return r.json();
    };

    let resultat = null;
    let feilGrunn = "";
    try {
      let data;
      try {
        data = await forsok();
      } catch (e1) {
        const erNettverk = e1.name === "TypeError" || e1.message?.includes("Failed to fetch");
        // Kun retry ved ekte nettverksfeil – ikke ved 504 server-timeout (dobler ventetiden unødvendig)
        if (erNettverk) {
          await new Promise(r => setTimeout(r, 600));
          data = await forsok();
        } else {
          throw e1;
        }
      }

      let tekst = "";
      if (typeof data?.text === "string") {
        tekst = data.text.trim();
      } else if (Array.isArray(data?.content)) {
        tekst = data.content.map(b => b.text || "").join("\n").trim();
      }

      if (tekst && tekst.length > 20) {
        resultat = tekst;
      } else {
        resultat = fallback;
        feilGrunn = "AI ga tomt svar";
      }
    } catch (e) {
      resultat = fallback;
      if (e.name === "AbortError") feilGrunn = "AI-tidsavbrudd";
      else if (e.status === 401 || e.status === 403) feilGrunn = "Manglende API-tilgang";
      else if (e.status === 429) feilGrunn = "For mange forespørsler – prøv igjen";
      else if (e.status >= 500) feilGrunn = "AI-tjeneste utilgjengelig";
      else if (e.name === "TypeError") feilGrunn = "Nettverksfeil";
      else feilGrunn = "AI-feil";
      console.warn("[AI-generering feilet]", { feilGrunn, error: e });
    } finally {
      clearTimeout(timeoutId);
      setAiResultat(resultat);
      if (feilGrunn) {
        visMelding(`ℹ️ Brukte database (${feilGrunn})`);
      } else {
        visMelding("✅ Generert med AI");
      }
      setAiLoading(false);
      setAiVisFilter(false);
      setAiCooldown(true);
      setTimeout(() => setAiCooldown(false), 3000);
    }
  };

  const kopierResultat = async () => {
    try {
      await navigator.clipboard.writeText(aiResultat);
      visMelding("✅ Kopiert til utklippstavlen!");
    } catch {
      visMelding("❌ Kopiering støttes ikke i denne nettleseren");
    }
  };

  const nullstill = () => { setAiResultat(""); setAiVisFilter(true); setLagringsTittel(""); };

  // Hurtigtips som setter filtrene direkte
  const presets = [
    { l:"Vår-aktivitet for treåringer", icon:"🌸", v:{type:"aktivitet",fagomrade:"natur",alder:"3-4",arstid:"vaar",vanskelighet:"enkel"} },
    { l:"Samling om vennskap", icon:"💝", v:{type:"samling",fagomrade:"etikk",alder:"4-5",arstid:"ingen",vanskelighet:"middels"} },
    { l:"Juleukeplan", icon:"🎄", v:{type:"ukeplan",fagomrade:"alle",alder:"alle",arstid:"jul",vanskelighet:"middels"} },
    { l:"Naturprosjekt 4 uker", icon:"🌿", v:{type:"prosjekt",fagomrade:"natur",alder:"4-5",arstid:"host",vanskelighet:"avansert"} },
    { l:"Sang om dyr", icon:"🎵", v:{type:"sang",fagomrade:"natur",alder:"2-3",arstid:"ingen",vanskelighet:"enkel"} },
    { l:"Filosofisk samtale", icon:"💬", v:{type:"samtale",fagomrade:"etikk",alder:"5-6",arstid:"ingen",vanskelighet:"avansert"} },
    { l:"Tegneark om sommeren", icon:"🖍️", v:{type:"tegneark",fagomrade:"natur",alder:"3-4",arstid:"sommer",vanskelighet:"enkel"} },
    { l:"Månedsplan for høsten", icon:"📋", v:{type:"manedsplan",fagomrade:"alle",alder:"alle",arstid:"host",vanskelighet:"middels"} },
  ];
  const brukPreset = (p) => {
    setType(p.v.type); setFagomrade([p.v.fagomrade]); setAlder(p.v.alder);
    setArstid(p.v.arstid); setVanskelighet(p.v.vanskelighet);
    visMelding("✨ Filter satt – trykk Generer");
  };

  // Komponent for en velgerrad
  const Velger = ({ label, value, options, onChange }) => (
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontWeight:700,color:C.t,fontSize:11,marginBottom:5}}>{label}</label>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:3,marginLeft:-2,marginRight:-2,paddingLeft:2,paddingRight:2}}>
        <div style={{display:"flex",gap:6,flexWrap:"nowrap",width:"max-content"}}>
          {options.map(o=>(
            <button key={o.id} type="button" className="btn" onClick={()=>onChange(o.id)}
              style={{padding:"6px 11px",fontSize:11,background:value===o.id?C.g:C.lg2,color:value===o.id?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
              {o.ikon?o.ikon+" ":""}{o.navn||o.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🤖 AI-assistent</h1>
      <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Lager innhold forankret i Rammeplanen 2017 – velg type, alder og fagområde</p>

      {aiFeedback && <div className="fade" style={{marginBottom:12,background:C.mint,borderRadius:8,padding:"9px 13px",color:C.g,fontWeight:700,fontSize:12}}>{aiFeedback}</div>}

      {aiVisFilter && (
        <div style={{background:C.w,borderRadius:15,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:14}}>
          {/* HURTIGKNAPPER FOR TYPE */}
          <label style={{display:"block",fontWeight:700,color:C.t,fontSize:11,marginBottom:7}}>📝 Hva vil du lage?</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(95px, 1fr))",gap:6,marginBottom:14}}>
            {INNHOLDSTYPER.map(t=>(
              <button key={t.id} type="button" onClick={()=>setType(t.id)}
                title={t.beskrivelse}
                style={{
                  padding:"10px 6px",
                  fontSize:11,
                  background:type===t.id?"linear-gradient(135deg, #2c5b8e, #4178bd)":C.lg2,
                  color:type===t.id?"#fff":C.t,
                  border:type===t.id?"2px solid #2c5b8e":`2px solid var(--c-divider)`,
                  borderRadius:10,
                  cursor:"pointer",
                  fontFamily:"'Nunito',sans-serif",
                  fontWeight:type===t.id?800:700,
                  textAlign:"center",
                  transition:"all 0.15s",
                  boxShadow:type===t.id?"0 2px 8px rgba(44,91,142,0.2)":"none",
                }}>
                <div style={{fontSize:18,marginBottom:2}}>{t.ikon}</div>
                <div style={{lineHeight:1.2}}>{t.navn}</div>
              </button>
            ))}
          </div>

          {/* FAGOMRÅDE — multi-select med togglekard */}
          <label style={{display:"block",fontWeight:700,color:C.t,fontSize:11,marginBottom:7}}>🌿 Fagområde <span style={{color:"#8898ad",fontWeight:600}}>(velg en eller flere)</span></label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
            {[{id:"alle",navn:"Alle (tverrfaglig)",ikon:"🌈",farge:"#5d7390",lys:"#e8eff8"},...FAGOMRADER.map(f=>({id:f.id,navn:f.navn.split(",")[0],ikon:f.ikon,farge:f.farge,lys:f.lys}))].map(f => {
              const aktiv = fagomrade.includes(f.id);
              return (
                <button key={f.id} type="button" onClick={() => {
                  if (f.id === "alle") {
                    // Velger "Alle" → fjern alle andre, sett kun "alle"
                    setFagomrade(["alle"]);
                  } else if (aktiv) {
                    // Slå av denne; hvis ingen igjen, fall tilbake til "alle"
                    const ny = fagomrade.filter(x => x !== f.id);
                    setFagomrade(ny.length === 0 ? ["alle"] : ny);
                  } else {
                    // Slå på denne; fjern "alle" hvis den var med
                    setFagomrade([...fagomrade.filter(x => x !== "alle"), f.id]);
                  }
                }} style={{
                  padding:"9px 10px",
                  fontSize:11,
                  background: aktiv ? f.lys : "#f5f9fd",
                  color: aktiv ? f.farge : C.t,
                  border: aktiv ? `2px solid ${f.farge}` : "2px solid #e8eff8",
                  borderRadius:9,
                  cursor:"pointer",
                  fontFamily:"'Nunito',sans-serif",
                  textAlign:"left",
                  fontWeight: aktiv ? 800 : 700,
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  transition:"all 0.15s",
                }}>
                  <span style={{flexShrink:0}}>{f.ikon}</span>
                  <span style={{flex:1,lineHeight:1.2}}>{f.navn}</span>
                  {aktiv && <span style={{fontSize:10,color:f.farge,flexShrink:0}}>✓</span>}
                </button>
              );
            })}
          </div>

          <Velger label="👶 Alder" value={alder} options={ALDER_GRUPPER.map(a=>({id:a.id,navn:a.navn}))} onChange={setAlder} />
          <Velger label="🍂 Årstid eller høytid" value={arstid} options={ARSTID_HOYTID.map(a=>({id:a.id,navn:a.navn}))} onChange={setArstid} />
          <Velger label="📊 Vanskelighetsgrad" value={vanskelighet} options={VANSKELIGHET.map(v=>({id:v.id,navn:v.navn}))} onChange={setVanskelighet} />

          {/* EKSEMPLER – dynamisk basert på valg */}
          {(() => {
            const eksempler = relevanteEksempler({ type, fagomrade, alder, arstid }, 4);
            if (eksempler.length === 0) return null;
            return (
              <div style={{marginTop:6,marginBottom:10}}>
                <div style={{fontWeight:700,color:C.t,fontSize:11,marginBottom:7}}>💡 Forslag (klikk for å fylle inn)</div>
                <div style={{display:"grid",gap:6}}>
                  {eksempler.map((e,i)=>(
                    <button key={i} type="button" onClick={()=>setBrukertekst(e.tekst)} className="hover"
                      style={{
                        padding:"9px 12px",
                        fontSize:12,
                        background:C.lg2,
                        color:C.t,
                        border:`1px solid var(--c-divider)`,
                        borderRadius:9,
                        cursor:"pointer",
                        fontFamily:"'Nunito',sans-serif",
                        textAlign:"left",
                        lineHeight:1.4,
                        display:"flex",
                        alignItems:"center",
                        gap:8,
                      }}>
                      <span style={{flexShrink:0,opacity:0.6}}>✨</span>
                      <span style={{flex:1}}>{e.tekst}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <label style={{display:"block",fontWeight:700,color:C.t,fontSize:11,marginBottom:5,marginTop:6}}>✏️ Ekstra ønsker (valgfritt)</label>
          <textarea value={brukertekst} onChange={e=>setBrukertekst(e.target.value)} placeholder="F.eks: 'kobles til bok om Skomakeren', 'med vannlek', 'utendørs'"
            rows={2} style={{width:"100%",border:"1.5px solid #d8e6f5",borderRadius:9,padding:"9px 12px",fontSize:13,color:C.t,background:"#f5f9fd",resize:"vertical",marginBottom:11,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}/>
          <button className="btn" onClick={genAI} disabled={aiLoading || aiCooldown}
            style={{background:(aiLoading||aiCooldown)?"#ccc":C.g,color:"#fff",padding:"12px 18px",fontSize:14,width:"100%",border:"none",borderRadius:10,cursor:(aiLoading||aiCooldown)?"not-allowed":"pointer",fontWeight:800,fontFamily:"'Nunito',sans-serif",transition:"background 0.2s"}}>
            {aiLoading?"🤔 Genererer …":aiCooldown?"✅ Ferdig – klar om et øyeblikk…":"✨ Generer med AI"}
          </button>
        </div>
      )}

      {aiLoading && (
        <div style={{textAlign:"center",padding:30,background:C.w,borderRadius:12,marginBottom:14}}>
          <div className="spin" style={{margin:"0 auto 12px"}}/>
          <div style={{color:C.gr,fontSize:13,fontWeight:700}}>AI lager noe pedagogisk for deg …</div>
          <div style={{color:C.gr,fontSize:11,marginTop:5}}>Tar vanligvis 3–8 sek. Henter fra database automatisk om AI er treg.</div>
        </div>
      )}

      {aiResultat && !aiLoading && (
        <div className="fade" style={{background:C.w,borderRadius:13,padding:16,boxShadow:"0 2px 10px rgba(44,91,142,0.09)",marginBottom:14}}>
          {onLagreSomSkjema && (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:C.g,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Navn på skjema</div>
              <input type="text" value={lagringsTittel} onChange={e=>setLagringsTittel(e.target.value)}
                placeholder="Gi aktiviteten et navn før lagring"
                style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.mint}`,borderRadius:9,fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.t,boxSizing:"border-box"}} />
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,gap:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t}}>✨ Resultat</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {onLagreSomSkjema && (
                <button className="btn" onClick={()=>{
                  const tittel = lagringsTittel.trim() || (INNHOLDSTYPER.find(t=>t.id===type)?.navn || "Plan") + " fra AI";
                  const valgtType = INNHOLDSTYPER.find(t=>t.id===type);

                  // Smart parsing: del AI-teksten i seksjoner basert på vanlige overskrifter
                  // Strategi: finn linjer som ser ut som overskrifter, og samle linjene under dem.
                  // Hver overskrift mappes til hva / hvordan / hvorfor / materialer.
                  const linjer = aiResultat.split("\n");
                  const seksjoner = { hva:[], hvordan:[], hvorfor:[], materialer:[], annet:[] };
                  let aktivBucket = "annet"; // alt som ikke kjennes igjen havner her

                  // Overskrift = enten (a) starter med emoji + caps-ord, eller (b) er ren ALL-CAPS.
                  // Bullets, nummererte steg og vanlige setninger skal IKKE matche.
                  const erOverskrift = (l) => {
                    const trimmed = l.trim();
                    if (!trimmed) return false;
                    if (trimmed.length > 80) return false;
                    // Hopp over bullets og nummererte steg
                    if (/^[-•*]\s/.test(trimmed)) return false;
                    if (/^\d+[.):]\s/.test(trimmed)) return false;

                    // (a) Starter med ikke-bokstav (emoji etc), så et caps-ord rett etter
                    const emojiMatch = trimmed.match(/^[^A-Za-zÆØÅæøå0-9]+([A-ZÆØÅ][A-Za-zÆØÅæøå0-9\s\-/&,.():]{1,60})$/);
                    if (emojiMatch) return true;

                    // (b) Ren ALL-CAPS-overskrift (minst 2 store bokstaver, kun caps/tall/mellomrom/tegn)
                    if (/^[A-ZÆØÅ][A-ZÆØÅ0-9\s\-/&,.():]{2,}$/.test(trimmed)) return true;

                    return false;
                  };

                  const klassifiser = (overskrift) => {
                    // VEILEDNING TIL VOKSNE / VOKSENROLLEN er praktisk gjennomføring, ikke begrunnelse
                    if (/VEILEDNING.*VOKSNE|VOKSENROLLE|TIL PERSONALET|VOKSNES ROLLE/i.test(overskrift)) return "hvordan";
                    // HVORDAN-seksjoner – gjennomføring, steg, ukeplan-dager
                    if (/GJENNOMFØR|FREMGANGS|FORBERED|SLIK GJØR|HVORDAN|TRINN|FRAMGANG|SAMLING|FORLØP|UKE\s*\d|VARIGHET|TID|ÅPNING|HOVEDDEL|AVSLUTNING|BEVEGELSE|TEGNEOPPGAVE/i.test(overskrift)) return "hvordan";
                    // HVORFOR / mål / begrunnelse
                    if (/M[ÅA]L|RAMMEPLAN|BEGRUNNELSE|HVORFOR|FORMÅL|FAGOMR[ÅA]DE|PEDAGOGISK|UTBYTTE|L[ÆE]RING/i.test(overskrift)) return "hvorfor";
                    // Materialer
                    if (/MATERIELL|UTSTYR|MATERIALER|TRENGER|UTSTYRSLISTE/i.test(overskrift)) return "materialer";
                    // Hva / tittel / motiv / tema – disse beskriver selve aktiviteten
                    if (/MOTIV|TEMA|HVA|AKTIVITET|OPPGAVE|TITTEL|BESKRIVELSE|SAMTALE|SP[ØO]RSM[ÅA]L|TIPS|VARIASJON|TEKST/i.test(overskrift)) return "hva";
                    return "annet";
                  };

                  // Filter for å droppe metadata-linjer som ikke skal med i innholdet
                  // (disse vises uansett via skjemaets egne metadata-felter)
                  const erMetadataLinje = (l) => {
                    const t = l.trim();
                    return /^[^A-Za-zÆØÅæøå]*ALDER\s*:/i.test(t)
                        || /^[^A-Za-zÆØÅæøå]*RAMMEPLAN(\s*-\s*M[ÅA]L)?\s*:/i.test(t)
                        || /^[^A-Za-zÆØÅæøå]*VARIGHET\s*:/i.test(t)
                        || /^[^A-Za-zÆØÅæøå]*ÅRSTID\s*:/i.test(t)
                        || /^[^A-Za-zÆØÅæøå]*FAGOMR[ÅA]DE\s*:/i.test(t);
                  };

                  // Sjekk: linja ser ut som et nummerert steg (1. ..., 2. ...) eller bullet med tall
                  const erNummerertSteg = (l) => /^\s*\d+[.):]\s+\S/.test(l);
                  let harSettOverskrift = false;

                  linjer.forEach((l, i) => {
                    if (i === 0) return; // første linje er tittelen, hopp over
                    if (erMetadataLinje(l)) return; // hopp over metadata-linjer som "ALDER:", "RAMMEPLAN:"
                    if (erOverskrift(l)) {
                      // En overskrift med kun "ALDER" eller "RAMMEPLAN-MÅL" (men ingen mål-tekst etterpå)
                      // er metadata; skipp hvis det er et enkelt-ords metadata-felt
                      const overskriftRen = l.trim().replace(/^[^A-Za-zÆØÅæøå]+/, "").toUpperCase();
                      if (/^(ALDER|VARIGHET|ÅRSTID)$/.test(overskriftRen)) {
                        aktivBucket = "annet"; // disse linjenes innhold blir hoppet over neste runde
                        return;
                      }
                      aktivBucket = klassifiser(l);
                      harSettOverskrift = true;
                      seksjoner[aktivBucket].push(l);
                    } else if (!harSettOverskrift && erNummerertSteg(l)) {
                      // Hvis vi ser nummererte steg før noen overskrift, anta at det er hvordan
                      aktivBucket = "hvordan";
                      seksjoner.hvordan.push(l);
                    } else {
                      seksjoner[aktivBucket].push(l);
                    }
                  });

                  // Rydd opp: trim tomme linjer i hver bucket
                  const rensk = (arr) => arr.join("\n").trim().replace(/\n{3,}/g, "\n\n");
                  let hva = rensk(seksjoner.hva);
                  let hvordan = rensk(seksjoner.hvordan);
                  let hvorfor = rensk(seksjoner.hvorfor);
                  let materialer = rensk(seksjoner.materialer);
                  const annet = rensk(seksjoner.annet);

                  // Hvis parsing ikke fant noe meningsfullt, fall tilbake til hele teksten i hva
                  const tomtResultat = !hva && !hvordan && !hvorfor && !materialer;
                  if (tomtResultat) {
                    hva = aiResultat;
                    hvorfor = "";
                  } else {
                    // Legg "annet"-innhold på slutten av hva hvis det finnes
                    if (annet) hva = hva ? (hva + "\n\n" + annet) : annet;
                  }

                  // Legg til kort rammeplan-referanse
                  const valgteFagIder = Array.isArray(fagomrade) ? fagomrade.filter(f => f !== "alle") : (fagomrade !== "alle" ? [fagomrade] : []);
                  const rammeplanTekst = (() => {
                    if (valgteFagIder.length === 0) return "";
                    return valgteFagIder.map(fid => {
                      const f = FAGOMRADER.find(x => x.id === fid);
                      if (!f) return "";
                      return `${f.ikon} ${f.navn}\n${f.malBarna.slice(0, 2).map(m => "• " + m).join("\n")}`;
                    }).filter(Boolean).join("\n\n");
                  })();

                  // Sett sammen endelig hvorfor: AI-mål øverst, så rammeplan-kontekst, så metadata
                  const aldNavn = ALDER_GRUPPER.find(a => a.id === alder)?.navn || alder;
                  const arsNavn = (typeof ARSTID_HOYTID !== "undefined" && arstid && arstid !== "ingen")
                    ? (ARSTID_HOYTID.find(a => a.id === arstid)?.navn || "")
                    : "";
                  const metadataLinjer = [
                    `📅 Generert: ${new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" })}`,
                    `👶 Aldersgruppe: ${aldNavn}`,
                  ];
                  if (arsNavn) metadataLinjer.push(`🍂 Årstid/høytid: ${arsNavn}`);
                  metadataLinjer.push(`📝 Innholdstype: ${valgtType?.navn || "Plan"}`);

                  const hvorforDeler = [];
                  if (hvorfor && hvorfor.trim()) hvorforDeler.push(hvorfor.trim());
                  if (rammeplanTekst) hvorforDeler.push("📖 Rammeplan 2017\n" + rammeplanTekst);
                  hvorforDeler.push(metadataLinjer.join("\n"));
                  const hvorforEndelig = hvorforDeler.join("\n\n");

                  onLagreSomSkjema({
                    tittel: tittel || `${valgtType?.navn || "Plan"} fra AI`,
                    hva,
                    hvordan,
                    hvorfor: hvorforEndelig,
                    rammeplan: valgteFagIder,
                    alder: aldNavn,
                    kategori: valgtType?.navn || "Plan",
                    materialer,
                  });
                }} style={{background:"#e3f2fd",color:"#1565c0",padding:"6px 11px",fontSize:11,border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>💾 Lagre</button>
              )}
              <button className="btn" onClick={kopierResultat} style={{background:C.mint,color:C.g,padding:"6px 11px",fontSize:11,border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>📋 Kopier</button>
              <button className="btn" onClick={nullstill} style={{background:"#e8eff8",color:C.t,padding:"6px 11px",fontSize:11,border:"none",borderRadius:7,cursor:"pointer",fontWeight:700}}>🔄 Ny</button>
            </div>
          </div>
          <RenderTekst tekst={aiResultat} />
        </div>
      )}

      {aiVisFilter && (
        <>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:9}}>⚡ Hurtigvalg</div>
          <div style={{display:"grid",gap:7,marginBottom:14}}>
            {presets.map((p,i)=>(
              <div key={i} className="hover" onClick={()=>brukPreset(p)}
                style={{background:C.w,borderRadius:10,padding:"10px 13px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontSize:16,marginRight:7}}>{p.icon}</span><span style={{fontSize:12,fontWeight:700,color:C.t}}>{p.l}</span></div>
                <span style={{color:C.g,fontSize:14,marginLeft:7,flexShrink:0}}>↗</span>
              </div>
            ))}
          </div>
          <div style={{background:C.lg2,borderRadius:10,padding:"10px 12px",fontSize:11,color:C.t,borderLeft:"4px solid var(--c-g)"}}>
            <strong>💡 Tips:</strong> AI-en bruker Rammeplan 2017 og tilpasser etter alder og fagområde. Hvis nettet er tregt, henter vi automatisk fra databasen så du alltid får et svar.
          </div>
        </>
      )}
    </div>
  );
}



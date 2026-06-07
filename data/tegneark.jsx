// Pedagogisk tegneoppgavebibliotek – Rammeplanens 7 fagområder
// Tegneark-bilder lagres som PNG-filer i /public/tegneark/01.png – 21.png
// Generer bilder med AI (Adobe Firefly, DALL-E etc.) og legg dem i mappen

import { useState } from 'react';

// Kategorifarger for kortbakgrunner i TegnearkSide
export const TEGNEKAT_FARGER = {
  kst:  "#fffde7",
  kbmh: "#fce4ec",
  kkk:  "#f3e5f5",
  nmt:  "#e8f5e9",
  arf:  "#ede7f6",
  erf:  "#fff9c4",
  ns:   "#e0f7fa",
};

// Placeholder vist når bilde ikke er lastet inn ennå
export const SvgPlaceholder = ({ tittel }) => (
  <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="12" width="276" height="216" rx="16" stroke="#c4d6ec" strokeWidth="2.5" strokeDasharray="10 5"/>
    <text x="150" y="104" textAnchor="middle" fontSize="36" fontFamily="Arial,sans-serif" fill="#d0e2f0">🖼️</text>
    <text x="150" y="134" textAnchor="middle" fontSize="12" fontFamily="Arial,sans-serif" fill="#9ab5d0">Bilde lastes inn...</text>
    {tittel && (
      <text x="150" y="154" textAnchor="middle" fontSize="11" fontFamily="Arial,sans-serif" fill="#b0c8de">{tittel}</text>
    )}
  </svg>
);

// Sprite-komponent for fagområde-oversiktsbilder fra fagomrader.png
// Bildet er 4 paneler bred (øverste rad) og 3 paneler bred (nederste rad)
// Panel 0-3: øvre rad (KST, KBMH, ERF, NS), Panel 4-6: nedre rad (KKK, NMT, ARF)
const TegnearkFagSprite = ({ panel, tittel }) => {
  const [err, setErr] = useState(false);
  const isTop = panel < 4;
  const col  = isTop ? panel : panel - 4;
  const cols = isTop ? 4 : 3;
  const bgSizeX = cols * 100;
  const bgPosX  = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const bgPosY  = isTop ? 0 : 100;

  if (err) return <SvgPlaceholder tittel={tittel} />;
  return (
    <div style={{ position:"relative", width:"100%", paddingBottom:"100%", borderRadius:6, overflow:"hidden" }}>
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('/tegneark/fagomrader.png')",
        backgroundSize:`${bgSizeX}% 200%`,
        backgroundPosition:`${bgPosX}% ${bgPosY}%`,
        backgroundRepeat:"no-repeat",
      }}
        onError={() => setErr(true)}
      />
    </div>
  );
};

// Tegneark-bilde – viser PNG fra /public/tegneark/
// Bruker SvgPlaceholder som fallback dersom bildet ikke finnes ennå
// ═══════════════════════════════════════════
//  TEGNEARK – 7 fagområder
// ═══════════════════════════════════════════
export const TEGNEARK = [
  // ── Fagområde-oversiktsbilder (fra fagomrader.png) ──────────────────
  {id:22, tittel:"Samlingsstund og eventyr", ikon:"📚", kategori:"kst", alder:"2-6 år", rammeplan:["kommunikasjon"],
   svg: <TegnearkFagSprite panel={0} tittel="Samlingsstund og eventyr"/>,
   oppgave:"1. Farg læreren og barna i lesekroken med fargerike klær. 2. Skriv eller tegn din favorittfortelling i snakkeboblen. 3. Tegn ditt favorittdyr fra et eventyr. 4. Tegn hva som skjer videre i historien.",
   samtale:"Hva er din favorittfortelling? Hvem er din favorittkarakter? Hva er forskjellen på et eventyr og en sann historie?",
   mal:"Språklig og narrativ kompetanse. Rammeplanen KST: oppleve glede ved høytlesing, fortelling og bruk av skriftspråk i meningsfylte sammenhenger."},

  {id:23, tittel:"Lek og bevegelse ute", ikon:"🏃", kategori:"kbmh", alder:"1-6 år", rammeplan:["kropp"],
   svg: <TegnearkFagSprite panel={1} tittel="Lek og bevegelse ute"/>,
   oppgave:"1. Farg barna i fargerike klær og sko. 2. Farg lekeplassutstyret i klare farger. 3. Tegn deg selv lekende på plassen. 4. Tegn hva slags vær det er over barna.",
   samtale:"Hva er din favorittlek ute? Hvilke muskler bruker du når du klatrer? Hva er forskjellen på rask og langsom bevegelse?",
   mal:"Motorisk utvikling og glede ved frilek. Rammeplanen KBMH: oppleve mestring gjennom allsidig bevegelse, bruke utemiljøet aktivt."},

  {id:24, tittel:"Dele og bry seg om hverandre", ikon:"🤝", kategori:"erf", alder:"2-6 år", rammeplan:["etikk"],
   svg: <TegnearkFagSprite panel={2} tittel="Dele og bry seg om hverandre"/>,
   oppgave:"1. Farg begge barna med ulike hudfarger og klær. 2. Farg bamsen og bilen de deler. 3. Tegn et smil i hjertet mellom dem. 4. Tegn noe du liker å dele med en venn.",
   samtale:"Hvorfor er det viktig å dele? Hvordan føles det å få hjelp? Hva gjør du hvis en venn er lei seg?",
   mal:"Empati, vennskap og etisk handling. Rammeplanen ERF: forstå verdien av å bry seg om hverandre, dele og vise omsorg i hverdagen."},

  {id:25, tittel:"Hjelperne i nabolaget", ikon:"🏙️", kategori:"ns", alder:"3-6 år", rammeplan:["naermiljo"],
   svg: <TegnearkFagSprite panel={3} tittel="Hjelperne i nabolaget"/>,
   oppgave:"1. Farg biblioteket og brannstasjonen med riktige farger. 2. Farg brannmannens og de andre hjelpernes uniformer. 3. Tegn deg selv blant barna i bildet. 4. Tegn veien fra barnehagen til biblioteket.",
   samtale:"Hvem jobber i biblioteket? Hva gjør en brannmann? Hvilke bygninger finnes i nabolaget ditt?",
   mal:"Lokalkunnskap og samfunnsforståelse. Rammeplanen NS: kjenne til funksjoner og yrker i nærmiljøet, orientere seg i lokalsamfunnet."},

  {id:26, tittel:"Maling og musikk", ikon:"🎨", kategori:"kkk", alder:"2-6 år", rammeplan:["kunst"],
   svg: <TegnearkFagSprite panel={4} tittel="Maling og musikk"/>,
   oppgave:"1. Farg maleriet og stativet med klare farger. 2. Farg instrumentene barnet spiller (trommer, tamburin). 3. Tegn hva du ville ha malt på det tomme lerretet. 4. Tegn noter rundt musikanten.",
   samtale:"Hva er ditt favorittinstrument? Hvilke farger blander du for å få oransje? Hva er forskjellen på musikk og billedkunst?",
   mal:"Kreativ utfoldelse gjennom kunst og musikk. Rammeplanen KKK: uttrykke seg gjennom ulike kunstformer, oppleve estetisk glede og skaperglede."},

  {id:27, tittel:"Utforsk naturen", ikon:"🔍", kategori:"nmt", alder:"3-6 år", rammeplan:["natur"],
   svg: <TegnearkFagSprite panel={5} tittel="Utforsk naturen"/>,
   oppgave:"1. Farg barna i turklær (grønt, brunt, blått). 2. Farg bladene, insektene og konglene. 3. Tegn hva du ser gjennom forstørrelsesglasset. 4. Tegn tre dyr eller insekter som finnes i skogen.",
   samtale:"Hvilke insekter finnes i skogen? Hva er forskjellen på en maur og en bille? Hva spiser en pinnsvin?",
   mal:"Naturkjennskap og utforskertrang. Rammeplanen NMT: oppleve naturen med alle sansene, undre seg og stille spørsmål om levende og ikke-levende natur."},

  {id:28, tittel:"Tall og former rundt oss", ikon:"🔢", kategori:"arf", alder:"2-6 år", rammeplan:["antall"],
   svg: <TegnearkFagSprite panel={6} tittel="Tall og former rundt oss"/>,
   oppgave:"1. Farg tallene 1, 2, 7 og 9 i ulike farger. 2. Farg firkanten, trekanten og sirkelen ulikt. 3. Bygg et tårn av klossene – farg dem i mønster. 4. Tell alle klossene og skriv svaret.",
   samtale:"Hvilken form har et vindu? Hvilken form har en pizzabit? Kan du telle baklengs fra 10?",
   mal:"Tall- og formforståelse i hverdagen. Rammeplanen ARF: gjenkjenne former og tall i omgivelsene, telle og sortere gjenstander."},
];

export const TEGNEKAT = [
  ["alle","Alle 🖍️"],
  ["kst","Språk & tekst 📖"],
  ["kbmh","Kropp & helse 🏃"],
  ["kkk","Kunst & kultur 🎨"],
  ["nmt","Natur & teknologi 🌿"],
  ["arf","Antall & form 🔢"],
  ["erf","Etikk & filosofi 💛"],
  ["ns","Nærmiljø & samfunn 🏘️"],
];

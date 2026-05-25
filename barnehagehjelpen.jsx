import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DokumentSkanner from "./DokumentSkanner.jsx";
import BokerSide from "./Boker.jsx";
import Velkomst from "./Velkomst.jsx";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', sans-serif; background: #f3f7fc; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #c4d6ec; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #a8c1de; }
  textarea, input, select { font-family: 'Nunito', sans-serif; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pop { 0%{ transform:scale(0.9); opacity:0; } 60%{ transform:scale(1.04); } 100%{ transform:scale(1); opacity:1; } }
  @keyframes shimmer { 0%{ background-position:-200px 0; } 100%{ background-position:200px 0; } }
  .fade { animation: fadeIn 0.3s ease both; }
  .pop { animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .hover { transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease; }
  .hover:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(44,91,142,0.14)!important; }
  .hover:active { transform:translateY(-1px); transition-duration:0.08s; }
  .nb { cursor:pointer; border:none; font-family:'Nunito',sans-serif; transition:all 0.2s; }
  .nb:hover { background:rgba(255,255,255,0.18)!important; }
  .nb.on { background:rgba(255,255,255,0.22)!important; font-weight:800; }
  .btn { cursor:pointer; border:none; border-radius:11px; font-family:'Nunito',sans-serif; font-weight:700; transition:all 0.18s ease; }
  .btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
  .btn:active { transform:translateY(0); transition-duration:0.06s; }
  .btn:focus-visible { outline: 2px solid #2c5b8e; outline-offset: 2px; }
  .tag { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .spin { border:3px solid #d8f3dc; border-top:3px solid #2d6a4f; border-radius:50%; width:26px; height:26px; animation:spin 0.8s linear infinite; }
  input:focus, textarea:focus, select:focus { outline:2px solid #3a72b0; outline-offset: 1px; }
  a:focus-visible, button:focus-visible { outline: 2px solid #2c5b8e; outline-offset: 2px; }

  /* SVG tegneark – levende hover-effekt */
  .svg-wrap-hover svg { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease; }
  .svg-wrap-hover:hover svg { transform: scale(1.04); filter: drop-shadow(0 4px 12px rgba(44,91,142,0.15)); }

  /* Skimmer-effekt mens innhold laster */
  .skimmer { background: linear-gradient(90deg, #e8eff8 0px, #f0f5fb 100px, #e8eff8 200px); background-size: 400px 100%; animation: shimmer 1.2s linear infinite; border-radius: 8px; }

  /* Reduser animasjoner for brukere som har slått det av i OS */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    html { scroll-behavior: auto; }
  }

  /* RESPONSIVT LAYOUT */
  .bh-layout { display:flex; min-height:100vh; background:#f3f7fc; }
  .bh-sidebar { position:fixed; top:0; left:0; width:225px; height:100vh; background:linear-gradient(160deg,#1f4068,#3a72b0,#4178bd); z-index:100; display:flex; flex-direction:column; overflow-y:auto; transition:transform 0.28s ease; }
  .bh-main { margin-left:225px; flex:1; padding:22px 20px; max-width:700px; transition:margin-left 0.28s ease; }
  .bh-hamburger { display:none; }
  .bh-backdrop { display:none; }
  .bh-mobile-header { display:none; }

  @media (max-width: 820px) {
    .bh-sidebar { transform:translateX(-100%); box-shadow:none; width:260px; }
    .bh-sidebar.open { transform:translateX(0); box-shadow:0 0 32px rgba(0,0,0,0.4); }
    .bh-sidebar-close { display:flex !important; }
    .bh-main { margin-left:0; padding:64px 14px 18px; max-width:100%; }
    .bh-mobile-header { display:flex; position:fixed; top:0; left:0; right:0; height:52px; background:linear-gradient(135deg,#1f4068,#3a72b0); z-index:90; align-items:center; padding:0 12px; box-shadow:0 2px 8px rgba(0,0,0,0.12); }
    .bh-hamburger { display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:rgba(255,255,255,0.15); border:none; border-radius:9px; cursor:pointer; color:#fff; font-size:20px; padding:0; }
    .bh-hamburger:active { background:rgba(255,255,255,0.28); }
    .bh-mobile-title { color:#fff; font-family:'Fredoka One',cursive; font-size:17px; margin-left:12px; }
    .bh-backdrop.show { display:block; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99; animation:fadeIn 0.2s ease; }
  }

  /* FAVORITT-STJERNE */
  .fav-btn { background:transparent; border:none; cursor:pointer; padding:5px 7px; border-radius:8px; font-size:18px; line-height:1; transition:transform 0.15s, background 0.15s; }
  .fav-btn:hover { background:rgba(255,193,7,0.15); transform:scale(1.15); }
  .fav-btn:active { transform:scale(0.92); }
  .fav-btn.aktiv { filter:drop-shadow(0 0 3px rgba(255,193,7,0.6)); }

  /* Dato-input på iOS – fjern standard kalender-ikon, vi viser egen */
  input[type="date"] { -webkit-appearance: none; appearance: none; }
  input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; right: 0; top: 0; width: 100%; height: 100%; cursor: pointer; }
  input[type="date"]::-webkit-date-and-time-value { text-align: left; }

  /* Bilder skal aldri strekke seg ut over containeren */
  img { max-width: 100%; }
  /* Profilbilder-fallback dersom src feiler */
  .avatar-img { display:block; width:100%; height:100%; object-fit:cover; }

  @media print {
    body { background: white!important; }
    .no-print { display:none!important; }
    .print-page { page-break-after: always; padding:20px; }
    @page { margin: 15mm; }
  }
`;

const C = { g:"#2c5b8e", lg:"#3a72b0", mint:"#d8e6f5", bg:"#f3f7fc", yl:"#52b788", w:"#ffffff", t:"#1a2c45", gr:"#5d7390", lg2:"#e8eff8" };

const FAGOMRADER = [
  { id:"kommunikasjon", navn:"Kommunikasjon, språk og tekst", ikon:"💬", farge:"#2d6a4f", lys:"#d8f3dc", nr:"1",
    kortbeskrivelse:"Språkutvikling, lesing, skriving og kommunikasjon",
    innhold:"Barnehagen skal bidra til at barna leker med språk, symboler og tekster og opplever glede ved lesing og skriving. Barnehagen skal skape et godt samtalemiljø der alle barn kan kommunisere, fortelle, undre seg og stille spørsmål. Barna skal møte ulike typer tekster og fortellinger på mange arenaer. Tekst og fortelling på ulike språk, inkludert tegnspråk, skal inkluderes. Barnehagen skal bidra til at flerspråklige barn får støtte i å bruke morsmålet sitt.",
    malBarna:["Leke med språk, symboler og tekst","Lytte, observere og gi uttrykk for egne tanker","Bruke norsk og morsmål aktivt","Oppleve glede ved lesing, skriving og fortelling","Møte symboler, bokstaver og tall","Tilegne seg ord og begreper i hverdagen"],
    malPersonal:["Skape et rikt samtalemiljø der alle inkluderes","Lese høyt daglig og samtale om innholdet","Bruke rim, regler og sang aktivt","Støtte flerspråklige barn i å bruke morsmålet","Gjøre tekst og skrift synlig i miljøet"],
    progresjon:"Småbarn: Kroppsspråk, pludring, enkeltord og tegning. Mellombarn: Setninger, fortelling, interesse for bokstaver. Storbarn: Sammenhengende historier, begynnende lese- og skriveinteresse.",
    arbeidsmater:["Høytlesning og boksamtaler","Sang, rim og regler","Dramatisering og rollespill","Bøker og fortellinger i alle sjangre","Skriving og tegning som uttrykk","Digitale fortellinger","Rim og rytme i hverdagen"],
    eksempler:["Les en bok og still åpne spørsmål: 'Hva tror du skjer nå?'","Lek 'Hva rimer på katt?'","La barna diktere mens du skriver historien deres","Besøk biblioteket og la barna velge bok"] },
  { id:"kropp", navn:"Kropp, bevegelse, mat og helse", ikon:"🏃", farge:"#e67e22", lys:"#fdebd0", nr:"2",
    kortbeskrivelse:"Motorikk, helse, kosthold og bevegelsesglede",
    innhold:"Barnehagen skal bidra til at barna utvikler kroppsbeherskelse, grovmotorikk og finmotorikk, rytme og motorisk følsomhet. Barna skal tilegne seg gode vaner, holdninger og kunnskap om kosthold, hygiene og helse. Kroppen er det primære redskapet for sanseopplevelser, kommunikasjon og læring. Barnehagen skal fremme positive opplevelser med å bruke kroppen.",
    malBarna:["Positiv selvoppfatning gjennom kroppslig mestring","Gode erfaringer med variert og allsidig bevegelse","Utvikle glede over å ta vare på seg selv","Kunnskap om menneskekroppen og hva som er sunt","Erfare ulike typer mat og måltider positivt","Grunnleggende forståelse for hygiene"],
    malPersonal:["Legge til rette for allsidig lek ute og inne","Gjennomføre daglig utelek uansett vær","Involvere barna i matlaging og matsamtaler","Fremme positive holdninger til mat og kropp","Gi barna tid til å mestre motoriske utfordringer"],
    progresjon:"Småbarn: Grunnleggende motorikk, gange, klatring, sansing. Mellombarn: Koordinering, balanse, sykkel. Storbarn: Kompleks motorikk, regellek, sportslignende aktiviteter.",
    arbeidsmater:["Hinderløyper og bevegelsesleker","Matlaging og bakst","Turer i ulike terreng","Dans og bevegelsessanger","Yoga for barn","Sansebaner","Utelek med redskaper"],
    eksempler:["Lag en hinderløype med puter og kasser","Bak brød og snakk om ingrediensene","Dans til musikk fra ulike kulturer","Gå barbeint i sand, gress og snø"] },
  { id:"kunst", navn:"Kunst, kultur og kreativitet", ikon:"🎨", farge:"#b5179e", lys:"#f8e7f6", nr:"3",
    kortbeskrivelse:"Estetikk, skapende prosesser og kulturopplevelser",
    innhold:"Barnehagen skal gi barna muligheter for å oppleve kunst og kultur og uttrykke seg estetisk gjennom mange uttrykksmåter. Kunst, kultur og estetikk bidrar til barnas allsidige utvikling, kommunikasjon og meningsskaping. Barna skal møte et mangfold av kulturelle uttrykk og barnehagen skal legge til rette for skapende prosesser der barna kan eksperimentere og utforske.",
    malBarna:["Estetiske erfaringer med kunst og kultur","Oppleve og bruke ulike materialer og teknikker","Bruke kropp, rom, form, farge og rytme som uttrykk","Reflektere over egne og andres estetiske uttrykk","Oppleve teater, musikk, litteratur og visuelle kunstformer"],
    malPersonal:["Gi barna tid til skapende prosesser uten krav om produkt","Tilby varierte materialer og teknikker","Legge til rette for opplevelse av kunst og kultur","Verdsette barnas estetiske uttrykk","Integrere kulturelt mangfold"],
    progresjon:"Småbarn: Sansing av farger, lyder, materialer. Mellombarn: Eksperimentering med teknikker. Storbarn: Bevisst bruk av virkemidler og fortelling gjennom kunst.",
    arbeidsmater:["Tegning og maling","Skulptur og forming","Musikk, sang og dans","Teater og drama","Besøk på museum","Foto og digitale uttrykk","Tekstil og sying"],
    eksempler:["Abstrakt maling til musikk","Lag en teaterforestilling basert på et eventyr","Besøk et lokalt kunstgalleri","Lag instrumenter av naturmaterialer"] },
  { id:"natur", navn:"Natur, miljø og teknologi", ikon:"🌱", farge:"#1565c0", lys:"#e3f2fd", nr:"4",
    kortbeskrivelse:"Naturkunnskap, undring, bærekraft og teknologi",
    innhold:"Barnehagen skal bidra til at barna opplever glede og undring over naturen. Barna skal oppleve naturen og undres over livsprosesser, bruke sansene sine og bli kjent med planter, dyr og naturlige prosesser. Barnehagen skal bidra til at barna forstår og erfarer bærekraftig utvikling. Teknologi handler om å utforske og skape med ulike verktøy – fra enkle redskaper til digitale hjelpemidler.",
    malBarna:["Oppleve glede, undring og utforskning i naturen","Bli kjent med planter, dyr og naturprosesser","Forstå grunnleggende bærekraftig utvikling","Erfare teknologi i hverdagen","Oppleve endringer gjennom årstidene","Kategorisere og sammenligne naturfenomener"],
    malPersonal:["Gjennomføre regelmessige naturopplevelser","Stimulere barnas undring og nysgjerrighet","Snakke om bærekraft i hverdagen","Bruke digitale verktøy som utforskningsredskaper","Integrere naturvitenskapelig tenkning"],
    progresjon:"Småbarn: Sansing i naturen, bekjentskap med dyr. Mellombarn: Systematisk observasjon, årstider. Storbarn: Eksperimenter, forståelse for naturprosesser og bærekraft.",
    arbeidsmater:["Turer i skog, strand og fjell","Naturobservasjon med lupe","Enkle eksperimenter","Hageparsell og planting","Dyrehold","Bål og friluftsliv","Digitale mikroskop"],
    eksempler:["Plant frø og følg veksten over tid","Lag et insekthotell","Ryddeaksjon i nærmiljøet","Mål regn og temperatur – lag en værstasjon"] },
  { id:"antall", navn:"Antall, rom og form", ikon:"🔢", farge:"#6a1b9a", lys:"#f3e5f5", nr:"5",
    kortbeskrivelse:"Tall, former, rom, mønster og matematisk tenkning",
    innhold:"Barnehagen skal bidra til at barna opplever glede og undring over å leke og eksperimentere med tall og former. Matematikk handler om å oppdage relasjoner, se mønstre og leke med tall og former i hverdagen. Barna skal møte matematiske begreper gjennom lek, samtale og hverdagsaktiviteter. Barnehagen skal legge til rette for utforskning heller enn innøving av fakta.",
    malBarna:["Oppleve glede ved å utforske tall og former","Tilegne seg matematiske begreper","Erfare og leke med matematiske problemstillinger","Orientere seg i rom og tid","Oppdage mønstre og sammenhenger","Bruke matematisk språk naturlig"],
    malPersonal:["Bruke matematiske begreper i hverdagssamtaler","Legge til rette for sortering og klassifisering","Gjøre geometriske former synlige","Stille åpne matematiske spørsmål","Bruke spill med matematisk innhold"],
    progresjon:"Småbarn: Benevning av antall, enkle former. Mellombarn: Telling, sortering, mønstre. Storbarn: Addisjon/subtraksjon, tidsbegrep, geometri.",
    arbeidsmater:["Sortering og klassifisering","Telling i hverdagen","Former og geometri","Mål og vekt i matlaging","Spill med matematisk innhold","Konstruksjonslek","Mønstre i natur og kunst"],
    eksempler:["Tell trapper og vinduer på tur","Sorter naturmaterialer etter størrelse","Mål ingredienser til brødet","Lag mønstre med klosser og perler"] },
  { id:"etikk", navn:"Etikk, religion og filosofi", ikon:"🤝", farge:"#c62828", lys:"#ffebee", nr:"6",
    kortbeskrivelse:"Verdier, religion, livssyn og eksistensielle spørsmål",
    innhold:"Barnehagen skal bidra til at barna møter ulike religioner og livssyn med respekt og åpenhet. Barna skal støttes i å undre seg over eksistensielle, filosofiske og mellommenneskelige spørsmål. Barnehagen skal formidle kristne og humanistiske verdier og fremme demokrati, mangfold og gjensidig respekt.",
    malBarna:["Innsikt i kristne og humanistiske verdier","Møte ulike religioner med respekt","Undre seg over eksistensielle spørsmål","Reflektere over verdier og normer","Oppleve tilhørighet og solidaritet","Kjennskap til høytider og tradisjoner"],
    malPersonal:["Legge til rette for filosofiske samtaler","Markere høytider fra ulike tradisjoner","Hjelpe barna reflektere over rett og galt","Skape rom for undring","Arbeide mot diskriminering"],
    progresjon:"Småbarn: Trygghet og omsorg i fellesskap. Mellombarn: Vennskap og enkle verdispørsmål. Storbarn: Filosofisk refleksjon og forståelse for mangfold.",
    arbeidsmater:["Filosofiske samtaler","Fortellinger med etisk innhold","Markering av høytider","Demokratiske prosesser","Empatiøvelser","Fortellinger fra ulike kulturer"],
    eksempler:["Still spørsmål som 'Hva er en god venn?'","Les eventyr og diskuter moralske valg","Lag en venneplakat demokratisk","Feir Id, Hanukkah og jul"] },
  { id:"naermiljo", navn:"Nærmiljø og samfunn", ikon:"🏘️", farge:"#37474f", lys:"#eceff1", nr:"7",
    kortbeskrivelse:"Demokrati, samfunn, nærmiljø og medvirkning",
    innhold:"Barnehagen skal bidra til at barna møter verden utenfor familien med nysgjerrighet og tillit, og at de opplever demokrati gjennom medvirkning. Barna skal bli kjent med nærmiljøet og oppleve tilhørighet. Barnehagen skal fremme forståelse for mangfold i samfunnet.",
    malBarna:["Oppleve demokrati gjennom medvirkning","Bidra til fellesskap i barnehage og nærmiljø","Bli kjent med nærmiljøet og samfunnsinstitusjoner","Forstå ulike tradisjoner og levemåter","Oppleve tilhørighet og inkludering","Respekt for likheter og ulikheter"],
    malPersonal:["Involvere barna i planlegging og beslutninger","Gjennomføre turer i nærmiljøet","Legge til rette for demokratiske prosesser","Inkludere alle barns perspektiver","Feire kulturelt mangfold"],
    progresjon:"Småbarn: Trygghet i barnehagegruppa. Mellombarn: Regler og fellesskap. Storbarn: Demokrati, samfunnsforståelse, globale perspektiver.",
    arbeidsmater:["Turer til bibliotek og brannstasjon","Demokratiske valg og møter","Nærmiljøprosjekter","Besøk fra ulike kulturer","Feiring av nasjonale tradisjoner"],
    eksempler:["Gjennomfør et barneting","Besøk et eldresenter","Intervju postmannen eller bussjåføren","Lag kart over nærmiljøet"] },
];

const SANGER = [
  { id:1, tittel:"Lille Petter Edderkopp", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Kjent barnesang",
    tekst:"Lille Petter Edderkopp\nKlatret opp en vegg\nNed kom regnet\nSkylt ham bort fra stegg\nOpp steg solen\nTørket alt det våte\nLille Petter Edderkopp\nKlatret opp igjen",
    tips:"Bruk pekefingeren som edderkopp. Barna elsker å dramatisere regnet og solen. Kobles til vær og årstider." },
  { id:2, tittel:"God morgen alle sammen", kategori:"sang", alder:"1-6 år", rammeplan:["kommunikasjon","etikk"], melodi:"If You're Happy",
    tekst:"God morgen, god morgen\nHvordan har du det?\nGod morgen, god morgen\nJeg har det bra!\nHvis du er glad og vet det\nSå klapp, klapp i dine hender\nHvis du er glad og vet det\nSå stamp, stamp med beina\nHvis du er glad og vet det\nSå si: Hei – hei – hei!",
    tips:"Perfekt åpning for samlingsstund. Barna hilser på hverandre. Bytt ut klapping med nye bevegelser." },
  { id:3, tittel:"Bjørnen sover", kategori:"sang", alder:"2-6 år", rammeplan:["kommunikasjon","kropp"], melodi:"Tradisjonell",
    tekst:"Bjørnen sover, bjørnen sover\nI sitt lune hi\nHar han lagt seg, har han lagt seg\nTidlig om kvelden\nVinteren er kald\nVinteren er kald\nMen om våren, men om våren\nVåkner bjørnen opp",
    tips:"Dramatiser: barna er bjørner som sover og våkner. Snakk om dyrenes vinterdvale og årstider." },
  { id:4, tittel:"Ro, ro til fiskeskjær", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon","kropp"], melodi:"Tradisjonell norsk",
    tekst:"Ro, ro til fiskeskjær\nFar og mor og lille Pær\nFar ror ut og mor ror inn\nLille Pær har fisket\nFem og tredve sild\nRo, ro til fiskeskjær",
    tips:"Sett barna i par som ror sammen. Stimulerer motorikk, samarbeid og rytme. Ypperlig for de minste." },
  { id:5, tittel:"Snekker Andersen", kategori:"sang", alder:"2-6 år", rammeplan:["kommunikasjon","naermiljo"], melodi:"Tradisjonell",
    tekst:"Snekker Andersen har en stol\nSom han har snekret selv\nOg stolen har fire ben\nOg ryggen er solid og god\nBank, bank, bank – slikt er arbeid!\nBank, bank, bank – slik lyder det!\nSnekker Andersen er glad\nFor stolen ble så fin",
    tips:"Bruk bevegelser for banking. Snakk om yrker og håndverk. Knytt til konstruksjonslek og samfunnsforståelse." },
  { id:6, tittel:"Trollmors vuggesang", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon"], melodi:"Norsk vuggesang",
    tekst:"Vesle vått og vesle grått\nMamma synger for deg\nSov nå lille barnet mitt\nTrollet passer deg\nNatt og dag og dag og natt\nMamma er jo her\nLille øye lukk deg nå\nNær, så nær, så nær",
    tips:"Rolig sang for soving og nærhet. God for kos og trygghet. Syng sakte og lavt." },
  { id:7, tittel:"Hoppe sansen", kategori:"sang", alder:"1-4 år", rammeplan:["kropp","kommunikasjon"], melodi:"Tradisjonell",
    tekst:"Hoppe, hoppe, sansen\nOpp og ned vi danser\nHoppe, hoppe, sansen\nI en glad romanse\nOpp og ned og opp og ned\nAlle hopper med!",
    tips:"Enkel sang som alle kan delta i. Fremmer grovmotorikk og bevegelsesglede. Bra i overgangssituasjoner." },
  { id:8, tittel:"Fem små apekatter", kategori:"sang", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Five Little Monkeys",
    tekst:"Fem små apekatter hoppet i senga\nEn falt ned og slo seg i hodet\nMamma ringte legen, legen sa:\n'Ingen apekatter skal hoppe i senga!'\nFire små apekatter...\n(fortsetter ned til én apekatt)",
    tips:"Telle baklengs fra 5 til 0. Bruk fingre. Barna elsker repetisjonen. Knytter telling til konkret handling." },
  { id:9, tittel:"Petter Kanin", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Frère Jacques",
    tekst:"Petter Kanin, Petter Kanin\nLøper fort, løper fort\nFørst de to lange ørene\nSå den lille halen\nHopp, hopp, hopp!\nHopp, hopp, hopp!",
    tips:"Bruk hender som ører og hopp. Kan dramatiseres ute. Snakk om kaniner og andre haredyr." },
  { id:10, tittel:"Regnbuen", kategori:"sang", alder:"3-6 år", rammeplan:["natur","kunst"], melodi:"Egenkomponert",
    tekst:"Etter regn kommer sol\nOg etter sol regn igjen\nOg i himmelen lyser\nRegnbuen min venn\nRød og oransje og gul\nGrønn og blå og fiolett\nSyn syv vakre farger\nAlt det fineste på jord",
    tips:"Lag regnbue med armene. Tegn regnbuer i alle farger etterpå. Snakk om primær- og sekundærfarger." },
  { id:11, tittel:"Alle fugler store og små", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Tradisjonell",
    tekst:"Alle fugler store og små\nFlyr og flyr hele dag\nOppe i de høye trær\nSynger de sin sang\nTvit-tvit-tvit, tvit-tvit-tvit\nHva synger de da?\nTvit-tvit-tvit, tvit-tvit-tvit\nKom og hør på meg!",
    tips:"Bruk armene som vinger. Lytt til fuglekvitter ute etterpå. Knytt til årstider og fuglearter." },
  { id:12, tittel:"Ole Dole Doff", kategori:"regle", alder:"2-6 år", rammeplan:["antall","kommunikasjon"], melodi:"Tellerim",
    tekst:"Ole dole doff\nKinke lane koff\nKoffe lane binke bane\nOle dole doff",
    tips:"Klassisk tellerim for å velge 'den'. God overgang til lek. Barna liker rytmen og nonsens-ordene." },
  { id:13, tittel:"En, to, tre – hopp!", kategori:"regle", alder:"2-5 år", rammeplan:["antall","kropp"], melodi:"Regle",
    tekst:"En, to, tre – hopp!\nFire, fem, seks – stopp!\nSju, åtte, ni – vend om!\nTi – og så begynner vi om igjen!",
    tips:"Kombiner bevegelse og telling. Bra i overgangssituasjoner. Barna lærer tallrekkefølgen." },
  { id:14, tittel:"Regndråpen", kategori:"rim", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Rim",
    tekst:"Lille regndråpe\nFall ned fra sky\nPlaff i en bekk\nEr livet ditt ny\nDu renner til havet\nSå langt bort fra meg\nMen du kommer tilbake\nPå din evige vei",
    tips:"Kobles til vannets kretsløp. Tegn regndråpens reise. Snakk om havet og skyene." },
  { id:15, tittel:"Bukken Bruse (rim)", kategori:"rim", alder:"3-6 år", rammeplan:["kommunikasjon","etikk"], melodi:"Rim fra eventyret",
    tekst:"Hvem tramper på min bro?\nDet er meg, den minste bukken bruse!\nJeg er på vei til setra\nFor å gjøre meg feit!\nVent til bror min kommer\nHan er mye større!\nOk, sa trollet, dra bare!",
    tips:"Dramatiser med tre barn som ulike bukker. Bruk stemmer. Snakk om mot, klokskap og samarbeid." },
  { id:16, tittel:"Eple og pære", kategori:"regle", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Regle",
    tekst:"Eple, pære, plomme, pæ\nHvem kan telle?\nHvem kan se?\nEn, to, tre – nå er du fri!\nFire, fem, seks – kom hit til meg!\nSju, åtte, ni, ti – nå er vi ferdig alle vi!",
    tips:"Bruk frukt som rekvisitter. Knytt til matlaging. Barna lærer fruktsorter og tall simultant." },
  { id:17, tittel:"Tommeliten", kategori:"sang", alder:"1-4 år", rammeplan:["kommunikasjon","kropp"], melodi:"Tradisjonell",
    tekst:"Her er Tommeliten liten\nOg her er Slikkepott\nLangemann er midtmann\nOg Gullebrand er mett\nLille veslefinger\nSitter innerst inne\nNå kommer de alle fem\nOg hilser pent på deg!",
    tips:"Løft opp en finger om gangen. Fantastisk for finmotorikk og navn på fingre. God for de aller minste." },
  { id:18, tittel:"Byssan lull", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon"], melodi:"Skandinavisk vuggesang",
    tekst:"Byssan lull, byssan lull\nKaka i kulla\nHvem er det som bor der\nInni den lille kulla?\nDet er lille barnet\nMitt aller kjæreste\nByssan lull, byssan lull\nSov nå, sov nå litt",
    tips:"Rolig vuggesang. God for søvnsituasjoner og nærhet. Syng sakte og lavt – skaper ro." },
  { id:19, tittel:"Høstsangen", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Bladene de faller\nRøde, gule, brune\nVinden blåser kaldt\nOg høsten er her\nKongler og eikenøtter\nFinner vi på bakken\nNaturens eget skattkammer\nVenter på oss her",
    tips:"Syng på tur i skogen om høsten. Samle materialer mens dere synger. Snakk om årstider og farger." },
  { id:20, tittel:"Vi er mange farger", kategori:"sang", alder:"3-6 år", rammeplan:["etikk","naermiljo"], melodi:"Egenkomponert",
    tekst:"Vi er mange farger\nVi er mange vi\nNoen er som deg\nNoen er som meg\nMen alle hører til her\nAlle hører til\nForskjellige og like\nEr vi alle vi",
    tips:"Synges i samlingsstund. Snakk om mangfold og det å høre til. Bruk bilder av barn fra ulike kulturer." },
  { id:21, tittel:"Tommelise", kategori:"rim", alder:"3-6 år", rammeplan:["kommunikasjon","kunst"], melodi:"Rim",
    tekst:"Tommelise, liten og fin\nSov i en valnøttskall så grønn\nBlomsterne duftet rundt henne\nOg fuglene sang i lønn\nMen en morgen hun reiste\nMed fugle-prins bort\nTil et land der det alltid\nEr vår og sol og godt",
    tips:"Kobles til Andersens eventyr. La barna tegne Tommelise. Snakk om eventyr og fantasi." },
  { id:22, tittel:"Månen lyser", kategori:"rim", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Rim",
    tekst:"Månen lyser over skog og hei\nStjernene er mange på sin vei\nNattfuglen synger i mørket der\nOg barnet sover – mor er nær",
    tips:"Bruk til rolig avslutning av dagen. Kobles til naturfenomener: måne, stjerner og nattedyr." },
  { id:23, tittel:"Den lille katten", kategori:"sang", alder:"1-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Mjau, mjau, lille katt\nLeker hele dag og natt\nSover, spinner, drikker melk\nMed myk pels og blank stjert",
    tips:"Si mjau sammen. Lek katt: kryp, strekk, slikke pote." },
  { id:24, tittel:"Vov-vov, hunden min", kategori:"sang", alder:"1-4 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Vov-vov, lille hund\nLogrer rumpa rund og rund\nLeker apport med en pinne\nSnuser her og snuser der",
    tips:"Klapp på lår. Lat som hund. Snakk om hva hunder liker." },
  { id:25, tittel:"Hesten Travel", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Hesten Travel, lang og sterk\nVrinsker høyt på enga\nGalopperer hit og dit\nMed mane som flagger fritt",
    tips:"Galopper på stedet. Vrinsk høyt. Snakk om hester på gård." },
  { id:26, tittel:"Mø sier kua", kategori:"sang", alder:"1-4 år", rammeplan:["natur","naermiljo"], melodi:"Egenkomponert",
    tekst:"Mø-mø-mø, sier kua glad\nStår på beite hver en dag\nSpiser gress med ro og tål\nGir oss melk – en fin gave",
    tips:"Si mø sammen. Snakk om hvor melken kommer fra." },
  { id:27, tittel:"Grisen Knort", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Nøff, nøff, sier grisen Knort\nMed rosa krøllet hale kort\nRuller seg i kjølig gjørme\nGlad er han hver dag",
    tips:"Si nøff. Snakk om hvorfor griser elsker gjørme." },
  { id:28, tittel:"Lammet bæ", kategori:"sang", alder:"1-4 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Bæ, bæ, sier lammet lite\nFølger mamma sau i flokk\nMyk og ulden, hvit og snill\nGir oss ull til klær og lue",
    tips:"Kjenn på ulltøy. Si bæ. Snakk om ull og klær." },
  { id:29, tittel:"Høna klukker", kategori:"sang", alder:"1-5 år", rammeplan:["natur","naermiljo"], melodi:"Egenkomponert",
    tekst:"Klukk, klukk, sier høna mor\nKakler om hvert egg hun gjorde\nKyllingene springer etter\nPip-pip-pip i hele gården",
    tips:"Klukk og pip sammen. Snakk om gården." },
  { id:30, tittel:"Lille mus i hus", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Lille mus, lille mus\nTipp-tapp gjennom hus\nLeter etter brødsmuler\nGjemmer seg i mørke kroker",
    tips:"Tipp-tapp med fingrene. Lat som muser." },
  { id:31, tittel:"Ekornet i tre", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Ekornet med rød og stor hale\nKlatrer høyt i grønne trær\nKnasker nøtter, gjemmer kongler\nLøper opp og ned hele dag",
    tips:"Klatrebevegelser. Snakk om høstforberedelser." },
  { id:32, tittel:"Pinnsvin med pigger", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Pinnsvin, pinnsvin, lille du\nMed pigger som beskytter nå\nRuller seg til ball når redd\nVagger så avgårde",
    tips:"Krøll deg til en ball. Snakk om dyrenes forsvar." },
  { id:33, tittel:"Reven sniker", kategori:"sang", alder:"3-6 år", rammeplan:["natur","etikk"], melodi:"Egenkomponert",
    tekst:"Reven slu med stor rød hale\nSniker stille gjennom skog\nØrene står spisst og lytter\nSmart og lur, men også flink",
    tips:"Snikbevegelser. Snakk om dyrs egenskaper." },
  { id:34, tittel:"Ugla i natten", kategori:"sang", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Hoo-hoo, sier ugla i tre\nVåker mens vi sover sønt\nStore øyne ser i mørke\nFlyr så stille som en sky",
    tips:"Hoot sammen. Snakk om nattedyr." },
  { id:35, tittel:"Marihøna med prikker", kategori:"sang", alder:"1-5 år", rammeplan:["natur","antall"], melodi:"Egenkomponert",
    tekst:"Marihøne, marihøne\nRød med prikker svarte\nEn, to, tre, fire, fem, seks, syv\nTeller jeg på ryggen din",
    tips:"Tell prikker. Let etter ekte marihøner ute." },
  { id:36, tittel:"Edderkoppen åtte bein", kategori:"sang", alder:"2-5 år", rammeplan:["natur","antall"], melodi:"Egenkomponert",
    tekst:"Edderkoppen med åtte bein\nSpinner nett av silketrå\nFanger fluer i sitt fine nett\nSitter midt i, venter rolig",
    tips:"Tell til åtte. Studer edderkoppnett ute." },
  { id:37, tittel:"Bienes summer", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Summ, summ, summ, sier bien glad\nFlyr fra blomst til blomst på rad\nSamler nektar gul og søt\nLager honning til oss alle",
    tips:"Summ sammen. Smak honning. Snakk om bienes rolle." },
  { id:38, tittel:"Maurene marsjerer", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Maurene marsjerer en og en\nMaurene marsjerer to og to\nBærer mat tilbake til tua\nJobber sammen, aldri trette",
    tips:"Marsjer på linje. Snakk om samarbeid." },
  { id:39, tittel:"Snegla bærer hus", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Sakte, sakte går snegla\nMed sitt hus alltid på rygg\nFølehorn som strekker ut\nFinner alltid hjem igjen",
    tips:"Gå veldig sakte. Let etter snegler etter regn." },
  { id:40, tittel:"Skilpadden Sigurd", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Skilpadden Sigurd er så rolig\nGår så sakte gjennom livet\nSkall på rygg beskytter ham\nLever lenge, hundre år",
    tips:"Beveg deg veeeldig sakte. Snakk om langtlevende dyr." },
  { id:42, tittel:"Apekatten i palme", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Apekatten svinger seg\nFra gren til gren i palme\nSpiser banan og ler så høyt\nHi-hi-hi, ha-ha-ha!",
    tips:"Sving armer som ape. Latter sammen. Snakk om jungelen." },
  { id:43, tittel:"Krabben på stranda", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Krabben går sidelengs så\nMed klør og åtte bein\nGjemmer seg under steiner små\nVed havets blå strand",
    tips:"Gå sidelengs som krabbe. Snakk om strand og hav." },
  { id:44, tittel:"Delfinen i havet", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Delfinen hopper opp og ned\nSvømmer raskt i blått hav\nKlikkelyder, blide smil\nSmart og vennlig dyr",
    tips:"Hopp som en delfin. Snakk om havets dyr." },
  { id:45, tittel:"Hvalen den store", kategori:"sang", alder:"3-6 år", rammeplan:["natur","antall"], melodi:"Egenkomponert",
    tekst:"Hvalen er det største dyr\nSvømmer dypt i havets blå\nSpruter vann opp gjennom hull\nSynger lange, vakre toner",
    tips:"Strekk armer ut. Snakk om størrelse i naturen." },
  { id:47, tittel:"Snøen faller stille", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kunst"], melodi:"Egenkomponert",
    tekst:"Snøen faller stille ned\nHvit og myk og kald\nDekker alle takene\nVerden blir så vakker",
    tips:"Beveg fingre nedover som snøflak. Tegn snøkrystaller." },
  { id:48, tittel:"Vinden suser", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Vinden suser i de høye trær\nBlåser løv av eik og bjørk\nVifter i mitt fine hår\nKjenner du den på kinnet?",
    tips:"Pust ut som vind. Vift med armene. Føl vinden ute." },
  { id:50, tittel:"Stjernene blinker", kategori:"sang", alder:"2-6 år", rammeplan:["natur","antall"], melodi:"Egenkomponert",
    tekst:"Stjernene blinker over meg\nMange, mange små lys\nKan jeg telle alle de?\nÉn, to, tre – nei, alt for mange!",
    tips:"Tell stjerner ute en kveld. Snakk om verdensrommet." },
  { id:51, tittel:"Månen rund og hvit", kategori:"sang", alder:"1-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Månen rund og månen hvit\nLyser over takene\nNoen ganger er den smal\nNoen ganger full og rund",
    tips:"Følg månefaser i en kalender. Tegn månen hver kveld." },
  { id:52, tittel:"Skyene som flyter", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kunst"], melodi:"Egenkomponert",
    tekst:"Skyene flyter høyt på himmel\nNoen små og noen store\nNoen ser ut som en hund\nNoen ser ut som et fjell",
    tips:"Se på skyer ute. Hva ligner de på? Tegn dem." },
  { id:53, tittel:"Tordensvær", kategori:"sang", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Bulder, bulder, sier himmelen\nLynet blinker, gult og hvitt\nRegnet kommer fort og tett\nVi går inn til varme rom",
    tips:"Tromme med føttene som torden. Snakk om vær og trygghet." },
  { id:55, tittel:"Bølgene på sjøen", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Egenkomponert",
    tekst:"Bølgene går opp og ned\nUt og inn og rundt og rundt\nHavet stort og dypt og blått\nFulle av rare, fine ting",
    tips:"Beveg armer som bølger. Snakk om livet i havet." },
  { id:56, tittel:"Fjellet høyt", kategori:"sang", alder:"3-6 år", rammeplan:["natur","naermiljo"], melodi:"Egenkomponert",
    tekst:"Fjellet høyt og fjellet sterkt\nMed snø på toppen hvit\nGeitene klatrer opp og opp\nMens vi står langt der nede",
    tips:"Se etter fjell på tur. Tegn fjellandskap." },
  { id:57, tittel:"Skogens hvisken", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Skogen vår er grønn og fin\nFugler synger overalt\nDyrene har hjemmet sitt\nTrærne hvisker i vinden",
    tips:"Gå på tur i skogen. Lytt stille." },
  { id:58, tittel:"Klapp i hender", kategori:"sang", alder:"1-4 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Klapp, klapp, klapp i hender\nKlapp så høyt du kan\nKlapp, klapp, klapp i hender\nAlle klapper sammen",
    tips:"Klapp med varierende styrke og tempo. God i samlingsstund." },
  { id:59, tittel:"Hoppe-sangen", kategori:"sang", alder:"1-5 år", rammeplan:["kropp"], melodi:"Egenkomponert",
    tekst:"Hopp, hopp, hopp – opp i lufta\nHopp, hopp, hopp – ned på bakken\nHøyt og lavt og rundt omkring\nAlle hopper, ingen står",
    tips:"Hopp på stedet. Variér høyde. Bra for energiutløp." },
  { id:60, tittel:"Mine ti tær", kategori:"sang", alder:"1-4 år", rammeplan:["kropp","antall"], melodi:"Egenkomponert",
    tekst:"Ti små tær på føttene mine\nVrikker de når jeg vil ha\nEn, to, tre, fire, fem på en fot\nTeller jeg på begge to",
    tips:"Tell tær. Vrikk dem. Be barna ta av seg sokker." },
  { id:62, tittel:"Øyne og ører", kategori:"sang", alder:"1-5 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Med øynene mine ser jeg\nMed ørene hører jeg lyd\nTo øyne og to små ører\nViser meg den hele verden",
    tips:"Pek på øyne og ører. Snakk om sansene." },
  { id:63, tittel:"Tunge og tenner", kategori:"sang", alder:"2-5 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Tungen min kan smake mat\nTennene kan tygge\nNår jeg snakker bruker jeg\nHele munnen min hver dag",
    tips:"Tygg og smatt. Snakk om de fem smakene." },
  { id:64, tittel:"Hjertet banker", kategori:"sang", alder:"3-6 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Dunk, dunk, dunk – hjertet mitt\nBanker stille i mitt bryst\nNår jeg løper banker det fort\nNår jeg sover, sakte og lett",
    tips:"Hold hånd på bryst. Løp og kjenn forskjellen." },
  { id:65, tittel:"Føttene mine danser", kategori:"sang", alder:"1-5 år", rammeplan:["kropp","kunst"], melodi:"Egenkomponert",
    tekst:"Føttene mine kan gå\nFøttene mine kan løpe\nFøttene mine kan danse\nFøttene mine kan stå",
    tips:"Variér: gå, løp, dans, stå still. Bra overgang." },
  { id:66, tittel:"Hendene mine", kategori:"sang", alder:"1-4 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Hendene mine kan klemme\nHendene mine kan peke\nHendene mine kan vinke\nHendene mine kan vifte",
    tips:"Gjør alle bevegelsene sammen. God finmotorikk." },
  { id:68, tittel:"En, to, tre, fire, fem", kategori:"sang", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"En, to, tre, fire, fem\nFingrene på en hand\nSeks, syv, åtte, ni og ti\nAlle fingre teller jeg",
    tips:"Tell fingre. Vis ett tall av gangen." },
  { id:69, tittel:"Ti små fingre", kategori:"sang", alder:"1-4 år", rammeplan:["antall","kropp"], melodi:"Egenkomponert",
    tekst:"Ti små fingre, ti små tær\nFem på en hand og fem på den andre\nLøft dem opp og legg dem ned\nVrikke, vrikke, vrikke meg",
    tips:"Vrikk fingre og tær. Telle bevegelse." },
  { id:70, tittel:"Stjerner teller jeg", kategori:"sang", alder:"3-6 år", rammeplan:["antall","natur"], melodi:"Egenkomponert",
    tekst:"En stjerne, to stjerner, tre stjerner blå\nFire stjerner, fem stjerner – flere kan jeg få?\nSeks og syv og åtte ni\nTi stjerner blinker over meg",
    tips:"Tegn stjerner og tell. Snakk om natthimmelen." },
  { id:72, tittel:"Stein på stein", kategori:"sang", alder:"2-5 år", rammeplan:["antall","kropp"], melodi:"Egenkomponert",
    tekst:"Stein på stein, stein på stein\nBygger jeg et lite tårn\nEn, to, tre, fire, fem – så høyt!\nOg så velter alt igjen",
    tips:"Bygg med klosser eller steiner. Tell og velt." },
  { id:73, tittel:"Telling i ringen", kategori:"sang", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Vi sitter i en stor sirkel\nOg teller alle som er her\nEn, to, tre, fire, fem, seks\nNå er hele gruppa med",
    tips:"Tell alle barn i ringen. Bra for samlingsstund." },
  { id:74, tittel:"Null til ti", kategori:"sang", alder:"3-6 år", rammeplan:["antall"], melodi:"Egenkomponert",
    tekst:"Null er ingenting, null er tomt\nEn er først, to er to\nTre, fire, fem og seks og syv\nÅtte, ni, ti – jeg klarer det!",
    tips:"Vis null som tom hånd. Tell opp." },
  { id:75, tittel:"Hundre er stort", kategori:"sang", alder:"4-6 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Hundre er et veldig stort tall\nMye, mye mer enn ti\nHundre fingre kan vi ikke ha\nMen hundre venner kan vi få",
    tips:"Tell til 100 med bønner eller eggebrett. Visualisering." },
  { id:76, tittel:"Min beste venn", kategori:"sang", alder:"2-6 år", rammeplan:["etikk","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Min beste venn er trygg og snill\nVi deler alt vi har\nVi leker, ler og hjelper hverandre\nEn venn er noe fint",
    tips:"Snakk om vennskap. Hva gjør en god venn?" },
  { id:77, tittel:"Mor og far", kategori:"sang", alder:"2-5 år", rammeplan:["etikk","naermiljo"], melodi:"Egenkomponert",
    tekst:"Mor og far er glad i meg\nDe passer på meg hver dag\nKlemmer meg og leser bok\nGir meg trygghet, gir meg ro",
    tips:"Snakk om familien. Alle familier ser forskjellig ut." },
  { id:78, tittel:"Søsken-sang", kategori:"sang", alder:"2-6 år", rammeplan:["etikk","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Søsken kan være store, små\nNoen ganger krangler vi\nMen vi er likevel glad i hverandre\nEn søsken er for alltid din",
    tips:"Snakk om søsken og hvordan vi løser konflikter." },
  { id:79, tittel:"Besteforeldre", kategori:"sang", alder:"2-6 år", rammeplan:["etikk","naermiljo"], melodi:"Egenkomponert",
    tekst:"Bestemor og bestefar\nHar levd i mange, mange år\nDe forteller meg om før\nKlemmer meg og er så glad",
    tips:"Snakk om eldre slekt. Inviter besteforeldre på besøk." },
  { id:82, tittel:"Sint er ok", kategori:"sang", alder:"3-6 år", rammeplan:["etikk","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Når jeg blir sint, blir kroppen varm\nMen jeg skal ikke slå med arm\nJeg puster dypt og teller til tre\nSå går sintheten ut av meg",
    tips:"Pusteøvelse. Snakk om sinne som følelse." },
  { id:84, tittel:"Vi deler", kategori:"sang", alder:"2-5 år", rammeplan:["etikk","naermiljo"], melodi:"Egenkomponert",
    tekst:"Du har ett, jeg har ett\nVi deler nå, og det er rett\nDeling gjør oss alle glad\nIngen står helt alene",
    tips:"Lek med deling – kake, leker, plass." },
  { id:85, tittel:"En klem til deg", kategori:"sang", alder:"1-4 år", rammeplan:["etikk","kropp"], melodi:"Egenkomponert",
    tekst:"En klem, en klem, en klem til deg\nEn klem, en klem fra meg\nKlemmer varmer hele dagen\nKlemmer gjør oss sterke",
    tips:"Klem hverandre (med samtykke). Snakk om når klemmer er greit." },
  { id:86, tittel:"Takk for maten", kategori:"sang", alder:"1-5 år", rammeplan:["etikk","kropp"], melodi:"Egenkomponert",
    tekst:"Takk for maten, fin og god\nTakk for alt vi har på bord\nTakk til alle som har laget\nDenne maten vi har spist",
    tips:"Si etter måltidet. Snakk om matens reise fra jord til bord." },
  { id:96, tittel:"Bilen min", kategori:"sang", alder:"1-5 år", rammeplan:["naermiljo","kropp"], melodi:"Egenkomponert",
    tekst:"Brrrrm, brrrrm, sier bilen min\nFire hjul som ruller fort\nFar og mor i forsetet\nVi kan reise hvor vi vil",
    tips:"Sitt i sirkel. Lag bil-lyder. Snakk om trafikk." },
  { id:98, tittel:"Toget tøff-tøff", kategori:"sang", alder:"1-5 år", rammeplan:["naermiljo","kropp"], melodi:"Egenkomponert",
    tekst:"Tøff-tøff-tøff, sier toget mitt\nKjører raskt på skinner blank\nGjennom skog og over bro\nFolk reiser fra hjem til hjem",
    tips:"Lag toget – stå i rekke. Tøff sammen." },
  { id:101, tittel:"Klapp-klapp regle", kategori:"regle", alder:"2-5 år", rammeplan:["kommunikasjon","kropp"], melodi:"Regle",
    tekst:"Klapp i hender, klapp på lår\nKlapp på hodet, klapp på tå\nKlapp så høyt og klapp så lavt\nKlapp så alle hører meg",
    tips:"Klappe-mønster. God for rytmeforståelse." },
  { id:102, tittel:"Tipp-tapp regle", kategori:"regle", alder:"1-4 år", rammeplan:["kommunikasjon","kropp"], melodi:"Regle",
    tekst:"Tipp-tapp, tipp-tapp\nLille mus i hus\nTipp-tapp, tipp-tapp\nKrump som en lus",
    tips:"Tipp på lår eller bord med fingrene. Rytmisk." },
  { id:103, tittel:"Værregle", kategori:"regle", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Regle",
    tekst:"Regn, regn, gå din vei\nKom igjen en annen dag\nLille barnet vil gå ut\nOg leke i den varme sol",
    tips:"Ute når det regner og slutter. Tradisjonsbevisst." },
  { id:104, tittel:"Vente-regle", kategori:"regle", alder:"2-5 år", rammeplan:["kommunikasjon"], melodi:"Regle",
    tekst:"En, to, tre, vi venter litt\nFire, fem, seks, nå er det mitt\nSyv, åtte, ni, og ti igjen\nNå har turen kommet hen",
    tips:"Bruk i situasjoner som krever venting." },
  { id:105, tittel:"Hare-regle", kategori:"regle", alder:"2-5 år", rammeplan:["natur","kropp"], melodi:"Regle",
    tekst:"Lille hare, hopp, hopp, hopp\nOver gress og over stokk\nVisp med halen, ører opp\nNå er haren lett som korr",
    tips:"Hoppe som harer. Bevegelseslek." },
  { id:106, tittel:"Bil-regle", kategori:"regle", alder:"2-5 år", rammeplan:["naermiljo","kropp"], melodi:"Regle",
    tekst:"Brum-brum-brum, kjører bilen\nGjennom byen, over broa\nStopp ved rødt og kjør på grønt\nTrafikkregler følger jeg",
    tips:"Lære trafikkregler gjennom lek." },
  { id:107, tittel:"Mat-regle", kategori:"regle", alder:"1-5 år", rammeplan:["kropp","kommunikasjon"], melodi:"Regle",
    tekst:"Ett, to, tre, jeg spiser nå\nFire, fem, mer skal jeg ha\nSeks og syv, magen blir fin\nMmmm, så god er maten min",
    tips:"Før måltidet. Bygger forventning." },
  { id:108, tittel:"Venner-regle", kategori:"regle", alder:"2-5 år", rammeplan:["etikk","kommunikasjon"], melodi:"Regle",
    tekst:"Du er min venn, jeg er din\nHand i hand vi går så fin\nDeler, hjelper, ler i lag\nVenner hele hverdag",
    tips:"Lag par. Hold hverandre i hånda." },
  { id:109, tittel:"Dyr-regle", kategori:"regle", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Regle",
    tekst:"Mjau, vov, mø og bæ\nNøff og kvekk og bæ-bæ\nDyrene har sin egen tale\nKan du gjette hvem som ler?",
    tips:"Gjette hvilket dyr som sier hva." },
  { id:110, tittel:"Farger-regle", kategori:"regle", alder:"2-5 år", rammeplan:["kunst","kommunikasjon"], melodi:"Regle",
    tekst:"Rød og blå og gul og grønn\nFiolett, oransje, brun og bleik\nFarger overalt jeg ser\nVerden vakker, alle gleder",
    tips:"Pek på farger i rommet mens du sier dem." },
  { id:111, tittel:"Form-regle", kategori:"regle", alder:"3-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Regle",
    tekst:"Sirkel, firkant, trekant blå\nRektangel også her vi har\nFormer rundt oss overalt\nLet og finn dem alle helt",
    tips:"Finn former i rommet etter regla." },
  { id:112, tittel:"Tall-regle", kategori:"regle", alder:"2-5 år", rammeplan:["antall"], melodi:"Regle",
    tekst:"En blyant, to bøker, tre kopper på rad\nFire stoler, fem lyspærer, seks barn så glad\nSyv vinduer, åtte sko, ni leker står\nTi små venner i barnehagen vår",
    tips:"Pek og tell mens du resiterer." },
  { id:113, tittel:"Bokstav-regle", kategori:"regle", alder:"4-6 år", rammeplan:["kommunikasjon"], melodi:"Regle",
    tekst:"A er for and og B for bjørn\nC og D og E i en hjørn\nF for fugl og G for gris\nBokstavene er nye lis",
    tips:"Vis bokstavkort. Snakk om lyder." },
  { id:114, tittel:"Eventyr-regle", kategori:"regle", alder:"3-6 år", rammeplan:["kommunikasjon","kunst"], melodi:"Regle",
    tekst:"Det var en gang, langt langt borte\nKonge, dronning, troll og prins\nDe levde lykkelig hele tiden\nOg eventyret slutter her",
    tips:"Innleder fortellerstund. Skaper forventning." },
  { id:115, tittel:"Klokke-regle", kategori:"regle", alder:"3-6 år", rammeplan:["antall","kommunikasjon"], melodi:"Regle",
    tekst:"Tikk-takk, tikk-takk, sier klokka\nMorgen, dag og kveld og natt\nTimene går runde og rundt\nTiden følger sin lille takt",
    tips:"Lag tikk-takk-lyder. Snakk om tid." },
  { id:116, tittel:"Bevegelse-regle", kategori:"regle", alder:"1-5 år", rammeplan:["kropp"], melodi:"Regle",
    tekst:"Strekk deg høyt, bøy deg lavt\nVri til høyre, vri til venstre\nHopp en gang og snurr deg rundt\nOg så stå helt stille",
    tips:"Bevegelses-pause. Avslutter med stille." },
  { id:117, tittel:"Natur-regle", kategori:"regle", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Regle",
    tekst:"Sol og måne, jord og hav\nFjell og dal og elv og strand\nNaturen er vårt felles hjem\nVi tar vare på den hver dag",
    tips:"Snakk om bærekraft og natur." },
  { id:118, tittel:"Hus-regle", kategori:"regle", alder:"2-5 år", rammeplan:["naermiljo","kommunikasjon"], melodi:"Regle",
    tekst:"Dette er huset mitt så fint\nDør og vindu, tak og pipe\nInne sitter venner her\nVarmt og trygt og koselig nå",
    tips:"Tegn hus mens du sier regla." },
  { id:119, tittel:"Familie-regle", kategori:"regle", alder:"2-5 år", rammeplan:["etikk","naermiljo"], melodi:"Regle",
    tekst:"Mor og far, søsken to\nBesteforeldre kommer på besøk\nKusiner, fettere, onkler stor\nFamilien er min trygge bo",
    tips:"Snakk om hvem som er i familien." },
  { id:120, tittel:"Skole-regle", kategori:"regle", alder:"4-6 år", rammeplan:["naermiljo","kommunikasjon"], melodi:"Regle",
    tekst:"Snart skal jeg på skolen gå\nLære lese, skrive, telle så\nNye venner møter jeg\nEventyr venter, gleder meg",
    tips:"Forbered storbarna på skolestart." },
  { id:121, tittel:"Sirkel-regle", kategori:"regle", alder:"2-5 år", rammeplan:["kommunikasjon","kropp"], melodi:"Regle",
    tekst:"Vi går rundt og rundt og rundt\nHand i hand, så glad og munt\nSirkel stor og sirkel fin\nAlle med, både din og min",
    tips:"Gå i ring sammen i samlingsstund." },
  { id:122, tittel:"Avslutnings-regle", kategori:"regle", alder:"1-6 år", rammeplan:["kommunikasjon","etikk"], melodi:"Regle",
    tekst:"Nå er samlingsstunden slutt\nVi har lekt og sunget gutt\nTakk for stunden, takk for sang\nHa en fin dag, alle sammen!",
    tips:"Avslutter samlingsstunden ryddig." },
];

const AKTIVITETER = [
  { id:1, tittel:"Fargeblanding med vann", kategori:"kreativ", alder:"2-6 år", rammeplan:["kunst","natur"],
    hva:"Barna blander primærfarger og oppdager nye farger gjennom eksperimentering.",
    hvordan:"Sett opp klare glass med vann. Tilsett matfarge i rød, gul og blå. Gi barna pipetter og la dem blande fargene. Observer hva som skjer når primærfarger blandes. Dokumenter med tegning.",
    hvorfor:"Utforskning av farger stimulerer kreativitet og vitenskapelig nysgjerrighet. Kobles til kunst og naturfag. Gir sanseerfaringer og mestringsfølelse.",
    materialer:"Klare glass, vann, matfarge, pipetter, tegneark", tid:"30-45 min", gruppe:"4-8 barn" },
  { id:2, tittel:"Natursti med oppdragskort", kategori:"ute", alder:"2-6 år", rammeplan:["natur","kropp"],
    hva:"Naturvandring der barna løser oppgaver underveis med bildebaserte oppdragskort.",
    hvordan:"Lag oppdragskort med bilder: finn en kongle, noe mykt, noe hardt, noe levende, et spindelvev, noe gult. La barna jobbe i par. Samle i bøtter. Snakk om funnene etterpå.",
    hvorfor:"Fremmer naturkjennskap, motorikk og samarbeid. Stimulerer undring og glede over naturen. Kobles til bærekraft.",
    materialer:"Oppdragskort (laminert), bøtter, lupe, naturbestemmelsesnøkkel", tid:"1-2 timer", gruppe:"Hele gruppa i par" },
  { id:3, tittel:"Matematikk med naturmaterialer", kategori:"matematikk", alder:"3-6 år", rammeplan:["antall","natur"],
    hva:"Samle naturmaterialer og bruk dem til sortering, telling og mønstre.",
    hvordan:"Samle kongler, steiner, blader, eikenøtter. Sorter etter størrelse, farge og type. Tell i hver gruppe. Lag mønstre på bakken. Mål og sammenlign lengder.",
    hvorfor:"Matematisk forståelse sitter bedre med konkrete materialer i naturlig kontekst. Kobler natur og antall.",
    materialer:"Bøtter, sorteringsbrett, tallkort, målebånd", tid:"45-60 min", gruppe:"3-6 barn" },
  { id:4, tittel:"Dramatisering av eventyr", kategori:"drama", alder:"3-6 år", rammeplan:["kommunikasjon","kunst","etikk"],
    hva:"Barna dramatiserer et kjent eventyr med roller, kostymer og rekvisitter.",
    hvordan:"Les eventyret to ganger. La barna velge roller. Øv enkle replikker. Bruk enkle kostymer. Fremfør for de andre. Reflekter etterpå: 'Hva lærte vi?'",
    hvorfor:"Styrker språk, empati, kreativitet og samarbeid. Bearbeider verdier og mellommenneskelige temaer.",
    materialer:"Kostymekasse, eventyrbok, enkle rekvisitter", tid:"45-90 min", gruppe:"5-10 barn" },
  { id:5, tittel:"Leire og fri forming", kategori:"kreativ", alder:"2-6 år", rammeplan:["kunst","kropp"],
    hva:"Fri og veiledet forming med leire eller modellermasse.",
    hvordan:"Gi barna leire og enkle verktøy (kjevle, stikker). La dem forme fritt eller gi tema. Vis teknikker: klemme, rulle, kjevle. La produktene tørke og mal dem.",
    hvorfor:"Utvikling av finmotorikk, sanseerfaringer og kreativt uttrykk. Prosessen er viktigere enn produktet.",
    materialer:"Leire/modellermasse, verktøy, arbeidsmatte, maling", tid:"45-60 min", gruppe:"4-8 barn" },
  { id:6, tittel:"Filosofisk samtale (P4C)", kategori:"samtale", alder:"4-6 år", rammeplan:["etikk","kommunikasjon","naermiljo"],
    hva:"Åpen filosofisk samtale om store og eksistensielle spørsmål tilpasset barnas nivå.",
    hvordan:"Sitt i sirkel. Bruk snakkepinne. Still åpent spørsmål: 'Hva er en god venn?', 'Hva er rettferdig?'. Lytt aktivt uten å evaluere svarene. La undringen leve. Oppsummer til slutt.",
    hvorfor:"Styrker refleksjonsevne, empati og demokratisk deltakelse. Gir barna eierskap til egne tanker. P4C-metoden.",
    materialer:"Snakkepinne, sitteunderlag, evt. bildekort med dilemmaer", tid:"20-30 min", gruppe:"6-12 barn" },
  { id:7, tittel:"Baking av brød", kategori:"mat", alder:"2-6 år", rammeplan:["kropp","antall","kommunikasjon"],
    hva:"Barna baker brød fra bunnen av og lærer om ingredienser og prosessen.",
    hvordan:"Mål ingredienser sammen og tell. Elt deig – snakk om hva som skjer. Sett til heving og observer. Form brød og stek. Spis felles og snakk om kosthold og smak.",
    hvorfor:"Integrerer matematikk (måling), naturfag (gjær, heving), motorikk og kosthold. Skapende med ekte resultat.",
    materialer:"Mel, gjær, salt, vann, bolle, kjøkkenredskaper, stekeovn", tid:"2-3 timer (inkl. heving)", gruppe:"4-8 barn" },
  { id:8, tittel:"Fingermaleri og sansing", kategori:"kreativ", alder:"1-4 år", rammeplan:["kunst","kropp"],
    hva:"Fri ekspressiv maling med fingerfarger på store ark – ingen krav om motiv.",
    hvordan:"Dekk bordet med plast. Gi store ark og fingerfarger. La barna male fritt med fingre, håndflater og føtter. Ikke gi instruksjoner. Bruk musikk som inspirasjon. Snakk om farger og følelser.",
    hvorfor:"Sansestimulering og kreativt uttrykk uten krav. Fremmer selvtillit og motorikk. Prosesskunst.",
    materialer:"Fingerfarger, store ark, plast, musikk", tid:"30-45 min", gruppe:"3-6 barn" },
  { id:9, tittel:"Konstruksjon med naturmaterialer", kategori:"kreativ", alder:"3-6 år", rammeplan:["natur","antall","kunst"],
    hva:"Bygg tårn, hus og skulpturer av naturmaterialer fra turen.",
    hvordan:"Samle kvist, steiner, kongler, bark og mose. Utfordre barna: 'Bygg det høyeste tårnet', 'Lag et hus til et dyr'. Bruk leire som feste. Fotografer verkene og vis dem frem.",
    hvorfor:"Kombinerer kreativitet, naturkunnskap og matematisk tenkning. Fremmer samarbeid og problemløsning.",
    materialer:"Naturmaterialer, leireklumper, arbeidsflate, kamera", tid:"45-60 min", gruppe:"3-6 barn" },
  { id:10, tittel:"Skattejakt i nærmiljøet", kategori:"ute", alder:"3-6 år", rammeplan:["naermiljo","antall","kropp"],
    hva:"Organisert skattejakt med enkelt kart og bildebaserte ledetråder i nærmiljøet.",
    hvordan:"Lag et enkelt kart. Legg ut ledetråder (bilder av steder). La barna i grupper følge kartet. Skatten kan være en felles aktivitet eller symbolsk premie.",
    hvorfor:"Kartlesing, romforståelse, kunnskap om nærmiljøet, samarbeid og motorikk. Spenning og mestring.",
    materialer:"Kart, laminerte ledetråder, 'skatt'", tid:"1-2 timer", gruppe:"Hele gruppa i grupper" },
  { id:11, tittel:"Dans og bevegelsesfortelling", kategori:"drama", alder:"2-6 år", rammeplan:["kunst","kommunikasjon","kropp"],
    hva:"Fortell en historie gjennom bevegelse og dans – kroppen er instrumentet.",
    hvordan:"Velg en kort fortelling. Fortell sakte mens barna viser den med kroppen: 'Nå er vi et lite frø som vokser...' Bruk stemme og musikk. La barna finne sine egne bevegelser.",
    hvorfor:"Kobler språk, kropp og kreativitet. Gir barna et annet uttrykksmiddel. Stimulerer romlig forståelse.",
    materialer:"Musikk, enkelt teppe/scene, evt. kostymer", tid:"20-30 min", gruppe:"Alle barn" },
  { id:12, tittel:"Vanneksperimenter", kategori:"natur", alder:"3-6 år", rammeplan:["natur","antall"],
    hva:"Utforske vannets egenskaper gjennom tre enkle eksperimenter.",
    hvordan:"Eks 1: Hva flyter og synker? Eksperimenter med ulike gjenstander. Eks 2: Farget ismelting – observer fargeblanding. Eks 3: Hva løser seg i vann? Lag hypoteser, test og diskuter.",
    hvorfor:"Vitenskapelig tenkning: observere, stille hypoteser, teste og konkludere. Matematikk om volum og mengde.",
    materialer:"Vannboller, ulike gjenstander, isbiter med matfarge, sukker/salt/sand", tid:"45-60 min", gruppe:"4-8 barn" },
  { id:13, tittel:"Musikk-verksted: lag instrumenter", kategori:"musikk", alder:"2-6 år", rammeplan:["kunst","kommunikasjon","kropp"],
    hva:"Lag instrumenter av naturmaterialer og hverdagsgjenstander og spill orkester.",
    hvordan:"Lag: risle-egg (ris i plastflasker), trommer (kasserolle og pinne), rangle (pinner med knapper). Øv grunnrytme. Spill til kjent sang. La barna lede orkesteret etter tur.",
    hvorfor:"Musikk og rytme styrker matematisk sans, koordinering og samarbeid. Kreativt skaperarbeid.",
    materialer:"Plastflasker, ris/sand, tomme bokser, pinner, gummistrikker", tid:"45-60 min", gruppe:"5-12 barn" },
  { id:14, tittel:"Naturbok – vår dokumentasjonsbok", kategori:"natur", alder:"3-6 år", rammeplan:["natur","kommunikasjon","kunst"],
    hva:"Barna lager egen naturbok med innsamlede planter, tegninger og observasjoner.",
    hvordan:"Gå på tur og samle blader, blomster og fjær. Press plantene. Lim inn i bok. Tegn og beskriv funnene (voksne skriver barnets ord). Bruk boken på fremtidige turer.",
    hvorfor:"Kombinerer skriving, naturkunnskap, kunst og vitenskapelig dokumentasjon. Gir stolthet og mestring.",
    materialer:"Tom notatbok, lim, presse (tunge bøker), fargeblyanter", tid:"2-3 økter", gruppe:"3-6 barn" },
  { id:15, tittel:"Vennskapsprosjekt", kategori:"samtale", alder:"3-6 år", rammeplan:["etikk","naermiljo","kommunikasjon"],
    hva:"Tverrfaglig prosjekt om vennskap, fellesskap og hvem vi er.",
    hvordan:"Uke 1: Tegn vennen din. Uke 2: Intervju hverandre (hva liker du?). Uke 3: Lag felles venneplass med bilder. Uke 4: Lag 'venneregler' demokratisk. Avslutt med vennskapsfest.",
    hvorfor:"Bygger sosialkompetanse, demokratisk deltakelse og identitet. Integrerer kunst, språk, etikk og nærmiljø.",
    materialer:"Tegneutstyr, kamera, fotoprint, stor plakat", tid:"4 uker", gruppe:"Hele gruppa" },
  { id:16, tittel:"Matlaging med matematikk", kategori:"matematikk", alder:"3-6 år", rammeplan:["antall","kropp"],
    hva:"Bruk matlaging aktivt for å lære tall, mål og mengder.",
    hvordan:"Bruk en oppskrift med bilder. Mål ingredienser: 2 kopper mel, 3 egg. Tell høyt. Vei på kjøkkenvekt. Doble oppskriften for de eldste. Beskriv: mer/mindre, full/tom.",
    hvorfor:"Matematikk i autentisk kontekst er mest effektivt. Kobler tall til virkelighet og dagligliv.",
    materialer:"Bildeoppskrift, ingredienser, kjøkkenvekt, kopper/skjeer", tid:"60-90 min", gruppe:"4-6 barn" },
  { id:17, tittel:"Portrettmaling av hverandre", kategori:"kreativ", alder:"4-6 år", rammeplan:["kunst","kommunikasjon","etikk"],
    hva:"Barna maler portrett av hverandre og reflekterer over likhet og ulikhet.",
    hvordan:"Sett barna parvis – en sitter stille, en maler. Ikke vis underveis. Vis frem og snakk: 'Hva liker du ved bildet?', 'Hva er likt, hva er ulikt?' Snakk om at vi alle er forskjellige.",
    hvorfor:"Fremmer observasjon, empati og respekt for ulikheter. Kobler kunst til identitet og mangfold.",
    materialer:"Akvarell eller tempera, pensler, papir", tid:"45-60 min", gruppe:"Parvis, alle" },
  { id:18, tittel:"Hagedyrking gjennom sesongen", kategori:"natur", alder:"2-6 år", rammeplan:["natur","kropp","antall"],
    hva:"Plant, stell og høst grønnsaker og blomster gjennom hele vekstsesongen.",
    hvordan:"Bruk pallekarm eller potter. Plant frø av reddik, salat og blomster. Gi barna ansvar for sin plante. Vann daglig, observer vekst, mål høyde ukentlig. Lag mat av det dere høster.",
    hvorfor:"Langtidsprosjekt med ansvar, naturforståelse, bærekraft og matematikk. Eierskap og stolthet.",
    materialer:"Pallekarm/potter, jord, frø, vanning, linjal, notatbok", tid:"Hele sesongen (april-sept)", gruppe:"Hele gruppa" },
  { id:19, tittel:"Hinderbane ute", kategori:"motorikk", alder:"1-6 år", rammeplan:["kropp"],
    hva:"Lag en variert hinderbane ute med balanse, klatring og hopping.",
    hvordan:"Sett opp: balansebjelke av planke, tunnell av dekk, humper av madrasser, kaste-mål med ring. Vis én gang, la barna prøve i eget tempo. Øk vanskelighetsgraden for de eldste.",
    hvorfor:"Grovmotorikk, koordinasjon og mestring. Alle kan delta på sitt nivå – gir mestringsfølelse.",
    materialer:"Planker, dekk, madrasser, kjegler, matter", tid:"30-60 min", gruppe:"Alle" },
  { id:20, tittel:"Stafettlek med variasjon", kategori:"motorikk", alder:"3-6 år", rammeplan:["kropp","naermiljo"],
    hva:"Stafett med ulike bevegelsesformer: hoppe, krabbe, gå baklengs, rulle.",
    hvordan:"Del i lag (maks 4-5 barn). Hver runde er ny bevegelsesform. Variér: balansere egg på skje, rulle ball med nesen, hoppe på ett bein. Avslutt med fri jubel.",
    hvorfor:"Samarbeid, motorikk og sportslig glede. Laget feirer hverandre – bygger fellesskap.",
    materialer:"Kjegler, skjeer, baller, egg (plast)", tid:"30-45 min", gruppe:"10-20 barn" },
  { id:21, tittel:"Yoga og pusteteknikker for barn", kategori:"motorikk", alder:"2-6 år", rammeplan:["kropp","etikk"],
    hva:"Enkel barneyoga med dyre-posisjoner og pusteteknikker for ro.",
    hvordan:"Pusteøvelse: pust inn som en bjørn, ut som en slange. Posisjoner: tretreet, katten, hunden, frosken. Bruk bildekort. Avslutt med hvile: 'ligge som en stein'.",
    hvorfor:"Kroppsbeherskelse, selvregulering og ro. Gir verktøy for å håndtere følelser og stress.",
    materialer:"Yogamatter, bildekort med dyreposisjoner, rolig musikk", tid:"20-30 min", gruppe:"Alle" },
  { id:22, tittel:"Dansestudio – fri dans", kategori:"musikk", alder:"1-6 år", rammeplan:["kunst","kropp"],
    hva:"Fri dans til ulik musikk – hvert barn danser på sin måte.",
    hvordan:"Spill ulike sjangre: norsk folkemusikk, samba, jazz, klassisk. Observer hvordan barna tilpasser bevegelsene til musikken. La dem lede hverandre. Avslutt med sakte dans.",
    hvorfor:"Kreativt uttrykk, rytmesans og glede. Ingen fasit – alle danser riktig.",
    materialer:"Musikkhøyttaler, ulik musikk, rom med plass", tid:"20-40 min", gruppe:"Alle" },
  { id:23, tittel:"Trommeworkshop", kategori:"musikk", alder:"2-6 år", rammeplan:["kunst","kommunikasjon"],
    hva:"Tromme og perkusjon med hjemmelagde instrumenter.",
    hvordan:"Lag trommer av bokser og pappkrus. Øv grunnrytme: 1-2-3-4. Lek 'ekko': voksen trommer mønster, barna gjentar. Bygg opp til felles rytme-orkester.",
    hvorfor:"Rytmesans, koordinasjon og matematisk mønsterforståelse. Samspill og lytting.",
    materialer:"Tomme bokser/krus, trebiter som trommes, elastikker", tid:"30-45 min", gruppe:"5-15 barn" },
  { id:24, tittel:"Sangskriving med barna", kategori:"musikk", alder:"4-6 år", rammeplan:["kommunikasjon","kunst"],
    hva:"Barna lager sin egen sang om et tema de velger.",
    hvordan:"Velg tema (f.eks. 'barnehagen vår'). Barna foreslår ord og setninger. Du hjelper med rytme og rim. Syng sangen til en kjent melodi (f.eks. Bjørnen sover). Øv og fremfør.",
    hvorfor:"Kreativ språkutvikling, rim og rytme. Stolthet og eierskap til eget kunstnerisk uttrykk.",
    materialer:"Papir til å skrive tekst, evt. keyboard eller gitar", tid:"45-60 min", gruppe:"5-10 barn" },
  { id:25, tittel:"Lydkart – hva hører vi?", kategori:"musikk", alder:"3-6 år", rammeplan:["natur","kommunikasjon"],
    hva:"Lytt til omgivelsene og tegn et kart over hva dere hører.",
    hvordan:"Sett dere stille ute i 2 min og lytt. Hvem hørte hva? Tegn et 'lydkart' på papir: fugl til høyre, trafikk langt borte, vind osv. Sammenlign lydene inne og ute.",
    hvorfor:"Auditiv oppmerksomhet og naturforståelse. Kobler lyd, romforståelse og tegning.",
    materialer:"Papir, fargeblyanter, stille sted ute", tid:"30 min", gruppe:"4-8 barn" },
  { id:26, tittel:"Skyggeteater med lommelykt", kategori:"drama", alder:"3-6 år", rammeplan:["kunst","kommunikasjon"],
    hva:"Lag et skyggeteater med figurer og lommelykt bak et laken.",
    hvordan:"Heng opp hvitt laken. Sett lommelykt bak. Lag figurer av papp på pinne. Øv bevegelser. Fortell en liten historie med figurene. La barna lage egne figurer og fortellinger.",
    hvorfor:"Kreativ historiefortelling, romforståelse (lys og skygge) og samarbeid.",
    materialer:"Hvitt laken, lommelykt, papp, pinner, saks, lim", tid:"45-60 min", gruppe:"4-8 barn" },
  { id:27, tittel:"Dukke- og marionetteater", kategori:"drama", alder:"2-6 år", rammeplan:["kommunikasjon","kunst"],
    hva:"Barna lager og fremfører et dukketeater med håndlagede dukker.",
    hvordan:"Lag sokkeldukker av gamle sokker. Tegn ansikt og lim på hår. Øv med dukken: hva sier den? Fremfør for resten av barnehagen. Barna styrer alt.",
    hvorfor:"Språkutvikling, kreativitet og selvtillit. Å tale gjennom en dukke gjør det tryggere.",
    materialer:"Gamle sokker, knapper, ulltråd, lim, stoff, tusjpenner", tid:"2 økter á 45 min", gruppe:"3-6 barn" },
  { id:28, tittel:"Improvisasjonsteater", kategori:"drama", alder:"4-6 år", rammeplan:["kommunikasjon","etikk"],
    hva:"Enkle improvisasjonsøvelser der barna bygger historier spontant.",
    hvordan:"Øvelse 1: 'Ja, og...' – bygg på hverandres ideer. Øvelse 2: Vær et dyr uten å si hva. Øvelse 3: Frys og bytt! Avslutt med felles improvisert scene.",
    hvorfor:"Lytting, samarbeid, spontanitet og kreativ tenkning. Trygger barna på å prøve og feile.",
    materialer:"Ingenting – eller enkle kostymer", tid:"30-40 min", gruppe:"6-12 barn" },
  { id:29, tittel:"Fortellerstein – runde historier", kategori:"samtale", alder:"3-6 år", rammeplan:["kommunikasjon","etikk"],
    hva:"Barna forteller en felles historie der alle bidrar med et setning.",
    hvordan:"Sett i ring. Gi en 'fortellerstein'. Den som holder stenen fortsetter historien med én setning. 'Det var en gang en bjørn som...' Alle må si noe. Ingen svar er feil.",
    hvorfor:"Kreativ språkutvikling, lytting og respekt for andres bidrag. Alle stemmer er like viktige.",
    materialer:"En fin stein (fortellerstein)", tid:"15-20 min", gruppe:"6-15 barn" },
  { id:30, tittel:"Intervjurunde – bli kjent", kategori:"samtale", alder:"4-6 år", rammeplan:["kommunikasjon","naermiljo"],
    hva:"Barna intervjuer hverandre med enkle spørsmål og presenterer sin venn.",
    hvordan:"Lag spørsmålskort: hva liker du best? Hva er du redd for? Hva drømmer du om? Sett barna i par. Byt roller. Presenter hverandre for gruppa: 'Min venn heter...'",
    hvorfor:"Aktiv lytting, empati og kunnskap om hverandre. Demokratisk ytring.",
    materialer:"Spørsmålskort (bildekort for de minste)", tid:"30-45 min", gruppe:"Alle parvis" },
  { id:31, tittel:"Samlingsstund med dagsplan", kategori:"samtale", alder:"1-6 år", rammeplan:["kommunikasjon","antall"],
    hva:"Strukturert morgensamling med dagsplan, sang, dato og været.",
    hvordan:"Sang: God morgen. Dato og dag (kalender). Vær ute (barna observerer). Dagsplan med bilder. 'Hva gleder du deg til i dag?' La barna sette opp bildeplan.",
    hvorfor:"Forutsigbarhet og trygghet. Matematisk tidsbegrep og demokratisk deltakelse i planlegging.",
    materialer:"Kalender, bildedagsplan, termometer ute, snakkepinne", tid:"15-20 min", gruppe:"Alle" },
  { id:32, tittel:"Konfliktløsning med fredsbord", kategori:"samtale", alder:"3-6 år", rammeplan:["etikk","naermiljo"],
    hva:"Lær barna å løse konflikter selv ved et fast 'fredsbord'.",
    hvordan:"Sett opp et bord med to stoler og fredspinne. Regler: en snakker, en lytter. Fortell hva du føler (jeg-budskap). Finn løsning sammen. Voksen fasiliterer kun ved behov.",
    hvorfor:"Selvregulering, empati og demokratisk konflikthåndtering. Gir barna livsverktøy.",
    materialer:"Bord, to stoler, fredspinne, eventuelt bilder av følelser", tid:"15-30 min ved behov", gruppe:"2 barn" },
  { id:33, tittel:"Vær-stasjon og målinger", kategori:"natur", alder:"3-6 år", rammeplan:["natur","antall"],
    hva:"Bygg en enkel værstasjon og gjør daglige målinger.",
    hvordan:"Lag: regnmåler av flaske, vindpil av pinn og papir, termometer. Mål hver morgen. Lag et ukeskjema med tegninger. Spå været: Hva tror dere? Sammenlign med faktisk vær.",
    hvorfor:"Vitenskapelig metode, tallforståelse og naturkunnskap. Daglig rutine.",
    materialer:"Plastflasker, linjal, papir, vindpil (pinne + pappfane), termometer", tid:"10 min/dag + ukentlig gjennomgang", gruppe:"Alle" },
  { id:34, tittel:"Insektjakt og naturlogg", kategori:"natur", alder:"2-6 år", rammeplan:["natur","kommunikasjon"],
    hva:"Jakten på insekter og småkryp med logg og dokumentasjon.",
    hvordan:"Gå ut med loupe og hvit boks. Let under steiner, blader og bark. Hva finner vi? Tegn det i naturloggen. Telle bein: 6 = insekt, 8 = edderkopp. Sett dem forsiktig tilbake.",
    hvorfor:"Respekt for naturen, vitenskapelig nysgjerrighet og telletrening. Naturkjærlighet.",
    materialer:"Loupe, hvit boks, naturlogg (tom bok), fargeblyanter", tid:"45-60 min", gruppe:"3-6 barn" },
  { id:35, tittel:"Dyrespor og naturdetektiv", kategori:"natur", alder:"2-6 år", rammeplan:["natur","kommunikasjon"],
    hva:"Lei etter dyrespor og tegn til dyrenes liv.",
    hvordan:"Gå tur i skog eller park. Let etter: spor i gjørme, fjær, hår, gnagde kongler, hull i trær. Hva levde her? Bruk sporbok. Gjett dyret. Tegn sporet hjemme.",
    hvorfor:"Naturobservasjon, deduksjon og kjærlighet til naturen. Spenning og oppdagelse.",
    materialer:"Sporbok, fargeblyanter, evt. gipsepulver for avtrykk", tid:"1-2 timer", gruppe:"Hele gruppa" },
  { id:36, tittel:"Lage fuglekasse eller insekthotell", kategori:"natur", alder:"3-6 år", rammeplan:["natur","kropp"],
    hva:"Bygg en fuglekasse eller et insekthotell av naturmaterialer.",
    hvordan:"Fuglekasse: enkle bord satt sammen med hammer og spiker (voksen hjelper). Insekthotell: fyll trerammer med kongler, bark, pinner, halmstrå. Heng opp og observer hvem som besøker.",
    hvorfor:"Bærekraft og ansvar for naturen. Motorikk (hamring). Kunnskap om dyrs behov.",
    materialer:"Trebord, spiker, hammer, kongler, bark, pinner, halmstrå", tid:"2 timer", gruppe:"4-8 barn" },
  { id:37, tittel:"Kompost – fra avfall til jord", kategori:"natur", alder:"3-6 år", rammeplan:["natur","naermiljo"],
    hva:"Lær om kompostering og naturens kretsløp.",
    hvordan:"Forklar: matrester blir til jord. Start en minikomposter (bøtte med hull). Tilsett: grønnsaksrester, papir, blader. Rør ukentlig. Etter noen uker: se på forandringen. Bruk komposten i hagen.",
    hvorfor:"Bærekraft, naturprosesser og ansvar for miljøet. Anskueliggjør biologisk nedbrytning.",
    materialer:"Bøtte med lokk (hull i), matrester, blader, jord", tid:"Løpende over uker", gruppe:"Alle" },
  { id:38, tittel:"Sandforming og sandkonstruksjon", kategori:"kreativ", alder:"1-6 år", rammeplan:["kunst","kropp","antall"],
    hva:"Kreativ bygging og forming i sandkassa med vann og verktøy.",
    hvordan:"Tilsett vann i sanden. Bygg slott, veier, byer. Bruk former av ulike størrelser. Mål: hvor mange skuffer sand? Hva er høyest? Dekorér med natur.",
    hvorfor:"Sensorisk lek, romlig tenkning, matematikk (volum, mål) og kreativitet.",
    materialer:"Sandkasse, vann, former, spader, naturmaterialer", tid:"30-60 min", gruppe:"Fritt" },
  { id:39, tittel:"Legoby – bygg et samfunn", kategori:"kreativ", alder:"3-6 år", rammeplan:["antall","naermiljo","kommunikasjon"],
    hva:"Bygg en hel by med lego: hus, vei, park og butikk.",
    hvordan:"Start med kart (tegning på papir). Fordel roller: hvem bygger hva? Bygg over 2-3 dager. Lag innbyggere av legofigurer. Rollespill: 'bussen kommer', 'vi går i butikken'.",
    hvorfor:"Romlig tenkning, samfunnsforståelse, samarbeid og prosjektplanlegging.",
    materialer:"Lego/Duplo, papir til kart, figurer", tid:"2-3 dager", gruppe:"4-8 barn" },
  { id:40, tittel:"Papirfly og aerodynamikk", kategori:"kreativ", alder:"4-6 år", rammeplan:["natur","antall"],
    hva:"Fold papirfly og eksperimenter med flyving.",
    hvordan:"Lær to foldemetoder (enkel og avansert). Test: hvem flyr lengst? Høyest? Mål avstand med målebånd. Endre vingen og test igjen. Hva påvirker flyving?",
    hvorfor:"Naturvitenskapelig eksperimentering, mål og sammenligning. Årsak–virkning-forståelse.",
    materialer:"Papir (A4), målebånd, kritt for å markere", tid:"30-45 min", gruppe:"4-10 barn" },
  { id:42, tittel:"Naturmosaikk og land art", kategori:"kreativ", alder:"2-6 år", rammeplan:["kunst","natur"],
    hva:"Lag kunstinstallasjoner i naturen av det dere finner.",
    hvordan:"Samle materialer i naturen. Lag mønstre og bilder på bakken (mandala av blader, ansikt av steiner). Fotografer kunstverkene. Snakk om: hva vil du uttrykke?",
    hvorfor:"Kunstnerisk uttrykk i naturlig kontekst. Verglass for naturens materialer og former.",
    materialer:"Kamera/nettbrett, alt fra naturen", tid:"45-60 min", gruppe:"Alle" },
  { id:43, tittel:"Batikk og tekstilfarging", kategori:"kreativ", alder:"4-6 år", rammeplan:["kunst","kropp"],
    hva:"Farg tekstil med plantefarger eller fargestoff.",
    hvordan:"Brett og knyt tøystykket med gummistrikk (shibori). Dypp i vann med matfarge (eller kokk med løkskall for gult, rødkål for lilla). Åpne og se mønsteret!",
    hvorfor:"Estetisk sansing, kjemi (farge + tekstil) og kreativt uttrykk.",
    materialer:"Hvit bomullstøy, matfarge eller naturfarger, gummistrikk, gryte", tid:"60-90 min", gruppe:"4-8 barn" },
  { id:44, tittel:"Steinstabling og balanse", kategori:"kreativ", alder:"2-6 år", rammeplan:["natur","antall","kropp"],
    hva:"Stable steiner i tårn og finne balansepunktet.",
    hvordan:"Samle ulike steiner. Utfordring: stable 3, 5, 7 steiner uten at det velter. Hvilken stein passer øverst? Hvem klarte høyest tårn? Snakk om balanse og tyngdepunkt.",
    hvorfor:"Matematikk (telling og sammenligning), finmotorikk og fysikk (balanse).",
    materialer:"Steiner i ulike størrelser, rolig sted", tid:"20-40 min", gruppe:"Fritt" },
  { id:45, tittel:"Akvarell og salt-teknikk", kategori:"kreativ", alder:"3-6 år", rammeplan:["kunst"],
    hva:"Male med akvarell og strø på salt for magiske mønstre.",
    hvordan:"Mal bakgrunn med akvarell (bredt strøk, mye vann). Mens det er vått: strø på vanlig eller grovt salt. La tørke. Ta bort salt. Se de vakre krystallmønstrene!",
    hvorfor:"Estetisk undring, eksperimentering og kjemi (osmose). Prosesskunst.",
    materialer:"Akvarell, bredt pensel, tykt papir, salt (vanlig og grovt)", tid:"30 min + tørketid", gruppe:"4-10 barn" },
  { id:47, tittel:"Matlaging – smoothie-bar", kategori:"mat", alder:"2-6 år", rammeplan:["kropp","antall"],
    hva:"Barna lager sin egen smoothie og velger ingredienser.",
    hvordan:"Legg frem: banan, jordbær, eple, spinat, yogurt, melk. Barna velger 3 ingredienser. Mål mengder. Bland i blender (voksen hjelper). Smak – hva heter fargen? Hva smaker det som?",
    hvorfor:"Kosthold, sanseopplevelse og valgfrihet. Matematikk: mål og mengde.",
    materialer:"Frukt og grønt, yogurt, melk, blender, glass", tid:"30-45 min", gruppe:"4-8 barn" },
  { id:48, tittel:"Lage pizza fra bunnen", kategori:"mat", alder:"3-6 år", rammeplan:["kropp","antall","kommunikasjon"],
    hva:"Barna lager pizzabunn, saus og velger topping selv.",
    hvordan:"Lag deig sammen (mål og elt). Del opp – en til hvert barn. Trykk ut med hender. Tomat saus med skje. Topping: hvert barn velger. Stek. Spis og snakk om ingrediensene.",
    hvorfor:"Matematikk, motorikk, kosthold og eierskap. Det smakte ekstra godt fordi de laget det selv!",
    materialer:"Mel, gjær, salt, olje, tomatpuré, ost, topping-valg", tid:"2 timer", gruppe:"4-8 barn" },
  { id:50, tittel:"Sansebuffé – smak og lukt", kategori:"mat", alder:"1-6 år", rammeplan:["kropp","kommunikasjon"],
    hva:"Utforsk mat med alle sansene: se, lukte, kjenne, smake.",
    hvordan:"Bind for øynene. Gi en bit mat. Gjett: hva er dette? Luktetest: sitron, kanel, hvitløk. Teksturtest: mykt/hardt/grovt. Snakk om hvordan det smaker: søtt, surt, bittert, salt.",
    hvorfor:"Sanseutvikling, ordforråd for smak og tekstur. Modig prøving av ny mat.",
    materialer:"Ulike matvarer, bind for øynene, brett", tid:"20-30 min", gruppe:"4-8 barn" },
  { id:51, tittel:"Suppe av det vi finner", kategori:"mat", alder:"3-6 år", rammeplan:["kropp","natur","naermiljo"],
    hva:"Plukk urter og grønnsaker og lag suppe over bål eller komfyr.",
    hvordan:"Gå tur: plukk ugras (løvetann, syre, brennesle med hansker). Finn rotgrønnsaker i hagen. Skyll og skjær opp (voksen hjelper med kniv). Kok suppe. Sett ved bord ute.",
    hvorfor:"Matproduksjon fra naturens ressurser. Naturkunnskap og bærekraft.",
    materialer:"Hagekniv, hansker, kjele, vann, salt", tid:"2-3 timer", gruppe:"6-12 barn" },
  { id:52, tittel:"Frøplanting og kimingsprosessen", kategori:"natur", alder:"2-6 år", rammeplan:["natur","antall"],
    hva:"Plante frø og følge kimingsprosessen steg for steg.",
    hvordan:"Legg frø i glass med vått tørkepapir. Observer daglig: når sprekker frøet? Tegn veksten hver dag. Når frøet har røtter og blad: plant i jord. Hva trenger planten?",
    hvorfor:"Naturprosesser og vitenskapelig observasjon. Omsorg og ansvar.",
    materialer:"Frø (rask: reddik, karse), glass, tørkepapir, jord, potter", tid:"Løpende 2-3 uker", gruppe:"Alle" },
  { id:53, tittel:"Magneter og magnetisme", kategori:"natur", alder:"3-6 år", rammeplan:["natur","antall"],
    hva:"Utforsk magnetisme: hva tiltrekkes av magnet?",
    hvordan:"Gi hvert barn en magnet. Gå rundt: test ting i rommet og ute. Sorter: 'magnetisk' og 'ikke magnetisk'. Lag hypoteser: tror du denne er magnetisk? Test gjennom vann og papir.",
    hvorfor:"Vitenskapelig metode: observere, forutsi, teste og konkludere. Undring over naturkrefter.",
    materialer:"Magneter, boks med ulike gjenstander (mynt, tre, papir, jernskrue)", tid:"30-45 min", gruppe:"3-6 barn" },
  { id:55, tittel:"Bobleskaping og overflatespenning", kategori:"natur", alder:"2-6 år", rammeplan:["natur","kunst"],
    hva:"Lag boblor av ulike former og størrelser og utforsk overflatespenning.",
    hvordan:"Bland: vann + oppvaskmiddel + glyserin. Bruk rammer av ulik form (firkantet, trekantet). Hva skjer med boblen? Fang en boble i en annen. Prøv uten glyserin – hva skjer?",
    hvorfor:"Overflatespenning, geometri og naturvitenskapelig undring. Leken og vakker.",
    materialer:"Oppvaskmiddel, glyserin, vann, trådrammer, plast", tid:"30-45 min", gruppe:"Alle" },
  { id:56, tittel:"Telling og mønster med perler", kategori:"matematikk", alder:"3-6 år", rammeplan:["antall","kropp"],
    hva:"Lag halskjeder og armbånd med perlemønstre.",
    hvordan:"Start: rød-blå-rød-blå. Kan du fortsette mønsteret? Lag eget mønster. Tell perler: 5 av én farge, 3 av en annen. Lag et mønster med 3 farger. Hva er lengst – 10 store eller 15 små?",
    hvorfor:"Mønsterforståelse, telling og finmotorikk. Matematikk som skapende aktivitet.",
    materialer:"Perler i ulike farger og størrelser, tråd, nål (for de eldste)", tid:"30-45 min", gruppe:"3-6 barn" },
  { id:57, tittel:"Geometri med klosser og former", kategori:"matematikk", alder:"3-6 år", rammeplan:["antall"],
    hva:"Utforsk geometriske former: navn, egenskaper og bygging.",
    hvordan:"Legg former på gulvet: sirkel, firkant, trekant, rektangel. Telle sider og hjørner. Finn former i rommet. Bygg et hus med klossene – hvilke former trenger vi? Tegn husformen.",
    hvorfor:"Geometriforståelse og romlig tenkning. Matematisk language i kontekst.",
    materialer:"Geometriske klosser, linjal, papir og blyant", tid:"30-45 min", gruppe:"4-8 barn" },
  { id:58, tittel:"Tidslinje og vekstdokumentasjon", kategori:"matematikk", alder:"4-6 år", rammeplan:["antall","kommunikasjon"],
    hva:"Lag en tidslinje over barnehageåret med bilder og datoer.",
    hvordan:"Heng opp en lang strimmel papir. Marker: 1. januar til 31. desember. Lim på bilder fra aktiviteter. Hva skjedde i august? Hva skjer i desember? Hvem har bursdag i hvilken måned?",
    hvorfor:"Tidsbegrep, kalenderforståelse og matematisk historiefortelling.",
    materialer:"Lang papirremse, bilder, dato-stempel, lim", tid:"Løpende gjennom året", gruppe:"Alle" },
  { id:59, tittel:"Butikklek med ekte penger", kategori:"matematikk", alder:"4-6 år", rammeplan:["antall","naermiljo"],
    hva:"Rollespill: butikk med prislappper og ekte eller leke-penger.",
    hvordan:"Sett opp en butikk med varer fra barnehagen. Gi hvert barn en 'lommebok' med lekepenger. Prislapper: 1, 2, 5 kr. En er kasse, resten handler. Veksle penger. Bytt roller.",
    hvorfor:"Tallforståelse i autentisk kontekst, sosiale ferdigheter og rollelek.",
    materialer:"Lekepenger, kasse (skoeske), prislapper, varer (leker, frukt)", tid:"45-60 min", gruppe:"4-10 barn" },
  { id:60, tittel:"Klassifisering og Venn-diagram", kategori:"matematikk", alder:"4-6 år", rammeplan:["antall","kommunikasjon"],
    hva:"Sorter gjenstander i kategorier og vis overlapp i Venn-diagram.",
    hvordan:"Legg to hula-hoops delvis over hverandre. Tema: dyr som svømmer / dyr som flyr. I midten: dyr som gjør begge (and). Prøv andre tema: rødt / rundt / rød OG rund.",
    hvorfor:"Logisk tenkning, kategorisering og matematisk klassifisering.",
    materialer:"To hula-hoops, bilde-/bildekort av dyr og gjenstander", tid:"20-30 min", gruppe:"5-10 barn" },
  { id:62, tittel:"Rollelek: barnehage for dyrene", kategori:"rollelek", alder:"2-5 år", rammeplan:["kommunikasjon","etikk","naermiljo"],
    hva:"Barna leker barnehage der de er pedagogen og dyrene er barna.",
    hvordan:"Sett opp en liten 'barnehage' med stoler og bamser. Barna er pedagogene: de synger samlingssang, leser bok, serverer mat og passer på at 'barna' (bamse) har det bra.",
    hvorfor:"Rollelek lar barna bearbeide egne erfaringer og utvikle empati. Sosial kompetanse.",
    materialer:"Bamser og dyr, stoler, dukketinget, eventyrbøker", tid:"Fri lek", gruppe:"2-5 barn" },
  { id:63, tittel:"Rollelek: lege og sykehus", kategori:"rollelek", alder:"2-5 år", rammeplan:["kommunikasjon","kropp","naermiljo"],
    hva:"Sykehuslek med lege, sykepleier og pasient-roller.",
    hvordan:"Sett opp: venteværelse, undersøkelsesrom (legeveske, stetoskop). Rollen fordeles: lege, sykepleier, pasient. Legen undersøker og skriver resept. Apoteket gir medisin (lekemat).",
    hvorfor:"Rollelek bearbeider opplevelser og angst for legen. Kunnskap om kroppen og yrker.",
    materialer:"Legeveske (leketøy), hvite klær, stetoskop (leke), lappresepter", tid:"Fri lek", gruppe:"3-6 barn" },
  { id:64, tittel:"Rollelek: byggeplass og arkitekt", kategori:"rollelek", alder:"3-6 år", rammeplan:["antall","naermiljo","kommunikasjon"],
    hva:"Bygg en stor konstruksjon med klosser og lek at det er en ekte byggeplass.",
    hvordan:"En er arkitekt (tegner planen), en er formann, resten er byggmestere. Tegn bygget på papir. Bygg etter tegningen. Hva mangler? Hvordan fikser vi det? Feir ferdig bygg.",
    hvorfor:"Planlegging, konstruksjon, samarbeid og matematisk romforståelse.",
    materialer:"Store klosser, papir og blyant, hjelmer (papp)", tid:"45-60 min", gruppe:"4-8 barn" },
  { id:65, tittel:"Rollelek: restaurant og kjøkken", kategori:"rollelek", alder:"2-6 år", rammeplan:["kropp","kommunikasjon","naermiljo"],
    hva:"Sett opp en lekerestaurant med meny, servitør og kokk.",
    hvordan:"Lag meny (tegn matretter). Rydde bord med tallerken og bestikk. Rolle: kokk lager mat (lekemat), servitør tar imot bestilling og serverer. Gjester betaler med lekepenger.",
    hvorfor:"Rollelek fremmer samarbeid, kommunikasjon og kunnskap om yrker og mat.",
    materialer:"Lekemat, tallerkener, bestikk, servietter, meny (tegnet)", tid:"Fri lek", gruppe:"4-8 barn" },
  { id:66, tittel:"Rollelek: dyrepark og dyrepasser", kategori:"rollelek", alder:"2-5 år", rammeplan:["natur","etikk","kommunikasjon"],
    hva:"Lag en dyrepark der barna passer på dyrene (bamser og figurer).",
    hvordan:"Sett opp innhegninger med klosser. Plasser dyr i dem. Barna er dyrepassere: gir mat og vann, renser innhegning, viser besøkende rundt. Hva spiser hvert dyr?",
    hvorfor:"Omsorg og ansvar for dyr. Kunnskap om dyr og naturkunnskap.",
    materialer:"Dyre-bamser/-figurer, klosser, lekefrukt/mat", tid:"Fri lek", gruppe:"2-6 barn" },
  { id:68, tittel:"Årstidshjul og naturobservasjon", kategori:"prosjekt", alder:"3-6 år", rammeplan:["natur","antall","kommunikasjon"],
    hva:"Lag et årstidshjul som oppdateres gjennom hele barnehageåret.",
    hvordan:"Tegn en stor sirkel delt i 4. En del per årstid. Legg til: tegninger, pressede planter, bilder, værobservasjoner. Oppdater ukentlig. Snakk om forandringene.",
    hvorfor:"Tidsbegrep, naturprosesser og dokumentasjon over tid. Matematisk sirkeltenkning.",
    materialer:"Stor papirstrimmel i sirkel, tegnesaker, naturmaterialer, bilder", tid:"Løpende gjennom året", gruppe:"Alle" },
  { id:69, tittel:"Barnehageavis", kategori:"prosjekt", alder:"4-6 år", rammeplan:["kommunikasjon","naermiljo","kunst"],
    hva:"Barna lager sin egen barnehageavis med tekster og bilder.",
    hvordan:"Redaksjonsmøte: hva skriver vi om? Intervjue hverandre, lage tegninger, ta bilder. Voksne skriver barnets dikterte tekst. Kopier opp og del ut til foreldre og avdelingen.",
    hvorfor:"Reell skriving og lesing i kontekst. Demokrati: alle bestemmer innholdet.",
    materialer:"Papir, penn, nettbrett/kamera, kopimaskin", tid:"Flere dager", gruppe:"5-10 barn" },
  { id:70, tittel:"Fortellekasse – storytelling", kategori:"prosjekt", alder:"3-6 år", rammeplan:["kommunikasjon","kunst"],
    hva:"Lag en fortellekasse med figurer og bakgrunner til historier.",
    hvordan:"Finn en skoeske. Lag bakgrunn (tegn/lim). Lag figurer av papp. Fortell historien med figurene. La barna skape egne historier med kassen. Bygg på over tid.",
    hvorfor:"Kreativ historiefortelling, språkutvikling og narrativ tenkning.",
    materialer:"Skoeske, tegne/malesaker, papp, pinner, lim", tid:"Lag: 60 min. Bruk: kontinuerlig", gruppe:"2-4 barn" },
  { id:72, tittel:"Prosjektuke: havet", kategori:"prosjekt", alder:"2-6 år", rammeplan:["natur","kunst","kommunikasjon","antall"],
    hva:"En hel uke med aktiviteter om havet og livet der.",
    hvordan:"Man: Sjødyr-fakta og tegning. Tir: Lag et fiskeakvarium av eske. Ons: Vatn-eksperimenter (hva flyter/synker). Tor: Sang og drama om havet. Fre: Fiskesuppe lager vi!",
    hvorfor:"Tverrfaglig prosjekt der alle fagområder integreres. Fordypning og engasjement.",
    materialer:"Varierer per dag", tid:"5 dager", gruppe:"Alle" },
  { id:73, tittel:"Lys og mørke – lanternelaging", kategori:"kunst", alder:"3-6 år", rammeplan:["kunst","etikk"],
    hva:"Lag papirlanternar og utforsk lys og mørke.",
    hvordan:"Fold og klipp mønster i mørkt papir. Lim rundt et sylinderglass med telys. Tent i mørkt rom. Hva skjer med lyset gjennom mønsteret? Snakk om lys i mørketiden – tradisjoner.",
    hvorfor:"Estetisk uttrykk og kunnskap om tradisjoner knyttet til lys (advent, Diwali, Lucia).",
    materialer:"Svart/mørkt papir, glass, telys, saks, lim", tid:"45-60 min", gruppe:"Alle" },
  { id:74, tittel:"Mandala-tegning og symmetri", kategori:"kunst", alder:"4-6 år", rammeplan:["kunst","antall"],
    hva:"Tegn symmetriske mandala-mønstre og utforsk symmetri.",
    hvordan:"Brett papir i to og fire. Tegn halv blomst langs brettelinjen. Åpne: symmetri! Lag mandala: sirkel i midten, mønstre utover. Telle: hvor mange 'blader' har vi?",
    hvorfor:"Symmetriforståelse, geometri og estetisk konsentrasjon.",
    materialer:"Papir, fargeblyanter/tusj, passer og linjal (valgfritt)", tid:"30-45 min", gruppe:"4-8 barn" },
  { id:75, tittel:"Mosaikk av farget papir", kategori:"kunst", alder:"3-6 år", rammeplan:["kunst","motorikk"],
    hva:"Lag bildemosaikkker av sønderklippet farget papir.",
    hvordan:"Klipp opp (eller riv) farget papir i biter. Velg et motiv (fugl, blomst, hav). Lim bitene tett ved siden av hverandre på svart papir – uten å male mellom. Se resultatet!",
    hvorfor:"Finmotorikk (klipping), fargekomposisjon og estetisk helhet fra deler.",
    materialer:"Farget papir, svart bakgrunnspapir, saks, lim", tid:"45-60 min", gruppe:"Alle" },
  { id:76, tittel:"Natur-printing med blader og grønnsaker", kategori:"kunst", alder:"1-6 år", rammeplan:["kunst","natur"],
    hva:"Lag trykk av naturmaterialer: blader, appelsinskiver, brokkoli.",
    hvordan:"Pensle maling på blad (bakside). Trykk mot papir. Løft forsiktig. Gjenta med ulike planter. Brokkoli = tre! Appelsin = blomst! Prøv ulike farger og papir.",
    hvorfor:"Naturformer i kunst. Sensorisk opplevelse og visuell overraskelse.",
    materialer:"Blader, grønnsaker, vannbasert maling, papir, pensel", tid:"30-45 min", gruppe:"Alle" },
  { id:77, tittel:"Kollasjbygging – mixed media", kategori:"kunst", alder:"2-6 år", rammeplan:["kunst"],
    hva:"Lag kollasjer av ulike materialer: stoff, papir, naturmaterialer.",
    hvordan:"Samle materialer: avisutklipp, stoff-biter, maling, sand, fjær. Legg bakgrunn. Bygg opp et bilde lag for lag. Ingen fasit – alt er tillatt. Snakk om valg og uttrykk.",
    hvorfor:"Komposisjon og materialutforskning. Kreativt uttrykk uten begrensninger.",
    materialer:"Stoff, avisutklipp, lim, naturmaterialer, maling, tykt papir", tid:"45-60 min", gruppe:"Alle" },
  { id:78, tittel:"Pappeskulptur – 3D-kunst", kategori:"kunst", alder:"4-6 år", rammeplan:["kunst","antall"],
    hva:"Bygg tredimensjonale skulpturer av papp, rør og esker.",
    hvordan:"Samle: toalettrull, esker, kork, boks. Bygg fritt eller gi tema (et dyr, et hus, en robot). Lim, tape og bygg. Mal ferdig skulptur. Still ut på en utstilling.",
    hvorfor:"3D-tenkning, konstruksjon og kunstnerisk uttrykk. Ombruk av materialer.",
    materialer:"Toalettrull, pappesker, tape, lim, maling", tid:"60-90 min", gruppe:"Alle" },
  { id:79, tittel:"Balanse og balanseøvelser", kategori:"motorikk", alder:"2-6 år", rammeplan:["kropp"],
    hva:"Utforsk balanse gjennom varierte øvelser og leker.",
    hvordan:"Gå på en linje (teip på gulv). Stå på ett bein (telle til 10). Gå med bok på hodet. Balansere en ball på en rakett. Balansebre: gynge sakte. Hvilken er vanskest?",
    hvorfor:"Likevektssans, konsentrasjon og kroppsbeherskelse.",
    materialer:"Teip, bøker, baller, gjenstander å balansere", tid:"20-30 min", gruppe:"Alle" },
  { id:82, tittel:"Hinderløype inne", kategori:"motorikk", alder:"1-6 år", rammeplan:["kropp"],
    hva:"Bygg en hinderbane inne av møbler, puter og matter.",
    hvordan:"Bruk: sofa-puter som trinn, bord å krype under, stol å gå rundt, tau på gulvet å balansere på, tunnel av stoler med teppe over. Tids barna – hvem er raskest?",
    hvorfor:"Grovmotorikk og kroppsbeherskelse innendørs. God regnværsaktivitet.",
    materialer:"Puter, matter, stoler, tau, teppe", tid:"20-40 min", gruppe:"Alle" },
  { id:84, tittel:"Fortelling med konkreter – eventyr", kategori:"språk", alder:"2-6 år", rammeplan:["kommunikasjon","etikk"],
    hva:"Fortell eventyr med tredimensjonale figurer og rekvisitter.",
    hvordan:"Lag figurer av voks, leire eller bruk leketøy. Fortell eventyret mens du viser figurene. La barna overta figurene og fortsette historien. Bytt hvem som forteller.",
    hvorfor:"Aktiv lytting, narrativ forståelse og kreativ historiefortelling.",
    materialer:"Figurer (leire/voks/leketøy), rekvisitter", tid:"20-30 min", gruppe:"4-8 barn" },
  { id:85, tittel:"Ordleker og rim-stafett", kategori:"språk", alder:"3-6 år", rammeplan:["kommunikasjon"],
    hva:"Leker med ord: rim, alliterasjon og ordkjeder.",
    hvordan:"Rimstafett: en sier 'katt', neste sier ord som rimer. Alliterasjon: alle ord starter med B (Bjørn baker boller). Ordkjede: siste lyd er første lyd i neste ord. Lek i ring.",
    hvorfor:"Fonologisk bevissthet som grunnlag for lesing og skriving.",
    materialer:"Ingen – ren oral lek", tid:"15-20 min", gruppe:"5-12 barn" },
  { id:86, tittel:"Tegnspråk – lær noen tegn", kategori:"språk", alder:"2-6 år", rammeplan:["kommunikasjon","etikk"],
    hva:"Lær enkel norsk tegnspråk og kommuniser uten ord.",
    hvordan:"Lær 10-15 tegn: hei, takk, vann, mat, ja, nei, hjelp, glad, lei meg, hund, katt. Øv daglig ved måltidet. Kan vi snakke hele dagen uten å si ord? Tegnspråk-dag!",
    hvorfor:"Inkludering, mangfold og utvidet kommunikasjonsrepertoar. Spennende for alle.",
    materialer:"Bildekort med tegn (NST-bilder), evt. film/video", tid:"10-15 min/dag", gruppe:"Alle" },
  { id:96, tittel:"Norsk kulturarv – tradisjonsmat og høytider", kategori:"prosjekt", alder:"2-6 år", rammeplan:["etikk","naermiljo","kropp"],
    hva:"Lag tradisjonsmat knyttet til norske høytider og årstider.",
    hvordan:"Jule: pepperkaker. Påske: lammekaker. 17. mai: bringebærpai. Bakst: mål, elt, form, stek. Snakk om tradisjonen. Hvem feirer dette hjemme? Hva spiser dere?",
    hvorfor:"Kulturell identitet, inkludering og kunnskap om norske tradisjoner.",
    materialer:"Ingredienser, oppskrift, kjøkkenutstyr", tid:"2-3 timer", gruppe:"4-8 barn" },
  { id:98, tittel:"Flerkulturell matdag", kategori:"mat", alder:"2-6 år", rammeplan:["etikk","naermiljo","kropp"],
    hva:"Smak mat fra ulike kulturer – inviter gjerne foreldre som eksperter.",
    hvordan:"Inviter foreldre til å lage eller forklare mat fra sitt hjemland. Smaksbuffé med mat fra ulike land. Lær hilsen på ulike språk. Vis kart: 'Det er der maten kommer fra!'",
    hvorfor:"Mangfold, inkludering og respekt for ulike kulturer. Sanselig og sosial opplevelse.",
    materialer:"Mat fra foreldre/butikk, verdenskart, flagg", tid:"2-3 timer", gruppe:"Alle" },
];

const RE = {
  formal:{ tittel:"Barnehagens formål (§1)",
    lovtekst:"Barnehagen skal i samarbeid og forståelse med hjemmet ivareta barnas behov for omsorg og lek, og fremme læring og danning som grunnlag for allsidig utvikling. Barnehagen skal bygge på grunnleggende verdier i kristen og humanistisk arv og tradisjon, slik som respekt for menneskeverdet og naturen, på åndsfrihet, nestekjærlighet, tilgivelse, likeverd og solidaritet.",
    punkter:["Ivareta barnas behov for omsorg og lek","Fremme læring og danning","Allsidig utvikling som mål","Kristne og humanistiske verdier","Respekt for menneskeverd og natur","Demokrati, fellesskap og medvirkning"] },
  verdigrunnlag:{ tittel:"Verdigrunnlag",
    innhold:"Barnehagen skal bygge sin virksomhet på et verdigrunnlag som fremmer demokrati, mangfold, likestilling og bærekraftig utvikling. Alle barn skal ha like muligheter til å bli sett, hørt og forstått.",
    verdier:[
      { navn:"Menneskeverd og likeverd", b:"Alle barn er unike og har iboende verdi uavhengig av bakgrunn, kjønn og evner." },
      { navn:"Demokrati og medvirkning", b:"Barna skal ha innflytelse og delta aktivt i barnehagens hverdagsliv." },
      { navn:"Mangfold og respekt", b:"Barnehagen skal speile og feire mangfoldet i samfunnet." },
      { navn:"Bærekraftig utvikling", b:"Vi skal gi barna forståelse for naturens verdi og behovet for å ta vare på den." },
      { navn:"Livsmestring og helse", b:"Barna skal utvikle sosial kompetanse, selvregulering og positiv identitet." },
      { navn:"Fellesskap og solidaritet", b:"Vi hjelper hverandre – ingen skal stå alene. Inkludering er grunnleggende." },
    ] },
  medvirkning:{ tittel:"Barnets medvirkning",
    innhold:"Barn i barnehagen har rett til å gi uttrykk for sitt syn på barnehagens daglige virksomhet. Barnehagen skal jevnlig gi barna mulighet til aktiv deltakelse i planlegging og vurdering. Barnets synspunkter skal tillegges vekt i samsvar med dets alder og modenhet.",
    prinsipper:["Barna skal høres i alle spørsmål som angår dem","Medvirkning handler om reell innflytelse, ikke bare valg","Kroppslige uttrykk er like gyldige som verbale","Balanseres mot at voksne har felleskapets ansvar","Barna skal oppleve at perspektivene tas på alvor"],
    metoder:["Barneting og barnemøter","Dagsorden barna er med å lage","Valg gjennom lek og hverdagssituasjoner","Dokumentasjon som viser barns perspektiv","Prosjektarbeid der barna styrer retningen"] },
  samarbeid:{ tittel:"Samarbeid med foreldre",
    innhold:"Barnehagen skal i samarbeid og forståelse med hjemmet ivareta barnas behov. Foreldre og barnehage er likeverdige parter med ulike roller. Et godt foreldresamarbeid er grunnleggende for barnas trivsel og utvikling.",
    former:[
      { t:"Daglig kontakt", b:"Hente- og bringesituasjoner er viktige møtepunkter for uformell informasjon og relasjon." },
      { t:"Foreldresamtaler", b:"Minst to individuelle samtaler per år om barnets utvikling, trivsel og behov." },
      { t:"Foreldremøter", b:"Informasjon om barnehagens arbeid og mulighet for felles diskusjon og medvirkning." },
      { t:"Samarbeidsutvalg (SU)", b:"Foreldrerepresentanter deltar i styring og planlegging av barnehagen." },
      { t:"Digital dokumentasjon", b:"Apper som Kvello/Famly gir foreldre innsyn i barnas hverdag." },
      { t:"Årsplan og planer", b:"Barnehagen deler årsplan, periodeplan og ukebrev med foreldre." },
    ] },
  overgang:{ tittel:"Overgang barnehage–skole",
    innhold:"Barnehagen skal i samarbeid med skolen legge til rette for en trygg og god overgang. Overgangen skal oppleves som positiv og meningsfull for barnet, familien og skolen.",
    barnet:["God selvfølelse og trygghet på egne evner","Evne til å samarbeide med andre barn","Grunnleggende regulering av følelser","Nysgjerrighet og motivasjon for læring","Forståelse for regler og fellesskap","Begynnende leseberedskap og tallforståelse"],
    barnehagen:["Forberede barnet gradvis og positivt på skolestart","Gjennomføre skolebesøk og bli-kjent-dager","Samarbeide med skolen om overføringsinformasjon","Støtte foreldre i overgangsperioden","Bygge stolthet og forventning – ikke bekymring"] },

  lek:{ tittel:"Lek og læring",
    innhold:"Lek er barnas viktigste aktivitet og uttrykksform. Den har egenverdi og skal være en sentral del av barnehagens innhold. Gjennom lek utvikler barna språk, sosiale ferdigheter, kreativitet og forståelse for seg selv og andre. Barnehagen skal gi rom for ulike typer lek både ute og inne, og personalet skal være tilstede som støttende voksne.",
    typer:[
      { navn:"Frilek", b:"Barneinitiert lek der barna selv styrer innhold, varighet og deltakere. Den frie leken må få god plass og tid." },
      { navn:"Voksenstyrt lek", b:"Personalet legger til rette eller leder en lek med pedagogisk mål, samtidig som barnas innspill respekteres." },
      { navn:"Rollelek", b:"Barna går inn i ulike roller og utforsker sosiale relasjoner, yrker og hverdagssituasjoner." },
      { navn:"Konstruksjonslek", b:"Bygging med klosser, naturmaterialer eller andre objekter – stimulerer romforståelse og kreativitet." },
      { navn:"Regellek", b:"Lek med faste regler – sangleker, brettspill, tradisjonsleker. Lærer turtaking og samarbeid." },
      { navn:"Sanselek", b:"Utforsking av materialer, vann, sand, lyder, lukter – grunnleggende for de yngste barna." },
    ],
    personalRolle:["Være tilstede og observere uten å overstyre","Berike leken gjennom materialer og inspirasjon","Tre inn i leken når barn trenger støtte","Beskytte leken mot avbrytelser","Inkludere alle barn i fellesskapet","Skille mellom egen ledet aktivitet og barnas frilek"],
    laeringssyn:"Læring i barnehagen skjer hovedsakelig gjennom lek, hverdagsaktiviteter og samspill – ikke gjennom skolerelaterte oppgaver. Barnehagen skal ikke være en miniatyrutgave av skolen. Læring må forstås bredt: sosial læring, språklig, motorisk, kognitiv og emosjonell utvikling skjer parallelt." },

  danning:{ tittel:"Omsorg, danning og vennskap",
    innhold:"Omsorg, danning og vennskap utgjør grunnstammen i barnehagens innhold. Disse henger sammen og kan ikke ses adskilt. Barna skal møtes med varme og forståelse, oppleve trygghet og tilhørighet, og få mulighet til å utvikle vennskap.",
    omsorg:{ tittel:"Omsorg",
      b:"Omsorg er en forutsetning for barnets trygghet og trivsel, og en grunnleggende del av barnehagens innhold. God omsorg gir nære, tillitsfulle relasjoner og er knyttet til alle barnehagens daglige aktiviteter.",
      kjennetegn:["Sensitive voksne som ser hvert enkelt barn","Trygg og forutsigbar hverdag","Fysisk og emosjonell tilgjengelighet","Hjelp til å regulere følelser","Trøst, nærhet og ro"] },
    danning:{ tittel:"Danning",
      b:"Danning er en livslang prosess der barnet utvikler seg som menneske – sin identitet, verdier og forståelse av seg selv i fellesskapet. Danning skjer i samspill med andre og krever refleksjon over hva som er rett, godt og meningsfullt.",
      kjennetegn:["Utvikling av etisk bevissthet","Forståelse av egne og andres følelser","Selvstendighet og kritisk tenkning","Forståelse av egen plass i fellesskapet","Respekt for natur, mennesker og samfunn"] },
    vennskap:{ tittel:"Vennskap",
      b:"Vennskap er sentralt for barnas trivsel og utvikling. Barnehagen skal aktivt arbeide for at alle barn skal oppleve vennskap og tilhørighet. Ingen barn skal stå utenfor.",
      personalArbeid:["Observere relasjoner og lekemønster","Støtte barn som har vanskeligheter med å finne lekekamerater","Sette sammen lekegrupper bevisst","Aktivt motvirke ekskludering og mobbing","Snakke om vennskap som tema i samlingsstund"] } },

  pedagogisk:{ tittel:"Pedagogisk virksomhet – planlegging og vurdering",
    innhold:"Barnehagen er en pedagogisk virksomhet som skal planlegges og vurderes. Personalet har ansvar for at virksomheten har en tydelig retning, og at det jobbes systematisk med å forbedre praksis.",
    planlegging:{ tittel:"Planlegging",
      b:"Planlegging gir personalet grunnlag for å tenke og handle systematisk i det pedagogiske arbeidet. Planer skal være levende dokumenter som tilpasses barnas behov og innspill.",
      former:["Årsplan – det overordnede dokumentet, godkjent av SU","Periodeplaner – tema for kortere perioder","Ukeplan og dagsrytme","Prosjektarbeid – fleksible planer styrt av barnas interesser","Individuelle planer der det er behov"] },
    vurdering:{ tittel:"Vurdering",
      b:"Vurdering er en kontinuerlig prosess der personalet reflekterer over egen praksis. Det handler ikke om å vurdere barna, men barnehagens arbeid og kvaliteten på det vi tilbyr.",
      hvordan:["Pedagogiske refleksjonsmøter","Praksisfortellinger som utgangspunkt for diskusjon","Observasjon og dokumentasjon av barns lek og læring","Foreldres innspill og tilbakemeldinger","Barnas medvirkning i vurderingsarbeidet"] },
    dokumentasjon:{ tittel:"Dokumentasjon",
      b:"Pedagogisk dokumentasjon synliggjør barnehagens arbeid, barnas læringsprosesser og personalets refleksjoner. Hensikten er læring og utvikling – ikke å overvåke enkeltbarn.",
      former:["Praksisfortellinger","Bilder og video (med samtykke)","Barneproduksjoner og tegninger","Observasjonsnotater","Refleksjonsbøker for personalet"] },
    ansvar:[
      { rolle:"Styrer", b:"Faglig og administrativ leder. Ansvar for at rammeplanen følges og at personalet får utvikling." },
      { rolle:"Pedagogisk leder", b:"Faglig ansvar for sin avdeling. Leder det pedagogiske arbeidet, veileder personalet, samarbeider med foreldre." },
      { rolle:"Barnehagelærer", b:"Faglig ansvar i samspill med pedagogisk leder. Bidrar til planlegging og gjennomføring." },
      { rolle:"Fagarbeider/assistent", b:"Viktig medarbeider i det daglige arbeidet med barna. Bidrar til omsorg, lek og læring." },
    ] },

  livsmestring:{ tittel:"Livsmestring og helse",
    innhold:"Barnehagen skal bidra til barnas trivsel, livsglede, mestring og følelse av egenverd og forebygge krenkelser og mobbing. Et godt psykososialt miljø er en forutsetning for barns læring og utvikling.",
    omrader:[
      { navn:"Psykisk helse og trivsel", b:"Barna skal oppleve å bli sett, hørt og verdsatt. Trygghet og tilhørighet er grunnleggende for god psykisk helse." },
      { navn:"Sosial kompetanse", b:"Evne til å samhandle med andre – inngå vennskap, løse konflikter, vise empati. Læres gjennom samspill." },
      { navn:"Selvregulering", b:"Å håndtere egne følelser og impulser. Voksne hjelper barn med å sette ord på følelser og finne strategier." },
      { navn:"Identitet og selvbilde", b:"Positiv selvforståelse og opplevelse av å være verdifull. Barna skal være stolte av seg selv og sin bakgrunn." },
      { navn:"Kropp og helse", b:"Bevegelse, hvile, hygiene, sunn mat – grunnleggende vaner som legges i tidlig alder." },
      { navn:"Forebygging av mobbing", b:"Barnehagen har plikt til å forebygge, oppdage og handle ved utestenging eller krenkelser." },
    ],
    personalArbeid:["Bygge nære og tillitsfulle relasjoner","Sette ord på følelser sammen med barna","Aktivt arbeid mot utestenging og mobbing","Skape rolige stunder for hvile og restitusjon","Samtale åpent om vanskelige tema når det er relevant","Samarbeid med foreldre om barnets trivsel"],
    handlingsplikt:"Barnehagen har en lovfestet aktivitetsplikt: når noen får mistanke eller kunnskap om at et barn ikke har det trygt og godt i barnehagen, skal de undersøke, gripe inn og sette inn tiltak. Foreldre skal informeres." },
};

// ═══════════════════════════════════════════
//  SVG TEGNEARK – enkle fargerike utkaststegninger
// ═══════════════════════════════════════════
const S = { f:"white", s:"#334155", sw:3.5, sc:"round", sj:"round" };
const SvgKanin = ()=>(
  <svg viewBox="0 0 300 330" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="108" cy="82" rx="22" ry="60"/><ellipse cx="108" cy="88" rx="11" ry="40" fill="#fce8e8" stroke="none"/>
    <ellipse cx="192" cy="82" rx="22" ry="60"/><ellipse cx="192" cy="88" rx="11" ry="40" fill="#fce8e8" stroke="none"/>
    <circle cx="150" cy="158" r="66"/>
    <circle cx="124" cy="143" r="9" fill={S.s}/><circle cx="176" cy="143" r="9" fill={S.s}/>
    <circle cx="127" cy="140" r="3" fill="white" stroke="none"/><circle cx="179" cy="140" r="3" fill="white" stroke="none"/>
    <ellipse cx="150" cy="164" rx="7" ry="5" fill="#f9a8b8" stroke="none"/>
    <path d="M140 170 Q150 180 160 170" fill="none" strokeWidth="2"/>
    <line x1="98" y1="163" x2="138" y2="163" strokeWidth="1.5"/><line x1="162" y1="163" x2="202" y2="163" strokeWidth="1.5"/>
    <line x1="96" y1="170" x2="137" y2="167" strokeWidth="1.5"/><line x1="163" y1="167" x2="204" y2="170" strokeWidth="1.5"/>
    <ellipse cx="150" cy="268" rx="58" ry="50"/>
    <circle cx="210" cy="262" r="18"/>
    <ellipse cx="102" cy="312" rx="34" ry="14"/><ellipse cx="198" cy="312" rx="34" ry="14"/>
  </svg>
);
const SvgBjorn = ()=>(
  <svg viewBox="0 0 300 310" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="90" cy="82" r="34"/><circle cx="90" cy="82" r="18" fill="#f9c5b5" stroke="none"/>
    <circle cx="210" cy="82" r="34"/><circle cx="210" cy="82" r="18" fill="#f9c5b5" stroke="none"/>
    <circle cx="150" cy="148" r="78"/>
    <ellipse cx="150" cy="173" rx="36" ry="28" fill="#f9d5c5"/>
    <circle cx="120" cy="132" r="11" fill={S.s}/><circle cx="180" cy="132" r="11" fill={S.s}/>
    <circle cx="123" cy="129" r="4" fill="white" stroke="none"/><circle cx="183" cy="129" r="4" fill="white" stroke="none"/>
    <ellipse cx="150" cy="163" rx="11" ry="8" fill={S.s}/>
    <path d="M138 175 Q150 186 162 175" fill="none" strokeWidth="2.5"/>
    <ellipse cx="150" cy="262" rx="72" ry="52"/>
    <ellipse cx="64" cy="272" rx="24" ry="42" transform="rotate(-15,64,272)"/>
    <ellipse cx="236" cy="272" rx="24" ry="42" transform="rotate(15,236,272)"/>
    <ellipse cx="95" cy="305" rx="30" ry="12"/><ellipse cx="205" cy="305" rx="30" ry="12"/>
  </svg>
);
const SvgFugl = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="155" cy="130" rx="88" ry="60"/>
    <circle cx="220" cy="90" r="45"/>
    <ellipse cx="248" cy="85" rx="18" ry="10" fill="#6ba0d9" transform="rotate(-20,248,85)"/>
    <circle cx="230" cy="78" r="7" fill={S.s}/><circle cx="232" cy="76" r="2.5" fill="white" stroke="none"/>
    <path d="M68 108 Q30 70 20 110 Q50 100 68 108Z" fill="#d8f3dc"/>
    <path d="M68 148 Q30 186 20 146 Q50 156 68 148Z" fill="#d8f3dc"/>
    <line x1="128" y1="188" x2="108" y2="240" strokeWidth="3"/><line x1="108" y1="240" x2="88" y2="240" strokeWidth="3"/>
    <line x1="108" y1="240" x2="88" y2="252" strokeWidth="3"/>
    <line x1="165" y1="188" x2="185" y2="240" strokeWidth="3"/><line x1="185" y1="240" x2="205" y2="240" strokeWidth="3"/>
    <line x1="185" y1="240" x2="205" y2="252" strokeWidth="3"/>
  </svg>
);
const SvgFisk = ()=>(
  <svg viewBox="0 0 320 220" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="148" cy="110" rx="110" ry="70"/>
    <path d="M258 110 Q295 70 300 30 Q285 90 300 110 Q285 130 300 190 Q295 150 258 110Z"/>
    <path d="M148 50 Q165 30 188 45" fill="none" strokeWidth="3"/>
    <path d="M148 170 Q165 190 188 175" fill="none" strokeWidth="3"/>
    <circle cx="82" cy="95" r="14" fill={S.s}/><circle cx="86" cy="91" r="5" fill="white" stroke="none"/>
    <path d="M82 112 Q96 122 110 112" fill="none" strokeWidth="2.5"/>
    <ellipse cx="95" cy="133" rx="8" ry="5" fill="#a8d5ff" stroke="none"/>
    <ellipse cx="122" cy="145" rx="8" ry="5" fill="#a8d5ff" stroke="none"/>
    <ellipse cx="148" cy="148" rx="8" ry="5" fill="#a8d5ff" stroke="none"/>
  </svg>
);
const SvgSommerfugl = ()=>(
  <svg viewBox="0 0 300 260" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="130" rx="14" ry="55"/>
    <ellipse cx="87" cy="88" rx="68" ry="58" transform="rotate(-20,87,88)"/>
    <ellipse cx="213" cy="88" rx="68" ry="58" transform="rotate(20,213,88)"/>
    <ellipse cx="82" cy="182" rx="52" ry="42" transform="rotate(15,82,182)"/>
    <ellipse cx="218" cy="182" rx="52" ry="42" transform="rotate(-15,218,182)"/>
    <circle cx="112" cy="95" r="14" fill="#d8f3dc" stroke="none"/><circle cx="188" cy="95" r="14" fill="#d8f3dc" stroke="none"/>
    <circle cx="108" cy="182" r="11" fill="#e8eff8" stroke="none"/><circle cx="192" cy="182" r="11" fill="#e8eff8" stroke="none"/>
    <path d="M144 80 Q135 60 120 52" fill="none" strokeWidth="2.5"/>
    <path d="M156 80 Q165 60 180 52" fill="none" strokeWidth="2.5"/>
    <circle cx="119" cy="50" r="5" fill={S.s}/><circle cx="181" cy="50" r="5" fill={S.s}/>
  </svg>
);
const SvgBlomst = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,45,90,135,180,225,270,315].map(a=>(<ellipse key={a} cx={150+58*Math.cos(a*Math.PI/180)} cy={150+58*Math.sin(a*Math.PI/180)} rx="30" ry="50" transform={`rotate(${a},${150+58*Math.cos(a*Math.PI/180)},${150+58*Math.sin(a*Math.PI/180)})`}/>))}
    <circle cx="150" cy="150" r="40" fill="#fff9c4"/>
    <circle cx="150" cy="150" r="22" fill="#6ba0d9"/>
    <line x1="150" y1="210" x2="150" y2="295" strokeWidth="4" stroke="#2d6a4f"/>
    <ellipse cx="112" cy="262" rx="30" ry="16" fill="#d8f3dc" stroke="#2d6a4f" strokeWidth="2.5" transform="rotate(-25,112,262)"/>
    <ellipse cx="188" cy="248" rx="30" ry="16" fill="#d8f3dc" stroke="#2d6a4f" strokeWidth="2.5" transform="rotate(25,188,248)"/>
  </svg>
);
const SvgTre = ()=>(
  <svg viewBox="0 0 300 310" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="126" y="222" width="48" height="76" rx="8" fill="#c8956c" stroke="#8B5E3C" strokeWidth="3"/>
    <circle cx="150" cy="188" r="66" fill="#a8d5a0" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="108" cy="208" r="50" fill="#b8e8b0" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="192" cy="208" r="50" fill="#b8e8b0" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="150" cy="226" r="48" fill="#c8f0c0" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="132" cy="168" r="11" fill="#ff9999" stroke="#c62828" strokeWidth="2"/>
    <circle cx="168" cy="176" r="10" fill="#ffbb88" stroke="#3a72b0" strokeWidth="2"/>
    <circle cx="148" cy="202" r="10" fill="#ff9999" stroke="#c62828" strokeWidth="2"/>
  </svg>
);
const SvgSnomann = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="278" r="66"/>
    <circle cx="150" cy="190" r="48"/>
    <circle cx="150" cy="118" r="36"/>
    <rect x="118" y="74" width="64" height="22" rx="4" fill="#334155"/><rect x="112" y="79" width="76" height="10" rx="3" fill="#334155"/>
    <circle cx="136" cy="113" r="6" fill={S.s}/><circle cx="164" cy="113" r="6" fill={S.s}/>
    <ellipse cx="150" cy="124" rx="5" ry="8" fill="#6ba0d9" stroke="#3a72b0" strokeWidth="2"/>
    <path d="M138 133 Q150 140 162 133" fill="none" strokeWidth="2.5"/>
    <circle cx="146" cy="182" r="5" fill={S.s}/><circle cx="156" cy="190" r="5" fill={S.s}/><circle cx="146" cy="198" r="5" fill={S.s}/>
    <path d="M102 185 Q72 168 55 150" fill="none" strokeWidth="3"/>
    <path d="M198 185 Q228 168 245 150" fill="none" strokeWidth="3"/>
    <path d="M88 272 Q108 258 122 272" fill="none" strokeWidth="3"/>
    <path d="M178 272 Q192 258 212 272" fill="none" strokeWidth="3"/>
  </svg>
);
const SvgSol = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<line key={a} x1={150+84*Math.cos(a*Math.PI/180)} y1={148+84*Math.sin(a*Math.PI/180)} x2={150+106*Math.cos(a*Math.PI/180)} y2={148+106*Math.sin(a*Math.PI/180)} strokeWidth="5" stroke="#6ba0d9"/>))}
    <circle cx="150" cy="148" r="62" fill="#fff9c4"/>
    <circle cx="128" cy="138" r="9" fill={S.s}/><circle cx="172" cy="138" r="9" fill={S.s}/>
    <circle cx="131" cy="135" r="3" fill="white" stroke="none"/><circle cx="175" cy="135" r="3" fill="white" stroke="none"/>
    <path d="M128 162 Q150 178 172 162" fill="none" strokeWidth="3"/>
    <ellipse cx="58" cy="238" rx="62" ry="34" fill="white"/>
    <ellipse cx="30" cy="250" rx="38" ry="28" fill="white"/>
    <ellipse cx="88" cy="250" rx="46" ry="26" fill="white"/>
    <ellipse cx="222" cy="242" rx="52" ry="30" fill="white"/>
    <ellipse cx="258" cy="252" rx="36" ry="26" fill="white"/>
    <ellipse cx="190" cy="254" rx="40" ry="24" fill="white"/>
  </svg>
);
const SvgRegnbue = ()=>(
  <svg viewBox="0 0 320 240" fill="none" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc}>
    <path d="M20 195 Q20 58 160 58 Q300 58 300 195" stroke="#e53e3e" strokeWidth="11" fill="none"/>
    <path d="M40 195 Q40 82 160 82 Q280 82 280 195" stroke="#6ba0d9" strokeWidth="11" fill="none"/>
    <path d="M60 195 Q60 104 160 104 Q260 104 260 195" stroke="#ffd700" strokeWidth="11" fill="none"/>
    <path d="M80 195 Q80 126 160 126 Q240 126 240 195" stroke="#52b788" strokeWidth="11" fill="none"/>
    <path d="M100 195 Q100 146 160 146 Q220 146 220 195" stroke="#4299e1" strokeWidth="11" fill="none"/>
    <path d="M118 195 Q118 164 160 164 Q202 164 202 195" stroke="#9b59b6" strokeWidth="11" fill="none"/>
    <ellipse cx="38" cy="200" rx="34" ry="20" fill="white" stroke={S.s} strokeWidth="3"/>
    <ellipse cx="16" cy="210" rx="22" ry="17" fill="white" stroke={S.s} strokeWidth="3"/>
    <ellipse cx="60" cy="210" rx="26" ry="17" fill="white" stroke={S.s} strokeWidth="3"/>
    <ellipse cx="282" cy="200" rx="34" ry="20" fill="white" stroke={S.s} strokeWidth="3"/>
    <ellipse cx="304" cy="210" rx="22" ry="17" fill="white" stroke={S.s} strokeWidth="3"/>
    <ellipse cx="260" cy="210" rx="26" ry="17" fill="white" stroke={S.s} strokeWidth="3"/>
  </svg>
);
const SvgFrosk = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="138" rx="80" ry="68"/>
    <circle cx="88" cy="80" r="30"/><circle cx="88" cy="80" r="18" fill="#d8f3dc"/>
    <circle cx="212" cy="80" r="30"/><circle cx="212" cy="80" r="18" fill="#d8f3dc"/>
    <circle cx="88" cy="78" r="9" fill={S.s}/><circle cx="90" cy="75" r="3" fill="white" stroke="none"/>
    <circle cx="212" cy="78" r="9" fill={S.s}/><circle cx="214" cy="75" r="3" fill="white" stroke="none"/>
    <path d="M115 158 Q150 168 185 158" fill="none" strokeWidth="3"/>
    <ellipse cx="125" cy="150" rx="10" ry="8" fill="#d8f3dc"/>
    <ellipse cx="175" cy="150" rx="10" ry="8" fill="#d8f3dc"/>
    <path d="M70 198 Q30 220 18 258 Q45 242 78 255" strokeWidth="3.5"/>
    <path d="M78 255 Q95 258 106 250" strokeWidth="3"/>
    <path d="M230 198 Q270 220 282 258 Q255 242 222 255" strokeWidth="3.5"/>
    <path d="M222 255 Q205 258 194 250" strokeWidth="3"/>
  </svg>
);
const SvgElg = ()=>(
  <svg viewBox="0 0 320 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="175" cy="185" rx="85" ry="60"/>
    <ellipse cx="160" cy="108" rx="42" ry="50"/>
    <ellipse cx="148" cy="130" rx="18" ry="25" fill="#e8d5c0"/>
    <ellipse cx="156" cy="75" rx="10" ry="18"/><ellipse cx="164" cy="75" rx="10" ry="18" transform="rotate(10,164,75)"/>
    <circle cx="145" cy="98" r="9" fill={S.s}/><circle cx="147" cy="95" r="3" fill="white" stroke="none"/>
    <ellipse cx="148" cy="118" rx="7" ry="5" fill="#f9a8a8" stroke="none"/>
    <path d="M152 50 Q142 26 122 20 Q136 28 128 13 Q146 23 152 50" fill="#c8956c" stroke="none"/>
    <path d="M168 50 Q178 26 198 20 Q184 28 192 13 Q174 23 168 50" fill="#c8956c" stroke="none"/>
    <line x1="100" y1="238" x2="90" y2="295"/><line x1="130" y1="242" x2="126" y2="295"/>
    <line x1="200" y1="242" x2="196" y2="295"/><line x1="230" y1="238" x2="240" y2="295"/>
    <ellipse cx="90" cy="298" rx="16" ry="6"/><ellipse cx="126" cy="298" rx="16" ry="6"/>
    <ellipse cx="196" cy="298" rx="16" ry="6"/><ellipse cx="240" cy="298" rx="16" ry="6"/>
  </svg>
);
const SvgHost = ()=>(
  <svg viewBox="0 0 320 300" fill={S.f} stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="144" y="196" width="32" height="94" rx="5" fill="#8B5E3C" stroke="#5D3A1A" strokeWidth="3"/>
    <circle cx="160" cy="150" r="70" fill="#52b788" stroke="#2d6a4f" strokeWidth="3"/>
    <ellipse cx="90" cy="122" rx="28" ry="23" fill="#ff9966" stroke="#3a72b0" strokeWidth="2.5" transform="rotate(-40,90,122)"/>
    <ellipse cx="106" cy="90" rx="28" ry="23" fill="#ffcc44" stroke="#3a72b0" strokeWidth="2.5" transform="rotate(-20,106,90)"/>
    <ellipse cx="214" cy="102" rx="28" ry="23" fill="#ff6644" stroke="#c62828" strokeWidth="2.5" transform="rotate(30,214,102)"/>
    <ellipse cx="226" cy="134" rx="28" ry="23" fill="#cc4422" stroke="#c62828" strokeWidth="2.5" transform="rotate(50,226,134)"/>
    <ellipse cx="149" cy="87" rx="28" ry="23" fill="#ff8833" stroke="#3a72b0" strokeWidth="2.5" transform="rotate(5,149,87)"/>
    <ellipse cx="172" cy="82" rx="28" ry="23" fill="#dd6622" stroke="#3a72b0" strokeWidth="2.5" transform="rotate(-10,172,82)"/>
    <ellipse cx="62" cy="244" rx="15" ry="11" fill="#ff9966" stroke="#3a72b0" strokeWidth="2" transform="rotate(-30,62,244)"/>
    <ellipse cx="89" cy="258" rx="15" ry="11" fill="#ffcc44" stroke="#3a72b0" strokeWidth="2" transform="rotate(20,89,258)"/>
    <ellipse cx="226" cy="248" rx="15" ry="11" fill="#ff6644" stroke="#c62828" strokeWidth="2" transform="rotate(10,226,248)"/>
    <ellipse cx="252" cy="262" rx="15" ry="11" fill="#cc4422" stroke="#c62828" strokeWidth="2" transform="rotate(-25,252,262)"/>
  </svg>
);
const SvgVinter = ()=>(
  <svg viewBox="0 0 320 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[38,72,105,145,178,222,262,288].map((x,i)=>(<g key={i}><line x1={x} y1="15" x2={x} y2="48" strokeWidth="2.5" stroke="#a8d5ff"/><line x1={x-13} y1="28" x2={x+13} y2="40" strokeWidth="2" stroke="#a8d5ff"/><line x1={x+13} y1="28" x2={x-13} y2="40" strokeWidth="2" stroke="#a8d5ff"/></g>))}
    <path d="M0 232 Q80 202 160 222 Q240 202 320 228 L320 280 L0 280Z" fill="#e3f2fd" stroke="#90caf9" strokeWidth="2"/>
    <circle cx="92" cy="182" r="40" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <circle cx="92" cy="126" r="30" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <circle cx="92" cy="82" r="22" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <circle cx="82" cy="76" r="5" fill="#334155"/><circle cx="102" cy="76" r="5" fill="#334155"/>
    <ellipse cx="92" cy="85" rx="4" ry="6" fill="#6ba0d9" stroke="#3a72b0" strokeWidth="1.5"/>
    <path d="M80 90 Q92 97 104 90" fill="none" strokeWidth="2"/>
    <rect x="74" y="56" width="36" height="14" rx="2" fill="#334155"/><rect x="68" y="62" width="48" height="8" rx="2" fill="#334155"/>
    <path d="M62 130 Q45 120 34 108" fill="none" strokeWidth="3"/>
    <path d="M122 130 Q139 120 150 108" fill="none" strokeWidth="3"/>
    <circle cx="228" cy="185" r="42" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <path d="M196 158 Q228 135 260 158" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <path d="M202 172 Q228 152 254 172" fill="#e3f2fd" stroke="#90caf9" strokeWidth="3"/>
    <circle cx="216" cy="176" r="5" fill="#334155"/><circle cx="240" cy="176" r="5" fill="#334155"/>
    <path d="M212 186 Q228 194 244 186" fill="none" strokeWidth="2.5"/>
  </svg>
);
const SvgVaar = ()=>(
  <svg viewBox="0 0 320 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<line key={a} x1={165+64*Math.cos(a*Math.PI/180)} y1={70+64*Math.sin(a*Math.PI/180)} x2={165+80*Math.cos(a*Math.PI/180)} y2={70+80*Math.sin(a*Math.PI/180)} strokeWidth="4" stroke="#6ba0d9"/>))}
    <circle cx="165" cy="70" r="48" fill="#fff9c4"/>
    <circle cx="148" cy="62" r="8" fill={S.s}/><circle cx="182" cy="62" r="8" fill={S.s}/>
    <path d="M148 80 Q165 92 182 80" fill="none" strokeWidth="3"/>
    <path d="M0 258 Q80 232 160 248 Q240 232 320 258 L320 280 L0 280Z" fill="#d8f3dc" stroke="#52b788" strokeWidth="2"/>
    {[[60,208,30],[112,215,26],[165,205,28],[218,210,26],[270,208,28]].map(([cx,cy,r],i)=>{
      const cols=["#ff9999","#ffdd88","#cc99ff","#ff88bb","#ffbb44"];
      return (<g key={i}>
        {[0,72,144,216,288].map(a=>(<ellipse key={a} cx={cx+r*0.7*Math.cos(a*Math.PI/180)} cy={cy-22+r*0.55*Math.sin(a*Math.PI/180)} rx={r*0.52} ry={r*0.42} fill={cols[i]} stroke="none"/>))}
        <circle cx={cx} cy={cy-22} r={r*0.27} fill="#fff9c4" stroke="#6ba0d9" strokeWidth="1.5"/>
        <line x1={cx} y1={cy-10} x2={cx} y2={cy+32} stroke="#52b788" strokeWidth="2.5"/>
      </g>);
    })}
  </svg>
);
const SvgFamilie = ()=>(
  <svg viewBox="0 0 340 290" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="75" cy="58" r="32"/><rect x="57" y="92" width="36" height="68" rx="8" fill="#e3f2fd"/>
    <line x1="57" y1="114" x2="34" y2="148"/><line x1="93" y1="114" x2="116" y2="148"/>
    <line x1="68" y1="160" x2="62" y2="216"/><line x1="82" y1="160" x2="88" y2="216"/>
    <ellipse cx="62" cy="222" rx="13" ry="8"/><ellipse cx="88" cy="222" rx="13" ry="8"/>
    <circle cx="160" cy="62" r="28"/><rect x="144" y="92" width="32" height="62" rx="8" fill="#fce8e8"/>
    <line x1="144" y1="110" x2="122" y2="140"/><line x1="176" y1="110" x2="198" y2="140"/>
    <line x1="152" y1="154" x2="147" y2="206"/><line x1="168" y1="154" x2="173" y2="206"/>
    <ellipse cx="147" cy="212" rx="12" ry="8"/><ellipse cx="173" cy="212" rx="12" ry="8"/>
    <circle cx="238" cy="72" r="22"/><rect x="224" y="96" width="28" height="52" rx="8" fill="#d8f3dc"/>
    <line x1="224" y1="112" x2="204" y2="136"/><line x1="252" y1="112" x2="272" y2="136"/>
    <line x1="232" y1="148" x2="228" y2="196"/><line x1="246" y1="148" x2="250" y2="196"/>
    <ellipse cx="228" cy="202" rx="12" ry="7"/><ellipse cx="250" cy="202" rx="12" ry="7"/>
    <path d="M75 90 Q118 118 160 90" fill="none" strokeWidth="2" strokeDasharray="5,3"/>
    <path d="M160 90 Q198 116 238 94" fill="none" strokeWidth="2" strokeDasharray="5,3"/>
  </svg>
);
const SvgVennskap = ()=>(
  <svg viewBox="0 0 320 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="105" cy="68" r="36"/><circle cx="215" cy="68" r="36"/>
    <rect x="80" y="106" width="50" height="75" rx="10" fill="#fce8e8"/>
    <rect x="190" y="106" width="50" height="75" rx="10" fill="#e3f2fd"/>
    <line x1="80" y1="128" x2="55" y2="160"/><line x1="130" y1="128" x2="155" y2="160"/>
    <line x1="190" y1="128" x2="165" y2="160"/><line x1="240" y1="128" x2="265" y2="160"/>
    <line x1="92" y1="181" x2="86" y2="242"/><line x1="118" y1="181" x2="124" y2="242"/>
    <line x1="202" y1="181" x2="196" y2="242"/><line x1="228" y1="181" x2="234" y2="242"/>
    <ellipse cx="86" cy="249" rx="15" ry="9"/><ellipse cx="124" cy="249" rx="15" ry="9"/>
    <ellipse cx="196" cy="249" rx="15" ry="9"/><ellipse cx="234" cy="249" rx="15" ry="9"/>
    <path d="M130 144 Q160 164 190 144" strokeWidth="4.5" fill="none" stroke="#f9a8b8"/>
    <path d="M152 112 L157 127 L172 127 L160 137 L164 152 L152 142 L140 152 L144 137 L132 127 L147 127Z" fill="#fff9c4" stroke="#6ba0d9" strokeWidth="2"/>
  </svg>
);

const SvgKatt = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="160" r="78"/>
    <path d="M88 110 L72 60 L122 100Z"/><path d="M212 110 L228 60 L178 100Z"/>
    <path d="M98 105 L88 75 L115 98Z" fill="#f9c5b5" stroke="none"/>
    <path d="M202 105 L212 75 L185 98Z" fill="#f9c5b5" stroke="none"/>
    <circle cx="122" cy="155" r="9" fill={S.s}/><circle cx="178" cy="155" r="9" fill={S.s}/>
    <ellipse cx="150" cy="172" rx="7" ry="5" fill="#f9a8b8" stroke="none"/>
    <path d="M140 182 Q150 192 160 182" fill="none" strokeWidth="2.5"/>
    <line x1="95" y1="165" x2="130" y2="170" strokeWidth="1.5"/><line x1="170" y1="170" x2="205" y2="165" strokeWidth="1.5"/>
    <line x1="95" y1="175" x2="130" y2="178" strokeWidth="1.5"/><line x1="170" y1="178" x2="205" y2="175" strokeWidth="1.5"/>
    <path d="M220 230 Q275 205 265 155" fill="none" strokeWidth="3.5"/>
  </svg>
);
const SvgHund = ()=>(
  <svg viewBox="0 0 320 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="160" cy="170" rx="82" ry="58"/>
    <ellipse cx="92" cy="130" rx="28" ry="52" transform="rotate(-15,92,130)" fill="#e8d5a8"/>
    <ellipse cx="228" cy="130" rx="28" ry="52" transform="rotate(15,228,130)" fill="#e8d5a8"/>
    <circle cx="135" cy="160" r="9" fill={S.s}/><circle cx="185" cy="160" r="9" fill={S.s}/>
    <ellipse cx="160" cy="180" rx="12" ry="9" fill={S.s}/>
    <path d="M148 195 Q160 210 172 195" fill="none" strokeWidth="2.5"/>
    <ellipse cx="165" cy="208" rx="6" ry="11" fill="#f9a8b8" stroke="none"/>
    <ellipse cx="100" cy="245" rx="20" ry="10"/><ellipse cx="220" cy="245" rx="20" ry="10"/>
    <path d="M240 215 Q280 195 275 165" fill="none" strokeWidth="4"/>
  </svg>
);
const SvgHest = ()=>(
  <svg viewBox="0 0 320 310" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="160" cy="170" rx="92" ry="55"/>
    <ellipse cx="230" cy="110" rx="32" ry="55" transform="rotate(15,230,110)"/>
    <ellipse cx="248" cy="80" rx="9" ry="18"/><ellipse cx="218" cy="78" rx="9" ry="18"/>
    <path d="M195 60 Q215 35 240 60 Q225 50 220 70 Q235 55 250 75" fill="#8b6355" stroke="#5d3a1a" strokeWidth="2"/>
    <circle cx="232" cy="115" r="7" fill={S.s}/>
    <ellipse cx="240" cy="135" rx="7" ry="5" fill="#f9a8b8" stroke="none"/>
    <line x1="108" y1="220" x2="92" y2="295"/><line x1="148" y1="225" x2="142" y2="298"/>
    <line x1="188" y1="225" x2="195" y2="298"/><line x1="225" y1="218" x2="240" y2="295"/>
    <ellipse cx="92" cy="300" rx="14" ry="6"/><ellipse cx="142" cy="302" rx="14" ry="6"/>
    <ellipse cx="195" cy="302" rx="14" ry="6"/><ellipse cx="240" cy="300" rx="14" ry="6"/>
    <path d="M75 170 Q45 200 60 235 Q70 215 85 222" fill="#8b6355" stroke="#5d3a1a" strokeWidth="2"/>
  </svg>
);
const SvgKu = ()=>(
  <svg viewBox="0 0 320 290" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="160" cy="160" rx="100" ry="62"/>
    <ellipse cx="155" cy="190" rx="50" ry="35" fill="#f9d5c5"/>
    <ellipse cx="135" cy="195" rx="6" ry="4" fill={S.s} stroke="none"/><ellipse cx="175" cy="195" rx="6" ry="4" fill={S.s} stroke="none"/>
    <ellipse cx="240" cy="140" rx="35" ry="40"/>
    <path d="M210 105 L195 75 L220 85Z" fill={S.s}/><path d="M270 105 L285 75 L260 85Z" fill={S.s}/>
    <circle cx="232" cy="135" r="7" fill={S.s}/><circle cx="252" cy="135" r="7" fill={S.s}/>
    <ellipse cx="100" cy="200" rx="22" ry="12" fill="#f9c5b5" transform="rotate(-15,100,200)"/>
    <ellipse cx="105" cy="195" rx="3" ry="5" fill="#f9a8b8" stroke="none"/><ellipse cx="115" cy="200" rx="3" ry="5" fill="#f9a8b8" stroke="none"/>
    <line x1="100" y1="222" x2="92" y2="280"/><line x1="220" y1="218" x2="225" y2="280"/>
    <line x1="135" y1="222" x2="130" y2="280"/><line x1="185" y1="225" x2="190" y2="280"/>
    <circle cx="125" cy="145" r="14" fill={S.s}/><circle cx="195" cy="155" r="11" fill={S.s}/>
  </svg>
);
const SvgGris = ()=>(
  <svg viewBox="0 0 300 280" fill="#f9c5b5" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="160" rx="90" ry="62"/>
    <ellipse cx="150" cy="178" rx="35" ry="22" fill="#f4a5a5"/>
    <ellipse cx="135" cy="175" rx="5" ry="3" fill={S.s} stroke="none"/><ellipse cx="165" cy="175" rx="5" ry="3" fill={S.s} stroke="none"/>
    <path d="M85 115 L75 85 L110 110Z"/><path d="M215 115 L225 85 L190 110Z"/>
    <circle cx="125" cy="135" r="7" fill={S.s}/><circle cx="175" cy="135" r="7" fill={S.s}/>
    <ellipse cx="100" cy="225" rx="14" ry="8"/><ellipse cx="200" cy="225" rx="14" ry="8"/>
    <ellipse cx="130" cy="232" rx="14" ry="8"/><ellipse cx="170" cy="232" rx="14" ry="8"/>
    <path d="M235 145 Q260 140 255 165 Q250 145 240 160" fill="none" strokeWidth="3"/>
  </svg>
);
const SvgSau = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="80" cy="160" r="28"/><circle cx="110" cy="130" r="32"/>
    <circle cx="155" cy="118" r="38"/><circle cx="200" cy="130" r="32"/>
    <circle cx="230" cy="160" r="28"/><circle cx="190" cy="170" r="32"/>
    <circle cx="120" cy="170" r="32"/><circle cx="155" cy="165" r="36"/>
    <ellipse cx="80" cy="195" rx="28" ry="22" fill="#3d1c08"/>
    <circle cx="72" cy="190" r="5" fill="white"/><circle cx="88" cy="190" r="5" fill="white"/>
    <circle cx="72" cy="190" r="2" fill={S.s} stroke="none"/><circle cx="88" cy="190" r="2" fill={S.s} stroke="none"/>
    <ellipse cx="65" cy="170" rx="8" ry="10" fill="#3d1c08"/><ellipse cx="95" cy="170" rx="8" ry="10" fill="#3d1c08"/>
    <line x1="125" y1="215" x2="120" y2="255"/><line x1="155" y1="215" x2="155" y2="255"/>
    <line x1="185" y1="215" x2="190" y2="255"/><line x1="215" y1="215" x2="220" y2="255"/>
  </svg>
);
const SvgHone = ()=>(
  <svg viewBox="0 0 300 290" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="180" rx="80" ry="65"/>
    <circle cx="150" cy="100" r="42"/>
    <path d="M120 75 Q130 50 140 70 Q145 50 158 72 Q165 50 175 70 Q180 55 185 75" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <circle cx="138" cy="98" r="6" fill={S.s}/><circle cx="162" cy="98" r="6" fill={S.s}/>
    <path d="M150 115 L175 130 L150 140 L125 130Z" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <path d="M135 138 L130 158" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <path d="M232 178 Q250 160 245 200 Q255 180 250 210 Q258 195 248 220" fill="#fff" stroke={S.s} strokeWidth="3"/>
    <line x1="130" y1="245" x2="125" y2="280" strokeWidth="3"/><line x1="170" y1="245" x2="175" y2="280" strokeWidth="3"/>
  </svg>
);
const SvgMus = ()=>(
  <svg viewBox="0 0 320 240" fill="#d8d8d8" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="140" cy="140" rx="78" ry="58"/>
    <circle cx="100" cy="80" r="28" fill="#d8d8d8"/><circle cx="100" cy="80" r="16" fill="#f9c5b5" stroke="none"/>
    <circle cx="180" cy="80" r="28" fill="#d8d8d8"/><circle cx="180" cy="80" r="16" fill="#f9c5b5" stroke="none"/>
    <circle cx="115" cy="130" r="7" fill={S.s}/><circle cx="165" cy="130" r="7" fill={S.s}/>
    <ellipse cx="140" cy="155" rx="5" ry="4" fill="#f9a8b8" stroke="none"/>
    <line x1="115" y1="155" x2="85" y2="150" strokeWidth="1.5"/><line x1="115" y1="162" x2="85" y2="165" strokeWidth="1.5"/>
    <line x1="165" y1="155" x2="195" y2="150" strokeWidth="1.5"/><line x1="165" y1="162" x2="195" y2="165" strokeWidth="1.5"/>
    <path d="M218 145 Q280 130 300 160 Q290 145 305 175" fill="none" strokeWidth="3"/>
  </svg>
);
const SvgUgleny = ()=>(
  <svg viewBox="0 0 280 290" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="140" cy="160" rx="85" ry="100"/>
    <circle cx="105" cy="125" r="32" fill="#fff9c4"/><circle cx="175" cy="125" r="32" fill="#fff9c4"/>
    <circle cx="105" cy="125" r="15" fill={S.s}/><circle cx="175" cy="125" r="15" fill={S.s}/>
    <circle cx="108" cy="120" r="5" fill="white"/><circle cx="178" cy="120" r="5" fill="white"/>
    <path d="M125 155 L140 175 L155 155Z" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <path d="M85 80 L70 50 L105 75Z"/><path d="M195 80 L210 50 L175 75Z"/>
    <path d="M75 195 Q90 220 75 245" fill="none" strokeWidth="2"/>
    <path d="M205 195 Q190 220 205 245" fill="none" strokeWidth="2"/>
    <path d="M75 220 Q140 245 205 220" fill="none" strokeWidth="2"/>
    <line x1="120" y1="265" x2="115" y2="285"/><line x1="160" y1="265" x2="165" y2="285"/>
    <path d="M105 285 L120 280 L130 285" fill="none" strokeWidth="2"/>
    <path d="M150 285 L160 280 L175 285" fill="none" strokeWidth="2"/>
  </svg>
);
const SvgPingvin = ()=>(
  <svg viewBox="0 0 280 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="140" cy="180" rx="80" ry="115" fill="#334155"/>
    <ellipse cx="140" cy="200" rx="55" ry="90" fill={S.f}/>
    <circle cx="115" cy="120" r="7" fill={S.f}/><circle cx="165" cy="120" r="7" fill={S.f}/>
    <circle cx="115" cy="120" r="4" fill={S.s} stroke="none"/><circle cx="165" cy="120" r="4" fill={S.s} stroke="none"/>
    <path d="M125 140 L140 160 L155 140Z" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <ellipse cx="75" cy="210" rx="14" ry="40" fill="#334155" transform="rotate(-25,75,210)"/>
    <ellipse cx="205" cy="210" rx="14" ry="40" fill="#334155" transform="rotate(25,205,210)"/>
    <ellipse cx="115" cy="305" rx="22" ry="9" fill="#f4a261"/><ellipse cx="165" cy="305" rx="22" ry="9" fill="#f4a261"/>
  </svg>
);
const SvgLove = ()=>(
  <svg viewBox="0 0 300 290" fill="#f9c963" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <g fill="#d4670a" stroke="#8b4500" strokeWidth="2.5">
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<ellipse key={a} cx={150+72*Math.cos(a*Math.PI/180)} cy={150+72*Math.sin(a*Math.PI/180)} rx="22" ry="34" transform={`rotate(${a},${150+72*Math.cos(a*Math.PI/180)},${150+72*Math.sin(a*Math.PI/180)})`}/>))}
    </g>
    <circle cx="150" cy="150" r="72"/>
    <circle cx="124" cy="135" r="9" fill={S.s}/><circle cx="176" cy="135" r="9" fill={S.s}/>
    <path d="M138 165 L150 178 L162 165Z" fill={S.s}/>
    <path d="M150 178 L150 195" strokeWidth="2"/>
    <path d="M135 195 Q150 208 165 195" fill="none" strokeWidth="2.5"/>
    <line x1="100" y1="150" x2="125" y2="155" strokeWidth="1.5"/>
    <line x1="175" y1="155" x2="200" y2="150" strokeWidth="1.5"/>
  </svg>
);
const SvgElefant = ()=>(
  <svg viewBox="0 0 320 290" fill="#b0bec5" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="180" cy="170" rx="100" ry="68"/>
    <ellipse cx="90" cy="150" rx="55" ry="58"/>
    <ellipse cx="80" cy="125" rx="38" ry="45" fill="#b0bec5"/>
    <circle cx="90" cy="140" r="7" fill={S.s}/>
    <path d="M65 175 Q35 215 55 250 Q40 230 75 245 Q55 235 90 245" fill="#b0bec5" stroke={S.s} strokeWidth="3"/>
    <line x1="140" y1="240" x2="140" y2="285" strokeWidth="6"/>
    <line x1="180" y1="240" x2="180" y2="285" strokeWidth="6"/>
    <line x1="220" y1="240" x2="220" y2="285" strokeWidth="6"/>
    <line x1="260" y1="240" x2="260" y2="285" strokeWidth="6"/>
    <path d="M275 175 Q295 180 285 200" fill="none" strokeWidth="3"/>
  </svg>
);
const SvgDinosaur = ()=>(
  <svg viewBox="0 0 320 290" fill="#90c890" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="170" cy="180" rx="105" ry="55"/>
    <path d="M170 130 Q175 90 230 75 Q260 75 265 110 Q255 95 235 100 Q220 105 215 130" fill="#90c890"/>
    <circle cx="240" cy="100" r="6" fill={S.s}/>
    <path d="M225 115 Q240 120 255 115" fill="none" strokeWidth="2"/>
    <path d="M65 165 L40 130 L75 145Z M85 145 L65 110 L95 130Z M110 130 L95 95 L120 120Z M135 125 L125 90 L145 118Z M160 122 L155 85 L170 118Z" fill="#5d8c5d" stroke={S.s} strokeWidth="2"/>
    <line x1="135" y1="230" x2="130" y2="285" strokeWidth="6"/>
    <line x1="200" y1="230" x2="205" y2="285" strokeWidth="6"/>
    <path d="M62 180 Q15 200 30 230" fill="none" strokeWidth="3.5"/>
  </svg>
);
const SvgHus = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="60" y="130" width="180" height="140" fill="#fff3cc"/>
    <path d="M40 135 L150 50 L260 135Z" fill="#c62828" stroke={S.s} strokeWidth="3.5"/>
    <rect x="130" y="190" width="50" height="80" fill="#8b5e3c"/>
    <circle cx="170" cy="232" r="4" fill={S.s}/>
    <rect x="80" y="155" width="34" height="34" fill="#a8d5ff"/>
    <line x1="97" y1="155" x2="97" y2="189"/><line x1="80" y1="172" x2="114" y2="172"/>
    <rect x="186" y="155" width="34" height="34" fill="#a8d5ff"/>
    <line x1="203" y1="155" x2="203" y2="189"/><line x1="186" y1="172" x2="220" y2="172"/>
    <rect x="180" y="60" width="22" height="40" fill="#8b5e3c"/>
    <path d="M178 60 L186 50 L202 50 L210 60Z" fill="#8b5e3c"/>
  </svg>
);
const SvgBil = ()=>(
  <svg viewBox="0 0 320 200" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M30 140 L30 110 Q30 95 50 90 L85 90 Q95 60 130 60 L210 60 Q235 60 250 90 L285 95 Q300 100 300 115 L300 140Z" fill="#ff6b6b"/>
    <path d="M95 90 Q100 70 125 70 L165 70 L165 90Z" fill="#a8d5ff"/>
    <path d="M170 70 L210 70 Q230 70 240 90 L170 90Z" fill="#a8d5ff"/>
    <circle cx="90" cy="148" r="22" fill="#334155"/><circle cx="90" cy="148" r="10" fill="#b0bec5"/>
    <circle cx="230" cy="148" r="22" fill="#334155"/><circle cx="230" cy="148" r="10" fill="#b0bec5"/>
    <circle cx="40" cy="110" r="5" fill="#fff9c4"/>
    <circle cx="290" cy="120" r="5" fill="#ff5252"/>
  </svg>
);
const SvgBat = ()=>(
  <svg viewBox="0 0 320 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M40 200 L280 200 L255 240 L65 240Z" fill="#c8956c"/>
    <line x1="160" y1="60" x2="160" y2="200" strokeWidth="4"/>
    <path d="M160 70 L240 175 L160 175Z" fill="#fff3cc"/>
    <path d="M160 70 L80 175 L160 175Z" fill="#a8d5ff"/>
    <circle cx="160" cy="60" r="6" fill="#f4a261"/>
    <path d="M10 245 Q60 235 100 245 Q140 255 180 245 Q220 235 270 250 Q310 245 320 255" fill="none" strokeWidth="3" stroke="#4299e1"/>
    <path d="M0 265 Q50 255 100 265 Q150 275 200 265 Q260 255 320 270" fill="none" strokeWidth="3" stroke="#4299e1"/>
  </svg>
);
const SvgFly = ()=>(
  <svg viewBox="0 0 320 240" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="160" cy="120" rx="130" ry="32" fill="#e3f2fd"/>
    <path d="M50 115 L160 75 L160 100 L60 115Z" fill="#a8d5ff"/>
    <path d="M50 130 L160 170 L160 145 L60 130Z" fill="#a8d5ff"/>
    <path d="M280 115 L310 95 L310 115Z" fill="#a8d5ff"/>
    <path d="M280 130 L310 150 L310 130Z" fill="#a8d5ff"/>
    <circle cx="85" cy="115" r="6" fill="#fff"/><circle cx="115" cy="115" r="6" fill="#fff"/><circle cx="145" cy="115" r="6" fill="#fff"/>
    <circle cx="175" cy="115" r="6" fill="#fff"/><circle cx="205" cy="115" r="6" fill="#fff"/><circle cx="235" cy="115" r="6" fill="#fff"/>
    <path d="M260 105 L280 100 L280 138 L260 135Z" fill="#fff9c4"/>
  </svg>
);
const SvgTog = ()=>(
  <svg viewBox="0 0 320 240" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="40" y="100" width="160" height="80" fill="#ff6b6b" rx="10"/>
    <rect x="200" y="80" width="80" height="100" fill="#c62828" rx="6"/>
    <rect x="215" y="95" width="50" height="50" fill="#a8d5ff"/>
    <line x1="240" y1="95" x2="240" y2="145"/><line x1="215" y1="120" x2="265" y2="120"/>
    <rect x="60" y="120" width="30" height="40" fill="#a8d5ff"/>
    <rect x="105" y="120" width="30" height="40" fill="#a8d5ff"/>
    <rect x="150" y="120" width="30" height="40" fill="#a8d5ff"/>
    <circle cx="80" cy="195" r="18" fill="#334155"/><circle cx="80" cy="195" r="8" fill="#b0bec5"/>
    <circle cx="160" cy="195" r="18" fill="#334155"/><circle cx="160" cy="195" r="8" fill="#b0bec5"/>
    <circle cx="240" cy="195" r="22" fill="#334155"/><circle cx="240" cy="195" r="10" fill="#b0bec5"/>
    <rect x="230" y="55" width="20" height="35" fill="#334155"/>
    <ellipse cx="240" cy="50" rx="14" ry="6" fill="#cfd8dc"/>
  </svg>
);
const SvgSykkel = ()=>(
  <svg viewBox="0 0 320 240" fill="none" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="80" cy="170" r="50" strokeWidth="4"/>
    <circle cx="240" cy="170" r="50" strokeWidth="4"/>
    <circle cx="80" cy="170" r="6" fill={S.s}/><circle cx="240" cy="170" r="6" fill={S.s}/>
    <path d="M80 170 L160 170 L240 170 M160 170 L160 100 M160 100 L210 60 M240 170 L210 60" strokeWidth="4"/>
    <line x1="60" y1="60" x2="100" y2="60" strokeWidth="4"/>
    <line x1="80" y1="60" x2="160" y2="100" strokeWidth="4"/>
    <ellipse cx="195" cy="60" rx="22" ry="8" fill="#c62828" stroke={S.s} strokeWidth="2"/>
    {[0,72,144,216,288].map(a=>(<line key={a} x1="80" y1="170" x2={80+44*Math.cos(a*Math.PI/180)} y2={170+44*Math.sin(a*Math.PI/180)} strokeWidth="2"/>))}
    {[0,72,144,216,288].map(a=>(<line key={a} x1="240" y1="170" x2={240+44*Math.cos(a*Math.PI/180)} y2={170+44*Math.sin(a*Math.PI/180)} strokeWidth="2"/>))}
  </svg>
);
const SvgEple = ()=>(
  <svg viewBox="0 0 280 300" fill="#ff5252" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M140 95 Q60 80 50 175 Q50 270 140 280 Q230 270 230 175 Q220 80 140 95Z"/>
    <path d="M140 100 Q120 60 100 50 Q130 75 135 95" fill="#8b5e3c" stroke="#5d3a1a" strokeWidth="2"/>
    <ellipse cx="155" cy="60" rx="25" ry="14" fill="#52b788" stroke="#2d6a4f" strokeWidth="2.5" transform="rotate(25,155,60)"/>
    <ellipse cx="105" cy="155" rx="12" ry="22" fill="#ff9999" stroke="none" transform="rotate(-20,105,155)"/>
  </svg>
);
const SvgBanan = ()=>(
  <svg viewBox="0 0 300 260" fill="#fff176" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M55 90 Q40 130 70 180 Q120 230 200 230 Q260 220 270 180 Q230 200 175 195 Q110 185 80 130 Q70 100 80 80Z"/>
    <path d="M270 180 L285 165 L275 195Z" fill="#8b5e3c" stroke="#5d3a1a" strokeWidth="2"/>
    <path d="M70 95 L55 75 L80 85Z" fill="#5d3a1a"/>
    <path d="M85 110 Q140 175 220 200" fill="none" strokeWidth="2" stroke="#ddb340"/>
  </svg>
);
const SvgIskrem = ()=>(
  <svg viewBox="0 0 240 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M75 175 L165 175 L120 305Z" fill="#d4a574"/>
    <line x1="85" y1="200" x2="115" y2="290" strokeWidth="1.5"/>
    <line x1="115" y1="200" x2="125" y2="290" strokeWidth="1.5"/>
    <line x1="145" y1="200" x2="125" y2="290" strokeWidth="1.5"/>
    <line x1="80" y1="220" x2="160" y2="220" strokeWidth="1.5"/>
    <line x1="85" y1="245" x2="155" y2="245" strokeWidth="1.5"/>
    <circle cx="120" cy="145" r="48" fill="#f9c5b5"/>
    <circle cx="85" cy="110" r="38" fill="#fff9c4"/>
    <circle cx="155" cy="110" r="38" fill="#a8e6cf"/>
    <circle cx="120" cy="80" r="35" fill="#ff9999"/>
    <ellipse cx="120" cy="55" rx="12" ry="8" fill="#c62828"/>
  </svg>
);
const SvgKake = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="55" y="180" width="190" height="70" fill="#d4a574"/>
    <rect x="75" y="120" width="150" height="65" fill="#f9c5b5"/>
    <path d="M55 180 Q75 165 95 180 Q115 165 135 180 Q155 165 175 180 Q195 165 215 180 Q235 165 245 180" fill="#fff" stroke={S.s} strokeWidth="3"/>
    <path d="M75 120 Q90 108 105 120 Q120 108 135 120 Q150 108 165 120 Q180 108 195 120 Q210 108 225 120" fill="#fff" stroke={S.s} strokeWidth="3"/>
    <rect x="100" y="60" width="6" height="55" fill="#fff9c4" stroke={S.s} strokeWidth="2"/>
    <rect x="146" y="55" width="6" height="60" fill="#a8e6cf" stroke={S.s} strokeWidth="2"/>
    <rect x="192" y="60" width="6" height="55" fill="#ff9999" stroke={S.s} strokeWidth="2"/>
    <path d="M101 60 Q103 50 105 60" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <path d="M147 55 Q149 45 151 55" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <path d="M193 60 Q195 50 197 60" fill="#f4a261" stroke="#d4670a" strokeWidth="2"/>
    <circle cx="110" cy="155" r="6" fill="#ff5252"/><circle cx="170" cy="155" r="6" fill="#ff5252"/>
    <circle cx="140" cy="215" r="6" fill="#a8e6cf"/><circle cx="200" cy="215" r="6" fill="#a8e6cf"/>
  </svg>
);
const SvgHjerte = ()=>(
  <svg viewBox="0 0 300 280" fill="#ff5252" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M150 245 Q40 175 40 105 Q40 50 95 50 Q130 50 150 90 Q170 50 205 50 Q260 50 260 105 Q260 175 150 245Z"/>
    <ellipse cx="105" cy="105" rx="22" ry="14" fill="#ff9999" stroke="none" transform="rotate(-30,105,105)"/>
  </svg>
);
const SvgStjerne = ()=>(
  <svg viewBox="0 0 300 290" fill="#fff9c4" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M150 35 L180 115 L265 120 L200 175 L220 260 L150 215 L80 260 L100 175 L35 120 L120 115Z"/>
    <circle cx="125" cy="135" r="5" fill="#fff" stroke="none"/>
  </svg>
);
const SvgBallong = ()=>(
  <svg viewBox="0 0 240 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="120" cy="115" rx="80" ry="95" fill="#ff5252"/>
    <path d="M120 210 L110 230 L130 230Z" fill="#ff5252"/>
    <ellipse cx="90" cy="85" rx="12" ry="20" fill="#ff9999" stroke="none" transform="rotate(-20,90,85)"/>
    <path d="M120 230 Q130 270 110 310" fill="none" strokeWidth="2.5"/>
    <ellipse cx="195" cy="155" rx="38" ry="48" fill="#52b788"/>
    <path d="M195 200 L188 215 L202 215Z" fill="#52b788"/>
    <path d="M195 215 Q200 270 195 310" fill="none" strokeWidth="2"/>
    <ellipse cx="50" cy="175" rx="32" ry="42" fill="#4299e1"/>
    <path d="M50 215 L43 228 L57 228Z" fill="#4299e1"/>
    <path d="M50 228 Q45 270 60 310" fill="none" strokeWidth="2"/>
  </svg>
);
const SvgJulemann = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="170" r="80" fill="#f9c5b5"/>
    <path d="M75 130 Q70 60 120 50 L180 50 Q230 60 225 130 Q200 90 150 90 Q100 90 75 130Z" fill="#c62828"/>
    <ellipse cx="225" cy="55" rx="22" ry="16" fill="#fff"/>
    <ellipse cx="150" cy="265" rx="115" ry="35" fill="#fff"/>
    <path d="M85 175 Q70 240 100 285 Q150 305 200 285 Q230 240 215 175 Q190 250 150 255 Q110 250 85 175Z" fill="#fff"/>
    <circle cx="125" cy="165" r="7" fill={S.s}/><circle cx="175" cy="165" r="7" fill={S.s}/>
    <circle cx="150" cy="195" r="14" fill="#ff5252"/>
    <ellipse cx="100" cy="200" rx="18" ry="11" fill="#ff9999" stroke="none"/>
    <ellipse cx="200" cy="200" rx="18" ry="11" fill="#ff9999" stroke="none"/>
  </svg>
);
const SvgGresskar = ()=>(
  <svg viewBox="0 0 300 280" fill="#ff8833" stroke="#c62828" strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="160" rx="100" ry="85"/>
    <ellipse cx="90" cy="160" rx="38" ry="82" fill="#ff7722"/>
    <ellipse cx="210" cy="160" rx="38" ry="82" fill="#ff7722"/>
    <ellipse cx="150" cy="160" rx="32" ry="85" fill="#ff9944"/>
    <path d="M150 75 Q145 50 130 45 Q145 55 145 75" fill="#5d8c5d" stroke="#2d6a4f" strokeWidth="2"/>
    <rect x="143" y="55" width="14" height="25" fill="#8b5e3c"/>
    <path d="M105 135 L130 135 L117 155Z" fill="#3d1c08" stroke="none"/>
    <path d="M170 135 L195 135 L182 155Z" fill="#3d1c08" stroke="none"/>
    <path d="M95 190 Q150 220 205 190 L195 200 Q180 195 175 205 Q165 195 160 205 Q150 195 145 205 Q135 195 130 205 Q120 195 105 200Z" fill="#3d1c08" stroke="none"/>
  </svg>
);

// ═══════════════════════════════════════════
//  SVG OVERRIDE-REGISTRY
//  ─────────────────────────────────────────────
//  Hvis du senere får bedre illustrasjoner (egne SVG-er, lisensiert fra Storyset,
//  OpenMoji, etc.), kan du legge dem inn her uten å endre de gamle komponentene.
//
//  Eksempel:
//    SVG_OVERRIDES.SvgKu = () => (
//      <svg viewBox="0 0 300 300" ...>
//        ...din bedre ku-SVG fra illustratør eller bibliotek...
//      </svg>
//    );
//
//  Bruk gjennom hentSvg("SvgKu") i TEGNEARK-arrayet, eller endre individuelle
//  oppføringer ved å bytte <SvgKu/> til SVG_OVERRIDES.SvgKu ? <SVG_OVERRIDES.SvgKu/> : <SvgKu/>.
//
//  Anbefalte gratis-kilder:
//   • Storyset (https://storyset.com)
//   • OpenMoji (https://openmoji.org)
//   • SVG Repo (https://www.svgrepo.com) – filtrer på kindergarten/childrens
//
//  Husk å bruke samme viewBox/dimensjoner som de eksisterende SVG-ene
//  for å beholde konsistent størrelse.
// ═══════════════════════════════════════════
const SVG_OVERRIDES = {
  // Legg inn nye SVG-er her, f.eks.:
  // SvgKu: () => (<svg viewBox="0 0 300 300">...</svg>),
};

// Helper for å bruke override hvis den finnes, ellers original
function hentSvg(navn, OriginalKomponent) {
  if (SVG_OVERRIDES[navn]) {
    const Overstyrt = SVG_OVERRIDES[navn];
    return <Overstyrt/>;
  }
  return <OriginalKomponent/>;
}

// ═══════════════════════════════════════════
//  TEGNEARK ARRAY
// ═══════════════════════════════════════════
const TEGNEARK = [
  {id:1,tittel:"Den søte kaninen",ikon:"🐰",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgKanin/>,oppgave:"Farg kaninen! Velg din yndlingsfarge. Tegn gress, blomster og gulrøtter rundt kaninen.",samtale:"Hva spiser kaniner? Har du sett en kanin? Kan kaniner hoppe høyt?",mal:"Naturkunnskap og kreativt uttrykk"},
  {id:2,tittel:"Den store bjørnen",ikon:"🐻",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","etikk"],svg:<SvgBjorn/>,oppgave:"Farg bjørnen. Tegn et hi der bjørnen kan sove om vinteren. Hva spiser bjørnen om sommeren?",samtale:"Hva gjør bjørnen om vinteren? Hva spiser bjørner? Hvor i Norge lever bjørner?",mal:"Årstider og naturkunnskap"},
  {id:3,tittel:"Den glade fuglen",ikon:"🐦",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgFugl/>,oppgave:"Farg fuglen med vakre farger. Tegn et tre der fuglen kan sitte, og kanskje et reir?",samtale:"Hva heter fugler dere ser i barnehagen? Hva spiser fugler? Hvor bor fuglen?",mal:"Naturglede og kreativitet"},
  {id:4,tittel:"Fisken i havet",ikon:"🐟",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgFisk/>,oppgave:"Farg fisken. Tegn et hav rundt den med bølger, tang og mange andre fisker og sjødyr!",samtale:"Har du sett en fisk? Hvilken farge hadde den? Hva bor ellers under vann?",mal:"Naturkunnskap og fantasi"},
  {id:5,tittel:"Den vakre sommerfuglen",ikon:"🦋",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSommerfugl/>,oppgave:"Farg vingene med flotte mønstre! Ingen sommerfugler er like. Tegn blomster den besøker.",samtale:"Hva er en larve? Hvordan blir den til en sommerfugl? Hvor mange farger kan du bruke?",mal:"Naturprosesser og estetisk uttrykk"},
  {id:6,tittel:"Den grønne frosken",ikon:"🐸",kategori:"dyr",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgFrosk/>,oppgave:"Farg frosken (gjerne grønn!). Tegn et tjern rundt frosken med vann, liljepads og insekter.",samtale:"Kan frosk hoppe? Prøv å hoppe som en frosk! Hva er lyden til en frosk?",mal:"Kroppsbevegelse og naturkunnskap"},
  {id:7,tittel:"Elgen i norsk skog",ikon:"🦌",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","naermiljo"],svg:<SvgElg/>,oppgave:"Farg elgen og tegn en norsk skog rundt den. Elgen er Norges største dyr!",samtale:"Har du sett en elg? Hva er spesielt med elgens hode? Hvor stor tror du den er?",mal:"Norsk natur og identitet"},
  {id:8,tittel:"Solen og skyene",ikon:"☀️",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgSol/>,oppgave:"Farg solen gul og oransje. Farg skyene. Tegn regndråper og en liten regnbue!",samtale:"Hva gjør solen for plantene? Hva slags vær er det ute i dag?",mal:"Naturfenomener og undring"},
  {id:9,tittel:"Regnbuen etter regnet",ikon:"🌈",kategori:"natur",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgRegnbue/>,oppgave:"Farg regnbuen med alle 7 farger: rød, oransje, gul, grønn, blå, indigo og fiolett!",samtale:"Når ser vi regnbue? Kan du telle fargene? Hvilken er din favorittfarge?",mal:"Farger, natur og matematikk"},
  {id:10,tittel:"Høsttreet",ikon:"🍂",kategori:"host",alder:"3-6 år",rammeplan:["natur","kunst"],svg:<SvgHost/>,oppgave:"Farg bladene i høstfarger: rødt, oransje, gult og brunt. Tegn mer blader som faller!",samtale:"Hva skjer med trær om høsten? Hva finner vi i skogen om høsten?",mal:"Årstider og naturprosesser"},
  {id:11,tittel:"Snømannen min",ikon:"⛄",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSnomann/>,oppgave:"Gi snømannen et fargerikt skjerf og votter. Tegn snø og kanskje en liten fugl på skulderen?",samtale:"Hva trenger vi for å lage en snømann? Hva skjer med ham når solen kommer?",mal:"Vinter, natur og kreativitet"},
  {id:12,tittel:"Vårens blomster",ikon:"🌸",kategori:"vaar",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgVaar/>,oppgave:"Farg blomstene i vakre vårfarger! Tegn bier og sommerfugler som besøker blomstene.",samtale:"Hvilke blomster kommer først om våren? Hva skjer med naturen om våren?",mal:"Vår, naturglede og årstider"},
  {id:13,tittel:"Familien min",ikon:"👨‍👩‍👧‍👦",kategori:"mennesker",alder:"3-6 år",rammeplan:["etikk","naermiljo","kommunikasjon"],svg:<SvgFamilie/>,oppgave:"Farg personene slik din familie ser ut! Tegn huset og hagen. Hvem er i familien din?",samtale:"Hvem bor hjemme hos deg? Hva liker familien din å gjøre sammen?",mal:"Familie, identitet og tilhørighet"},
  {id:14,tittel:"To gode venner",ikon:"🤝",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","kommunikasjon","naermiljo"],svg:<SvgVennskap/>,oppgave:"Farg vennene og gi dem fine klær. Tegn hva de gjør sammen – danser de, hopper de?",samtale:"Hvem er din beste venn? Hva gjør gode venner for hverandre?",mal:"Vennskap, empati og sosial kompetanse"},
  {id:15,tittel:"Den vakre blomsten",ikon:"🌻",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"Farg blomsten med de fineste fargene! Tegn en bie som henter nektar fra blomsten.",samtale:"Hva trenger blomster for å vokse? Har vi blomster i barnehagen?",mal:"Naturglede og kreativitet"},
  {id:16,tittel:"Det store treet",ikon:"🌳",kategori:"natur",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgTre/>,oppgave:"Farg treet med grønne blader og brun stamme. Tegn fugler, epler og insekter i treet!",samtale:"Hva bruker vi tre til? Hvem bor i og rundt trær? Hva er treets viktigste jobb?",mal:"Naturkunnskap og bærekraft"},
  {id:17,tittel:"Den søte pusekatten",ikon:"🐱",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgKatt/>,oppgave:"Farg katten i din favorittfarge. Tegn en pinne den kan leke med og en skål med melk.",samtale:"Har du en katt hjemme? Hva sier en katt? Hva spiser katter?",mal:"Naturkunnskap og dyrekunnskap"},
  {id:18,tittel:"Min trofaste hund",ikon:"🐶",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","etikk"],svg:<SvgHund/>,oppgave:"Farg hunden. Gi den et hundehus eller en pinne å leke med. Tegn en kjeks også!",samtale:"Hva sier en hund? Hvordan tar vi vare på dyrene våre? Liker hunder å leke?",mal:"Omsorg for dyr og naturkunnskap"},
  {id:19,tittel:"Den raske hesten",ikon:"🐴",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgHest/>,oppgave:"Farg hesten. Gi den en lang mane og en fin sal. Tegn et grønt beite rundt.",samtale:"Har du sett en hest? Hva spiser hester? Kan de løpe fort?",mal:"Naturkunnskap og kroppslig læring"},
  {id:20,tittel:"Kua på beite",ikon:"🐮",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","naermiljo"],svg:<SvgKu/>,oppgave:"Farg kua med svart og hvitt – eller dine egne farger. Tegn gress og en liten kalv.",samtale:"Hvor kommer melken fra? Har du sett en ku? Hva sier en ku?",mal:"Mat, naturkunnskap og nærmiljø"},
  {id:21,tittel:"Grisen Knort",ikon:"🐷",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgGris/>,oppgave:"Farg grisen rosa! Tegn en gjørmedam og litt mat – griser elsker å spise.",samtale:"Hva sier en gris? Hvorfor liker griser gjørme? Hva spiser griser?",mal:"Naturkunnskap og dyrelyder"},
  {id:22,tittel:"Sauen med ull",ikon:"🐑",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgSau/>,oppgave:"Farg sauen hvit eller grå med fluffy ull. Tegn et lite lam ved siden av.",samtale:"Hva får vi av sauen? Hvilke klær er laget av ull? Hva sier sauen?",mal:"Naturkunnskap og bærekraftige ressurser"},
  {id:23,tittel:"Høna i hønsegården",ikon:"🐔",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","antall"],svg:<SvgHone/>,oppgave:"Farg høna med fine fjær og rød kam. Tegn flere egg og noen kyllinger!",samtale:"Hvor kommer egg fra? Hva sier en høne? Kan høner fly?",mal:"Mat, antall og naturkunnskap"},
  {id:24,tittel:"Lille musen",ikon:"🐭",kategori:"dyr",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgMus/>,oppgave:"Farg musen grå. Tegn et lite hus og en bit ost den vil ha tak i.",samtale:"Hvor bor mus? Hva spiser de? Hva er forskjellen mellom mus og rotte?",mal:"Naturkunnskap og dyrekunnskap"},
  {id:25,tittel:"Ugla i natten",ikon:"🦉",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleny/>,oppgave:"Farg ugla og lag en mørk natt med stjerner og månelys rundt.",samtale:"Når er ugler våkne? Hva spiser de? Hva er lyden til en ugle?",mal:"Nattedyr og naturkunnskap"},
  {id:26,tittel:"Pingvin på isen",ikon:"🐧",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgPingvin/>,oppgave:"Farg pingvinen og tegn snø, is og kanskje noen flere pingviner sammen.",samtale:"Hvor bor pingviner? Kan de fly? Hvordan holder de seg varme?",mal:"Verdens dyr og naturkunnskap"},
  {id:27,tittel:"Den modige løven",ikon:"🦁",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgLove/>,oppgave:"Farg løven gylden og brun. Gi den en stor manke! Tegn savannen med høyt gress.",samtale:"Hvor bor løver? Hva spiser de? Hvorfor heter den 'dyrenes konge'?",mal:"Verdens dyr og økologi"},
  {id:28,tittel:"Elefanten med snabel",ikon:"🐘",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgElefant/>,oppgave:"Farg elefanten grå. Tegn store ører og bruk snabelen til å holde noe!",samtale:"Hva bruker elefanten snabelen til? Hvor stor blir en elefant? Hvor bor de?",mal:"Verdens dyr og naturkunnskap"},
  {id:29,tittel:"Den store dinosauren",ikon:"🦕",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgDinosaur/>,oppgave:"Farg dinosauren med dine ville farger. Tegn jungel, vulkaner eller andre dinosaurer!",samtale:"Lever dinosaurer i dag? Hva spiste de? Hvilken er din favorittdinosaur?",mal:"Historie, paleontologi og fantasi"},
  {id:30,tittel:"Påskelilje i hagen",ikon:"🌼",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"Farg påskeliljen gul og hvit. Tegn flere vårblomster: krokus, snøklokke og hyasinter.",samtale:"Hvilke blomster ser vi om våren? Hva trenger blomster for å vokse?",mal:"Vår, naturglede og estetikk"},
  {id:31,tittel:"Trekkfuglen kommer hjem",ikon:"🐦",kategori:"vaar",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgFugl/>,oppgave:"Farg fuglen og tegn et reir med små egg. Vinteren er over – nå er våren her!",samtale:"Hvor har trekkfuglene vært om vinteren? Hvorfor flyr de tilbake om våren?",mal:"Trekkfugler og årsrytmer"},
  {id:32,tittel:"Vårens første sommerfugl",ikon:"🦋",kategori:"vaar",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSommerfugl/>,oppgave:"Farg sommerfuglens vinger i lyse vårfarger. Tegn de første blomstene rundt.",samtale:"Hva har sommerfuglen gjort om vinteren? Hvilke blomster liker den?",mal:"Naturens kretsløp og estetikk"},
  {id:33,tittel:"Vårens regnbue",ikon:"🌈",kategori:"vaar",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgRegnbue/>,oppgave:"Farg regnbuen med alle 7 farger. Tegn vårblomster nede på bakken.",samtale:"Når kommer regnbuen? Hva er forskjellen på vår- og høst-vær?",mal:"Vær, farger og årstider"},
  {id:34,tittel:"Vårsolen",ikon:"☀️",kategori:"vaar",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgSol/>,oppgave:"Farg solen sterk gul. Tegn varme stråler og en glad blomst som drikker solen.",samtale:"Hva gjør solen for plantene? Hvorfor er solen ekstra viktig om våren?",mal:"Vår, energi og naturkunnskap"},
  {id:35,tittel:"Treet får nye blader",ikon:"🌳",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgTre/>,oppgave:"Farg treet med små grønne knopper og friske blader som spirer.",samtale:"Hvor var bladene om vinteren? Hva skjer med treet om våren?",mal:"Trærs livssyklus og årstider"},
  {id:36,tittel:"Vårens lille kanin",ikon:"🐰",kategori:"vaar",alder:"1-5 år",rammeplan:["natur","etikk"],svg:<SvgKanin/>,oppgave:"Farg kaninen og lag en grønn vår-eng med gul løvetann og krokus.",samtale:"Hvor har kaninen vært om vinteren? Hva spiser den om våren?",mal:"Naturens våkning og dyrekunnskap"},
  {id:37,tittel:"Frosken om våren",ikon:"🐸",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgFrosk/>,oppgave:"Farg frosken grønn. Tegn et tjern med rumpetroll og liljepads.",samtale:"Hva er forskjellen på en rumpetroll og en frosk? Når blir tjernet varmt?",mal:"Naturens kretsløp og metamorfose"},
  {id:38,tittel:"Sommersolen høyt på himmel",ikon:"☀️",kategori:"sommer",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgSol/>,oppgave:"Farg en knall gul sol. Tegn et svømmebasseng eller et hav å bade i.",samtale:"Hva gjør vi når det er varmt ute? Hvorfor må vi bruke solkrem?",mal:"Sommer, kropp og helse"},
  {id:39,tittel:"Sommerens iskrem",ikon:"🍦",kategori:"sommer",alder:"1-5 år",rammeplan:["kropp","kommunikasjon"],svg:<SvgIskrem/>,oppgave:"Farg iskremen i din favorittsmak! Tegn flere kuler oppe – jordbær, sjokolade, vanilje?",samtale:"Hva er din favorittiskrem? Hvorfor smelter iskrem fort om sommeren?",mal:"Mat og smaksopplevelser"},
  {id:40,tittel:"Båt på sommerhavet",ikon:"⛵",kategori:"sommer",alder:"2-6 år",rammeplan:["naermiljo","natur"],svg:<SvgBat/>,oppgave:"Farg båten og seilet. Tegn bølger, måker og kanskje en delfin som hopper!",samtale:"Har du vært på båt? Hva ser man fra båten? Hvordan flyter en båt?",mal:"Hav, fysikk og sommeropplevelser"},
  {id:41,tittel:"Sommersykkeltur",ikon:"🚲",kategori:"sommer",alder:"2-6 år",rammeplan:["kropp","naermiljo"],svg:<SvgSykkel/>,oppgave:"Farg sykkelen din favorittfarge! Tegn en sti, trær og et lite eple i sekken.",samtale:"Kan du sykle? Hva trenger du for å sykle trygt? Hvor liker du å sykle?",mal:"Bevegelse, mestring og trafikksikkerhet"},
  {id:42,tittel:"Fisketur om sommeren",ikon:"🐟",kategori:"sommer",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgFisk/>,oppgave:"Farg fisken med blå og sølv. Tegn fiskestang, krok og bølger med flere fisker.",samtale:"Hva spiser fisk? Har du fisket? Hva trenger man for å fiske?",mal:"Natur, mat og tradisjoner"},
  {id:43,tittel:"Frosken og sommerdammen",ikon:"🐸",kategori:"sommer",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgFrosk/>,oppgave:"Farg frosken grønn. Tegn varme bølger på dammen og insekter den vil spise.",samtale:"Hva gjør frosker om sommeren? Hvorfor liker de varmt vær?",mal:"Naturkunnskap og økosystemer"},
  {id:44,tittel:"Sommerblomstene",ikon:"🌻",kategori:"sommer",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"Farg blomsten knall gul som en solsikke! Tegn en stor blomstereng med mange farger.",samtale:"Hvilken blomst er din favoritt? Hvorfor liker bier blomster?",mal:"Naturglede og økologi"},
  {id:45,tittel:"Sommerfugler på enga",ikon:"🦋",kategori:"sommer",alder:"2-6 år",rammeplan:["natur","antall"],svg:<SvgSommerfugl/>,oppgave:"Farg flere sommerfugler i forskjellige farger. Tell hvor mange du tegner!",samtale:"Hvor mange sommerfugler kan du tegne? Hva spiser de?",mal:"Natur, antall og estetikk"},
  {id:46,tittel:"Høsttreet med fargerike blader",ikon:"🍁",kategori:"host",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgHost/>,oppgave:"Farg bladene rødt, gult, oransje og brunt. Tegn flere som faller og en bunke nede.",samtale:"Hvorfor skifter bladene farge? Hvor lander de når de faller?",mal:"Årstider og naturens kretsløp"},
  {id:47,tittel:"Høstens gresskar",ikon:"🎃",kategori:"host",alder:"2-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgGresskar/>,oppgave:"Farg gresskaret oransje! Tegn et morsomt eller skummelt ansikt på det.",samtale:"Hva kan vi lage av gresskar? Når er det høst-sesong?",mal:"Mat, høstkultur og kreativitet"},
  {id:48,tittel:"Eple om høsten",ikon:"🍎",kategori:"host",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgEple/>,oppgave:"Farg eplet rødt eller grønt. Tegn flere epler på et eple-tre.",samtale:"Hvor vokser epler? Når plukker vi dem? Hva kan vi lage av epler?",mal:"Mat, høst og naturkunnskap"},
  {id:49,tittel:"Bjørnen samler bær",ikon:"🐻",kategori:"host",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgBjorn/>,oppgave:"Farg bjørnen brun. Tegn blåbær, tyttebær og kanskje en honningkrukke!",samtale:"Hvorfor må bjørnen spise mye om høsten? Hva gjør den om vinteren?",mal:"Dyr om høsten og forberedelse til vinter"},
  {id:50,tittel:"Elgen på høstskogen",ikon:"🦌",kategori:"host",alder:"3-6 år",rammeplan:["natur","naermiljo"],svg:<SvgElg/>,oppgave:"Farg elgen brun. Tegn høstløv rundt – rødt, gult og oransje.",samtale:"Hvor lever elgene? Hva spiser de om høsten? Har du sett en elg?",mal:"Norsk natur og dyreliv"},
  {id:51,tittel:"Høstens ugle",ikon:"🦉",kategori:"host",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleny/>,oppgave:"Farg ugla på en grein med rødgule blader. Tegn månen og mørk natthimmel.",samtale:"Hva spiser ugler om høsten? Hvor sover de om dagen?",mal:"Nattedyr og høstmiljø"},
  {id:52,tittel:"Trærne mister bladene",ikon:"🌳",kategori:"host",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgTre/>,oppgave:"Farg de gjenværende bladene gyldent og rødt. Tegn flere som virvler i vinden.",samtale:"Hvorfor mister trær bladene om høsten? Hva skjer med bladene på bakken?",mal:"Årstider og kretsløp"},
  {id:53,tittel:"Vinterlandskap",ikon:"❄️",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgVinter/>,oppgave:"Farg snølandskapet med kalde farger. Tegn et lite hus med røyk fra pipa.",samtale:"Hva er kjekt å gjøre om vinteren? Hva trenger vi når det er kaldt?",mal:"Vintermiljø og klær"},
  {id:54,tittel:"Min beste snømann",ikon:"⛄",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSnomann/>,oppgave:"Gi snømannen en gulrot-nese, ull-lue og fargerikt skjerf!",samtale:"Hva trenger vi til en snømann? Hvor lenge varer han?",mal:"Vinter, kreativitet og smelting"},
  {id:55,tittel:"Pingvin på vinteris",ikon:"🐧",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgPingvin/>,oppgave:"Farg pingvinen svart og hvit. Tegn isfjell og kanskje en pingvin som hopper i vannet!",samtale:"Hvor bor pingviner? Synes du det er kaldt der? Hvordan beskytter de seg?",mal:"Kalde områder og dyreliv"},
  {id:56,tittel:"Bjørnen sover vinterhvile",ikon:"🐻",kategori:"vinter",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgBjorn/>,oppgave:"Tegn et hi i fjellet hvor bjørnen sover. Farg snøen rundt og himmelen mørk.",samtale:"Hvor lenge sover bjørnen? Hva gjør den i hiet? Hva spiste den før?",mal:"Dyrs vinteradapsjon"},
  {id:57,tittel:"Vintersolen",ikon:"☀️",kategori:"vinter",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgSol/>,oppgave:"Farg en lavtstående vintersol. Tegn snø, et tre uten blader og kanskje en fugl.",samtale:"Hvorfor er solen lav om vinteren? Når er det mørkest på året?",mal:"Årstider, sol og lys"},
  {id:58,tittel:"Julenissen",ikon:"🎅",kategori:"jul",alder:"1-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgJulemann/>,oppgave:"Farg julenissens drakt rød med hvitt skjegg. Tegn en sekk med gaver.",samtale:"Hvor bor julenissen? Hva spiser han? Hva ønsker du deg i jula?",mal:"Juletradisjoner og kultur"},
  {id:59,tittel:"Den skinnende julestjernen",ikon:"⭐",kategori:"jul",alder:"2-6 år",rammeplan:["kunst","etikk"],svg:<SvgStjerne/>,oppgave:"Farg stjernen i gull. Tegn andre dekorasjoner og lys under stjernen.",samtale:"Hvorfor er stjernen viktig i julen? Hva er julens historie?",mal:"Juletradisjoner og fortelling"},
  {id:60,tittel:"Vårt juletre",ikon:"🎄",kategori:"jul",alder:"1-6 år",rammeplan:["kunst","etikk"],svg:<SvgTre/>,oppgave:"Pynt treet med kuler, lys, stjerner og engler! Gjør det så fint du vil!",samtale:"Hva har dere på juletreet hjemme? Når pynter dere det?",mal:"Tradisjoner og kreativ utfoldelse"},
  {id:61,tittel:"Julehjerter",ikon:"❤️",kategori:"jul",alder:"2-5 år",rammeplan:["etikk","kunst"],svg:<SvgHjerte/>,oppgave:"Farg hjerter i røde og hvite julefarger. Tegn flere hjerter sammen.",samtale:"Hva betyr jula for deg? Hvem er du glad i?",mal:"Kjærlighet, omsorg og tradisjon"},
  {id:62,tittel:"Julens pepperkake",ikon:"🍪",kategori:"jul",alder:"2-6 år",rammeplan:["kropp","kunst"],svg:<SvgKake/>,oppgave:"Farg pepperkaken brun. Tegn pyntelig glasur og fargerikt drys på toppen.",samtale:"Har du laget pepperkaker? Hva trenger vi til dem?",mal:"Mat, baking og juletradisjon"},
  {id:63,tittel:"Snømann om julen",ikon:"⛄",kategori:"jul",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgSnomann/>,oppgave:"Tegn en julesnømann med rødt skjerf og kanskje en nisseluen!",samtale:"Hva er forskjellen på vinterleker og julestemning?",mal:"Vinter og jul"},
  {id:64,tittel:"Julens reinsdyr",ikon:"🦌",kategori:"jul",alder:"2-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgElg/>,oppgave:"Farg reinsdyret brunt med store gevir. Tegn en slede og snø rundt.",samtale:"Hva tror du reinsdyrene gjør sammen med julenissen?",mal:"Juletradisjoner og fantasi"},
  {id:65,tittel:"Pakker under treet",ikon:"🎁",kategori:"jul",alder:"1-5 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgBallong/>,oppgave:"Tenk på pakkene som ballonger! Farg dem fargerikt med fine sløyfer.",samtale:"Hva er det fineste med å få en gave? Og det fineste med å gi en?",mal:"Glede ved å gi og motta"},
  {id:66,tittel:"Påskeharen",ikon:"🐰",kategori:"paske",alder:"1-5 år",rammeplan:["kunst","etikk"],svg:<SvgKanin/>,oppgave:"Farg påskeharen og tegn fargerike egg gjemt rundt – kan du gjemme dem godt?",samtale:"Hvor gjemmer påskeharen eggene? Hva er gøy med påske?",mal:"Påsketradisjoner og lek"},
  {id:67,tittel:"Den lille påskekyllingen",ikon:"🐣",kategori:"paske",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgHone/>,oppgave:"Farg påskekyllingen knall gul! Tegn et skall den nettopp har klekket ut av.",samtale:"Hvordan blir egg til kyllinger? Hva spiser en liten kylling?",mal:"Liv og kretsløp"},
  {id:68,tittel:"Påskeliljer",ikon:"🌼",kategori:"paske",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"Farg flere påskeliljer gule. Tegn en hage med grønne busker og gress.",samtale:"Hvorfor får vi påskeblomster om våren? Hvor vokser de?",mal:"Vår, påske og natur"},
  {id:69,tittel:"Påsken kommer",ikon:"🥚",kategori:"paske",alder:"2-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgEple/>,oppgave:"Tenk på eplet som et stort påskeegg! Mal det fargerikt med fine mønstre.",samtale:"Hvilke farger har du sett på påskeegg? Hvilken er din favoritt?",mal:"Kreativ utfoldelse og farger"},
  {id:70,tittel:"Påskekake",ikon:"🍰",kategori:"paske",alder:"2-6 år",rammeplan:["kropp","kunst"],svg:<SvgKake/>,oppgave:"Farg en påskekake med gul glasur og påskedeko – kyllinger og blomster på toppen!",samtale:"Hva pleier dere å spise i påsken? Har du bakt noe?",mal:"Mat, tradisjoner og fest"},
  {id:71,tittel:"Halloween-gresskar med ansikt",ikon:"🎃",kategori:"halloween",alder:"3-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgGresskar/>,oppgave:"Farg gresskaret skinnende oransje. Tegn et lys inni som lyser ut ansiktet!",samtale:"Hva er gøy med Halloween? Hvilken kostyme vil du ha?",mal:"Tradisjoner og kreativitet"},
  {id:72,tittel:"Svart Halloween-katt",ikon:"🐈‍⬛",kategori:"halloween",alder:"2-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgKatt/>,oppgave:"Farg katten helt svart med gule, skinnende øyne. Tegn fullmånen bak.",samtale:"Hvorfor er svart katt et Halloween-symbol? Liker du Halloween?",mal:"Kultur og fortelling"},
  {id:73,tittel:"Halloween-ugla",ikon:"🦉",kategori:"halloween",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleny/>,oppgave:"Farg ugla med Halloween-stemning – mørk og litt skummel. Tegn flaggermus og spindelvev.",samtale:"Er du redd om Halloween? Hva gjør det mindre skummelt?",mal:"Følelser og fortelling"},
  {id:74,tittel:"Den lille Halloween-musen",ikon:"🐭",kategori:"halloween",alder:"2-5 år",rammeplan:["kunst","etikk"],svg:<SvgMus/>,oppgave:"Farg musen i mørke Halloween-farger. Tegn et lite gresskar og noen skygger.",samtale:"Hvorfor blir mange dyr symboler for Halloween?",mal:"Dyrekunnskap og kultur"},
  {id:75,tittel:"17. mai med familien",ikon:"🇳🇴",kategori:"mai17",alder:"2-6 år",rammeplan:["naermiljo","etikk"],svg:<SvgFamilie/>,oppgave:"Farg familien i festklær. Tegn norske flagg, hatter og kanskje pølse og is!",samtale:"Hva gjør dere på 17. mai? Hvilke farger har det norske flagget?",mal:"Nasjonal identitet og fellesskap"},
  {id:76,tittel:"Festballonger 17. mai",ikon:"🎈",kategori:"mai17",alder:"1-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgBallong/>,oppgave:"Farg ballongene rødt, hvitt og blått som det norske flagget!",samtale:"Hvorfor feirer vi 17. mai? Hva betyr de tre fargene?",mal:"Norsk kultur og fellesskap"},
  {id:77,tittel:"Barnetoget",ikon:"🏠",kategori:"mai17",alder:"2-6 år",rammeplan:["naermiljo","kommunikasjon"],svg:<SvgHus/>,oppgave:"Farg huset med norske flagg på utsiden. Tegn et barnetog som går forbi!",samtale:"Hva er et barnetog? Har du gått i tog før?",mal:"Tradisjoner og nærmiljø"},
  {id:78,tittel:"Naturens regnbue",ikon:"🌈",kategori:"natur",alder:"2-6 år",rammeplan:["natur","antall"],svg:<SvgRegnbue/>,oppgave:"Farg regnbuen med alle 7 fargene i riktig rekkefølge: rød, oransje, gul, grønn, blå, indigo, fiolett.",samtale:"Hvor mange farger har regnbuen? Hva må til for at vi ser den?",mal:"Farger, vær og antall"},
  {id:79,tittel:"Livet i havet",ikon:"🌊",kategori:"natur",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgFisk/>,oppgave:"Farg fisken og tegn et helt undervannsliv: tang, koraller, snegler og kanskje en sjøstjerne!",samtale:"Hvilke dyr lever i havet? Har du dykket eller snorklet?",mal:"Marine økosystemer"},
  {id:80,tittel:"Vill blomstereng",ikon:"🌺",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"Farg blomsten og tegn en hel eng med ville blomster i mange farger.",samtale:"Hva er en eng? Hvilke dyr lever i enga?",mal:"Naturmangfold"},
  {id:81,tittel:"Den vakre fuglen",ikon:"🐤",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgFugl/>,oppgave:"Farg fuglen i regnbuens farger. Tegn et frodig tre der den kan synge.",samtale:"Hvilken fugl synger din favorittsang? Hva spiser fugler?",mal:"Fugleliv og naturglede"},
  {id:82,tittel:"Stjernehimmelen om natten",ikon:"🌟",kategori:"natur",alder:"3-6 år",rammeplan:["natur","antall"],svg:<SvgStjerne/>,oppgave:"Farg stjernen sterk gul. Tegn mange små stjerner og en stor måne!",samtale:"Kan du se stjerner fra hjemmet ditt? Hvor mange tror du det er?",mal:"Astronomi og undring"},
  {id:83,tittel:"Min familie i hagen",ikon:"🏡",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","naermiljo"],svg:<SvgFamilie/>,oppgave:"Farg familien din. Tegn et hus, en hage og familiens favorittaktiviteter!",samtale:"Hvem bor sammen med deg? Hva liker dere å gjøre i hagen?",mal:"Familie, identitet og samvær"},
  {id:84,tittel:"Lek med beste venn",ikon:"👫",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgVennskap/>,oppgave:"Farg vennene. Tegn dere som leker sammen – sandkasse, sykling, ball?",samtale:"Hvem er din beste venn? Hva gjør dere sammen?",mal:"Vennskap og sosial læring"},
  {id:85,tittel:"Storfamilien samlet",ikon:"👨‍👩‍👧‍👦",kategori:"mennesker",alder:"3-6 år",rammeplan:["etikk","naermiljo"],svg:<SvgFamilie/>,oppgave:"Farg en stor familie med besteforeldre, foreldre og barn. Alle er forskjellige!",samtale:"Hvem er i storfamilien din? Når møtes dere alle sammen?",mal:"Slekt og generasjoner"},
  {id:86,tittel:"Hjertet og kjærlighet",ikon:"💖",kategori:"folelser",alder:"2-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgHjerte/>,oppgave:"Farg hjertet i din favorittfarge. Tegn flere små hjerter rundt for de du er glad i.",samtale:"Hvem er du glad i? Hvordan viser vi at vi er glad i noen?",mal:"Empati og uttrykk for følelser"},
  {id:87,tittel:"Gleden med venner",ikon:"😀",kategori:"folelser",alder:"2-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgVennskap/>,oppgave:"Farg vennene med store smil. Tegn det dere gjør som gjør dere glade.",samtale:"Hva gjør deg glad? Hvordan ser ansiktet ditt ut når du smiler?",mal:"Gledesfølelse og ansiktsuttrykk"},
  {id:88,tittel:"Trygghet hjemme",ikon:"🤗",kategori:"folelser",alder:"2-5 år",rammeplan:["etikk","naermiljo"],svg:<SvgFamilie/>,oppgave:"Farg familien som klemmer. Tegn et koselig hjem med myke pledd og puter.",samtale:"Hva gjør deg trygg? Hvem hjelper deg når du er redd?",mal:"Trygghetsfølelse og tilknytning"},
  {id:89,tittel:"Omsorg og hjelp",ikon:"💝",kategori:"folelser",alder:"3-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgHjerte/>,oppgave:"Tegn et stort hjerte. Inni tegner du noen du vil hjelpe – mor, far, en venn.",samtale:"Hvordan kan vi hjelpe andre? Når har noen hjulpet deg?",mal:"Empati og prososial atferd"},
  {id:90,tittel:"Et saftig eple",ikon:"🍎",kategori:"mat",alder:"1-5 år",rammeplan:["kropp","natur"],svg:<SvgEple/>,oppgave:"Farg eplet rødt, gult eller grønt. Tegn en bit ut av det – mmm!",samtale:"Hva er din favorittfrukt? Hva gir frukt oss?",mal:"Sunn mat og smakssanser"},
  {id:91,tittel:"Den gule bananen",ikon:"🍌",kategori:"mat",alder:"1-4 år",rammeplan:["kropp","natur"],svg:<SvgBanan/>,oppgave:"Farg bananen knall gul. Tegn flere bananer som henger på et palmetre.",samtale:"Hvor vokser bananer? Hvilke andre frukter kjenner du?",mal:"Mat fra verden og naturkunnskap"},
  {id:92,tittel:"Min favoritt-iskrem",ikon:"🍨",kategori:"mat",alder:"1-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgIskrem/>,oppgave:"Farg iskremen i dine favorittsmaker. Tegn fargerikt drys og et kirsebær på toppen!",samtale:"Hvilken er din favoritt-iskrem? Når spiser du iskrem?",mal:"Smaker, valg og uttrykk"},
  {id:93,tittel:"Den fineste bursdagskake",ikon:"🎂",kategori:"mat",alder:"2-6 år",rammeplan:["antall","kommunikasjon"],svg:<SvgKake/>,oppgave:"Pynt kaken med fargerik glasur. Tegn lys – like mange som din alder!",samtale:"Når har du bursdag? Hvor mange lys skal du ha?",mal:"Tradisjoner, alder og antall"},
  {id:94,tittel:"Frukt for kroppen",ikon:"🥕",kategori:"mat",alder:"3-6 år",rammeplan:["kropp","natur"],svg:<SvgEple/>,oppgave:"Farg eplet og tegn flere frukter og grønnsaker som er bra for kroppen.",samtale:"Hvorfor er frukt sunt? Hvilke vitaminer gir det?",mal:"Helse og kosthold"},
  {id:95,tittel:"Den raske bilen",ikon:"🚗",kategori:"kjoretoy",alder:"1-5 år",rammeplan:["naermiljo","kropp"],svg:<SvgBil/>,oppgave:"Farg bilen din favorittfarge! Tegn en vei med skilt, hus og trafikklys.",samtale:"Har dere bil hjemme? Hvor liker du å kjøre? Hva betyr rødt lys?",mal:"Trafikkforståelse og nærmiljø"},
  {id:96,tittel:"Båt på det blå hav",ikon:"⛵",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["naermiljo","natur"],svg:<SvgBat/>,oppgave:"Farg båten og seilet. Tegn bølger, måker og en stor sol.",samtale:"Hvilke båter kjenner du? Hvor liker man å seile?",mal:"Transport på sjø og natur"},
  {id:97,tittel:"Flyet på himmelen",ikon:"✈️",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["naermiljo","natur"],svg:<SvgFly/>,oppgave:"Farg flyet hvitt med dine egne striper. Tegn skyer og himmelblå rundt.",samtale:"Har du sittet i fly? Hvor langt kan et fly fly?",mal:"Transport og reise"},
  {id:98,tittel:"Toget på skinner",ikon:"🚂",kategori:"kjoretoy",alder:"1-5 år",rammeplan:["naermiljo","kropp"],svg:<SvgTog/>,oppgave:"Farg toget med dampende lokomotiv! Tegn skinner og et lite stoppested.",samtale:"Har du reist med tog? Hvilken lyd lager et tog?",mal:"Transport og bevegelse"},
  {id:99,tittel:"Min nye sykkel",ikon:"🚲",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["kropp","naermiljo"],svg:<SvgSykkel/>,oppgave:"Farg sykkelen og legg til en hjelm. Tegn en gangvei gjennom parken.",samtale:"Kan du sykle? Hvilken hjelm bruker du? Hvorfor er hjelm viktig?",mal:"Trafikksikkerhet og motorikk"},
  {id:100,tittel:"Mitt hjem",ikon:"🏠",kategori:"bygg",alder:"1-5 år",rammeplan:["naermiljo","kunst"],svg:<SvgHus/>,oppgave:"Farg huset slik ditt eget ser ut! Tegn hagen, blomster og vinduer.",samtale:"Hvordan ser hjemmet ditt ut? Hvor er ditt favorittrom?",mal:"Hjem og identitet"},
  {id:101,tittel:"Barnehagen min",ikon:"🏫",kategori:"bygg",alder:"1-5 år",rammeplan:["naermiljo","etikk"],svg:<SvgHus/>,oppgave:"Tegn barnehagen din! Lekestativ ute og barn som leker, kanskje en barnehagelærer også!",samtale:"Hva er din favoritt-plass i barnehagen? Hvem er ofte der med deg?",mal:"Tilhørighet og nærmiljø"},
  {id:102,tittel:"Drømmehuset",ikon:"🏰",kategori:"bygg",alder:"3-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgHus/>,oppgave:"Tegn ditt drømmehus! Det kan ha trampoline-tak eller godterifabrikk i kjelleren!",samtale:"Hvis du fikk lage et hus akkurat som du vil – hvordan ville det blitt?",mal:"Fantasi og kreativ tenkning"},
  {id:103,tittel:"Fest med ballonger",ikon:"🎈",kategori:"festlig",alder:"1-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgBallong/>,oppgave:"Farg ballongene i alle regnbuens farger! Tegn snorer og noen som danser.",samtale:"Når har du vært på fest sist? Hva er gøy på fest?",mal:"Fest, glede og fellesskap"},
  {id:104,tittel:"Stjernedryss i festen",ikon:"⭐",kategori:"festlig",alder:"2-5 år",rammeplan:["kunst","antall"],svg:<SvgStjerne/>,oppgave:"Farg stjernen gull. Tegn mange små stjerner overalt som om de drysser ned.",samtale:"Hvor mange stjerner kan du tegne? Når er det fest-stemning?",mal:"Glede, fantasi og antall"},
  {id:105,tittel:"Bursdagskaken min",ikon:"🎂",kategori:"festlig",alder:"2-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgKake/>,oppgave:"Pynt din ideelle bursdagskake! Hvilken smak, hvilke farger, hvor mange lys?",samtale:"Når er din bursdag? Hva ønsker du deg til neste bursdag?",mal:"Tradisjoner og personlig markering"},
];
const TEGNEKAT = [
  ["alle","Alle 🖍️"],
  ["dyr","Dyr 🐾"],
  ["vaar","Vår 🌸"],
  ["sommer","Sommer ☀️"],
  ["host","Høst 🍂"],
  ["vinter","Vinter ⛄"],
  ["jul","Jul 🎄"],
  ["paske","Påske 🐣"],
  ["halloween","Halloween 🎃"],
  ["mai17","17. mai 🇳🇴"],
  ["natur","Natur 🌿"],
  ["mennesker","Mennesker 👥"],
  ["folelser","Følelser 💝"],
  ["mat","Mat 🍎"],
  ["kjoretoy","Kjøretøy 🚗"],
  ["bygg","Bygg 🏠"],
  ["festlig","Fest 🎉"],
];

function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
}
function Tilbake({ onClick }) {
  return <button className="btn" onClick={onClick} style={{background:C.mint, color:C.t, padding:"6px 14px", fontSize:13, marginBottom:16}}>← Tilbake</button>;
}

// Standalone form — fully self-contained so typing NEVER re-renders the parent
// IMPORTANT: No inner component definitions (like Felt) — those cause the same remount bug
function NyttSkjemaForm({ onSave, onNavigate }) {
  const [form, setForm] = useState({ tittel:"", hva:"", hvordan:"", hvorfor:"", rammeplan:[], alder:"", kategori:"", materialer:"" });
  const [msg, setMsg] = useState("");

  const upd = (felt) => (e) => setForm(p => ({...p, [felt]: e.target.value}));
  const toggleR = (id) => setForm(p => ({...p, rammeplan: p.rammeplan.includes(id) ? p.rammeplan.filter(r=>r!==id) : [...p.rammeplan, id]}));

  const lagre = () => {
    if (!form.tittel.trim()) { setMsg("⚠️ Skriv inn en tittel!"); return; }
    onSave({ ...form, id: Date.now() });
    setForm({ tittel:"", hva:"", hvordan:"", hvorfor:"", rammeplan:[], alder:"", kategori:"", materialer:"" });
    setMsg("✅ Skjema lagret!");
    setTimeout(() => { setMsg(""); onNavigate("skjemaer"); }, 1200);
  };

  const iStyle = { width:"100%", border:"1.5px solid #c4d6ec", borderRadius:9, padding:"10px 12px", fontSize:13, color:C.t, background:"#f5f9fd", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" };
  const lStyle = { display:"block", fontWeight:700, color:C.t, fontSize:12, marginBottom:4 };

  return (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.t, marginBottom:3}}>✏️ Nytt aktivitetsskjema</div>
      <p style={{color:C.gr, fontSize:12, marginBottom:14}}>Lag ditt eget pedagogiske skjema koblet til rammeplanen</p>
      <div style={{background:C.w, borderRadius:16, padding:18, boxShadow:"0 2px 14px rgba(44,91,142,0.10)"}}>

        <div style={{marginBottom:11}}>
          <label style={lStyle}>Aktivitetstittel *</label>
          <input value={form.tittel} onChange={upd("tittel")} placeholder="Gi aktiviteten et navn..." style={iStyle}/>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:0}}>
          <div style={{marginBottom:11}}>
            <label style={lStyle}>Aldersgruppe</label>
            <input value={form.alder} onChange={upd("alder")} placeholder="f.eks. 3-6 år" style={iStyle}/>
          </div>
          <div style={{marginBottom:11}}>
            <label style={lStyle}>Kategori</label>
            <input value={form.kategori} onChange={upd("kategori")} placeholder="kreativ, ute, musikk..." style={iStyle}/>
          </div>
        </div>

        <div style={{background:"#fff9c4", borderRadius:11, padding:13, marginBottom:11}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>🎯 HVA – Beskriv aktiviteten</div>
          <textarea value={form.hva} onChange={upd("hva")} placeholder="Hva skal barna gjøre?" rows={2}
            style={{...iStyle, border:"1.5px solid #ffe082", background:"#fffef0", resize:"vertical"}}/>
        </div>

        <div style={{background:"#e8f5e9", borderRadius:11, padding:13, marginBottom:11}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>⚙️ HVORDAN – Gjennomføring</div>
          <textarea value={form.hvordan} onChange={upd("hvordan")} placeholder="Steg for steg – beskriv gjennomføringen..." rows={4}
            style={{...iStyle, border:"1.5px solid #a5d6a7", background:"#f1f9f1", resize:"vertical"}}/>
        </div>

        <div style={{background:"#e3f2fd", borderRadius:11, padding:13, marginBottom:11}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>❓ HVORFOR – Pedagogisk begrunnelse</div>
          <textarea value={form.hvorfor} onChange={upd("hvorfor")} placeholder="Hva lærer barna? Hva er den pedagogiske verdien?" rows={2}
            style={{...iStyle, border:"1.5px solid #90caf9", background:"#f0f7ff", resize:"vertical"}}/>
        </div>

        <div style={{marginBottom:16}}>
          <label style={lStyle}>Materialer</label>
          <input value={form.materialer} onChange={upd("materialer")} placeholder="f.eks. maling, pensler, papir, leire..." style={iStyle}/>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700, color:C.t, fontSize:12, marginBottom:8}}>📖 Kobling til rammeplan</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:7}}>
            {FAGOMRADER.map(f=>(
              <div key={f.id} onClick={()=>toggleR(f.id)} style={{
                background:form.rammeplan.includes(f.id)?f.farge:f.lys,
                borderRadius:8, padding:"9px 11px", cursor:"pointer", display:"flex", alignItems:"center", gap:7,
                border:`2px solid ${form.rammeplan.includes(f.id)?f.farge:"transparent"}`, transition:"all 0.15s"
              }}>
                <span style={{fontSize:16}}>{f.ikon}</span>
                <span style={{fontSize:10, fontWeight:700, color:form.rammeplan.includes(f.id)?"#fff":f.farge, lineHeight:1.3}}>{f.navn}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn" onClick={lagre} style={{background:C.g, color:"#fff", padding:"13px 18px", fontSize:14, width:"100%", borderRadius:12}}>
          💾 Lagre skjema
        </button>
        {msg && <div className="fade" style={{marginTop:10, background:C.mint, borderRadius:9, padding:"10px 14px", color:C.g, fontWeight:700, textAlign:"center"}}>{msg}</div>}
      </div>
    </div>
  );
}

// ─── Standalone search/list components ─────────────────────────
// Defined OUTSIDE the main component so they never remount on parent re-renders
function SangerSideComp({ favoritter, toggleFav }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [valgt, setValgt] = useState(null);
  const favSet = new Set(favoritter?.sanger || []);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = SANGER.filter(s=>{
    if (filter==="favoritter") return favSet.has(s.id) && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    return (filter==="alle"||s.kategori===filter)&&(!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
  });
  return (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🎵 Sanger, Rim og Regler</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{SANGER.length} tilgjengelige – kobler språk, bevegelse og glede til rammeplanen</p>
      <input value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk etter sang eller rim..." style={{...iS,marginBottom:12}}/>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16,paddingBottom:3}}>
        <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
          {[["alle","Alle"],["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],["sang","🎤 Sanger"],["rim","📝 Rim"],["regle","📣 Regler"]].map(([v,l])=>(
            <button key={v} className="btn" onClick={()=>setFilter(v)} style={{padding:"6px 13px",fontSize:11,background:filter===v?C.g:C.lg2,color:filter===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
          ))}
        </div>
      </div>
      {valgt ? (
        <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>setValgt(null)}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.t,flex:1}}>{valgt.tittel}</div>
            <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("sanger",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
              {favSet.has(valgt.id)?"⭐":"☆"}
            </button>
          </div>
          <div style={{display:"flex",gap:7,margin:"10px 0 14px",flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>👶 {valgt.alder}</span>
            {valgt.melodi&&<span className="tag" style={{background:"#f3e5f5",color:"#b5179e"}}>🎼 {valgt.melodi}</span>}
          </div>
          <pre style={{background:"#f5f9fd",borderRadius:11,padding:16,fontSize:15,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.9,fontFamily:"'Nunito',sans-serif",marginBottom:12,border:"1px solid #c4d6ec"}}>{valgt.tekst}</pre>
          {valgt.tips&&<div style={{background:"#fffde7",borderRadius:9,padding:12,fontSize:13,color:"#795548",marginBottom:12}}><strong>💡 Tips:</strong> {valgt.tips}</div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{valgt.rammeplan.map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {data.length===0&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {data.map(s=>(
            <div key={s.id} className="hover fade" onClick={()=>setValgt(s)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{s.tittel}</div>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{s.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{s.alder}</span>
                    {s.rammeplan.map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
                  </div>
                </div>
                <button className={`fav-btn ${favSet.has(s.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("sanger",s.id);}} title={favSet.has(s.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                  {favSet.has(s.id)?"⭐":"☆"}
                </button>
                <span style={{color:C.gr,fontSize:17}}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const AKTIV_KATS = [["alle","Alle"],["kreativ","🎨 Kreativ"],["ute","🌳 Ute"],["matematikk","🔢 Matte"],["drama","🎭 Drama"],["samtale","💬 Samtale"],["mat","🍞 Mat"],["natur","🌱 Natur"],["musikk","🎶 Musikk"],["motorikk","🏃 Motorikk"],["rollelek","🏠 Rollelek"],["språk","🗣 Språk"],["prosjekt","📋 Prosjekt"],["kunst","🎨 Kunst"]];

// Standalone-komponent for søkeboks – holder fokus selv om parent re-rendrer.
// Lokal state for input-verdien, kaller onChange-prop ved hver endring.
function GlobalSok({ verdi, setVerdi, sokeResultat, navigerTil, aapneAktivitet, aapneTegneark, aapneFagomrade, aapneRammeplan, C }) {
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
                    <div key={"s"+s.id} onClick={()=>{navigerTil("sanger");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">{s.tittel}</div>
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

              {sokeResultat.ukeplaner && sokeResultat.ukeplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#1565c0",background:"#f5f9fd",textTransform:"uppercase",letterSpacing:0.5}}>📅 Dine ukeplaner ({sokeResultat.ukeplaner.length})</div>
                  {sokeResultat.ukeplaner.slice(0,5).map(p=>(
                    <div key={"u"+p.id} onClick={()=>{navigerTil("ukeplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.tittel}</div>
                      {(p.uke||p.tema) && <div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.uke?`Uke ${p.uke}`:""}{p.uke&&p.tema?" • ":""}{p.tema||""}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AktivSideComp({ preselectId, clearPreselect, favoritter, toggleFav }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [valgt, setValgt] = useState(()=>preselectId ? AKTIVITETER.find(a=>a.id===preselectId)||null : null);
  useEffect(() => {
    // Nullstill preselect i parent etter at vi har brukt den
    if (preselectId && clearPreselect) clearPreselect();
  }, []);
  const favSet = new Set(favoritter?.aktiviteter || []);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = AKTIVITETER.filter(a=>{
    const matchSok = !sok||a.tittel.toLowerCase().includes(sok.toLowerCase())||a.hva.toLowerCase().includes(sok.toLowerCase());
    if (filter==="favoritter") return favSet.has(a.id) && matchSok;
    return (filter==="alle"||a.kategori===filter) && matchSok;
  });
  const filtre = [["alle","Alle"],["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],...AKTIV_KATS.filter(k=>k[0]!=="alle")];
  return (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🏃 Aktiviteter</div>
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
            <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("aktiviteter",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
              {favSet.has(valgt.id)?"⭐":"☆"}
            </button>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>👶 {valgt.alder}</span>
            {valgt.tid&&<span className="tag" style={{background:"#e3f2fd",color:"#1565c0"}}>⏱ {valgt.tid}</span>}
            {valgt.gruppe&&<span className="tag" style={{background:"#f3e5f5",color:"#6a1b9a"}}>👥 {valgt.gruppe}</span>}
          </div>
          {[["🎯 HVA – Beskrivelse",valgt.hva,"#fff9c4","#795548"],["⚙️ HVORDAN – Gjennomføring",valgt.hvordan,"#e8f5e9","#2e7d32"],["❓ HVORFOR – Pedagogisk begrunnelse",valgt.hvorfor,"#e3f2fd","#1565c0"]].map(([t,v,bg,tc])=>(
            <div key={t} style={{background:bg,borderRadius:11,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontWeight:800,color:tc,marginBottom:4,fontSize:13}}>{t}</div>
              <div style={{color:C.t,fontSize:13,lineHeight:1.7}}>{v}</div>
            </div>
          ))}
          {valgt.materialer&&<div style={{background:"#fce4ec",borderRadius:11,padding:"12px 14px",marginBottom:10}}><div style={{fontWeight:800,color:"#c62828",marginBottom:4,fontSize:13}}>🧰 Materialer</div><div style={{color:C.t,fontSize:13}}>{valgt.materialer}</div></div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{valgt.rammeplan.map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {data.length===0&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {data.map(a=>(
            <div key={a.id} className="hover fade" onClick={()=>setValgt(a)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{a.tittel}</div>
                  <div style={{color:C.gr,fontSize:11,marginTop:2}}>{a.hva.substring(0,70)}{a.hva.length>70?"...":""}</div>
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{a.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{a.alder}</span>
                    {a.rammeplan.map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
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

// ═══════════════════════════════════════════
//  RAMMEPLAN-DATABASE – seed content per fagområde, brukt både som AI-kontekst og som fallback
// ═══════════════════════════════════════════
const ALDER_GRUPPER = [
  { id:"0-2", navn:"Småbarn (0-2 år)", fokus:"Sansing, trygghet, motorikk, kroppsspråk, enkle ord" },
  { id:"2-3", navn:"Toåringer (2-3 år)", fokus:"Setninger, parallelllek, grovmotorikk, gjenkjennelse" },
  { id:"3-4", navn:"Treåringer (3-4 år)", fokus:"Samspill, fantasi, rollelek, finmotorikk, undring" },
  { id:"4-5", navn:"Fireåringer (4-5 år)", fokus:"Regelforståelse, vennskap, konsentrasjon, lengre prosjekt" },
  { id:"5-6", navn:"Skolestartere (5-6 år)", fokus:"Bokstav-/talleksperiment, samarbeid, planlegging, refleksjon" },
  { id:"alle", navn:"Hele gruppa (blandet)", fokus:"Differensierte oppgaver – alle deltar på sitt nivå" },
];

const ARSTID_HOYTID = [
  { id:"vaar", navn:"Vår 🌸", maaneder:"mars-mai", motiv:"spirende blomster, fugler, regn, snøsmelting, krokus, hestehov" },
  { id:"sommer", navn:"Sommer ☀️", maaneder:"juni-aug", motiv:"sol, vann, bading, bær, insekter, lange dager" },
  { id:"host", navn:"Høst 🍂", maaneder:"sept-nov", motiv:"løvfarger, sopp, eple, gresskar, regnvær, drager" },
  { id:"vinter", navn:"Vinter ⛄", maaneder:"des-feb", motiv:"snø, frost, mørketid, akebrett, ski, dyrespor" },
  { id:"jul", navn:"Jul 🎄", maaneder:"des", motiv:"nisse, juletre, lys, pepperkaker, advent" },
  { id:"paske", navn:"Påske 🐣", maaneder:"mars-apr", motiv:"egg, kylling, hare, gul, vårblomster" },
  { id:"mai17", navn:"17. mai 🇳🇴", maaneder:"mai", motiv:"flagg, tog, bunad, is, hurra" },
  { id:"halloween", navn:"Halloween 🎃", maaneder:"okt", motiv:"gresskar, kostymer, mørk høst, edderkopper" },
  { id:"karneval", navn:"Karneval 🎭", maaneder:"feb", motiv:"kostyme, masker, prinsesse, superhelt, musikk" },
  { id:"sami", navn:"Samefolkets dag 🪶", maaneder:"6. feb", motiv:"reinsdyr, lavvo, joik, samisk flagg, kofte" },
  { id:"ingen", navn:"Ingen spesiell", maaneder:"-", motiv:"-" },
];

const VANSKELIGHET = [
  { id:"enkel", navn:"Enkel", beskrivelse:"Kort, konkret, mye voksenstøtte. Få trinn. Egnet for innledning eller småbarn." },
  { id:"middels", navn:"Middels", beskrivelse:"Flere trinn, barna gjør mer selv, 15-30 min, voksen som veileder." },
  { id:"avansert", navn:"Avansert", beskrivelse:"Prosjekt-form, barnas medvirkning sentralt, kan gå over flere dager." },
];

const INNHOLDSTYPER = [
  { id:"aktivitet", navn:"Pedagogisk aktivitet", ikon:"🏃", beskrivelse:"En enkeltstående aktivitet med mål, materiell og fremgangsmåte" },
  { id:"samling", navn:"Samlingsstund", ikon:"🪑", beskrivelse:"Strukturert samling: åpning, hovedaktivitet, avslutning" },
  { id:"sang", navn:"Sang eller rim", ikon:"🎵", beskrivelse:"Originaltekst med melodi-forslag og bevegelser" },
  { id:"tegneark", navn:"Tegneark-idé", ikon:"🖍️", beskrivelse:"Tegneoppgave med samtaleforslag og rammeplan-mål" },
  { id:"prosjekt", navn:"Prosjektarbeid", ikon:"📚", beskrivelse:"Lengre prosjekt over 1-4 uker med flere faser" },
  { id:"ukeplan", navn:"Ukeplan", ikon:"📅", beskrivelse:"Mandag-fredag med tema, aktiviteter og fagområder" },
  { id:"manedsplan", navn:"Månedsplan", ikon:"🗓️", beskrivelse:"En hel måned strukturert etter rammeplan og årstid" },
  { id:"arsplan", navn:"Årsplan", ikon:"📆", beskrivelse:"Årshjul med tema per måned, mål og pedagogisk grunnsyn" },
  { id:"manedsbrev", navn:"Månedsbrev", ikon:"✉️", beskrivelse:"Brev til foreldre om hva som skjedde og kommer" },
  { id:"samtale", navn:"Samtalespørsmål", ikon:"💬", beskrivelse:"Filosofiske og åpne spørsmål for refleksjon" },
  { id:"fritekst", navn:"Fri forespørsel", ikon:"✏️", beskrivelse:"Skriv akkurat det du vil ha hjelp med" },
];

// Strukturerte maler per fagområde – brukes som AI-kontekst og som fallback
const SAMLING_MAL = {
  kommunikasjon: [
    { tittel:"Boksamtale med åpne spørsmål", apning:"Sang: 'Hode, skulder, kne og tå'. Tenn et lite lys.", hoved:"Les en bildebok høyt (10 min). Stopp ved bilder og spør 'Hva ser dere?', 'Hva tror du skjer nå?', 'Har dere opplevd noe lignende?'. La hvert barn få ordet.", avslutning:"Oppsummer historien sammen. La barna lage en lyd eller bevegelse fra boka.", varighet:"20-25 min" },
    { tittel:"Rim, regle og rytme", apning:"Klapp-velkomstsang. Hvert barn klapper sitt navn.", hoved:"Lær en ny regle med bevegelser. Repeter 3 ganger. Lag rim sammen: 'Hva rimer på kake?'", avslutning:"Avslutningssang. Hver dag samme melodi.", varighet:"15-20 min" },
  ],
  kropp: [
    { tittel:"Bevegelsessamling", apning:"Stå i ring. Vifte med armene som trær i vinden.", hoved:"Hinderløype gjennom rommet: kravle under stol, hoppe over pute, balansere på tau. Hvert barn gjentar 2 ganger.", avslutning:"Lagge ned på matter og pust dypt. Spenne og slappe av musklene.", varighet:"25-30 min" },
    { tittel:"Sansesamling med smak", apning:"Lukk øynene og lukt på krydder (kanel, vanilje).", hoved:"Smak på 3-4 typer frukt med lukkede øyne. Hvilken er det? Søt/sur/sterk?", avslutning:"Tegne yndlings-smaken. Snakke om hva kroppen liker.", varighet:"20 min" },
  ],
  kunst: [
    { tittel:"Fargesamling", apning:"Sang om regnbuen.", hoved:"Vis fargekort. Let etter alle blå ting i rommet. Bland farger (rød+gul=oransje).", avslutning:"Hvert barn velger sin yndlingsfarge og tegner noe i den fargen.", varighet:"20-25 min" },
    { tittel:"Musikksamling", apning:"Trommerytme – barna hermer.", hoved:"Spille på rytmeinstrumenter. Stille-høyt, langsomt-fort. Improvisere små stykker.", avslutning:"Avslutte med en rolig sang sammen.", varighet:"20 min" },
  ],
  natur: [
    { tittel:"Naturskattekiste", apning:"Sang om årstiden.", hoved:"Åpne en boks med naturobjekter (kongler, blader, steiner). Hvert barn velger ett og forteller hva det er.", avslutning:"Tegne sitt objekt. Henge tegninger på 'naturveggen'.", varighet:"20-25 min" },
    { tittel:"Værets-samling", apning:"Se ut av vinduet sammen. Hva slags vær er det?", hoved:"Diskuter været: sol/regn/snø/vind. Sang om været. Lag været med kroppen.", avslutning:"Tegne dagens vær på værkalenderen.", varighet:"15 min" },
  ],
  antall: [
    { tittel:"Telle-samling", apning:"Ringen-sang: tell alle barna.", hoved:"Telle ting i rommet: hvor mange stoler? Hvor mange vinduer? Lek 'Hvor mange?' med klosser.", avslutning:"Tellerim: 'Et lite ekorn satt i et tre'.", varighet:"15-20 min" },
    { tittel:"Former-samling", apning:"Vis formkort: sirkel, firkant, trekant.", hoved:"Let etter formene i rommet. Lag former med kroppen (rund som ball, spiss som trekant).", avslutning:"Sortere klosser etter form.", varighet:"20 min" },
  ],
  etikk: [
    { tittel:"Følelsessamling", apning:"Følelseskort: 'Hvordan føler jeg meg i dag?' – hvert barn peker.", hoved:"Les en bok om følelser. Diskuter: 'Hva gjør du når du blir lei deg?'. Rollespille korte situasjoner.", avslutning:"Klem-sirkel eller 'vifte-klem' for de som ikke vil klemme.", varighet:"20-25 min" },
    { tittel:"Filosofisk samling", apning:"Sitte i ring med lys i midten.", hoved:"Stille et åpent spørsmål: 'Hva er vennskap?' 'Hva er rettferdig?'. La barna tenke og svare etter tur. Ingen riktige svar.", avslutning:"Oppsummer det dere har funnet ut sammen.", varighet:"15-20 min" },
  ],
  naermiljo: [
    { tittel:"Nærmiljø-samling", apning:"Vise bilder fra nærområdet.", hoved:"Snakke om turene barna har vært på. Hva har dere sett? Lage et stort kart sammen.", avslutning:"Planlegge neste tur.", varighet:"20 min" },
    { tittel:"Familiesamling", apning:"Hvert barn viser et familiebilde (medbrakt).", hoved:"Fortelle om sin familie: hvem bor hjemme? Hva liker dere å gjøre? Alle familier er forskjellige.", avslutning:"Tegne familien sin.", varighet:"25 min" },
  ],
};

const PROSJEKT_MAL = {
  kommunikasjon: [
    { tittel:"Vi lager vår egen bok", varighet:"3-4 uker", faser:["Uke 1: Idéfase – velge tema, snakke om hva en bok er","Uke 2: Skriving – barna dikterer, voksen skriver","Uke 3: Illustrasjon – barna tegner","Uke 4: Lansering – les boka høyt for foreldre"], mal:"Barnas medvirkning, fortellerglede, begynnende skriftspråk" },
  ],
  kropp: [
    { tittel:"Fra jord til bord", varighet:"4-6 uker", faser:["Uke 1: Plante frø i potter","Uke 2-4: Vanne, observere, tegne vekst","Uke 5: Høste","Uke 6: Lage mat sammen av det dere har dyrket"], mal:"Sunn mat, naturforståelse, motorikk i hagearbeid" },
  ],
  kunst: [
    { tittel:"Vår egen utstilling", varighet:"3 uker", faser:["Uke 1: Velge tema, eksperimentere med materialer","Uke 2: Lage kunstverk i ulike teknikker","Uke 3: Henge opp, invitere foreldre til vernissage"], mal:"Estetisk uttrykk, stolthet, kulturopplevelser" },
  ],
  natur: [
    { tittel:"Skogens hemmeligheter", varighet:"4 uker", faser:["Uke 1: Tur i skogen, samle naturmateriale","Uke 2: Studere insekter og småkryp med lupe","Uke 3: Lage skogsdyr i leire","Uke 4: Bygge miniatyrskog med funn fra turene"], mal:"Naturkunnskap, undring, bærekraft" },
    { tittel:"Vann – fra dråpe til hav", varighet:"3 uker", faser:["Uke 1: Eksperiment med vann (flyte/synke, fryse/smelte)","Uke 2: Vannets kretsløp – tegninger og forklaringer","Uke 3: Besøk en bekk, et basseng eller en strand"], mal:"Naturfag, eksperimentering, nysgjerrighet" },
  ],
  antall: [
    { tittel:"Tall i hverdagen", varighet:"3 uker", faser:["Uke 1: Telle alt i barnehagen","Uke 2: Måle (lengde, vekt, volum) med stokk, sko, kopper","Uke 3: Lage egne tallplakater"], mal:"Begynnende matematikkforståelse" },
  ],
  etikk: [
    { tittel:"Hva er en god venn?", varighet:"2-3 uker", faser:["Uke 1: Samtaler og bøker om vennskap","Uke 2: Rollespill av vanskelige situasjoner","Uke 3: Lage 'Vennskapsbok' med foto og tegninger"], mal:"Empati, sosial kompetanse, etisk refleksjon" },
  ],
  naermiljo: [
    { tittel:"Vår barnehage og nabolaget", varighet:"4 uker", faser:["Uke 1: Tegne barnehagen utenfra","Uke 2: Tur i nabolaget, fotografere","Uke 3: Intervjue en nabo eller butikkeier","Uke 4: Lage en utstilling og presentere"], mal:"Tilhørighet, samfunnskunnskap" },
  ],
};

const UKEPLAN_MAL = {
  vaar: { tema:"Våren våkner", mandag:"Tur i skogen – let etter vårtegn", tirsdag:"Plante frø i barnehagen", onsdag:"Vårsanger og rim", torsdag:"Mal vårbilder med fingermaling", fredag:"Samlingsstund: vis frem ting fra hjemmet som minner om vår" },
  sommer: { tema:"Sommerglede", mandag:"Vannlek i hagen", tirsdag:"Tur til skogen – studere insekter", onsdag:"Lage saft av rabarbra/bær", torsdag:"Friluftsfrokost", fredag:"Sommerfest med foreldre" },
  host: { tema:"Høstens skatter", mandag:"Samle løv, kongler og kastanjer", tirsdag:"Lage høstbilder med limte blader", onsdag:"Bake eplekake sammen", torsdag:"Tur i regnet – studere pytter", fredag:"Høstvegg-utstilling" },
  vinter: { tema:"Vinterkos", mandag:"Akebrett-tur", tirsdag:"Lage snølykter", onsdag:"Inne-kos med bok og varm sjokolade", torsdag:"Dyrespor-jakt i snøen", fredag:"Vinterfest i snøen" },
  jul: { tema:"Julens lys", mandag:"Tenne adventslys, lese julehistorie", tirsdag:"Bake pepperkaker", onsdag:"Lage julepynt", torsdag:"Synge julesanger", fredag:"Nissefest – kle seg i rødt" },
  paske: { tema:"Påskeglede", mandag:"Male påskeegg", tirsdag:"Lage påskepynt – kyllinger og harer", onsdag:"Påske-skattejakt", torsdag:"Bake gulebrød eller hjemmelaget marsipan", fredag:"Påskelunsj" },
  ingen: { tema:"Vennskap og fellesskap", mandag:"Bli-kjent-leker", tirsdag:"Lage 'Vennskaps-kort' til hverandre", onsdag:"Samarbeidsoppgaver", torsdag:"Hjelpe-dag: alle hjelper hverandre", fredag:"Felles måltid og takkesirkel" },
};

// Hjelpefunksjon: bygg en grundig system-prompt med rammeplan-kontekst
function byggPrompt({ type, fagomrade, alder, arstid, vanskelighet, brukertekst }) {
  const fag = FAGOMRADER.find(f=>f.id===fagomrade);
  const ald = ALDER_GRUPPER.find(a=>a.id===alder);
  const ars = ARSTID_HOYTID.find(a=>a.id===arstid);
  const van = VANSKELIGHET.find(v=>v.id===vanskelighet);
  const inntype = INNHOLDSTYPER.find(i=>i.id===type);
  let sys = `Du er en svært erfaren norsk barnehagelærer med dyp kjennskap til Rammeplan for barnehagen (2017). Du svarer ALLTID på norsk bokmål, ALLTID konkret og praktisk, og du forankrer hvert innhold i rammeplanen.\n\n`;
  sys += `═══ OPPDRAG ═══\nDu skal lage: ${inntype?.navn || type}\nBeskrivelse: ${inntype?.beskrivelse || ""}\n\n`;
  if (fag && fagomrade !== "alle") {
    sys += `═══ FAGOMRÅDE: ${fag.navn} ${fag.ikon} ═══\n`;
    sys += `Hva rammeplanen sier: ${fag.innhold}\n`;
    sys += `Mål for barna: ${fag.malBarna.join(" • ")}\n`;
    sys += `Arbeidsmåter: ${fag.arbeidsmater.slice(0,4).join(", ")}\n\n`;
  } else if (fagomrade === "alle") {
    sys += `═══ TVERRFAGLIG (alle 7 fagområder) ═══\nKoble innholdet til minst 2-3 fagområder fra rammeplanen.\n\n`;
  }
  if (ald) sys += `═══ ALDER: ${ald.navn} ═══\nFokus: ${ald.fokus}\nTilpass språk, tidslengde og kompleksitet til denne alderen.\n\n`;
  if (ars && arstid !== "ingen") sys += `═══ ÅRSTID/HØYTID: ${ars.navn} ═══\nMåneder: ${ars.maaneder}. Motiver: ${ars.motiv}.\n\n`;
  if (van) sys += `═══ VANSKELIGHETSGRAD: ${van.navn} ═══\n${van.beskrivelse}\n\n`;
  // Type-spesifikke instruksjoner
  const formater = {
    aktivitet: `Bruk dette formatet:\n📌 TITTEL\n🎯 RAMMEPLAN-MÅL (2-3 konkrete mål fra fagområdet)\n👶 ALDER\n⏱️ VARIGHET\n📦 MATERIALER (konkret liste)\n📝 SLIK GJØR DU (nummererte steg)\n💬 SAMTALE MED BARNA (3-4 åpne spørsmål)\n✨ TIPS OG VARIASJONER`,
    samling: `Bruk dette formatet:\n📌 TITTEL\n🎯 RAMMEPLAN-MÅL\n⏱️ VARIGHET (totalt)\n🌅 ÅPNING (5 min – sang/rituale)\n🎯 HOVEDDEL (10-15 min – kjerneaktivitet)\n🌙 AVSLUTNING (5 min – oppsummering/sang)\n💬 SAMTALE-SPØRSMÅL\n✨ VOKSENROLLEN`,
    sang: `Lag en ORIGINAL sang/regle (ingen kopi av eksisterende verker). Format:\n🎵 TITTEL\n🎼 MELODIFORSLAG (eller 'egenkomponert')\n👶 ALDER\n📝 TEKST (3-4 vers eller en regle)\n💃 BEVEGELSER (hva barna kan gjøre)\n💡 PEDAGOGISK BRUK`,
    tegneark: `Format:\n🖍️ TITTEL (kort, konkret)\n🎯 RAMMEPLAN-MÅL (2 konkrete mål)\n👶 ALDER\n🎨 MOTIV (hva tegnearket viser – beskriv enkelt og tydelig)\n📝 TEGNEOPPGAVE (hva barna skal gjøre – konkret, alderstilpasset)\n💬 SAMTALE MENS DERE TEGNER (4-5 åpne, undrende spørsmål som åpner opp – ikke ja/nei-spørsmål)\n🔍 SENSORISKE OG MOTORISKE TIPS (hvilke fargestifter, blyantgrep, finmotorikk)\n✨ UTVIDELSE (hvordan jobbe videre med temaet i andre situasjoner)\n💡 TIL VOKSNE (faglig veiledning – hva ser dere etter, hvordan støtte uten å overstyre)`,
    prosjekt: `Format:\n📚 PROSJEKTTITTEL\n🎯 RAMMEPLAN-MÅL (flere fagområder)\n⏱️ VARIGHET (typisk 2-4 uker)\n📋 UKE-FOR-UKE PLAN (hva skjer hver uke)\n👶 BARNAS MEDVIRKNING (hvordan får barna påvirke?)\n📦 MATERIELL\n📸 DOKUMENTASJON (hvordan synliggjøre prosessen)`,
    ukeplan: `Format:\n📅 UKETEMA\n🎯 RAMMEPLAN-MÅL\nMANDAG: aktivitet og fagområde\nTIRSDAG: aktivitet og fagområde\nONSDAG: aktivitet og fagområde\nTORSDAG: aktivitet og fagområde\nFREDAG: aktivitet og fagområde\n💬 SAMLINGSSTUND-TEMA\n📝 NOTAT TIL PERSONALET`,
    manedsplan: `Format:\n🗓️ MÅNEDSTEMA\n🎯 RAMMEPLAN-MÅL (alle relevante fagområder)\nUKE 1: tema og hovedaktivitet\nUKE 2: tema og hovedaktivitet\nUKE 3: tema og hovedaktivitet\nUKE 4: tema og hovedaktivitet\n📚 BØKER/SANGER for måneden\n🎉 HØYTID/MARKERINGER\n📸 DOKUMENTASJON`,
    arsplan: `Lag en pedagogisk årsplan. Format:\n📆 OVERORDNET TEMA FOR ÅRET\n🎯 PEDAGOGISK GRUNNSYN (kort, knyttet til rammeplanen)\n🌿 SATSNINGSOMRÅDER (2-3 hovedområder fra fagområdene)\n\n📅 ÅRSHJUL (måned for måned):\nAUGUST – tilvenning og bli kjent\nSEPTEMBER – tema og fokus\nOKTOBER – tema og fokus\nNOVEMBER – tema og fokus\nDESEMBER – jul og advent\nJANUAR – tema og fokus\nFEBRUAR – tema og fokus\nMARS – tema og fokus\nAPRIL – tema og fokus (påske)\nMAI – tema og fokus (17. mai)\nJUNI – tema og fokus, sommeravslutning\n\n🤝 SAMARBEID HJEM-BARNEHAGE\n📊 VURDERING OG DOKUMENTASJON\n🎓 OVERGANGER (tilvenning, til skole)\n💡 NOTAT TIL PERSONALET`,
    manedsbrev: `Lag et månedsbrev til foreldre. Varmt, konkret og inviterende språk. Format:\n✉️ MÅNED OG ÅR\n💝 HILSEN (kort åpning)\n\n🌟 DETTE HAR VI GJORT (3-5 høydepunkter fra måneden, konkrete fortellinger uten å nevne enkeltbarn)\n\n📚 PEDAGOGISK FOKUS (fagområder vi har jobbet med, knyttet til rammeplanen)\n\n📅 DETTE SKJER FREMOVER (kommende uker)\n\n📌 PRAKTISK INFO (klær, husk på, viktige datoer)\n\n💬 SAMTALETIPS (hva kan dere snakke med barna deres om hjemme?)\n\n🙏 AVSLUTNING (takk, ønske god måned)`,
    samtale: `Lag 5-7 åpne, filosofiske eller undrende spørsmål. Format:\n💬 TEMA\n🎯 RAMMEPLAN-MÅL\n👶 ALDER\n1. [spørsmål]\n2. [spørsmål]\n...\n✨ VEILEDNING TIL VOKSNE (hvordan lede samtalen, lytte aktivt, ikke vurdere svar)`,
    fritekst: `Svar konkret, praktisk og fagligt. Strukturer svaret med overskrifter og kulepunkter når det passer.`,
  };
  sys += `═══ FORMAT FOR SVARET ═══\n${formater[type] || formater.fritekst}\n\n`;
  sys += `═══ KVALITETSKRAV ═══\n• Konkret og direkte anvendbart – en barnehagelærer skal kunne bruke det i morgen\n• Forankret i rammeplanen 2017 – bruk fagspråket korrekt (ikke "leke", men "lek som arbeidsform"; ikke "lære", men "danning")\n• Alderstilpasset – tenk barnets utviklingsnivå, oppmerksomhetsspenn, motorikk og språk\n• Inkluderende språk (alle barn, alle familietyper, alle bakgrunner)\n• Spørsmål til barn skal være ÅPNE og UNDRENDE – aldri ja/nei. Bruk "Hvordan tror du...", "Hva tenker du om...", "Fortell meg om..."\n• Voksenrollen: STØTTENDE, ikke instruerende. Følg barnets initiativ\n• Ikke gjenta lange fraser fra rammeplanen ordrett\n• Originalt innhold (ikke kopier eksisterende sanger eller verker)\n• Norsk bokmål, varmt og inviterende språk\n\n═══ STRENGT KRAV: PRAKTISK GJENNOMFØRING ═══\nI "SLIK GJØR DU" / "HOVEDDEL" / "FORLØP" / praktisk gjennomføring skriver du KUN det de ansatte gjør, steg for steg. Skriv som en oppskrift de kan følge direkte.\n\nFORBUDT i gjennomføringen:\n• IKKE skriv mål eller hensikt ("for å styrke...", "som utvikler...")\n• IKKE skriv refleksjoner eller pedagogiske begrunnelser\n• IKKE skriv læringsutbytte eller utviklingsperspektiv\n• IKKE skriv hvorfor aktiviteten er viktig\n• IKKE bruk ord som "rammeplan", "fagområde", "danning", "kompetanse" i denne seksjonen\n\nTILLATT i gjennomføringen:\n• Hva personalet gjør konkret ("Personalet legger frem ark og fargestifter på bordet")\n• Hvilke materialer som brukes\n• Hvordan barna inviteres med, deltar og fordeles\n• Tidsangivelser ("Etter 5 minutter samles gruppa")\n• Hvordan rommet eller bordet organiseres\n• Praktiske tips for ulike situasjoner ("Hvis et barn ikke vil delta, ...")\n\nALT om mål, hensikt, læringsutbytte og rammeplan-forankring skal stå i "RAMMEPLAN-MÅL"-seksjonen – ALDRI i "SLIK GJØR DU".\n\nEKSEMPEL – RIKTIG "SLIK GJØR DU":\n"1. Dekk bordet med voksduk. Sett frem ark, pensler og høstfarger (rød, gul, oransje, brun).\n2. Samle barna ved bordet. Vis dem fargene og la dem velge en pensel hver.\n3. Personalet maler først et eksempel mens barna ser på.\n4. La barna male fritt i 15-20 minutter. Voksne sitter ved bordet og hjelper ved behov.\n5. Heng opp bildene på vegg når de er tørre."\n\nEKSEMPEL – GALT (inneholder mål og begrunnelse):\n"Barna maler med høstfarger for å styrke kreativitet og finmotorikk. Denne aktiviteten utvikler deres estetiske sans og knytter dem til årstidens farger. Personalet observerer barnas uttrykk..."\n\n`;
  if (brukertekst && brukertekst.trim()) sys += `═══ BRUKERENS EKSTRA ØNSKE ═══\n${brukertekst.trim()}\n\n`;
  sys += `Lever et komplett, brukbart svar nå.`;
  return sys;
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

// ═══════════════════════════════════════════
//  AI EKSEMPEL-BIBLIOTEK
//  ─────────────────────────────────────────────
//  Eksempler grupperes etter type. Hvert eksempel har metadata for å vise
//  relevante forslag basert på brukerens valg (alder, fagområde, årstid).
// ═══════════════════════════════════════════
const AI_EKSEMPLER = {
  aktivitet: [
    { tekst:"Aktivitet om vannlek for de minste", fag:"natur", alder:"1-2" },
    { tekst:"Sansemotorisk aktivitet med naturmaterialer", fag:"natur", alder:"3-4" },
    { tekst:"Tellelek med konkreter", fag:"antall", alder:"3-4" },
    { tekst:"Aktivitet om følelser med følelseskort", fag:"etikk", alder:"3-4" },
    { tekst:"Bevegelseslek med rytme og musikk", fag:"kropp", alder:"2-3" },
    { tekst:"Maleaktivitet med høstløv", fag:"kunst", alder:"3-4", arstid:"host" },
    { tekst:"Aktivitet om språk og rim for førskolebarn", fag:"kommunikasjon", alder:"5-6" },
    { tekst:"Vinteraktivitet ute i snøen", fag:"natur", alder:"3-4", arstid:"vinter" },
    { tekst:"Aktivitet om nærmiljø og naboer", fag:"naermiljo", alder:"4-5" },
  ],
  samling: [
    { tekst:"Samlingsstund om våren og spirende blomster", fag:"natur", alder:"3-4", arstid:"vaar" },
    { tekst:"Samlingsstund med følelser og kroppsspråk", fag:"etikk", alder:"3-4" },
    { tekst:"Samlingsstund om tall og mengder", fag:"antall", alder:"4-5" },
    { tekst:"Samling med fingerregler og sanger", fag:"kommunikasjon", alder:"1-2" },
    { tekst:"Eventyrstund med rollelek", fag:"kunst", alder:"3-4" },
    { tekst:"Samlingsstund om sommer og varme", fag:"natur", alder:"3-4", arstid:"sommer" },
    { tekst:"Samling om jul og familietradisjoner", fag:"naermiljo", alder:"4-5", arstid:"jul" },
    { tekst:"Filosofisk samtale: hva er en god venn?", fag:"etikk", alder:"4-5" },
  ],
  sang: [
    { tekst:"Original bevegelsessang for 1-2-åringer", fag:"kropp", alder:"1-2" },
    { tekst:"Sangregle om årstidene", fag:"natur", alder:"3-4" },
    { tekst:"Tallregle med fingre fra 1 til 10", fag:"antall", alder:"3-4" },
    { tekst:"Sang om vennskap og det å være snill", fag:"etikk", alder:"3-4" },
    { tekst:"Sangleik med navn for små barn", fag:"kommunikasjon", alder:"1-2" },
    { tekst:"Vintersang om snø og mørke", fag:"natur", alder:"3-4", arstid:"vinter" },
  ],
  tegneark: [
    { tekst:"Tegneark om husdyr for 3-åringer", fag:"natur", alder:"3-4" },
    { tekst:"Fargeleggings-ark med høstfarger", fag:"kunst", alder:"3-4", arstid:"host" },
    { tekst:"Tegneark om tall og former", fag:"antall", alder:"4-5" },
    { tekst:"Selvportrett-tegneark med følelser", fag:"etikk", alder:"4-5" },
    { tekst:"Tegneark om familien min", fag:"naermiljo", alder:"3-4" },
    { tekst:"Påske-tegneark med kyllinger og egg", fag:"kunst", alder:"3-4", arstid:"paaske" },
    { tekst:"Tegneark om kroppen og kroppsdeler", fag:"kropp", alder:"3-4" },
  ],
  prosjekt: [
    { tekst:"Prosjekt om vennskap (2-3 uker)", fag:"etikk", alder:"4-5" },
    { tekst:"Naturvitenskaplig prosjekt om planter", fag:"natur", alder:"4-5", arstid:"vaar" },
    { tekst:"Prosjekt om identitet: hvem er jeg?", fag:"etikk", alder:"5-6" },
    { tekst:"Prosjekt om vann i alle former", fag:"natur", alder:"3-4" },
    { tekst:"Prosjekt om språk og bokstaver", fag:"kommunikasjon", alder:"5-6" },
    { tekst:"Bærekrafts-prosjekt om resirkulering", fag:"natur", alder:"4-5" },
  ],
  ukeplan: [
    { tekst:"Ukeplan med tema 'kroppen vår'", fag:"kropp", alder:"3-4" },
    { tekst:"Ukeplan om høst og innhøsting", fag:"natur", alder:"3-4", arstid:"host" },
    { tekst:"Tverrfaglig ukeplan om tall i hverdagen", fag:"antall", alder:"4-5" },
    { tekst:"Ukeplan med vennskap som rød tråd", fag:"etikk", alder:"3-4" },
    { tekst:"Juleforberedelser – ukeplan", fag:"naermiljo", alder:"3-4", arstid:"jul" },
  ],
  manedsplan: [
    { tekst:"Månedsplan: Mars måned – våren kommer", fag:"natur", alder:"3-4", arstid:"vaar" },
    { tekst:"Månedsplan: Desember med juletradisjoner", fag:"naermiljo", alder:"3-4", arstid:"jul" },
    { tekst:"Månedsplan om kunst og kreativitet", fag:"kunst", alder:"3-4" },
    { tekst:"Tverrfaglig månedsplan: kropp og bevegelse", fag:"kropp", alder:"3-4" },
  ],
  arsplan: [
    { tekst:"Årsplan med vennskap som rød tråd", fag:"etikk", alder:"3-4" },
    { tekst:"Årsplan med natur og bærekraft som satsningsområde", fag:"natur", alder:"3-4" },
    { tekst:"Årsplan med språk og kommunikasjon som hovedfokus", fag:"kommunikasjon", alder:"4-5" },
    { tekst:"Årsplan for småbarnsavdeling 1-3 år", fag:"alle", alder:"1-2" },
    { tekst:"Årsplan med lek som arbeidsmetode", fag:"alle", alder:"3-4" },
  ],
  manedsbrev: [
    { tekst:"Månedsbrev for september – tilvenning og høst", fag:"natur", alder:"3-4", arstid:"host" },
    { tekst:"Månedsbrev for desember – jul og advent", fag:"naermiljo", alder:"3-4", arstid:"jul" },
    { tekst:"Månedsbrev for april – påske og våren", fag:"natur", alder:"3-4", arstid:"paaske" },
    { tekst:"Månedsbrev for mai – 17. mai og sommeren nærmer seg", fag:"naermiljo", alder:"3-4", arstid:"sommer" },
    { tekst:"Månedsbrev for januar – nytt år, ny start", fag:"alle", alder:"3-4", arstid:"vinter" },
  ],
  samtale: [
    { tekst:"Filosofisk samtale: hva er rettferdighet?", fag:"etikk", alder:"4-5" },
    { tekst:"Samtale om følelser med små barn", fag:"etikk", alder:"2-3" },
    { tekst:"Undrende spørsmål om naturen", fag:"natur", alder:"3-4" },
    { tekst:"Samtale om familier – alle er ulike", fag:"naermiljo", alder:"3-4" },
    { tekst:"Filosofisk samtale: kan dyr tenke?", fag:"etikk", alder:"4-5" },
  ],
  fritekst: [
    { tekst:"Tips til å håndtere konflikter mellom barn", fag:"alle", alder:"3-4" },
    { tekst:"Hvordan inkludere et nytt barn i gruppa", fag:"alle", alder:"3-4" },
    { tekst:"Aktiviteter for regnværsdager inne", fag:"alle", alder:"3-4" },
    { tekst:"Tips til foreldresamtaler", fag:"alle", alder:"3-4" },
    { tekst:"Hvordan jobbe med språk hos 2-åringer", fag:"kommunikasjon", alder:"1-2" },
  ],
};

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
function AiSideComp({ onLagreSomSkjema, initialType, clearInitialType }) {
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

  // Hvis parent sender initialType (f.eks. fra hurtigknapp på Hjem), oppdater type og nullstill prop
  useEffect(() => {
    if (initialType) {
      setType(initialType);
      setAiResultat("");
      setAiVisFilter(true);
      if (clearInitialType) clearInitialType();
    }
  }, [initialType]);

  const visMelding = (m) => { setAiFeedback(m); setTimeout(()=>setAiFeedback(""), 3000); };

  const genAI = async () => {
    setAiLoading(true); setAiResultat(""); setAiFeedback("");

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
    const params = { type, fagomrade: primaerFag, alder, arstid, vanskelighet, brukertekst: utvidetBrukertekst };
    const prompt = byggPrompt(params);
    const fallback = fallbackInnhold(params);

    // AI_ENDPOINT kan settes til "/api/ai" når du har deployet en backend.
    // Standard: direkte til Anthropic (fungerer kun i claude.ai-forhåndsvisning).
    const AI_ENDPOINT = (typeof window !== "undefined" && window.__BH_AI_ENDPOINT) || "https://api.anthropic.com/v1/messages";
    const BRUK_BACKEND = AI_ENDPOINT !== "https://api.anthropic.com/v1/messages";

    // Bygg request basert på endpoint-type
    const requestBody = BRUK_BACKEND
      ? { prompt }  // Backend forventer bare prompt, legger til modell og nøkkel selv
      : {           // Direkte Anthropic-kall (kun for claude.ai-forhåndsvisning)
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        };

    // Timeout-kontroller – avbryt etter 30 sek så UI-et aldri henger
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        // Hent feilmelding fra body hvis mulig
        let detalj = "";
        try { detalj = (await r.text()).slice(0, 200); } catch (_) {}
        const err = new Error(`HTTP ${status}${detalj ? ": " + detalj : ""}`);
        err.status = status;
        err.transient = status >= 500 || status === 429; // 5xx og rate-limit kan forsøkes igjen
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
        // Retry én gang hvis feilen er transient (5xx, 429, eller nettverk)
        const erNettverk = e1.name === "TypeError" || e1.message?.includes("Failed to fetch");
        if (e1.transient || erNettverk) {
          await new Promise(r => setTimeout(r, 600));
          data = await forsok();
        } else {
          throw e1;
        }
      }

      // Pakk ut tekst – støtter både backend-format ({text:...}) og Anthropic-format ({content:[...]})
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
      if (e.name === "AbortError") feilGrunn = "AI-tidsavbrudd (>30s)";
      else if (e.status === 401 || e.status === 403) feilGrunn = "Manglende API-tilgang";
      else if (e.status === 429) feilGrunn = "For mange forespørsler – prøv igjen senere";
      else if (e.status >= 500) feilGrunn = "AI-tjeneste utilgjengelig";
      else if (e.name === "TypeError") feilGrunn = "Nettverks-/CORS-feil (krever backend i produksjon)";
      else feilGrunn = "AI-feil";
      // Logg detaljer til konsollen for diagnostikk
      console.warn("[AI-generering feilet]", { feilGrunn, error: e, status: e.status, message: e.message });
    }

    clearTimeout(timeoutId);

    // Sett resultat – garantert at brukeren alltid får noe
    setAiResultat(resultat);
    if (feilGrunn) {
      visMelding(`ℹ️ Brukte database (${feilGrunn})`);
    } else {
      visMelding("✅ Generert med AI");
    }
    setAiLoading(false);
    setAiVisFilter(false);
  };

  const kopierResultat = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(aiResultat);
        visMelding("✅ Kopiert til utklippstavlen!");
        return;
      }
    } catch (e) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = aiResultat;
      ta.style.position="fixed"; ta.style.left="-9999px";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      visMelding(ok ? "✅ Kopiert til utklippstavlen!" : "❌ Kunne ikke kopiere");
    } catch { visMelding("❌ Kunne ikke kopiere"); }
  };

  const nullstill = () => { setAiResultat(""); setAiVisFilter(true); };

  // Hurtigtips som setter filtrene direkte
  const presets = [
    { l:"Vår-aktivitet for treåringer", icon:"🌸", v:{type:"aktivitet",fagomrade:"natur",alder:"3-4",arstid:"vaar",vanskelighet:"enkel"} },
    { l:"Samling om vennskap", icon:"💝", v:{type:"samling",fagomrade:"etikk",alder:"4-5",arstid:"ingen",vanskelighet:"middels"} },
    { l:"Juleukeplan", icon:"🎄", v:{type:"ukeplan",fagomrade:"alle",alder:"alle",arstid:"jul",vanskelighet:"middels"} },
    { l:"Naturprosjekt 4 uker", icon:"🌿", v:{type:"prosjekt",fagomrade:"natur",alder:"4-5",arstid:"host",vanskelighet:"avansert"} },
    { l:"Sang om dyr", icon:"🎵", v:{type:"sang",fagomrade:"natur",alder:"2-3",arstid:"ingen",vanskelighet:"enkel"} },
    { l:"Filosofisk samtale", icon:"💬", v:{type:"samtale",fagomrade:"etikk",alder:"5-6",arstid:"ingen",vanskelighet:"avansert"} },
    { l:"Tegneark om sommeren", icon:"🖍️", v:{type:"tegneark",fagomrade:"natur",alder:"3-4",arstid:"sommer",vanskelighet:"enkel"} },
    { l:"Månedsplan for høsten", icon:"🗓️", v:{type:"manedsplan",fagomrade:"alle",alder:"alle",arstid:"host",vanskelighet:"middels"} },
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
              style={{padding:"6px 11px",fontSize:11,background:value===o.id?C.g:"#e8eff8",color:value===o.id?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
              {o.ikon?o.ikon+" ":""}{o.navn||o.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🤖 AI-assistent</div>
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
                  background:type===t.id?"linear-gradient(135deg, #2c5b8e, #4178bd)":"#f5f9fd",
                  color:type===t.id?"#fff":C.t,
                  border:type===t.id?"2px solid #2c5b8e":"2px solid #e8eff8",
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
                        background:"#f5f9fd",
                        color:C.t,
                        border:"1px solid #d8e6f5",
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
          <button className="btn" onClick={genAI} disabled={aiLoading}
            style={{background:aiLoading?"#ccc":C.g,color:"#fff",padding:"12px 18px",fontSize:14,width:"100%",border:"none",borderRadius:10,cursor:aiLoading?"wait":"pointer",fontWeight:800,fontFamily:"'Nunito',sans-serif"}}>
            {aiLoading?"🤔 Genererer …":"✨ Generer med AI"}
          </button>
        </div>
      )}

      {aiLoading && (
        <div style={{textAlign:"center",padding:30,background:C.w,borderRadius:12,marginBottom:14}}>
          <div className="spin" style={{margin:"0 auto 12px"}}/>
          <div style={{color:C.gr,fontSize:13,fontWeight:700}}>AI lager noe pedagogisk for deg …</div>
          <div style={{color:C.gr,fontSize:11,marginTop:5}}>Hvis det tar tid, henter vi fra databasen automatisk</div>
        </div>
      )}

      {aiResultat && !aiLoading && (
        <div className="fade" style={{background:C.w,borderRadius:13,padding:16,boxShadow:"0 2px 10px rgba(44,91,142,0.09)",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,gap:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t}}>✨ Resultat</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {onLagreSomSkjema && (
                <button className="btn" onClick={()=>{
                  // Bruk første linje (eller første 60 tegn) som tittel
                  const linje1 = aiResultat.split("\n").find(l=>l.trim()) || "AI-generert plan";
                  const tittel = linje1.replace(/^[^\p{L}\p{N}]+/u, "").slice(0, 80);
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

                  // Berik hvorfor med rammeplan-kontekst fra appens egne data
                  const valgteFagIder = Array.isArray(fagomrade) ? fagomrade.filter(f => f !== "alle") : (fagomrade !== "alle" ? [fagomrade] : []);
                  const rammeplanTekst = (() => {
                    if (valgteFagIder.length === 0) return "";
                    const blokker = valgteFagIder.map(fid => {
                      const f = FAGOMRADER.find(x => x.id === fid);
                      if (!f) return "";
                      let blokk = `📖 ${f.ikon} ${f.navn.toUpperCase()}\n`;
                      blokk += `Fra Rammeplan for barnehagen (2017):\n${f.innhold}\n\n`;
                      blokk += `Mål for barna:\n${f.malBarna.map(m => "• " + m).join("\n")}\n\n`;
                      blokk += `Arbeidsmåter:\n${f.arbeidsmater.slice(0, 4).map(a => "• " + a).join("\n")}`;
                      return blokk;
                    }).filter(Boolean);
                    return blokker.join("\n\n―――\n\n");
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
                  if (hvorfor && hvorfor.trim()) {
                    hvorforDeler.push("🎯 PEDAGOGISKE MÅL FOR DENNE AKTIVITETEN\n" + hvorfor.trim());
                  }
                  if (rammeplanTekst) {
                    hvorforDeler.push("📚 FORANKRING I RAMMEPLANEN\n\n" + rammeplanTekst);
                  }
                  hvorforDeler.push("ℹ️ INFORMASJON\n" + metadataLinjer.join("\n"));
                  const hvorforEndelig = hvorforDeler.join("\n\n―――――――――――――\n\n");

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
          <pre style={{whiteSpace:"pre-wrap",fontSize:13,color:C.t,lineHeight:1.75,fontFamily:"'Nunito',sans-serif",margin:0}}>{aiResultat}</pre>
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
          <div style={{background:"#fff8e1",borderRadius:10,padding:"10px 12px",fontSize:11,color:"#795548",borderLeft:"4px solid #6ba0d9"}}>
            <strong>💡 Tips:</strong> AI-en bruker Rammeplan 2017 og tilpasser etter alder og fagområde. Hvis nettet er tregt, henter vi automatisk fra databasen så du alltid får et svar.
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  AUTH MODUL – Supabase Auth
// ═══════════════════════════════════════════

const storageStatus = { persistent: true, diagnostisert: true, detaljer: "Supabase Auth" };
async function diagnostiserStorage() { return storageStatus; }

// Helper: hent brukerprofil fra user_profiles
async function hentProfil(userId) {
  const { data } = await supabase.from("user_profiles").select("*").eq("id", userId).single();
  return data;
}

// Helper: bygg aktivBruker-objekt fra Supabase user + profil
function byggBruker(user, profil) {
  return {
    id: user.id,
    epost: user.email,
    brukernavn: profil?.brukernavn || user.email.split("@")[0],
    admin: profil?.is_admin || false,
    visningsnavn: profil?.visningsnavn || profil?.display_name || "",
    avatar: profil?.avatar || "",
    profilbilde: profil?.profilbilde || "",
    telefon: profil?.phone || "",
  };
}

async function registrerBruker({ brukernavn, epost, passord, telefon }) {
  brukernavn = brukernavn.trim();
  epost = epost.trim().toLowerCase();
  if (brukernavn.length < 3) return { ok: false, feil: "Brukernavn må være minst 3 tegn" };
  if (passord.length < 6) return { ok: false, feil: "Passord må være minst 6 tegn" };

  const tlfV = validerTelefon(telefon);
  if (!tlfV.ok) return { ok: false, feil: tlfV.feil };

  const { data, error } = await supabase.auth.signUp({ email: epost, password: passord });
  if (error) return { ok: false, feil: error.message };
  const user = data.user;
  if (!user) return { ok: false, feil: "Registrering feilet – sjekk e-posten for bekreftelse" };

  const { count } = await supabase.from("user_profiles").select("id", { count: "exact", head: true });
  const erAdmin = (count || 0) === 0;

  await supabase.from("user_profiles").insert({
    id: user.id,
    brukernavn,
    epost,
    phone: tlfV.renset,
    is_admin: erAdmin,
    display_name: brukernavn,
    visningsnavn: "",
  });

  const profil = await hentProfil(user.id);
  return { ok: true, bruker: byggBruker(user, profil) };
}

async function loggInnBruker({ epost, passord }) {
  const e = (epost || "").trim().toLowerCase();
  if (!e || !passord) return { ok: false, feil: "Fyll ut alle felt" };

  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: passord });
  if (error) return { ok: false, feil: "Feil e-post eller passord" };

  const profil = await hentProfil(data.user.id);
  return { ok: true, bruker: byggBruker(data.user, profil) };
}

async function sendTilbakestillEpost(epost) {
  const { error } = await supabase.auth.resetPasswordForEmail(epost.trim().toLowerCase(), {
    redirectTo: window.location.origin,
  });
  if (error) return { ok: false, feil: error.message };
  return { ok: true };
}

async function hentSesjon() {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  const profil = await hentProfil(data.session.user.id);
  return byggBruker(data.session.user, profil);
}

async function slettSesjon() {
  await supabase.auth.signOut();
}

// ─── Profilendringer ───
async function oppdaterVisningsnavn(brukerId, nyttNavn) {
  const navn = (nyttNavn || "").trim();
  const { error } = await supabase.from("user_profiles").update({ visningsnavn: navn, display_name: navn || undefined }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Kunne ikke oppdatere visningsnavn" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

function publiskBruker(u) {
  if (!u) return null;
  return {
    id: u.id,
    brukernavn: u.brukernavn,
    epost: u.epost,
    telefon: u.telefon || "",
    admin: u.admin,
    visningsnavn: u.visningsnavn,
    avatar: u.avatar,
    profilbilde: u.profilbilde,
  };
}

// Lett validering av telefonnummer (kun siffer/mellomrom/+, 6-15 tegn)
function validerTelefon(tlf) {
  const t = String(tlf || "").trim();
  if (t === "") return { ok: true, renset: "" };
  const renset = t.replace(/\s+/g, " ");
  if (!/^[+0-9 ]+$/.test(renset)) return { ok: false, feil: "Telefonnummer kan kun inneholde sifre, mellomrom og +" };
  const sifre = renset.replace(/[^0-9]/g, "");
  if (sifre.length < 6) return { ok: false, feil: "Telefonnummer er for kort" };
  if (sifre.length > 15) return { ok: false, feil: "Telefonnummer er for langt" };
  return { ok: true, renset };
}

async function oppdaterTelefon(brukerId, nyTelefon) {
  const v = validerTelefon(nyTelefon);
  if (!v.ok) return { ok: false, feil: v.feil };
  const { error } = await supabase.from("user_profiles").update({ phone: v.renset }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

async function oppdaterAvatar(brukerId, emoji) {
  const { error } = await supabase.from("user_profiles").update({ avatar: emoji }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

// Bildekomprimering: leser fil, beskjærer kvadratisk (sentrert), skalerer til maxSize, returnerer JPEG data-URL
async function komprimerBilde(file, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("Ingen fil valgt")); return; }
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Filen er ikke et bilde (JPG, PNG eller WEBP)"));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("Bildet er for stort (maks 12 MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Kunne ikke lese filen"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Kunne ikke laste bildet"));
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) { reject(new Error("Bildet har ingen størrelse")); return; }
          // Sentrert kvadrat-utsnitt
          const minDim = Math.min(w, h);
          const sx = (w - minDim) / 2;
          const sy = (h - minDim) / 2;
          // Tegn til canvas
          const canvas = document.createElement("canvas");
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Kunne ikke opprette canvas")); return; }
          // Hvit bakgrunn ved transparente PNG-er
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, maxSize, maxSize);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
          // Output som JPEG (mindre filstørrelse, universell støtte)
          let dataUrl;
          try { dataUrl = canvas.toDataURL("image/jpeg", quality); }
          catch (e) { reject(new Error("Kunne ikke komprimere bildet")); return; }
          if (!dataUrl || dataUrl.length < 100) { reject(new Error("Bilde-konvertering feilet")); return; }
          resolve(dataUrl);
        } catch (err) {
          reject(err instanceof Error ? err : new Error("Bildet kunne ikke behandles"));
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function oppdaterProfilbilde(brukerId, dataUrl) {
  const update = dataUrl === null ? { profilbilde: null } : { profilbilde: dataUrl };
  const { error } = await supabase.from("user_profiles").update(update).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet – bildet er kanskje for stort" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

async function oppdaterBrukernavn(brukerId, nyttBrukernavn) {
  const navn = (nyttBrukernavn || "").trim();
  if (navn.length < 3) return { ok: false, feil: "Brukernavn må være minst 3 tegn" };
  const { error } = await supabase.from("user_profiles").update({ brukernavn: navn }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

async function oppdaterEpost(brukerId, nyEpost) {
  const epost = (nyEpost || "").trim().toLowerCase();
  if (!epost.includes("@") || !epost.includes(".")) return { ok: false, feil: "Ugyldig e-postadresse" };
  const { error } = await supabase.auth.updateUser({ email: epost });
  if (error) return { ok: false, feil: error.message };
  await supabase.from("user_profiles").update({ epost }).eq("id", brukerId);
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

async function oppdaterPassord(brukerId, gammeltPassord, nyttPassord) {
  if (!nyttPassord || nyttPassord.length < 6) return { ok: false, feil: "Nytt passord må være minst 6 tegn" };
  if (gammeltPassord === nyttPassord) return { ok: false, feil: "Nytt passord må være forskjellig fra det gamle" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, feil: "Ikke innlogget" };
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: gammeltPassord });
  if (signInError) return { ok: false, feil: "Feil gammelt passord" };
  const { error } = await supabase.auth.updateUser({ password: nyttPassord });
  if (error) return { ok: false, feil: error.message };
  return { ok: true };
}

// Passordstyrke-måler
function passordStyrke(p) {
  if (!p) return { nivaa: 0, tekst: "", farge: "#ccc" };
  if (p.length < 6) return { nivaa: 1, tekst: "For kort (minst 6 tegn)", farge: "#c62828" };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  if (score <= 1) return { nivaa: 2, tekst: "Svakt", farge: "#f4a261" };
  if (score <= 2) return { nivaa: 3, tekst: "OK", farge: "#fbc02d" };
  if (score <= 3) return { nivaa: 4, tekst: "Sterkt", farge: "#52b788" };
  return { nivaa: 5, tekst: "Veldig sterkt", farge: "#2d6a4f" };
}

const AVATAR_VALG = ["👤","🌿","🌸","🌻","🌳","🌈","🐰","🐱","🐶","🐻","🦊","🐼","🐨","🐯","🦁","🐸","🐧","🦉","🦋","🐞","🌞","🌙","⭐","🎨","🎵","📚","🍎","🌺","🎯","✨","🦄","🐢"];


// E-postadresse til support – brukes av Kontakt-knapper i UI
const SUPPORT_E_POST = "joel94@live.no";

function supportMailto() {
  return `mailto:${SUPPORT_E_POST}?subject=Barnehagehjelpen`;
}

const FAQ_DATA = [
  { sp:"Hvordan lager jeg en aktivitet med AI?", svar:"Gå til AI-assistent i menyen, velg innholdstype 'Pedagogisk aktivitet', fyll inn alder, fagområde og eventuelt årstid. Trykk 'Generer'. Hvis AI ikke svarer, bruker appen automatisk innhold fra databasen." },
  { sp:"Hvorfor husker ikke appen at jeg er innlogget?", svar:"Hvis du ser advarselen 'Begrenset lagring' på innloggingsskjermen, kjører appen i et miljø som ikke tillater varig lagring (typisk en forhåndsvisning). På et publisert domene vil 'Husk meg' fungere normalt." },
  { sp:"Hvordan skriver jeg ut et tegneark?", svar:"Åpne tegnearket, trykk 'Skriv ut'. Hvis nettleseren blokkerer utskrift, lastes det automatisk ned som HTML-fil du kan åpne og skrive ut derfra. Du kan også trykke 'Last ned' direkte." },
  { sp:"Kan jeg bruke appen offline?", svar:"Mesteparten av innholdet (sanger, aktiviteter, tegneark) fungerer offline siden det ligger lokalt. AI-genereringen krever internett. Hvis nettet er nede henter appen automatisk lignende innhold fra databasen." },
  { sp:"Hvordan endrer jeg passord?", svar:"Gå til 'Min profil' i menyen → 'Endre passord'. Du må oppgi gjeldende passord for å sette et nytt." },
  { sp:"Hvor lagres dataene mine?", svar:"Brukerkonto, favoritter, skjemaer og profilbilde lagres lokalt i nettleseren din. Passord er hashed med SHA-256 + unik salt. Ingen data sendes til en server uten at du eksplisitt deler noe (f.eks. via e-post til support)." },
  { sp:"Hva er forskjellen mellom Aktiviteter og Tegneark?", svar:"Aktiviteter er pedagogiske opplegg med HVA, HVORDAN og HVORFOR knyttet til rammeplanmål. Tegneark er fargeleggingsark med tegneoppgaver, samtalespørsmål og rammeplankobling." },
  { sp:"Hvordan blir noen admin?", svar:"Den første brukeren som registrerer seg blir automatisk admin. Admin kan deretter gjøre andre brukere til admin eller fjerne admin-rettigheter via Admin-panelet." },
  { sp:"Kan jeg slette kontoen min?", svar:"Ja – be en admin om å slette kontoen. Hvis du er eneste bruker kan du tømme nettleserens data for å fjerne alt." },
  { sp:"Hvorfor får jeg ikke AI-svar?", svar:"AI-generering krever at appen kan koble seg til Anthropic API. I forhåndsvisning fungerer det automatisk. På et publisert nettsted må backend-endepunktet være satt opp (se AI-ARKITEKTUR.md). Uansett hva som skjer, vil du alltid få et svar fra databasen." },
];

// ─── Favoritter per bruker ───
function tomFav() { return { sanger: [], aktiviteter: [], tegneark: [] }; }
async function hentFavoritter(brukerId) {
  if (!brukerId) return tomFav();
  const raw = await authStorage.get("bh_fav_" + brukerId);
  if (!raw) return tomFav();
  try {
    const parsed = JSON.parse(raw);
    return { sanger: parsed.sanger || [], aktiviteter: parsed.aktiviteter || [], tegneark: parsed.tegneark || [] };
  } catch { return tomFav(); }
}
async function lagreFavoritter(brukerId, fav) {
  if (!brukerId) return;
  await authStorage.set("bh_fav_" + brukerId, JSON.stringify(fav));
}

// ─── Dokumentasjon (praksisfortellinger og refleksjoner) per bruker ───
async function hentDokumentasjon(brukerId) {
  if (!brukerId) return [];
  const raw = await authStorage.get("bh_dok_" + brukerId);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
async function lagreDokumentasjon(brukerId, liste) {
  if (!brukerId) return false;
  try {
    await authStorage.set("bh_dok_" + brukerId, JSON.stringify(liste));
    return true;
  } catch (e) {
    console.error("[Dokumentasjon] Lagring feilet:", e);
    return false;
  }
}

// ─── Ukeplaner per bruker ───
async function hentUkeplaner(brukerId) {
  if (!brukerId) return [];
  const raw = await authStorage.get("bh_ukeplan_" + brukerId);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
async function lagreUkeplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    await authStorage.set("bh_ukeplan_" + brukerId, JSON.stringify(liste));
    return true;
  } catch (e) {
    console.error("[Ukeplan] Lagring feilet:", e);
    return false;
  }
}

// ─── Årsplaner per bruker ───
async function hentArsplaner(brukerId) {
  if (!brukerId) return [];
  const raw = await authStorage.get("bh_arsplan_" + brukerId);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
async function lagreArsplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    await authStorage.set("bh_arsplan_" + brukerId, JSON.stringify(liste));
    return true;
  } catch (e) {
    console.error("[Årsplan] Lagring feilet:", e);
    return false;
  }
}

// ═══════════════════════════════════════════
//  AUTH SCREEN – innlogging, registrering, glemt passord
// ═══════════════════════════════════════════
function AuthScreen({ onLoginSuccess }) {
  const [modus, setModus] = useState("login"); // login | register | glemt
  const [loading, setLoading] = useState(false);
  const [feil, setFeil] = useState("");
  const [suksess, setSuksess] = useState("");

  // Login
  const [li_epost, setLiEpost] = useState("");
  const [li_pw, setLiPw] = useState("");
  const [visPassord, setVisPassord] = useState(false);

  // Register
  const [r_brukernavn, setRBrukernavn] = useState("");
  const [r_epost, setREpost] = useState("");
  const [r_telefon, setRTelefon] = useState("");
  const [r_passord, setRPassord] = useState("");
  const [r_passord2, setRPassord2] = useState("");

  // Glemt passord
  const [g_epost, setGEpost] = useState("");

  const skiftModus = (m) => { setModus(m); setFeil(""); setSuksess(""); };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setFeil(""); setSuksess(""); setLoading(true);
    const r = await loggInnBruker({ epost: li_epost, passord: li_pw });
    setLoading(false);
    if (!r.ok) { setFeil(r.feil); return; }
    setSuksess("✅ Innlogget!");
    setTimeout(() => onLoginSuccess(r.bruker), 400);
  };

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    setFeil(""); setSuksess("");
    if (r_passord !== r_passord2) { setFeil("Passordene er ikke like"); return; }
    setLoading(true);
    const r = await registrerBruker({
      brukernavn: r_brukernavn, epost: r_epost,
      passord: r_passord, telefon: r_telefon,
    });
    setLoading(false);
    if (!r.ok) { setFeil(r.feil); return; }
    setSuksess(r.bruker.admin ? "✅ Konto opprettet! Du er admin (første bruker)." : "✅ Konto opprettet!");
    setTimeout(() => onLoginSuccess(r.bruker), 700);
  };

  const handleGlemtPassord = async (e) => {
    e?.preventDefault?.();
    setFeil("");
    if (!g_epost.trim()) { setFeil("Skriv e-postadressen din"); return; }
    setLoading(true);
    const r = await sendTilbakestillEpost(g_epost);
    setLoading(false);
    if (!r.ok) { setFeil(r.feil); return; }
    setSuksess("✅ E-post sendt! Sjekk innboksen for en lenke for å tilbakestille passordet.");
  };

  const inputStil = {
    width: "100%", padding: "12px 13px", fontSize: 14,
    border: "1.5px solid #d8e6f5", borderRadius: 10,
    background: "#f5f9fd", color: "#1a2c45",
    fontFamily: "'Nunito',sans-serif", boxSizing: "border-box",
    marginBottom: 10, outline: "none",
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
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#1f4068 0%,#3a72b0 50%,#6ba0d9 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 14px",fontFamily:"'Nunito',sans-serif"}}>
        <div style={{width:"100%",maxWidth:420}}>
          <div style={{textAlign:"center",marginBottom:22,color:"#fff"}}>
            <div style={{fontSize:46,marginBottom:6}}>🌿</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:28,lineHeight:1.1}}>Barnehagehjelpen</div>
            <div style={{fontSize:13,opacity:0.85,marginTop:5}}>Rammeplan 2017 – din pedagogiske medhjelper</div>
          </div>

          <div style={{background:"#fff",borderRadius:18,padding:22,boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>
            {modus !== "glemt" && (
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

            {modus === "glemt" && (
              <div style={{marginBottom:14}}>
                <button onClick={()=>skiftModus("login")} type="button"
                  style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:12,cursor:"pointer",fontWeight:700,padding:0}}>
                  ← Tilbake til innlogging
                </button>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#1a2c45",marginTop:8}}>🔓 Glemt passord</div>
              </div>
            )}

            {feil && (
              <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 12px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>
                ⚠️ {feil}
              </div>
            )}
            {suksess && (
              <div className="fade" style={{background:"#d8f3dc",color:"#1b5e47",padding:"10px 12px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #2d6a4f"}}>
                {suksess}
              </div>
            )}

            {/* LOGIN */}
            {modus === "login" && (
              <form onSubmit={handleLogin}>
                <label style={labelStil}>E-postadresse</label>
                <input type="email" value={li_epost} onChange={e=>setLiEpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" />
                <label style={labelStil}>Passord</label>
                <div style={{position:"relative"}}>
                  <input type={visPassord?"text":"password"} value={li_pw} onChange={e=>setLiPw(e.target.value)} style={{...inputStil,paddingRight:60}} autoComplete="current-password" placeholder="••••••••" />
                  <button type="button" onClick={()=>setVisPassord(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:"#5d7390",fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>
                    {visPassord?"Skjul":"Vis"}
                  </button>
                </div>
                <button type="submit" disabled={loading} style={knappStil(loading)}>
                  {loading?"🔐 Logger inn ...":"🔑 Logg inn"}
                </button>
                <div style={{textAlign:"center",marginTop:14}}>
                  <button type="button" onClick={()=>skiftModus("glemt")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:12,cursor:"pointer",fontWeight:700,textDecoration:"underline"}}>
                    Glemt passord?
                  </button>
                </div>
              </form>
            )}

            {/* REGISTRER */}
            {modus === "register" && (
              <form onSubmit={handleRegister}>
                <label style={labelStil}>Brukernavn (min. 3 tegn)</label>
                <input type="text" value={r_brukernavn} onChange={e=>setRBrukernavn(e.target.value)} style={inputStil} autoComplete="username" placeholder="kari_barnehagelaerer" />
                <label style={labelStil}>E-postadresse</label>
                <input type="email" value={r_epost} onChange={e=>setREpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" />
                <label style={labelStil}>Telefonnummer <span style={{color:"#8898ad",fontWeight:600,fontSize:10}}>(valgfritt)</span></label>
                <input type="tel" value={r_telefon} onChange={e=>setRTelefon(e.target.value)} style={inputStil} autoComplete="tel" placeholder="+47 123 45 678" inputMode="tel" />
                <label style={labelStil}>Passord (min. 6 tegn)</label>
                <div style={{position:"relative"}}>
                  <input type={visPassord?"text":"password"} value={r_passord} onChange={e=>setRPassord(e.target.value)} style={{...inputStil,paddingRight:60}} autoComplete="new-password" placeholder="••••••••" />
                  <button type="button" onClick={()=>setVisPassord(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:"#5d7390",fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>
                    {visPassord?"Skjul":"Vis"}
                  </button>
                </div>
                <label style={labelStil}>Bekreft passord</label>
                <input type={visPassord?"text":"password"} value={r_passord2} onChange={e=>setRPassord2(e.target.value)} style={inputStil} autoComplete="new-password" placeholder="••••••••" />
                <button type="submit" disabled={loading} style={knappStil(loading)}>
                  {loading?"✨ Oppretter konto ...":"✨ Opprett konto"}
                </button>
                <div style={{fontSize:11,color:"#5d7390",textAlign:"center",marginTop:12,lineHeight:1.5}}>
                  Konto opprettes i Supabase Auth – data synkroniseres mellom enheter.
                </div>
              </form>
            )}

            {/* GLEMT PASSORD */}
            {modus === "glemt" && (
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
function AdminPanel({ aktivBruker }) {
  const [brukere, setBrukere] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [bekreftSlett, setBekreftSlett] = useState(null);  // id på bruker som skal bekreftes slettet

  const visM = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""), 3000); };

  const last = async () => {
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("created_at");
    setBrukere(data || []);
    setLoading(false);
  };

  useEffect(() => { last(); }, []);

  const slettBruker = async (id) => {
    if (id === aktivBruker.id) { visM("⚠️ Kan ikke slette deg selv"); return; }
    setBekreftSlett(id);
  };

  const utforSletting = async () => {
    if (!bekreftSlett) return;
    await supabase.from("user_profiles").delete().eq("id", bekreftSlett);
    setBekreftSlett(null);
    visM("🗑 Bruker slettet fra profiler (auth-konto består)");
    last();
  };

  const settAdmin = async (id, verdi) => {
    await supabase.from("user_profiles").update({ is_admin: verdi }).eq("id", id);
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
        <div key={u.id} style={{background:"#fff",borderRadius:12,padding:"13px 15px",marginBottom:9,boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
            <div>
              <div style={{fontWeight:800,color:"#1a2c45",fontSize:14}}>{u.brukernavn} {u.is_admin&&<span style={{background:"#fff9c4",color:"#795548",borderRadius:8,padding:"1px 7px",fontSize:9,marginLeft:5,fontWeight:800}}>👑 ADMIN</span>}{u.id===aktivBruker.id&&<span style={{background:"#d8f3dc",color:"#1b5e47",borderRadius:8,padding:"1px 7px",fontSize:9,marginLeft:5,fontWeight:800}}>DU</span>}</div>
              <div style={{fontSize:11,color:"#5d7390",marginTop:2}}>📧 {u.epost}</div>
              <div style={{fontSize:10,color:"#5d7390",marginTop:2}}>📅 Opprettet: {new Date(u.opprettet).toLocaleDateString("no-NO")}</div>
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
      <div style={{background:"#fff8e1",borderRadius:10,padding:"10px 12px",fontSize:11,color:"#795548",borderLeft:"4px solid #6ba0d9",marginTop:14,lineHeight:1.6}}>
        <strong>ℹ️ Om data:</strong> Alle brukerkontoer lagres lokalt på denne enheten. Passordene er hashed med SHA-256 + unik salt. Kontoer kan ikke ses fra andre enheter.
      </div>

      {/* Bekreftelses-modal for sletting (fungerer der confirm() er blokkert) */}
      {bekreftSlett && (() => {
        const brukerSomSlettes = brukere.find(u => u.id === bekreftSlett);
        return (
          <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBekreftSlett(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:22,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#c62828",marginBottom:10}}>🗑 Slette bruker?</div>
              <p style={{fontSize:13,color:"#1a2c45",lineHeight:1.6,marginBottom:16}}>
                Vil du slette <strong>{brukerSomSlettes?.brukernavn || "denne brukeren"}</strong> permanent? Dette kan ikke angres.
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


function Barnehagehjelpen({ aktivBruker, onLogout, onUserUpdate }) {
  const [side, setSide] = useState("hjem");
  const [skjemaer, setSkjemaer] = useState([]);
  const [skjemaerLastet, setSkjemaerLastet] = useState(false);
  const [preselectAktiv, setPreselectAktiv] = useState(null);
  const [valgtFag, setValgtFag] = useState(null);
  const [rammeSeksjon, setRammeSeksjon] = useState("oversikt");
  const [valgtSkjema, setValgtSkjema] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [favoritter, setFavoritter] = useState({ sanger: [], aktiviteter: [], tegneark: [] });
  const [globalUkeplaner, setGlobalUkeplaner] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSok, setGlobalSok] = useState("");

  const vis = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""),3000); };

  // Global søk – leter på tvers av sanger, aktiviteter, tegneark, fagområder, rammeplan og dine ukeplaner
  const sokeResultat = (() => {
    const q = globalSok.trim().toLowerCase();
    if (q.length < 2) return null;
    const treff = { sanger:[], aktiviteter:[], tegneark:[], fagomrader:[], rammeplan:[], ukeplaner:[] };
    const matcher = (txt) => (txt||"").toLowerCase().includes(q);

    SANGER.forEach(s => {
      if (matcher(s.tittel) || matcher(s.tekst) || matcher(s.melodi)) treff.sanger.push(s);
    });
    AKTIVITETER.forEach(a => {
      if (matcher(a.tittel) || matcher(a.hva) || matcher(a.hvordan) || matcher(a.hvorfor)) treff.aktiviteter.push(a);
    });
    TEGNEARK.forEach(t => {
      if (matcher(t.tittel) || matcher(t.oppgave) || matcher(t.samtale) || matcher(t.mal)) treff.tegneark.push(t);
    });
    FAGOMRADER.forEach(f => {
      if (matcher(f.navn) || matcher(f.kortbeskrivelse) || matcher(f.innhold)) treff.fagomrader.push(f);
    });
    Object.entries(RE).forEach(([key, val]) => {
      const samletTekst = JSON.stringify(val).toLowerCase();
      if (samletTekst.includes(q)) treff.rammeplan.push({ key, tittel: val.tittel });
    });
    globalUkeplaner.forEach(p => {
      const samlet = (p.tittel||"") + " " + (p.tema||"") + " " + (p.uke||"") + " " + JSON.stringify(p.dager||{});
      if (samlet.toLowerCase().includes(q)) treff.ukeplaner.push(p);
    });

    const total = treff.sanger.length + treff.aktiviteter.length + treff.tegneark.length + treff.fagomrader.length + treff.rammeplan.length + treff.ukeplaner.length;
    return { total, ...treff, q };
  })();

  // Hjelpere for å navigere fra søketreff
  const aapneTegneark = (t) => { navigerTil("tegneark"); setGlobalSok(""); };
  const aapneAktivitet = (a) => { setPreselectAktiv(a.id); navigerTil("aktiviteter"); setGlobalSok(""); };
  const aapneFagomrade = (f) => { setValgtFag(f); setRammeSeksjon("fagomrader"); navigerTil("rammeplan"); setGlobalSok(""); };
  const aapneRammeplan = (key) => { setRammeSeksjon(key); setValgtFag(null); navigerTil("rammeplan"); setGlobalSok(""); };


  // Last favoritter når bruker logger inn
  useEffect(() => {
    if (aktivBruker?.id) hentFavoritter(aktivBruker.id).then(setFavoritter);
    if (aktivBruker?.id) hentUkeplaner(aktivBruker.id).then(setGlobalUkeplaner);
  }, [aktivBruker?.id]);

  // Last skjemaer fra storage når bruker logger inn
  useEffect(() => {
    let avbrutt = false;
    (async () => {
      if (!aktivBruker?.id) { setSkjemaer([]); setSkjemaerLastet(true); return; }
      try {
        const raw = await authStorage.get("bh_skjemaer_" + aktivBruker.id);
        if (avbrutt) return;
        setSkjemaer(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.error("[Skjemaer] Kunne ikke laste:", e);
        if (!avbrutt) setSkjemaer([]);
      }
      if (!avbrutt) setSkjemaerLastet(true);
    })();
    return () => { avbrutt = true; };
  }, [aktivBruker?.id]);

  // Lagre skjemaer til storage hver gang de endres (kun etter første lasting for å unngå å overskrive med tom liste)
  useEffect(() => {
    if (!aktivBruker?.id || !skjemaerLastet) return;
    authStorage.set("bh_skjemaer_" + aktivBruker.id, JSON.stringify(skjemaer))
      .catch(e => console.error("[Skjemaer] Kunne ikke lagre:", e));
  }, [skjemaer, aktivBruker?.id, skjemaerLastet]);

  // Toggle favoritt og lagre umiddelbart med ordentlig feilhåndtering
  const toggleFav = async (type, id) => {
    const liste = favoritter[type] || [];
    const finnes = liste.includes(id);
    const ny = finnes ? liste.filter(x=>x!==id) : [...liste, id];
    const oppdatert = { ...favoritter, [type]: ny };
    setFavoritter(oppdatert);
    if (aktivBruker?.id) {
      try {
        await lagreFavoritter(aktivBruker.id, oppdatert);
        vis(finnes ? "Fjernet fra favoritter" : "⭐ Lagt til i favoritter");
      } catch (e) {
        console.error("[Favoritter] Lagring feilet:", e);
        // Rull tilbake state-endringen
        setFavoritter(favoritter);
        vis("❌ Kunne ikke lagre favoritter");
      }
    }
  };

  // Navigasjon: lukk sidebar etter valg på mobil
  const navigerTil = (s) => { setSide(s); setSidebarOpen(false); };

  const favTotal = (favoritter.sanger?.length||0) + (favoritter.aktiviteter?.length||0) + (favoritter.tegneark?.length||0);

  const nav = [
    {id:"hjem",i:"🏠",n:"Hjem"},
    {id:"sanger",i:"🎵",n:"Sanger & Rim"},
    {id:"aktiviteter",i:"🏃",n:"Aktiviteter"},
    {id:"tegneark",i:"🖍️",n:"Tegneark"},
    {id:"favoritter",i:"⭐",n:"Favoritter",badge:favTotal},
    {id:"skjema-ny",i:"✏️",n:"Nytt skjema"},
    {id:"skjemaer",i:"📋",n:"Mine skjemaer",badge:skjemaer.length},
    {id:"rammeplan",i:"📖",n:"Rammeplan"},
    {id:"boker",i:"📚",n:"Bøker"},
    {id:"ai",i:"🤖",n:"AI-assistent"},
    {id:"ukeplan",i:"📅",n:"Ukeplan"},
    {id:"arsplan",i:"📆",n:"Årsplan"},
    {id:"dokumentasjon",i:"📔",n:"Dokumentasjon"},
    {id:"profil",i:"👤",n:"Min profil"},
    {id:"support",i:"❓",n:"Hjelp & FAQ"},
    ...(aktivBruker?.admin?[{id:"admin",i:"👑",n:"Admin-panel"}]:[])
  ];

  const hilsen = () => {
    const h = new Date().getHours();
    if (h < 10) return ["God morgen","☀️","Klar for en ny dag i barnehagen?"];
    if (h < 12) return ["God formiddag","🌤️","Hva skal barna oppdage i dag?"];
    if (h < 17) return ["God ettermiddag","🌈","Midttimen er full av muligheter!"];
    return ["God kveld","🌙","Planlegger du morgendagen?"];
  };
  const [hils, hikon, hsub] = hilsen();
  const dagensTips = [
    {t:"Filosofisk samtale",t2:"Still spørsmålet: 'Hva er en god venn?' – og lytt til svarene!",f:"etikk"},
    {t:"Tall i hverdagen",t2:"Tell trapper, stoler og vinduer på morgenturen!",f:"antall"},
    {t:"Sansetur",t2:"Gå barbeint i gress – snakk om hva dere kjenner under føttene",f:"kropp"},
    {t:"Fargebrev",t2:"La barna farge et brev til noen de er glad i",f:"kunst"},
    {t:"Naturobservasjon",t2:"Ta med lupe ut og utforsk hva som lever i gresset",f:"natur"},
    {t:"Rim og regler",t2:"Start samlingsstunden med Ole Dole Doff – barna velger aktivitet",f:"kommunikasjon"},
    {t:"Følelseskort",t2:"La hvert barn velge et følelseskort som beskriver dagen deres",f:"etikk"},
    {t:"Måling med kropp",t2:"Mål rommet i barneskritt – sammenlign hvem som tok flest",f:"antall"},
    {t:"Skyformer",t2:"Legg dere på ryggen ute og se på skyene – hva ligner de på?",f:"natur"},
    {t:"Naturlig fargepalett",t2:"Samle blader, blomster og steiner – sorter etter farge sammen",f:"kunst"},
    {t:"Mage-pust",t2:"Legg en bok på magen – pust så boka går opp og ned. Beroliger gruppa",f:"kropp"},
    {t:"Historiefortelling",t2:"Start med 'Det var en gang...' og la hvert barn legge til én setning",f:"kommunikasjon"},
    {t:"Min nabo",t2:"Snakk om hvem som bor i nabolaget – hvem hjelper hverandre?",f:"naermiljo"},
    {t:"Sortering",t2:"La barna sortere klosser etter form, farge og størrelse – diskuter valgene",f:"antall"},
    {t:"Lyttesirkel",t2:"Sitt stille i 1 minutt – fortell etterpå hva dere hørte",f:"kommunikasjon"},
    {t:"Småkrypjakt",t2:"Finn 5 ulike småkryp ute med lupe – tegn det dere fant",f:"natur"},
    {t:"Bevegelseslek",t2:"Etterlign dyr: hopp som kanin, kryp som slange, fly som fugl",f:"kropp"},
    {t:"Takknemlighet",t2:"Hvert barn nevner én ting de er glad for fra i dag",f:"etikk"},
    {t:"Bygg sammen",t2:"Lag en stor borg med klosser – alle må bidra på sin måte",f:"kunst"},
    {t:"Kart over rommet",t2:"Tegn et kart over barnehagen sett ovenfra – diskuter avstander",f:"naermiljo"},
  ];
  // Stabilt valg per dag: bruk dato (år+måned+dag) som seed istedenfor bare ukedag
  const idag = new Date();
  const datoFroe = idag.getFullYear() * 10000 + (idag.getMonth()+1) * 100 + idag.getDate();
  const [tipsOffset, setTipsOffset] = useState(0);
  const tipsIndex = (datoFroe + tipsOffset) % dagensTips.length;
  const tips = dagensTips[tipsIndex];
  const tipsFag = FAGOMRADER.find(f=>f.id===tips.f);
  const nesteTips = () => setTipsOffset(o => o + 1);

  const Hjem = ()=>(
    <div className="fade">
      {/* HERO */}
      <div style={{background:`linear-gradient(135deg, #2c5b8e 0%, #4178bd 50%, #6ba0d9 100%)`, borderRadius:22, padding:"28px 22px 24px", color:"#fff", marginBottom:20, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-20, right:-20, fontSize:90, opacity:.15, transform:"rotate(15deg)", pointerEvents:"none"}}>🌟</div>
        <div style={{position:"absolute", bottom:-15, left:10, fontSize:70, opacity:.12, transform:"rotate(-10deg)", pointerEvents:"none"}}>🎨</div>
        <div style={{fontSize:28}}>{hikon}</div>
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
        aapneTegneark={aapneTegneark}
        aapneFagomrade={aapneFagomrade}
        aapneRammeplan={aapneRammeplan}
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
            style={{background:"transparent", border:"1.5px solid #d8e6f5", color:C.g, width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
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
          ["🎵","Sanger & Rim",`${SANGER.length} sanger og rim`,"#2c5b8e","#e8eff8","sanger"],
          ["🏃","Aktiviteter",`${AKTIVITETER.length} ferdige aktiviteter`,"#1565c0","#e3f2fd","aktiviteter"],
          ["✏️","Nytt skjema","HVA · HVORDAN · HVORFOR","#6a1b9a","#f3e5f5","skjema-ny"],
          ["🖍️","Tegneark",`${TEGNEARK.length} tegneark å skrive ut`,"#c62828","#ffebee","tegneark"],
          ["📖","Rammeplan","7 fagområder utdypet","#2d6a4f","#d8f3dc","rammeplan"],
          ["🤖","AI-assistent","Lag sanger, planer og mer","#37474f","#eceff1","ai"],
        ].map(([ic,t,u,fc,lys,sid])=>(
          <div key={t} className="hover fade" onClick={()=>setSide(sid)} style={{background:lys, borderRadius:14, padding:"16px 14px", cursor:"pointer", boxShadow:`0 2px 10px ${fc}22`, borderLeft:`4px solid ${fc}`}}>
            <div style={{fontSize:26, marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'Fredoka One',cursive", fontSize:15, color:C.t}}>{t}</div>
            <div style={{fontSize:11, color:C.gr, marginTop:2}}>{u}</div>
          </div>
        ))}
      </div>

      {/* ÅRSPLAN SNARVEI */}
      <div className="hover" onClick={()=>navigerTil("arsplan")} style={{background:"linear-gradient(135deg,#d8f3dc,#b7e4c7)",borderRadius:14,padding:"14px 16px",cursor:"pointer",boxShadow:"0 2px 10px rgba(45,106,79,0.13)",borderLeft:"4px solid #2d6a4f",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:30}}>📆</span>
        <div>
          <div style={{fontWeight:800,color:"#2d6a4f",fontSize:14,fontFamily:"'Fredoka One',cursive"}}>Årsplan</div>
          <div style={{fontSize:11,color:"#40916c",lineHeight:1.4,marginTop:2}}>Bygg årsplan med 8 seksjoner, årshjul og AI-hjelp</div>
        </div>
        <span style={{marginLeft:"auto",fontSize:18,color:"#2d6a4f",opacity:0.7}}>→</span>
      </div>

      {/* LAG PLAN MED AI */}
      <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t, marginBottom:3}}>🤖 AI-forslag til planer</div>
      <p style={{fontSize:11, color:C.gr, marginBottom:11}}>La AI lage tekstforslag du kan lime inn i dine egne planer</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20}}>
        {[
          ["📅","Ukeplan","Mandag–fredag med tema","ukeplan","#1565c0","#e3f2fd"],
          ["🗓️","Månedsplan","Hele måneden strukturert","manedsplan","#6a1b9a","#f3e5f5"],
          ["✉️","Månedsbrev","Brev til foreldre","manedsbrev","#e67e22","#fff3e0"],
          ["📆","Årsplan","Overordnet tema og mål","arsplan","#2d6a4f","#d8f3dc"],
        ].map(([ic,t,u,typeId,fc,lys])=>(
          <div key={t} className="hover" onClick={()=>aapneAImedType(typeId)} style={{background:lys, borderRadius:12, padding:"12px 13px", cursor:"pointer", boxShadow:`0 2px 8px ${fc}1f`, borderLeft:`3px solid ${fc}`}}>
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
            <div key={f.id} className="hover" onClick={()=>{setValgtFag(f);setRammeSeksjon("fagomrader");setSide("rammeplan");}}
              style={{background:f.lys, borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.18s"}}>
              <span style={{fontSize:20}}>{f.ikon}</span>
              <div>
                <div style={{fontSize:11, fontWeight:800, color:f.farge, lineHeight:1.3}}>{f.navn}</div>
                <div style={{fontSize:9, color:C.gr, marginTop:1}}>{f.kortbeskrivelse}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:`linear-gradient(135deg,#e8eff8,#d8e6f5)`, borderRadius:13, padding:"13px 15px", borderLeft:`4px solid ${C.g}`}}>
        <div style={{fontWeight:800, color:C.g, fontSize:12, marginBottom:4}}>🌿 Om Barnehagehjelpen</div>
        <div style={{fontSize:12, color:"#1a3a5e", lineHeight:1.7}}>Alt innhold er koblet til Rammeplan 2017. Bruk AI-assistenten til å generere sanger, aktiviteter og pedagogiske planer tilpasset din barnegruppe.</div>
      </div>
    </div>
  );

  // NyttSkjemaForm is rendered directly in JSX (not via sider object) to keep component type stable

  const MineSkjemaer = ()=>(
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📋 Mine skjemaer</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{skjemaer.length} skjema{skjemaer.length!==1?"er":""} lagret</p>
      {feedback&&<div className="fade" style={{marginBottom:12,background:C.mint,borderRadius:8,padding:"9px 13px",color:C.g,fontWeight:700}}>{feedback}</div>}
      {skjemaer.length===0?(
        <div style={{background:C.w,borderRadius:16,padding:28,textAlign:"center",boxShadow:"0 2px 10px rgba(44,91,142,0.07)"}}>
          <div style={{fontSize:40,marginBottom:8}}>📝</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.t}}>Ingen skjemaer ennå</div>
          <div style={{color:C.gr,fontSize:12,marginTop:4,marginBottom:12}}>Lag ditt første aktivitetsskjema!</div>
          <button className="btn" onClick={()=>setSide("skjema-ny")} style={{background:C.g,color:"#fff",padding:"10px 18px",fontSize:13}}>✏️ Lag nytt skjema</button>
        </div>
      ):valgtSkjema?(
        <div className="fade" style={{background:C.w,borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>setValgtSkjema(null)} />
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:7}}>{valgtSkjema.tittel}</div>
          <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
            {valgtSkjema.alder&&<span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtSkjema.alder}</span>}
            {valgtSkjema.kategori&&<span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{valgtSkjema.kategori}</span>}
          </div>
          {[["🎯 HVA",valgtSkjema.hva,"#fff9c4"],["⚙️ HVORDAN",valgtSkjema.hvordan,"#e8f5e9"],["❓ HVORFOR",valgtSkjema.hvorfor,"#e3f2fd"]].map(([t,v,bg])=>v?(
            <div key={t} style={{background:bg,borderRadius:10,padding:"11px 13px",marginBottom:9}}>
              <div style={{fontWeight:800,color:C.t,marginBottom:3,fontSize:12}}>{t}</div>
              <div style={{color:C.t,fontSize:13,lineHeight:1.7}}>{v}</div>
            </div>
          ):null)}
          {valgtSkjema.materialer&&<div style={{background:"#fce4ec",borderRadius:10,padding:"11px 13px",marginBottom:9}}><div style={{fontWeight:800,color:"#c62828",marginBottom:3,fontSize:12}}>🧰 Materialer</div><div style={{color:C.t,fontSize:13}}>{valgtSkjema.materialer}</div></div>}
          {valgtSkjema.rammeplan.length>0&&<><div style={{fontSize:11,fontWeight:700,color:C.gr,marginBottom:6}}>Kobling til rammeplan:</div><div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>{valgtSkjema.rammeplan.map(r=><FagTag key={r} rid={r}/>)}</div></>}
          <button className="btn" onClick={()=>{setSkjemaer(p=>p.filter(s=>s.id!==valgtSkjema.id));setValgtSkjema(null);vis("🗑 Slettet");}} style={{background:"#ffebee",color:"#c62828",padding:"8px 16px",fontSize:12}}>🗑 Slett skjema</button>
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
                    {s.rammeplan.map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
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

  const RammeplanSide = ()=>{
    const seks=[["oversikt","📋","Oversikt"],["formal","🏛️","Formål"],["verdigrunnlag","💎","Verdigrunnlag"],["lek","🎭","Lek og læring"],["danning","💝","Omsorg og vennskap"],["medvirkning","🗣️","Medvirkning"],["fagomrader","📚","Fagområder"],["livsmestring","🌱","Livsmestring"],["pedagogisk","📋","Pedagogisk arbeid"],["samarbeid","👨‍👩‍👧","Samarbeid"],["overgang","🎒","Overgang"]];
    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📖 Rammeplan 2017</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:12}}>Barnehagens viktigste styringsverktøy</p>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {seks.map(([v,ic,l])=>(
            <button key={v} className="btn" onClick={()=>{setRammeSeksjon(v);setValgtFag(null);}} style={{padding:"6px 11px",fontSize:11,background:rammeSeksjon===v?C.g:"#e8f5e9",color:rammeSeksjon===v?"#fff":C.t}}>{ic} {l}</button>
          ))}
        </div>

        {rammeSeksjon==="oversikt"&&(
          <div className="fade">
            <div style={{background:"#fff8e1",borderRadius:13,padding:"13px 15px",marginBottom:14,borderLeft:"4px solid #6ba0d9"}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:13,marginBottom:5}}>Om Rammeplan for barnehagen</div>
              <div style={{fontSize:13,color:"#5d4037",lineHeight:1.7}}>Rammeplan for barnehagen (2017) er en forskrift til barnehageloven som fastsetter verdier, innhold og oppgaver for alle norske barnehager. Den er det viktigste arbeidsverktøyet for alle som jobber i barnehage.</div>
            </div>
            <div style={{display:"grid",gap:9}}>
              {[["🏛️","Formål","Barnehageloven §1 – overordnet formål","formal"],["💎","Verdigrunnlag","Demokrati, mangfold, menneskeverd","verdigrunnlag"],["🎭","Lek og læring","Lekens plass og personalets rolle","lek"],["💝","Omsorg og vennskap","Omsorg, danning og vennskap","danning"],["🗣️","Barnets medvirkning","Rett til innflytelse og deltakelse","medvirkning"],["📚","De 7 fagområdene","Alle faglig innhold og mål","fagomrader"],["🌱","Livsmestring og helse","Trivsel, sosial kompetanse, mobbing","livsmestring"],["📋","Pedagogisk arbeid","Planlegging, vurdering, dokumentasjon","pedagogisk"],["👨‍👩‍👧","Samarbeid med foreldre","Former for godt foreldresamarbeid","samarbeid"],["🎒","Overgang til skole","Forberedelse og ansvarsfordeling","overgang"]].map(([ic,t,u,v])=>(
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
                          <div><div style={{fontWeight:800,color:f.farge,fontSize:13}}>{f.nr}. {f.navn}</div><div style={{fontSize:11,color:C.gr}}>{f.kortbeskrivelse}</div></div>
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
                <div style={{background:valgtFag.lys,borderRadius:13,padding:18,marginBottom:12,borderLeft:`5px solid ${valgtFag.farge}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <span style={{fontSize:30}}>{valgtFag.ikon}</span>
                    <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:valgtFag.farge}}>{valgtFag.navn}</div>
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
                  <div style={{background:valgtFag.lys,borderRadius:8,padding:11,fontSize:13,color:C.t,lineHeight:1.7}}>{valgtFag.progresjon}</div>
                </div>
                <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:8}}>🛠 Arbeidsmetoder</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {valgtFag.arbeidsmater.map((a,i)=><div key={i} style={{background:valgtFag.lys,borderRadius:8,padding:"7px 10px",fontSize:11,color:valgtFag.farge,fontWeight:600}}>✓ {a}</div>)}
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
                        <div style={{fontSize:10,color:C.gr}}>{a.hva.substring(0,55)}...</div>
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
  };

  const TegnearkSide = ()=>{
    const [tkat, setTkat] = useState("alle");
    const [valgtT, setValgtT] = useState(null);
    const favSet = new Set(favoritter?.tegneark || []);
    const data = tkat==="favoritter"
      ? TEGNEARK.filter(t=>favSet.has(t.id))
      : (tkat==="alle" ? TEGNEARK : TEGNEARK.filter(t=>t.kategori===tkat));

    // ─── Bygg fullstendig selvstendig HTML for et tegneark ───
    // Brukes både for utskrift og nedlasting. All CSS er inline, SVG er innebygd,
    // og den fungerer uavhengig av appen.
    const escapeHTML = (s) => String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const trygtFilnavn = (s) => String(s||"tegneark").toLowerCase().replace(/[^a-z0-9æøå]+/gi,"_").replace(/^_+|_+$/g,"").slice(0,50) || "tegneark";

    const byggUtskriftsHTML = (ark, { selvstendig = true } = {}) => {
      const svgEl = document.getElementById("svg-ark-" + ark.id);
      const svgHTML = svgEl?.innerHTML || "";
      const fagomraderHTML = ark.rammeplan.map(r => {
        const f = FAGOMRADER.find(x => x.id === r);
        return f ? `<span class="tag" style="background:${f.lys};color:${f.farge}">${escapeHTML(f.ikon)} ${escapeHTML(f.navn)}</span>` : "";
      }).join("");
      const innhold = `
        <div class="side">
          <h1>${escapeHTML(ark.ikon)} ${escapeHTML(ark.tittel)}</h1>
          <div class="tags">
            <span class="tag" style="background:#d8e6f5;color:#2c5b8e">👶 ${escapeHTML(ark.alder)}</span>
            ${fagomraderHTML}
          </div>
          <div class="svg-wrap">${svgHTML}</div>
          <div class="boks gul"><strong>🖍️ Tegneoppgave:</strong><br>${escapeHTML(ark.oppgave)}</div>
          <div class="boks gronn"><strong>💬 Samtale med barna:</strong><br>${escapeHTML(ark.samtale)}</div>
          <div class="boks bla"><strong>📖 Mål:</strong> ${escapeHTML(ark.mal)}</div>
          <div class="footer">🌿 Barnehagehjelpen – Rammeplan 2017</div>
        </div>`;
      if (!selvstendig) return innhold;
      return `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(ark.tittel)} – Barnehagehjelpen</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", "Helvetica Neue", sans-serif; background: #f3f7fc; color: #1a2c45; padding: 20px 14px; line-height: 1.5; }
  .topp { max-width: 680px; margin: 0 auto 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .knapp { padding: 10px 16px; background: #2c5b8e; color: white; border: none; border-radius: 9px; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit; }
  .knapp.sek { background: #5d7390; }
  .knapp:hover { opacity: 0.9; }
  .side { max-width: 680px; margin: 0 auto; background: white; border-radius: 16px; padding: 26px 22px; box-shadow: 0 2px 16px rgba(44,91,142,0.08); }
  h1 { color: #2c5b8e; font-size: 24px; margin-bottom: 10px; font-weight: 800; }
  .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .tag { display: inline-block; border-radius: 20px; padding: 3px 11px; font-size: 12px; font-weight: 700; }
  .svg-wrap { text-align: center; border: 2px dashed #c4d6ec; border-radius: 16px; padding: 16px; margin: 14px 0; background: #f5f9fd; }
  .svg-wrap svg { max-width: 380px; width: 100%; height: auto; }
  .boks { border-radius: 12px; padding: 14px 16px; margin: 10px 0; font-size: 14px; }
  .boks.gul { background: #fff9c4; }
  .boks.gronn { background: #e8f5e9; }
  .boks.bla { background: #e3f2fd; }
  .footer { text-align: center; font-size: 11px; color: #999; margin-top: 18px; }
  @media print {
    @page { margin: 12mm; }
    body { background: white; padding: 0; }
    .topp { display: none; }
    .side { box-shadow: none; max-width: 100%; padding: 8px; }
  }
</style>
</head>
<body>
  <div class="topp">
    <button class="knapp" onclick="window.print()">🖨️ Skriv ut</button>
    <button class="knapp sek" onclick="window.close()">✕ Lukk</button>
  </div>
${innhold}
</body>
</html>`;
    };

    // ─── Nedlasting av selvstendig HTML-fil (fungerer overalt der blob URLs er tillatt) ───
    const lastNed = (ark) => {
      try {
        const html = byggUtskriftsHTML(ark, { selvstendig: true });
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tegneark-${trygtFilnavn(ark.tittel)}.html`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        vis("✅ Filen er lastet ned");
        return true;
      } catch (e) {
        console.error("[Last ned] feilet:", e);
        vis("❌ Kunne ikke laste ned");
        return false;
      }
    };

    // ─── Print med automatisk fallback til nedlasting ───
    // Strategi:
    //   1. Sett opp 'beforeprint' lytter
    //   2. Injiser print-innhold i en skjult div i nåværende dokument
    //   3. Kall window.print()
    //   4. Hvis beforeprint ikke har fyrt etter 1800ms → print er blokkert → start nedlasting
    const skrivUt = (ark) => {
      let beforePrintFiret = false;
      const beforeHandler = () => { beforePrintFiret = true; };
      const afterHandler = () => {
        window.removeEventListener("beforeprint", beforeHandler);
        window.removeEventListener("afterprint", afterHandler);
      };
      try {
        // Sett opp og injiser print-stiler (én gang)
        if (!document.getElementById("print-styles-bh")) {
          const style = document.createElement("style");
          style.id = "print-styles-bh";
          style.textContent = `
            #print-area-bh { display: none; }
            @media print {
              @page { margin: 12mm; }
              html, body { background: white !important; }
              body > *:not(#print-area-bh) { display: none !important; }
              #print-area-bh { display: block !important; }
              #print-area-bh .side { max-width: 680px; margin: 0 auto; font-family: 'Nunito', sans-serif; color: #1a2c45; }
              #print-area-bh h1 { color: #2c5b8e; font-size: 24px; margin: 0 0 8px; font-weight: 800; }
              #print-area-bh .tags { margin-bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
              #print-area-bh .tag { display: inline-block; border-radius: 20px; padding: 3px 12px; font-size: 12px; font-weight: 700; }
              #print-area-bh .boks { border-radius: 12px; padding: 14px 16px; margin: 10px 0; font-size: 14px; line-height: 1.6; }
              #print-area-bh .boks.gul { background: #fff9c4; }
              #print-area-bh .boks.gronn { background: #e8f5e9; }
              #print-area-bh .boks.bla { background: #e3f2fd; }
              #print-area-bh .svg-wrap { text-align: center; border: 2px dashed #c4d6ec; border-radius: 16px; padding: 14px; margin: 14px 0; background: #f5f9fd; }
              #print-area-bh .svg-wrap svg { max-width: 380px; width: 100%; height: auto; }
              #print-area-bh .footer { text-align: center; font-size: 11px; color: #999; margin-top: 16px; }
            }
          `;
          document.head.appendChild(style);
        }

        // Bygg innhold og injiser i skjult div
        const innholdHTML = byggUtskriftsHTML(ark, { selvstendig: false });
        let area = document.getElementById("print-area-bh");
        if (!area) {
          area = document.createElement("div");
          area.id = "print-area-bh";
          document.body.appendChild(area);
        }
        area.innerHTML = innholdHTML;

        // Lytt etter print-events for å oppdage om dialogen faktisk åpnes
        window.addEventListener("beforeprint", beforeHandler);
        window.addEventListener("afterprint", afterHandler);

        // Kall print etter at DOM er oppdatert
        setTimeout(() => {
          try {
            window.print();
          } catch (e) {
            console.warn("[Skriv ut] window.print() kastet feil:", e);
          }

          // Deteksjon: hvis beforeprint ikke har fyrt innen 1800ms, antar vi at print er blokkert
          setTimeout(() => {
            if (!beforePrintFiret) {
              console.warn("[Skriv ut] beforeprint-event fyrte ikke – antar blokkert kontekst, starter nedlasting");
              afterHandler(); // rydd opp lyttere
              vis("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
              setTimeout(() => lastNed(ark), 700);
            }
            // (ingen logging når print-dialog faktisk åpnes – det er normalfallet)
          }, 1800);
        }, 100);
      } catch (e) {
        console.error("[Skriv ut] uventet feil:", e);
        afterHandler();
        vis("⚠️ Utskrift feilet – laster ned i stedet");
        setTimeout(() => lastNed(ark), 500);
      }
    };

    // ─── Web Share API (deling) – kun tilgjengelig på mobil og noen desktop-nettlesere ───
    const kanDele = typeof navigator !== "undefined" && typeof navigator.share === "function";
    const del = async (ark) => {
      if (!kanDele) {
        // Fallback: kopier til utklippstavle
        return kopier(ark);
      }
      try {
        const tekst = `${ark.tittel}\n\n🖍️ Tegneoppgave:\n${ark.oppgave}\n\n💬 Samtale med barna:\n${ark.samtale}\n\n📖 Mål: ${ark.mal}\n\n👶 Alder: ${ark.alder}\n\nFra Barnehagehjelpen – Rammeplan 2017`;
        await navigator.share({ title: ark.tittel, text: tekst });
        vis("✅ Delt!");
      } catch (e) {
        if (e.name === "AbortError") return; // bruker avbrøt – ingen melding
        console.warn("[Del] feilet:", e);
        vis("❌ Kunne ikke dele");
      }
    };
    
    // Robust copy with fallback and user feedback
    const kopier = async (ark) => {
      const text = `${ark.tittel}\n\n🖍️ Tegneoppgave:\n${ark.oppgave}\n\n💬 Samtale med barna:\n${ark.samtale}\n\n📖 Mål: ${ark.mal}\n\n👶 Alder: ${ark.alder}`;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          vis("✅ Kopiert til utklippstavlen!");
          return;
        }
      } catch (e) { /* fall through to fallback */ }
      
      // Fallback: hidden textarea + execCommand
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        vis(ok ? "✅ Kopiert til utklippstavlen!" : "❌ Kunne ikke kopiere");
      } catch (e) {
        vis("❌ Kunne ikke kopiere");
      }
    };
    
    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🖍️ Tegneark</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>{TEGNEARK.length} barnevennlige tegneark fordelt på {TEGNEKAT.length-1} kategorier – klikk for å se og skrive ut</p>
        <div style={{background:"#fff8e1",borderRadius:12,padding:"11px 14px",marginBottom:14,borderLeft:"4px solid #6ba0d9",fontSize:12,color:"#795548"}}>
          <strong>💡 Slik bruker du tegnearkene:</strong> Bla i kategoriene under, åpne et ark, trykk "Skriv ut" for å printe, eller "Kopier" for å lagre teksten. Alle ark er koblet til rammeplanen med samtaleforslag.
        </div>
        <div style={{marginBottom:16,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,marginLeft:-4,marginRight:-4,paddingLeft:4,paddingRight:4}}>
          <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
            {[["favoritter",`⭐ Favoritter`],...TEGNEKAT].map(([v,l])=>{
              const cnt = v==="favoritter" ? favSet.size : (v==="alle" ? TEGNEARK.length : TEGNEARK.filter(t=>t.kategori===v).length);
              return (
                <button key={v} className="btn" onClick={()=>setTkat(v)} style={{padding:"7px 13px",fontSize:11,background:tkat===v?C.g:"#e8f5e9",color:tkat===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
                  <span>{l}</span>
                  <span style={{background:tkat===v?"rgba(255,255,255,0.25)":"rgba(44,91,142,0.12)",color:tkat===v?"#fff":C.g,borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800}}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>
        {valgtT ? (
          <div className="fade" style={{background:C.w,borderRadius:16,padding:20,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
            <Tilbake onClick={()=>setValgtT(null)} />
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,flex:1}}>{valgtT.ikon} {valgtT.tittel}</div>
              <button className={`fav-btn ${favSet.has(valgtT.id)?"aktiv":""}`} onClick={()=>toggleFav("tegneark",valgtT.id)} title={favSet.has(valgtT.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                {favSet.has(valgtT.id)?"⭐":"☆"}
              </button>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
              <span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtT.alder}</span>
              {valgtT.rammeplan.map(r=><FagTag key={r} rid={r}/>)}
            </div>
            <div id={"svg-ark-"+valgtT.id} className="svg-wrap-hover" style={{background:"#fafffe",border:"2px dashed #d8f3dc",borderRadius:14,padding:12,textAlign:"center",marginBottom:14}}>
              <div style={{maxWidth:320,margin:"0 auto"}}>{valgtT.svg}</div>
            </div>
            <div style={{background:"#fff9c4",borderRadius:11,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:13,marginBottom:4}}>🖍️ Tegneoppgave</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.7}}>{valgtT.oppgave}</div>
            </div>
            <div style={{background:"#e8f5e9",borderRadius:11,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#2e7d32",fontSize:13,marginBottom:4}}>💬 Samtale med barna</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.7}}>{valgtT.samtale}</div>
            </div>
            <div style={{background:"#e3f2fd",borderRadius:11,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:13,marginBottom:4}}>📖 Rammeplanen mål</div>
              <div style={{fontSize:13,color:C.t}}>{valgtT.mal}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:kanDele?"repeat(2,1fr)":"repeat(2,1fr)",gap:8}}>
              <button className="btn" onClick={()=>skrivUt(valgtT)} style={{background:C.g,color:"#fff",padding:"12px 12px",fontSize:13,fontWeight:800}}>🖨️ Skriv ut</button>
              <button className="btn" onClick={()=>lastNed(valgtT)} style={{background:"#2c5b8e",color:"#fff",padding:"12px 12px",fontSize:13,fontWeight:800}}>💾 Last ned</button>
              <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8f5e9",color:C.t,padding:"12px 12px",fontSize:13,fontWeight:700}}>📋 Kopier tekst</button>
              {kanDele ? (
                <button className="btn" onClick={()=>del(valgtT)} style={{background:"#fff3e0",color:"#e65100",padding:"12px 12px",fontSize:13,fontWeight:700}}>📤 Del</button>
              ) : (
                <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8eff8",color:C.t,padding:"12px 12px",fontSize:13,fontWeight:700}} title="Web Share API er ikke tilgjengelig">📋 Kopier (igjen)</button>
              )}
            </div>
            <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9,lineHeight:1.5}}>
              💡 Hvis utskrift ikke fungerer, lastes filen ned automatisk. Du kan også laste ned direkte.
            </div>
          </div>
        ) : (
          <>
            {data.length===0 && (
              <div style={{textAlign:"center",padding:28,color:C.gr,background:C.w,borderRadius:12}}>
                {tkat==="favoritter" ? "Du har ingen favoritt-tegneark ennå – trykk på ⭐ for å lagre" : "Ingen tegneark i denne kategorien"}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
              {data.map(t=>(
                <div key={t.id} className="hover fade" onClick={()=>setValgtT(t)} style={{background:C.w,borderRadius:13,padding:"14px 12px",cursor:"pointer",boxShadow:"0 2px 8px rgba(44,91,142,0.08)",textAlign:"center",position:"relative"}}>
                  <button className={`fav-btn ${favSet.has(t.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("tegneark",t.id);}} style={{position:"absolute",top:6,right:6,fontSize:16}} title={favSet.has(t.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                    {favSet.has(t.id)?"⭐":"☆"}
                  </button>
                  <div style={{background:"#f8fffe",borderRadius:10,padding:8,marginBottom:8,border:"1px solid #e8f5e9"}}>
                    <div style={{maxWidth:140,margin:"0 auto",pointerEvents:"none"}}>{t.svg}</div>
                  </div>
                  <div style={{fontWeight:800,color:C.t,fontSize:13}}>{t.ikon} {t.tittel}</div>
                  <div style={{fontSize:10,color:C.gr,marginTop:3}}>👶 {t.alder}</div>
                  <div style={{display:"flex",gap:4,marginTop:5,justifyContent:"center",flexWrap:"wrap"}}>
                    {t.rammeplan.map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span key={r} className="tag" style={{background:f.lys,color:f.farge,fontSize:9}}>{f.ikon}</span>:null;})}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── SupportSide – ren FAQ-side ───
  const SupportSide = ()=>{
    const [aapenFaq, setAapenFaq] = useState(null);
    const kontaktLenke = supportMailto();

    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>❓ Hjelp og FAQ</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Finn svar på vanlige spørsmål – trenger du mer hjelp, kontakt support direkte</p>

        <div style={{display:"grid",gap:7,marginBottom:18}}>
          {FAQ_DATA.map((item, i) => (
            <div key={i} style={{background:C.w,borderRadius:10,boxShadow:"0 1px 5px rgba(44,91,142,0.07)",overflow:"hidden"}}>
              <button onClick={()=>setAapenFaq(aapenFaq===i?null:i)} style={{width:"100%",padding:"13px 15px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,fontFamily:"'Nunito',sans-serif"}}>
                <span style={{fontWeight:700,color:C.t,fontSize:13,flex:1}}>{item.sp}</span>
                <span style={{color:C.g,fontSize:16,transform:aapenFaq===i?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
              </button>
              {aapenFaq===i && (
                <div className="fade" style={{padding:"0 15px 13px",fontSize:13,color:C.t,lineHeight:1.7,borderTop:"1px solid #e8eff8",paddingTop:11}}>
                  {item.svar}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:"linear-gradient(135deg,#2c5b8e,#4178bd)",borderRadius:14,padding:"18px 18px",color:"#fff",textAlign:"center"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,marginBottom:6}}>Fant du ikke svar?</div>
          <div style={{fontSize:12,opacity:0.9,marginBottom:14,lineHeight:1.6}}>Send oss en melding direkte på e-post – vi svarer så raskt vi kan</div>
          <a href={kontaktLenke} style={{display:"inline-block",background:"#fff",color:"#2c5b8e",padding:"11px 22px",borderRadius:10,textDecoration:"none",fontWeight:800,fontSize:14}}>
            📧 Kontakt support
          </a>
        </div>
      </div>
    );
  };


  // ─── UkeplanSide – Mandag til fredag med formiddag/ettermiddag/notat ───
  const UkeplanSide = ()=>{
    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");

    // Skjema-state
    const tomDag = { formiddag:"", ettermiddag:"", notat:"", bilde:"" };
    const [u_tittel, setUTittel] = useState("");
    const [u_uke, setUUke] = useState("");
    const [u_tema, setUTema] = useState("");
    const [u_dager, setUDager] = useState({
      mandag: {...tomDag}, tirsdag: {...tomDag}, onsdag: {...tomDag},
      torsdag: {...tomDag}, fredag: {...tomDag}
    });
    const [u_loading, setULoading] = useState(false);
    const [u_feil, setUFeil] = useState("");
    const [bildevelgerForDag, setBildevelgerForDag] = useState(null);
    const [bildeOpplaster, setBildeOpplaster] = useState(false);

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

    const lagre = async (oppdatertListe) => {
      const ok = await lagreUkeplaner(aktivBruker.id, oppdatertListe);
      if (!ok) { setUFeil("Kunne ikke lagre – muligens fordi lagring er blokkert i dette miljøet"); return false; }
      setPlaner(oppdatertListe);
      return true;
    };

    const nyPlan = () => {
      setValgt(null);
      setUTittel(""); setUUke(""); setUTema("");
      setUDager({
        mandag: {...tomDag}, tirsdag: {...tomDag}, onsdag: {...tomDag},
        torsdag: {...tomDag}, fredag: {...tomDag}
      });
      setUFeil(""); setVisning("ny");
    };

    const redigerPlan = (p) => {
      setValgt(p);
      setUTittel(p.tittel); setUUke(p.uke || ""); setUTema(p.tema || "");
      setUDager(p.dager || {
        mandag: {...tomDag}, tirsdag: {...tomDag}, onsdag: {...tomDag},
        torsdag: {...tomDag}, fredag: {...tomDag}
      });
      setUFeil(""); setVisning("rediger");
    };

    const lesPlan = (p) => { setValgt(p); setVisning("les"); };

    const oppdaterDag = (dag, felt, verdi) => {
      setUDager(prev => ({ ...prev, [dag]: { ...prev[dag], [felt]: verdi } }));
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
      if (ok) { vis("✅ Ukeplan lagret"); setVisning("liste"); }
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
      if (ok) { vis("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettPlan = async (id) => {
      const oppdatert = planer.filter(p => p.id !== id);
      const ok = await lagre(oppdatert);
      if (ok) { vis("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    // Bygg HTML for utskrift/nedlasting
    const byggHTML = (p) => {
      const escapeHTML = (s) => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
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
      const innholdHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const data = p.dager?.[d] || {};
        return `
          <td>
            ${data.formiddag ? `<div class="felt"><strong>Formiddag:</strong><br>${escapeHTML(data.formiddag).replace(/\n/g,"<br>")}</div>` : ""}
            ${data.ettermiddag ? `<div class="felt"><strong>Ettermiddag:</strong><br>${escapeHTML(data.ettermiddag).replace(/\n/g,"<br>")}</div>` : ""}
            ${data.notat ? `<div class="felt notat"><strong>Notat:</strong><br>${escapeHTML(data.notat).replace(/\n/g,"<br>")}</div>` : ""}
          </td>`;
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
        const escapeHTML = (s) => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
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
          const data = p.dager?.[d] || {};
          return `<td>
            ${data.formiddag ? `<div class="felt"><strong>Formiddag:</strong>${escapeHTML(data.formiddag).replace(/\n/g,"<br>")}</div>` : ""}
            ${data.ettermiddag ? `<div class="felt"><strong>Ettermiddag:</strong>${escapeHTML(data.ettermiddag).replace(/\n/g,"<br>")}</div>` : ""}
            ${data.notat ? `<div class="felt notat"><strong>Notat:</strong>${escapeHTML(data.notat).replace(/\n/g,"<br>")}</div>` : ""}
          </td>`;
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
              vis("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
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
        vis("✅ Lastet ned");
      } catch (e) {
        console.error("[Ukeplan nedlasting]", e);
        vis("❌ Nedlasting feilet");
      }
    };

    const kopier = async (p) => {
      const erEmoji = (b) => b && !b.startsWith("data:");
      const tekst = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const data = p.dager?.[d] || {};
        const dagN = d.charAt(0).toUpperCase() + d.slice(1);
        const emojiPrefix = erEmoji(data.bilde) ? data.bilde + " " : "";
        const linjer = [];
        if (data.formiddag) linjer.push(`  Formiddag: ${data.formiddag}`);
        if (data.ettermiddag) linjer.push(`  Ettermiddag: ${data.ettermiddag}`);
        if (data.notat) linjer.push(`  Notat: ${data.notat}`);
        return `${emojiPrefix}${dagN}:\n${linjer.length ? linjer.join("\n") : "  -"}`;
      }).join("\n\n");
      const full = `${p.tittel}\n${p.uke ? "Uke " + p.uke : ""}${p.tema ? "\nTema: " + p.tema : ""}\n\n${tekst}`;
      try {
        await navigator.clipboard.writeText(full);
        vis("✅ Kopiert");
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = full; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          vis("✅ Kopiert");
        } catch { vis("❌ Kopiering feilet"); }
      }
    };

    const filtrert = planer.filter(p => {
      if (!sok) return true;
      const s = sok.toLowerCase();
      return p.tittel.toLowerCase().includes(s) || (p.tema||"").toLowerCase().includes(s);
    });

    const iS = {width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:14,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10,outline:"none"};
    const labelStil = {display:"block",fontWeight:700,color:C.t,fontSize:12,marginBottom:5};
    const dagStil = (farge) => ({background:C.w,borderRadius:11,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(44,91,142,0.06)",borderLeft:`3px solid ${farge}`});

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // VISNING: Ny / Rediger
    if (visning === "ny" || visning === "rediger") {
      const erRediger = visning === "rediger";
      const dagFarger = { mandag:"#2c5b8e", tirsdag:"#1565c0", onsdag:"#6a1b9a", torsdag:"#c62828", fredag:"#2d6a4f" };
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger ukeplan":"📅 Ny ukeplan"}</div>

          {u_feil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {u_feil}</div>}

          <div style={{background:C.w,borderRadius:14,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <label style={labelStil}>Tittel</label>
            <input type="text" value={u_tittel} onChange={e=>setUTittel(e.target.value)} style={iS} placeholder="F.eks. 'Ukeplan blå avdeling'"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:9}}>
              <div>
                <label style={labelStil}>Uke (nr.)</label>
                <input type="text" value={u_uke} onChange={e=>setUUke(e.target.value)} style={iS} placeholder="22" inputMode="numeric"/>
              </div>
              <div>
                <label style={labelStil}>Tema</label>
                <input type="text" value={u_tema} onChange={e=>setUTema(e.target.value)} style={iS} placeholder="F.eks. 17. mai og mangfold"/>
              </div>
            </div>
          </div>

          {["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagBilde = u_dager[d].bilde;
            const erEmoji = dagBilde && !dagBilde.startsWith("data:");
            return (
              <div key={d} style={dagStil(dagFarger[d])}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,gap:8}}>
                  <div style={{fontWeight:800,color:dagFarger[d],fontSize:14}}>{dagN}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {dagBilde ? (
                      <>
                        {erEmoji ? (
                          <span style={{fontSize:22,lineHeight:1}}>{dagBilde}</span>
                        ) : (
                          <img src={dagBilde} alt="" style={{width:34,height:34,borderRadius:6,objectFit:"cover",border:"1px solid #d8e6f5"}}/>
                        )}
                        <button type="button" onClick={()=>oppdaterDag(d,"bilde","")} title="Fjern bilde"
                          style={{background:"#fdecea",color:"#c62828",border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:13,padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                      </>
                    ) : (
                      <button type="button" onClick={()=>setBildevelgerForDag(d)} title="Legg til bilde eller emoji"
                        style={{background:"#e8eff8",color:dagFarger[d],border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>📷 Legg til bilde</button>
                    )}
                  </div>
                </div>
                <label style={{...labelStil,fontSize:10}}>Formiddag</label>
                <textarea value={u_dager[d].formiddag} onChange={e=>oppdaterDag(d,"formiddag",e.target.value)} rows={2} style={{...iS,marginBottom:7,minHeight:50,resize:"vertical"}} placeholder="F.eks. 9:00 Samling, 9:30 utelek..."/>
                <label style={{...labelStil,fontSize:10}}>Ettermiddag</label>
                <textarea value={u_dager[d].ettermiddag} onChange={e=>oppdaterDag(d,"ettermiddag",e.target.value)} rows={2} style={{...iS,marginBottom:7,minHeight:50,resize:"vertical"}} placeholder="F.eks. 12:30 lunsj, 13:00 hvile..."/>
                <label style={{...labelStil,fontSize:10}}>Notat (valgfritt)</label>
                <textarea value={u_dager[d].notat} onChange={e=>oppdaterDag(d,"notat",e.target.value)} rows={1} style={{...iS,marginBottom:0,minHeight:36,resize:"vertical"}} placeholder="Møtedag, varm mat, etc."/>
              </div>
            );
          })}

          {/* BILDEVELGER-MODAL */}
          {bildevelgerForDag && (
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBildevelgerForDag(null)}>
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
      const dagFarger = { mandag:"#2c5b8e", tirsdag:"#1565c0", onsdag:"#6a1b9a", torsdag:"#c62828", fredag:"#2d6a4f" };
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{background:C.w,borderRadius:14,padding:16,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:6}}>📅 {valgt.tittel}</div>
            <div style={{fontSize:12,color:C.gr,marginBottom:0}}>
              {valgt.uke && <span style={{marginRight:10}}>Uke {valgt.uke}</span>}
              {valgt.tema && <span><strong>Tema:</strong> {valgt.tema}</span>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
            <button onClick={()=>skrivUt(valgt)} style={{background:"#2c5b8e",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button onClick={()=>lastNed(valgt)} style={{background:"#1565c0",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>💾 Last ned</button>
            <button onClick={()=>kopier(valgt)} style={{background:C.mint,color:C.g,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📋 Kopier tekst</button>
            <button onClick={()=>redigerPlan(valgt)} style={{background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
          </div>

          {["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
            const data = valgt.dager?.[d] || {};
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagErTom = !data.formiddag && !data.ettermiddag && !data.notat && !data.bilde;
            const erEmoji = data.bilde && !data.bilde.startsWith("data:");
            return (
              <div key={d} style={dagStil(dagFarger[d])}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{fontWeight:800,color:dagFarger[d],fontSize:14,flex:1}}>{dagN}</div>
                  {data.bilde && (erEmoji
                    ? <span style={{fontSize:24,lineHeight:1}}>{data.bilde}</span>
                    : <img src={data.bilde} alt="" style={{width:44,height:44,borderRadius:7,objectFit:"cover",border:"1px solid #d8e6f5"}}/>
                  )}
                </div>
                {dagErTom ? (
                  <div style={{fontSize:12,color:C.gr,fontStyle:"italic"}}>– ingen plan –</div>
                ) : (
                  <>
                    {data.formiddag && <div style={{marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:800,color:C.gr,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>Formiddag</div>
                      <div style={{fontSize:13,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.5}}>{data.formiddag}</div>
                    </div>}
                    {data.ettermiddag && <div style={{marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:800,color:C.gr,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>Ettermiddag</div>
                      <div style={{fontSize:13,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.5}}>{data.ettermiddag}</div>
                    </div>}
                    {data.notat && <div>
                      <div style={{fontSize:10,fontWeight:800,color:C.gr,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>Notat</div>
                      <div style={{fontSize:12,color:C.gr,whiteSpace:"pre-wrap",lineHeight:1.5,fontStyle:"italic"}}>{data.notat}</div>
                    </div>}
                  </>
                )}
              </div>
            );
          })}

          <button onClick={()=>slettPlan(valgt.id)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",width:"100%",marginTop:8}}>🗑 Slett ukeplan</button>
          <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}{valgt.oppdatert!==valgt.opprettet && " • Sist endret: "+new Date(valgt.oppdatert).toLocaleDateString("no-NO")}</div>
        </div>
      );
    }

    // VISNING: Liste (default)
    return (
      <div className="fade">
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

        <div style={{background:"#fff8e1",borderRadius:10,padding:"11px 13px",fontSize:11,color:"#795548",borderLeft:"3px solid #f4a261",marginTop:14,lineHeight:1.6}}>
          <strong>⚠️ Backup:</strong> Ukeplaner lagres lokalt på denne enheten. Bruk "💾 Last ned"-knappen for backup.
        </div>
      </div>
    );
  };

  // ─── ArsplanSide – avansert årsplanbygger med AI-assistanse ───
  const ArsplanSide = () => {
    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [lagrer, setLagrer] = useState(false);
    const [planFeil, setPlanFeil] = useState("");
    const [ap, setAp] = useState(null); // plan under redigering

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
    ];

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
      if (ok) { vis("✅ Årsplan lagret"); setVisning("liste"); }
    };

    const lagreEndring = async () => {
      if (!ap?.tittel?.trim()) { setPlanFeil("Skriv en tittel for årsplanen"); return; }
      setLagrer(true);
      const oppdatert = planer.map(p => p.id === ap.id ? { ...ap, oppdatert: new Date().toISOString() } : p);
      const ok = await lagreListe(oppdatert);
      setLagrer(false);
      if (ok) { vis("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettPlan = async (id) => {
      const ny = planer.filter(p => p.id !== id);
      const ok = await lagreListe(ny);
      if (ok) { vis("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    // ── AI-hjelper (gjenbruker samme mønster som AiSideComp) ──
    const kallAI = async (prompt, onResultat) => {
      const AI_ENDPOINT = (typeof window !== "undefined" && window.__BH_AI_ENDPOINT) || "https://api.anthropic.com/v1/messages";
      const BRUK_BACKEND = AI_ENDPOINT !== "https://api.anthropic.com/v1/messages";
      const body = BRUK_BACKEND
        ? { prompt }
        : { model:"claude-sonnet-4-20250514", max_tokens:1200, messages:[{ role:"user", content:prompt }] };
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 30000);
      try {
        const r = await fetch(AI_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), signal:controller.signal });
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
      const ctx = `Barnehage: "${plan?.barnehage||"ikke oppgitt"}". Avdeling: "${plan?.avdeling||"ikke oppgitt"}". Alder: "${plan?.alder||"ikke oppgitt"}". Barnehageår: ${plan?.aar||"2025/2026"}.`;
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
        if (tekst) { setAiTekst(tekst); vis("✨ AI-forslag klart"); }
        else { setAiAktiv(null); vis("ℹ️ AI utilgjengelig – skriv selv"); }
      });
    };

    const utforArshjulAI = async (maaned) => {
      const sesId = "arshjul_" + maaned;
      setAiAktiv({ seksjonId: sesId, handling:"maaned" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".`;
      const sesong = { august:"sommer/høst", september:"tidlig høst", oktober:"midthøst", november:"senhøst", desember:"vinter/jul", januar:"vinter", februar:"vinter/karneval", mars:"vinter/vår", april:"vår/påske", mai:"vår/17. mai", juni:"sommer" };
      const m = MANEDER.find(x => x.id === maaned);
      const prompt = `Du er en erfaren norsk barnehagelærer. Svar kun med JSON – ingen annen tekst, ingen markdown.\nLag et pedagogisk forslag for ${m?.navn} (årstid: ${sesong[maaned]||maaned}) for en norsk barnehage.\nKontekst: ${ctx}\nFormat: {"tema":"...","aktiviteter":"...","notat":"..."}\n- tema: ett inspirerende månedstema (maks 6 ord)\n- aktiviteter: 3–4 konkrete aktiviteter koblet til Rammeplanen (2–3 linjer)\n- notat: 1–2 pedagogiske merknader til personalet`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const d = JSON.parse(tekst.replace(/```json|```/g, "").trim());
            if (d.tema || d.aktiviteter) {
              oppdaterArshjul(maaned, "tema", d.tema||"");
              oppdaterArshjul(maaned, "aktiviteter", d.aktiviteter||"");
              oppdaterArshjul(maaned, "notat", d.notat||"");
              vis("✨ Forslag lagt inn for " + m?.navn);
            } else { vis("ℹ️ AI ga uventet format"); }
          } catch { vis("ℹ️ AI utilgjengelig"); }
        } else { vis("ℹ️ AI utilgjengelig"); }
      });
    };

    const utforKomplettArshjul = async () => {
      setAiAktiv({ seksjonId:"arshjul_alle", handling:"alle" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".`;
      const prompt = `Du er en erfaren norsk barnehagelærer med dyp kjennskap til Rammeplan for barnehagen (2017). Svar kun med JSON – ingen annen tekst.\nLag et komplett årshjul for barnehageåret august–juni. Kontekst: ${ctx}\nFormat:\n{"august":{"tema":"...","aktiviteter":"...","notat":"..."},"september":{"tema":"...","aktiviteter":"...","notat":"..."},"oktober":{"tema":"...","aktiviteter":"...","notat":"..."},"november":{"tema":"...","aktiviteter":"...","notat":"..."},"desember":{"tema":"...","aktiviteter":"...","notat":"..."},"januar":{"tema":"...","aktiviteter":"...","notat":"..."},"februar":{"tema":"...","aktiviteter":"...","notat":"..."},"mars":{"tema":"...","aktiviteter":"...","notat":"..."},"april":{"tema":"...","aktiviteter":"...","notat":"..."},"mai":{"tema":"...","aktiviteter":"...","notat":"..."},"juni":{"tema":"...","aktiviteter":"...","notat":"..."}}\nTema skal reflektere årstid og pedagogiske prioriteter. Aktiviteter skal knyttes til rammeplanen.`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const d = JSON.parse(tekst.replace(/```json|```/g, "").trim());
            setAp(prev => {
              const nyArshjul = { ...prev.arshjul };
              MANEDER.forEach(m => {
                if (d[m.id]) nyArshjul[m.id] = { tema:d[m.id].tema||"", aktiviteter:d[m.id].aktiviteter||"", notat:d[m.id].notat||"" };
              });
              return { ...prev, arshjul: nyArshjul };
            });
            vis("✨ Komplett årshjul generert!");
          } catch { vis("ℹ️ AI utilgjengelig"); }
        } else { vis("ℹ️ AI utilgjengelig"); }
      });
    };

    const aksepterForslag = (seksjonId) => { oppdaterSeksjon(seksjonId, aiTekst); setAiTekst(""); setAiAktiv(null); vis("✅ Forslag lagt inn"); };
    const avvisForslag = () => { setAiTekst(""); setAiAktiv(null); };

    // Definert utenfor if-blokken så React ikke remounter den ved hvert render
    const AIKnapper = ({ seksjonId }) => {
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
            <div className="fade" style={{background:"#f0f7ff",border:"2px solid #2c5b8e",borderRadius:10,padding:12,marginTop:10}}>
              <div style={{fontSize:11,fontWeight:800,color:C.g,marginBottom:6}}>✨ AI-forslag – klikk "Bruk" for å legge inn i seksjonen:</div>
              <div style={{fontSize:12,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.6,marginBottom:8,maxHeight:220,overflowY:"auto"}}>{aiTekst}</div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={() => aksepterForslag(seksjonId)} style={{background:"#2c5b8e",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✅ Bruk forslaget</button>
                <button onClick={avvisForslag} style={{background:"transparent",color:C.gr,border:"1px solid #d8e6f5",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avvis</button>
              </div>
            </div>
          )}
        </div>
      );
    };

    const iS = { width:"100%", border:"1.5px solid #d8e6f5", borderRadius:10, padding:"11px 13px", fontSize:13, background:"#f5f9fd", color:C.t, fontFamily:"'Nunito',sans-serif", boxSizing:"border-box", outline:"none", resize:"vertical" };
    const labelStil = { display:"block", fontWeight:700, color:C.t, fontSize:12, marginBottom:5 };

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // ── REDIGERING / NY ──────────────────────────────────────────
    if ((visning === "ny" || visning === "rediger") && ap) {
      const erRediger = visning === "rediger";

      return (
        <div className="fade">
          <button onClick={() => setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>{erRediger ? "✏️ Rediger årsplan" : "📆 Ny årsplan"}</div>
          <p style={{color:C.gr,fontSize:12,marginBottom:14,lineHeight:1.5}}>Fyll ut seksjonene og bruk AI-knappene for hjelp. Du bestemmer alltid innholdet.</p>

          {planFeil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {planFeil}</div>}

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
              <AIKnapper seksjonId={s.id} />
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

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <button onClick={() => redigerPlan(valgt)} style={{background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
            <button onClick={() => slettPlan(valgt.id)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
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

        <div style={{background:"#fff8e1",borderRadius:10,padding:"11px 13px",fontSize:11,color:"#795548",borderLeft:"3px solid #f4a261",marginTop:14,lineHeight:1.6}}>
          <strong>⚠️ Backup:</strong> Årsplaner lagres kun lokalt på denne enheten. Kopier viktig innhold til et eksternt dokument jevnlig.
        </div>
      </div>
    );
  };

  // ─── DokumentasjonSide – praksisfortellinger og refleksjoner ───
  const DokumentasjonSide = ()=>{
    const [dok, setDok] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [filterFag, setFilterFag] = useState("alle");

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
    const [skannFremgang, setSkannFremgang] = useState(0);
    const skannRef = useRef(null);

    const kjorOCR = async (fil) => {
      if (!fil) return;
      setSkannLoading(true); setSkannFremgang(0);
      try {
        // Last bildet inn i canvas og forbedre for OCR
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.onerror = rej;
          reader.readAsDataURL(fil);
        });
        const cv = await new Promise(res => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1800;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            res(c);
          };
          img.src = dataUrl;
        });
        // Adaptiv terskling (Bradley-metode) for bedre OCR
        const ctx = cv.getContext("2d");
        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const d = imgData.data, W = cv.width, H = cv.height;
        const gray = new Uint8Array(W * H);
        for (let i = 0; i < d.length; i += 4)
          gray[i >> 2] = Math.round(0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]);
        const bR = Math.max(15, Math.round(Math.min(W, H) / 40));
        const stride = W + 1;
        const integ = new Float64Array(stride * (H + 1));
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++)
            integ[(y+1)*stride+(x+1)] = gray[y*W+x] + integ[y*stride+(x+1)] + integ[(y+1)*stride+x] - integ[y*stride+x];
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const x1=Math.max(0,x-bR), y1=Math.max(0,y-bR), x2=Math.min(W-1,x+bR), y2=Math.min(H-1,y+bR);
            const cnt=(x2-x1)*(y2-y1);
            const sum=integ[(y2+1)*stride+(x2+1)]-integ[y1*stride+(x2+1)]-integ[(y2+1)*stride+x1]+integ[y1*stride+x1];
            const px = gray[y*W+x] < (sum/cnt)*0.85 ? 0 : 255;
            const i=(y*W+x)*4; d[i]=d[i+1]=d[i+2]=px; d[i+3]=255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        // Kjør Tesseract OCR
        const { recognize } = await import("tesseract.js");
        const { data: { text } } = await recognize(cv, "nor+eng", {
          logger: m => { if (m.status === "recognizing text") setSkannFremgang(Math.round(m.progress * 100)); }
        });
        const lest = text.trim();
        if (lest) {
          setDFortelling(prev => prev ? prev + "\n\n" + lest : lest);
          vis("✅ Tekst lest fra bilde – sjekk og rediger ved behov");
        } else {
          vis("ℹ️ Ingen lesbar tekst funnet – prøv med bedre belysning");
        }
      } catch (e) {
        console.warn("[OCR]", e);
        vis("❌ Skanning feilet – prøv igjen");
      } finally {
        setSkannLoading(false); setSkannFremgang(0);
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
        const escapeHTML = (s) => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
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
        vis("✅ Eksportert");
      } catch (e) {
        console.error("[Dokumentasjon] eksport:", e);
        vis("❌ Eksport feilet");
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
          vis("✅ Dokument skannet og lagt til i dokumentasjon");
        }}/>
      </div>
    );

    // VISNING: Ny / Rediger
    if (visning === "ny" || visning === "rediger") {
      const erRediger = visning === "rediger";
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger dokumentasjon":"📝 Ny dokumentasjon"}</div>

          {d_feil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {d_feil}</div>}

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
                {skannLoading ? `⏳ ${skannFremgang}%` : "📷 Skann tekst"}
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
          <button onClick={()=>setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{background:C.w,borderRadius:14,padding:20,boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:6}}>{valgt.tittel}</div>
            <div style={{fontSize:12,color:C.gr,marginBottom:14,display:"flex",flexWrap:"wrap",gap:10}}>
              <span>📅 {new Date(valgt.dato).toLocaleDateString("no-NO",{day:"numeric",month:"long",year:"numeric"})}</span>
              {valgt.fag?.length>0 && (
                <span style={{display:"flex",gap:5,flexWrap:"wrap"}}>{valgt.fag.map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span key={fid} style={{background:f.lys,color:f.farge,padding:"1px 8px",borderRadius:7,fontSize:10,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}</span>
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

            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:6}}>
              <button onClick={()=>redigerDokument(valgt)} style={{background:"#2c5b8e",color:"#fff",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
              <button onClick={()=>slettDokument(valgt.id)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
            </div>
            <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}{valgt.oppdatert!==valgt.opprettet && " • Sist endret: "+new Date(valgt.oppdatert).toLocaleDateString("no-NO")}</div>
          </div>
        </div>
      );
    }

    // VISNING: Liste (default)
    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📔 Dokumentasjon</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Praksisfortellinger og refleksjoner – knyttet til rammeplanen</p>

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
                    {d.fag.slice(0,3).map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span key={fid} style={{background:f.lys,color:f.farge,padding:"1px 7px",borderRadius:6,fontSize:9,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}
                    {d.fag.length>3 && <span style={{fontSize:10,color:C.gr}}>+{d.fag.length-3} til</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{background:"#fff8e1",borderRadius:10,padding:"11px 13px",fontSize:11,color:"#795548",borderLeft:"3px solid #f4a261",marginTop:14,lineHeight:1.6}}>
          <strong>⚠️ Backup:</strong> Dokumentasjon lagres kun lokalt på denne enheten. Bruk "💾 Eksporter alle"-knappen jevnlig for å lage backup. Hvis du tømmer nettleserdata mister du alt.
        </div>
      </div>
    );
  };

  const ProfilSide = ()=>{
    const [seksjon, setSeksjon] = useState("oversikt"); // oversikt | navn | brukernavn | epost | passord | avatar
    const [pf_loading, setPfLoading] = useState(false);
    const [pf_feil, setPfFeil] = useState("");
    const [pf_suksess, setPfSuksess] = useState("");

    // Visningsnavn
    const [v_navn, setVNavn] = useState(aktivBruker?.visningsnavn || "");

    // Brukernavn
    const [nb_nytt, setNbNytt] = useState("");
    const [nb_pw, setNbPw] = useState("");

    // E-post
    const [ne_nytt, setNeNytt] = useState("");
    const [ne_pw, setNePw] = useState("");

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
      onUserUpdate(r.bruker);
      setNeNytt("");
      visBekreftelse("✅ E-post sendt – sjekk innboksen for bekreftelse!");
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

    // Avatar-display-helper: viser bilde hvis sett, ellers emoji, alltid sentrert i sirkel uten å strekkes
    const AvatarDisplay = ({ src, emoji, size, bg = "rgba(255,255,255,0.18)" }) => (
      <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:src?"#e8eff8":bg,lineHeight:1,position:"relative"}}>
        {src ? (
          <img src={src} alt="Profilbilde" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
        ) : (
          <span style={{fontSize:Math.floor(size*0.55)}}>{emoji || "👤"}</span>
        )}
      </div>
    );

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
            <p style={{fontSize:12,color:C.gr,marginBottom:14,lineHeight:1.6}}>Valgfritt. Lagres kun lokalt på enheten din. Krever ikke passord å endre.</p>
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
              <button type="button" onClick={()=>setPwVis(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:C.gr,fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>{pw_vis?"Skjul":"Vis"}</button>
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
  };

  // ─── FavoritterSide – samler alle favoritter på tvers av typer ───
  const FavoritterSide = ()=>{
    const favSanger = SANGER.filter(s=>favoritter.sanger?.includes(s.id));
    const favAktiv = AKTIVITETER.filter(a=>favoritter.aktiviteter?.includes(a.id));
    const favTegn = TEGNEARK.filter(t=>favoritter.tegneark?.includes(t.id));
    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>⭐ Mine favoritter</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Alle elementer du har stjernemerket – {favTotal} totalt</p>
        {favTotal===0 && (
          <div style={{background:C.w,borderRadius:14,padding:30,textAlign:"center",boxShadow:"0 2px 10px rgba(44,91,142,0.08)"}}>
            <div style={{fontSize:46,marginBottom:10}}>☆</div>
            <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen favoritter ennå</div>
            <div style={{fontSize:12,color:C.gr,lineHeight:1.6}}>Trykk på ⭐-ikonet ved siden av en sang, aktivitet eller tegneark for å lagre den her. Da slipper du å lete etter dem igjen.</div>
          </div>
        )}
        {favSanger.length>0 && (
          <div style={{marginBottom:18}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:9,display:"flex",alignItems:"center",gap:6}}>🎵 Sanger og rim <span style={{background:C.mint,color:C.g,borderRadius:9,padding:"1px 8px",fontSize:11}}>{favSanger.length}</span></div>
            <div style={{display:"grid",gap:8}}>
              {favSanger.map(s=>(
                <div key={s.id} className="hover" onClick={()=>navigerTil("sanger")} style={{background:C.w,borderRadius:11,padding:"11px 13px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:13}}>{s.tittel}</div>
                    <div style={{fontSize:10,color:C.gr,marginTop:2}}>{s.kategori} • 👶 {s.alder}</div>
                  </div>
                  <button className="fav-btn aktiv" onClick={(e)=>{e.stopPropagation();toggleFav("sanger",s.id);}} aria-label="Fjern favoritt">⭐</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {favAktiv.length>0 && (
          <div style={{marginBottom:18}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:9,display:"flex",alignItems:"center",gap:6}}>🏃 Aktiviteter <span style={{background:C.mint,color:C.g,borderRadius:9,padding:"1px 8px",fontSize:11}}>{favAktiv.length}</span></div>
            <div style={{display:"grid",gap:8}}>
              {favAktiv.map(a=>(
                <div key={a.id} className="hover" onClick={()=>{setPreselectAktiv(a.id);navigerTil("aktiviteter");}} style={{background:C.w,borderRadius:11,padding:"11px 13px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:13}}>{a.tittel}</div>
                    <div style={{fontSize:10,color:C.gr,marginTop:2}}>{a.kategori} • 👶 {a.alder}</div>
                  </div>
                  <button className="fav-btn aktiv" onClick={(e)=>{e.stopPropagation();toggleFav("aktiviteter",a.id);}} aria-label="Fjern favoritt">⭐</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {favTegn.length>0 && (
          <div style={{marginBottom:18}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.t,marginBottom:9,display:"flex",alignItems:"center",gap:6}}>🖍️ Tegneark <span style={{background:C.mint,color:C.g,borderRadius:9,padding:"1px 8px",fontSize:11}}>{favTegn.length}</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {favTegn.map(t=>(
                <div key={t.id} className="hover" onClick={()=>navigerTil("tegneark")} style={{background:C.w,borderRadius:11,padding:"11px 9px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",textAlign:"center",position:"relative"}}>
                  <button className="fav-btn aktiv" onClick={(e)=>{e.stopPropagation();toggleFav("tegneark",t.id);}} style={{position:"absolute",top:4,right:4,fontSize:15}} aria-label="Fjern favoritt">⭐</button>
                  <div style={{maxWidth:90,margin:"0 auto",pointerEvents:"none"}}>{t.svg}</div>
                  <div style={{fontWeight:800,color:C.t,fontSize:11,marginTop:4}}>{t.ikon} {t.tittel}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Lagre AI-generert innhold som skjema og navigere dit
  const lagreAISomSkjema = (skjemaData) => {
    const nytt = { ...skjemaData, id: Date.now() };
    setSkjemaer(p => [nytt, ...p]);
    vis("✅ Lagret i 'Mine skjemaer'");
    setTimeout(() => navigerTil("skjemaer"), 800);
  };

  // Hurtigvalg fra Hjem: send type-id, AiSideComp picker det opp via useEffect
  const [aiInitialType, setAiInitialType] = useState(null);
  const aapneAImedType = (typeId) => {
    setAiInitialType(typeId);
    navigerTil("ai");
  };

  const sider={hjem:Hjem(),skjemaer:<MineSkjemaer/>,rammeplan:<RammeplanSide/>,tegneark:<TegnearkSide/>,ai:<AiSideComp onLagreSomSkjema={lagreAISomSkjema} initialType={aiInitialType} clearInitialType={()=>setAiInitialType(null)}/>,admin:<AdminPanel aktivBruker={aktivBruker}/>,favoritter:<FavoritterSide/>,profil:<ProfilSide/>,support:<SupportSide/>,dokumentasjon:<DokumentasjonSide/>,ukeplan:<UkeplanSide/>,arsplan:<ArsplanSide/>,boker:<BokerSide aktivBruker={aktivBruker}/>};

  return (
    <>
      <style>{CSS}</style>
      <div className="bh-layout">
        {/* Mobil-header med hamburger */}
        <div className="bh-mobile-header">
          <button className="bh-hamburger" onClick={()=>setSidebarOpen(true)} aria-label="Åpne meny">☰</button>
          <div className="bh-mobile-title">🌿 Barnehagehjelpen</div>
        </div>
        {/* Backdrop på mobil når sidebar er åpen */}
        <div className={`bh-backdrop ${sidebarOpen?"show":""}`} onClick={()=>setSidebarOpen(false)}/>
        {/* Sidebar */}
        <div className={`bh-sidebar ${sidebarOpen?"open":""}`}>
          <div style={{padding:"22px 16px 16px",borderBottom:"1px solid rgba(255,255,255,0.12)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:"#fff",lineHeight:1.2}}>🌿 Barnehage</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:"rgba(255,255,255,0.85)",lineHeight:1.2}}>hjelpen</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:3}}>Rammeplan 2017 integrert</div>
            </div>
            <button onClick={()=>setSidebarOpen(false)} aria-label="Lukk meny" style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:18,display:"none",alignItems:"center",justifyContent:"center"}} className="bh-sidebar-close">✕</button>
          </div>
          <nav style={{flex:1,padding:"10px 9px"}}>
            {nav.map(item=>(
              <button key={item.id} className={`nb ${side===item.id?"on":""}`} onClick={()=>navigerTil(item.id)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",marginBottom:2,background:side===item.id?"rgba(255,255,255,0.2)":"transparent",borderRadius:8,color:"#fff",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16}}>{item.i}</span>
                <span style={{fontWeight:side===item.id?800:600}}>{item.n}</span>
                {item.badge>0&&<span style={{marginLeft:"auto",background:"#6ba0d9",borderRadius:9,padding:"1px 7px",fontSize:10}}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{padding:"0 12px 14px"}}>
            <div onClick={()=>navigerTil("profil")} style={{background:"rgba(255,255,255,0.14)",borderRadius:10,padding:"10px 11px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}} title="Gå til profil">
              <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",background:aktivBruker?.profilbilde?"transparent":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>
                {aktivBruker?.profilbilde ? (
                  <img src={aktivBruker.profilbilde} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                ) : (
                  <span style={{fontSize:22}}>{aktivBruker?.avatar||"👤"}</span>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:"#fff",fontWeight:800,lineHeight:1.2,wordBreak:"break-word"}}>{aktivBruker?.visningsnavn||aktivBruker?.brukernavn||"Bruker"}{aktivBruker?.admin&&<span style={{background:"#fff9c4",color:"#795548",borderRadius:7,padding:"1px 5px",fontSize:8,marginLeft:4,fontWeight:800,verticalAlign:"middle"}}>👑</span>}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.65)",marginTop:1,wordBreak:"break-word"}}>@{aktivBruker?.brukernavn}</div>
              </div>
            </div>
            <a
              href={supportMailto()}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"9px 11px",borderRadius:9,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'Nunito',sans-serif",marginBottom:7,boxSizing:"border-box"}}>
              📧 Kontakt support
            </a>
            <button onClick={onLogout} style={{width:"100%",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"9px 11px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              🔓 Logg ut
            </button>
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:9,padding:"9px 11px",fontSize:10,color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginTop:10}}>Alt innhold er koblet til Rammeplan for barnehagen 2017</div>
          </div>
        </div>
        <main className="bh-main">
          {feedback && <div className="fade" style={{position:"fixed",top:70,right:20,zIndex:200,background:C.g,color:"#fff",borderRadius:9,padding:"10px 16px",fontWeight:700,fontSize:13,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{feedback}</div>}
          {side==="sanger" ? <SangerSideComp favoritter={favoritter} toggleFav={toggleFav}/>
           : side==="aktiviteter" ? <AktivSideComp preselectId={preselectAktiv} clearPreselect={()=>setPreselectAktiv(null)} favoritter={favoritter} toggleFav={toggleFav}/>
           : side==="skjema-ny" ? <NyttSkjemaForm onSave={s=>setSkjemaer(p=>[s,...p])} onNavigate={setSide}/>
           : (sider[side]||Hjem())
          }
        </main>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
//  APP WRAPPER – auth-gate som velger mellom innlogging og hovedappen
// ═══════════════════════════════════════════
export default function App() {
  const [aktivBruker, setAktivBruker] = useState(null);
  const [laster, setLaster] = useState(true);
  const [visInnlogging, setVisInnlogging] = useState(false);

  useEffect(() => {
    // Fallback: hvis onAuthStateChange henger, avslutt lasting etter 5s
    const fallback = setTimeout(() => setLaster(false), 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") {
        try {
          if (session?.user) {
            const profil = await hentProfil(session.user.id);
            setAktivBruker(byggBruker(session.user, profil));
          }
        } catch (_) {}
        clearTimeout(fallback);
        setLaster(false);
      } else if (session?.user) {
        try {
          const profil = await hentProfil(session.user.id);
          setAktivBruker(byggBruker(session.user, profil));
        } catch (_) {}
      } else {
        setAktivBruker(null);
      }
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await slettSesjon();
    setAktivBruker(null);
    setVisInnlogging(false);
  };

  const handleUserUpdate = (oppdatertBruker) => {
    setAktivBruker(oppdatertBruker);
  };

  if (laster) {
    return <Velkomst onStart={() => {}} sjekkSesjon={true}/>;
  }

  if (!aktivBruker && !visInnlogging) {
    return <Velkomst onStart={() => setVisInnlogging(true)} sjekkSesjon={false}/>;
  }

  if (!aktivBruker) {
    return <AuthScreen onLoginSuccess={setAktivBruker}/>;
  }

  return <Barnehagehjelpen aktivBruker={aktivBruker} onLogout={handleLogout} onUserUpdate={handleUserUpdate} storageInfo={storageStatus}/>;
}

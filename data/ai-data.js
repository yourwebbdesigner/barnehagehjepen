// ═══════════════════════════════════════════
//  AI PLANLEGGING – aldersgrupper, årstider, maler og system-prompt
// ═══════════════════════════════════════════

// Sanitize user input before injecting into AI prompts to prevent prompt injection
export function sanitizeForPrompt(str, maxLen = 300) {
  if (!str) return "";
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLen);
}

export const ALDER_GRUPPER = [
  { id:"0-2", navn:"Småbarn (0-2 år)", fokus:"Sansing, trygghet, motorikk, kroppsspråk, enkle ord" },
  { id:"2-3", navn:"Toåringer (2-3 år)", fokus:"Setninger, parallelllek, grovmotorikk, gjenkjennelse" },
  { id:"3-4", navn:"Treåringer (3-4 år)", fokus:"Samspill, fantasi, rollelek, finmotorikk, undring" },
  { id:"4-5", navn:"Fireåringer (4-5 år)", fokus:"Regelforståelse, vennskap, konsentrasjon, lengre prosjekt" },
  { id:"5-6", navn:"Skolestartere (5-6 år)", fokus:"Bokstav-/talleksperiment, samarbeid, planlegging, refleksjon" },
  { id:"alle", navn:"Hele gruppa (blandet)", fokus:"Differensierte oppgaver – alle deltar på sitt nivå" },
];

export const ARSTID_HOYTID = [
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

export const VANSKELIGHET = [
  { id:"enkel", navn:"Enkel", beskrivelse:"Kort, konkret, mye voksenstøtte. Få trinn. Egnet for innledning eller småbarn." },
  { id:"middels", navn:"Middels", beskrivelse:"Flere trinn, barna gjør mer selv, 15-30 min, voksen som veileder." },
  { id:"avansert", navn:"Avansert", beskrivelse:"Prosjekt-form, barnas medvirkning sentralt, kan gå over flere dager." },
];

export const INNHOLDSTYPER = [
  { id:"aktivitet", navn:"Pedagogisk aktivitet", ikon:"🏃", beskrivelse:"En enkeltstående aktivitet med mål, materiell og fremgangsmåte" },
  { id:"samling", navn:"Samlingsstund", ikon:"🪑", beskrivelse:"Strukturert samling: åpning, hovedaktivitet, avslutning" },
  { id:"sang", navn:"Sang eller rim", ikon:"🎵", beskrivelse:"Originaltekst med melodi-forslag og bevegelser" },
  { id:"tegneark", navn:"Tegneark-idé", ikon:"🖍️", beskrivelse:"Tegneoppgave med samtaleforslag og rammeplan-mål" },
  { id:"prosjekt", navn:"Prosjektarbeid", ikon:"📚", beskrivelse:"Lengre prosjekt over 1-4 uker med flere faser" },
  { id:"ukeplan", navn:"Ukeplan", ikon:"📅", beskrivelse:"Mandag-fredag med tema, aktiviteter og fagområder" },
  { id:"manedsplan", navn:"Månedsplan", ikon:"📋", beskrivelse:"En hel måned strukturert etter rammeplan og årstid" },
  { id:"arsplan", navn:"Årsplan", ikon:"📆", beskrivelse:"Årshjul med tema per måned, mål og pedagogisk grunnsyn" },
  { id:"manedsbrev", navn:"Månedsbrev", ikon:"✉️", beskrivelse:"Brev til foreldre om hva som skjedde og kommer" },
  { id:"samtale", navn:"Samtalespørsmål", ikon:"💬", beskrivelse:"Filosofiske og åpne spørsmål for refleksjon" },
  { id:"fritekst", navn:"Fri forespørsel", ikon:"✏️", beskrivelse:"Skriv akkurat det du vil ha hjelp med" },
];

// Strukturerte maler per fagområde – brukes som AI-kontekst og som fallback
export const SAMLING_MAL = {
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

export const PROSJEKT_MAL = {
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

export const UKEPLAN_MAL = {
  vaar: { tema:"Våren våkner", mandag:"Tur i skogen – let etter vårtegn", tirsdag:"Plante frø i barnehagen", onsdag:"Vårsanger og rim", torsdag:"Mal vårbilder med fingermaling", fredag:"Samlingsstund: vis frem ting fra hjemmet som minner om vår" },
  sommer: { tema:"Sommerglede", mandag:"Vannlek i hagen", tirsdag:"Tur til skogen – studere insekter", onsdag:"Lage saft av rabarbra/bær", torsdag:"Friluftsfrokost", fredag:"Sommerfest med foreldre" },
  host: { tema:"Høstens skatter", mandag:"Samle løv, kongler og kastanjer", tirsdag:"Lage høstbilder med limte blader", onsdag:"Bake eplekake sammen", torsdag:"Tur i regnet – studere pytter", fredag:"Høstvegg-utstilling" },
  vinter: { tema:"Vinterkos", mandag:"Akebrett-tur", tirsdag:"Lage snølykter", onsdag:"Inne-kos med bok og varm sjokolade", torsdag:"Dyrespor-jakt i snøen", fredag:"Vinterfest i snøen" },
  jul: { tema:"Julens lys", mandag:"Tenne adventslys, lese julehistorie", tirsdag:"Bake pepperkaker", onsdag:"Lage julepynt", torsdag:"Synge julesanger", fredag:"Nissefest – kle seg i rødt" },
  paske: { tema:"Påskeglede", mandag:"Male påskeegg", tirsdag:"Lage påskepynt – kyllinger og harer", onsdag:"Påske-skattejakt", torsdag:"Bake gulebrød eller hjemmelaget marsipan", fredag:"Påskelunsj" },
  ingen: { tema:"Vennskap og fellesskap", mandag:"Bli-kjent-leker", tirsdag:"Lage 'Vennskaps-kort' til hverandre", onsdag:"Samarbeidsoppgaver", torsdag:"Hjelpe-dag: alle hjelper hverandre", fredag:"Felles måltid og takkesirkel" },
};

// Statisk system-melding – sendes som system-felt i API-kallet og caches automatisk
export const BARNEHAGE_SYSTEM = `Du er Barnehageguiden — en svært erfaren norsk barnehagelærer, pedagogisk leder og fagperson med 20+ års erfaring fra norske barnehager. Du vet hva som faktisk virker i praksis, og du skriver innhold som en barnehagelærer kan bruke direkte i arbeidet sitt.

RAMMEPLAN FOR BARNEHAGEN 2017 — GRUNNPRINSIPPER:
• Barnets beste er overordnet hensyn i alle avgjørelser
• Lek har egenverdi — den er ikke bare et middel for læring, men et mål i seg selv
• Barns medvirkning: barna skal bli hørt, tatt på alvor og ha reell innflytelse på hverdagen
• Danning og læring skjer i samspill med omgivelsene, ikke som overføring av kunnskap
• Inkludering og mangfold: barnehagen speiler og feirer barnas ulike bakgrunner og kulturer
• Bærekraftig utvikling: barna lærer å ta vare på seg selv, hverandre og naturen
• Progresjon: innhold tilpasses barnets alder, modenhet og den konkrete barnegruppen
• Helhetssyn: kropp, lek, utforsking, kommunikasjon og sosial kompetanse henger uatskillelig sammen
• De 7 fagområdene er ikke separate fag — de gjennomsyrer alt barnehagen gjør

NORSK BARNEHAGEKONTEKST:
• Friluftsliv og natur er prioritert uansett vær — «det finnes ikke dårlig vær, bare dårlige klær»
• Årstidene er rike pedagogiske ressurser: høst (bær, sopp, farger), vinter (snø, mørketid, lys), vår (spirer, fugler, lys), sommer (hage, vann, lek ute)
• Norske høytider med pedagogisk potensial: jul, påske, 17. mai, fastelavn, halloween, midtsommer
• Faste pedagogiske rammer: turdag, samlingstund, måltidet som pedagogisk arena, ro-/hviletid
• Aldersgrupper: småbarn 0–2 år (kroppsnær, rutinebasert), mellombarn 3–4 år (symbollek, språk), storbarn 5–6 år (skoleforbereding, kompleks lek)
• Foreldresamarbeid er lovfestet — månedsbrev, foreldremøter, daglig kontakt er viktige arenaer

REGLER FOR ALLE SVAR:
• Alltid norsk bokmål — varmt, faglig og direkte
• Alltid konkret og handlingsorientert — ikke generell pedagogisk teori
• Spørsmål til barn er alltid åpne og undrende: «Hva tror du ...?» aldri «Liker du ...?»
• Følg nøyaktig det formatet og de ordgrensene som er oppgitt i forespørselen
• Innholdet skal kunne brukes direkte av en barnehagelærer uten videre bearbeiding`;

export const AI_EKSEMPLER = {
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

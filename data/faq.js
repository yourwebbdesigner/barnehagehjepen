export const SUPPORT_E_POST = "Barnehagehjelpen@hotmail.com";

export function supportMailto() {
  return `mailto:${SUPPORT_E_POST}?subject=Barnehagehjelpen`;
}

export const FAQ_DATA = [
  { sp:"Hvordan lager jeg en aktivitet med AI?", svar:"Gå til 🤖 AI-assistent i menyen, velg innholdstype (f.eks. 'Pedagogisk aktivitet'), fyll inn alder, fagområde og eventuelt årstid, og trykk 'Generer'. Får du ikke svar, henter appen automatisk lignende innhold fra databasen." },
  { sp:"Hvordan deler jeg en plan med en kollega?", svar:"Gå til 👥 Samarbeid i menyen og trykk '+ Del en plan'. Velg innholdstype og hvilken plan du vil dele. Deretter åpner du planen og går til 'Tilgang'-fanen for å invitere kolleger ved å søke på navn eller skrive inn e-postadresse. Du kan gi tilgang som 'Kan redigere' eller 'Kun lese'." },
  { sp:"Kan flere redigere samme plan samtidig?", svar:"Ja. Åpner dere samme delte plan på ulike enheter, vises et 'Inne nå'-felt øverst med hvem som er aktive. Lagrer noen endringer mens du redigerer, får du et gult varsel og kan velge å hente inn den nye versjonen eller beholde dine egne endringer." },
  { sp:"Kan jeg angre endringer i en delt plan?", svar:"Ja – gå inn på den delte planen og trykk på 'Historikk'-fanen. Der ser du alle tidligere versjoner med dato og hvem som lagret. Trykk '↩️ Gjenopprett' for å rulle tilbake til en eldre versjon." },
  { sp:"Hvordan lager jeg AI-tegneark eller AI-sanger?", svar:"Gå til 🖍️ Tegneark og trykk '🤖 Lag AI-tegneark', eller gå til 🎵 Sanger og trykk '🤖 Lag AI-sang/rim'. Fyll inn tema og trykk 'Generer'. Innholdet lagres automatisk under 'Mine' og kan brukes med en gang." },
  { sp:"Hvordan endrer jeg navn på et skjema?", svar:"Gå til 📋 Mine skjemaer, åpne skjemaet og trykk '✏️ Endre navn' ved siden av tittelen. Skriv nytt navn og trykk Enter eller 'Lagre'." },
  { sp:"Hvordan skriver jeg ut et tegneark?", svar:"Åpne tegnearket og trykk 'Skriv ut'. Nettleseren åpner en utskriftsdialog. Du kan også trykke 'Last ned' for å laste det ned som HTML-fil og skrive ut fra den." },
  { sp:"Kan jeg bruke appen offline?", svar:"Statisk innhold som Aktiviteter, Sanger, Tegneark, Bøker og Rammeplan fungerer uten internett – disse er lagret lokalt i appen. Innlogging, lagring av planer, samarbeid og AI-generering krever internettilgang. Tips: last inn appen mens du har nett, så er innholdet tilgjengelig selv om nettet forsvinner." },
  { sp:"Kan jeg installere appen som en app på telefonen eller PCen?", svar:"Ja! Barnehagehjelpen er en Progressive Web App (PWA) og kan legges til på hjemskjermen akkurat som en vanlig app – uten App Store.\n\n📱 iPhone/iPad: Åpne siden i Safari → trykk del-ikonet (firkant med pil opp) → velg 'Legg til på hjemskjerm' → trykk 'Legg til'.\n\n🤖 Android: Åpne siden i Chrome → trykk de tre prikkene øverst til høyre → velg 'Legg til på startskjermen' – eller trykk på installasjonsknappen som kan dukke opp automatisk i adressefeltet.\n\n💻 PC (Chrome/Edge): Trykk på installasjonsknappen (liten ikon) i adressefeltet – appen åpner seg da i eget vindu uten nettleserkrom." },
  { sp:"Hvordan endrer jeg passord?", svar:"Gå til 👤 Min profil i menyen og trykk 'Endre passord'. Du må oppgi gjeldende passord for å sette et nytt." },
  { sp:"Hvor lagres dataene mine?", svar:"Brukerkonto, favoritter, skjemaer, planer og dokumentasjon lagres sikkert i skyen og er tilgjengelig på alle enheter når du er innlogget. Passord håndteres av Supabase Auth og lagres aldri i klartekst." },
  { sp:"Hva er forskjellen mellom Aktiviteter og Tegneark?", svar:"Aktiviteter er pedagogiske opplegg med HVA, HVORDAN og HVORFOR knyttet til rammeplanmål. Tegneark er fargeleggingsark med tegneoppgave, samtalespørsmål og rammeplankobling – beregnet for barna å bruke direkte." },
  { sp:"Hvorfor får jeg ikke AI-svar?", svar:"AI-generering krever internett. Prøv igjen om litt – får du fortsatt ikke svar vil appen automatisk hente lignende innhold fra databasen slik at du aldri står uten noe å bruke." },
  { sp:"Kan jeg slette kontoen min?", svar:"Ja – kontakt en administrator eller send oss en e-post via 'Kontakt support'-knappen nedenfor, så sletter vi kontoen din." },
];

export function hilsen() {
  const h = new Date().getHours();
  if (h < 10) return ["God morgen","☀️","Klar for en ny dag i barnehagen?"];
  if (h < 12) return ["God formiddag","🌤️","Hva skal barna oppdage i dag?"];
  if (h < 17) return ["God ettermiddag","🌈","Midttimen er full av muligheter!"];
  return ["God kveld","🌙","Planlegger du morgendagen?"];
}

export const DAGENS_TIPS = [
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

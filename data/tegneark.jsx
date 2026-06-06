// Autogenerert – ikke rediger direkte.

// ═══════════════════════════════════════════
//  SVG TEGNEARK – enkle fargerike utkaststegninger
// ═══════════════════════════════════════════
const S = { f:"white", s:"#334155", sw:3.5, sc:"round", sj:"round" };



// ── Nye unike SVGer (duplikat-erstatninger) ─────────────────────────────────





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
export const TEGNEARK = [
];
export const TEGNEKAT = [
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
  ["teknologi","Teknologi 🤖"],
  ["romfart","Romfart 🚀"],
  ["musikk","Musikk 🎵"],
  ["sport","Sport ⚽"],
  ["friluftsliv","Friluftsliv 🏕️"],
];

// (FagTag, Tilbake, NyttSkjemaForm, escapeHTML, mdToHtml, stripMd, skrivUtVindu tilhører barnehagehjelpen.jsx)
export const SvgPlaceholder = ()=>(
  <svg viewBox="0 0 300 240" fill="none">
    <rect x="12" y="12" width="276" height="216" rx="16" stroke="#c4d6ec" strokeWidth="2.5" strokeDasharray="10 5"/>
    <circle cx="90" cy="90" r="32" stroke="#d8e8f5" strokeWidth="2.5"/>
    <circle cx="98" cy="83" r="8" fill="#d8e8f5"/>
    <path d="M70 112 Q90 126 110 112" stroke="#d8e8f5" strokeWidth="2.5" fill="none"/>
    <ellipse cx="202" cy="95" rx="55" ry="40" stroke="#d8e8f5" strokeWidth="2.5"/>
    <path d="M172 82 Q202 72 232 82" stroke="#d8e8f5" strokeWidth="1.5" fill="none"/>
    <path d="M65 165 Q150 130 235 160" stroke="#d8e8f5" strokeWidth="2" fill="none" strokeDasharray="6 4"/>
    <ellipse cx="150" cy="210" rx="85" ry="15" stroke="#d8e8f5" strokeWidth="1.5"/>
  </svg>
);


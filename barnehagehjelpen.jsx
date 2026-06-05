import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import BokerSide from "./Boker.jsx";
import Velkomst from "./Velkomst.jsx";
import SamarbeidSide from "./Samarbeid.jsx";
import { supabase } from "./supabase.js";
import { FAGOMRADER, RE } from './data/rammeplan.js';
import { SANGER } from './data/sanger.js';
import { AKTIVITETER } from './data/aktiviteter.js';
import { SUPPORT_E_POST, supportMailto, FAQ_DATA } from './data/faq.js';
import { hilsen, DAGENS_TIPS } from './data/tips.js';
import RammeplanSide from './RammeplanSide.jsx';
import TegnearkSide, { hentUserTegneark } from './TegnearkSide.jsx';
import { SvgPlaceholder, TEGNEARK } from './data/tegneark.jsx';
import SangerSideComp, { hentUserSanger } from './SangerSide.jsx';
import AktivSideComp from './AktivSide.jsx';
import AiSideComp from './AiSide.jsx';
import AuthScreen, { AdminPanel } from './AuthScreen.jsx';
import AktivitetskortPanel from './KortPanel.jsx';
import { MaanedsplanSide } from './PlanSider.jsx';
import MaanedsbrevSide from './PlanSider.jsx';
import UkeplanSide from './UkeplanSide.jsx';
import MaanedskalenderSide from './MaanedskalenderSide.jsx';
import ArsplanSide from './ArsplanSide.jsx';
import DokumentasjonSide from './DokumentasjonSide.jsx';
import ProfilSide from './ProfilSide.jsx';
import Hjem, { MineSkjemaer } from './Hjem.jsx';
import { Tilbake, FagTag } from './components.jsx';
import { byggBruker, hentProfil, hentSesjon, slettSesjon, hentFavoritter, lagreFavoritter, hentMaanedsplaner, lagreMaanedsplaner, hentMaanedsbrev, lagreMaanedsbrev, hentAktivitetskort, lagreArsplaner, lagreDokumentasjon, lagreUkeplaner, lagreKalenderplaner, hentUkeplaner, hentKalenderplaner, hentArsplaner, hentDokumentasjon, hentPlanTema, lagrePlanTema } from './api.js';


const CSS = `
  /* ── TEMA-VARIABLER ─────────────────────────────────────────── */
  :root {
    --c-g: #2c5b8e; --c-lg: #3a72b0; --c-mint: #d8e6f5;
    --c-bg: #f3f7fc; --c-yl: #52b788; --c-w: #ffffff;
    --c-t: #1a2c45; --c-gr: #5d7390; --c-lg2: #e8eff8;
    --c-sidebar: linear-gradient(160deg,#1f4068,#3a72b0,#4178bd);
    --c-input-bg: #f5f9fd; --c-input-border: #d8e6f5; --c-input-t: #1a2c45;
    --c-card: #ffffff; --c-divider: #e0ecf8;
    --c-scrollbar: #c4d6ec; --c-scrollbar-hover: #a8c1de;
    --c-shimmer-1: #e8eff8; --c-shimmer-2: #f0f5fb;
    --c-spin-bg: #d8f3dc; --c-spin-fg: #2d6a4f;
  }
  [data-theme="dark"] {
    --c-g: #4a8fd4; --c-lg: #5a9de0; --c-mint: #1a3050;
    --c-bg: #0f1923; --c-yl: #52b788; --c-w: #172233;
    --c-t: #ddeaf8; --c-gr: #7a9ab8; --c-lg2: #1a2d40;
    --c-sidebar: linear-gradient(160deg,#060e18,#0d1e35,#102444);
    --c-input-bg: #1a2840; --c-input-border: #2a4060; --c-input-t: #ddeaf8;
    --c-card: #172233; --c-divider: #1e3050;
    --c-scrollbar: #2a4060; --c-scrollbar-hover: #3a5580;
    --c-shimmer-1: #1a2d40; --c-shimmer-2: #1e3350;
    --c-spin-bg: #1a3a2a; --c-spin-fg: #52b788;
    color-scheme: dark;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --c-g: #4a8fd4; --c-lg: #5a9de0; --c-mint: #1a3050;
      --c-bg: #0f1923; --c-yl: #52b788; --c-w: #172233;
      --c-t: #ddeaf8; --c-gr: #7a9ab8; --c-lg2: #1a2d40;
      --c-sidebar: linear-gradient(160deg,#060e18,#0d1e35,#102444);
      --c-input-bg: #1a2840; --c-input-border: #2a4060; --c-input-t: #ddeaf8;
      --c-card: #172233; --c-divider: #1e3050;
      --c-scrollbar: #2a4060; --c-scrollbar-hover: #3a5580;
      --c-shimmer-1: #1a2d40; --c-shimmer-2: #1e3350;
      --c-spin-bg: #1a3a2a; --c-spin-fg: #52b788;
      color-scheme: dark;
    }
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', sans-serif; background: var(--c-bg); -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: var(--c-scrollbar); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--c-scrollbar-hover); }
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
  .nb { cursor:pointer; border:none; font-family:'Nunito',sans-serif; transition:all 0.2s; min-height:40px; }
  .nb:hover { background:rgba(255,255,255,0.18)!important; }
  .nb.on { background:rgba(255,255,255,0.22)!important; font-weight:800; }
  .btn { cursor:pointer; border:none; border-radius:11px; font-family:'Nunito',sans-serif; font-weight:700; transition:all 0.18s ease; min-height:44px; }
  .btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
  .btn:active { transform:translateY(0); transition-duration:0.06s; }
  .btn:focus-visible { outline: 2px solid #2c5b8e; outline-offset: 2px; }
  @media (max-width: 600px) {
    input, textarea, select { font-size: 16px !important; }
    .btn { min-height: 44px; }
    .nb { min-height: 44px !important; }
  }
  .tag { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .spin { border:3px solid var(--c-spin-bg); border-top:3px solid var(--c-spin-fg); border-radius:50%; width:26px; height:26px; animation:spin 0.8s linear infinite; }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline:2px solid var(--c-lg) !important; outline-offset: 2px !important; border-radius: 6px; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--c-g) !important; outline-offset: 2px !important; border-radius: 6px; }
  input, textarea, select { background: var(--c-input-bg); color: var(--c-input-t); border-color: var(--c-input-border); transition: background 0.2s, color 0.2s, border-color 0.2s; }
  [data-theme="dark"] input,
  [data-theme="dark"] textarea,
  [data-theme="dark"] select {
    background: var(--c-input-bg) !important;
    color: var(--c-input-t) !important;
    border-color: var(--c-input-border) !important;
  }
  [data-theme="dark"] option {
    background: var(--c-card);
    color: var(--c-t);
  }

  /* SVG tegneark – levende hover-effekt */
  .svg-wrap-hover svg { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease; }
  .svg-wrap-hover:hover svg { transform: scale(1.04); filter: drop-shadow(0 4px 12px rgba(44,91,142,0.15)); }

  /* Skimmer-effekt mens innhold laster */
  .skimmer { background: linear-gradient(90deg, var(--c-shimmer-1) 0px, var(--c-shimmer-2) 100px, var(--c-shimmer-1) 200px); background-size: 400px 100%; animation: shimmer 1.2s linear infinite; border-radius: 8px; }

  /* Reduser animasjoner for brukere som har slått det av i OS */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    html { scroll-behavior: auto; }
  }

  /* ── MØRK MODUS: Overrides for hardkodede farger ────────────── */
  /* Hvite kort/paneler */
  [data-theme="dark"] [style*="background:#fff"],
  [data-theme="dark"] [style*="background: #fff"],
  [data-theme="dark"] [style*="background:#ffffff"],
  [data-theme="dark"] [style*="background: #ffffff"],
  [data-theme="dark"] [style*="background:white"],
  [data-theme="dark"] [style*="background: white"],
  [data-theme="dark"] [style*="background:rgb(255, 255, 255)"],
  [data-theme="dark"] [style*="background: rgb(255, 255, 255)"] {
    background: var(--c-w) !important;
    color: var(--c-t);
  }
  /* Lys grå bakgrunn – hex og rgb() fallback */
  [data-theme="dark"] [style*="background:#f5f9fd"],
  [data-theme="dark"] [style*="background: #f5f9fd"],
  [data-theme="dark"] [style*="background:rgb(245, 249, 253)"],
  [data-theme="dark"] [style*="background: rgb(245, 249, 253)"],
  [data-theme="dark"] [style*="background:#f5f7fa"],
  [data-theme="dark"] [style*="background: #f5f7fa"],
  [data-theme="dark"] [style*="background:rgb(245, 247, 250)"],
  [data-theme="dark"] [style*="background: rgb(245, 247, 250)"],
  [data-theme="dark"] [style*="background:#f3f7fc"],
  [data-theme="dark"] [style*="background: #f3f7fc"],
  [data-theme="dark"] [style*="background:rgb(243, 247, 252)"],
  [data-theme="dark"] [style*="background: rgb(243, 247, 252)"],
  [data-theme="dark"] [style*="background:#f8fafd"],
  [data-theme="dark"] [style*="background: #f8fafd"],
  [data-theme="dark"] [style*="background:rgb(248, 250, 253)"],
  [data-theme="dark"] [style*="background: rgb(248, 250, 253)"] {
    background: var(--c-lg2) !important;
  }
  /* Gule info-bokser – dempet i mørk modus + rgb() fallback */
  [data-theme="dark"] [style*="background:#fffde7"],
  [data-theme="dark"] [style*="background: #fffde7"],
  [data-theme="dark"] [style*="background:rgb(255, 253, 231)"],
  [data-theme="dark"] [style*="background: rgb(255, 253, 231)"],
  [data-theme="dark"] [style*="background:#fff9c4"],
  [data-theme="dark"] [style*="background: #fff9c4"],
  [data-theme="dark"] [style*="background:rgb(255, 249, 196)"],
  [data-theme="dark"] [style*="background: rgb(255, 249, 196)"],
  [data-theme="dark"] [style*="background:#fff3e0"],
  [data-theme="dark"] [style*="background: #fff3e0"],
  [data-theme="dark"] [style*="background:rgb(255, 243, 224)"],
  [data-theme="dark"] [style*="background: rgb(255, 243, 224)"] {
    background: #2a2510 !important;
    color: #e8d87a !important;
  }
  /* Grønne info-bokser + rgb() fallback */
  [data-theme="dark"] [style*="background:#e8f5e9"],
  [data-theme="dark"] [style*="background: #e8f5e9"],
  [data-theme="dark"] [style*="background:rgb(232, 245, 233)"],
  [data-theme="dark"] [style*="background: rgb(232, 245, 233)"],
  [data-theme="dark"] [style*="background:#d8f3dc"],
  [data-theme="dark"] [style*="background: #d8f3dc"],
  [data-theme="dark"] [style*="background:rgb(216, 243, 220)"],
  [data-theme="dark"] [style*="background: rgb(216, 243, 220)"],
  [data-theme="dark"] [style*="background:#f0fdf4"],
  [data-theme="dark"] [style*="background: #f0fdf4"],
  [data-theme="dark"] [style*="background:rgb(240, 253, 244)"],
  [data-theme="dark"] [style*="background: rgb(240, 253, 244)"] {
    background: #0e2a18 !important;
    color: #6fcf97 !important;
  }
  /* Blå info-bokser + rgb() fallback */
  [data-theme="dark"] [style*="background:#e3f2fd"],
  [data-theme="dark"] [style*="background: #e3f2fd"],
  [data-theme="dark"] [style*="background:rgb(227, 242, 253)"],
  [data-theme="dark"] [style*="background: rgb(227, 242, 253)"],
  [data-theme="dark"] [style*="background:#d8e6f5"],
  [data-theme="dark"] [style*="background: #d8e6f5"],
  [data-theme="dark"] [style*="background:rgb(216, 230, 245)"],
  [data-theme="dark"] [style*="background: rgb(216, 230, 245)"],
  [data-theme="dark"] [style*="background:#e8eff8"],
  [data-theme="dark"] [style*="background: #e8eff8"],
  [data-theme="dark"] [style*="background:rgb(232, 239, 248)"],
  [data-theme="dark"] [style*="background: rgb(232, 239, 248)"] {
    background: var(--c-lg2) !important;
  }
  /* Mørk tekst på lyse bakgrunner */
  [data-theme="dark"] [style*="color:#1a2c45"],
  [data-theme="dark"] [style*="color: #1a2c45"],
  [data-theme="dark"] [style*="color:#1a2a3a"],
  [data-theme="dark"] [style*="color: #1a2a3a"] {
    color: var(--c-t) !important;
  }
  [data-theme="dark"] [style*="color:#5d7390"],
  [data-theme="dark"] [style*="color: #5d7390"],
  [data-theme="dark"] [style*="color:#888"],
  [data-theme="dark"] [style*="color: #888"],
  [data-theme="dark"] [style*="color:#666"],
  [data-theme="dark"] [style*="color: #666"],
  [data-theme="dark"] [style*="color:#999"],
  [data-theme="dark"] [style*="color: #999"] {
    color: var(--c-gr) !important;
  }
  /* Border-farger */
  [data-theme="dark"] [style*="border:1px solid #e8eff8"],
  [data-theme="dark"] [style*="border: 1px solid #e8eff8"],
  [data-theme="dark"] [style*="border:1px solid #d8e6f5"],
  [data-theme="dark"] [style*="border: 1px solid #d8e6f5"],
  [data-theme="dark"] [style*="border:1.5px solid #e8eff8"],
  [data-theme="dark"] [style*="border: 1.5px solid #e8eff8"],
  [data-theme="dark"] [style*="border:1.5px solid #d8e6f5"],
  [data-theme="dark"] [style*="border: 1.5px solid #d8e6f5"],
  [data-theme="dark"] [style*="border:1.5px solid #ddd"],
  [data-theme="dark"] [style*="border: 1.5px solid #ddd"] {
    border-color: var(--c-divider) !important;
  }
  /* Ekstra border-varianter */
  [data-theme="dark"] [style*="border:1px solid #c4d6ec"],
  [data-theme="dark"] [style*="border: 1px solid #c4d6ec"],
  [data-theme="dark"] [style*="border:1.5px solid #c4d6ec"],
  [data-theme="dark"] [style*="border: 1.5px solid #c4d6ec"],
  [data-theme="dark"] [style*="border:1.5px solid #c3d9f5"],
  [data-theme="dark"] [style*="border: 1.5px solid #c3d9f5"],
  [data-theme="dark"] [style*="border:1px solid #b7e4c7"],
  [data-theme="dark"] [style*="border: 1px solid #b7e4c7"],
  [data-theme="dark"] [style*="border:1.5px solid #b7e4c7"],
  [data-theme="dark"] [style*="border: 1.5px solid #b7e4c7"],
  [data-theme="dark"] [style*="border:2px solid #2c5b8e"],
  [data-theme="dark"] [style*="border: 2px solid #2c5b8e"],
  [data-theme="dark"] [style*="border:1.5px dashed #66bb6a"],
  [data-theme="dark"] [style*="border: 1.5px dashed #66bb6a"] {
    border-color: var(--c-divider) !important;
  }
  /* Røde feil/slett-bokser + rgb() fallback */
  [data-theme="dark"] [style*="background:#ffebee"],
  [data-theme="dark"] [style*="background: #ffebee"],
  [data-theme="dark"] [style*="background:rgb(255, 235, 238)"],
  [data-theme="dark"] [style*="background: rgb(255, 235, 238)"],
  [data-theme="dark"] [style*="background:#fdecea"],
  [data-theme="dark"] [style*="background: #fdecea"],
  [data-theme="dark"] [style*="background:rgb(253, 236, 234)"],
  [data-theme="dark"] [style*="background: rgb(253, 236, 234)"],
  [data-theme="dark"] [style*="background:#fce4ec"],
  [data-theme="dark"] [style*="background: #fce4ec"],
  [data-theme="dark"] [style*="background:rgb(252, 228, 236)"],
  [data-theme="dark"] [style*="background: rgb(252, 228, 236)"] {
    background: #2a0808 !important;
    color: #ff9090 !important;
  }
  /* Lilla bakgrunner + rgb() fallback */
  [data-theme="dark"] [style*="background:#f9f3fd"],
  [data-theme="dark"] [style*="background: #f9f3fd"],
  [data-theme="dark"] [style*="background:rgb(249, 243, 253)"],
  [data-theme="dark"] [style*="background: rgb(249, 243, 253)"],
  [data-theme="dark"] [style*="background:#f3e5f5"],
  [data-theme="dark"] [style*="background: #f3e5f5"],
  [data-theme="dark"] [style*="background:rgb(243, 229, 245)"],
  [data-theme="dark"] [style*="background: rgb(243, 229, 245)"] {
    background: #1a0e28 !important;
    color: #c084fc !important;
  }
  /* Lysegrønne varianter + rgb() fallback */
  [data-theme="dark"] [style*="background:#f0faf4"],
  [data-theme="dark"] [style*="background: #f0faf4"],
  [data-theme="dark"] [style*="background:rgb(240, 250, 244)"],
  [data-theme="dark"] [style*="background: rgb(240, 250, 244)"],
  [data-theme="dark"] [style*="background:#f1f8e9"],
  [data-theme="dark"] [style*="background: #f1f8e9"],
  [data-theme="dark"] [style*="background:rgb(241, 248, 233)"],
  [data-theme="dark"] [style*="background: rgb(241, 248, 233)"] {
    background: #0a1e0e !important;
    color: #6fcf97 !important;
  }
  /* Teal/cyan bakgrunner + rgb() fallback */
  [data-theme="dark"] [style*="background:#e0f2f1"],
  [data-theme="dark"] [style*="background: #e0f2f1"],
  [data-theme="dark"] [style*="background:rgb(224, 242, 241)"],
  [data-theme="dark"] [style*="background: rgb(224, 242, 241)"],
  [data-theme="dark"] [style*="background:#e1f5fe"],
  [data-theme="dark"] [style*="background: #e1f5fe"],
  [data-theme="dark"] [style*="background:rgb(225, 245, 254)"],
  [data-theme="dark"] [style*="background: rgb(225, 245, 254)"] {
    background: #071e1c !important;
    color: #4db6ac !important;
  }
  /* Amber/gul varianter + rgb() fallback */
  [data-theme="dark"] [style*="background:#fff8e1"],
  [data-theme="dark"] [style*="background: #fff8e1"],
  [data-theme="dark"] [style*="background:rgb(255, 248, 225)"],
  [data-theme="dark"] [style*="background: rgb(255, 248, 225)"],
  [data-theme="dark"] [style*="background:#fff3cd"],
  [data-theme="dark"] [style*="background: #fff3cd"],
  [data-theme="dark"] [style*="background:rgb(255, 243, 205)"],
  [data-theme="dark"] [style*="background: rgb(255, 243, 205)"] {
    background: #221a06 !important;
    color: #e8c87a !important;
  }
  /* Lysegrå bakgrunn + rgb() fallback */
  [data-theme="dark"] [style*="background:#eceff1"],
  [data-theme="dark"] [style*="background: #eceff1"],
  [data-theme="dark"] [style*="background:rgb(236, 239, 241)"],
  [data-theme="dark"] [style*="background: rgb(236, 239, 241)"] {
    background: #171e24 !important;
    color: #90a4ae !important;
  }
  /* Lysblå varianter + rgb() fallback */
  [data-theme="dark"] [style*="background:#f0f7ff"],
  [data-theme="dark"] [style*="background: #f0f7ff"],
  [data-theme="dark"] [style*="background:rgb(240, 247, 255)"],
  [data-theme="dark"] [style*="background: rgb(240, 247, 255)"],
  [data-theme="dark"] [style*="background:#f8fbff"],
  [data-theme="dark"] [style*="background: #f8fbff"],
  [data-theme="dark"] [style*="background:rgb(248, 251, 255)"],
  [data-theme="dark"] [style*="background: rgb(248, 251, 255)"] {
    background: var(--c-lg2) !important;
  }
  /* Nøytrale grå bakgrunner (Samarbeid: read-only felt, knapper) */
  [data-theme="dark"] [style*="background:#f9f9f9"],
  [data-theme="dark"] [style*="background: #f9f9f9"],
  [data-theme="dark"] [style*="background:rgb(249, 249, 249)"],
  [data-theme="dark"] [style*="background: rgb(249, 249, 249)"],
  [data-theme="dark"] [style*="background:#f0f5fb"],
  [data-theme="dark"] [style*="background: #f0f5fb"],
  [data-theme="dark"] [style*="background:rgb(240, 245, 251)"],
  [data-theme="dark"] [style*="background: rgb(240, 245, 251)"],
  [data-theme="dark"] [style*="background:#e0e0e0"],
  [data-theme="dark"] [style*="background: #e0e0e0"],
  [data-theme="dark"] [style*="background:rgb(224, 224, 224)"],
  [data-theme="dark"] [style*="background: rgb(224, 224, 224)"] {
    background: var(--c-lg2) !important;
    color: var(--c-t) !important;
  }
  /* Ekstra tekst-farger */
  [data-theme="dark"] [style*="color:#5b8bbf"],
  [data-theme="dark"] [style*="color: #5b8bbf"] {
    color: var(--c-gr) !important;
  }
  [data-theme="dark"] [style*="color:#e65100"],
  [data-theme="dark"] [style*="color: #e65100"],
  [data-theme="dark"] [style*="color:rgb(230, 81, 0)"],
  [data-theme="dark"] [style*="color: rgb(230, 81, 0)"] {
    color: #ffab76 !important;
  }
  /* Mørke tekst-farger – hex og rgb() fallback for alle nettlesere */
  [data-theme="dark"] [style*="color:#6a1b9a"],
  [data-theme="dark"] [style*="color: #6a1b9a"],
  [data-theme="dark"] [style*="color:rgb(106, 27, 154)"],
  [data-theme="dark"] [style*="color: rgb(106, 27, 154)"] { color: #c084fc !important; }
  [data-theme="dark"] [style*="color:#1565c0"],
  [data-theme="dark"] [style*="color: #1565c0"],
  [data-theme="dark"] [style*="color:rgb(21, 101, 192)"],
  [data-theme="dark"] [style*="color: rgb(21, 101, 192)"] { color: #60a5fa !important; }
  [data-theme="dark"] [style*="color:#00695c"],
  [data-theme="dark"] [style*="color: #00695c"],
  [data-theme="dark"] [style*="color:rgb(0, 105, 92)"],
  [data-theme="dark"] [style*="color: rgb(0, 105, 92)"] { color: #4db6ac !important; }
  [data-theme="dark"] [style*="color:#1b5e20"],
  [data-theme="dark"] [style*="color: #1b5e20"],
  [data-theme="dark"] [style*="color:rgb(27, 94, 32)"],
  [data-theme="dark"] [style*="color: rgb(27, 94, 32)"],
  [data-theme="dark"] [style*="color:#2e7d32"],
  [data-theme="dark"] [style*="color: #2e7d32"],
  [data-theme="dark"] [style*="color:rgb(46, 125, 50)"],
  [data-theme="dark"] [style*="color: rgb(46, 125, 50)"],
  [data-theme="dark"] [style*="color:#2d6a4f"],
  [data-theme="dark"] [style*="color: #2d6a4f"],
  [data-theme="dark"] [style*="color:rgb(45, 106, 79)"],
  [data-theme="dark"] [style*="color: rgb(45, 106, 79)"],
  [data-theme="dark"] [style*="color:#33691e"],
  [data-theme="dark"] [style*="color: #33691e"],
  [data-theme="dark"] [style*="color:rgb(51, 105, 30)"],
  [data-theme="dark"] [style*="color: rgb(51, 105, 30)"],
  [data-theme="dark"] [style*="color:#2d7d4f"],
  [data-theme="dark"] [style*="color: #2d7d4f"] { color: #6fcf97 !important; }
  [data-theme="dark"] [style*="color:#795548"],
  [data-theme="dark"] [style*="color: #795548"],
  [data-theme="dark"] [style*="color:rgb(121, 85, 72)"],
  [data-theme="dark"] [style*="color: rgb(121, 85, 72)"],
  [data-theme="dark"] [style*="color:#5d4037"],
  [data-theme="dark"] [style*="color: #5d4037"],
  [data-theme="dark"] [style*="color:rgb(93, 64, 55)"],
  [data-theme="dark"] [style*="color: rgb(93, 64, 55)"] { color: #bcaaa4 !important; }
  [data-theme="dark"] [style*="color:#856404"],
  [data-theme="dark"] [style*="color: #856404"],
  [data-theme="dark"] [style*="color:rgb(133, 100, 4)"],
  [data-theme="dark"] [style*="color: rgb(133, 100, 4)"] { color: #e8c87a !important; }
  [data-theme="dark"] [style*="color:#455a64"],
  [data-theme="dark"] [style*="color: #455a64"],
  [data-theme="dark"] [style*="color:rgb(69, 90, 100)"],
  [data-theme="dark"] [style*="color: rgb(69, 90, 100)"],
  [data-theme="dark"] [style*="color:#37474f"],
  [data-theme="dark"] [style*="color: #37474f"],
  [data-theme="dark"] [style*="color:rgb(55, 71, 79)"],
  [data-theme="dark"] [style*="color: rgb(55, 71, 79)"] { color: #90a4ae !important; }
  [data-theme="dark"] [style*="color:#c62828"],
  [data-theme="dark"] [style*="color: #c62828"],
  [data-theme="dark"] [style*="color:rgb(198, 40, 40)"],
  [data-theme="dark"] [style*="color: rgb(198, 40, 40)"],
  [data-theme="dark"] [style*="color:#c2185b"],
  [data-theme="dark"] [style*="color: #c2185b"],
  [data-theme="dark"] [style*="color:rgb(194, 24, 91)"],
  [data-theme="dark"] [style*="color: rgb(194, 24, 91)"] { color: #ff9090 !important; }
  [data-theme="dark"] [style*="color:#0277bd"],
  [data-theme="dark"] [style*="color: #0277bd"],
  [data-theme="dark"] [style*="color:rgb(2, 119, 189)"],
  [data-theme="dark"] [style*="color: rgb(2, 119, 189)"] { color: #4fc3f7 !important; }
  [data-theme="dark"] [style*="color:#1a2c45"],
  [data-theme="dark"] [style*="color: #1a2c45"],
  [data-theme="dark"] [style*="color:rgb(26, 44, 69)"],
  [data-theme="dark"] [style*="color: rgb(26, 44, 69)"],
  [data-theme="dark"] [style*="color:#1a2a3a"],
  [data-theme="dark"] [style*="color: #1a2a3a"],
  [data-theme="dark"] [style*="color:rgb(26, 42, 58)"],
  [data-theme="dark"] [style*="color: rgb(26, 42, 58)"],
  [data-theme="dark"] [style*="color:#2a3e58"],
  [data-theme="dark"] [style*="color: #2a3e58"],
  [data-theme="dark"] [style*="color:#2a3a4c"],
  [data-theme="dark"] [style*="color: #2a3a4c"],
  [data-theme="dark"] [style*="color:#3a4a5c"],
  [data-theme="dark"] [style*="color: #3a4a5c"] { color: var(--c-t) !important; }
  [data-theme="dark"] [style*="color:#5d7390"],
  [data-theme="dark"] [style*="color: #5d7390"],
  [data-theme="dark"] [style*="color:rgb(93, 115, 144)"],
  [data-theme="dark"] [style*="color: rgb(93, 115, 144)"],
  [data-theme="dark"] [style*="color:#888"],
  [data-theme="dark"] [style*="color: #888"],
  [data-theme="dark"] [style*="color:#666"],
  [data-theme="dark"] [style*="color: #666"],
  [data-theme="dark"] [style*="color:#555"],
  [data-theme="dark"] [style*="color: #555"],
  [data-theme="dark"] [style*="color:#444"],
  [data-theme="dark"] [style*="color: #444"],
  [data-theme="dark"] [style*="color:#999"],
  [data-theme="dark"] [style*="color: #999"],
  [data-theme="dark"] [style*="color:rgb(136, 136, 136)"],
  [data-theme="dark"] [style*="color: rgb(136, 136, 136)"] { color: var(--c-gr) !important; }
  [data-theme="dark"] [style*="color:#b5179e"],
  [data-theme="dark"] [style*="color: #b5179e"],
  [data-theme="dark"] [style*="color:rgb(181, 23, 158)"],
  [data-theme="dark"] [style*="color: rgb(181, 23, 158)"] { color: #e879f9 !important; }
  [data-theme="dark"] [style*="color:#3d5a7a"],
  [data-theme="dark"] [style*="color: #3d5a7a"],
  [data-theme="dark"] [style*="color:rgb(61, 90, 122)"],
  [data-theme="dark"] [style*="color: rgb(61, 90, 122)"] { color: var(--c-gr) !important; }
  [data-theme="dark"] [style*="color:#1b5e47"],
  [data-theme="dark"] [style*="color: #1b5e47"],
  [data-theme="dark"] [style*="color:rgb(27, 94, 71)"],
  [data-theme="dark"] [style*="color: rgb(27, 94, 71)"] { color: #6fcf97 !important; }
  /* AI-badge (lilla) */
  [data-theme="dark"] [style*="background:#ede9fe"],
  [data-theme="dark"] [style*="background: #ede9fe"] {
    background: #1a0e2e !important;
    color: #c084fc !important;
  }
  [data-theme="dark"] [style*="color:#6d28d9"],
  [data-theme="dark"] [style*="color: #6d28d9"],
  [data-theme="dark"] [style*="color:#7c3aed"],
  [data-theme="dark"] [style*="color: #7c3aed"] {
    color: #c084fc !important;
  }
  /* Primærknapper med hardkodet #2c5b8e → bruk dark-mode blå */
  [data-theme="dark"] [style*="background:#2c5b8e"],
  [data-theme="dark"] [style*="background: #2c5b8e"] {
    background: var(--c-g) !important;
  }
  /* Primærblå tekstfarge → lysere i mørk modus */
  [data-theme="dark"] [style*="color:#2c5b8e"],
  [data-theme="dark"] [style*="color: #2c5b8e"] {
    color: var(--c-g) !important;
  }
  [data-theme="dark"] [style*="border-left:3px solid #2c5b8e"],
  [data-theme="dark"] [style*="border-left: 3px solid #2c5b8e"] {
    border-left-color: var(--c-g) !important;
  }
  /* Border-left for røde bokser – gjør dem synlige i dark mode */
  [data-theme="dark"] [style*="border-left:4px solid #c62828"],
  [data-theme="dark"] [style*="border-left: 4px solid #c62828"] {
    border-left-color: #ff9090 !important;
  }
  [data-theme="dark"] [style*="border-left:4px solid #c2185b"],
  [data-theme="dark"] [style*="border-left: 4px solid #c2185b"] {
    border-left-color: #f472b6 !important;
  }
  /* Fagområder – garantert dark mode via data-fag attributt (bakgrunn + tekst + kant) */
  [data-theme="dark"] [data-fag="kommunikasjon"] { background: #0e2a18 !important; color: #6fcf97 !important; border-color: #1a4020 !important; }
  [data-theme="dark"] [data-fag="kropp"] { background: #2a1800 !important; color: #f5a623 !important; border-color: #4a2800 !important; }
  [data-theme="dark"] [data-fag="kunst"] { background: #200a22 !important; color: #e879f9 !important; border-color: #3a1040 !important; }
  [data-theme="dark"] [data-fag="natur"] { background: #0a1830 !important; color: #60a5fa !important; border-color: #1a3050 !important; }
  [data-theme="dark"] [data-fag="antall"] { background: #1a0e28 !important; color: #c084fc !important; border-color: #2a1a40 !important; }
  [data-theme="dark"] [data-fag="etikk"] { background: #2a0808 !important; color: #ff9090 !important; border-color: #4a1010 !important; }
  [data-theme="dark"] [data-fag="naermiljo"] { background: #171e24 !important; color: #90a4ae !important; border-color: #2a3840 !important; }
  /* Fagområde-farger kun som tekstfarge (ingen bakgrunnsendring) */
  [data-theme="dark"] [data-fag-color="kommunikasjon"] { color: #6fcf97 !important; }
  [data-theme="dark"] [data-fag-color="kropp"] { color: #f5a623 !important; }
  [data-theme="dark"] [data-fag-color="kunst"] { color: #e879f9 !important; }
  [data-theme="dark"] [data-fag-color="natur"] { color: #60a5fa !important; }
  [data-theme="dark"] [data-fag-color="antall"] { color: #c084fc !important; }
  [data-theme="dark"] [data-fag-color="etikk"] { color: #ff9090 !important; }
  [data-theme="dark"] [data-fag-color="naermiljo"] { color: #90a4ae !important; }
  /* Roller-farger som tekstfarge */
  [data-theme="dark"] [data-fag-color="rolle-eier"] { color: #7a9ab8 !important; }
  [data-theme="dark"] [data-fag-color="rolle-styrer"] { color: #60a5fa !important; }
  [data-theme="dark"] [data-fag-color="rolle-pedleder"] { color: #6fcf97 !important; }
  [data-theme="dark"] [data-fag-color="rolle-barnehagelaerer"] { color: #4db6ac !important; }
  [data-theme="dark"] [data-fag-color="rolle-bua"] { color: #f5a623 !important; }
  [data-theme="dark"] [data-fag-color="rolle-assistent"] { color: #c084fc !important; }
  [data-theme="dark"] [data-fag-color="rolle-kommune"] { color: #90a4ae !important; }

  /* Gradient-bakgrunner – alle varianter */
  [data-theme="dark"] [style*="background:linear-gradient(135deg,#fafffe"],
  [data-theme="dark"] [style*="background: linear-gradient(135deg,#fafffe"],
  [data-theme="dark"] [style*="background:linear-gradient(135deg,#f0f9f4"],
  [data-theme="dark"] [style*="background: linear-gradient(135deg,#f0f9f4"] {
    background: #0a1e10 !important;
  }
  [data-theme="dark"] [style*="background:linear-gradient(135deg,#e3f2fd"],
  [data-theme="dark"] [style*="background: linear-gradient(135deg,#e3f2fd"] {
    background: var(--c-lg2) !important;
  }
  /* FAGOMRADER: orange/hud-farge */
  [data-theme="dark"] [style*="background:#fdebd0"],
  [data-theme="dark"] [style*="background: #fdebd0"] {
    background: #2a1400 !important;
    color: #f5a623 !important;
  }
  /* FAGOMRADER: rosa/lilla (Kunst, kultur) */
  [data-theme="dark"] [style*="background:#f8e7f6"],
  [data-theme="dark"] [style*="background: #f8e7f6"] {
    background: #1e0a20 !important;
    color: #e879f9 !important;
  }
  /* Manglende tekst-farger */
  [data-theme="dark"] [style*="color:#37474f"],
  [data-theme="dark"] [style*="color: #37474f"] {
    color: #90a4ae !important;
  }
  [data-theme="dark"] [style*="color:#b5179e"],
  [data-theme="dark"] [style*="color: #b5179e"] {
    color: #e879f9 !important;
  }
  /* Border: #d8f3dc (grønn) */
  [data-theme="dark"] [style*="border:2px solid #d8f3dc"],
  [data-theme="dark"] [style*="border: 2px solid #d8f3dc"],
  [data-theme="dark"] [style*="border:2px dashed #d8f3dc"],
  [data-theme="dark"] [style*="border: 2px dashed #d8f3dc"] {
    border-color: var(--c-divider) !important;
  }
  /* Deaktivert knapp (#ccc) – hvit tekst på lys grå er uleselig i mørk modus */
  [data-theme="dark"] [style*="background:#ccc"],
  [data-theme="dark"] [style*="background: #ccc"] {
    background: #444 !important;
  }
  /* Vilkår-boks (uavmerket) og lignende nøytrale lyse bakgrunner */
  [data-theme="dark"] [style*="background:#f8f9fc"],
  [data-theme="dark"] [style*="background: #f8f9fc"] {
    background: var(--c-lg2) !important;
  }
  /* Lysblå AI-panel (Månedsplan/Månedsbrev generer-boks) */
  [data-theme="dark"] [style*="background:#f0f6ff"],
  [data-theme="dark"] [style*="background: #f0f6ff"] {
    background: var(--c-lg2) !important;
  }
  /* Lys grønn e-postbekreftelse + søkseksjon månedsbrev */
  [data-theme="dark"] [style*="background:#f0faf2"],
  [data-theme="dark"] [style*="background: #f0faf2"],
  [data-theme="dark"] [style*="background:#f0faf4"],
  [data-theme="dark"] [style*="background: #f0faf4"] {
    background: #0a1e10 !important;
    color: #6fcf97 !important;
  }

  /* Skip-to-content (tilgjengelighet) */
  .skip-link { position:absolute; top:-60px; left:0; background:var(--c-g); color:#fff; padding:10px 16px; font-weight:700; border-radius:0 0 8px 0; z-index:9999; transition:top 0.2s; text-decoration:none; font-family:'Nunito',sans-serif; }
  .skip-link:focus { top:0; outline:2px solid #fff; outline-offset:2px; }

  /* RESPONSIVT LAYOUT */
  .bh-layout { display:flex; min-height:100vh; background:var(--c-bg); transition:background 0.25s; }
  .bh-sidebar { position:fixed; top:0; left:0; width:225px; height:100vh; background:var(--c-sidebar); z-index:100; display:flex; flex-direction:column; overflow-y:auto; transition:transform 0.28s ease, background 0.25s; }
  .bh-main { margin-left:225px; flex:1; padding:22px 20px; max-width:700px; transition:margin-left 0.28s ease; }
  .bh-hamburger { display:none; }
  .bh-backdrop { display:none; }
  .bh-mobile-header { display:none; }

  @media (max-width: 820px) {
    .bh-sidebar { transform:translateX(-100%); box-shadow:none; width:260px; }
    .bh-sidebar.open { transform:translateX(0); box-shadow:0 0 32px rgba(0,0,0,0.4); }
    .bh-sidebar-close { display:flex !important; }
    .bh-main { margin-left:0; padding:64px 14px 18px; max-width:100%; }
    /* Større touch-mål på mobil */
    .btn { min-height:44px; min-width:44px; }
    .nb { min-height:44px; }
    .fav-btn { min-height:44px; min-width:44px; padding:10px; }
    .bh-mobile-header { display:flex; position:fixed; top:0; left:0; right:0; height:52px; background:var(--c-sidebar); z-index:90; align-items:center; padding:0 12px; box-shadow:0 2px 8px rgba(0,0,0,0.12); }
    .bh-hamburger { display:flex; align-items:center; justify-content:center; width:44px; height:44px; background:rgba(255,255,255,0.15); border:none; border-radius:9px; cursor:pointer; color:#fff; font-size:20px; padding:0; }
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

const C = { g:"var(--c-g)", lg:"var(--c-lg)", mint:"var(--c-mint)", bg:"var(--c-bg)", yl:"var(--c-yl)", w:"var(--c-w)", t:"var(--c-t)", gr:"var(--c-gr)", lg2:"var(--c-lg2)" };

const KORT_KATEGORIER = [
  { id:"Lek",         ikon:"🎮", bg:"#e3f2fd", txt:"#1565c0" },
  { id:"Natur",       ikon:"🌿", bg:"#e8f5e9", txt:"#2e7d32" },
  { id:"Vann",        ikon:"💧", bg:"#e1f5fe", txt:"#0277bd" },
  { id:"Bevegelse",   ikon:"🏃", bg:"#fff3e0", txt:"#e65100" },
  { id:"Kreativt",    ikon:"🎨", bg:"#fce4ec", txt:"#880e4f" },
  { id:"Språk",       ikon:"💬", bg:"#f3e5f5", txt:"#6a1b9a" },
  { id:"Antall",      ikon:"🔢", bg:"#e8eaf6", txt:"#283593" },
  { id:"Musikk",      ikon:"🎵", bg:"#fbe9e7", txt:"#bf360c" },
  { id:"Ute",         ikon:"🌳", bg:"#f1f8e9", txt:"#33691e" },
  { id:"Rolig",       ikon:"🧘", bg:"#e0f2f1", txt:"#004d40" },
  { id:"Eksperiment", ikon:"🔬", bg:"#fff8e1", txt:"#ff6f00" },
  { id:"Sosialt",     ikon:"🤝", bg:"#fce4ec", txt:"#c2185b" },
];

const KORT_IKONER = [
  // Dyr
  "🦁","🐸","🐻","🐼","🐨","🐱","🐶","🦊","🐮","🐷","🐔","🦆","🐣","🦖","🦕","🐢","🐛","🐞","🐝","🦋","🐧","🐬","🐙","🦓","🐘",
  // Natur og vær
  "🌈","🌞","🌻","🌸","🌺","🌼","🌷","🍄","🌲","🌿","💧","🌊","🏔️","🍂","❄️","⛄","🌙","⭐","💫",
  // Aktiviteter og lek
  "🎨","🎵","🎭","🧩","🎈","🎪","🏃","⚽","🏀","🎠","🚂","🚀","🧸","🎀","🎁",
  // Mat
  "🍎","🍓","🍭","🧁","🍕",
  // Annet
  "🤝","🔬","🧲","🎯","🦄","🏕️","🎶","🖍️","✂️","🔑"
];

// [DATA MOVED] FAGOMRADER → ./data/ (se imports øverst i filen)
// [DATA MOVED] SANGER → ./data/ (se imports øverst i filen)
// [DATA MOVED] AKTIVITETER → ./data/ (se imports øverst i filen)
// [DATA MOVED] RE → ./data/ (se imports øverst i filen)
// [DATA MOVED] SVG_TEGN → ./data/ (se imports øverst i filen)

import { escapeHTML, mdToHtml, stripMd, skrivUtVindu } from './utils.js';


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
      <h1 style={{fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.t, marginBottom:3}}>✏️ Nytt aktivitetsskjema</h1>
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

        <div style={{background:C.lg2, borderRadius:11, padding:13, marginBottom:11, borderLeft:"3px solid #f59e0b"}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>🎯 HVA – Beskriv aktiviteten</div>
          <textarea value={form.hva} onChange={upd("hva")} placeholder="Hva skal barna gjøre?" rows={2}
            style={{...iStyle, border:`1.5px solid var(--c-divider)`, resize:"vertical"}}/>
        </div>

        <div style={{background:C.lg2, borderRadius:11, padding:13, marginBottom:11, borderLeft:"3px solid #10b981"}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>⚙️ HVORDAN – Gjennomføring</div>
          <textarea value={form.hvordan} onChange={upd("hvordan")} placeholder="Steg for steg – beskriv gjennomføringen..." rows={4}
            style={{...iStyle, border:`1.5px solid var(--c-divider)`, resize:"vertical"}}/>
        </div>

        <div style={{background:C.lg2, borderRadius:11, padding:13, marginBottom:11, borderLeft:"3px solid #3b82f6"}}>
          <div style={{fontWeight:800, color:C.t, fontSize:12, marginBottom:6}}>❓ HVORFOR – Pedagogisk begrunnelse</div>
          <textarea value={form.hvorfor} onChange={upd("hvorfor")} placeholder="Hva lærer barna? Hva er den pedagogiske verdien?" rows={2}
            style={{...iStyle, border:`1.5px solid var(--c-divider)`, resize:"vertical"}}/>
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
                background:form.rammeplan.includes(f.id)?f.farge:C.lg2,
                borderRadius:8, padding:"9px 11px", cursor:"pointer", display:"flex", alignItems:"center", gap:7,
                border:`2px solid ${form.rammeplan.includes(f.id)?f.farge:"var(--c-divider)"}`, transition:"all 0.15s"
              }}>
                <span style={{fontSize:16}}>{f.ikon}</span>
                <span style={{fontSize:10, fontWeight:700, color:form.rammeplan.includes(f.id)?"#fff":C.t, lineHeight:1.3}}>{f.navn}</span>
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

// [COMPONENT MOVED] hentUserTegneark, lagreUserTegneark, slettUserTegneark, AiTegnearkView, TegnearkSide → ./TegnearkSide.jsx


function SupportSide() {
  const [aapenFaq, setAapenFaq] = useState(null);
  const kontaktLenke = supportMailto();
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>❓ Hjelp og FAQ</h1>
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
}

function PlanleggingSide({ planTema, setPlanTema, navigerTil, antallUkeplaner=0, antallMaanedsplaner=0, antallMaanedsbrev=0, antallArsplaner=0, antallKalenderplaner=0 }) {
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:10}}>📅 Planlegging</h1>
      <div style={{background:C.lg2,borderRadius:13,padding:"13px 14px",marginBottom:18,border:`1.5px solid ${C.lg}`}}>
        <div style={{fontWeight:800,fontSize:12,color:C.g,marginBottom:7,display:"flex",alignItems:"center",gap:5}}>
          🎯 Felles tema
          {planTema && <span style={{background:C.g,color:"#fff",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:700,marginLeft:4}}>Aktivt</span>}
        </div>
        <input
          key={planTema}
          defaultValue={planTema}
          onBlur={e=>setPlanTema(e.target.value.trim())}
          placeholder="Skriv inn felles tema for alle planer..."
          style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.lg}`,fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none",background:C.w,color:C.t}}
        />
        <div style={{fontSize:11,color:C.gr,marginTop:6,lineHeight:1.5}}>
          {planTema
            ? `Temaet «${planTema}» fylles automatisk inn i nye ukeplaner og månedsplaner.`
            : "Sett et felles tema som automatisk fylles inn i nye planer – du kan alltid endre det per plan."}
        </div>
      </div>
      <div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Mine planer</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12,marginBottom:20}}>
        {[
          {id:"ukeplan",       ikon:"📋",tittel:"Ukeplan",        farge:"#1565c0",border:"#90caf9",desc:"Mandag–fredag med drag & drop",     antall:antallUkeplaner},
          {id:"maanedsplan",   ikon:"📋",tittel:"Månedsplan",     farge:"#6a1b9a",border:"#ce93d8",desc:"4 uker med mål og fagområder",      antall:antallMaanedsplaner},
          {id:"maanedskalender",ikon:"🗓️",tittel:"Kalender",     farge:"#0277bd",border:"#81d4fa",desc:"Månedsoversikt med hendelser",       antall:antallKalenderplaner},
          {id:"maanedsbrev",   ikon:"📨",tittel:"Månedsbrev",     farge:"#2d6a4f",border:"#81c995",desc:"Foreldrebrev med AI-hjelp",          antall:antallMaanedsbrev},
          {id:"arsplan",       ikon:"📆",tittel:"Årsplan",        farge:"#c62828",border:"#ef9a9a",desc:"Årshjul og pedagogisk grunnsyn",      antall:antallArsplaner},
        ].map(({id,ikon,tittel,farge,border,desc,antall})=>(
          <div key={id} className="hover" onClick={()=>navigerTil(id)}
            style={{background:C.w,borderRadius:14,padding:"16px 12px",cursor:"pointer",boxShadow:`0 2px 10px ${farge}18`,border:`2px solid ${border}`,textAlign:"center",position:"relative"}}>
            {antall > 0
              ? <span style={{position:"absolute",top:8,right:8,background:farge,color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800}}>{antall}</span>
              : <span style={{position:"absolute",top:8,right:8,background:C.lg2,color:C.gr,borderRadius:10,padding:"1px 7px",fontSize:9,fontWeight:700}}>Ingen</span>
            }
            <div style={{fontSize:32,marginBottom:7}}>{ikon}</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:farge,marginBottom:4}}>{tittel}</div>
            <div style={{fontSize:10,color:C.gr,lineHeight:1.4}}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Planmaler</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {id:"ukeplan",        ikon:"📅",tittel:"Ukeplan",          farge:"#1565c0",bg:"#e3f2fd",desc:"Klassisk Man–Fre tavleplan"},
          {id:"maanedskalender",ikon:"🗓️",tittel:"Månedskalender",  farge:"#0277bd",bg:"#e1f5fe",desc:"Kalendervisning med hendelser"},
          {id:"arsplan",        ikon:"📆",tittel:"Årshjul",           farge:"#c62828",bg:"#ffebee",desc:"11 måneder med tema og mål"},
          {id:"maanedsbrev",    ikon:"📨",tittel:"Månedsbrev",        farge:"#2d6a4f",bg:"#e8f5e9",desc:"AI-assistert foreldrebrev"},
        ].map(({id,ikon,tittel,farge,bg,desc})=>(
          <div key={tittel+"-mal"} className="hover" onClick={()=>navigerTil(id)}
            style={{background:bg,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,border:`1.5px solid ${farge}33`}}>
            <div style={{fontSize:26,flexShrink:0}}>{ikon}</div>
            <div>
              <div style={{fontWeight:800,fontSize:13,color:farge}}>{tittel}</div>
              <div style={{fontSize:10,color:C.gr,marginTop:1}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoritterSide({ favoritter, favTotal, aapneSang, aapneTegneark, toggleFav, setPreselectAktiv, navigerTil }) {
  const favSanger = SANGER.filter(s=>favoritter.sanger?.includes(s.id));
  const favAktiv = AKTIVITETER.filter(a=>favoritter.aktiviteter?.includes(a.id));
  const favTegn = TEGNEARK.filter(t=>favoritter.tegneark?.includes(t.id));
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>⭐ Mine favoritter</h1>
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
              <div key={s.id} className="hover" onClick={()=>aapneSang(s)} style={{background:C.w,borderRadius:11,padding:"11px 13px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
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
              <div key={t.id} className="hover" onClick={()=>aapneTegneark(t)} style={{background:C.w,borderRadius:11,padding:"11px 9px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",textAlign:"center",position:"relative"}}>
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
}

// Sikker localStorage – setItem/removeItem kaster SecurityError i Safari Private Browsing
function lsSet(key, value) { try { localStorage.setItem(key, value); } catch {} }
function lsRemove(key) { try { localStorage.removeItem(key); } catch {} }

// [COMPONENT MOVED] RammeplanSide → ./RammeplanSide.jsx
function Barnehagehjelpen({ aktivBruker, onLogout, onUserUpdate }) {
  const [tema, setTema] = useState(() => {
    const lagret = localStorage.getItem("bh_tema");
    if (lagret === "dark" || lagret === "light") return lagret;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    lsSet("bh_tema", tema);
  }, [tema]);

  const [side, setSide] = useState("hjem");
  const [skjemaer, setSkjemaer] = useState([]);
  const [skjemaerLastet, setSkjemaerLastet] = useState(false);
  const [preselectAktiv, setPreselectAktiv] = useState(null);
  const [preselectSang, setPreselectSang] = useState(null);
  const [preselectTegneark, setPreselectTegneark] = useState(null);
  const [valgtFag, setValgtFag] = useState(null);
  const [rammeSeksjon, setRammeSeksjon] = useState("oversikt");
  const [valgtSkjema, setValgtSkjema] = useState(null);
  const [redigerSkjemaTittel, setRedigerSkjemaTittel] = useState(null);
  const [bekreftSlettSkjema, setBekreftSlettSkjema] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [favoritter, setFavoritter] = useState({ sanger: [], aktiviteter: [], tegneark: [] });
  const [globalUkeplaner, setGlobalUkeplaner] = useState([]);
  const [globalMaanedsplaner, setGlobalMaanedsplaner] = useState([]);
  const [globalMaanedsbrev, setGlobalMaanedsbrev] = useState([]);
  const [globalArsplaner, setGlobalArsplaner] = useState([]);
  const [globalBoker, setGlobalBoker] = useState([]);
  const [globalUserSanger, setGlobalUserSanger] = useState([]);
  const [globalUserTegneark, setGlobalUserTegneark] = useState([]);
  const [globalAktivitetskort, setGlobalAktivitetskort] = useState([]);
  const [globalKalenderplaner, setGlobalKalenderplaner] = useState([]);
  const [globalDokumentasjon, setGlobalDokumentasjon] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLastet, setDataLastet] = useState(false);
  const [globalSok, setGlobalSok] = useState("");
  const [sokDebounced, setSokDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSokDebounced(globalSok), 200);
    return () => clearTimeout(t);
  }, [globalSok]);
  const [planTema, setPlanTema] = useState(() => localStorage.getItem("bh_plan_tema") || "");
  // Synkroniser planTema fra Supabase ved innlogging (overskriver localStorage-verdi)
  useEffect(() => {
    if (!aktivBruker?.id) return;
    hentPlanTema(aktivBruker.id).then(tema => {
      if (tema) { setPlanTema(tema); lsSet("bh_plan_tema", tema); }
    }).catch(() => {});
  }, [aktivBruker?.id]);
  // Lagre planTema til Supabase + localStorage ved endring
  useEffect(() => {
    if (planTema) lsSet("bh_plan_tema", planTema);
    else lsRemove("bh_plan_tema");
    if (aktivBruker?.id) lagrePlanTema(aktivBruker.id, planTema).catch(() => {});
  }, [planTema, aktivBruker?.id]);

  const vis = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""),3000); };

  // Global søk – memoised: kjøres kun når søketekst eller innholdsdata endres
  const sokeResultat = useMemo(() => {
    const q = sokDebounced.trim().toLowerCase();
    if (q.length < 2) return null;
    const treff = { sanger:[], aktiviteter:[], tegneark:[], fagomrader:[], rammeplan:[], skjemaer:[], ukeplaner:[], maanedsplaner:[], maanedsbrev:[], arsplaner:[], boker:[], aktivitetskort:[], dokumentasjon:[] };
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
    globalUserTegneark.forEach(t => {
      if (matcher(t.tittel) || matcher(t.oppgave) || matcher(t.samtale) || matcher(t.mal)) treff.tegneark.push({ ...t, id:"user_"+t.id, svg:<SvgPlaceholder/>, _erMin:true, _dbId:t.id });
    });
    globalUserSanger.forEach(s => {
      if (matcher(s.tittel) || matcher(s.tekst) || matcher(s.melodi)) treff.sanger.push({ ...s, id:"user_"+s.id, _erMin:true, _dbId:s.id });
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
    globalMaanedsplaner.forEach(p => {
      const samlet = (p.tittel||"") + " " + (p.tema||"") + " " + (p.fagomrader||[]).join(" ") +
        (p.type==="kalender" ? " " + JSON.stringify(p.events||{}) : " " + (p.uke1||"") + " " + (p.uke2||"") + " " + (p.uke3||"") + " " + (p.uke4||""));
      if (samlet.toLowerCase().includes(q)) treff.maanedsplaner.push(p);
    });
    globalMaanedsbrev.forEach(b => {
      const samlet = (b.tittel||"") + " " + (b.gjort||"") + " " + (b.kommende||"");
      if (samlet.toLowerCase().includes(q)) treff.maanedsbrev.push(b);
    });
    skjemaer.forEach(s => {
      if (matcher(s.tittel) || matcher(s.hva) || matcher(s.hvordan) || matcher(s.hvorfor) || matcher(s.type)) treff.skjemaer.push(s);
    });
    globalArsplaner.forEach(p => {
      const samlet = (p.tittel||"") + " " + (p.tema||"") + " " + (p.aar||"");
      if (samlet.toLowerCase().includes(q)) treff.arsplaner.push(p);
    });
    globalBoker.forEach(b => {
      if (matcher(b.tittel) || matcher(b.forfatter) || matcher(b.beskrivelse) || matcher(b.kategori)) treff.boker.push(b);
    });
    globalAktivitetskort.forEach(k => {
      if (matcher(k.title) || matcher(k.description) || matcher(k.steps) || matcher(k.learning_goal) || matcher(k.materials) || matcher(k.category) || matcher(k.age_group)) treff.aktivitetskort.push(k);
    });
    globalDokumentasjon.forEach(d => {
      if (matcher(d.tittel) || matcher(d.fortelling) || matcher(d.refleksjon)) treff.dokumentasjon.push(d);
    });

    const total = treff.sanger.length + treff.aktiviteter.length + treff.tegneark.length + treff.fagomrader.length + treff.rammeplan.length + treff.skjemaer.length + treff.ukeplaner.length + treff.maanedsplaner.length + treff.maanedsbrev.length + treff.arsplaner.length + treff.boker.length + treff.aktivitetskort.length + treff.dokumentasjon.length;
    return { total, ...treff, q };
  }, [sokDebounced, skjemaer, globalUkeplaner, globalMaanedsplaner, globalMaanedsbrev, globalArsplaner, globalBoker, globalUserTegneark, globalUserSanger, globalAktivitetskort, globalDokumentasjon]);

  // Hjelpere for å navigere fra søketreff
  const aapneTegneark = (t) => { setPreselectTegneark(t?.id || null); navigerTil("tegneark"); setGlobalSok(""); };
  const aapneSang = (s) => { setPreselectSang(s?.id || null); navigerTil("sanger"); setGlobalSok(""); };
  const aapneAktivitet = (a) => { setPreselectAktiv(a.id); navigerTil("aktiviteter"); setGlobalSok(""); };
  const aapneFagomrade = (f) => { setValgtFag(f); setRammeSeksjon("fagomrader"); navigerTil("rammeplan"); setGlobalSok(""); };
  const aapneRammeplan = (key) => { setRammeSeksjon(key); setValgtFag(null); navigerTil("rammeplan"); setGlobalSok(""); };
  const aapneAktivitetskort = () => { navigerTil("aktivitetskort"); setGlobalSok(""); };
  const aapneDokumentasjon = () => { navigerTil("dokumentasjon"); setGlobalSok(""); };
  const [preselectPlanId, setPreselectPlanId] = React.useState(null);
  const aapnePlan = (plan, sidId) => { setPreselectPlanId(plan.id||null); navigerTil(sidId); setGlobalSok(""); };


  const sesjonsStart = React.useRef(null);

  // Last alle brukerdata ved innlogging – én samlet Promise.all for færre round-trips
  useEffect(() => {
    const uid = aktivBruker?.id;
    if (!uid) { setDataLastet(true); sesjonsStart.current = null; return; }
    let avbrutt = false;
    setDataLastet(false);
    sesjonsStart.current = new Date().toISOString();
    Promise.all([
      hentFavoritter(uid).catch(() => ({ sanger:[], aktiviteter:[], tegneark:[] })),
      hentUkeplaner(uid).catch(() => []),
      hentMaanedsplaner(uid).catch(() => []),
      hentMaanedsbrev(uid).catch(() => []),
      hentArsplaner(uid).catch(() => []),
      supabase.from("boker").select("id,tittel,forfatter,beskrivelse,kategori").then(({data})=>data||[]).catch(()=>[]),
      hentUserTegneark(uid).catch(() => []),
      hentUserSanger(uid).catch(() => []),
      hentAktivitetskort(uid).catch(() => []),
      hentDokumentasjon(uid).catch(() => []),
      hentKalenderplaner(uid).catch(() => []),
    ]).then(([fav, ukeplaner, maanedsplaner, maanedsbrev, arsplaner, boker, tegneark, sanger, aktivitetskort, dokumentasjon, kalenderplaner]) => {
      if (avbrutt) return;
      setFavoritter(fav);
      setGlobalUkeplaner(ukeplaner);
      setGlobalMaanedsplaner(maanedsplaner);
      setGlobalMaanedsbrev(maanedsbrev);
      setGlobalArsplaner(arsplaner);
      setGlobalBoker(boker);
      setGlobalUserTegneark(tegneark);
      setGlobalUserSanger(sanger);
      setGlobalAktivitetskort(aktivitetskort);
      setGlobalDokumentasjon(dokumentasjon);
      setGlobalKalenderplaner(kalenderplaner);
    }).catch(console.error).finally(() => { if (!avbrutt) setDataLastet(true); });
    return () => { avbrutt = true; };
  }, [aktivBruker?.id]);

  // Last skjemaer fra storage når bruker logger inn
  useEffect(() => {
    let avbrutt = false;
    (async () => {
      if (!aktivBruker?.id) { setSkjemaer([]); setSkjemaerLastet(true); return; }
      try {
        const { data } = await supabase.from("skjemaer").select("skjema_id,payload").eq("user_id", aktivBruker.id).order("created_at", { ascending: false });
        if (avbrutt) return;
        setSkjemaer((data||[]).map(r => r.payload).filter(Boolean));
      } catch (e) {
        console.error("[Skjemaer] Kunne ikke laste:", e);
        if (!avbrutt) setSkjemaer([]);
      }
      if (!avbrutt) setSkjemaerLastet(true);
    })();
    return () => { avbrutt = true; };
  }, [aktivBruker?.id]);

  // Lagre skjemaer – debounced 500ms + upsert-strategi for å unngå data-tap
  useEffect(() => {
    if (!aktivBruker?.id || !skjemaerLastet) return;
    const userId = aktivBruker.id;
    const snapshot = skjemaer; // frys referanse til dette renderet
    let avbrutt = false;
    const t = setTimeout(async () => {
      if (avbrutt) return;
      try {
        if (snapshot.length === 0) {
          // Tom liste: slett alt – ingen risiko for data-tap
          await supabase.from("skjemaer").delete().eq("user_id", userId);
        } else {
          // Steg 1: upsert alle gjeldende (oppretter/oppdaterer, fjerner ikke)
          const rader = snapshot.map(s => ({ user_id: userId, skjema_id: String(s.id||""), payload: s }));
          const { error: upsertErr } = await supabase.from("skjemaer").upsert(rader, { onConflict: "skjema_id,user_id" });
          if (upsertErr) throw upsertErr;
          if (avbrutt) return;
          // Steg 2: slett rader som ikke lenger er i listen (kun etter vellykket upsert)
          const ids = snapshot.map(s => String(s.id||"")).filter(Boolean);
          if (ids.length > 0) {
            await supabase.from("skjemaer").delete().eq("user_id", userId).not("skjema_id", "in", `(${ids.join(",")})`);
          }
        }
      } catch(e) { console.error("[Skjemaer] Kunne ikke lagre:", e); }
    }, 500);
    return () => { avbrutt = true; clearTimeout(t); };
  }, [skjemaer, aktivBruker?.id, skjemaerLastet]);

  // Ref holder alltid siste favoritter-verdi, unngår stale closure i useCallback
  const favorittersRef = useRef(favoritter);
  useEffect(() => { favorittersRef.current = favoritter; }, [favoritter]);

  // Toggle favoritt og lagre umiddelbart med ordentlig feilhåndtering
  const toggleFav = useCallback(async (type, id) => {
    const curr = favorittersRef.current;
    const liste = curr[type] || [];
    const finnes = liste.includes(id);
    const ny = finnes ? liste.filter(x=>x!==id) : [...liste, id];
    const oppdatert = { ...curr, [type]: ny };
    setFavoritter(oppdatert);
    if (aktivBruker?.id) {
      try {
        await lagreFavoritter(aktivBruker.id, oppdatert);
        vis(finnes ? "Fjernet fra favoritter" : "⭐ Lagt til i favoritter");
      } catch (e) {
        console.error("[Favoritter] Lagring feilet:", e);
        setFavoritter(curr);
        vis("❌ Kunne ikke lagre favoritter");
      }
    }
  }, [aktivBruker?.id]);

  // Navigasjon: lukk sidebar etter valg på mobil
  const navigerTil = useCallback((s) => { setSide(s); setSidebarOpen(false); }, []);

  // Tastaturnavigasjon: lukk sidebar med Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sidebarOpen]);

  const favTotal = (favoritter.sanger?.length||0) + (favoritter.aktiviteter?.length||0) + (favoritter.tegneark?.length||0);

  // Gruppert navigasjon – grupper med label og items
  const navGrupper = [
    { label: null, items: [
      {id:"hjem",i:"🏠",n:"Hjem"},
    ]},
    { label: "Innhold", items: [
      {id:"sanger",i:"🎵",n:"Sanger & Rim"},
      {id:"aktiviteter",i:"🏃",n:"Aktiviteter"},
      {id:"tegneark",i:"🖍️",n:"Tegneark"},
      {id:"rammeplan",i:"📖",n:"Rammeplan"},
      {id:"boker",i:"📚",n:"Bøker"},
    ]},
    { label: "Mine ting", items: [
      {id:"favoritter",i:"⭐",n:"Favoritter",badge:favTotal},
      {id:"skjemaer",i:"📋",n:"Mine skjemaer",badge:skjemaer.length},
      {id:"aktivitetskort",i:"🃏",n:"Aktivitetskort"},
      {id:"dokumentasjon",i:"📔",n:"Dokumentasjon"},
    ]},
    { label: "Planlegging", items: [
      {id:"planlegging",i:"📅",n:"Planlegging"},
    ]},
    { label: "Verktøy", items: [
      {id:"ai",i:"🤖",n:"AI-assistent"},
      {id:"skjema-ny",i:"✏️",n:"Nytt skjema"},
      {id:"samarbeid",i:"👥",n:"Samarbeid"},
    ]},
    { label: "Hjelp", items: [
      {id:"support",i:"❓",n:"Hjelp & FAQ"},
      ...(aktivBruker?.admin?[{id:"admin",i:"👑",n:"Admin-panel"}]:[]),
    ]},
  ];
  // Flat liste for bakoverkompatibilitet med andre steder som bruker nav
  const nav = navGrupper.flatMap(g => g.items);

  // hilsen og dagensTips er modul-nivå-konstanter (se over Barnehagehjelpen)
  const [hils, hikon, hsub] = hilsen();
  // Stabilt valg per dag: bruk dato (år+måned+dag) som seed istedenfor bare ukedag
  const idag = new Date();
  const datoFroe = idag.getFullYear() * 10000 + (idag.getMonth()+1) * 100 + idag.getDate();
  const [tipsOffset, setTipsOffset] = useState(0);
  const tipsIndex = (datoFroe + tipsOffset) % DAGENS_TIPS.length;
  const tips = DAGENS_TIPS[tipsIndex];
  const tipsFag = FAGOMRADER.find(f=>f.id===tips.f);
  const nesteTips = () => setTipsOffset(o => o + 1);

  const [vær, setVær] = useState(() => {
    try {
      const c = sessionStorage.getItem("bh_vær");
      if (c) { const { data, tid } = JSON.parse(c); if (Date.now() - tid < 30 * 60 * 1000) return data; }
    } catch {}
    return null;
  });
  useEffect(() => {
    if (vær) return; // allerede cachet i sessionStorage
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=auto`);
        if (!r.ok) return;
        const d = await r.json();
        const c = d?.current;
        if (!c) return;
        const data = { temp: Math.round(c.temperature_2m), kode: c.weather_code, vind: Math.round(c.wind_speed_10m) };
        setVær(data);
        try { sessionStorage.setItem("bh_vær", JSON.stringify({ data, tid: Date.now() })); } catch {}
      } catch {}
    }, () => {});
  }, []); // kjøres én gang – vær-cachen sjekkes i useState-initializer

  const værInfo = (kode) => {
    if (kode === 0) return ["☀️","Klarvær"];
    if (kode <= 2) return ["🌤️","Lettskyet"];
    if (kode === 3) return ["☁️","Overskyet"];
    if (kode <= 48) return ["🌫️","Tåke"];
    if (kode <= 55) return ["🌦️","Yr"];
    if (kode <= 65) return ["🌧️","Regn"];
    if (kode <= 67) return ["🌨️","Sludd"];
    if (kode <= 77) return ["❄️","Snø"];
    if (kode <= 82) return ["🌧️","Regnbyger"];
    if (kode <= 86) return ["❄️","Snøbyger"];
    return ["⛈️","Torden"];
  };

  const [værIkon, værTekst] = vær ? værInfo(vær.kode) : [null, null];

  // Alle Side-komponenter er definert på modul-nivå (se over Barnehagehjelpen)
  // NyttSkjemaForm rendres direkte i JSX (ikke via sider-objektet) for stabil komponent-type


  // MaanedsbrevSide er definert på modul-nivå (se over Barnehagehjelpen)


  // PlanleggingSide er definert på modul-nivå (se over Barnehagehjelpen)

  // UkeplanSide og SortableAktivitetItem er definert på modul-nivå (se over Barnehagehjelpen)


  // MaanedskalenderSide er definert på modul-nivå (se over Barnehagehjelpen)


  // ArsplanSide er definert på modul-nivå (se over Barnehagehjelpen)


  // DokumentasjonSide er definert på modul-nivå (se over Barnehagehjelpen)


  // ProfilSide er definert på modul-nivå (se over Barnehagehjelpen)


  // FavoritterSide er definert på modul-nivå (se over Barnehagehjelpen)

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

  // Delt kontekst som sendes til modul-nivå Side-komponenter
  const ctx = {
    aktivBruker,
    vis,
    navigerTil,
    setSide,
    setPreselectAktiv,
    planTema,
    setPlanTema,
    rammeSeksjon,
    setRammeSeksjon,
    valgtFag,
    setValgtFag,
    favoritter,
    toggleFav,
    setGlobalUkeplaner,
    setGlobalMaanedsplaner,
    setGlobalMaanedsbrev,
    setGlobalArsplaner,
    setGlobalDokumentasjon,
    setGlobalKalenderplaner,
    preselectPlanId,
    setPreselectPlanId,
    globalUserTegneark,
    setGlobalUserTegneark,
    preselectTegneark,
    setPreselectTegneark,
    onUserUpdate,
    onLogout,
    sesjonsStart: sesjonsStart.current,
  };

  const hjemCtx = { hikon, vær, værIkon, værTekst, hils, hsub, skjemaer, globalSok, setGlobalSok, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, aapnePlan, tips, tipsFag, nesteTips, setValgtFag, setRammeSeksjon, dataLastet, globalUkeplaner, globalMaanedsplaner, globalMaanedsbrev, globalArsplaner };
  const skjemaCtx = { skjemaer, setSkjemaer, feedback, vis, valgtSkjema, setValgtSkjema, redigerSkjemaTittel, setRedigerSkjemaTittel, setBekreftSlettSkjema, navigerTil };

  const sider={
    hjem:<Hjem ctx={hjemCtx}/>,
    skjemaer:<MineSkjemaer ctx={skjemaCtx}/>,
    rammeplan:<RammeplanSide ctx={ctx}/>,
    tegneark:<TegnearkSide ctx={ctx}/>,
    ai:<AiSideComp onLagreSomSkjema={lagreAISomSkjema} initialType={aiInitialType} clearInitialType={()=>setAiInitialType(null)}/>,
    admin:<AdminPanel aktivBruker={aktivBruker}/>,
    favoritter:<FavoritterSide favoritter={favoritter} favTotal={favTotal} aapneSang={aapneSang} aapneTegneark={aapneTegneark} toggleFav={toggleFav} setPreselectAktiv={setPreselectAktiv} navigerTil={navigerTil}/>,
    profil:<ProfilSide ctx={ctx}/>,
    support:<SupportSide/>,
    dokumentasjon:<DokumentasjonSide ctx={ctx}/>,
    planlegging:<PlanleggingSide planTema={planTema} setPlanTema={setPlanTema} navigerTil={navigerTil} antallUkeplaner={globalUkeplaner.length} antallMaanedsplaner={globalMaanedsplaner.length} antallMaanedsbrev={globalMaanedsbrev.length} antallArsplaner={globalArsplaner.length} antallKalenderplaner={globalKalenderplaner.length}/>,
    maanedsplan:<MaanedsplanSide ctx={ctx}/>,
    maanedsbrev:<MaanedsbrevSide ctx={ctx}/>,
    ukeplan:<UkeplanSide ctx={ctx}/>,
    maanedskalender:<MaanedskalenderSide ctx={ctx}/>,
    arsplan:<ArsplanSide ctx={ctx}/>,
    boker:<BokerSide aktivBruker={aktivBruker}/>,
    aktivitetskort:<AktivitetskortPanel aktivBruker={aktivBruker} onOppdater={()=>hentAktivitetskort(aktivBruker.id).then(setGlobalAktivitetskort).catch(console.error)}/>,
    samarbeid:<SamarbeidSide aktivBruker={aktivBruker}/>,
  };

  return (
    <>
      <style>{CSS}</style>
      <a href="#bh-main-content" className="skip-link">Hopp til innhold</a>
      <div className="bh-layout">
        {/* Mobil-header med hamburger */}
        <div className="bh-mobile-header">
          <button className="bh-hamburger" onClick={()=>setSidebarOpen(true)} aria-label="Åpne navigasjonsmeny" aria-expanded={sidebarOpen} aria-controls="bh-sidebar">☰</button>
          <div className="bh-mobile-title">
            {(() => { const n = nav.find(x => x.id === side); return n ? `${n.i} ${n.n}` : "🌿 Barnehagehjelpen"; })()}
          </div>
        </div>
        {/* Backdrop på mobil når sidebar er åpen */}
        <div className={`bh-backdrop ${sidebarOpen?"show":""}`} onClick={()=>setSidebarOpen(false)}/>
        {/* Sidebar */}
        <div id="bh-sidebar" className={`bh-sidebar ${sidebarOpen?"open":""}`} aria-label="Navigasjonsmeny">
          <div style={{padding:"22px 16px 16px",borderBottom:"1px solid rgba(255,255,255,0.12)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:"#fff",lineHeight:1.2}}>🌿 Barnehage</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:"rgba(255,255,255,0.85)",lineHeight:1.2}}>hjelpen</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:3}}>Rammeplan 2017 integrert</div>
            </div>
            <button onClick={()=>setSidebarOpen(false)} aria-label="Lukk meny" style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:18,display:"none",alignItems:"center",justifyContent:"center"}} className="bh-sidebar-close">✕</button>
          </div>
          <nav role="navigation" aria-label="Hovednavigasjon" style={{flex:1,padding:"8px 9px",overflowY:"auto"}}>
            {navGrupper.map((gruppe, gi) => {
              const planSider = ["ukeplan","arsplan","maanedsplan","maanedsbrev","maanedskalender"];
              return (
                <div key={gi} style={{marginBottom: gruppe.label ? 6 : 4}}>
                  {gruppe.label && (
                    <div role="heading" aria-level={3} style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"1px",padding:"6px 10px 3px",marginTop:gi>0?4:0}}>
                      {gruppe.label}
                    </div>
                  )}
                  {gruppe.items.map(item => {
                    const erAktiv = side===item.id || (item.id==="planlegging" && planSider.includes(side));
                    return (
                      <button key={item.id} className={`nb ${erAktiv?"on":""}`} onClick={()=>navigerTil(item.id)}
                        aria-current={erAktiv?"page":undefined}
                        aria-label={item.badge>0?`${item.n} (${item.badge})`:item.n}
                        style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",marginBottom:2,background:erAktiv?"rgba(255,255,255,0.2)":"transparent",borderRadius:8,color:"#fff",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                        <span aria-hidden="true" style={{fontSize:15}}>{item.i}</span>
                        <span style={{fontWeight:erAktiv?800:600,flex:1}}>{item.n}</span>
                        {item.badge>0&&<span aria-hidden="true" style={{background:"#6ba0d9",borderRadius:9,padding:"1px 6px",fontSize:10,flexShrink:0}}>{item.badge}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div style={{padding:"0 12px 14px"}}>
            {/* Mørk modus-bryter */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",marginBottom:7,background:"rgba(255,255,255,0.08)",borderRadius:9}}>
              <span style={{color:"rgba(255,255,255,0.85)",fontSize:12,fontWeight:700}}>
                {tema==="dark" ? "🌙 Mørk modus" : "☀️ Lys modus"}
              </span>
              <button
                onClick={()=>setTema(t=>t==="dark"?"light":"dark")}
                title={tema==="dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
                aria-label={tema==="dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
                style={{background:tema==="dark"?"var(--c-g)":"rgba(255,255,255,0.25)",border:"none",borderRadius:20,padding:"3px",width:44,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:tema==="dark"?"flex-end":"flex-start",transition:"background 0.25s, justify-content 0s",flexShrink:0}}
              >
                <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform 0.25s"}} />
              </button>
            </div>
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
        <main id="bh-main-content" className="bh-main" aria-label="Hovedinnhold">
          <div role="status" aria-live="polite" aria-atomic="true" style={{position:"fixed",top:70,right:20,zIndex:200,pointerEvents:"none"}}>
            {feedback && <div className="fade" style={{background:C.g,color:"#fff",borderRadius:9,padding:"10px 16px",fontWeight:700,fontSize:13,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{feedback}</div>}
          </div>
          <ErrorBoundary key={side} compact>
            {side==="sanger" ? <SangerSideComp favoritter={favoritter} toggleFav={toggleFav} aktivBruker={aktivBruker} onNyUserSang={(ny) => setGlobalUserSanger(p => [ny, ...p])} preselectId={preselectSang} clearPreselect={()=>setPreselectSang(null)}/>
             : side==="aktiviteter" ? <AktivSideComp preselectId={preselectAktiv} clearPreselect={()=>setPreselectAktiv(null)} favoritter={favoritter} toggleFav={toggleFav}/>
             : side==="skjema-ny" ? <NyttSkjemaForm onSave={s=>setSkjemaer(p=>[s,...p])} onNavigate={setSide}/>
             : (sider[side]||<Hjem ctx={hjemCtx}/>)
            }
          </ErrorBoundary>
        </main>
      </div>
      {bekreftSlettSkjema && (
        <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBekreftSlettSkjema(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.w,borderRadius:14,padding:22,maxWidth:360,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#c62828",marginBottom:10}}>🗑 Slette skjema?</div>
            <p style={{fontSize:13,color:C.t,lineHeight:1.6,marginBottom:16}}>Vil du slette <strong>«{bekreftSlettSkjema.tittel}»</strong>? Dette kan ikke angres.</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setBekreftSlettSkjema(null)} style={{flex:1,padding:"11px",background:C.lg2,color:C.t,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
              <button onClick={()=>{setSkjemaer(p=>p.filter(s=>s.id!==bekreftSlettSkjema.id));setValgtSkjema(null);setRedigerSkjemaTittel(null);setBekreftSlettSkjema(null);vis("🗑 Slettet");}} style={{flex:1,padding:"11px",background:"#c62828",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
//  APP WRAPPER – auth-gate som velger mellom innlogging og hovedappen
// ═══════════════════════════════════════════
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { feil: null }; }
  static getDerivedStateFromError(e) { return { feil: e?.message || String(e) }; }
  render() {
    if (this.state.feil) {
      if (this.props.compact) return (
        <div style={{padding:"24px 20px",background:"var(--c-w)",borderRadius:14,border:"1.5px solid var(--c-divider)",borderLeft:"4px solid #c62828",margin:8}}>
          <div style={{fontWeight:800,color:"#c62828",fontSize:15,marginBottom:8}}>⚠️ Noe gikk galt i denne seksjonen</div>
          <div style={{fontSize:12,color:"var(--c-gr)",marginBottom:14}}>Prøv å navigere bort og tilbake, eller last inn siden på nytt.</div>
          <button onClick={()=>this.setState({feil:null})} style={{padding:"8px 18px",background:"var(--c-g)",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Nunito',sans-serif"}}>↩ Prøv igjen</button>
        </div>
      );
      return (
        <div style={{padding:32,fontFamily:"monospace",background:"#1a1a2e",color:"#ff6b6b",minHeight:"100vh"}}>
          <h2 style={{color:"#fff",marginBottom:12}}>Noe gikk galt</h2>
          <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.feil}</pre>
          <button onClick={()=>window.location.reload()} style={{marginTop:20,padding:"10px 24px",background:"#2c5b8e",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>Last inn på nytt</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GjenopprettPassordSkjerm({ onFerdig }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeil("");
    if (pw.length < 6) return setFeil("Passord må være minst 6 tegn");
    if (pw !== pw2) return setFeil("Passordene er ikke like");
    setLaster(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLaster(false);
    if (error) return setFeil(error.message);
    setOk(true);
    setTimeout(() => onFerdig(), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a3a5c 0%,#2c7be5 100%)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, color: "#1a2a3a" }}>🔑 Sett nytt passord</h2>
        <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>Velg et nytt passord for kontoen din.</p>
        {ok ? (
          <p style={{ color: "#2e7d32", fontWeight: 700, textAlign: "center" }}>✅ Passord oppdatert! Logger inn…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#444" }}>Nytt passord</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Minst 6 tegn" required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 15, marginBottom: 14, boxSizing: "border-box" }} />
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#444" }}>Gjenta passord</label>
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Gjenta passord" required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 15, marginBottom: 14, boxSizing: "border-box" }} />
            {feil && <p style={{ color: "#c62828", fontSize: 13, margin: "0 0 12px" }}>{feil}</p>}
            <button type="submit" disabled={laster}
              style={{ width: "100%", padding: "12px", background: "#2c5b8e", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: laster ? "not-allowed" : "pointer", opacity: laster ? 0.7 : 1 }}>
              {laster ? "Lagrer…" : "Lagre nytt passord"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [aktivBruker, setAktivBruker] = useState(null);
  const [laster, setLaster] = useState(true);
  const [visInnlogging, setVisInnlogging] = useState(false);
  const [visGjenopprettPassord, setVisGjenopprettPassord] = useState(false);

  // Sett data-theme tidlig basert på lagret preferanse – gjelder også velkomst/auth-skjerm
  useEffect(() => {
    try {
      const lagret = localStorage.getItem("bh_tema");
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const tema = lagret === "dark" || lagret === "light" ? lagret : (prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", tema);
    } catch {}
  }, []);

  useEffect(() => {
    // onAuthStateChange setter bruker FØR getSession() (synkront fra cache)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setVisGjenopprettPassord(true);
        setLaster(false);
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          setAktivBruker(byggBruker(session.user, null));
          hentProfil(session.user.id).then(p => {
            setAktivBruker(byggBruker(session.user, p));
          }).catch(console.error);
        }
      } else if (event === "USER_UPDATED") {
        if (session?.user) {
          hentProfil(session.user.id).then(p => {
            setAktivBruker(byggBruker(session.user, p));
          }).catch(console.error);
        }
      } else if (event === "SIGNED_OUT") {
        setAktivBruker(null);
        setVisGjenopprettPassord(false);
      }
    });

    // Fallback: hvis getSession() henger, avslutter vi lasting etter 4s
    const fallback = setTimeout(() => setLaster(false), 4000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(fallback);

      if (session?.user) {
        const skalLoggeUt =
          localStorage.getItem("bh_husk_meg") === "false" &&
          !sessionStorage.getItem("bh_sesjon");
        if (skalLoggeUt) {
          supabase.auth.signOut().finally(() => setLaster(false));
          return;
        }
      }

      setLaster(false);
    }).catch(() => {
      clearTimeout(fallback);
      setLaster(false);
    });

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try { sessionStorage.removeItem("bh_sesjon"); } catch {}
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

  if (visGjenopprettPassord) {
    return <><style>{CSS}</style><GjenopprettPassordSkjerm onFerdig={() => { setVisGjenopprettPassord(false); setVisInnlogging(true); }} /></>;
  }

  if (!aktivBruker && !visInnlogging) {
    return <Velkomst onStart={() => setVisInnlogging(true)} sjekkSesjon={false}/>;
  }

  if (!aktivBruker) {
    return <><style>{CSS}</style><AuthScreen onLoginSuccess={setAktivBruker}/></>;
  }

  return <Barnehagehjelpen aktivBruker={aktivBruker} onLogout={handleLogout} onUserUpdate={handleUserUpdate}/>;
}

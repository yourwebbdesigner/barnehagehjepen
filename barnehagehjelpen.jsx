import React, { useState, useRef, useEffect } from "react";
import DokumentSkanner from "./DokumentSkanner.jsx";
import BokerSide from "./Boker.jsx";
import Velkomst from "./Velkomst.jsx";
import SamarbeidSide from "./Samarbeid.jsx";
import { supabase } from "./supabase.js";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

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
  .nb { cursor:pointer; border:none; font-family:'Nunito',sans-serif; transition:all 0.2s; }
  .nb:hover { background:rgba(255,255,255,0.18)!important; }
  .nb.on { background:rgba(255,255,255,0.22)!important; font-weight:800; }
  .btn { cursor:pointer; border:none; border-radius:11px; font-family:'Nunito',sans-serif; font-weight:700; transition:all 0.18s ease; }
  .btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
  .btn:active { transform:translateY(0); transition-duration:0.06s; }
  .btn:focus-visible { outline: 2px solid #2c5b8e; outline-offset: 2px; }
  .tag { display:inline-block; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .spin { border:3px solid var(--c-spin-bg); border-top:3px solid var(--c-spin-fg); border-radius:50%; width:26px; height:26px; animation:spin 0.8s linear infinite; }
  input:focus, textarea:focus, select:focus { outline:2px solid var(--c-lg); outline-offset: 1px; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--c-g); outline-offset: 2px; }
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
    .bh-mobile-header { display:flex; position:fixed; top:0; left:0; right:0; height:52px; background:var(--c-sidebar); z-index:90; align-items:center; padding:0 12px; box-shadow:0 2px 8px rgba(0,0,0,0.12); }
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
  { id:1, tittel:"Lille Petter Edderkopp", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Lille Petter Edderkopp\nSpant sitt nett i tre\nÅtte bein og store øyne\nHjelper ham å se\nRegnet kom og vasket nettet\nSolen tørket fint\nLille Petter Edderkopp\nBegynte helt på nytt",
    tips:"Bruk pekefingeren som edderkopp. Barna elsker å dramatisere regnet og solen. Kobles til vær og årstider." },
  { id:2, tittel:"God morgen alle sammen", kategori:"sang", alder:"1-6 år", rammeplan:["kommunikasjon","etikk"], melodi:"Egenkomponert",
    tekst:"God morgen, god morgen\nHer er vi igjen\nGod morgen, god morgen\nAlle er her nå\nStrekk armene høyt opp\nMot den lyse himmelen\nGod morgen, god morgen\nKlar for en ny dag!\nKlapp i hendene dine\nStamp med føttene\nHei og hå og hei igjen\nNå begynner vi!",
    tips:"Perfekt åpning for samlingsstund. Barna hilser på hverandre. Bytt ut klapping med nye bevegelser." },
  { id:3, tittel:"Bjørnen sover", kategori:"sang", alder:"2-6 år", rammeplan:["kommunikasjon","kropp"], melodi:"Egenkomponert",
    tekst:"Store bjørn i skogen\nLa seg ned i hi\nLukket øyne rolig\nSov til våren vi\nSnøen dekte trærne\nKaldt og stille der\nMen da solen varmet\nBjørnen opp igjen\nGjesper stort og bredt nå\nStrekker seg og ler\nSulten etter vinteren\nUt på jakt han fer",
    tips:"Dramatiser: barna er bjørner som sover og våkner. Snakk om dyrenes vinterdvale og årstider." },
  { id:4, tittel:"Ro, ro på det blå hav", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon","kropp"], melodi:"Egenkomponert",
    tekst:"Ro, ro på det blå hav\nBølger gynger oss\nRo med armene fremover\nAv og til vi stopp\nFisken hopper i det blå\nSølvblanke og fin\nRo, ro på det blå hav\nHjem til deg og din",
    tips:"Sett barna i par som ror sammen. Stimulerer motorikk, samarbeid og rytme. Ypperlig for de minste." },
  { id:5, tittel:"Olav Snekker", kategori:"sang", alder:"2-6 år", rammeplan:["kommunikasjon","naermiljo"], melodi:"Egenkomponert",
    tekst:"Olav snekker i verkstedet\nLager fine ting\nHammer, sag og spiker\nRundt om ham en ring\nBank, bank, bank – nå blir det fint!\nSag, sag, sag – se så smart!\nHylla henger på veggen nå\nOlav er fornøyd",
    tips:"Bruk bevegelser for banking. Snakk om yrker og håndverk. Knytt til konstruksjonslek og samfunnsforståelse." },
  { id:6, tittel:"Vuggesang for de minste", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Sov, sov, lille venn\nNatta er så mørk\nStjernene de blinker\nOver skog og bjørk\nPust så stille, pust så rolig\nDrømmene er nær\nSov, sov, lille venn\nJeg er alltid her",
    tips:"Rolig sang for soving og nærhet. God for kos og trygghet. Syng sakte og lavt." },
  { id:7, tittel:"Hoppe sansen", kategori:"sang", alder:"1-4 år", rammeplan:["kropp","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Hopp, hopp, hopp vi nå\nOpp og ned med kroppen vår\nHopp på ett bein, hopp på to\nHopp til vi er slitne\nHopp mot solen, hopp mot sky\nAlle liker å hoppe ny\nHopp, hopp, hopp vi nå\nAlle hopper med!",
    tips:"Enkel sang som alle kan delta i. Fremmer grovmotorikk og bevegelsesglede. Bra i overgangssituasjoner." },
  { id:8, tittel:"Fem små frosk", kategori:"sang", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Fem små frosk satt på en stein\nEn hoppet ned og ble igjen\nFire små frosk satt på en stein\nEn hoppet ned – nå er det tre\nTre, to, én – og ingen mer\nAlle froskene er borte her\nMen i dammen bobler det\nFem frosk er tilbake igjen!",
    tips:"Telle baklengs fra 5 til 0. Bruk fingre. Barna elsker repetisjonen. Knytter telling til konkret handling." },
  { id:9, tittel:"Lille kanin", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Lille kanin på enga\nLøper fort og lett\nLange ører peker opp\nKorte hale hvit\nSpiser gulrot og kløver\nSitt og napp og bit\nLille kanin på enga\nHopper glad og fri",
    tips:"Bruk hender som ører og hopp. Kan dramatiseres ute. Snakk om kaniner og andre haredyr." },
  { id:10, tittel:"Regnbuen", kategori:"sang", alder:"3-6 år", rammeplan:["natur","kunst"], melodi:"Egenkomponert",
    tekst:"Etter regn kommer sol\nOg etter sol regn igjen\nOg i himmelen lyser\nRegnbuen min venn\nRød og oransje og gul\nGrønn og blå og fiolett\nSyn syv vakre farger\nAlt det fineste på jord",
    tips:"Lag regnbue med armene. Tegn regnbuer i alle farger etterpå. Snakk om primær- og sekundærfarger." },
  { id:11, tittel:"Fuglene synger", kategori:"sang", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Fuglene synger om morgenen\nKvitter og triller og ler\nStore og små i trærne\nSynger for alle som er her\nVifter med vinger og flyr avsted\nOver tak og grønne trær\nFuglene synger om morgenen\nKom og lytt til dem!",
    tips:"Bruk armene som vinger. Lytt til fuglekvitter ute etterpå. Knytt til årstider og fuglearter." },
  { id:12, tittel:"Ælle bælle bus", kategori:"regle", alder:"2-6 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Ælle bælle bus\nHvem leker med oss?\nPeke på hverandre\nRund og rundt vi går\nEn, to, tre og fire\nFem, seks, syv og åtte\nNi og ti – nå er du den!\nLeken kan begynne!",
    tips:"Tellerim for å velge 'den'. God overgang til lek. Barna liker rytmen og spenningen." },
  { id:13, tittel:"En, to, tre – hopp!", kategori:"regle", alder:"2-5 år", rammeplan:["antall","kropp"], melodi:"Egenkomponert",
    tekst:"En, to, tre – hopp!\nFire, fem, seks – stopp!\nSju, åtte, ni – vend om!\nTi – og nå begynner vi!\nHopp og stans og snu deg rundt\nTelling er så morsomt her\nEn, to, tre – hopp igjen!\nKlarer du å følge med?",
    tips:"Kombiner bevegelse og telling. Bra i overgangssituasjoner. Barna lærer tallrekkefølgen." },
  { id:14, tittel:"Regndråpen", kategori:"rim", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Regndråpen faller\nFra skyen ned\nTrommer på taket\nSå mykt og lett\nRenner i bekken\nFar til elva\nSå til det store havet\nOg opp i sky igjen",
    tips:"Kobles til vannets kretsløp. Tegn regndråpens reise. Snakk om havet og skyene." },
  { id:15, tittel:"Tre bukker på fjellet", kategori:"rim", alder:"3-6 år", rammeplan:["kommunikasjon","etikk"], melodi:"Egenkomponert",
    tekst:"Tre bukker på fjellet\nVil opp til setra\nLille bukk går først\nMidtbukk følger etter\nStore bukk til sist\nSterk og modig han\nSammen kom de opp\nAlle tre til toppen",
    tips:"Dramatiser med tre barn som ulike bukker. Bruk stemmer. Snakk om mot, klokskap og samarbeid." },
  { id:16, tittel:"Fruktsangen", kategori:"regle", alder:"2-5 år", rammeplan:["antall","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Eple er rødt og pære er gul\nPlomme er blå og banan er rund\nTeller vi frukt her i dag\nEn og to og tre – hurra!\nSpis litt av hvert og lær deg smaken\nFrukt gjør kroppen vår glad\nEn, to, tre, fire, fem og seks\nSett dem på rekke og rad!",
    tips:"Bruk frukt som rekvisitter. Knytt til matlaging. Barna lærer fruktsorter og tall simultant." },
  { id:17, tittel:"De fem fingrene", kategori:"sang", alder:"1-4 år", rammeplan:["kommunikasjon","kropp"], melodi:"Egenkomponert",
    tekst:"Tommelen er størst av dem\nPekefingeren peker frem\nLangemann er midtmann han\nRingefingeren er ganske fin\nLillefingeren minst av alle\nNå løfter vi dem én for én\nFem fingre på hver hånd vi har\nTi fingre har vi alle her!",
    tips:"Løft opp en finger om gangen. Fantastisk for finmotorikk og navn på fingre. God for de aller minste." },
  { id:18, tittel:"Sovesangen", kategori:"sang", alder:"0-3 år", rammeplan:["kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Søvnen kommer sakte\nØynene de tunge\nLukk dem nå og hvil litt\nDrøm om fine ting\nPust så rolig, pust så stille\nHjertet slår så lett\nSov nå, lille venn min\nTrygg og god du er",
    tips:"Rolig vuggesang. God for søvnsituasjoner og nærhet. Syng sakte og lavt – skaper ro." },
  { id:19, tittel:"Høstsangen", kategori:"sang", alder:"2-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Bladene de faller\nRøde, gule, brune\nVinden blåser kaldt\nOg høsten er her\nKongler og eikenøtter\nFinner vi på bakken\nNaturens eget skattkammer\nVenter på oss her",
    tips:"Syng på tur i skogen om høsten. Samle materialer mens dere synger. Snakk om årstider og farger." },
  { id:20, tittel:"Vi er mange farger", kategori:"sang", alder:"3-6 år", rammeplan:["etikk","naermiljo"], melodi:"Egenkomponert",
    tekst:"Vi er mange farger\nVi er mange vi\nNoen er som deg\nNoen er som meg\nMen alle hører til her\nAlle hører til\nForskjellige og like\nEr vi alle vi",
    tips:"Synges i samlingsstund. Snakk om mangfold og det å høre til. Bruk bilder av barn fra ulike kulturer." },
  { id:21, tittel:"Den vesle reisen", kategori:"rim", alder:"3-6 år", rammeplan:["kommunikasjon","kunst"], melodi:"Egenkomponert",
    tekst:"Liten som en ert\nBor i blomstens favn\nSover i en nøtteskall\nUnder himlens havn\nFuglene er venner\nBærer henne vidt\nTil et land av blomster\nDer alt er nytt og fritt",
    tips:"La barna tegne en liten eventyrfigur. Snakk om eventyr, fantasiverdener og å være modig." },
  { id:22, tittel:"Månen og stjernene", kategori:"rim", alder:"2-5 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Månen seiler stille\nHøyt der oppe nå\nStjernene er vaktene\nSom passer på oss her\nNatta er ikke skummel\nLyse stjerner blinker\nSov nå, lille venn min\nMånen lyser klart",
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
  { id:101, tittel:"Klapp-klapp regle", kategori:"regle", alder:"2-5 år", rammeplan:["kommunikasjon","kropp"], melodi:"Egenkomponert",
    tekst:"Klapp i hender, klapp på lår\nKlapp på hodet, klapp på tå\nKlapp så høyt og klapp så lavt\nKlapp så alle hører meg",
    tips:"Klappe-mønster. God for rytmeforståelse." },
  { id:102, tittel:"Tipp-tapp regle", kategori:"regle", alder:"1-4 år", rammeplan:["kommunikasjon","kropp"], melodi:"Egenkomponert",
    tekst:"Tipp-tapp, tipp-tapp\nLille mus i hus\nTipp-tapp, tipp-tapp\nKrump som en lus",
    tips:"Tipp på lår eller bord med fingrene. Rytmisk." },
  { id:103, tittel:"Værregle", kategori:"regle", alder:"3-6 år", rammeplan:["natur","kommunikasjon"], melodi:"Egenkomponert",
    tekst:"Regn og sol og vind og snø\nVæret skifter hele tid\nRegn gir vann til blomster\nSol gir oss sin glød\nKledd for været er vi klare\nFor hva enn det bringer",
    tips:"Ute når det regner og slutter. Tradisjonsbevisst." },
  { id:104, tittel:"Vente-regle", kategori:"regle", alder:"2-5 år", rammeplan:["kommunikasjon"], melodi:"Egenkomponert",
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

  barnehageloven:{ tittel:"Barnehageloven – sentrale paragrafer",
    paragrafer:[
      { nr:"§1", tittel:"Formål", tekst:"Barnehagen skal i samarbeid og forståelse med hjemmet ivareta barnas behov for omsorg og lek, og fremme læring og danning som grunnlag for allsidig utvikling. Barnehagen skal bygge på grunnleggende verdier i kristen og humanistisk arv og tradisjon, slik som respekt for menneskeverdet og naturen, på åndsfrihet, nestekjærlighet, tilgivelse, likeverd og solidaritet. Barna skal få utfolde skaperglede, undring og utforskertrang. De skal lære å ta vare på seg selv, hverandre og naturen. Barna skal utvikle grunnleggende kunnskaper og ferdigheter. De skal ha rett til medvirkning tilpasset alder og forutsetninger. Barnehagen skal møte barna med tillit og respekt, og anerkjenne barndommens egenverdi." },
      { nr:"§2", tittel:"Barnehagens innhold", tekst:"Barnehagen skal være en pedagogisk virksomhet. Barnehagen skal gi barn under opplæringspliktig alder gode utviklings- og aktivitetsmuligheter i nær forståelse og samarbeid med barnas hjem. Departementet fastsetter en rammeplan for barnehagen. Rammeplanen skal gi retningslinjer for barnehagens innhold og oppgaver. Barnehagens eier kan tilpasse rammeplanen til lokale forhold." },
      { nr:"§3", tittel:"Barns rett til medvirkning", tekst:"Barn i barnehagen har rett til å gi uttrykk for sitt syn på barnehagens daglige virksomhet. Barn skal jevnlig få mulighet til aktiv deltakelse i planlegging og vurdering av barnehagens virksomhet. Barnets synspunkter skal tillegges vekt i samsvar med dets alder og modenhet." },
      { nr:"§4", tittel:"Foreldreråd og samarbeidsutvalg", tekst:"For å sikre samarbeidet med barnas hjem, skal hver barnehage ha et foreldreråd og et samarbeidsutvalg. Foreldrerådet består av foreldrene/de foresatte til alle barna og skal fremme deres fellesinteresser og bidra til at samarbeidet mellom barnehagen og foreldregruppen skaper et godt barnehagemiljø. Samarbeidsutvalget skal være et rådgivende, kontaktskapende og samordnende organ. Samarbeidsutvalget fastsetter barnehagens årsplan." },
      { nr:"§7", tittel:"Barnehageeierens ansvar", tekst:"Barnehageeieren skal drive virksomheten i samsvar med gjeldende lover og regelverk, herunder denne loven og barnehagens vedtekter. Barnehageeieren plikter å rette seg etter pålegg fra kommunen som barnehagemyndighet. Barnehageeieren har ansvar for at barnehagen har tilstrekkelig faglig kompetanse og bemanning." },
      { nr:"§8", tittel:"Kommunens ansvar som barnehagemyndighet", tekst:"Kommunen er lokal barnehagemyndighet. Kommunen skal gi veiledning og påse at barnehagene drives i samsvar med gjeldende regelverk. Kommunen skal behandle søknader om godkjenning og gi godkjenning der lovens vilkår er oppfylt. Kommunen har plikt til å føre tilsyn med barnehagene." },
      { nr:"§16", tittel:"Opplysningsplikt til barnevernstjenesten", tekst:"Barnehagepersonalet skal i sitt arbeid være oppmerksom på forhold som kan føre til tiltak fra barnevernstjenestens side. Uten hinder av taushetsplikt skal barnehagepersonalet av eget tiltak gi opplysninger til barnevernstjenesten, når det er grunn til å tro at et barn blir mishandlet i hjemmet eller det foreligger andre former for alvorlig omsorgssvikt, eller når et barn har vist vedvarende alvorlige atferdsvansker." },
      { nr:"§19a", tittel:"Rett til spesialpedagogisk hjelp", tekst:"Barn under opplæringspliktig alder som har særlige behov for spesialpedagogisk hjelp, har rett til slik hjelp. Hjelpen skal omfatte tilbud om foreldrerådgivning. Kommunen skal oppfylle retten til spesialpedagogisk hjelp for alle barn som oppholder seg i kommunen. Kommunen kan kreve at barnehagen knytter til seg en spesialpedagog." },
      { nr:"§41", tittel:"Aktivitetsplikt for trygt barnehagemiljø", tekst:"Alle som arbeider i barnehagen, skal følge med på om barna har et trygt og godt barnehagemiljø. Alle som arbeider i barnehagen, skal melde fra til styreren dersom de får mistanke om eller kjennskap til at et barn ikke har et trygt og godt barnehagemiljø. Styreren skal melde fra til barnehageeieren i alvorlige tilfeller. Barnehagen skal lage en skriftlig plan med tiltak, og gjennomføre og evaluere tiltakene. Saken skal følges opp til barnet har et trygt og godt barnehagemiljø." },
    ] },

  roller:{ tittel:"Ansvar og roller i barnehagen",
    innhold:"Alle som jobber i barnehagen har et felles ansvar for barnas ve og vel, men har ulike roller og ansvarsområder. God rolleforståelse skaper et godt arbeidsmiljø og bedre kvalitet for barna.",
    personer:[
      { rolle:"Barnehageeier", ikon:"🏢", farge:"#1a2c45", ansvar:["Overordnet ansvar for at barnehagen drives i samsvar med lov og rammeplan","Sørge for tilstrekkelig bemanning og faglig kompetanse","Legge til rette for personalets kompetanseutvikling","Vedta og revidere barnehagens vedtekter","Ansvarlig overfor kommunen som barnehagemyndighet"], krav:"Eier kan være en kommune, en organisasjon, et selskap eller en privatperson. Alle barnehager må ha godkjenning fra kommunen." },
      { rolle:"Styrer", ikon:"👩‍💼", farge:"#1565c0", ansvar:["Faglig og administrativ leder av barnehagen","Ansvar for at rammeplanen følges i praksis","Personalledelse, veiledning og medarbeidersamtaler","Økonomi- og ressursforvaltning","Kontakt med foreldre, samarbeidsutvalg og kommune","Kvalitetsutviklingsarbeid og tilsyn"], krav:"Styrere skal ha barnehagelærerutdanning eller annen høgskoleutdanning med pedagogisk utdanning og erfaring fra arbeid med barn." },
      { rolle:"Pedagogisk leder", ikon:"👩‍🏫", farge:"#2d6a4f", ansvar:["Faglig ansvar for sin avdeling eller base","Lede det pedagogiske arbeidet og teamet","Planlegge og vurdere det pedagogiske arbeidet","Veilede og støtte øvrig personale","Tett samarbeid med foreldre om enkeltbarn","Sikre at alle barn inkluderes og trives"], krav:"Pedagogisk leder skal ha barnehagelærerutdanning. Styrer kan innvilge dispensasjon ved mangel på kvalifiserte søkere." },
      { rolle:"Barnehagelærer", ikon:"🎓", farge:"#00695c", ansvar:["Bidrar til planlegging og gjennomføring av pedagogisk arbeid","Ansvar for barnegruppa i samarbeid med pedagogisk leder","Utøver profesjonelt pedagogisk skjønn i hverdagen","Bidrar til kollektiv refleksjon og faglig utvikling"], krav:"3-årig barnehagelærerutdanning (bachelor) eller master i barnehagepedagogikk." },
      { rolle:"Fagarbeider / BUA", ikon:"🛠️", farge:"#e67e22", ansvar:["Viktig medarbeider i det daglige arbeidet med barna","Bidrar til omsorg, lek og pedagogisk arbeid","Kan ha ansvar for enkeltbarn eller grupper under faglig ledelse","Deltar i planlegging og refleksjonsmøter"], krav:"Barne- og ungdomsarbeider (fagbrev, BUA) fra videregående opplæring + 2 år i lære." },
      { rolle:"Assistent", ikon:"🤝", farge:"#6a1b9a", ansvar:["Støtter opp under det pedagogiske arbeidet","Bidrar til omsorg og trygghet i hverdagen","Utfører praktiske oppgaver knyttet til barna","Bidrar i samarbeid med øvrig personale"], krav:"Ingen formelle utdanningskrav, men barnehager oppfordres til å prioritere søkere med relevant kompetanse." },
      { rolle:"Kommunen / Barnehagemyndigheten", ikon:"🏛️", farge:"#37474f", ansvar:["Lokal barnehagemyndighet med tilsynsansvar","Gi veiledning til barnehagene","Godkjenne barnehager etter søknad","Sikre at barnehagene drives i samsvar med regelverket","Behandle klager og fatte enkeltvedtak"], krav:"Kommunen skal ha en plan for tilsyn med barnehagene og gjennomføre jevnlig tilsyn." },
    ] },

  inkludering:{ tittel:"Inkludering og tilrettelegging",
    innhold:"Barnehagen skal ha plass til alle barn, uavhengig av forutsetninger, behov og bakgrunn. Inkludering betyr at alle barn deltar aktivt i fellesskapet på egne premisser – ikke at alle skal gjøre det samme, men at alle får like muligheter.",
    omrader:[
      { navn:"Barn med nedsatt funksjonsevne", ikon:"♿", farge:"#1565c0", innhold:"Barn med nedsatt funksjonsevne har rett til prioritet ved opptak i barnehage. Barnehagen skal tilrettelegge for disse barna. Kommunen kan gi tilskudd til tilrettelegging av utstyr og miljø.", tiltak:["Individuell plan (IP) ved behov","Støttepedagog eller spesialpedagogisk hjelp","Tilpasning av miljø, materialer og aktiviteter","Tett samarbeid med PPT","Kartlegging og utredning ved behov"] },
      { navn:"Spesialpedagogisk hjelp (§19a)", ikon:"📚", farge:"#2d6a4f", innhold:"Barn som har særlige behov for spesialpedagogisk hjelp, har rett til slik hjelp. Det er PPT som utreder og tilrår hjelpen. Hjelpen kan gis i barnehagen eller i egne grupper.", tiltak:["Sakkyndig vurdering fra PPT","Enkeltvedtak fra kommunen","Individuell plan for spesialpedagogisk hjelp","Spesialpedagog kan komme inn i barnehagen","Årsrapport og evaluering av tiltakene"] },
      { navn:"Flerspråklige barn", ikon:"🌍", farge:"#e67e22", innhold:"Barnehagen skal støtte flerspråklige barn i å bruke morsmålet sitt og samtidig utvikle norsk. Morsmålet er grunnlaget for all annen språklig og kognitiv utvikling.", tiltak:["Tospråklig assistanse der det er mulig","Morsmålsstøtte i hverdagen","Bruke bilder, konkreter og bevegelse","Samarbeid med foreldre om barnets morsmål","Ekstra norsk språkstimulering"] },
      { navn:"Barnevernsbarn og sårbare barn", ikon:"💛", farge:"#c62828", innhold:"Barnehagen er en viktig arena for å oppdage og støtte barn i vanskelige situasjoner. Barnehagepersonalet har opplysningsplikt til barnevernstjenesten.", tiltak:["Kjenne og bruke opplysningsplikten (§16)","Bygge nær og trygg relasjon til barnet","Informere styrer ved bekymring","Samarbeide med barnevernstjenesten ved behov","Barnets beste er alltid overordnet"] },
      { navn:"Samiske barn og nasjonale minoriteter", ikon:"🪶", farge:"#00695c", innhold:"Samiske barn har rett til plass i samisk barnehage. Barnehagen skal gi alle barn kjennskap til samisk kultur. Nasjonale minoriteters kultur og tradisjoner skal respekteres og inkluderes.", tiltak:["Markere samisk nasjonaldag 6. februar","Bruke samiske fortellinger, sang og tradisjoner","Samiske barnehager har samisk som opplæringsspråk","Romanikultur og andre minoriteters tradisjoner inkluderes"] },
    ],
    ppt:{ tittel:"PPT – Pedagogisk-psykologisk tjeneste",
      innhold:"PPT er kommunens sakkyndige instans for barn som trenger spesialpedagogisk hjelp. Barnehagen kan henvise barn til PPT med samtykke fra foreldre. PPT er gratis og tilgjengelig for alle.",
      oppgaver:["Sakkyndig vurdering av barn med særskilte behov","Rådgivning og veiledning til barnehagen","Samarbeid med andre instanser (BUP, HABU, helsestasjon)","Kompetanseutvikling for barnehageansatte"],
      hvemKanHenvise:"Barnehagen (med foreldresamtykke) eller foreldrene direkte kan henvende seg til PPT." } },

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

const SvgReinsdyr = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="155" cy="165" rx="85" ry="52"/>
    <circle cx="228" cy="112" r="40"/>
    <circle cx="236" cy="106" r="9" fill={S.s}/><circle cx="238" cy="104" r="3" fill="white" stroke="none"/>
    <ellipse cx="248" cy="102" rx="14" ry="8" fill="#f9c5b5" transform="rotate(-20,248,102)"/>
    <circle cx="240" cy="92" r="10" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <path d="M198 80 Q185 48 168 38 Q180 52 182 68" strokeWidth="3"/>
    <path d="M168 38 Q155 22 148 18 Q158 30 162 42" strokeWidth="2.5"/>
    <path d="M210 76 Q205 50 218 38 Q212 54 216 68" strokeWidth="3"/>
    <path d="M218 38 Q228 22 235 18 Q226 30 224 42" strokeWidth="2.5"/>
    <path d="M70 140 Q40 118 28 105" strokeWidth="3.5"/>
    <path d="M240 140 Q265 118 278 105" strokeWidth="3.5"/>
    <path d="M95 215 Q75 248 72 278" strokeWidth="3.5"/>
    <path d="M130 215 Q120 252 122 278" strokeWidth="3.5"/>
    <path d="M180 215 Q178 252 180 278" strokeWidth="3.5"/>
    <path d="M215 215 Q225 248 228 278" strokeWidth="3.5"/>
  </svg>
);
const SvgGave = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="52" y="138" width="196" height="148" rx="10"/>
    <rect x="42" y="108" width="216" height="38" rx="8"/>
    <line x1="150" y1="108" x2="150" y2="286" strokeWidth="4"/>
    <line x1="42" y1="127" x2="258" y2="127" strokeWidth="4"/>
    <path d="M150 108 Q130 72 108 68 Q90 65 88 82 Q86 100 120 108 Q135 112 150 108Z" fill="#ff9898"/>
    <path d="M150 108 Q170 72 192 68 Q210 65 212 82 Q214 100 180 108 Q165 112 150 108Z" fill="#ff9898"/>
    <circle cx="150" cy="98" r="14" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <circle cx="98" cy="185" r="12"/><circle cx="202" cy="185" r="12"/>
    <circle cx="98" cy="245" r="12"/><circle cx="202" cy="245" r="12"/>
    <circle cx="150" cy="215" r="10"/>
  </svg>
);
const SvgPepperkake = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="72" r="52" fill="#c8956c" stroke="#8B5E3C" strokeWidth="3.5"/>
    <circle cx="128" cy="62" r="8" fill={S.s}/><circle cx="172" cy="62" r="8" fill={S.s}/>
    <path d="M128 86 Q150 100 172 86" fill="none" strokeWidth="3" stroke="#8B5E3C"/>
    <path d="M130 120 Q150 108 170 120 Q155 135 150 145 Q145 135 130 120Z" fill="#c8956c" stroke="#8B5E3C" strokeWidth="3"/>
    <rect x="110" y="148" width="80" height="80" rx="12" fill="#c8956c" stroke="#8B5E3C" strokeWidth="3.5"/>
    <circle cx="135" cy="172" r="8" fill="white" stroke="#c8956c" strokeWidth="2"/>
    <circle cx="165" cy="172" r="8" fill="white" stroke="#c8956c" strokeWidth="2"/>
    <circle cx="150" cy="198" r="8" fill="white" stroke="#c8956c" strokeWidth="2"/>
    <path d="M110 178 Q72 162 52 178 Q68 165 75 188" strokeWidth="3.5" fill="none"/>
    <path d="M190 178 Q228 162 248 178 Q232 165 225 188" strokeWidth="3.5" fill="none"/>
    <ellipse cx="65" cy="200" rx="20" ry="14"/>
    <ellipse cx="235" cy="200" rx="20" ry="14"/>
    <path d="M120 228 Q110 262 105 290" strokeWidth="3.5"/>
    <path d="M180 228 Q190 262 195 290" strokeWidth="3.5"/>
    <ellipse cx="105" cy="292" rx="22" ry="12"/>
    <ellipse cx="195" cy="292" rx="22" ry="12"/>
  </svg>
);
const SvgSolsikke = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<ellipse key={a} cx={150+72*Math.cos(a*Math.PI/180)} cy={125+72*Math.sin(a*Math.PI/180)} rx="22" ry="38" transform={`rotate(${a},${150+72*Math.cos(a*Math.PI/180)},${125+72*Math.sin(a*Math.PI/180)})`} fill="#ffd700" stroke="#ff8c00" strokeWidth="2.5"/>))}
    <circle cx="150" cy="125" r="52" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="3.5"/>
    <circle cx="150" cy="125" r="38" fill="#6b4423" stroke="none"/>
    {[0,45,90,135,180,225,270,315].map(a=>(<circle key={a} cx={150+22*Math.cos(a*Math.PI/180)} cy={125+22*Math.sin(a*Math.PI/180)} r="5" fill="#8B5E3C" stroke="none"/>))}
    <rect x="138" y="177" width="24" height="112" rx="10" fill="#4a7c3f" stroke="#2d6a4f" strokeWidth="3"/>
    <ellipse cx="100" cy="235" rx="42" ry="22" fill="#4a7c3f" stroke="#2d6a4f" strokeWidth="2.5" transform="rotate(-35,100,235)"/>
    <ellipse cx="200" cy="248" rx="42" ry="22" fill="#4a7c3f" stroke="#2d6a4f" strokeWidth="2.5" transform="rotate(35,200,248)"/>
  </svg>
);
const SvgPaaskelilje = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,60,120,180,240,300].map(a=>(<ellipse key={a} cx={150+58*Math.cos(a*Math.PI/180)} cy={105+58*Math.sin(a*Math.PI/180)} rx="24" ry="44" transform={`rotate(${a},${150+58*Math.cos(a*Math.PI/180)},${105+58*Math.sin(a*Math.PI/180)})`} fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>))}
    <ellipse cx="150" cy="105" rx="32" ry="24" fill="#ffd740" stroke="#f9a825" strokeWidth="3"/>
    <ellipse cx="150" cy="105" rx="22" ry="16" fill="#ffca28" stroke="none"/>
    <rect x="138" y="130" width="24" height="120" rx="10" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="3"/>
    <ellipse cx="95" cy="205" rx="50" ry="16" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2.5" transform="rotate(-25,95,205)"/>
    <ellipse cx="205" cy="215" rx="50" ry="16" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2.5" transform="rotate(20,205,215)"/>
    <circle cx="88" cy="95" r="16" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <ellipse cx="88" cy="95" rx="10" ry="8" fill="#ffd740" stroke="none"/>
    <rect x="80" y="108" width="14" height="80" rx="6" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/>
    <circle cx="212" cy="108" r="16" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <ellipse cx="212" cy="108" rx="10" ry="8" fill="#ffd740" stroke="none"/>
    <rect x="206" y="121" width="14" height="75" rx="6" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/>
  </svg>
);
const SvgCupcake = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M78 168 Q88 252 100 268 L200 268 Q212 252 222 168Z"/>
    {[88,108,128,148,168,188,208].map(x=>(<line key={x} x1={x} y1="168" x2={x-4} y2="268" strokeWidth="1.5" stroke="#c4d6ec"/>))}
    <path d="M78 168 Q82 148 90 148 L210 148 Q218 148 222 168"/>
    <path d="M150 148 Q108 148 90 120 Q88 88 115 75 Q135 65 150 72 Q165 65 185 75 Q212 88 210 120 Q192 148 150 148Z" fill="#ff9898"/>
    <path d="M118 82 Q150 95 182 82 Q172 75 150 72 Q128 75 118 82Z" fill="#ff5252" stroke="none"/>
    <path d="M108 108 Q150 122 192 108 Q180 98 150 95 Q120 98 108 108Z" fill="#ff5252" stroke="none"/>
    <circle cx="150" cy="72" r="12" fill="#ff4444" stroke="#c62828" strokeWidth="2"/>
    <ellipse cx="150" cy="60" rx="5" ry="14" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="2"/>
    <circle cx="122" cy="95" r="7" fill="white" stroke="none"/>
    <circle cx="178" cy="95" r="7" fill="white" stroke="none"/>
    <circle cx="150" cy="118" r="7" fill="white" stroke="none"/>
  </svg>
);
const SvgSopp = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M62 175 Q60 108 150 85 Q240 108 238 175Z" fill="#e53e3e" stroke="#c62828" strokeWidth="3.5"/>
    <rect x="125" y="175" width="50" height="80" rx="12"/>
    <circle cx="112" cy="130" r="16" fill="white" stroke="none"/>
    <circle cx="155" cy="110" r="14" fill="white" stroke="none"/>
    <circle cx="195" cy="128" r="16" fill="white" stroke="none"/>
    <circle cx="135" cy="158" r="11" fill="white" stroke="none"/>
    <circle cx="175" cy="155" r="11" fill="white" stroke="none"/>
    <ellipse cx="88" cy="245" rx="28" ry="18" fill="#e53e3e" stroke="#c62828" strokeWidth="2.5"/>
    <rect x="82" y="228" width="12" height="22" rx="5"/>
    <circle cx="82" cy="236" r="7" fill="white" stroke="none"/>
    <circle cx="96" cy="232" r="6" fill="white" stroke="none"/>
    <ellipse cx="218" cy="252" rx="24" ry="15" fill="#e53e3e" stroke="#c62828" strokeWidth="2.5"/>
    <rect x="212" y="237" width="12" height="20" rx="5"/>
    <circle cx="212" cy="244" r="6" fill="white" stroke="none"/>
    <circle cx="225" cy="240" r="5" fill="white" stroke="none"/>
    <ellipse cx="150" cy="285" rx="80" ry="14" fill="#d8f3dc" stroke="#52b788" strokeWidth="2"/>
  </svg>
);
const SvgTrommer = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="195" rx="110" ry="52" fill="#e8eff8" stroke="#6ba0d9" strokeWidth="3"/>
    <path d="M40 195 L40 245 Q40 258 150 258 Q260 258 260 245 L260 195"/>
    <ellipse cx="150" cy="195" rx="110" ry="52"/>
    <line x1="150" y1="143" x2="150" y2="195" strokeWidth="3"/>
    {[-35,35].map(a=>(<ellipse key={a} cx={150+60*Math.sin(a*Math.PI/180)} cy={150-60*Math.cos(a*Math.PI/180)} rx="40" ry="15" stroke="#6ba0d9" strokeWidth="2.5" fill="#d8e8f5" transform={`rotate(${a},${150+60*Math.sin(a*Math.PI/180)},${150-60*Math.cos(a*Math.PI/180)})`}/>))}
    <line x1="60" y1="245" x2="50" y2="272" strokeWidth="4"/><line x1="240" y1="245" x2="250" y2="272" strokeWidth="4"/>
    <line x1="100" y1="60" x2="128" y2="140" strokeWidth="8" stroke="#8B5E3C" strokeLinecap="round"/>
    <circle cx="100" cy="58" r="10" fill="#8B5E3C" stroke="none"/>
    <line x1="200" y1="48" x2="175" y2="135" strokeWidth="8" stroke="#8B5E3C" strokeLinecap="round"/>
    <circle cx="200" cy="46" r="10" fill="#8B5E3C" stroke="none"/>
  </svg>
);

// ── Nye unike SVGer (duplikat-erstatninger) ─────────────────────────────────
const SvgSolVaar = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,45,90,135,180,225,270,315].map(a=>(<line key={a} x1={150+72*Math.cos(a*Math.PI/180)} y1={110+72*Math.sin(a*Math.PI/180)} x2={150+92*Math.cos(a*Math.PI/180)} y2={110+92*Math.sin(a*Math.PI/180)} strokeWidth="4"/>))}
    <circle cx="150" cy="110" r="56" fill="#fff9c4"/>
    <circle cx="128" cy="100" r="8" fill={S.s}/><circle cx="172" cy="100" r="8" fill={S.s}/>
    <path d="M130 122 Q150 136 170 122" fill="none" strokeWidth="3"/>
    <path d="M40 220 Q80 180 150 185 Q220 180 260 220 Q250 270 150 275 Q50 270 40 220Z" fill="#d8f3dc" stroke="#52b788" strokeWidth="2.5"/>
    <circle cx="95" cy="208" r="14" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <circle cx="175" cy="200" r="12" fill="#ffd700" stroke="#f9a825" strokeWidth="2"/>
    <circle cx="135" cy="216" r="10" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
  </svg>
);
const SvgStrand = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="55" rx="48" ry="48" fill="#fff9c4"/>
    {[0,36,72,108,144,180,216,252,288,324].map(a=>(<line key={a} x1={150+55*Math.cos(a*Math.PI/180)} y1={55+55*Math.sin(a*Math.PI/180)} x2={150+68*Math.cos(a*Math.PI/180)} y2={55+68*Math.sin(a*Math.PI/180)} strokeWidth="3.5"/>))}
    <rect x="20" y="168" width="260" height="80" rx="8" fill="#d8e8f5"/>
    <path d="M20 168 Q90 145 150 162 Q210 145 280 168" fill="#e8f5e9" strokeWidth="2"/>
    <ellipse cx="150" cy="226" rx="120" ry="28" fill="#ffd54f" stroke="#f9a825" strokeWidth="2"/>
    <path d="M100 162 L100 108" strokeWidth="3"/><path d="M100 108 L138 128 L100 130Z" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <ellipse cx="220" cy="178" rx="28" ry="16" fill="#ff9898"/>
    <circle cx="220" cy="162" r="14"/>
    <path d="M206 170 Q220 178 234 170" fill="none" strokeWidth="2.5"/>
  </svg>
);
const SvgSolLav = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M20 180 Q150 180 280 180" strokeWidth="3" stroke="#c4d6ec"/>
    {[-60,-40,-20,0,20,40,60].map(a=>(<line key={a} x1={150+200*Math.cos((a-90)*Math.PI/180)} y1={180+200*Math.sin((a-90)*Math.PI/180)} x2={150+230*Math.cos((a-90)*Math.PI/180)} y2={180+230*Math.sin((a-90)*Math.PI/180)} strokeWidth="4" stroke="#ff8c00"/>))}
    <path d="M20 180 Q80 140 150 178 Q220 140 280 180" fill="#fff9c4" strokeWidth="2"/>
    <ellipse cx="150" cy="180" rx="80" ry="0" fill="none"/>
    <rect x="20" y="180" width="260" height="80" rx="8" fill="#e3f2fd"/>
    <path d="M40 195 Q90 188 140 195 Q190 202 250 195" fill="none" strokeWidth="2" stroke="#c4d6ec"/>
    <ellipse cx="80" cy="225" rx="40" ry="18" fill="white"/>
    <ellipse cx="200" cy="230" rx="50" ry="20" fill="white"/>
    <line x1="130" y1="155" x2="115" y2="105" strokeWidth="2.5" stroke="#6ba0d9"/>
    <line x1="170" y1="155" x2="185" y2="105" strokeWidth="2.5" stroke="#6ba0d9"/>
    <line x1="95" y1="168" x2="62" y2="135" strokeWidth="2.5" stroke="#6ba0d9"/>
  </svg>
);
const SvgBarnehage = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="30" y="120" width="240" height="140" rx="6"/>
    <polygon points="30,120 150,40 270,120"/>
    <rect x="105" y="185" width="50" height="75" rx="5" fill="#d8e8f5"/>
    <rect x="48" y="142" width="52" height="52" rx="5"/>
    <rect x="200" y="142" width="52" height="52" rx="5"/>
    <circle cx="64" cy="168" r="12"/><circle cx="86" cy="168" r="12"/>
    <circle cx="216" cy="168" r="12"/><circle cx="238" cy="168" r="12"/>
    <line x1="75" y1="142" x2="75" y2="194" strokeWidth="2"/><line x1="48" y1="168" x2="100" y2="168" strokeWidth="2"/>
    <line x1="227" y1="142" x2="227" y2="194" strokeWidth="2"/><line x1="200" y1="168" x2="252" y2="168" strokeWidth="2"/>
    <rect x="136" y="58" width="14" height="38"/>
    <rect x="128" y="52" width="30" height="14" rx="3" fill="#e53e3e"/>
    <ellipse cx="150" cy="262" rx="130" ry="12" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
  </svg>
);
const SvgDrommehus = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="55" y="145" width="190" height="130" rx="6"/>
    <polygon points="55,145 150,65 245,145"/>
    <rect x="50" y="55" width="55" height="110" rx="6"/><polygon points="50,55 77,20 105,55"/>
    <rect x="195" y="75" width="55" height="90" rx="6"/><polygon points="195,75 222,40 250,75"/>
    <rect x="118" y="200" width="44" height="75" rx="5" fill="#d8e8f5"/>
    <circle cx="77" cy="95" r="20"/><rect x="77" y="115" width="1" height="1"/>
    <circle cx="222" cy="112" r="18"/>
    <rect x="74" y="178" width="36" height="36" rx="4" fill="#fff9c4"/>
    <rect x="190" y="162" width="36" height="36" rx="4" fill="#fff9c4"/>
    <path d="M148 65 Q155 45 165 35" fill="none" strokeWidth="2.5"/>
    <circle cx="167" cy="32" r="8" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
  </svg>
);
const SvgHusNorge = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="55" y="130" width="175" height="130" rx="6"/>
    <polygon points="55,130 142,55 230,130"/>
    <rect x="110" y="190" width="45" height="70" rx="5" fill="#d8e8f5"/>
    <rect x="68" y="152" width="44" height="44" rx="4"/>
    <rect x="173" y="152" width="44" height="44" rx="4"/>
    <line x1="90" y1="152" x2="90" y2="196" strokeWidth="2"/><line x1="68" y1="174" x2="112" y2="174" strokeWidth="2"/>
    <line x1="195" y1="152" x2="195" y2="196" strokeWidth="2"/><line x1="173" y1="174" x2="217" y2="174" strokeWidth="2"/>
    <line x1="142" y1="55" x2="142" y2="18" strokeWidth="3"/>
    <rect x="142" y="18" width="30" height="22" rx="2" fill="#e53e3e" stroke="#e53e3e" strokeWidth="1"/>
    <line x1="142" y1="26" x2="172" y2="26" strokeWidth="3" stroke="white"/>
    <rect x="152" y="18" width="8" height="22" fill="white" stroke="none"/>
    <ellipse cx="142" cy="268" rx="115" ry="11" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
  </svg>
);
const SvgFamilieMai = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="88" cy="72" r="30"/><ellipse cx="88" cy="162" rx="32" ry="52"/>
    <circle cx="212" cy="72" r="30"/><ellipse cx="212" cy="162" rx="32" ry="52"/>
    <circle cx="150" cy="95" r="22"/><ellipse cx="150" cy="172" rx="22" ry="38"/>
    <ellipse cx="88" cy="228" rx="28" ry="12"/><ellipse cx="212" cy="228" rx="28" ry="12"/><ellipse cx="150" cy="218" rx="20" ry="10"/>
    <line x1="60" y1="125" x2="38" y2="88" strokeWidth="3"/><rect x="28" y="72" width="12" height="26" rx="2" fill="#e53e3e"/>
    <line x1="68" y1="125" x2="55" y2="82" strokeWidth="3"/><rect x="44" y="66" width="12" height="26" rx="2" fill="#e53e3e"/>
    <line x1="240" y1="125" x2="262" y2="88" strokeWidth="3"/><rect x="260" y="72" width="12" height="26" rx="2" fill="#e53e3e"/>
    <line x1="163" y1="138" x2="172" y2="108" strokeWidth="3"/><rect x="170" y="92" width="10" height="20" rx="2" fill="#e53e3e"/>
    <line x1="85" y1="72" x2="80" y2="52"/><line x1="80" y1="52" x2="70" y2="48"/><line x1="80" y1="52" x2="85" y2="44"/>
    <line x1="210" y1="72" x2="205" y2="52"/><line x1="205" y1="52" x2="195" y2="48"/><line x1="205" y1="52" x2="210" y2="44"/>
  </svg>
);
const SvgFamilieHjem = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="30" y="140" width="240" height="148" rx="8" fill="#fff9c4" stroke={S.s} strokeWidth="2.5"/>
    <polygon points="30,140 150,60 270,140" fill={S.f}/>
    <rect x="120" y="210" width="60" height="78" rx="6" fill="#d8e8f5"/>
    <rect x="48" y="168" width="56" height="50" rx="5"/>
    <rect x="196" y="168" width="56" height="50" rx="5"/>
    <circle cx="112" cy="100" r="26"/><ellipse cx="112" cy="176" rx="28" ry="44"/>
    <circle cx="188" cy="100" r="26"/><ellipse cx="188" cy="176" rx="28" ry="44"/>
    <circle cx="150" cy="115" r="18"/><ellipse cx="150" cy="172" rx="18" ry="32"/>
    <path d="M112 86 Q112 75 122 72 Q135 70 145 80" fill="none" strokeWidth="2" stroke="#6ba0d9"/>
  </svg>
);
const SvgFamilieEldre = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="82" cy="78" r="32"/><ellipse cx="82" cy="168" rx="34" ry="52"/>
    <circle cx="218" cy="78" r="32"/><ellipse cx="218" cy="168" rx="34" ry="52"/>
    <circle cx="150" cy="108" r="22"/><ellipse cx="150" cy="180" rx="22" ry="38"/>
    <path d="M65 78 Q62 58 68 52 L96 52 Q102 58 99 78" fill="none" strokeWidth="2.5" stroke="#c4d6ec"/>
    <path d="M201 78 Q198 58 204 52 L232 52 Q238 58 235 78" fill="none" strokeWidth="2.5" stroke="#c4d6ec"/>
    <line x1="42" y1="178" x2="28" y2="235" strokeWidth="4"/><ellipse cx="26" cy="238" rx="8" ry="5"/>
    <line x1="52" y1="178" x2="38" y2="235" strokeWidth="4"/>
    <line x1="258" y1="178" x2="272" y2="235" strokeWidth="4"/><ellipse cx="274" cy="238" rx="8" ry="5"/>
    <line x1="248" y1="178" x2="262" y2="235" strokeWidth="4"/>
    <path d="M82 122 Q116 148 150 138" fill="none" strokeWidth="3"/>
    <path d="M218 122 Q184 148 150 138" fill="none" strokeWidth="3"/>
    <path d="M130 108 Q108 98 90 108" fill="none" strokeWidth="2" stroke="#ff9898"/>
    <path d="M170 108 Q192 98 210 108" fill="none" strokeWidth="2" stroke="#ff9898"/>
  </svg>
);
const SvgVennerLeker = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="88" cy="72" r="32"/><ellipse cx="88" cy="168" rx="32" ry="52"/>
    <circle cx="212" cy="72" r="32"/><ellipse cx="212" cy="168" rx="32" ry="52"/>
    <circle cx="150" cy="200" r="28" stroke="#6ba0d9" strokeWidth="3"/>
    <path d="M122 200 Q150 185 178 200 Q165 218 150 222 Q135 218 122 200Z" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <line x1="58" y1="128" x2="38" y2="175" strokeWidth="4"/><line x1="38" y1="175" x2="18" y2="162" strokeWidth="3"/>
    <line x1="58" y1="128" x2="44" y2="178" strokeWidth="4"/>
    <line x1="242" y1="128" x2="262" y2="175" strokeWidth="4"/><line x1="262" y1="175" x2="282" y2="162" strokeWidth="3"/>
    <line x1="242" y1="128" x2="256" y2="178" strokeWidth="4"/>
    <ellipse cx="88" cy="234" rx="28" ry="12"/><ellipse cx="212" cy="234" rx="28" ry="12"/>
  </svg>
);
const SvgGladSorg = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="90" cy="95" r="62" fill="#fff9c4"/>
    <circle cx="70" cy="82" r="9" fill={S.s}/><circle cx="72" cy="80" r="3" fill="white" stroke="none"/>
    <circle cx="110" cy="82" r="9" fill={S.s}/><circle cx="112" cy="80" r="3" fill="white" stroke="none"/>
    <path d="M70 110 Q90 128 110 110" fill="none" strokeWidth="4"/>
    <path d="M35 60 L22 42 M45 52 L35 32 M55 48 L50 28" fill="none" strokeWidth="2.5" stroke="#ffd700"/>
    <circle cx="210" cy="95" r="62" fill="#d8e8f5"/>
    <circle cx="190" cy="82" r="9" fill={S.s}/><circle cx="192" cy="80" r="3" fill="white" stroke="none"/>
    <circle cx="230" cy="82" r="9" fill={S.s}/><circle cx="232" cy="80" r="3" fill="white" stroke="none"/>
    <path d="M190 118 Q210 102 230 118" fill="none" strokeWidth="4"/>
    <path d="M205 118 Q202 130 198 138" fill="none" strokeWidth="2.5" stroke="#6ba0d9"/>
    <path d="M215 118 Q218 130 222 138" fill="none" strokeWidth="2.5" stroke="#6ba0d9"/>
    <path d="M130 130 Q150 145 170 130" fill="none" strokeWidth="3"/>
    <ellipse cx="90" cy="220" rx="55" ry="45" fill="#fff9c4"/>
    <ellipse cx="210" cy="220" rx="55" ry="45" fill="#d8e8f5"/>
    <path d="M145 200 L155 200" strokeWidth="3"/>
  </svg>
);
const SvgUgleHost = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="170" rx="72" ry="85"/>
    <ellipse cx="110" cy="90" r="38"/><ellipse cx="190" cy="90" r="38"/>
    <circle cx="110" cy="88" r="20" fill="#fff9c4"/><circle cx="110" cy="88" r="12" fill={S.s}/><circle cx="113" cy="85" r="4" fill="white" stroke="none"/>
    <circle cx="190" cy="88" r="20" fill="#fff9c4"/><circle cx="190" cy="88" r="12" fill={S.s}/><circle cx="193" cy="85" r="4" fill="white" stroke="none"/>
    <path d="M135 115 L150 130 L165 115" fill={S.s}/>
    <path d="M78 200 Q52 195 30 212" fill="none" strokeWidth="3.5"/>
    <path d="M222 200 Q248 195 270 212" fill="none" strokeWidth="3.5"/>
    <ellipse cx="112" cy="262" rx="32" ry="14"/><ellipse cx="188" cy="262" rx="32" ry="14"/>
    {[40,60,80,100,120,140,160,220,240,260].map(x=>(<ellipse key={x} cx={x} cy={x<200?248:252} rx="14" ry="8" fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5" transform={`rotate(${x<150?-20:20},${x},${x<200?248:252})`}/>))}
  </svg>
);
const SvgUgleHalloween = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="220" cy="48" r="38" fill="#334155" stroke={S.s} strokeWidth="2.5"/>
    <circle cx="236" cy="38" r="14" fill={S.f}/>
    <ellipse cx="150" cy="175" rx="72" ry="82"/>
    <ellipse cx="110" cy="92" r="36"/><ellipse cx="190" cy="92" r="36"/>
    <circle cx="110" cy="90" r="18" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/><circle cx="110" cy="90" r="11" fill={S.s}/>
    <circle cx="190" cy="90" r="18" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/><circle cx="190" cy="90" r="11" fill={S.s}/>
    <path d="M135 118 L150 132 L165 118" fill={S.s}/>
    <path d="M78 200 Q52 192 30 208" fill="none" strokeWidth="3.5"/>
    <path d="M222 200 Q248 192 270 208" fill="none" strokeWidth="3.5"/>
    <ellipse cx="112" cy="260" rx="32" ry="14"/><ellipse cx="188" cy="260" rx="32" ry="14"/>
    <path d="M48 130 Q30 115 20 95 Q38 102 48 118" fill={S.s} stroke={S.s}/>
    <path d="M252 130 Q270 115 280 95 Q262 102 252 118" fill={S.s} stroke={S.s}/>
    <path d="M42 185 Q22 175 15 155" fill="none" strokeWidth="2.5"/>
  </svg>
);
const SvgAdventlys = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[[68,0],[108,0],[188,0],[228,0]].map(([x,_],i)=>(
      <g key={x}>
        <rect x={x-12} y={120+i%2*10} width="24" height={i===0?120:100} rx="6" fill={i===0?"#ffd700":"white"}/>
        <ellipse cx={x} cy={112+i%2*10} rx="10" ry="16" fill={i===0?"#ff8c00":"#ffd700"} stroke="none"/>
      </g>
    ))}
    <rect x="30" y="235" width="240" height="18" rx="8" fill="#52b788" stroke="#2d6a4f" strokeWidth="2.5"/>
    <rect x="20" y="248" width="260" height="14" rx="6" fill="#2d6a4f" stroke={S.s} strokeWidth="2"/>
    <circle cx="150" cy="58" r="32" fill="#ffd700" stroke="#ff8c00" strokeWidth="3"/>
    {[0,72,144,216,288].map(a=>(<path key={a} d={`M${150+28*Math.cos(a*Math.PI/180)} ${58+28*Math.sin(a*Math.PI/180)} L${150+44*Math.cos((a+5)*Math.PI/180)} ${58+44*Math.sin((a+5)*Math.PI/180)} L${150+44*Math.cos((a-5)*Math.PI/180)} ${58+44*Math.sin((a-5)*Math.PI/180)}Z`} fill="#ffd700" stroke="none"/>))}
  </svg>
);
const SvgStjerneSkudd = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="50" cy="50" r="14" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <path d="M50 50 L260 240" strokeWidth="3" stroke="#ffd700" strokeDasharray="12 6"/>
    <circle cx="145" cy="70" r="10" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <path d="M145 70 L280 200" strokeWidth="2.5" stroke="#ffd700" strokeDasharray="8 5"/>
    <circle cx="245" cy="42" r="8" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <path d="M245 42 L90 230" strokeWidth="2" stroke="#ffd700" strokeDasharray="6 4"/>
    {[[260,240,22],[280,200,18],[90,230,16],[180,160,12],[80,180,14],[210,90,12]].map(([x,y,r],i)=>(
      <polygon key={i} points={[0,1,2,3,4].map(n=>`${x+r*Math.cos((n*72-90)*Math.PI/180)},${y+r*Math.sin((n*72-90)*Math.PI/180)}`).join(' ')} fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5"/>
    ))}
    <rect x="20" y="258" width="260" height="22" rx="8" fill="#1a2c45"/>
    <path d="M20 258 Q150 240 280 258" fill="#2c3e6e"/>
  </svg>
);
const SvgSommerfuglVaar = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="140" rx="14" ry="55"/>
    <ellipse cx="88" cy="95" rx="72" ry="58" transform="rotate(-18,88,95)" fill="#d8f3dc"/>
    <ellipse cx="212" cy="95" rx="72" ry="58" transform="rotate(18,212,95)" fill="#d8f3dc"/>
    <ellipse cx="84" cy="190" rx="54" ry="42" transform="rotate(15,84,190)" fill="#d8f3dc"/>
    <ellipse cx="216" cy="190" rx="54" ry="42" transform="rotate(-15,216,190)" fill="#d8f3dc"/>
    <circle cx="108" cy="88" r="18" fill="#fff9c4"/><circle cx="192" cy="88" r="18" fill="#fff9c4"/>
    <circle cx="104" cy="185" r="14" fill="#fce8e8"/><circle cx="196" cy="185" r="14" fill="#fce8e8"/>
    <path d="M143 82 Q134 62 119 54" fill="none" strokeWidth="2.5"/>
    <path d="M157 82 Q166 62 181 54" fill="none" strokeWidth="2.5"/>
    <circle cx="118" cy="52" r="5" fill={S.s}/><circle cx="182" cy="52" r="5" fill={S.s}/>
    <ellipse cx="150" cy="260" rx="100" ry="14" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
    <circle cx="90" cy="250" r="8" fill="#ffd700" stroke="#f9a825" strokeWidth="1.5"/>
    <circle cx="210" cy="245" r="8" fill="#ff9898" stroke="#c62828" strokeWidth="1.5"/>
  </svg>
);
const SvgSommerfuglMany = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[[70,65,0.7],[220,55,0.7],[150,130,1],[60,190,0.65],[240,185,0.65],[130,52,0.55],[200,160,0.6]].map(([cx,cy,sc],i)=>(
      <g key={i} transform={`translate(${cx},${cy}) scale(${sc})`}>
        <ellipse cx="0" cy="0" rx="12" ry="8"/>
        <ellipse cx="-26" cy="-16" rx="32" ry="24" transform="rotate(-20,-26,-16)" fill={["#d8f3dc","#fff9c4","#fce8e8","#e3f2fd","#d8f3dc","#fff9c4","#fce8e8"][i]}/>
        <ellipse cx="26" cy="-16" rx="32" ry="24" transform="rotate(20,26,-16)" fill={["#d8f3dc","#fff9c4","#fce8e8","#e3f2fd","#d8f3dc","#fff9c4","#fce8e8"][i]}/>
        <ellipse cx="-24" cy="18" rx="24" ry="18" transform="rotate(15,-24,18)" fill={["#d8f3dc","#fff9c4","#fce8e8","#e3f2fd","#d8f3dc","#fff9c4","#fce8e8"][i]}/>
        <ellipse cx="24" cy="18" rx="24" ry="18" transform="rotate(-15,24,18)" fill={["#d8f3dc","#fff9c4","#fce8e8","#e3f2fd","#d8f3dc","#fff9c4","#fce8e8"][i]}/>
      </g>
    ))}
    <rect x="20" y="248" width="260" height="22" rx="10" fill="#d8f3dc" stroke="#52b788" strokeWidth="2"/>
  </svg>
);
const SvgKaninEng = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="208" rx="68" ry="54"/>
    <circle cx="150" cy="150" r="52"/>
    <ellipse cx="118" cy="88" rx="20" ry="55"/><ellipse cx="118" cy="94" rx="10" ry="38" fill="#fce8e8" stroke="none"/>
    <ellipse cx="182" cy="88" rx="20" ry="55"/><ellipse cx="182" cy="94" rx="10" ry="38" fill="#fce8e8" stroke="none"/>
    <circle cx="130" cy="148" r="9" fill={S.s}/><circle cx="170" cy="148" r="9" fill={S.s}/>
    <ellipse cx="150" cy="162" rx="7" ry="5" fill="#f9a8b8" stroke="none"/>
    <path d="M142 168 Q150 175 158 168" fill="none" strokeWidth="2"/>
    <circle cx="214" cy="205" r="20"/>
    <ellipse cx="100" cy="262" rx="36" ry="15"/><ellipse cx="200" cy="262" rx="36" ry="15"/>
    <ellipse cx="50" cy="285" rx="50" ry="14" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
    <ellipse cx="250" cy="285" rx="50" ry="14" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
    <circle cx="52" cy="252" r="9" fill="#ffd700" stroke="#f9a825" strokeWidth="1.5"/>
    <circle cx="235" cy="248" r="9" fill="#ff9898" stroke="#c62828" strokeWidth="1.5"/>
    <circle cx="80" cy="245" r="7" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
  </svg>
);
const SvgKaninEgg = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="130" cy="198" rx="58" ry="50"/>
    <circle cx="130" cy="148" r="46"/>
    <ellipse cx="104" cy="88" rx="18" ry="50"/><ellipse cx="104" cy="93" rx="9" ry="35" fill="#fce8e8" stroke="none"/>
    <ellipse cx="156" cy="88" rx="18" ry="50"/><ellipse cx="156" cy="93" rx="9" ry="35" fill="#fce8e8" stroke="none"/>
    <circle cx="116" cy="145" r="8" fill={S.s}/><circle cx="144" cy="145" r="8" fill={S.s}/>
    <ellipse cx="130" cy="158" rx="6" ry="4" fill="#f9a8b8" stroke="none"/>
    <line x1="72" y1="198" x2="56" y2="238" strokeWidth="3"/>
    <ellipse cx="88" cy="252" rx="28" ry="12"/><ellipse cx="172" cy="252" rx="28" ry="12"/>
    <path d="M185 145 Q200 135 218 145 Q228 158 218 170 Q200 180 185 170 Q178 158 185 145Z" fill="#ffd700" stroke="#f9a825" strokeWidth="2"/>
    <path d="M230 110 Q248 100 262 112 Q270 124 260 134 Q248 142 232 132 Q224 122 230 110Z" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
    <path d="M195 220 Q210 210 228 222 Q235 232 226 240 Q212 248 198 238 Q192 228 195 220Z" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2"/>
    <ellipse cx="200" cy="175" rx="14" ry="14" fill="#52b788" stroke="#2d6a4f" strokeWidth="2"/>
  </svg>
);
const SvgFuglV = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[[150,60],[112,85],[76,112],[42,140],[188,85],[224,112],[260,140]].map(([x,y],i)=>(
      <g key={i}>
        <ellipse cx={x} cy={y} rx="24" ry="14" transform={`rotate(${i<4?-10:10},${x},${y})`}/>
        <circle cx={x+(i===0?12:i<4?10:-10)} cy={y-6} r="10"/>
        <path d={`M${x-20} ${y} Q${x-10} ${y-12} ${x} ${y}`} fill="none" strokeWidth="3"/>
        <path d={`M${x+20} ${y} Q${x+10} ${y-12} ${x} ${y}`} fill="none" strokeWidth="3"/>
      </g>
    ))}
    <path d="M30 200 Q150 170 270 200" stroke="#52b788" strokeWidth="2" fill="none"/>
    <ellipse cx="150" cy="265" rx="140" ry="14" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>
  </svg>
);
const SvgFuglSang = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="30" y="145" width="160" height="18" rx="8" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="2.5"/>
    <ellipse cx="175" cy="122" rx="88" ry="58"/>
    <circle cx="238" cy="88" r="44"/>
    <ellipse cx="264" cy="82" rx="18" ry="10" fill="#ffd700" stroke="#f9a825" strokeWidth="2" transform="rotate(-18,264,82)"/>
    <circle cx="248" cy="75" r="8" fill={S.s}/><circle cx="250" cy="73" r="3" fill="white" stroke="none"/>
    <path d="M72 132 Q52 108 44 118 Q56 108 72 118Z" fill="#d8f3dc"/>
    <path d="M72 162 Q52 186 44 176 Q56 186 72 176Z" fill="#d8f3dc"/>
    <line x1="132" y1="152" x2="110" y2="248"/><line x1="164" y1="152" x2="186" y2="248"/>
    <line x1="110" y1="248" x2="88" y2="248" strokeWidth="3"/><line x1="186" y1="248" x2="208" y2="248" strokeWidth="3"/>
    {[[260,38],[278,52],[272,22],[290,40]].map(([x,y])=>(<text key={x+y} x={x} y={y} fontSize="20" fill={S.s} stroke="none" fontFamily="serif">♪</text>))}
  </svg>
);
const SvgRumpetroll = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="135" rx="80" ry="58"/>
    <path d="M228 148 Q265 165 278 152 Q265 142 255 155 Q275 152 278 168 Q265 158 258 168" strokeWidth="3" fill="none"/>
    <circle cx="122" cy="120" r="16" fill="#d8f3dc"/><circle cx="122" cy="120" r="9" fill={S.s}/><circle cx="124" cy="118" r="3" fill="white" stroke="none"/>
    <circle cx="178" cy="120" r="16" fill="#d8f3dc"/><circle cx="178" cy="120" r="9" fill={S.s}/><circle cx="180" cy="118" r="3" fill="white" stroke="none"/>
    <path d="M130 152 Q150 162 170 152" fill="none" strokeWidth="3"/>
    <path d="M88 185 Q58 205 45 240 Q70 225 84 215" strokeWidth="3"/>
    <path d="M84 215 Q92 220 98 212" strokeWidth="2.5"/>
    <path d="M212 185 Q242 205 255 240 Q230 225 216 215" strokeWidth="3"/>
    <path d="M216 215 Q208 220 202 212" strokeWidth="2.5"/>
    <ellipse cx="100" cy="245" rx="88" ry="28" fill="#d8f3dc" stroke="#52b788" strokeWidth="2"/>
    <ellipse cx="195" cy="252" rx="55" ry="18" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="1.5"/>
    <path d="M115 248 Q140 238 165 248" fill="none" strokeWidth="2" stroke="#52b788"/>
  </svg>
);
const SvgFroskBad = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="175" rx="115" ry="72" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2.5"/>
    <path d="M35 210 Q90 195 150 205 Q210 195 265 210" fill="none" strokeWidth="2" stroke="#6ba0d9"/>
    <ellipse cx="150" cy="148" rx="72" ry="58"/>
    <circle cx="100" cy="105" r="28"/><circle cx="100" cy="105" r="16" fill="#d8f3dc"/>
    <circle cx="200" cy="105" r="28"/><circle cx="200" cy="105" r="16" fill="#d8f3dc"/>
    <circle cx="100" cy="103" r="9" fill={S.s}/><circle cx="102" cy="101" r="3" fill="white" stroke="none"/>
    <circle cx="200" cy="103" r="9" fill={S.s}/><circle cx="202" cy="101" r="3" fill="white" stroke="none"/>
    <path d="M122 162 Q150 172 178 162" fill="none" strokeWidth="3"/>
    <path d="M38 175 Q20 168 15 155" fill="none" strokeWidth="3"/>
    <path d="M262 175 Q280 168 285 155" fill="none" strokeWidth="3"/>
    <circle cx="72" cy="228" r="8" fill="#ffd700" stroke="#f9a825" strokeWidth="2"/>
    <circle cx="228" cy="232" r="8" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
  </svg>
);
const SvgFiskestang = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M48 25 Q100 80 100 170" fill="none" strokeWidth="4" stroke="#8B5E3C"/>
    <circle cx="48" cy="25" r="8" fill="#8B5E3C" stroke="none"/>
    <line x1="100" y1="40" x2="248" y2="168" strokeWidth="2" stroke="#c4d6ec" strokeDasharray="6 4"/>
    <circle cx="248" cy="168" r="10" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <line x1="248" y1="178" x2="248" y2="210" strokeWidth="2" stroke="#c4d6ec"/>
    <ellipse cx="240" cy="218" rx="16" ry="10" fill="#ff8c42" stroke="#e65100" strokeWidth="2"/>
    <rect x="20" y="198" width="260" height="60" rx="8" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2.5"/>
    <path d="M20 215 Q90 205 150 215 Q210 205 280 215" fill="none" strokeWidth="2" stroke="#6ba0d9"/>
    <ellipse cx="110" cy="228" rx="40" ry="22"/>
    <circle cx="88" cy="220" r="7" fill={S.s}/><circle cx="90" cy="218" r="2.5" fill="white" stroke="none"/>
    <path d="M90 228 Q110 236 130 228" fill="none" strokeWidth="2.5"/>
    <path d="M148 218 Q168 208 175 218 Q168 205 162 216Z"/>
  </svg>
);
const SvgHavbunn = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="0" y="0" width="300" height="280" rx="0" fill="#d8e8f5" stroke="none"/>
    <ellipse cx="150" cy="135" rx="90" ry="58" fill={S.f}/>
    <circle cx="72" cy="102" r="10" fill={S.s}/><circle cx="74" cy="100" r="3.5" fill="white" stroke="none"/>
    <path d="M258 135 Q282 118 288 100 Q278 115 272 125 Q288 125 288 140 Q278 130 272 140" strokeWidth="3"/>
    <circle cx="168" cy="62" r="28" fill={S.f}/>
    <circle cx="180" cy="56" r="7" fill={S.s}/>
    <ellipse cx="178" cy="60" rx="13" ry="7" fill="#d8f3dc"/>
    <path d="M140 62 Q128 52 120 62" fill="none" strokeWidth="3"/>
    {[[50,235],[90,250],[130,240],[170,252],[210,238],[250,248]].map(([x,y])=>(<ellipse key={x} cx={x} cy={y} rx="22" ry="14" fill="#52b788" stroke="#2d6a4f" strokeWidth="2"/>))}
    <path d="M50 238 Q52 225 56 218 Q52 226 58 218 Q56 227 60 220" fill="none" strokeWidth="2" stroke="#2d6a4f"/>
    <ellipse cx="200" cy="220" rx="24" ry="14" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
    <line x1="185" y1="215" x2="215" y2="215" strokeWidth="2.5"/><line x1="200" y1="206" x2="200" y2="224" strokeWidth="2.5"/>
    {[[80,185],[150,178],[230,188]].map(([x,y])=>(<circle key={x} cx={x} cy={y} r="4" fill="white" opacity="0.7" stroke="none"/>))}
  </svg>
);
const SvgBjornBaer = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="80" cy="82" r="34"/><circle cx="80" cy="82" r="18" fill="#f9c5b5" stroke="none"/>
    <circle cx="220" cy="82" r="34"/><circle cx="220" cy="82" r="18" fill="#f9c5b5" stroke="none"/>
    <circle cx="150" cy="148" r="78"/>
    <ellipse cx="150" cy="173" rx="36" ry="28" fill="#f9d5c5"/>
    <circle cx="120" cy="132" r="11" fill={S.s}/><circle cx="180" cy="132" r="11" fill={S.s}/>
    <ellipse cx="150" cy="163" rx="11" ry="8" fill={S.s}/>
    <path d="M138 175 Q150 186 162 175" fill="none" strokeWidth="2.5"/>
    <ellipse cx="150" cy="255" rx="72" ry="52"/>
    <path d="M220 220 Q250 190 268 200" fill="none" strokeWidth="4"/>
    <circle cx="255" cy="175" r="12" fill="#4a1942" stroke="#2d1a28" strokeWidth="2"/>
    <circle cx="278" cy="185" r="10" fill="#4a1942" stroke="#2d1a28" strokeWidth="2"/>
    <circle cx="268" cy="162" r="10" fill="#4a1942" stroke="#2d1a28" strokeWidth="2"/>
    <circle cx="285" cy="170" r="8" fill="#ff8c42" stroke="#e65100" strokeWidth="2"/>
    <path d="M265 205 Q270 220 268 235" fill="none" strokeWidth="3.5"/>
    <ellipse cx="102" cy="295" rx="30" ry="12"/><ellipse cx="198" cy="295" rx="30" ry="12"/>
  </svg>
);
const SvgBjornHi = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M18 200 Q50 155 100 145 Q150 138 200 145 Q250 155 282 200 Q260 265 150 270 Q40 265 18 200Z" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="3"/>
    <path d="M55 200 Q85 170 140 165 Q195 170 225 200 Q210 250 150 255 Q90 250 55 200Z" fill="#c8956c" stroke="#8B5E3C" strokeWidth="2.5"/>
    <circle cx="115" cy="185" r="30"/><circle cx="115" cy="185" r="16" fill="#f9c5b5" stroke="none"/>
    <circle cx="165" cy="185" r="30"/>
    <circle cx="115" cy="182" r="10" fill={S.s}/><circle cx="165" cy="182" r="10" fill={S.s}/>
    <ellipse cx="140" cy="200" rx="12" ry="9" fill={S.s}/>
    <path d="M126 210 Q140 220 154 210" fill="none" strokeWidth="2.5"/>
    <path d="M50 145 Q30 100 55 70 Q72 90 78 118" fill="#e8f5e9" strokeWidth="2.5"/>
    <path d="M250 145 Q270 100 245 70 Q228 90 222 118" fill="#e8f5e9" strokeWidth="2.5"/>
    <ellipse cx="150" cy="58" rx="80" ry="32" fill="#e8f5e9" stroke="#52b788" strokeWidth="2"/>
  </svg>
);
const SvgKylling = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M95 235 Q80 200 110 180 Q130 160 150 165 Q170 160 190 180 Q220 200 205 235 Q185 265 150 270 Q115 265 95 235Z" fill="#ffd700" stroke="#ff8c00" strokeWidth="3"/>
    <path d="M78 255 Q58 242 72 255 Q58 258 78 260" strokeWidth="2.5" fill="#ff8c00" stroke="#ff8c00"/>
    <path d="M222 255 Q242 242 228 255 Q242 258 222 260" strokeWidth="2.5" fill="#ff8c00" stroke="#ff8c00"/>
    <circle cx="128" cy="202" r="10" fill={S.s}/><circle cx="130" cy="200" r="3.5" fill="white" stroke="none"/>
    <circle cx="172" cy="202" r="10" fill={S.s}/><circle cx="174" cy="200" r="3.5" fill="white" stroke="none"/>
    <path d="M130 225 Q150 235 170 225" fill="none" strokeWidth="2.5"/>
    <path d="M140 215 L142 205 L148 215 L152 205 L158 215" fill="none" strokeWidth="2" stroke="#ff8c00"/>
    <path d="M80 265 Q82 225 95 210" strokeWidth="3"/>
    <path d="M220 265 Q218 225 205 210" strokeWidth="3"/>
    <path d="M90 278 Q150 290 210 278" strokeWidth="3" fill="none"/>
    <path d="M55 210 Q88 195 95 210 Q70 215 80 235" fill={S.f} strokeWidth="2.5"/>
    <path d="M245 210 Q212 195 205 210 Q230 215 220 235" fill={S.f} strokeWidth="2.5"/>
  </svg>
);
const SvgHostRegn = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="90" cy="72" r="52" fill="#c4d6ec"/><ellipse cx="150" cy="58" r="60" fill="#c4d6ec"/><ellipse cx="210" cy="72" r="52" fill="#c4d6ec"/>
    <rect x="30" y="92" width="240" height="52" rx="26" fill="#c4d6ec"/>
    {[60,90,120,150,180,210,240].map(x=>(<line key={x} x1={x} y1="155" x2={x-8} y2="195" strokeWidth="2" stroke="#6ba0d9"/>))}
    {[75,105,135,165,195,225].map(x=>(<line key={x} x1={x} y1="175" x2={x-8} y2="215" strokeWidth="2" stroke="#6ba0d9"/>))}
    <ellipse cx="80" cy="235" rx="20" ry="8" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="1.5"/>
    <ellipse cx="160" cy="245" rx="22" ry="8" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="1.5"/>
    <ellipse cx="238" cy="238" rx="18" ry="8" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="1.5"/>
    {[[65,240],[130,255],[200,252],[258,244]].map(([x,y],i)=>(<path key={i} d={`M${x} ${y} Q${x+5} ${y-10} ${x+10} ${y}`} fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>))}
    {[[65,240],[130,255],[200,252],[258,244]].map(([x,y],i)=>(<path key={"s"+i} d={`M${x+2} ${y+5} Q${x+8} ${y+14} ${x+12} ${y+2}`} fill="#8B5E3C" stroke="#5a3e28" strokeWidth="2"/>))}
  </svg>
);
const SvgIskremBoks = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="55" y="148" width="190" height="108" rx="12"/>
    <ellipse cx="150" cy="148" rx="95" ry="28"/>
    <path d="M55 148 Q55 168 150 176 Q245 168 245 148"/>
    <ellipse cx="150" cy="128" rx="85" ry="38" fill="#ff9898" stroke="#c62828" strokeWidth="2.5"/>
    <ellipse cx="150" cy="118" rx="72" ry="30" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <ellipse cx="150" cy="108" rx="58" ry="24" fill="#4299e1" stroke="#2c5b8e" strokeWidth="2"/>
    <ellipse cx="150" cy="100" rx="44" ry="18" fill="#52b788" stroke="#2d6a4f" strokeWidth="2"/>
    <ellipse cx="150" cy="93" rx="30" ry="12" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
    <circle cx="150" cy="85" r="10" fill="#c62828" stroke="#8b1a1a" strokeWidth="2"/>
    <circle cx="95" cy="188" r="8" fill={S.s} stroke="none"/><circle cx="125" cy="198" r="8" fill={S.s} stroke="none"/><circle cx="175" cy="195" r="8" fill={S.s} stroke="none"/><circle cx="205" cy="183" r="8" fill={S.s} stroke="none"/>
  </svg>
);
const SvgBursdagKake = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="235" rx="108" ry="32"/>
    <path d="M42 200 L42 235 Q42 267 150 267 Q258 267 258 235 L258 200"/>
    <ellipse cx="150" cy="200" rx="108" ry="32" fill="#ff9898"/>
    <ellipse cx="150" cy="165" rx="95" ry="28"/>
    <path d="M55 140 L55 165 Q55 193 150 193 Q245 193 245 165 L245 140"/>
    <ellipse cx="150" cy="140" rx="95" ry="28" fill="#ffd700"/>
    <ellipse cx="150" cy="110" rx="80" ry="24"/>
    <path d="M70 88 L70 110 Q70 134 150 134 Q230 134 230 110 L230 88"/>
    <ellipse cx="150" cy="88" rx="80" ry="24" fill="#d8e8f5"/>
    <path d="M42 218 Q95 208 150 218 Q205 208 258 218" fill="none" strokeWidth="2.5" stroke="#c62828"/>
    <path d="M55 153 Q100 143 150 153 Q200 143 245 153" fill="none" strokeWidth="2.5" stroke="#ff8c00"/>
    {[90,122,150,178,210].map((x,i)=>(<g key={x}><rect x={x-5} y={50} width="10" height="32" rx="4" fill={["#ff5252","#ffd700","#52b788","#4299e1","#9b59b6"][i]}/><ellipse cx={x} cy={46} rx="5" ry="9" fill="#ff8c00" stroke="none"/></g>))}
  </svg>
);
const SvgSvartkatt = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="40" y="185" width="220" height="28" rx="5" fill="#5a3e28" stroke="#3d2b1a" strokeWidth="2.5"/>
    <rect x="80" y="180" width="140" height="12" rx="4" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="2"/>
    <circle cx="150" cy="135" r="68"/>
    <path d="M98 88 L88 42 L118 78" fill={S.f} stroke={S.s} strokeWidth="3"/>
    <path d="M202 88 L212 42 L182 78" fill={S.f} stroke={S.s} strokeWidth="3"/>
    <circle cx="120" cy="125" r="18" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/><circle cx="120" cy="125" r="9" fill="#334155" stroke="none"/>
    <circle cx="180" cy="125" r="18" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/><circle cx="180" cy="125" r="9" fill="#334155" stroke="none"/>
    <ellipse cx="150" cy="148" rx="8" ry="6" fill="#f9a8b8" stroke="none"/>
    <path d="M138 155 Q150 163 162 155" fill="none" strokeWidth="2.5"/>
    <line x1="95" y1="150" x2="145" y2="148" strokeWidth="1.5"/><line x1="95" y1="157" x2="145" y2="155" strokeWidth="1.5"/>
    <line x1="205" y1="150" x2="155" y2="148" strokeWidth="1.5"/><line x1="205" y1="157" x2="155" y2="155" strokeWidth="1.5"/>
    <path d="M218 175 Q255 165 272 185 Q260 175 258 190" fill="none" strokeWidth="3"/>
    <ellipse cx="110" cy="262" rx="30" ry="14"/><ellipse cx="190" cy="262" rx="30" ry="14"/>
    <ellipse cx="150" cy="235" rx="68" ry="48"/>
  </svg>
);
const SvgMusHalloween = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="105" cy="82" r="30"/><circle cx="195" cy="82" r="30"/>
    <circle cx="150" cy="148" r="66"/>
    <circle cx="124" cy="138" r="10" fill={S.s}/><circle cx="176" cy="138" r="10" fill={S.s}/>
    <ellipse cx="150" cy="155" rx="8" ry="6" fill="#f9a8b8" stroke="none"/>
    <path d="M140 163 Q150 170 160 163" fill="none" strokeWidth="2"/>
    <line x1="95" y1="153" x2="138" y2="153" strokeWidth="1.5"/><line x1="205" y1="153" x2="162" y2="153" strokeWidth="1.5"/>
    <path d="M185 185 Q230 190 258 215" strokeWidth="4"/>
    <ellipse cx="150" cy="255" rx="58" ry="44"/>
    <path d="M110 218 Q95 235 102 255" strokeWidth="3"/><path d="M190 218 Q205 235 198 255" strokeWidth="3"/>
    <ellipse cx="105" cy="278" rx="28" ry="12"/><ellipse cx="195" cy="278" rx="28" ry="12"/>
    <path d="M112 225 Q100 215 108 205 Q118 215 115 228" fill="#ff8c42" stroke="#e65100" strokeWidth="2"/>
    <path d="M188 225 Q200 215 192 205 Q182 215 185 228" fill="#ff8c42" stroke="#e65100" strokeWidth="2"/>
    <rect x="128" y="208" width="44" height="32" rx="6" fill="#ff9898"/>
    <circle cx="138" cy="224" r="6"/><circle cx="162" cy="224" r="6"/>
  </svg>
);
const SvgPingvinFam = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="88" cy="185" rx="46" ry="72"/>
    <ellipse cx="88" cy="175" rx="28" ry="42" fill="#c4d6ec"/>
    <circle cx="88" cy="110" r="38"/>
    <circle cx="74" cy="102" r="9" fill={S.s}/><circle cx="76" cy="100" r="3" fill="white" stroke="none"/>
    <circle cx="102" cy="102" r="9" fill={S.s}/><circle cx="104" cy="100" r="3" fill="white" stroke="none"/>
    <path d="M55 185 Q38 198 32 220" strokeWidth="3.5"/><path d="M121 185 Q138 198 144 220" strokeWidth="3.5"/>
    <ellipse cx="212" cy="195" rx="46" ry="72"/>
    <ellipse cx="212" cy="185" rx="28" ry="42" fill="#c4d6ec"/>
    <circle cx="212" cy="120" r="38"/>
    <circle cx="198" cy="112" r="9" fill={S.s}/><circle cx="226" cy="112" r="9" fill={S.s}/>
    <path d="M179 195 Q162 208 156 230" strokeWidth="3.5"/><path d="M245 195 Q262 208 268 230" strokeWidth="3.5"/>
    <ellipse cx="150" cy="228" rx="28" ry="44"/>
    <ellipse cx="150" cy="222" rx="16" ry="26" fill="#c4d6ec"/>
    <circle cx="150" cy="183" r="24"/>
    <circle cx="142" cy="178" r="6" fill={S.s}/><circle cx="158" cy="178" r="6" fill={S.s}/>
    <ellipse cx="80" cy="278" rx="34" ry="12"/><ellipse cx="220" cy="278" rx="34" ry="12"/><ellipse cx="150" cy="282" rx="24" ry="10"/>
  </svg>
);
const SvgRobot2 = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="22" rx="14" ry="14"/>
    <line x1="150" y1="36" x2="150" y2="65" strokeWidth="3"/>
    <rect x="78" y="65" width="144" height="108" rx="22"/>
    <ellipse cx="118" cy="107" rx="22" ry="22"/><ellipse cx="118" cy="107" rx="14" ry="14" fill="#d8e8f5"/><circle cx="118" cy="107" r="8" fill={S.s}/>
    <ellipse cx="182" cy="107" rx="22" ry="22"/><ellipse cx="182" cy="107" rx="14" ry="14" fill="#d8e8f5"/><circle cx="182" cy="107" r="8" fill={S.s}/>
    <path d="M118 142 L135 152 L150 142 L165 152 L182 142" fill="none" strokeWidth="3"/>
    <rect x="62" y="188" width="176" height="112" rx="18"/>
    <circle cx="116" cy="232" r="22"/><circle cx="116" cy="232" r="14" fill="#d8e8f5"/>
    <circle cx="184" cy="232" r="22"/><circle cx="184" cy="232" r="14" fill="#d8e8f5"/>
    <line x1="116" y1="268" x2="184" y2="268" strokeWidth="3"/>
    <rect x="14" y="190" width="46" height="90" rx="14"/>
    <rect x="240" y="190" width="46" height="90" rx="14"/>
    <path d="M14 218 Q5 235 14 252" fill="none" strokeWidth="2.5"/>
    <path d="M286 218 Q295 235 286 252" fill="none" strokeWidth="2.5"/>
    <rect x="90" y="297" width="48" height="22" rx="8"/><rect x="162" y="297" width="48" height="22" rx="8"/>
  </svg>
);
const SvgBallongMany = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[[75,80,"#ff9898"],[150,55,"#ffd700"],[225,80,"#52b788"],[50,155,"#4299e1"],[250,155,"#9b59b6"],[110,140,"#ff8c42"],[190,135,"#ff9898"]].map(([cx,cy,fill],i)=>(
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx="32" ry="38" fill={fill} stroke={S.s} strokeWidth="2.5"/>
        <path d={`M${cx-4} ${cy+38} Q${cx} ${cy+50} ${cx+4} ${cy+38}`} fill="none" strokeWidth="2"/>
        <line x1={cx} y1={cy+50} x2={cx+((i%3-1)*8)} y2="280" strokeWidth="1.5" stroke="#c4d6ec"/>
      </g>
    ))}
    <line x1="145" y1="275" x2="155" y2="275" strokeWidth="4"/>
    <ellipse cx="150" cy="288" rx="50" ry="10" fill="#f5f9fd"/>
  </svg>
);
const SvgEpletre = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="132" y="202" width="36" height="72" rx="8" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="3"/>
    <circle cx="150" cy="162" r="68" fill="#4a7c3f" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="108" cy="182" r="52" fill="#52b788" stroke="#2d6a4f" strokeWidth="3"/>
    <circle cx="192" cy="182" r="52" fill="#52b788" stroke="#2d6a4f" strokeWidth="3"/>
    <circle cx="150" cy="195" r="48" fill="#6ab04c" stroke="#2d6a4f" strokeWidth="3"/>
    {[[118,142],[162,128],[145,168],[100,162],[195,155]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r={i===0||i===3?16:i===1?14:12} fill="#ff5252" stroke="#c62828" strokeWidth="2"/>))}
    {[[118,142],[162,128],[145,168],[100,162],[195,155]].map(([cx,cy],i)=>(<line key={"s"+i} x1={cx} y1={cy-(i===0||i===3?16:i===1?14:12)} x2={cx+4} y2={cy-(i===0||i===3?24:i===1?22:20)} strokeWidth="2" stroke="#2d6a4f"/>))}
  </svg>
);
const SvgTreVaar = ()=>(
  <svg viewBox="0 0 300 310" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="126" y="222" width="48" height="76" rx="8" fill="#c8956c" stroke="#8B5E3C" strokeWidth="3"/>
    <circle cx="150" cy="188" r="66" fill="#d8f3dc" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="108" cy="208" r="50" fill="#e8f5e9" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="192" cy="208" r="50" fill="#e8f5e9" stroke="#2d6a4f" strokeWidth="3.5"/>
    <circle cx="150" cy="226" r="48" fill="#f0fff4" stroke="#2d6a4f" strokeWidth="3.5"/>
    {[[118,158],[165,148],[145,178],[105,185],[192,172]].map(([cx,cy])=>(<circle key={cx} cx={cx} cy={cy} r="8" fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5"/>))}
    {[[130,165],[155,155],[108,175],[178,180]].map(([cx,cy])=>(<circle key={"p"+cx} cx={cx} cy={cy} r="7" fill="#ff9898" stroke="#c62828" strokeWidth="1.5"/>))}
  </svg>
);
const SvgSykkelVei = ()=>(
  <svg viewBox="0 0 300 260" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="0" y="185" width="300" height="55" rx="0" fill="#c4d6ec" stroke="none"/>
    <line x1="0" y1="213" x2="300" y2="213" strokeWidth="3" stroke="white" strokeDasharray="20 15"/>
    <circle cx="90" cy="155" r="45"/>
    <circle cx="210" cy="155" r="45"/>
    <circle cx="90" cy="155" r="25"/><circle cx="210" cy="155" r="25"/>
    <line x1="90" y1="155" x2="210" y2="155" strokeWidth="5"/>
    <line x1="150" y1="80" x2="150" y2="155" strokeWidth="5"/>
    <ellipse cx="150" cy="78" rx="28" ry="12" strokeWidth="3"/>
    <ellipse cx="148" cy="72" rx="18" ry="7" fill="#ff5252" stroke="#c62828" strokeWidth="2"/>
    <circle cx="152" cy="60" r="14"/>
    <circle cx="144" cy="56" r="5" fill={S.s}/><circle cx="160" cy="56" r="5" fill={S.s}/>
    <path d="M144 66 Q152 72 160 66" fill="none" strokeWidth="2"/>
    <line x1="110" y1="130" x2="148" y2="80" strokeWidth="4"/>
    <line x1="165" y1="112" x2="150" y2="80" strokeWidth="4"/>
    <line x1="150" y1="155" x2="168" y2="115" strokeWidth="4"/>
    {[[30,175],[80,170],[260,172],[235,168]].map(([x,y])=>(<ellipse key={x} cx={x} cy={y} rx="16" ry="6" fill="#d8f3dc" stroke="#52b788" strokeWidth="1.5"/>))}
  </svg>
);
const SvgGledefarge = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="140" r="88" fill="#fff9c4"/>
    <circle cx="118" cy="118" r="14" fill={S.s}/><circle cx="121" cy="115" r="5" fill="white" stroke="none"/>
    <circle cx="182" cy="118" r="14" fill={S.s}/><circle cx="185" cy="115" r="5" fill="white" stroke="none"/>
    <path d="M112 160 Q150 192 188 160" fill="none" strokeWidth="6"/>
    <ellipse cx="108" cy="162" rx="16" ry="10" fill="#ff9898" stroke="none"/>
    <ellipse cx="192" cy="162" rx="16" ry="10" fill="#ff9898" stroke="none"/>
    {[0,45,90,135,180,225,270,315].map(a=>(<line key={a} x1={150+92*Math.cos(a*Math.PI/180)} y1={140+92*Math.sin(a*Math.PI/180)} x2={150+112*Math.cos(a*Math.PI/180)} y2={140+112*Math.sin(a*Math.PI/180)} strokeWidth="4" stroke="#ffd700"/>))}
    {[[55,55],[245,62],[55,218],[245,222]].map(([x,y],i)=>(<path key={i} d={[0,1,2,3,4].map(n=>`${n===0?"M":"L"}${x+12*Math.cos((n*72-90)*Math.PI/180)},${y+12*Math.sin((n*72-90)*Math.PI/180)}`).join(" ")+"Z"} fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5"/>))}
  </svg>
);
const SvgElgHost = ()=>(
  <svg viewBox="0 0 300 310" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="155" cy="165" rx="88" ry="54"/>
    <circle cx="228" cy="112" r="42"/>
    <ellipse cx="248" cy="86" rx="18" ry="10" fill="#f9c5b5" transform="rotate(-20,248,86)"/>
    <circle cx="238" cy="100" r="9" fill={S.s}/><circle cx="240" cy="98" r="3" fill="white" stroke="none"/>
    <path d="M200 78 Q188 48 170 38 Q182 52 184 68" strokeWidth="3"/>
    <path d="M170 38 Q156 22 149 18 Q159 30 163 42" strokeWidth="2.5"/>
    <path d="M212 74 Q206 48 220 36 Q213 52 217 66" strokeWidth="3"/>
    <path d="M220 36 Q230 20 237 16 Q228 28 226 40" strokeWidth="2.5"/>
    <path d="M68 140 Q40 118 28 105" strokeWidth="3.5"/>
    <path d="M242 140 Q266 118 278 105" strokeWidth="3.5"/>
    <path d="M95 215 Q74 248 72 278" strokeWidth="3.5"/>
    <path d="M132 217 Q122 252 124 278" strokeWidth="3.5"/>
    <path d="M178 217 Q178 252 180 278" strokeWidth="3.5"/>
    <path d="M215 215 Q225 248 228 278" strokeWidth="3.5"/>
    {[[42,260],[52,245],[72,255],[88,242],[265,248],[255,262],[240,252]].map(([x,y],i)=>(<ellipse key={i} cx={x} cy={y} rx="14" ry="8" fill={["#ffd700","#ff8c42","#e53e3e","#ffd700","#ff8c42","#e53e3e","#ffd700"][i]} stroke={S.s} strokeWidth="1.5" transform={`rotate(${[-20,-10,15,-25,20,5,-15][i]},${x},${y})`}/>))}
  </svg>
);
const SvgSkyRegn = ()=>(
  <svg viewBox="0 0 320 260" fill="none" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc}>
    <ellipse cx="52" cy="85" rx="38" ry="25" fill={S.f} stroke={S.s} strokeWidth="3"/>
    <ellipse cx="80" cy="70" rx="48" ry="32" fill={S.f} stroke={S.s} strokeWidth="3"/>
    <ellipse cx="118" cy="75" rx="40" ry="28" fill={S.f} stroke={S.s} strokeWidth="3"/>
    <ellipse cx="88" cy="92" rx="68" ry="22" fill={S.f} stroke={S.s} strokeWidth="3"/>
    {[45,62,79,96,113,130].map(x=>(<g key={x}><line x1={x} y1="115" x2={x-6} y2="148" strokeWidth="2.5" stroke="#6ba0d9"/><ellipse cx={x-7} cy={152} rx="6" ry="4" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="1.5"/></g>))}
    <path d="M185 195 Q185 82 242 82 Q300 82 300 195" stroke="#e53e3e" strokeWidth="10" fill="none"/>
    <path d="M185 195 Q185 102 242 102 Q300 102 300 195" stroke="#6ba0d9" strokeWidth="10" fill="none"/>
    <path d="M185 195 Q185 120 242 120 Q300 120 300 195" stroke="#ffd700" strokeWidth="10" fill="none"/>
    <path d="M185 195 Q185 138 242 138 Q300 138 300 195" stroke="#52b788" strokeWidth="10" fill="none"/>
  </svg>
);
const SvgMaalvakt = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="15" y="40" width="12" height="170" rx="4"/><rect x="15" y="40" width="200" height="12" rx="4"/><rect x="203" y="40" width="12" height="130" rx="4"/>
    <path d="M27 210 L215 170" fill="none" strokeWidth="2" stroke="#c4d6ec" strokeDasharray="6 4"/>
    <circle cx="248" cy="82" r="24"/>
    <path d="M224 82 Q210 90 205 100" fill="none" strokeWidth="3" stroke="#6ba0d9"/>
    <circle cx="188" cy="192" r="32"/>
    <circle cx="160" cy="180" r="8" fill={S.s}/><circle cx="216" cy="180" r="8" fill={S.s}/>
    <path d="M162 200 Q188 214 214 200" fill="none" strokeWidth="2.5"/>
    <ellipse cx="188" cy="222" rx="28" ry="8"/>
    <line x1="160" y1="220" x2="140" y2="260" strokeWidth="4"/>
    <line x1="216" y1="220" x2="236" y2="260" strokeWidth="4"/>
    <line x1="170" y1="155" x2="140" y2="148" strokeWidth="4"/>
    <line x1="206" y1="155" x2="250" y2="135" strokeWidth="4"/>
    <ellipse cx="140" cy="261" rx="20" ry="10"/><ellipse cx="236" cy="261" rx="20" ry="10"/>
  </svg>
);
const SvgGresskarNatt = ()=>(
  <svg viewBox="0 0 300 280" fill="#ff8833" stroke="#c62828" strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="160" rx="100" ry="85"/>
    <ellipse cx="90" cy="160" rx="38" ry="82" fill="#ff7722"/>
    <ellipse cx="210" cy="160" rx="38" ry="82" fill="#ff7722"/>
    <ellipse cx="150" cy="160" rx="32" ry="85" fill="#ff9944"/>
    <path d="M150 75 Q145 50 130 45 Q145 55 145 75" fill="#5d8c5d" stroke="#2d6a4f" strokeWidth="2"/>
    <rect x="143" y="55" width="14" height="25" fill="#8b5e3c"/>
    <path d="M98 128 L125 128 L111 150Z" fill="#3d1c08" stroke="none"/>
    <path d="M175 128 L202 128 L188 150Z" fill="#3d1c08" stroke="none"/>
    <path d="M88 185 Q150 218 212 185 L202 198 Q188 192 182 202 Q168 192 162 202 Q150 192 144 202 Q132 192 124 202 Q112 192 98 198Z" fill="#3d1c08" stroke="none"/>
    <circle cx="50" cy="55" r="28" fill="#334155" stroke="#1a2c45" strokeWidth="2"/>
    <circle cx="62" cy="44" r="12" fill="none" stroke="#ffd700" strokeWidth="2"/>
    <path d="M28 120 Q18 100 28 80" fill="none" stroke="#c4d6ec" strokeWidth="2" strokeDasharray="5 4"/>
    <path d="M272 100 Q280 115 268 130" fill="none" stroke="#c4d6ec" strokeWidth="2" strokeDasharray="5 4"/>
    <ellipse cx="150" cy="272" rx="105" ry="8" fill="#1a2c45" stroke="none"/>
  </svg>
);
const SvgPaaskelilje2 = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[30,90,150,210,270,330].map(a=>(<ellipse key={a} cx={150+56*Math.cos(a*Math.PI/180)} cy={95+56*Math.sin(a*Math.PI/180)} rx="22" ry="42" transform={`rotate(${a},${150+56*Math.cos(a*Math.PI/180)},${95+56*Math.sin(a*Math.PI/180)})`} fill="#fffde7" stroke="#f9a825" strokeWidth="2"/>))}
    <ellipse cx="150" cy="95" rx="30" ry="22" fill="#ffd740" stroke="#f9a825" strokeWidth="3"/>
    <ellipse cx="150" cy="95" rx="20" ry="14" fill="#ffca28" stroke="none"/>
    <rect x="138" y="118" width="24" height="112" rx="10" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="3"/>
    <ellipse cx="98" cy="192" rx="48" ry="16" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2.5" transform="rotate(-22,98,192)"/>
    <ellipse cx="202" cy="205" rx="48" ry="16" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2.5" transform="rotate(18,202,205)"/>
    <circle cx="75" cy="82" r="18" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <ellipse cx="75" cy="82" rx="12" ry="9" fill="#ffd740" stroke="none"/>
    <rect x="68" y="98" width="14" height="90" rx="6" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/>
    <circle cx="225" cy="95" r="18" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <ellipse cx="225" cy="95" rx="12" ry="9" fill="#ffd740" stroke="none"/>
    <rect x="218" y="111" width="14" height="80" rx="6" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/>
    <circle cx="175" cy="65" r="14" fill="#fff9c4" stroke="#f9a825" strokeWidth="2"/>
    <rect x="168" y="78" width="14" height="60" rx="5" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/>
  </svg>
);
const SvgSnomannJul = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="278" r="66"/>
    <circle cx="150" cy="190" r="48"/>
    <circle cx="150" cy="118" r="36"/>
    <rect x="118" y="74" width="64" height="22" rx="4" fill="#c62828"/><rect x="112" y="79" width="76" height="10" rx="3" fill="#c62828"/>
    <ellipse cx="224" cy="78" rx="22" ry="14" fill="white" stroke="none"/>
    <circle cx="136" cy="113" r="6" fill={S.s}/><circle cx="164" cy="113" r="6" fill={S.s}/>
    <ellipse cx="150" cy="124" rx="5" ry="8" fill="#ff8c42" stroke="#e65100" strokeWidth="2"/>
    <path d="M138 133 Q150 140 162 133" fill="none" strokeWidth="2.5"/>
    <circle cx="146" cy="182" r="5" fill={S.s}/><circle cx="156" cy="190" r="5" fill={S.s}/><circle cx="146" cy="198" r="5" fill={S.s}/>
    <path d="M102 185 Q72 168 55 150" fill="none" strokeWidth="3"/><path d="M198 185 Q228 168 245 150" fill="none" strokeWidth="3"/>
    <path d="M62 155 Q52 148 48 138" fill="none" strokeWidth="2"/><path d="M240 148 Q250 138 252 128" fill="none" strokeWidth="2"/>
    {[[55,115],[80,95],[230,108],[255,128]].map(([x,y],i)=>(<polygon key={i} points={[0,1,2,3,4].map(n=>`${x+8*Math.cos((n*72-90)*Math.PI/180)},${y+8*Math.sin((n*72-90)*Math.PI/180)}`).join(' ')} fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5"/>))}
    <path d="M88 272 Q108 258 122 272" fill="none" strokeWidth="3"/>
    <path d="M178 272 Q192 258 212 272" fill="none" strokeWidth="3"/>
  </svg>
);
const SvgEng = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <ellipse cx="150" cy="265" rx="145" ry="18" fill="#d8f3dc" stroke="#52b788" strokeWidth="2"/>
    {[[55,155],[110,140],[160,148],[210,138],[255,152]].map(([cx,cy],i)=>(<g key={i}><ellipse cx={cx} cy={cy} rx={26+i%2*6} ry={28+i%3*5} fill={["#ff9898","#ffd700","#d8e8f5","#ff9898","#ffd700"][i]} stroke={S.s} strokeWidth="2.5"/><rect x={cx-5} y={cy+28} width="10" height={35-i%2*5} rx="4" fill="#2d8c3c" stroke="#1b5e20" strokeWidth="2"/></g>))}
    {[[42,235],[88,240],[138,232],[188,238],[238,234]].map(([x,y])=>(<circle key={x} cx={x} cy={y} r="9" fill="#ffd700" stroke="#ff8c00" strokeWidth="1.5"/>))}
    {[[65,185],[150,175],[240,182]].map(([x,y])=>(<path key={x} d={`M${x} ${y} Q${x+6} ${y-10} ${x+12} ${y} M${x+14} ${y} Q${x+20} ${y-10} ${x+26} ${y}`} fill="none" stroke="#334155" strokeWidth="1.5"/>))}
  </svg>
);
const SvgFyr = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="20" y="165" width="260" height="95" rx="8" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2.5"/>
    <path d="M20 192 Q90 178 150 188 Q210 178 280 192" fill="none" strokeWidth="2.5" stroke="#6ba0d9"/>
    <rect x="118" y="75" width="46" height="130" rx="6"/>
    <rect x="110" y="65" width="62" height="22" rx="6" fill="#e53e3e" stroke="#c62828" strokeWidth="2.5"/>
    <ellipse cx="141" cy="64" rx="20" ry="14" fill="#ffd700" stroke="#ff8c00" strokeWidth="2.5"/>
    {[-50,-25,0,25,50].map(a=>(<line key={a} x1={141+28*Math.cos(a*Math.PI/180)} y1={64+28*Math.sin(a*Math.PI/180)} x2={141+40*Math.cos(a*Math.PI/180)} y2={64+40*Math.sin(a*Math.PI/180)} strokeWidth="2.5" stroke="#ffd700"/>))}
    <rect x="128" y="95" width="26" height="16" rx="3" fill="#d8e8f5"/>
    <rect x="128" y="128" width="26" height="16" rx="3" fill="#d8e8f5"/>
    <rect x="128" y="161" width="26" height="16" rx="3" fill="#d8e8f5"/>
    <rect x="105" y="186" width="72" height="12" rx="4"/>
    <ellipse cx="72" cy="210" rx="42" ry="26"/>
    <ellipse cx="72" cy="200" rx="26" ry="14" fill="#d8f3dc"/>
  </svg>
);

const SvgSnøfnugg = ()=>(
  <svg viewBox="0 0 300 300" fill="none" stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[0,60,120,180,240,300].map(a=>(
      <g key={a} transform={`rotate(${a},150,150)`}>
        <line x1="150" y1="150" x2="150" y2="30" strokeWidth="4"/>
        <line x1="130" y1="70" x2="150" y2="50" strokeWidth="2.5"/>
        <line x1="170" y1="70" x2="150" y2="50" strokeWidth="2.5"/>
        <line x1="126" y1="105" x2="150" y2="90" strokeWidth="2.5"/>
        <line x1="174" y1="105" x2="150" y2="90" strokeWidth="2.5"/>
      </g>
    ))}
    <circle cx="150" cy="150" r="18" fill={S.f} stroke={S.s} strokeWidth="3"/>
    {[0,60,120,180,240,300].map(a=>(<circle key={a} cx={150+110*Math.cos((a-90)*Math.PI/180)} cy={150+110*Math.sin((a-90)*Math.PI/180)} r="10" fill={S.f} stroke={S.s} strokeWidth="2.5"/>))}
  </svg>
);
const SvgFarger = ()=>(
  <svg viewBox="0 0 300 280" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    {[["#e53e3e",30],["#ff8c00",70],["#ffd700",110],["#52b788",150],["#4299e1",190],["#5a67d8",230],["#9b59b6",270]].map(([c,x])=>(
      <g key={x}>
        <rect x={x-15} y="60" width="30" height="140" rx="14" fill={c} stroke={S.s} strokeWidth="2.5"/>
        <circle cx={x} cy="48" r="18" fill={c} stroke={S.s} strokeWidth="2.5"/>
      </g>
    ))}
    <rect x="22" y="215" width="256" height="28" rx="12" fill="#f5f9fd"/>
    {[1,2,3,4,5,6,7].map((n,i)=>(<text key={n} x={30+i*40} y="234" fontSize="14" fontWeight="bold" fontFamily="sans-serif" fill={S.s} textAnchor="middle">{n}</text>))}
  </svg>
);
const SvgPust = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="88" r="44"/>
    <circle cx="132" cy="80" r="7" fill={S.s}/><circle cx="134" cy="78" r="2.5" fill="white" stroke="none"/>
    <circle cx="168" cy="80" r="7" fill={S.s}/><circle cx="170" cy="78" r="2.5" fill="white" stroke="none"/>
    <path d="M132 102 Q150 116 168 102" fill="none" strokeWidth="3"/>
    <ellipse cx="150" cy="190" rx="60" ry="72"/>
    <ellipse cx="76" cy="198" rx="24" ry="42" transform="rotate(-12,76,198)"/>
    <ellipse cx="224" cy="198" rx="24" ry="42" transform="rotate(12,224,198)"/>
    <ellipse cx="110" cy="280" rx="30" ry="14"/><ellipse cx="190" cy="280" rx="30" ry="14"/>
    {[0,1,2,3,4].map(i=>(<path key={i} d={`M${130+i*8} 150 Q${134+i*8} ${138+i*4} ${138+i*8} 150`} fill="none" stroke="#6ba0d9" strokeWidth="2"/>))}
    <path d="M100 155 Q80 135 68 120" fill="none" stroke="#6ba0d9" strokeWidth="2" strokeDasharray="5 4"/>
    <path d="M200 155 Q220 135 232 120" fill="none" stroke="#6ba0d9" strokeWidth="2" strokeDasharray="5 4"/>
    <circle cx="68" cy="116" r="8" stroke="#6ba0d9" strokeWidth="2" fill="#e3f2fd"/>
    <circle cx="232" cy="116" r="8" stroke="#6ba0d9" strokeWidth="2" fill="#e3f2fd"/>
  </svg>
);

const SvgEgg = ()=>(
  <svg viewBox="0 0 300 340" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M150 20 Q230 20 268 140 Q280 200 260 255 Q235 315 150 320 Q65 315 40 255 Q20 200 32 140 Q70 20 150 20Z"/>
    <path d="M44 155 Q150 185 256 155" fill="none" strokeWidth="3"/>
    <path d="M34 210 Q150 240 266 210" fill="none" strokeWidth="3"/>
    <circle cx="110" cy="90" r="16"/><circle cx="170" cy="75" r="12"/><circle cx="200" cy="105" r="14"/>
    <circle cx="85" cy="135" r="10"/><circle cx="215" cy="130" r="10"/>
    <path d="M60 175 Q80 165 100 175 Q120 185 140 175 Q160 165 180 175 Q200 185 220 175 Q240 165 250 175" fill="none" strokeWidth="2.5"/>
    <path d="M45 225 Q75 215 105 225 Q135 235 165 225 Q195 215 225 225 Q250 235 265 225" fill="none" strokeWidth="2.5"/>
  </svg>
);
const SvgGulrot = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M148 55 Q168 80 175 130 Q178 175 165 220 Q155 255 150 268 Q145 255 135 220 Q122 175 125 130 Q132 80 148 55Z" fill="#ff8c42"/>
    <line x1="148" y1="90" x2="100" y2="90" strokeWidth="2"/><line x1="150" y1="115" x2="200" y2="115" strokeWidth="2"/>
    <line x1="148" y1="140" x2="95" y2="145" strokeWidth="2"/><line x1="150" y1="165" x2="205" y2="160" strokeWidth="2"/>
    <path d="M148 55 Q130 20 115 10 Q135 30 138 50" fill="#2d8c3c" stroke="#2d8c3c" strokeWidth="2"/>
    <path d="M148 55 Q152 15 168 5 Q160 28 152 52" fill="#2d8c3c" stroke="#2d8c3c" strokeWidth="2"/>
    <path d="M148 55 Q170 22 185 15 Q172 35 155 52" fill="#2d8c3c" stroke="#2d8c3c" strokeWidth="2"/>
    <ellipse cx="90" cy="210" rx="42" ry="30" transform="rotate(-20,90,210)" fill="#ff8c42"/>
    <path d="M90 185 Q70 178 88 182" fill="none" stroke="#2d8c3c" strokeWidth="2"/>
    <path d="M90 185 Q100 172 96 183" fill="none" stroke="#2d8c3c" strokeWidth="2"/>
    <ellipse cx="215" cy="195" rx="36" ry="25" transform="rotate(15,215,195)" fill="#ff8c42"/>
    <path d="M215 172 Q230 165 220 170" fill="none" stroke="#2d8c3c" strokeWidth="2"/>
  </svg>
);
const SvgKlem = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M148 60 Q155 40 165 55 Q168 42 162 35 Q155 25 148 35 Q141 25 138 35 Q132 42 135 55 Q145 40 148 60Z" fill="#ff9898" stroke="#c62828" strokeWidth="2"/>
    <circle cx="98" cy="108" r="34"/>
    <circle cx="202" cy="108" r="34"/>
    <circle cx="88" cy="100" r="8" fill={S.s}/><circle cx="90" cy="98" r="3" fill="white" stroke="none"/>
    <circle cx="192" cy="100" r="8" fill={S.s}/><circle cx="194" cy="98" r="3" fill="white" stroke="none"/>
    <path d="M86 122 Q98 132 110 122" fill="none" strokeWidth="2.5"/>
    <path d="M190 122 Q202 132 214 122" fill="none" strokeWidth="2.5"/>
    <ellipse cx="98" cy="198" rx="46" ry="56"/>
    <ellipse cx="202" cy="198" rx="46" ry="56"/>
    <path d="M144 165 Q150 158 156 165" fill="none" strokeWidth="3"/>
    <path d="M68 160 Q50 148 48 175 Q60 165 78 172" strokeWidth="3"/>
    <path d="M232 160 Q250 148 252 175 Q240 165 222 172" strokeWidth="3"/>
    <ellipse cx="98" cy="278" rx="38" ry="16"/>
    <ellipse cx="202" cy="278" rx="38" ry="16"/>
  </svg>
);
const SvgGran = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <polygon points="150,18 178,62 165,62 190,105 174,105 202,155 180,155 210,210 90,210 120,155 98,155 126,105 110,105 135,62 122,62"/>
    <rect x="132" y="210" width="36" height="48" rx="6" fill="#8B5E3C" stroke="#5a3e28" strokeWidth="3"/>
    <circle cx="150" cy="18" r="14" fill="#ffd700" stroke="#ff8c00" strokeWidth="2.5"/>
    <circle cx="122" cy="90" r="8" fill="#ff4444" stroke="none"/>
    <circle cx="178" cy="110" r="8" fill="#ffd700" stroke="none"/>
    <circle cx="108" cy="140" r="8" fill="#4499ff" stroke="none"/>
    <circle cx="192" cy="135" r="8" fill="#ff4444" stroke="none"/>
    <circle cx="145" cy="165" r="8" fill="#ffd700" stroke="none"/>
    <circle cx="170" cy="180" r="8" fill="#44cc44" stroke="none"/>
    <circle cx="125" cy="185" r="8" fill="#ff4444" stroke="none"/>
  </svg>
);

const SvgRobot = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <line x1="150" y1="30" x2="150" y2="65" strokeWidth="3"/>
    <circle cx="150" cy="22" r="12"/>
    <rect x="82" y="65" width="136" height="105" rx="14"/>
    <circle cx="118" cy="105" r="18"/><circle cx="122" cy="101" r="6" fill={S.s}/>
    <circle cx="182" cy="105" r="18"/><circle cx="186" cy="101" r="6" fill={S.s}/>
    <rect x="108" y="138" width="84" height="18" rx="6"/>
    <line x1="129" y1="138" x2="129" y2="156" strokeWidth="2"/><line x1="150" y1="138" x2="150" y2="156" strokeWidth="2"/><line x1="171" y1="138" x2="171" y2="156" strokeWidth="2"/>
    <rect x="68" y="185" width="164" height="110" rx="14"/>
    <rect x="100" y="202" width="100" height="60" rx="8"/>
    <circle cx="128" cy="228" r="14"/>
    <rect x="148" y="213" width="38" height="12" rx="4"/><rect x="148" y="232" width="38" height="12" rx="4"/>
    <rect x="20" y="188" width="46" height="88" rx="12"/>
    <rect x="234" y="188" width="46" height="88" rx="12"/>
    <ellipse cx="43" cy="290" rx="22" ry="16"/>
    <ellipse cx="257" cy="290" rx="22" ry="16"/>
    <rect x="96" y="293" width="46" height="25" rx="8"/><rect x="158" y="293" width="46" height="25" rx="8"/>
  </svg>
);
const SvgRakette = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <path d="M150 12 Q192 62 196 128 L104 128 Q108 62 150 12Z"/>
    <rect x="104" y="128" width="92" height="130" rx="8"/>
    <circle cx="150" cy="170" r="30"/>
    <circle cx="150" cy="170" r="20" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2"/>
    <path d="M104 215 Q68 235 58 285 L104 262Z"/>
    <path d="M196 215 Q232 235 242 285 L196 262Z"/>
    <path d="M118 258 Q133 298 150 315 Q167 298 182 258Z" fill="#fff9c4" stroke="#6ba0d9" strokeWidth="2"/>
    <path d="M128 258 Q141 292 150 305 Q159 292 172 258Z" fill="#ffd700" stroke="#ff8c00" strokeWidth="2"/>
    <circle cx="62" cy="72" r="5" fill={S.s} stroke="none"/>
    <circle cx="238" cy="110" r="4" fill={S.s} stroke="none"/>
    <circle cx="52" cy="148" r="3" fill={S.s} stroke="none"/>
    <circle cx="250" cy="48" r="6" fill={S.s} stroke="none"/>
  </svg>
);
const SvgAstronaut = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="92" r="66"/>
    <path d="M98 76 Q150 125 202 76 Q186 50 150 50 Q114 50 98 76Z" fill="#d8e8f5" stroke="#6ba0d9" strokeWidth="2.5"/>
    <rect x="118" y="152" width="64" height="18" rx="8"/>
    <rect x="80" y="170" width="140" height="100" rx="22"/>
    <rect x="112" y="188" width="76" height="50" rx="10"/>
    <circle cx="150" cy="204" r="12"/>
    <line x1="132" y1="220" x2="168" y2="220" strokeWidth="3"/><line x1="132" y1="230" x2="168" y2="230" strokeWidth="3"/>
    <ellipse cx="54" cy="208" rx="27" ry="48" transform="rotate(-8,54,208)"/>
    <ellipse cx="246" cy="208" rx="27" ry="48" transform="rotate(8,246,208)"/>
    <ellipse cx="44" cy="250" rx="21" ry="17"/>
    <ellipse cx="256" cy="250" rx="21" ry="17"/>
    <ellipse cx="122" cy="295" rx="30" ry="22"/>
    <ellipse cx="178" cy="295" rx="30" ry="22"/>
    <rect x="188" y="178" width="28" height="50" rx="8"/>
  </svg>
);
const SvgGitar = ()=>(
  <svg viewBox="0 0 300 320" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <rect x="140" y="20" width="20" height="38" rx="7"/>
    <circle cx="133" cy="24" r="7"/><circle cx="133" cy="38" r="7"/>
    <circle cx="167" cy="24" r="7"/><circle cx="167" cy="38" r="7"/>
    <rect x="137" y="55" width="26" height="155" rx="8"/>
    <ellipse cx="150" cy="218" rx="58" ry="44"/>
    <ellipse cx="150" cy="278" rx="76" ry="52"/>
    <path d="M92 248 Q112 260 92 272" fill="none" strokeWidth="3.5"/>
    <path d="M208 248 Q188 260 208 272" fill="none" strokeWidth="3.5"/>
    <circle cx="150" cy="260" r="26"/>
    <circle cx="150" cy="260" r="19" stroke="#c4d6ec" strokeWidth="1.5"/>
    <rect x="126" y="292" width="48" height="10" rx="5"/>
    {[140,145,150,155,160,165].map(x=>(<line key={x} x1={x} y1="58" x2={x} y2="293" strokeWidth="1" stroke="#6ba0d9"/>))}
  </svg>
);
const SvgFotball = ()=>(
  <svg viewBox="0 0 300 300" fill={S.f} stroke={S.s} strokeWidth={S.sw} strokeLinecap={S.sc} strokeLinejoin={S.sj}>
    <circle cx="150" cy="148" r="120"/>
    <polygon points="150,50 190,76 174,122 126,122 110,76" strokeWidth="2.5"/>
    <polygon points="68,100 110,76 126,122 86,152 44,138" strokeWidth="2.5"/>
    <polygon points="232,100 190,76 174,122 214,152 256,138" strokeWidth="2.5"/>
    <polygon points="76,192 86,152 126,122 150,168 120,204" strokeWidth="2.5"/>
    <polygon points="224,192 214,152 174,122 150,168 180,204" strokeWidth="2.5"/>
    <polygon points="150,248 120,204 150,168 180,204" strokeWidth="2.5"/>
    <ellipse cx="150" cy="290" rx="92" ry="12" fill="#e8f5e9" stroke="#c4d6ec" strokeWidth="1.5"/>
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
  {id:1,tittel:"Kaninen med lange ører",ikon:"🐰",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgKanin/>,oppgave:"1. Farg pelsen lys brun eller hvit. 2. Farg innsiden av ørene lyserøde. 3. Tegn grønt gress og tre gulrøtter rundt. 4. Gi kaninen store runde øyne og en knopplignende hale.",samtale:"Hva er forskjellen på en kanin og en hare? Kan du telle frambeina og bakbeina – er det likt antall? Hva kalles kaninens unge?",mal:"Pattedyr og kroppsdeler. Rammeplanen: Natur – bli kjent med dyrs kjennetegn og levevis."},
  {id:2,tittel:"Bjørnen i norsk skog",ikon:"🐻",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","etikk"],svg:<SvgBjorn/>,oppgave:"1. Farg kroppen mørk brun, snuten litt lysere. 2. Tegn et hi (hulrom i bakken eller under en rot). 3. Legg til blåbærbusker og en honningkube i treet. 4. Tegn bjørneunger som titter ut av hiet.",samtale:"Hva er vinterhvile – er det det samme som å sove? Hva spiser bjørnen for å legge på seg til vinteren? Hvor i Norge finnes bjørner?",mal:"Rovdyr og tilpasning til årstider. Rammeplanen: Natur – forstå dyrs livsstrategier og Norges dyreliv."},
  {id:3,tittel:"Meisen på fuglebordet",ikon:"🐦",kategori:"dyr",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgFugl/>,oppgave:"1. Farg brystet gult og vingen blågrønn. 2. Tegn et fuglebord den sitter på med frø. 3. Legg til snø rundt – det er vinter. 4. Tegn en menneskehånd som fyller på frø.",samtale:"Hva heter fuglen du ser mest i barnehagen? Hvorfor legger vi ut mat om vinteren? Hva er forskjellen på trekkfugler og vinterfugler?",mal:"Fugler i norsk natur og omsorg for dyr. Rammeplanen: Natur – observere og lære om lokalt dyreliv."},
  {id:4,tittel:"Torsken i Nordsjøen",ikon:"🐟",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","naermiljo"],svg:<SvgFisk/>,oppgave:"1. Farg fisken gråbrun med hvit buk. 2. Tegn et hav med grønn tang og sand. 3. Legg til tre andre sjødyr: krabbe, sjøstjerne, snegl. 4. Tegn bobler som stiger opp fra fisken.",samtale:"Hva spiser torsk? Hva er et gjelle – og hva gjør det? Hva er Norges viktigste fiskeart?",mal:"Marine dyr og Norges kystkultur. Rammeplanen: Natur og nærmiljø – lære om havet som ressurs og leveområde."},
  {id:5,tittel:"Sommerfuglens livssyklus",ikon:"🦋",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kunst"],svg:<SvgSommerfugl/>,oppgave:"1. Farg de to vingepar i tydelig mønster – prikkete eller stripete. 2. Bruk minst tre farger på vingene. 3. Tegn en blomst den suger nektar av. 4. Tegn en larve og en kokong i hjørnet av arket.",samtale:"Hva er en metamorfose? Hvilke fire stadier går en sommerfugl gjennom? Hva er forskjellen mellom en sommerfugl og en møll?",mal:"Insekters livssyklus og biologisk mangfold. Rammeplanen: Natur – forstå forvandlingsprosesser i naturen."},
  {id:6,tittel:"Frosken i tjernet",ikon:"🐸",kategori:"dyr",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgFrosk/>,oppgave:"1. Farg frosken knall grønn med mørke flekker. 2. Tegn et tjern med vannliljeblader og siv. 3. Legg til tre rumpetroll i vannet. 4. Tegn insekter frosken kan spise.",samtale:"Hva er et rumpetroll? Hva skjer med det? Kan du hoppe som en frosk – prøv!",mal:"Amfibier og metamorfose. Rammeplanen: Natur og kropp – livssykluser og kople dem til kroppsbevegelse."},
  {id:7,tittel:"Elgoksen i birkeskogen",ikon:"🦌",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","naermiljo"],svg:<SvgElg/>,oppgave:"1. Farg kroppen mørk brun og snuten beige. 2. Farg geviret beige – tell grenene! 3. Tegn bjørketrær rundt med gult løv. 4. Tegn dype spor i bakken.",samtale:"Hva er et gevir, og hvem har det? Hva spiser elgen om sommeren og om vinteren? Hvor stor er en voksen elg sammenlignet med en bil?",mal:"Norges storvilt og skogsøkologi. Rammeplanen: Natur og nærmiljø – kjenne til norske dyr og deres leveområder."},
  {id:8,tittel:"Solen gir liv",ikon:"☀️",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgSol/>,oppgave:"1. Farg solen sterkt gul med oransje stråler. 2. Tegn en blomst som vender mot solen. 3. Legg til et tre og en fugl. 4. Farg himmelen lys blå.",samtale:"Hva trenger planter for å vokse? Hva gir solen oss? Hva skjer hvis det er overskyet i lang tid?",mal:"Fotosyntese og solenergi. Rammeplanen: Natur – forstå solens rolle for alt liv."},
  {id:9,tittel:"Regnbuen – naturens kunstverk",ikon:"🌈",kategori:"natur",alder:"2-6 år",rammeplan:["natur","antall"],svg:<SvgRegnbue/>,oppgave:"1. Farg regnbuen i riktig rekkefølge: rød, oransje, gul, grønn, blå, indigo, fiolett. 2. Tegn regndråper på den ene siden og sol på den andre. 3. Skriv tallene 1–7 på hver bue.",samtale:"Hva må til for å se en regnbue? Kan du huske alle 7 fargene i riktig rekkefølge? Hva er lys egentlig laget av?",mal:"Farger og lysets spredning. Rammeplanen: Natur og antall – rekkefølge, mønster og fargeblanding."},
  {id:10,tittel:"Høsttreet med fargerike blader",ikon:"🍂",kategori:"host",alder:"3-6 år",rammeplan:["natur","kunst"],svg:<SvgHost/>,oppgave:"1. Farg bladene i fire høstfarger: rødt, oransje, gult og brunt. 2. Tegn blader som virvler ned. 3. Legg til en bunke blader på bakken. 4. Tegn en kråke som sitter øverst.",samtale:"Hva skjer med klorofyllet om høsten? Hva finner vi i skogen om høsten? Hva heter prosessen der treet mister bladene?",mal:"Årstider og naturprosesser. Rammeplanen: Natur – forstå forandringer i naturen knyttet til årstidene."},
  {id:11,tittel:"Snømannen med personlighet",ikon:"⛄",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSnomann/>,oppgave:"1. Farg snømannen med tre hvite kuler. 2. Gi ham en gulrotnese, mørke øyne og knapperekke. 3. Tegn fargerik lue og stripete skjerf. 4. Legg til to pinner som armer.",samtale:"Hva trenger vi for å lage en snømann? Hva skjer med snømannen når solen varmer? Hva er smeltepunktet for is?",mal:"Is og snø. Rammeplanen: Natur – forstå vann i ulike aggregattilstander."},
  {id:12,tittel:"Vårblomstene er her",ikon:"🌸",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgVaar/>,oppgave:"1. Farg blomstene i lyse vårfarger – rosa, gul og hvit. 2. Tegn jord med knopper som piper opp. 3. Legg til tre bier som besøker blomstene. 4. Tegn grønne blader fra en tulipan.",samtale:"Hvilke blomster er de første vi ser om våren? Hva er en løkblomst? Hva er en krokus?",mal:"Vårblomster og planters livssyklus. Rammeplanen: Natur – observere og beskrive forandringer i naturen."},
  {id:13,tittel:"Familien er forskjellig",ikon:"👨‍👩‍👧‍👦",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","naermiljo","kommunikasjon"],svg:<SvgFamilie/>,oppgave:"1. Farg hver person ulikt – ulik hudfarge, hår og klær. 2. Tegn dem i en felles aktivitet. 3. Legg til detaljer som viser personlighet. 4. Tegn et hjem rundt dem.",samtale:"Hvem er i din familie? Er alle familier like – hva er likt og hva er ulikt? Hva gjør familien din på helgene?",mal:"Familieformer og mangfold. Rammeplanen: Etikk og nærmiljø – respektere og verdsette ulike familier."},
  {id:14,tittel:"Venner hjelper hverandre",ikon:"🤝",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","kommunikasjon","naermiljo"],svg:<SvgVennskap/>,oppgave:"1. Farg de to vennene med ulike utseender. 2. Tegn dem i en situasjon der den ene hjelper den andre. 3. Legg til en snakkeboble med noe hyggelig. 4. Tegn et smil på begge.",samtale:"Hva er en god venn? Hva gjør man om noen er lei seg? Hva betyr empati?",mal:"Empati og vennskap. Rammeplanen: Etikk og kommunikasjon – forstå andres perspektiv og vise omsorg."},
  {id:15,tittel:"Blomsten vokser fra frø",ikon:"🌻",kategori:"natur",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgBlomst/>,oppgave:"1. Farg blomsten i kontrastrikt fargevalg. 2. Tegn røttene under bakken. 3. Legg til en bie som samler nektar. 4. Tegn frø som sprer seg fra blomsten.",samtale:"Hva er en frøkapsel? Hva trenger et frø for å spire? Hva er pollinering og hvorfor er bier så viktige?",mal:"Blomsters livssyklus og insekter. Rammeplanen: Natur – forstå pollinering og samspill mellom planter og dyr."},
  {id:16,tittel:"Treets liv gjennom året",ikon:"🌳",kategori:"natur",alder:"3-6 år",rammeplan:["natur","kunst"],svg:<SvgTre/>,oppgave:"1. Farg treet med grønne blader og brun stamme. 2. Tegn et ekorn som sitter i kronen. 3. Legg til et fuglereir med egg. 4. Tegn epler eller kongler.",samtale:"Hva er forskjellen på et løvtre og et nåletre? Hva er treringer? Hvem bruker trær som hjem?",mal:"Treets biologi og årstidenes kretsløp. Rammeplanen: Natur – forstå forandringer over tid i naturen."},
  {id:17,tittel:"Husdyret katten min",ikon:"🐱",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","etikk"],svg:<SvgKatt/>,oppgave:"1. Velg kattens farge: svart, hvit, oransje eller stripete – og farg den! 2. Tegn en varm kurv med pledd. 3. Tegn en skål med mat og vann. 4. Legg til en ball av garn.",samtale:"Hva trenger katten av stell og omsorg? Hva betyr det å være ansvarlig for et dyr? Hva gjør katten når den er fornøyd?",mal:"Husdyr og dyrevelferd. Rammeplanen: Etikk – ansvar og omsorg for levende vesener."},
  {id:18,tittel:"Hunden som venn og hjelper",ikon:"🐶",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","etikk"],svg:<SvgHund/>,oppgave:"1. Farg hunden en valgfri rase og farge. 2. Tegn båndet den er i og den som holder det. 3. Tegn et hundehus med navn over døren. 4. Legg til bolle og bein.",samtale:"Hva gjør tjenestehunder – politihunder, blindehunder, redningshunder? Hva betyr det at hunden er 'menneskets beste venn'?",mal:"Husdyr og samarbeid med dyr. Rammeplanen: Etikk og nærmiljø – omsorg og respekt for dyr."},
  {id:19,tittel:"Hesten på beite",ikon:"🐴",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgHest/>,oppgave:"1. Farg hesten kastanjebrun med svart man og hale. 2. Tegn et grønt beite med gjerde rundt. 3. Tegn en stall i bakgrunnen. 4. Legg til en hestesko på bakken.",samtale:"Hva er en fole (hesteunge)? Hvilke kroppsdeler har en hest som er spesielle? Hva spiser hester?",mal:"Husdyr og dyreanatomit. Rammeplanen: Natur og kropp – sammenligne dyrs og menneskers kropper."},
  {id:20,tittel:"Kua på gården",ikon:"🐮",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","naermiljo"],svg:<SvgKu/>,oppgave:"1. Farg kua med svarte og hvite flekker. 2. Tegn en stor rød låve i bakgrunnen. 3. Tegn en bøtte under kua for melken. 4. Legg til en kalv ved siden av moren.",samtale:"Hva får vi fra kua? (Melk, ost, smør, yoghurt.) Hva heter kuungens unge? Hva er en gård?",mal:"Husdyr og matproduksjon. Rammeplanen: Nærmiljø og natur – forstå kopling mellom mat og dyr på gård."},
  {id:21,tittel:"Grisen på gårdstunet",ikon:"🐷",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgGris/>,oppgave:"1. Farg grisen lyserosa med litt gjørme på snuten. 2. Tegn en liten griseflokk rundt den. 3. Tegn et gjørmebad. 4. Legg til mat i en trau.",samtale:"Hvorfor elsker griser å bade i gjørme? Hva er grisens snute god til? Visste du at griser er blant de smarteste dyrene?",mal:"Grisens intelligens og atferd. Rammeplanen: Natur og kommunikasjon – dyrs behov og adferd."},
  {id:22,tittel:"Sauen med tykk ull",ikon:"🐑",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","naermiljo"],svg:<SvgSau/>,oppgave:"1. Farg ullen hvit og fluffy, bena og snuten svarte. 2. Tegn et lam som hopper ved siden av. 3. Tegn et gjerde og grønne åser i bakgrunnen. 4. Legg til en bjelle rundt halsen.",samtale:"Hva lager vi av saueull? Når klipper man sau og hvorfor er det viktig for sauen? Hva er en flokk?",mal:"Ull som ressurs og norsk tradisjon. Rammeplanen: Natur og nærmiljø – bærekraftig bruk av naturressurser."},
  {id:23,tittel:"Høna og eggene",ikon:"🐔",kategori:"dyr",alder:"1-5 år",rammeplan:["natur","antall"],svg:<SvgHone/>,oppgave:"1. Farg høna rødoransje med rød kam. 2. Tegn et reir med fem egg – farg hvert egg ulikt. 3. Tegn to kyllinger som nettopp har klekket. 4. Legg til korn på bakken.",samtale:"Hvor mange egg la høna i tegningen? Hva er forskjellen på egg og kylling? Hva trenger et egg for å bli til en kylling?",mal:"Fuglenes livssyklus og antallsforståelse. Rammeplanen: Antall – telle egg og kople tall til mengde."},
  {id:24,tittel:"Den lille musen i hulen",ikon:"🐭",kategori:"dyr",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgMus/>,oppgave:"1. Farg musen lysegrå med store runde ører og lang hale. 2. Tegn et lite musehull i veggen. 3. Tegn matvarer musen har samlet: ost, frø, korn. 4. Legg til tre musunger inne i hulen.",samtale:"Hva spiser mus? Hva er forskjellen mellom mus og rotte? Hva betyr det å 'samle mat til vinteren'?",mal:"Gnagere og overlevelsesstrategier. Rammeplanen: Natur – forstå dyrs instinktive atferd."},
  {id:25,tittel:"Uglen som jakter om natten",ikon:"🦉",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleny/>,oppgave:"1. Farg uglen brun med store gule øyne. 2. Tegn mørkeblå nattehimmel med halvmåne og stjerner. 3. Tegn et tre med bare greiner der uglen sitter. 4. Legg til en liten mus nede på bakken.",samtale:"Hva er et rovdyr? Hva spiser ugler? Hva er spesielt med uglenes øyne og ører sammenlignet med andre fugler?",mal:"Nattdyr og sanser. Rammeplanen: Natur – dyrs tilpasning til mørke og jakt."},
  {id:26,tittel:"Pingvinen og ungen sin",ikon:"🐧",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","etikk"],svg:<SvgPingvin/>,oppgave:"1. Farg pingvinen svart på baken og hvit foran. 2. Tegn en liten pingvinunge mellom beina. 3. Legg til isfjell og blågrønt hav. 4. Tegn snø som faller.",samtale:"Hvor bor pingviner – Nord- eller Sydpolen? Kan pingviner fly? Hvordan holder de seg varme?",mal:"Polardyr og foreldreinstinkt. Rammeplanen: Natur og etikk – foreldres omsorg på tvers av dyrearter."},
  {id:27,tittel:"Løven – dyrenes konge",ikon:"🦁",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgLove/>,oppgave:"1. Farg kroppen sandgul og manken mørk oransjebrunt. 2. Tegn savannen med høyt gress og et akasietre. 3. Legg til to løveunger som leker. 4. Tegn solen som brenner høyt.",samtale:"Hva er en savanne? Hva spiser løver? Hvem jakter i en løveflokk – hannene eller hunnene?",mal:"Rovdyr og afrikansk fauna. Rammeplanen: Natur – mangfold av dyreliv på ulike kontintenter."},
  {id:28,tittel:"Elefanten med stor snabel",ikon:"🐘",kategori:"dyr",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgElefant/>,oppgave:"1. Farg elefanten grå med rynkete hud. 2. Tegn snabelen som spruter vann. 3. Legg til store vifteformede ører. 4. Tegn en elefantflokk ved et vanningshull i bakgrunnen.",samtale:"Hva bruker elefanten snabelen til? Er elefanten det største landdyret? Hva er elfenbein?",mal:"Verdens største landdyr og dets anatomi. Rammeplanen: Natur – verdens dyreliv og truede arter."},
  {id:29,tittel:"T-Rex – den fryktelige dinosauren",ikon:"🦕",kategori:"dyr",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgDinosaur/>,oppgave:"1. Farg T-Rex mørkegrønn med lysere buk og hvite tenner. 2. Tegn en urskogjungel med bregner og palmer. 3. Legg til et stort egg bak beina. 4. Tegn en vulkan som røyker i bakgrunnen.",samtale:"Levde dinosaurene og menneskene på samme tid? Hva betyr 'utdødd'? Hva er en fossil?",mal:"Prhistorisk liv og geologi. Rammeplanen: Natur – forstå tid, forandring og naturhistorie."},
  {id:30,tittel:"Påskeliljene i hagen",ikon:"🌼",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgPaaskelilje/>,oppgave:"1. Farg blomsten klargul med hvit indre ring. 2. Tegn fem påskeliljer på rad. 3. Legg til et jordlag med en synlig løk under. 4. Tegn sol og varm luft over dem.",samtale:"Hva er en løkplante? Når planter vi påskeliljer? Hva er naturens 'våkning'?",mal:"Løkplanter og vårblomstring. Rammeplanen: Natur og kunst – forstå planters vekst og dekorasjon."},
  {id:31,tittel:"Trekkfuglene er tilbake",ikon:"🐦",kategori:"vaar",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgFuglV/>,oppgave:"1. Farg svalen blå med hvit buk og rød hals. 2. Tegn et reir under et tak med to egg i. 3. Legg til V-formasjon av fugler på himmelen. 4. Tegn grønne trær – det er vår!",samtale:"Hvor har svalene vært om vinteren? Hva er lengden på en svales reise? Hva betyr 'trekkfugl'?",mal:"Trekkfugler og sesongmigrasjon. Rammeplanen: Natur – forstå fugletrekk og årsrytmer."},
  {id:32,tittel:"Sommerfuglen om våren",ikon:"🦋",kategori:"vaar",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSommerfuglVaar/>,oppgave:"1. Farg de fire vingene i lyse vårfarger. 2. Tegn speilvendte mønstre – begge sider like. 3. Tegn en blomst den suger nektar av. 4. Legg til en larve på et blad i hjørnet.",samtale:"Hva er symmetri? Er en sommerfugls vinger symmetriske? Hva er det første den gjør om våren?",mal:"Symmetri og insektenes liv om våren. Rammeplanen: Natur og antall – oppdage mønstre og symmetri."},
  {id:33,tittel:"Vårregnet og regnbuen",ikon:"🌈",kategori:"vaar",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSkyRegn/>,oppgave:"1. Farg regnbuen med alle 7 farger. 2. Tegn regndråper som faller fra skyer på venstre side. 3. Legg til sol på høyre side. 4. Tegn vårblomster nede på bakken.",samtale:"Hva er et vindkast? Hva er vårregn godt for? Hva er forskjellen mellom vår og sommerregn?",mal:"Vær om våren og naturprosesser. Rammeplanen: Natur – observere og beskrive vær og årstider."},
  {id:34,tittel:"Vårsolen varmer",ikon:"☀️",kategori:"vaar",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgSolVaar/>,oppgave:"1. Farg solen knall gul med lange stråler. 2. Tegn en blomst som vender ansiktet mot solen. 3. Legg til en snø som smelter i hjørnet. 4. Tegn barn uten jakke – det er endelig varmt!",samtale:"Hva gjør solen for plantene? Hvorfor er solen ekstra viktig etter vinteren? Hva kjenner vi på huden i solen?",mal:"Vår, energi og kropp. Rammeplanen: Natur og kropp – forstå solens varme og virkning."},
  {id:35,tittel:"Treet får nye blader",ikon:"🌳",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgTreVaar/>,oppgave:"1. Farg stammen brun. 2. Tegn lyse grønne knopper og friske blader som spirer frem. 3. Legg til en blomst ved foten. 4. Tegn en fugl som bygger reir i kronen.",samtale:"Hvor var bladene om vinteren? Hva er en bladknop? Hva skjer med treet om våren?",mal:"Trærs livssyklus og årstider. Rammeplanen: Natur – følge forandringer gjennom årstidene."},
  {id:36,tittel:"Vårens lille kanin",ikon:"🐰",kategori:"vaar",alder:"1-5 år",rammeplan:["natur","etikk"],svg:<SvgKaninEng/>,oppgave:"1. Farg kaninen hvit med rosa ører. 2. Tegn en grønn vår-eng med gul løvetann og krokus. 3. Legg til en kaninunge ved siden av. 4. Tegn sollys som varmer.",samtale:"Hva er kaninungens navn? Hva spiser kaninen om våren? Hva er naturens 'våkning'?",mal:"Naturens vår og dyreunger. Rammeplanen: Natur og etikk – forstå ny vekst og dyreunger om våren."},
  {id:37,tittel:"Rumpetrollet i dammen",ikon:"🐸",kategori:"vaar",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgRumpetroll/>,oppgave:"1. Farg frosken lysegrønn. 2. Tegn et tjern med fire rumpetroll i ulikt stadium. 3. Legg til vannliljeblader og siv. 4. Tegn en ferdig frosk på bredden.",samtale:"Hva er de fire stadiene i en frosks liv? Hva mister rumpetrollet etter hvert? Hva betyr metamorfose?",mal:"Amfibiers metamorfose om våren. Rammeplanen: Natur – følge livssyklusen og forstå forandring."},
  {id:38,tittel:"Badedagen på stranda",ikon:"☀️",kategori:"sommer",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgStrand/>,oppgave:"1. Farg solen knall gul med lange stråler. 2. Tegn hav, sandstrand og to barn som bader. 3. Legg til en parasoll og et sandslott. 4. Tegn is i hendene til barna.",samtale:"Hva er viktig å gjøre i solen for å beskytte huden? Hva er solkrem og hva gjør den? Hva er heteslag?",mal:"Solsikkerhet og sommeropplevelser. Rammeplanen: Kropp og helse – ta vare på kroppen i ulike vær."},
  {id:39,tittel:"Iskremen smelter i varmen",ikon:"🍦",kategori:"sommer",alder:"1-5 år",rammeplan:["kropp","kommunikasjon"],svg:<SvgIskrem/>,oppgave:"1. Farg iskremen med tre lag i ulike smaker: sjokolade, jordbær og vanilje. 2. Tegn en vaffelkjegle. 3. Legg til kirsebær og strø på toppen. 4. Tegn iskrem som drypper i varmen.",samtale:"Hva er din favorittiskrem? Hva lager vi iskrem av? Hva skjer med iskrem i varmen?",mal:"Mat og temperaturforståelse. Rammeplanen: Kommunikasjon – beskrive sanseopplevelser og smakspreferanser."},
  {id:40,tittel:"Seiltur om sommeren",ikon:"⛵",kategori:"sommer",alder:"2-6 år",rammeplan:["naermiljo","natur"],svg:<SvgBat/>,oppgave:"1. Farg båten hvit med rødt seil. 2. Tegn bølger i grønnt og blått. 3. Legg til en måke som flyr over. 4. Tegn land i horisonten og en liten fyr.",samtale:"Hva er et seil og hva brukes det til? Hva er vindenergi? Hva er forskjellen mellom seilbåt og motorbåt?",mal:"Vannreiser og vindkraft. Rammeplanen: Nærmiljø – bli kjent med norsk kystliv og sjøfart."},
  {id:41,tittel:"Sykkelturen i sommerparken",ikon:"🚲",kategori:"sommer",alder:"2-6 år",rammeplan:["kropp","naermiljo"],svg:<SvgSykkelVei/>,oppgave:"1. Farg sykkelen i dine farger med reflekser på hjulene. 2. Tegn en syklist med hjelm på en vei. 3. Legg til trær og blomster langs veien. 4. Tegn et trafikklys i bakgrunnen.",samtale:"Hva bruker vi hjelm til? Hva betyr rødt, gult og grønt lys? Hva er god trafikkatferd for syklister?",mal:"Trafikksikkerhet og kroppslig mestring. Rammeplanen: Kropp og nærmiljø – trygg ferdsel og fysisk aktivitet."},
  {id:42,tittel:"Fisketur i solskinn",ikon:"🐟",kategori:"sommer",alder:"2-6 år",rammeplan:["natur","naermiljo"],svg:<SvgFiskestang/>,oppgave:"1. Farg fisken sølvblank med gullfinnet. 2. Tegn en fiskestang med snøre og krok. 3. Legg til en mark på kroken. 4. Tegn bobler fra fisken og grønt vann.",samtale:"Hva er et agn? Hva er et fiskekort og hvorfor finnes det? Hva er bærekraftig fiske?",mal:"Friluftsliv og naturtradisjoner. Rammeplanen: Nærmiljø – kjenne til norske friluftslivsaktiviteter."},
  {id:43,tittel:"Frosken og varmedammen",ikon:"🐸",kategori:"sommer",alder:"2-5 år",rammeplan:["natur","kropp"],svg:<SvgFroskBad/>,oppgave:"1. Farg frosken grønn med gul buk. 2. Tegn et varmt tjern med vannliljeblader. 3. Legg til insekter den prøver å fange. 4. Tegn den hoppe fra stein til stein.",samtale:"Hva gjør frosker om sommeren? Hva spiser de? Hva er et amfibium?",mal:"Amfibier og sommerøkologi. Rammeplanen: Natur og kropp – dyrs levevis og bevegelse."},
  {id:44,tittel:"Solsikken i blomsterenga",ikon:"🌻",kategori:"sommer",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgSolsikke/>,oppgave:"1. Farg blomsten knall gul med brun midtdel. 2. Tegn en hel blomstereng med mange farger. 3. Legg til bier og sommerfugler som besøker blomstene. 4. Tegn frø i midten av blomsten.",samtale:"Hvilken blomst er din favoritt? Hvorfor liker bier blomster? Hva er nektaret?",mal:"Naturglede og pollinering. Rammeplanen: Natur og kunst – kreativt uttrykk og naturforståelse."},
  {id:45,tittel:"Sommerfuglene telles",ikon:"🦋",kategori:"sommer",alder:"2-6 år",rammeplan:["natur","antall"],svg:<SvgSommerfuglMany/>,oppgave:"1. Farg én stor sommerfugl i detaljert mønster. 2. Tegn seks til rundt i ulike farger. 3. Legg til blomster de flyr mellom. 4. Tell alle sommerfuglene og skriv tallet.",samtale:"Hvor mange sommerfugler tegnet du? Hva spiser de? Hva betyr det å telle en naturbestand?",mal:"Natur, antall og estetikk. Rammeplanen: Antall – telle og sammenligne mengder i naturen."},
  {id:46,tittel:"Høstens regnvær",ikon:"🍁",kategori:"host",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgHostRegn/>,oppgave:"1. Farg treet med røde, oransje og gule blader. 2. Tegn regn som faller ned. 3. Legg til to barn med regnfrakk og gummistøvler. 4. Tegn pyttene de hopper i.",samtale:"Hva er høst for deg? Hva skjer med klorofyllet om høsten? Hva slags klær trenger vi om høsten?",mal:"Høst, vær og påkledning. Rammeplanen: Kropp og kommunikasjon – kleskunnskap og årstidsforståelse."},
  {id:47,tittel:"Gresskaret på tunet",ikon:"🎃",kategori:"host",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgGresskar/>,oppgave:"1. Farg gresskaret dypt oransje med grønn stilk og blader. 2. Tegn et morsomt ansikt: trekantøyne og taggete munn. 3. Lag en gul sirkel inni som lys. 4. Tegn tre gresskår rundt i ulike størrelser.",samtale:"Hva er et gresskar – er det en frukt eller grønnsak? Kan man spise gresskar? Hva er en innhøsting?",mal:"Grønnsaker om høsten og innhøsting. Rammeplanen: Natur og nærmiljø – mat fra jord til bord."},
  {id:48,tittel:"Epleplukking om høsten",ikon:"🍎",kategori:"host",alder:"1-5 år",rammeplan:["natur","kropp"],svg:<SvgEpletre/>,oppgave:"1. Farg eplet rødt og blankt med en grønn stilk og blad. 2. Tegn tre epler til på et tre over. 3. Legg til en kurv med plukket frukt. 4. Tegn en barnehånd som strekker seg opp.",samtale:"Hvilke bær og frukter modner om høsten? Hva er syltetøy og hva lager vi det av? Hva gir epler oss av næring?",mal:"Høstens frukter og mattradisjoner. Rammeplanen: Natur og kropp – kople naturen til kosthold."},
  {id:49,tittel:"Bjørnen samler seg til vinteren",ikon:"🐻",kategori:"host",alder:"2-6 år",rammeplan:["natur","kropp"],svg:<SvgBjornBaer/>,oppgave:"1. Farg bjørnen mørk brun med tykk pelskjole. 2. Tegn blåbærbusker og tyttebær rundt. 3. Legg til en honningkrukke. 4. Tegn et hi i bakgrunnen den skal inn i.",samtale:"Hvorfor spiser bjørnen mye om høsten? Hva er vinterhvile? Hva gjør den i hiet?",mal:"Dyr om høsten og forberedelse til vinter. Rammeplanen: Natur – forstå dyrs overvintringsstrategier."},
  {id:50,tittel:"Elgen på høstvandring",ikon:"🦌",kategori:"host",alder:"3-6 år",rammeplan:["natur","naermiljo"],svg:<SvgElgHost/>,oppgave:"1. Farg elgen i rødbrun høstdrakt. 2. Tegn høstfargede trær – rød, oransje, gul. 3. Legg til spor i løvet på bakken. 4. Tegn morgendis i bakgrunnen.",samtale:"Hva er elgjakt og når er det elgjaktsesongen i Norge? Hva betyr 'bærekraftig jakt'? Hva spiser elgen om høsten?",mal:"Norsk jaktkultur og naturforvaltning. Rammeplanen: Nærmiljø og etikk – forstå jaktens rolle."},
  {id:51,tittel:"Uglen om høsten",ikon:"🦉",kategori:"host",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleHost/>,oppgave:"1. Farg ugla brun og kremhvit med store gule øyne. 2. Tegn den på en grein med fargerike høstblader. 3. Legg til fullmånen bak. 4. Tegn mus og mark på bakken under.",samtale:"Hva spiser uglen? Hva er spesielt med uglens roterende hode? Hvem kan imitere lyden av en ugle?",mal:"Nattdyr og rovfuglenes jakt om høsten. Rammeplanen: Natur – nattdyrs tilpasninger og jaktevner."},
  {id:52,tittel:"Soppturen i skogen",ikon:"🍄",kategori:"host",alder:"3-6 år",rammeplan:["natur","etikk"],svg:<SvgSopp/>,oppgave:"1. Farg treet med gyllent høstbladverk. 2. Tegn sopp på skogbunnen – rødt hattsopp og brun kantarell. 3. Legg til en kurv med plukket sopp. 4. Tegn en voksen som viser soppen til et barn.",samtale:"Hva er matsopp og hva er giftig sopp? Hva er regelen om du er usikker? Hva er mycel?",mal:"Mykologi og trygghet i naturen. Rammeplanen: Natur og etikk – ferdes trygt i naturen."},
  {id:53,tittel:"Vinterlandskapet",ikon:"❄️",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgVinter/>,oppgave:"1. Farg snøen hvit og himmelen kaldblå. 2. Tegn trær med snø på grenene. 3. Legg til et lite hus med gul glød fra vinduene. 4. Tegn den lave vintersolen nær horisonten.",samtale:"Hva er rimfrost? Hva er forskjellen mellom snø, hagl og is? Hva er kuldegrader?",mal:"Vinterens naturfenomener. Rammeplanen: Natur – observere og beskrive vinter, kulde og is."},
  {id:54,tittel:"Snømannen bygges",ikon:"⛄",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgSnøfnugg/>,oppgave:"1. Farg snømannen med tre hvite kuler. 2. Gi ham gulrotnese, mørke øyne og knapperekke. 3. Tegn fargerik lue og stripete skjerf. 4. Legg til to pinner som armer.",samtale:"Hva trenger vi for å lage en snømann? Hva skjer med snømannen når solen varmer? Hva er smeltepunktet til is?",mal:"Is og snø. Rammeplanen: Natur – forstå vann i ulike aggregattilstander."},
  {id:55,tittel:"Pingvinfamilien på isen",ikon:"🐧",kategori:"vinter",alder:"2-6 år",rammeplan:["natur","etikk"],svg:<SvgPingvinFam/>,oppgave:"1. Farg pingvinen svart og hvit med gult på bryst. 2. Tegn en liten pingvinunge mellom beina. 3. Legg til isfjell og blågrønt vann. 4. Tegn en pingvin som hopper i vannet.",samtale:"Hva er Sydpolen? Kan pingviner fly? Hvordan holder de seg varme og beskytter ungene?",mal:"Polardyr og familieatferd. Rammeplanen: Natur og etikk – dyrefamiliers samarbeid."},
  {id:56,tittel:"Bjørnens vinterhvile",ikon:"🐻",kategori:"vinter",alder:"2-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgBjornHi/>,oppgave:"1. Farg bjørnen mørk brun i et hi. 2. Tegn hiet som en hule med snø over. 3. Legg til bjørneunger inni hiet. 4. Tegn bartrær med snø rundt.",samtale:"Hva er dvale og hva er vinterhvile? Hvem er inne i hiet i tillegg til bjørnmoren? Hva er det første bjørnen gjør om våren?",mal:"Vinterhvile og dyrs tilpasning. Rammeplanen: Natur – forstå dyrs overvintringsstrategier."},
  {id:57,tittel:"Vintersolen er lav",ikon:"☀️",kategori:"vinter",alder:"3-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgSolLav/>,oppgave:"1. Farg solen gul men tegn den lavt over horisonten. 2. Tegn lange skygger fra trær. 3. Legg til snø som glitrer. 4. Tegn en figur som ser mot den lave solen.",samtale:"Hvorfor er solen lav om vinteren? Hva er solhverv? Hva er det korteste og lengste vi kan ha av dagslys i Norge?",mal:"Solens bane og årstider. Rammeplanen: Natur – forstå jordas bevegelse og lysets forandringer."},
  {id:58,tittel:"Julenissen fra Nordpolen",ikon:"🎅",kategori:"jul",alder:"1-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgJulemann/>,oppgave:"1. Farg drakten rød og beltet svart. 2. Gi ham hvitt langt skjegg og røde kinn. 3. Tegn en stor sekk med gaver på ryggen. 4. Legg til et reinsdyr ved siden.",samtale:"Hva er julens tradisjon i din familie? Hva er juleaftens viktigste stund for deg? Hva er forskjellen mellom jul i Norge og i et varmt land?",mal:"Juletradisjoner og kulturforskjeller. Rammeplanen: Kunst og kommunikasjon – fortelle om og sammenligne tradisjoner."},
  {id:59,tittel:"Adventsstjernen",ikon:"⭐",kategori:"jul",alder:"2-6 år",rammeplan:["kunst","antall"],svg:<SvgAdventlys/>,oppgave:"1. Farg stjernen gull med hvit glød rundt. 2. Tegn fire adventslys under stjernen. 3. Farg ett lys tent (gult) og tre utente (hvite). 4. Skriv tallene 1–4 på lysene.",samtale:"Hva er advent? Hva er adventsstid? Hva er de fire søndagene i advent?",mal:"Adventskalender og nedtelling. Rammeplanen: Antall og kommunikasjon – tellerekkefølge og kalendertid."},
  {id:60,tittel:"Juletreet med lys",ikon:"🎄",kategori:"jul",alder:"1-6 år",rammeplan:["kunst","etikk"],svg:<SvgGran/>,oppgave:"1. Farg treet dypt grønt. 2. Tegn fargerike kuler, lametta og pepperkaker som henger. 3. Legg til en stjerne på toppen. 4. Tegn pakker under treet.",samtale:"Hva slags tre er et juletre? Hva er juletreets opprinnelse? Hvem i familien pynter treet hjemme?",mal:"Juletreet og norsk kulturtradisjon. Rammeplanen: Etikk og kunst – kjenne til og sette pris på egne tradisjoner."},
  {id:61,tittel:"Julehjertene",ikon:"❤️",kategori:"jul",alder:"2-5 år",rammeplan:["etikk","kunst"],svg:<SvgHjerte/>,oppgave:"1. Farg et stort hjerte rødt og hvitt. 2. Legg til et flettet mønster – røde og hvite striper. 3. Tegn en sløyfe øverst for å henge det i treet. 4. Skriv et navn inni hjertet.",samtale:"Hva er et flettet julejhjerte, og hvem fant det opp? Hva er et symbol? Hva symboliserer et hjerte?",mal:"Julehjertetradisjon og symboler. Rammeplanen: Kunst og etikk – kulturarv og kreativt uttrykk."},
  {id:62,tittel:"Pepperkakebaking",ikon:"🍪",kategori:"jul",alder:"2-6 år",rammeplan:["kropp","kunst"],svg:<SvgPepperkake/>,oppgave:"1. Farg pepperkaken gyldenbrun. 2. Tegn glasur i hvit og rød på toppen. 3. Legg til fargerikt sukkerstrø og julemotiver. 4. Tegn bakerutstyr rundt: kjevle og utstikkere.",samtale:"Hva er de viktigste ingrediensene i pepperkaker? Hva er kanel og ingefær? Hva er smaken av julen for deg?",mal:"Matlaging og juletradisjon. Rammeplanen: Kropp og kunst – sanseerfaringer knyttet til matlaging."},
  {id:63,tittel:"Snømannen i julegardin",ikon:"⛄",kategori:"jul",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgSnomannJul/>,oppgave:"1. Farg snømannen med tre kuler. 2. Gi ham julehatt og rødt skjerf. 3. Tegn juletreet i bakgrunnen med lys. 4. Legg til pakker rundt og snøfloker i luften.",samtale:"Hva er det koselige med en hvit jul? Hva gjør vi ute om vinteren? Hva er en hvit jul?",mal:"Vinter og julekultur. Rammeplanen: Kunst og natur – koble årstid med kulturelle tradisjoner."},
  {id:64,tittel:"Reinsdyrene flyr",ikon:"🦌",kategori:"jul",alder:"2-6 år",rammeplan:["kommunikasjon","kunst"],svg:<SvgReinsdyr/>,oppgave:"1. Farg reinsdyret brun med rødbrun nese. 2. Tegn det i lufta med bena løftet. 3. Legg til en slede det trekker med gaver i. 4. Tegn stjerner og nattehimmel rundt.",samtale:"Hva heter Julenissens reinsdyr? Hva er Rudolphs spesielle kjennetegn? Er dette en sann eller en fiktiv fortelling?",mal:"Julefortellinger og fantasi. Rammeplanen: Kommunikasjon – høre og gjenfortelle eventyr og sagn."},
  {id:65,tittel:"Gavene under treet",ikon:"🎁",kategori:"jul",alder:"1-5 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgGave/>,oppgave:"1. Farg ballongene som fargerike gaver i rødt, grønt og gull. 2. Tegn sløyfer og bånd på dem. 3. Legg til juletreet i bakgrunnen. 4. Tegn et barn som strekker seg mot en gave.",samtale:"Hva er det fineste med å gi en gave? Og det fineste med å få en? Hva er det beste med juleaften?",mal:"Glede ved å gi og motta. Rammeplanen: Etikk og kommunikasjon – empati og raushet."},
  {id:66,tittel:"Påskeharen gjemmer egg",ikon:"🐰",kategori:"paske",alder:"1-5 år",rammeplan:["kunst","etikk"],svg:<SvgKaninEgg/>,oppgave:"1. Farg påskeharen lysegul med rosa ører. 2. Tegn fargerike egg gjemt i gress, bak steiner og i busker. 3. Legg til vårblomster rundt. 4. Tegn et barn som leter med en kurv.",samtale:"Hva er opprinnelsen til påskeharen og eggjaktingen? Hva er påsketradisjoner i Norge? Hva feirer vi egentlig i påsken?",mal:"Påsketradisjoner og kulturhistorie. Rammeplanen: Kommunikasjon og etikk – kjenne til og snakke om høytider."},
  {id:67,tittel:"Påskekyllingen klekker ut",ikon:"🐣",kategori:"paske",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgKylling/>,oppgave:"1. Farg kyllingen knall gul med oransje nebb. 2. Tegn et eggeskall som kyllingen nettopp har sprukket. 3. Legg til gress og vårblomster rundt. 4. Tegn en varm solstråle ovenfra.",samtale:"Hva skjer inne i egget før det klekker? Hvem passer på egget? Hva er det første kyllingen gjør?",mal:"Fuglenes formering og egget. Rammeplanen: Natur – fuglenes livssyklus fra egg til fugl."},
  {id:68,tittel:"Påskeliljene til påske",ikon:"🌼",kategori:"paske",alder:"2-5 år",rammeplan:["natur","kunst"],svg:<SvgPaaskelilje2/>,oppgave:"1. Farg blomsten klargul med hvit indre ring. 2. Tegn fem påskeliljer i en hage. 3. Legg til et jordlag med en synlig blomsterløk under. 4. Tegn sol og varm luft.",samtale:"Hva er en løkplante? Når planter vi påskeliljer? Hva er symbolikken i påskeliljer?",mal:"Løkplanter og vårblomstring. Rammeplanen: Natur og kunst – forstå planters vekst og dekorasjon."},
  {id:69,tittel:"Påskeegget med mønster",ikon:"🥚",kategori:"paske",alder:"2-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgEgg/>,oppgave:"1. Tegn om frukten til et rundt påskeegg. 2. Del egget i tre deler og lag tre ulike mønstre: striper, prikker, blomster. 3. Bruk minst fire farger. 4. Tegn en kurv med tre egg.",samtale:"Hva symboliserer påskeegg? Hva er tradisjonelle påskefarger? Hva er den franske tradisjonen med sjokoladeegg?",mal:"Dekorasjon og mønstre. Rammeplanen: Kunst – kreativt uttrykk og mønsterforståelse."},
  {id:70,tittel:"Påskekaken med kyllinger",ikon:"🍰",kategori:"paske",alder:"2-6 år",rammeplan:["kropp","kunst"],svg:<SvgKake/>,oppgave:"1. Farg kaken gul med glasur. 2. Tegn kyllingfigurer og fargerike egg på toppen. 3. Legg til grønt graspynt. 4. Tegn en påskeliljedekorasjon på siden.",samtale:"Hva pleier folk å spise i påsken i Norge? Hva er påskens symbolske farger? Har du bakt noe i påsken?",mal:"Påskemat og tradisjoner. Rammeplanen: Kropp og kommunikasjon – mat, tradisjoner og sanseerfaringer."},
  {id:71,tittel:"Gresskaret lyser i mørket",ikon:"🎃",kategori:"halloween",alder:"3-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgGresskarNatt/>,oppgave:"1. Farg gresskaret sterkt oransje. 2. Tegn et hult innside med et lys. 3. Legg til et skremmende ansikt: trekantøyne og taggede tenner. 4. Tegn mørk nattehimmel rundt.",samtale:"Hva er Halloween og hva er opprinnelsen til skikken? Hva betyr 'trick or treat'? Hva er gresskaret symbol på?",mal:"Halloween og kulturtradisjoner. Rammeplanen: Kommunikasjon og kunst – lære om fremmede kulturskikker."},
  {id:72,tittel:"Den svarte Halloween-katten",ikon:"🐈‍⬛",kategori:"halloween",alder:"2-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgSvartkatt/>,oppgave:"1. Farg katten helsvart med neongrønne øyne. 2. Tegn den på et gjerde i halvmånelys. 3. Legg til spindelvev og edderkopper rundt. 4. Tegn fullmånen bak.",samtale:"Hvorfor er svart katt forbundet med overtro? Hva er en overtro og hva er fakta? Hva er en myte?",mal:"Overtro og kritisk tenkning. Rammeplanen: Kommunikasjon og etikk – skille mellom fakta og myter."},
  {id:73,tittel:"Halloween-ugla og flaggermusen",ikon:"🦉",kategori:"halloween",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgUgleHalloween/>,oppgave:"1. Farg ugla mørk brun med gule øyne. 2. Tegn to flaggermus rundt den. 3. Legg til et spøkelseshus i bakgrunnen. 4. Tegn fullmånen bak skyene.",samtale:"Hva er en flaggermus – er det en fugl? Hva er ekkolokalisering? Hvorfor flyr flaggermus om natten?",mal:"Nattdyr og ekkolokalisering. Rammeplanen: Natur og kommunikasjon – nattdyrs sanser."},
  {id:74,tittel:"Halloween-musen med gresskar",ikon:"🐭",kategori:"halloween",alder:"2-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgMusHalloween/>,oppgave:"1. Farg musen mørkegrå med store ører. 2. Tegn den bærende en liten oransje gresskarekurv. 3. Legg til halloween-symboler rundt: flaggermus, edderkoppnett. 4. Tegn halloween-godteri i kurven.",samtale:"Hva er et kostyme? Hvorfor kler vi oss ut på Halloween? Hvilke halloween-symboler kjenner du til?",mal:"Rollelek og masker. Rammeplanen: Kommunikasjon og kunst – dramatisering og kreativ utfoldelse."},
  {id:75,tittel:"17. mai-familien i tog",ikon:"🇳🇴",kategori:"mai17",alder:"2-6 år",rammeplan:["naermiljo","etikk"],svg:<SvgFamilieMai/>,oppgave:"1. Farg familien i finstasen. 2. Tegn norske flagg i hendene på alle. 3. Legg til 17. mai-rosetter på klærne. 4. Tegn et barnetog i bakgrunnen.",samtale:"Hva feirer vi 17. mai? Hva skjedde i 1814? Hva er en grunnlov?",mal:"Norsk nasjonaldag og demokrati. Rammeplanen: Nærmiljø og etikk – forstå norsk identitet og demokrati."},
  {id:76,tittel:"Flaggballongene",ikon:"🎈",kategori:"mai17",alder:"1-5 år",rammeplan:["kunst","antall"],svg:<SvgBallong/>,oppgave:"1. Farg ballongene rødt, hvitt og blått som det norske flagget. 2. Tegn ti ballonger i ulike størrelser. 3. Legg til snorer som holder dem. 4. Tell og skriv antallet.",samtale:"Hva betyr fargen rød, hvit og blå på flagget? Hva er riksvåpenet? Hva er nasjonalsangen vår?",mal:"Norsk nasjonal symbolikk. Rammeplanen: Kunst og antall – farger, symboler og telleøvelser."},
  {id:77,tittel:"Barnetoget og musikken",ikon:"🏠",kategori:"mai17",alder:"2-6 år",rammeplan:["naermiljo","kommunikasjon"],svg:<SvgHusNorge/>,oppgave:"1. Farg huset hvitt med norsk flagg ute. 2. Tegn et barnetog som passerer – barn med flagg. 3. Legg til folk langs veien som heier. 4. Tegn is og pølse i hendene.",samtale:"Hva synger vi i barnetoget? Hva er et skolekorps? Hva spiller skolekorpset på 17. mai?",mal:"17. mai-tradisjoner og musikk. Rammeplanen: Nærmiljø og kommunikasjon – delta i og forstå nasjonale markeringer."},
  {id:78,tittel:"Regnbuen – 7 farger",ikon:"🌈",kategori:"natur",alder:"2-6 år",rammeplan:["natur","antall"],svg:<SvgFarger/>,oppgave:"1. Farg regnbuen i riktig rekkefølge: rød, oransje, gul, grønn, blå, indigo, fiolett. 2. Tegn regndråper på venstre side og sol på høyre. 3. Skriv tallene 1–7 på buen. 4. Tegn blomster nede på bakken.",samtale:"Hvor mange farger har regnbuen? Hva må til for å se den? Kan man finne enden på regnbuen?",mal:"Farger, vær og antall. Rammeplanen: Natur og antall – rekkefølge og naturlige farger."},
  {id:79,tittel:"Livet i havet",ikon:"🌊",kategori:"natur",alder:"2-6 år",rammeplan:["natur","kunst"],svg:<SvgHavbunn/>,oppgave:"1. Farg fisken sølvblank med gullfinnet. 2. Tegn et hav med tang, koraller og sand. 3. Legg til fire andre sjødyr: sjøstjerne, krabbe, blekksprut, sjøhest. 4. Tegn bobler som stiger opp.",samtale:"Hvilke dyr lever i havet? Hva er et korallrev? Hva er havets rolle for jordens klima?",mal:"Marine økosystemer og biologisk mangfold. Rammeplanen: Natur – forstå havets leveforhold."},
  {id:80,tittel:"Blomsterenga og pollinererne",ikon:"🌺",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kunst"],svg:<SvgEng/>,oppgave:"1. Farg blomsten i knallfager – gul, rød og lilla. 2. Tegn en hel eng med ville blomster. 3. Legg til tre bier og to sommerfugler. 4. Tegn sopp og gress mellom blomstene.",samtale:"Hva er en eng? Hva er en pollinerer? Hva skjer med insektene som samler nektar?",mal:"Naturmangfold og pollinering. Rammeplanen: Natur og kunst – forstå samspillet mellom blomster og dyr."},
  {id:81,tittel:"Fuglen som synger",ikon:"🐤",kategori:"natur",alder:"1-5 år",rammeplan:["natur","kommunikasjon"],svg:<SvgFuglSang/>,oppgave:"1. Farg fuglen i lyse, vakre farger. 2. Tegn den sittende på en blomstrende gren. 3. Legg til noter eller snakkebobler med 'kvitreliret'. 4. Tegn et reir med egg på neste gren.",samtale:"Hvilken norsk fugl synger mest om morgenen? Hva er et fuglenavn – ornitologi? Hva spiser fugler?",mal:"Fugleliv og fuglenes sang. Rammeplanen: Natur og kommunikasjon – lytte til og lære om naturen."},
  {id:82,tittel:"Stjernehimmelen",ikon:"🌟",kategori:"natur",alder:"3-6 år",rammeplan:["natur","antall"],svg:<SvgStjerne/>,oppgave:"1. Farg stjernen sterkt gul. 2. Tegn minst 10 stjerner i ulike størrelser. 3. Legg til en halvmåne og tre planeter. 4. Tegn Melkeveien som en lys stripe.",samtale:"Hva er et stjernebilde? Hva er den nærmeste stjernen til jorda? Hva er en planet?",mal:"Astronomi og undring. Rammeplanen: Natur og antall – telle, observere og undre seg over universet."},
  {id:83,tittel:"Hjemmet og familien",ikon:"🏡",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","naermiljo"],svg:<SvgFamilieHjem/>,oppgave:"1. Farg hver person ulikt – ulik hudfarge, hår og klær. 2. Tegn dem i en felles aktivitet. 3. Legg til detaljer som viser personlighet. 4. Tegn et hjem med hage rundt.",samtale:"Hvem er i din familie? Er alle familier like – hva er likt og ulikt? Hva gjør din familie spesiell?",mal:"Familieformer og mangfold. Rammeplanen: Etikk og nærmiljø – respektere ulike familier."},
  {id:84,tittel:"Venner leker sammen",ikon:"👫",kategori:"mennesker",alder:"2-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgVennerLeker/>,oppgave:"1. Farg de to vennene med ulike utseender og klær. 2. Tegn dem i en lek – sandkasse, ball eller sykkel. 3. Legg til en snakkeboble med noe hyggelig. 4. Tegn solen og et fint vær.",samtale:"Hva gjør gode venner for hverandre? Hva gjør man om en venn er lei seg? Hva er inkludering?",mal:"Vennskap og sosial læring. Rammeplanen: Etikk og kommunikasjon – forstå vennskap og inkludering."},
  {id:85,tittel:"Besteforeldre og barnebarn",ikon:"👨‍👩‍👧‍👦",kategori:"mennesker",alder:"3-6 år",rammeplan:["etikk","naermiljo"],svg:<SvgFamilieEldre/>,oppgave:"1. Farg familien: bestemor, bestefar og barnebarn med ulike aldersdetaljer. 2. Tegn dem i en felles aktivitet: bakst, fiske eller lesing. 3. Legg til detaljer som viser kjærlighet. 4. Tegn et koselig hjem.",samtale:"Hva er besteforeldre? Hva kan vi lære av eldre? Hva er 'generasjoner'?",mal:"Generasjoner og familietilknytning. Rammeplanen: Etikk og nærmiljø – verdsette alle aldersgrupper."},
  {id:86,tittel:"Gledens farger",ikon:"💖",kategori:"folelser",alder:"2-6 år",rammeplan:["etikk","kunst"],svg:<SvgGledefarge/>,oppgave:"1. Farg et stort hjerte i din 'gledsfarge'. 2. Tegn mange forskjellige glade ansikter rundt. 3. Legg til ballonger og konfetti. 4. Skriv noe fint inni hjertet.",samtale:"Hvilken farge er 'glede' for deg? Hva gjør deg glad? Hva er smil og latter godt for kroppen?",mal:"Emosjonelt vokabular og sinnstilstander. Rammeplanen: Etikk – forstå og sette ord på egne følelser."},
  {id:87,tittel:"Glad og trist",ikon:"😀",kategori:"folelser",alder:"2-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgGladSorg/>,oppgave:"1. Farg de to vennene – én som smiler og én som gråter. 2. Tegn sol over den glade og sky over den triste. 3. Legg til den glade vennen som trøster. 4. Tegn en klemme mellom dem.",samtale:"Er det ok å gråte? Hva kan vi si til noen som er lei seg? Hva betyr å trøste?",mal:"Emosjonell intelligens og trøst. Rammeplanen: Etikk og kommunikasjon – forstå og respondere på andres følelser."},
  {id:88,tittel:"Trygg og redd",ikon:"🤗",kategori:"folelser",alder:"2-5 år",rammeplan:["etikk","naermiljo"],svg:<SvgKlem/>,oppgave:"1. Farg en voksen som holder et barn. 2. Tegn trygge omgivelser: koselig hjem med pledd og puter. 3. Legg til hunder eller bamser som symboler for trygghet. 4. Tegn et smil på begge.",samtale:"Hva gjør deg trygg? Hvem henvender du deg til når du er redd? Hva er forskjellen mellom å være redd og å være modig?",mal:"Trygghetsfølelse og tilknytningspersoner. Rammeplanen: Etikk – bygge trygge relasjoner."},
  {id:89,tittel:"Sinne og ro",ikon:"💝",kategori:"folelser",alder:"3-6 år",rammeplan:["etikk","kommunikasjon"],svg:<SvgPust/>,oppgave:"1. Del hjertet i to – farg én halvdel rød (sint) og én blå (rolig). 2. Tegn et ansikt med sinne på én side og ro på den andre. 3. Legg til puste-bobler: 'inn... ut...' 4. Tegn en person som puster dypt.",samtale:"Hva er sinne? Hva kan vi gjøre når vi er veldig sinte? Hva er 'pusteøvelser'?",mal:"Følelsesregulering og sinnsro. Rammeplanen: Etikk – strategier for å håndtere sterke følelser."},
  {id:90,tittel:"Eplet som er sunt",ikon:"🍎",kategori:"mat",alder:"1-5 år",rammeplan:["kropp","natur"],svg:<SvgEple/>,oppgave:"1. Farg eplet rødt med et glinsende hvit felt. 2. Tegn stilken og et lite blad. 3. Legg til et bitt tatt ut av eplet. 4. Tegn et lite 'C' symbol for vitamin C.",samtale:"Hva er et vitamin og hva gjør vitaminer for oss? Hva er vitamin C? Hva er frukt og grønt godt for?",mal:"Ernæring og vitaminer. Rammeplanen: Kropp – forstå sunn mat og næringstoffer."},
  {id:91,tittel:"Bananen fra tropene",ikon:"🍌",kategori:"mat",alder:"1-4 år",rammeplan:["kropp","natur"],svg:<SvgBanan/>,oppgave:"1. Farg bananen knall gul med brune flekker for å vise den er moden. 2. Tegn den i en fruktskål med andre frukter. 3. Legg til et palmetre bananene vokser på. 4. Tegn en ape som spiser en banan.",samtale:"Hva er et tropisk land? Hvilke frukter dyrkes i Norge og hvilke importeres? Hva er kali (mineral i banan)?",mal:"Mat fra ulike verdensdeler. Rammeplanen: Natur og kropp – forstå matens opprinnelse."},
  {id:92,tittel:"Min favorittiskrem",ikon:"🍨",kategori:"mat",alder:"1-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgIskremBoks/>,oppgave:"1. Farg iskrem med minst fire lag i ulike farger. 2. Tegn strø, kjeks og kirsebær. 3. Legg til en serviett og en skje. 4. Tegn solen som smelter den litt.",samtale:"Hva er iskrem laget av? Hva er fløte? Hva er forskjellen mellom iskrem og sorbet?",mal:"Matprosessering og meieriprodukter. Rammeplanen: Kropp og kommunikasjon – lære om matproduksjon."},
  {id:93,tittel:"Bursdagskaken min",ikon:"🎂",kategori:"mat",alder:"2-6 år",rammeplan:["antall","kommunikasjon"],svg:<SvgCupcake/>,oppgave:"1. Farg kaken med glasur og fargerike lag. 2. Tegn lys på toppen – like mange som du er år gammel. 3. Legg til pynt: ballonger, konfetti, figurer. 4. Skriv en gratulasjon.",samtale:"Hvem er du – hvor mange år fyller du? Hva er tradisjonen med lys på kaken? Hva er en overraskelseskake?",mal:"Tall og bursdagstradisjoner. Rammeplanen: Antall – telle antall år og kople til bursdagsritual."},
  {id:94,tittel:"Grønnsaker er sunne",ikon:"🥕",kategori:"mat",alder:"3-6 år",rammeplan:["kropp","natur"],svg:<SvgGulrot/>,oppgave:"1. Farg frukten grønn og tegn en gulrot ved siden. 2. Tegn en tallerken med minst fem grønnsaker. 3. Legg til tekst ved siden: 'vitamin', 'fiber'. 4. Tegn et gledelig barn som spiser.",samtale:"Hva er en grønnsak og hva er en frukt? Hva er fibrer? Hvilke grønnsaker vokser under jorda?",mal:"Kosthold og helse. Rammeplanen: Kropp – forstå grønnsakers ernæringsmessige verdi."},
  {id:95,tittel:"Bilen og trafikken",ikon:"🚗",kategori:"kjoretoy",alder:"2-5 år",rammeplan:["naermiljo","kommunikasjon"],svg:<SvgBil/>,oppgave:"1. Farg bilen din favorittfarge med klar lakk. 2. Tegn en vei med trafikklys og et fotgjengerfelt. 3. Legg til skilt: stopp, vikeplass, 30 km/t. 4. Tegn tre barn som venter ved fotgjengerfeltet.",samtale:"Hva betyr de forskjellige trafikksignalene? Hva er et fotgjengerfelt? Hva er 30-sone?",mal:"Trafikkregler og sikker ferdsel. Rammeplanen: Nærmiljø – forstå trafikk og trygg ferdsel."},
  {id:96,tittel:"Seilbåten på havet",ikon:"⛵",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["naermiljo","natur"],svg:<SvgFyr/>,oppgave:"1. Farg skroget hvitt og seilet stripete rødt og hvitt. 2. Tegn bølger i blå nyanser. 3. Legg til en kompass på dekket. 4. Tegn en fyr på land i horisonten.",samtale:"Hva er et kompass? Hva er en fyr og hva brukes den til? Hva er vindenergi?",mal:"Sjøfart og navigasjon. Rammeplanen: Nærmiljø – bli kjent med norsk sjøfartstradisjon."},
  {id:97,tittel:"Flyet i lufta",ikon:"✈️",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["naermiljo","kommunikasjon"],svg:<SvgFly/>,oppgave:"1. Farg flyet hvitt med fargerik hale og logo. 2. Tegn hvite kondensstriper etter flyet. 3. Legg til skyer i ulike høyder. 4. Tegn bakken under med byer, fjell og hav.",samtale:"Hva er en kondensstripe? Hva driver et fly fremover? Hva er den høyeste flygehøyden?",mal:"Luftfart og fysikk. Rammeplanen: Nærmiljø – forstå moderne transportmidler."},
  {id:98,tittel:"Toget på langtur",ikon:"🚂",kategori:"kjoretoy",alder:"1-5 år",rammeplan:["naermiljo","kropp"],svg:<SvgTog/>,oppgave:"1. Farg lokomotivet rødt med svart røykpipe. 2. Tegn skinner som strekker seg ut i fjerneten. 3. Legg til tunneler og broer langs ruten. 4. Tegn passasjerer som vinker fra vinduene.",samtale:"Hva er et lokomotiv? Hva er forskjellen mellom tog og trikk? Er tog eller bil mest miljøvennlig?",mal:"Skinnegående transport og miljø. Rammeplanen: Nærmiljø – forstå offentlig transport og bærekraft."},
  {id:99,tittel:"Sykkelen med hjelm",ikon:"🚲",kategori:"kjoretoy",alder:"2-6 år",rammeplan:["kropp","naermiljo"],svg:<SvgSykkel/>,oppgave:"1. Farg sykkelen og alle deler: hjul, kjede, styre. 2. Legg til en hjelm, reflekser og lys. 3. Tegn en sykkelsti med klar merking. 4. Tegn et barn med hjelm og sykkelbriller.",samtale:"Hva er de forskjellige delene på en sykkel? Hva er en sykkelsti? Hva er refleks og hva gjør den?",mal:"Sykling og trafikksikkerhet. Rammeplanen: Kropp og nærmiljø – motorikk og sikker ferdsel."},
  {id:100,tittel:"Hjemmet mitt",ikon:"🏠",kategori:"bygg",alder:"1-5 år",rammeplan:["naermiljo","kunst"],svg:<SvgHus/>,oppgave:"1. Farg huset slik ditt ser ut – farge på vegg, vindu, tak. 2. Tegn hagen med planter og gjerde. 3. Legg til din favorittdetalj av huset. 4. Tegn en fuglekasse i hagen.",samtale:"Hva er ditt favorittrom? Hva gjøres i stuen, kjøkkenet og badet? Hva er 'hjem' for deg?",mal:"Hjem og identitet. Rammeplanen: Nærmiljø – forstå nærsamfunnets strukturer og personlig tilhørighet."},
  {id:101,tittel:"Barnehagen vår",ikon:"🏫",kategori:"bygg",alder:"1-5 år",rammeplan:["naermiljo","etikk"],svg:<SvgBarnehage/>,oppgave:"1. Farg barnehagen med store vinduer og fargerike vegger. 2. Tegn lekestativ, sandkasse og gynger ute. 3. Legg til barn og barnehagelærere som leker. 4. Tegn et norsk flagg utenfor.",samtale:"Hva er din favorittdel av barnehagen? Hva er de voksnes oppgave her? Hva betyr 'fellesskap'?",mal:"Barnehagens rolle og fellesskap. Rammeplanen: Nærmiljø og etikk – forstå fellesskapet i barnehagen."},
  {id:102,tittel:"Drømmehuset mitt",ikon:"🏰",kategori:"bygg",alder:"3-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgDrommehus/>,oppgave:"1. Begynn med husformen og legg til tårn, balkonger og terrasser. 2. Legg til noe fantasifullt: taubane, basseng, trampoline. 3. Farg det i fantasifulle farger. 4. Tegn naboer og omgivelser rundt.",samtale:"Hvis du fikk designe ditt drømmehus, hva ville det ha? Hva er en arkitekt? Hva er de viktigste rommene i et hus?",mal:"Kreativ tenkning og arkitektur. Rammeplanen: Kunst og kommunikasjon – uttrykke ideer gjennom tegning."},
  {id:103,tittel:"Ballongene flyr",ikon:"🎈",kategori:"festlig",alder:"1-5 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgBallongMany/>,oppgave:"1. Farg ballongene i regnbuens farger – minst fem. 2. Tegn snorer og et barn som holder dem. 3. Legg til konfetti rundt. 4. Tegn én ballong som slipper unna og flyr opp.",samtale:"Hva er helium og hva gjør at ballonger flyr opp? Hva er en fest for deg? Hva er konfetti?",mal:"Festglede og fysikk. Rammeplanen: Kunst og kommunikasjon – kreativ utfoldelse og naturforståelse."},
  {id:104,tittel:"Stjerneregnet",ikon:"⭐",kategori:"festlig",alder:"2-5 år",rammeplan:["kunst","antall"],svg:<SvgStjerneSkudd/>,oppgave:"1. Farg en stor stjerne gullgul. 2. Tegn 12 stjerner i ulike størrelser rundt. 3. Legg til glitter-kryss rundt de største. 4. Tell alle stjernene og skriv tallet.",samtale:"Hva er et stjernebilde? Hva er solen – er den en stjerne? Hvem kan telle høyest?",mal:"Astronomi og antall. Rammeplanen: Kunst og antall – estetisk utfoldelse og telling."},
  {id:105,tittel:"Bursdagsfesten",ikon:"🎂",kategori:"festlig",alder:"2-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgBursdagKake/>,oppgave:"1. Farg en flott bursdagskake med lag og glasur. 2. Tegn lys – ett for hvert år du er gammel. 3. Legg til gaver, ballonger og festpynt rundt. 4. Skriv bursdagsbarnets navn på kaken.",samtale:"Hva er det spesielle med bursdagen din? Hva er den beste gaven du har fått? Hva betyr det å bli et år eldre?",mal:"Milepæler og personlig vekst. Rammeplanen: Kommunikasjon – fortelle om seg selv, sin alder og familie."},
  {id:106,tittel:"Roboten min venn",ikon:"🤖",kategori:"teknologi",alder:"3-6 år",rammeplan:["kommunikasjon","etikk"],svg:<SvgRobot/>,oppgave:"1. Farg robotens hode sølv eller blå. 2. Gi øynene fargerike lysdioder – en farge du velger! 3. Tegn knapper og skjermer på magen. 4. Legg til ledninger og gnister rundt roboten.",samtale:"Hva er en robot? Hva kan roboter gjøre som mennesker ikke kan? Er en robot levende?",mal:"Teknologi og menneskelige egenskaper. Rammeplanen: Kommunikasjon – undre seg over teknologi og sammenligne med mennesker."},
  {id:107,tittel:"Roboten hjelper i barnehagen",ikon:"🤖",kategori:"teknologi",alder:"4-6 år",rammeplan:["etikk","naermiljo"],svg:<SvgRobot2/>,oppgave:"1. Farg roboten i barnehagens farger. 2. Tegn den bærende en bok eller ryddende leker. 3. Legg til barn som ser på og vinker. 4. Tegn et hjerte på robotens bryst.",samtale:"Hva ville du lært en robot å gjøre? Kan en robot være venn? Hva er forskjellen på en maskin og et menneske?",mal:"Teknologi i hverdagen og etiske spørsmål. Rammeplanen: Etikk og nærmiljø – reflektere over teknologiens rolle."},
  {id:108,tittel:"Raketten skytes opp",ikon:"🚀",kategori:"romfart",alder:"3-6 år",rammeplan:["natur","kommunikasjon"],svg:<SvgRakette/>,oppgave:"1. Farg raketten hvit med fargerike striper. 2. Tegn flammene nederst i gult og oransje. 3. Legg til stjerner og planeter rundt. 4. Tegn røykspor etter raketten.",samtale:"Hva er et rakettdrivstoff? Hvorfor skytes raketter opp med så mye fart? Hva er verdensrommet?",mal:"Romfart og tyngdekraft. Rammeplanen: Natur – undre seg over universet og teknologi."},
  {id:109,tittel:"Astronauten i verdensrommet",ikon:"👨‍🚀",kategori:"romfart",alder:"3-6 år",rammeplan:["natur","kropp"],svg:<SvgAstronaut/>,oppgave:"1. Farg romdressen hvit med fargerik nasjonalitet-stripe. 2. Tegn visir med speilblankt glass. 3. Legg til oksygentanken på ryggen. 4. Tegn jorden i bakgrunnen sett fra verdensrommet.",samtale:"Hva spiser astronauter i verdensrommet? Hva er tyngdeløshet? Hva er ISS – den internasjonale romstasjonen?",mal:"Romfart og menneskekroppen. Rammeplanen: Natur og kropp – forstå rommet og astronautenes liv."},
  {id:110,tittel:"Gitarspilleren på scenen",ikon:"🎸",kategori:"musikk",alder:"3-6 år",rammeplan:["kunst","kommunikasjon"],svg:<SvgGitar/>,oppgave:"1. Farg gitarkroppen i en varm farge – brun, rød eller oransje. 2. Tegn strengene i sølv og gull. 3. Legg til noter som flyr fra gitaren. 4. Tegn en person som spiller den.",samtale:"Hva er en gitar laget av? Hva er forskjellen mellom akustisk og elektrisk gitar? Hva er din favorittlåt?",mal:"Musikkinstrumenter og lydlære. Rammeplanen: Kunst og kultur – utforske musikk som kunstform."},
  {id:111,tittel:"Orkesteret spiller",ikon:"🥁",kategori:"musikk",alder:"3-6 år",rammeplan:["kunst","etikk"],svg:<SvgTrommer/>,oppgave:"1. Farg gitaren i kontrastfull farge. 2. Tegn et band rundt: trommer, mikrofon, keyboard. 3. Legg til et publikum med glade ansikter. 4. Tegn lys og konfetti over scenen.",samtale:"Hva er et orkester? Hva er forskjellen mellom et band og et orkester? Hvilke instrumenter kjenner du til?",mal:"Musikksamarbeid og ulike instrumenter. Rammeplanen: Etikk og kunst – samspill og respekt i fellesskap."},
  {id:112,tittel:"Fotballkampen",ikon:"⚽",kategori:"sport",alder:"3-6 år",rammeplan:["kropp","etikk"],svg:<SvgFotball/>,oppgave:"1. Farg ballen svart og hvit i klassisk mønster. 2. Tegn et mål med nett bak. 3. Legg til to lag med fargerike drakter. 4. Tegn jubel fra banen.",samtale:"Hva er reglene i fotball? Hva er fair play? Hva betyr det å samarbeide i et lag?",mal:"Lagsport og samarbeid. Rammeplanen: Kropp og etikk – motorisk mestring og sportslig adferd."},
  {id:113,tittel:"Målvakten redder",ikon:"⚽",kategori:"sport",alder:"2-6 år",rammeplan:["kropp","kommunikasjon"],svg:<SvgMaalvakt/>,oppgave:"1. Farg fotballen i dine favorittfarger. 2. Tegn en målvakt som hopper og strekker seg. 3. Legg til et mål med keeper-hansker. 4. Tegn publikum som heier.",samtale:"Hva gjør en målvakt? Hva er de vanskeligste skuddene å redde? Hva er det som gjør fotball spennende?",mal:"Idrett og kroppsmestring. Rammeplanen: Kropp – utfordre og utvikle motoriske ferdigheter."},
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
  ["teknologi","Teknologi 🤖"],
  ["romfart","Romfart 🚀"],
  ["musikk","Musikk 🎵"],
  ["sport","Sport ⚽"],
];

function FagTag({ rid }) {
  const f = FAGOMRADER.find(x => x.id === rid);
  if (!f) return null;
  return <span data-fag={f.id} className="tag" style={{background:f.lys, color:f.farge}}>{f.ikon} {f.navn}</span>;
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

// ─── Standalone search/list components ─────────────────────────
// Defined OUTSIDE the main component so they never remount on parent re-renders
function skrivUtVindu(html, tittel = "Barnehagehjelpen") {
  const w = window.open("", "_blank");
  if (!w) { alert("Popup ble blokkert av nettleseren. Tillat popup for barnehagehjelpen.pages.dev for å skrive ut."); return; }
  w.document.write(`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${tittel}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a2a3a;background:#fff;padding:16px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}
.knapper{display:flex;gap:10px;margin-bottom:20px;justify-content:center}
.print-btn{padding:9px 24px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:bold}
.lukk-btn{padding:9px 18px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;font-weight:bold}
</style></head><body>
<div class="knapper no-print">
  <button class="lukk-btn" onclick="window.close()">← Lukk</button>
  <button class="print-btn" onclick="window.print()">🖨️ Skriv ut</button>
</div>
${html}
</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

const SvgPlaceholder = ()=>(
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

async function hentUserTegneark(userId) {
  const { data } = await supabase.from("user_tegneark").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}
async function lagreUserTegneark(ark) {
  const { data, error } = await supabase.from("user_tegneark").insert(ark).select().single();
  return { data, error };
}
async function slettUserTegneark(id, userId) {
  return await supabase.from("user_tegneark").delete().eq("id", id).eq("user_id", userId);
}

function AiTegnearkView({ aktivBruker, onLagre, onAvbryt }) {
  const [form, setForm] = useState({ tema:"", alder:"3-6", fagomrade:"", vanskelighet:"enkel" });
  const [genererer, setGenererer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [feil, setFeil] = useState(null);
  const [lagrer, setLagrer] = useState(false);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const generer = async () => {
    if (!form.tema.trim()) return;
    setGenererer(true); setFeil(null); setResultat(null);
    const prompt = `Du er en kreativ pedagog i en norsk barnehage. Lag et tegneark-opplegg for barn i alderen ${form.alder} år.\n\nTema: ${form.tema}${form.fagomrade?"\nFagområde: "+form.fagomrade:""}${form.vanskelighet?"\nVanskelighetsgrad: "+form.vanskelighet:""}\n\nSvar KUN med gyldig JSON (ingen markdown, ingen forklaring):\n{\n  "tittel": "tittel på tegnearket",\n  "ikon": "ett passende emoji",\n  "oppgave": "fire nummererte tegnetrinn (1. ... 2. ... 3. ... 4. ...)",\n  "samtale": "tre åpne samtalespørsmål separert med spørsmålstegn",\n  "mal": "rammeplanmål – én setning",\n  "kategori": "passende kategori (dyr/natur/mennesker/mat/sport/teknologi/romfart/musikk/festlig/folelser)",\n  "alder": "${form.alder} år",\n  "rammeplan": ["id-er fra: kropp, kunst, natur, antall, etikk, naermiljo, kommunikasjon"]\n}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ system:"Du er en erfaren barnehagelærer. Skriv alltid på norsk bokmål. Svar KUN med gyldig JSON.", prompt, max_tokens:800 }), signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const raw = json.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Ugyldig svar fra AI");
      setResultat(JSON.parse(jsonMatch[0]));
    } catch(e) {
      console.error("[AI Tegneark]", e);
      setFeil(e.name === "AbortError" ? "AI brukte for lang tid – prøv igjen." : "Klarte ikke å generere tegneark. Prøv igjen.");
    } finally { clearTimeout(tid); setGenererer(false); }
  };
  const lagre = async () => {
    if (!resultat || !aktivBruker?.id) return;
    setLagrer(true);
    const { data, error } = await lagreUserTegneark({ user_id:aktivBruker.id, tittel:resultat.tittel||"Tegneark", ikon:resultat.ikon||"🖍️", oppgave:resultat.oppgave||"", samtale:resultat.samtale||"", mal:resultat.mal||"", kategori:resultat.kategori||"natur", alder:resultat.alder||form.alder+" år", rammeplan:resultat.rammeplan||[], ai_generert:true });
    setLagrer(false);
    if (error) { setFeil("Feil ved lagring: "+error.message); return; }
    onLagre(data);
  };
  return (
    <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
      <Tilbake onClick={onAvbryt}/>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:4}}>🤖 AI-tegneark</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:18}}>La AI lage et unikt tegneark med oppgave, samtale og rammeplankoblinger</p>
      {!resultat ? (
        <>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Tema / motiv *</label>
            <input value={form.tema} onChange={e=>setForm(p=>({...p,tema:e.target.value}))} placeholder="f.eks. dinosaurer, romskip, bakeri, norsk natur..." style={iS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Aldersgruppe</label>
              <select value={form.alder} onChange={e=>setForm(p=>({...p,alder:e.target.value}))} style={iS}>
                <option value="1-3">1–3 år</option>
                <option value="2-4">2–4 år</option>
                <option value="3-6">3–6 år</option>
                <option value="4-6">4–6 år</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Vanskelighetsgrad</label>
              <select value={form.vanskelighet} onChange={e=>setForm(p=>({...p,vanskelighet:e.target.value}))} style={iS}>
                <option value="enkel">Enkel</option>
                <option value="middels">Middels</option>
                <option value="utfordrende">Utfordrende</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Fagområde (valgfritt)</label>
            <select value={form.fagomrade} onChange={e=>setForm(p=>({...p,fagomrade:e.target.value}))} style={iS}>
              <option value="">– Velg –</option>
              {FAGOMRADER.map(f=><option key={f.id} value={f.navn}>{f.ikon} {f.navn}</option>)}
            </select>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <button className="btn" onClick={generer} disabled={genererer||!form.tema.trim()} style={{width:"100%",padding:"12px 0",fontSize:14,background:genererer?C.gr:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff"}}>
            {genererer?"⏳ Genererer tegneark...":"✨ Generer tegneark"}
          </button>
        </>
      ) : (
        <div className="fade">
          <div style={{background:"#f5f9fd",borderRadius:12,padding:18,marginBottom:16,border:"1.5px solid #c4d6ec"}}>
            <div style={{fontWeight:800,fontSize:18,color:C.t,marginBottom:2}}>{resultat.ikon} {resultat.tittel}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:14}}>{resultat.kategori} · {resultat.alder}</div>
            <div style={{background:"#fff9c4",borderRadius:9,padding:"10px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:5,textTransform:"uppercase"}}>🖍️ Tegneoppgave</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{resultat.oppgave}</div>
            </div>
            <div style={{background:"#e8f5e9",borderRadius:9,padding:"10px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#2e7d32",fontSize:11,marginBottom:5,textTransform:"uppercase"}}>💬 Samtale</div>
              <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{resultat.samtale}</div>
            </div>
            <div style={{background:"#e3f2fd",borderRadius:9,padding:"10px 13px"}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:11,marginBottom:4,textTransform:"uppercase"}}>📖 Mål</div>
              <div style={{fontSize:13,color:C.t}}>{resultat.mal}</div>
            </div>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={lagre} disabled={lagrer} style={{flex:1,padding:"11px 0",fontSize:14,background:lagrer?C.gr:"#2e7d32",color:"#fff"}}>
              {lagrer?"⏳ Lagrer...":"💾 Lagre i Mine tegneark"}
            </button>
            <button className="btn" onClick={()=>setResultat(null)} style={{padding:"11px 18px",fontSize:13,background:C.lg2,color:C.t}}>↩ Prøv igjen</button>
          </div>
        </div>
      )}
    </div>
  );
}

async function hentUserSanger(userId) {
  const { data } = await supabase.from("user_sanger").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}
async function lagreUserSang(sang) {
  const { data, error } = await supabase.from("user_sanger").insert(sang).select().single();
  return { data, error };
}
async function slettUserSang(id, userId) {
  return await supabase.from("user_sanger").delete().eq("id", id).eq("user_id", userId);
}

function AiSangerView({ aktivBruker, onLagre, onAvbryt }) {
  const [form, setForm] = useState({ sjanger:"sang", tema:"", aldersgruppe:"3-6", antallVers:"2", melodi:"", fagomrade:"", ekstra:"" });
  const [genererer, setGenererer] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [feil, setFeil] = useState(null);
  const [lagrer, setLagrer] = useState(false);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const generer = async () => {
    if (!form.tema.trim()) return;
    setGenererer(true); setFeil(null); setResultat(null);
    const sjangerTekst = {sang:"sang",rim:"rim",regle:"regle"}[form.sjanger]||"sang";
    const prompt = `Du er en kreativ pedagog i en norsk barnehage. Lag en original ${sjangerTekst} for barn i alderen ${form.aldersgruppe} år.\n\nTema: ${form.tema}\nAntall vers: ${form.antallVers}${form.melodi?"\nMelodi/toneleie: "+form.melodi:""}${form.fagomrade?"\nKobling til fagområde: "+form.fagomrade:""}${form.ekstra?"\nØnsker: "+form.ekstra:""}\n\nSvar KUN med gyldig JSON (ingen markdown, ingen forklaring):\n{\n  "tittel": "tittel på sangen",\n  "tekst": "hele teksten med vers og evt. refreng, formatert med linjeskift",\n  "kategori": "${form.sjanger}",\n  "alder": "${form.aldersgruppe} år",\n  "melodi": "eventuell melodi-anbefaling eller null",\n  "tips": "pedagogisk tips til pedagogen eller null",\n  "rammeplan": ["id-er fra: kropp_bevegelse, kunst_kultur, natur_miljo, antall_rom_form, etikk_religion, naerlighet_vennskap, kommunikasjon_sprak"]\n}`;
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ system:"Du er en erfaren barnehagelærer og forfatter av barnesanger. Skriv alltid på norsk bokmål. Svar KUN med gyldig JSON.", prompt, max_tokens:1200 }), signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const raw = json.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Ugyldig svar fra AI");
      setResultat(JSON.parse(jsonMatch[0]));
    } catch(e) {
      console.error("[AI Sanger]", e);
      setFeil(e.name === "AbortError" ? "AI brukte for lang tid – prøv igjen." : "Klarte ikke å generere sang. Prøv igjen.");
    } finally { clearTimeout(tid); setGenererer(false); }
  };
  const lagre = async () => {
    if (!resultat || !aktivBruker?.id) return;
    setLagrer(true);
    const { data, error } = await lagreUserSang({ user_id:aktivBruker.id, tittel:resultat.tittel, tekst:resultat.tekst, kategori:resultat.kategori||form.sjanger, alder:resultat.alder||form.aldersgruppe+" år", melodi:resultat.melodi||null, tips:resultat.tips||null, rammeplan:resultat.rammeplan||[], ai_generert:true });
    setLagrer(false);
    if (error) { setFeil("Feil ved lagring: "+error.message); return; }
    onLagre(data);
  };
  return (
    <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
      <Tilbake onClick={onAvbryt}/>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:4}}>🤖 AI-sanger</div>
      <p style={{color:C.gr,fontSize:12,marginBottom:18}}>La AI lage en original sang, rim eller regle tilpasset barnegruppen din</p>
      {!resultat ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Sjanger</label>
              <select value={form.sjanger} onChange={e=>setForm(p=>({...p,sjanger:e.target.value}))} style={iS}>
                <option value="sang">🎤 Sang</option>
                <option value="rim">📝 Rim</option>
                <option value="regle">📣 Regle</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Aldersgruppe</label>
              <select value={form.aldersgruppe} onChange={e=>setForm(p=>({...p,aldersgruppe:e.target.value}))} style={iS}>
                <option value="1-2">1–2 år</option>
                <option value="2-3">2–3 år</option>
                <option value="3-4">3–4 år</option>
                <option value="3-6">3–6 år</option>
                <option value="4-6">4–6 år</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Tema / innhold *</label>
            <input value={form.tema} onChange={e=>setForm(p=>({...p,tema:e.target.value}))} placeholder="f.eks. dyr i skogen, årstider, vennskap, tall..." style={iS}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Antall vers</label>
              <select value={form.antallVers} onChange={e=>setForm(p=>({...p,antallVers:e.target.value}))} style={iS}>
                <option value="1">1 vers</option>
                <option value="2">2 vers</option>
                <option value="3">3 vers + refreng</option>
                <option value="4">4 vers + refreng</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Fagområde (valgfritt)</label>
              <select value={form.fagomrade} onChange={e=>setForm(p=>({...p,fagomrade:e.target.value}))} style={iS}>
                <option value="">– Velg –</option>
                {FAGOMRADER.map(f=><option key={f.id} value={f.navn}>{f.ikon} {f.navn}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:12,fontWeight:700,color:C.gr,display:"block",marginBottom:5}}>Melodi-ønske (valgfritt)</label>
            <input value={form.melodi} onChange={e=>setForm(p=>({...p,melodi:e.target.value}))} placeholder="f.eks. Byssan lull, enkel melodi barna kan synge..." style={iS}/>
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <button className="btn" onClick={generer} disabled={genererer||!form.tema.trim()} style={{width:"100%",padding:"12px 0",fontSize:14,background:genererer?C.gr:C.g,color:"#fff"}}>
            {genererer?"⏳ Genererer sang...":"✨ Generer sang"}
          </button>
        </>
      ) : (
        <div className="fade">
          <div style={{background:"#f5f9fd",borderRadius:12,padding:18,marginBottom:16,border:"1.5px solid #c4d6ec"}}>
            <div style={{fontWeight:800,fontSize:18,color:C.t,marginBottom:4}}>{resultat.tittel}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:14}}>{resultat.kategori} · {resultat.alder}{resultat.melodi?" · 🎼 "+resultat.melodi:""}</div>
            <pre style={{whiteSpace:"pre-wrap",fontFamily:"'Nunito',sans-serif",fontSize:15,lineHeight:2,color:C.t,marginBottom:12}}>{resultat.tekst}</pre>
            {resultat.tips&&<div style={{background:"#fffde7",borderRadius:8,padding:"10px 13px",fontSize:13,color:"#795548"}}><strong>💡 Tips:</strong> {resultat.tips}</div>}
          </div>
          {feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"10px 13px",fontSize:13,marginBottom:14}}>{feil}</div>}
          <div style={{display:"flex",gap:10}}>
            <button className="btn" onClick={lagre} disabled={lagrer} style={{flex:1,padding:"11px 0",fontSize:14,background:lagrer?C.gr:"#2e7d32",color:"#fff"}}>
              {lagrer?"⏳ Lagrer...":"💾 Lagre i Mine sanger"}
            </button>
            <button className="btn" onClick={()=>setResultat(null)} style={{padding:"11px 18px",fontSize:13,background:C.lg2,color:C.t}}>↩ Prøv igjen</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SangerSideComp({ favoritter, toggleFav, aktivBruker, onNyUserSang }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [valgt, setValgt] = useState(null);
  const [visAiPanel, setVisAiPanel] = useState(false);
  const [userSanger, setUserSanger] = useState([]);
  const [lasterMine, setLasterMine] = useState(false);
  const favSet = new Set(favoritter?.sanger || []);

  useEffect(() => {
    if (!aktivBruker?.id) return;
    setLasterMine(true);
    hentUserSanger(aktivBruker.id)
      .then(s => setUserSanger(s))
      .catch(() => {})
      .finally(() => setLasterMine(false));
  }, [aktivBruker?.id]);

  const userSangerMapped = userSanger.map(s => ({ id:"user_"+s.id, tittel:s.tittel, tekst:s.tekst, kategori:s.kategori, alder:s.alder, melodi:s.melodi, tips:s.tips, rammeplan:s.rammeplan||[], _dbId:s.id, _erMin:true }));
  const alleData = [...userSangerMapped, ...SANGER];
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = alleData.filter(s=>{
    if (filter==="mine") return !!s._erMin && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    if (filter==="favoritter") return favSet.has(s.id) && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    return (filter==="alle"||s.kategori===filter)&&(!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
  });
  const skrivUtSang = (s) => {
    const melodiHtml = s.melodi ? ' · 🎼 ' + s.melodi : '';
    const tipsHtml = s.tips ? '<div style="margin-top:12px;padding:12px;background:#fffde7;border-radius:8px;font-size:13px;"><strong>💡 Tips:</strong> ' + s.tips + '</div>' : '';
    skrivUtVindu('<div style="max-width:620px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + s.tittel + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + s.kategori + ' · ' + s.alder + melodiHtml + '</div><pre style="font-size:16px;line-height:2.1;white-space:pre-wrap;font-family:inherit;background:#f5f9fd;padding:18px;border-radius:10px;border:1px solid #c4d6ec;">' + s.tekst + '</pre>' + tipsHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', s.tittel);
  };
  const slettMin = async (dbId) => {
    await slettUserSang(dbId, aktivBruker.id);
    setUserSanger(p => p.filter(s => s.id !== dbId));
    setValgt(null);
  };
  if (visAiPanel) return <AiSangerView aktivBruker={aktivBruker} onLagre={(ny) => { setUserSanger(p => [ny, ...p]); onNyUserSang?.(ny); setVisAiPanel(false); }} onAvbryt={() => setVisAiPanel(false)} />;
  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t}}>🎵 Sanger, Rim og Regler</div>
        {aktivBruker&&<button className="btn" onClick={()=>setVisAiPanel(true)} style={{padding:"7px 13px",fontSize:12,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",whiteSpace:"nowrap"}}>🤖 AI-sanger</button>}
      </div>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{SANGER.length} tilgjengelige{userSangerMapped.length?" + "+userSangerMapped.length+" egne":""} – kobler språk, bevegelse og glede til rammeplanen</p>
      <input value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk etter sang eller rim..." style={{...iS,marginBottom:12}}/>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16,paddingBottom:3}}>
        <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
          {[["alle","Alle"],aktivBruker?["mine",`🤖 Mine${userSangerMapped.length?" ("+userSangerMapped.length+")":""}`]:null,["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],["sang","🎤 Sanger"],["rim","📝 Rim"],["regle","📣 Regler"]].filter(Boolean).map(([v,l])=>(
            <button key={v} className="btn" onClick={()=>setFilter(v)} style={{padding:"6px 13px",fontSize:11,background:filter===v?C.g:C.lg2,color:filter===v?"#fff":C.t,whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
          ))}
        </div>
      </div>
      {valgt ? (
        <div className="fade" style={{background:C.w,borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(44,91,142,0.12)"}}>
          <Tilbake onClick={()=>setValgt(null)}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.t,flex:1}}>{valgt.tittel}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {valgt._erMin&&<button className="btn" onClick={()=>slettMin(valgt._dbId)} style={{padding:"5px 10px",fontSize:11,background:"#ffebee",color:"#c62828"}}>🗑 Slett</button>}
              <button className="btn" onClick={()=>skrivUtSang(valgt)} style={{padding:"5px 10px",fontSize:11,background:"#e8f5e9",color:"#2e7d32"}}>🖨️ Skriv ut</button>
              <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("sanger",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                {favSet.has(valgt.id)?"⭐":"☆"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",gap:7,margin:"10px 0 14px",flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:C.lg2,color:C.gr}}>👶 {valgt.alder}</span>
            {valgt.melodi&&<span className="tag" style={{background:C.lg2,color:C.gr}}>🎼 {valgt.melodi}</span>}
            {valgt._erMin&&<span className="tag" style={{background:C.lg2,color:C.gr}}>🤖 AI-generert</span>}
          </div>
          <pre style={{background:C.lg2,borderRadius:11,padding:16,fontSize:15,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.9,fontFamily:"'Nunito',sans-serif",marginBottom:12,border:`1px solid var(--c-divider)`}}>{valgt.tekst}</pre>
          {valgt.tips&&<div style={{background:"var(--c-lg2)",borderRadius:9,padding:12,fontSize:13,color:C.t,marginBottom:12,border:`1px solid var(--c-divider)`}}><strong>💡 Tips:</strong> {valgt.tips}</div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{(valgt.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {lasterMine&&filter==="mine"&&<div style={{textAlign:"center",padding:18,color:C.gr,fontSize:13}}>⏳ Laster dine sanger...</div>}
          {data.length===0&&!lasterMine&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="mine"?"Du har ingen AI-sanger ennå – trykk 🤖 AI-sanger for å lage din første!":filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {data.map(s=>(
            <div key={s.id} className="hover fade" onClick={()=>setValgt(s)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{s.tittel}{s._erMin&&<span style={{marginLeft:6,fontSize:10,background:"#ede9fe",color:"#6d28d9",borderRadius:6,padding:"1px 6px",fontWeight:700}}>🤖</span>}</div>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{s.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{s.alder}</span>
                    {(s.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
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
function GlobalSok({ verdi, setVerdi, sokeResultat, navigerTil, aapneAktivitet, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, C }) {
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

              {sokeResultat.skjemaer && sokeResultat.skjemaer.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f9f3fd",textTransform:"uppercase",letterSpacing:0.5}}>📋 Mine skjemaer ({sokeResultat.skjemaer.length})</div>
                  {sokeResultat.skjemaer.slice(0,5).map(s=>(
                    <div key={"sk"+s.id} onClick={()=>{navigerTil("skjemaer");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{s.tittel||"Skjema"}</div>
                      {s.type&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{s.type}</div>}
                    </div>
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
              {sokeResultat.maanedsplaner && sokeResultat.maanedsplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f9f3fd",textTransform:"uppercase",letterSpacing:0.5}}>🗓️ Dine månedsplaner ({sokeResultat.maanedsplaner.length})</div>
                  {sokeResultat.maanedsplaner.slice(0,5).map(p=>(
                    <div key={"mp"+p.id} onClick={()=>{navigerTil("maanedsplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.tittel}</div>
                      {p.tema&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.tema}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.maanedsbrev && sokeResultat.maanedsbrev.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#2d6a4f",background:"#f0faf4",textTransform:"uppercase",letterSpacing:0.5}}>📨 Dine månedsbrev ({sokeResultat.maanedsbrev.length})</div>
                  {sokeResultat.maanedsbrev.slice(0,5).map(b=>(
                    <div key={"mb"+b.id} onClick={()=>{navigerTil("maanedsbrev");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{b.tittel}</div>
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.arsplaner && sokeResultat.arsplaner.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#1b5e20",background:"#f1f8e9",textTransform:"uppercase",letterSpacing:0.5}}>📆 Dine årsplaner ({sokeResultat.arsplaner.length})</div>
                  {sokeResultat.arsplaner.slice(0,5).map((p,i)=>(
                    <div key={"ap"+i} onClick={()=>{navigerTil("arsplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.tittel||"Årsplan"}</div>
                      {(p.aar||p.tema)&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{p.aar?p.aar+"":""}{p.aar&&p.tema?" • ":""}{p.tema||""}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.boker && sokeResultat.boker.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#00695c",background:"#e0f2f1",textTransform:"uppercase",letterSpacing:0.5}}>📚 Bøker ({sokeResultat.boker.length})</div>
                  {sokeResultat.boker.slice(0,5).map(b=>(
                    <div key={"bk"+b.id} onClick={()=>{navigerTil("boker");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{b.tittel}</div>
                      {b.forfatter&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{b.forfatter}</div>}
                    </div>
                  ))}
                </div>
              )}
              {sokeResultat.aktivitetskort && sokeResultat.aktivitetskort.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#f57f17",background:"#fff8e1",textTransform:"uppercase",letterSpacing:0.5}}>🃏 Aktivitetskort ({sokeResultat.aktivitetskort.length})</div>
                  {sokeResultat.aktivitetskort.slice(0,5).map(k=>(
                    <div key={"ak"+k.id} onClick={aapneAktivitetskort} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{k.title}</div>
                      {k.category&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{k.category}{k.age_group?" · "+k.age_group:""}</div>}
                    </div>
                  ))}
                  {sokeResultat.aktivitetskort.length>5&&<div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.aktivitetskort.length-5} flere</div>}
                </div>
              )}
              {sokeResultat.dokumentasjon && sokeResultat.dokumentasjon.length > 0 && (
                <div>
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#455a64",background:"#eceff1",textTransform:"uppercase",letterSpacing:0.5}}>📔 Dokumentasjon ({sokeResultat.dokumentasjon.length})</div>
                  {sokeResultat.dokumentasjon.slice(0,5).map(d=>(
                    <div key={"dk"+d.id} onClick={aapneDokumentasjon} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{d.tittel}</div>
                      {d.dato&&<div style={{fontSize:11,color:C.gr,marginTop:1}}>{d.dato}</div>}
                    </div>
                  ))}
                  {sokeResultat.dokumentasjon.length>5&&<div style={{padding:"6px 14px",fontSize:11,color:C.gr,fontStyle:"italic"}}>+{sokeResultat.dokumentasjon.length-5} flere</div>}
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
  }, [preselectId, clearPreselect]);
  const favSet = new Set(favoritter?.aktiviteter || []);
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = AKTIVITETER.filter(a=>{
    const matchSok = !sok||a.tittel.toLowerCase().includes(sok.toLowerCase())||a.hva.toLowerCase().includes(sok.toLowerCase());
    if (filter==="favoritter") return favSet.has(a.id) && matchSok;
    return (filter==="alle"||a.kategori===filter) && matchSok;
  });
  const filtre = [["alle","Alle"],["favoritter",`⭐ Favoritter${favSet.size?" ("+favSet.size+")":""}`],...AKTIV_KATS.filter(k=>k[0]!=="alle")];
  const skrivUtAktivitet = (a) => {
    const tidHtml = a.tid ? ' · ⏱ ' + a.tid : '';
    const gruppeHtml = a.gruppe ? ' · 👥 ' + a.gruppe : '';
    const matHtml = a.materialer ? '<div style="background:#fce4ec;border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#c62828;margin-bottom:4px;">🧰 Materialer</div><div style="font-size:13px;">' + a.materialer + '</div></div>' : '';
    const seksjoner = [['🎯 HVA – Beskrivelse', a.hva, '#fffde7', '#795548'], ['⚙️ HVORDAN – Gjennomføring', a.hvordan, '#e8f5e9', '#2e7d32'], ['❓ HVORFOR – Pedagogisk begrunnelse', a.hvorfor, '#e3f2fd', '#1565c0']].map(([t,v,bg,tc]) => '<div style="background:' + bg + ';border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:' + tc + ';margin-bottom:4px;">' + t + '</div><div style="font-size:13px;line-height:1.7;">' + v + '</div></div>').join('');
    skrivUtVindu('<div style="max-width:640px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + a.tittel + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + a.kategori + ' · ' + a.alder + tidHtml + gruppeHtml + '</div>' + seksjoner + matHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', a.tittel);
  };
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
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button className="btn" onClick={()=>skrivUtAktivitet(valgt)} style={{padding:"5px 10px",fontSize:11,background:"#e8f5e9",color:"#2e7d32"}}>🖨️ Skriv ut</button>
              <button className={`fav-btn ${favSet.has(valgt.id)?"aktiv":""}`} onClick={()=>toggleFav("aktiviteter",valgt.id)} title={favSet.has(valgt.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt">
                {favSet.has(valgt.id)?"⭐":"☆"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            <span className="tag" style={{background:C.mint,color:C.g}}>{valgt.kategori}</span>
            <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>👶 {valgt.alder}</span>
            {valgt.tid&&<span className="tag" style={{background:"#e3f2fd",color:"#1565c0"}}>⏱ {valgt.tid}</span>}
            {valgt.gruppe&&<span className="tag" style={{background:"#f3e5f5",color:"#6a1b9a"}}>👥 {valgt.gruppe}</span>}
          </div>
          {[["🎯 HVA – Beskrivelse",valgt.hva,"#f59e0b"],["⚙️ HVORDAN – Gjennomføring",valgt.hvordan,"#10b981"],["❓ HVORFOR – Pedagogisk begrunnelse",valgt.hvorfor,"#3b82f6"]].map(([t,v,ac])=>(
            <div key={t} style={{background:C.lg2,borderRadius:11,padding:"12px 14px",marginBottom:10,borderLeft:`3px solid ${ac}`}}>
              <div style={{fontWeight:800,color:ac,marginBottom:4,fontSize:13}}>{t}</div>
              <div style={{color:C.t,fontSize:13,lineHeight:1.7}}>{v}</div>
            </div>
          ))}
          {valgt.materialer&&<div style={{background:C.lg2,borderRadius:11,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid #e07b39"}}><div style={{fontWeight:800,color:"#e07b39",marginBottom:4,fontSize:13}}>🧰 Materialer</div><div style={{color:C.t,fontSize:13}}>{valgt.materialer}</div></div>}
          <div style={{fontSize:12,fontWeight:700,color:C.gr,marginBottom:7}}>Kobling til rammeplan:</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{(valgt.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}</div>
        </div>
      ) : (
        <div style={{display:"grid",gap:9}}>
          {data.length===0&&<div style={{textAlign:"center",padding:28,color:C.gr}}>{filter==="favoritter"?"Du har ingen favoritter ennå – trykk på ⭐ for å lagre":`Ingen treff for «${sok}»`}</div>}
          {data.map(a=>(
            <div key={a.id} className="hover fade" onClick={()=>setValgt(a)} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{a.tittel}</div>
                  <div style={{color:C.gr,fontSize:11,marginTop:2}}>{(a.hva||"").substring(0,70)}{(a.hva||"").length>70?"...":""}</div>
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:C.mint,color:C.g}}>{a.kategori}</span>
                    <span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{a.alder}</span>
                    {(a.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
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
// Statisk system-melding – sendes som system-felt i API-kallet og caches automatisk
const BARNEHAGE_SYSTEM = `Du er Barnehageguiden — en svært erfaren norsk barnehagelærer, pedagogisk leder og fagperson med 20+ års erfaring fra norske barnehager. Du vet hva som faktisk virker i praksis, og du skriver innhold som en barnehagelærer kan bruke direkte i arbeidet sitt.

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

function RenderTekst({ tekst }) {
  if (!tekst) return null;
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#1a2c45"}}>
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
  const [lagringsTittel, setLagringsTittel] = useState("");

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

    // Lengre svar for innholdsrike typer
    const tokenMap = { aktivitet:2500, prosjekt:3000, arsplan:3500, manedsplan:2500, ukeplan:2000 };
    const ønsketTokens = tokenMap[type] || 1800;

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
    const timeoutId = setTimeout(() => controller.abort(), 90000);

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
        if (e1.transient || erNettverk) {
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
    }
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

// ═══════════════════════════════════════════
//  AUTH MODUL – Supabase Auth
// ═══════════════════════════════════════════

const storageStatus = { persistent: true, diagnostisert: true, detaljer: "Supabase Auth" };
async function diagnostiserStorage() { return storageStatus; }

// Helper: hent brukerprofil fra user_profiles – maks 4s timeout
async function hentProfil(userId) {
  const tidsbegrensning = new Promise(resolve => setTimeout(() => resolve(null), 4000));
  const spørring = supabase.from("user_profiles").select("*").eq("id", userId).single()
    .then(({ data }) => data).catch(() => null);
  return Promise.race([spørring, tidsbegrensning]);
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

function skrivUtGenerell({ tittel, meta, seksjoner, logoTekst }) {
  const esc = (s) => String(s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const seksHTML = (seksjoner||[]).filter(s=>s?.tekst?.trim()).map(s=>`
    <section style="margin-bottom:16px;padding:13px 15px;background:${s.bg||"#f5f9fd"};border-radius:10px;border-left:4px solid ${s.farge||"#2c5b8e"}">
      ${s.label?`<div style="font-size:11px;font-weight:800;color:${s.farge||"#2c5b8e"};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px">${esc(s.label)}</div>`:""}
      <div style="font-size:13px;color:#1a2c45;line-height:1.75;white-space:pre-wrap">${esc(s.tekst)}</div>
    </section>`).join("");
  const html=`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${esc(tittel)} – Barnehagehjelpen</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,"Segoe UI",sans-serif;background:#f3f7fc;color:#1a2c45;padding:24px 20px;line-height:1.6}.topp{max-width:700px;margin:0 auto 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px}h1{font-size:22px;color:#2c5b8e}.meta{font-size:12px;color:#5d7390;margin-top:4px}.innhold{max-width:700px;margin:0 auto}.knapper{display:flex;gap:8px}.knapp{padding:9px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.lukk{padding:9px 14px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.bunn{font-size:11px;color:#8a9bb0;text-align:center;margin-top:28px}@media print{@page{margin:12mm}.knapper{display:none}body{background:white;padding:0}}</style></head>
<body><div class="topp"><div><h1>${esc(tittel)}</h1>${meta?`<div class="meta">${esc(meta)}</div>`:""}</div><div class="knapper"><button class="lukk" onclick="window.close()">← Lukk</button><button class="knapp" onclick="window.print()">🖨️ Skriv ut</button></div></div><div class="innhold">${seksHTML}</div><div class="bunn">${esc(logoTekst||"Barnehagehjelpen • Rammeplan 2017")}</div></body></html>`;
  const v=window.open("","_blank","width=820,height=720");
  if(!v){alert("Popup ble blokkert. Tillat popup for barnehagehjelpen.pages.dev for å skrive ut.");return;}
  v.document.write(html);v.document.close();
}

async function registrerBruker({ brukernavn, epost, passord, telefon }) {
  brukernavn = brukernavn.trim();
  epost = epost.trim().toLowerCase();
  if (brukernavn.length < 3) return { ok: false, feil: "Brukernavn må være minst 3 tegn" };
  if (passord.length < 6) return { ok: false, feil: "Passord må være minst 6 tegn" };

  const tlfV = validerTelefon(telefon);
  if (!tlfV.ok) return { ok: false, feil: tlfV.feil };

  const { data, error } = await supabase.auth.signUp({
    email: epost, password: passord,
    options: { data: { brukernavn, phone: tlfV.renset } },
  });
  if (error) {
    const msg = error.message || "";
    if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("email rate"))
      return { ok: false, feil: "For mange forsøk på kort tid. Vent noen minutter og prøv igjen." };
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("user already"))
      return { ok: false, feil: "E-postadressen er allerede registrert. Prøv å logge inn i stedet." };
    if (msg.toLowerCase().includes("invalid email"))
      return { ok: false, feil: "Ugyldig e-postadresse." };
    if (msg.toLowerCase().includes("password"))
      return { ok: false, feil: "Passordet oppfyller ikke kravene (minst 6 tegn)." };
    return { ok: false, feil: "Registrering feilet. Prøv igjen." };
  }

  // E-postbekreftelse er påkrevd – sjekk session FØR user, da Supabase kan
  // returnere user:null når bekreftelsesmail er sendt (avhengig av konfig).
  if (!data?.session) return { ok: true, bekreftEpost: true, epost };

  const user = data?.user;
  if (!user) return { ok: false, feil: "Registrering feilet – prøv igjen" };

  const { count, error: countErr } = await supabase.from("user_profiles").select("id", { count: "exact", head: true });
  const erAdmin = !countErr && count === 0;

  const { error: insertErr } = await supabase.from("user_profiles").insert({
    id: user.id,
    brukernavn,
    epost,
    phone: tlfV.renset,
    is_admin: erAdmin,
    display_name: brukernavn,
    visningsnavn: "",
    vilkaar_akseptert: true,
    vilkaar_akseptert_dato: new Date().toISOString(),
  });
  if (insertErr) return { ok: false, feil: "Kunne ikke opprette brukerprofil: " + insertErr.message };

  const profil = await hentProfil(user.id);
  return { ok: true, bruker: byggBruker(user, profil) };
}

async function loggInnBruker({ epost, passord }) {
  const e = (epost || "").trim().toLowerCase();
  if (!e || !passord) return { ok: false, feil: "Fyll ut alle felt" };

  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: passord });
  if (error) return { ok: false, feil: error.message || "Feil e-post eller passord" };

  let profil = null;
  try { profil = await hentProfil(data.user.id); } catch (_) {}

  if (!profil) {
    const meta = data.user.user_metadata || {};
    const brukernavn = meta.brukernavn || data.user.email.split("@")[0];
    const { count } = await supabase.from("user_profiles").select("id", { count: "exact", head: true }).then(r => r).catch(() => ({ count: 1 }));
    const erAdmin = (count || 0) === 0;
    try {
      await supabase.from("user_profiles").insert({
        id: data.user.id, brukernavn, epost: data.user.email,
        phone: meta.phone || "", is_admin: erAdmin, display_name: brukernavn,
        visningsnavn: "", vilkaar_akseptert: true,
        vilkaar_akseptert_dato: new Date().toISOString(),
      });
      profil = await hentProfil(data.user.id);
    } catch (_) {}
  }

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
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[slettSesjon]", error.message);
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
  // Oppdaterer IKKE user_profiles.epost her — Supabase sender bekreftelsesmail til ny adresse.
  // Profilen oppdateres automatisk via onAuthStateChange når brukeren bekrefter den nye adressen.
  return { ok: true, bekreftEpost: true };
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
  if (score <= 2) return { nivaa: 3, tekst: "Passe", farge: "#fbc02d" };
  if (score <= 3) return { nivaa: 4, tekst: "Sterkt", farge: "#52b788" };
  return { nivaa: 5, tekst: "Veldig sterkt", farge: "#2d6a4f" };
}

const AVATAR_VALG = ["👤","🌿","🌸","🌻","🌳","🌈","🐰","🐱","🐶","🐻","🦊","🐼","🐨","🐯","🦁","🐸","🐧","🦉","🦋","🐞","🌞","🌙","⭐","🎨","🎵","📚","🍎","🌺","🎯","✨","🦄","🐢"];


// E-postadresse til support – brukes av Kontakt-knapper i UI
const SUPPORT_E_POST = "Barnehagehjelpen@hotmail.com";

function supportMailto() {
  return `mailto:${SUPPORT_E_POST}?subject=Barnehagehjelpen`;
}

const FAQ_DATA = [
  { sp:"Hvordan lager jeg en aktivitet med AI?", svar:"Gå til 🤖 AI-assistent i menyen, velg innholdstype (f.eks. 'Pedagogisk aktivitet'), fyll inn alder, fagområde og eventuelt årstid, og trykk 'Generer'. Får du ikke svar, henter appen automatisk lignende innhold fra databasen." },
  { sp:"Hvordan deler jeg en plan med en kollega?", svar:"Gå til 👥 Samarbeid i menyen og trykk '+ Del en plan'. Velg innholdstype og hvilken plan du vil dele. Deretter åpner du planen og går til 'Tilgang'-fanen for å invitere kolleger ved å søke på navn eller skrive inn e-postadresse. Du kan gi tilgang som 'Kan redigere' eller 'Kun lese'." },
  { sp:"Kan flere redigere samme plan samtidig?", svar:"Ja. Åpner dere samme delte plan på ulike enheter, vises et 'Inne nå'-felt øverst med hvem som er aktive. Lagrer noen endringer mens du redigerer, får du et gult varsel og kan velge å hente inn den nye versjonen eller beholde dine egne endringer." },
  { sp:"Kan jeg angre endringer i en delt plan?", svar:"Ja – gå inn på den delte planen og trykk på 'Historikk'-fanen. Der ser du alle tidligere versjoner med dato og hvem som lagret. Trykk '↩️ Gjenopprett' for å rulle tilbake til en eldre versjon." },
  { sp:"Hvordan lager jeg AI-tegneark eller AI-sanger?", svar:"Gå til 🖍️ Tegneark og trykk '🤖 Lag AI-tegneark', eller gå til 🎵 Sanger og trykk '🤖 Lag AI-sang/rim'. Fyll inn tema og trykk 'Generer'. Innholdet lagres automatisk under 'Mine' og kan brukes med en gang." },
  { sp:"Hvordan endrer jeg navn på et skjema?", svar:"Gå til 📋 Mine skjemaer, åpne skjemaet og trykk '✏️ Endre navn' ved siden av tittelen. Skriv nytt navn og trykk Enter eller 'Lagre'." },
  { sp:"Hvordan skriver jeg ut et tegneark?", svar:"Åpne tegnearket og trykk 'Skriv ut'. Nettleseren åpner en utskriftsdialog. Du kan også trykke 'Last ned' for å laste det ned som HTML-fil og skrive ut fra den." },
  { sp:"Kan jeg bruke appen offline?", svar:"Sanger, aktiviteter og tegneark fungerer uten internett siden innholdet ligger lokalt i appen. AI-generering og synkronisering av planer krever internettilgang." },
  { sp:"Hvordan endrer jeg passord?", svar:"Gå til 👤 Min profil i menyen og trykk 'Endre passord'. Du må oppgi gjeldende passord for å sette et nytt." },
  { sp:"Hvor lagres dataene mine?", svar:"Brukerkonto, favoritter, skjemaer, planer og dokumentasjon lagres sikkert i skyen og er tilgjengelig på alle enheter når du er innlogget. Passord håndteres av Supabase Auth og lagres aldri i klartekst." },
  { sp:"Hva er forskjellen mellom Aktiviteter og Tegneark?", svar:"Aktiviteter er pedagogiske opplegg med HVA, HVORDAN og HVORFOR knyttet til rammeplanmål. Tegneark er fargeleggingsark med tegneoppgave, samtalespørsmål og rammeplankobling – beregnet for barna å bruke direkte." },
  { sp:"Hvorfor får jeg ikke AI-svar?", svar:"AI-generering krever internett. Prøv igjen om litt – får du fortsatt ikke svar vil appen automatisk hente lignende innhold fra databasen slik at du aldri står uten noe å bruke." },
  { sp:"Kan jeg slette kontoen min?", svar:"Ja – kontakt en administrator eller send oss en e-post via 'Kontakt support'-knappen nedenfor, så sletter vi kontoen din." },
];

// ─── Favoritter per bruker ───
function tomFav() { return { sanger: [], aktiviteter: [], tegneark: [] }; }
async function hentFavoritter(brukerId) {
  if (!brukerId) return tomFav();
  try {
    const { data } = await supabase.from("favoritter").select("sanger,aktiviteter,tegneark").eq("user_id", brukerId).maybeSingle();
    return data ? { sanger: data.sanger||[], aktiviteter: data.aktiviteter||[], tegneark: data.tegneark||[] } : tomFav();
  } catch { return tomFav(); }
}
async function lagreFavoritter(brukerId, fav) {
  if (!brukerId) return;
  try {
    await supabase.from("favoritter").upsert({ user_id: brukerId, sanger: fav.sanger||[], aktiviteter: fav.aktiviteter||[], tegneark: fav.tegneark||[], updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch(e) { console.error("[Favoritter]", e); }
}

// ─── Dokumentasjon (praksisfortellinger og refleksjoner) per bruker ───
async function hentDokumentasjon(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("dokumentasjon").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    return (data||[]).map(r => r.payload).filter(Boolean);
  } catch { return []; }
}
async function lagreDokumentasjon(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { error: delErr } = await supabase.from("dokumentasjon").delete().eq("user_id", brukerId);
    if (delErr) throw delErr;
    if (liste.length > 0) await supabase.from("dokumentasjon").insert(liste.map(d => ({ user_id: brukerId, payload: d })));
    return true;
  } catch(e) { console.error("[Dokumentasjon] Lagring feilet:", e); return false; }
}

// ─── Ukeplaner per bruker ───
async function hentUkeplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("ukeplaner").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    return (data||[]).map(r => r.payload).filter(Boolean);
  } catch { return []; }
}
async function lagreUkeplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { error: delErr } = await supabase.from("ukeplaner").delete().eq("user_id", brukerId);
    if (delErr) throw delErr;
    if (liste.length > 0) await supabase.from("ukeplaner").insert(liste.map(p => ({ user_id: brukerId, payload: p })));
    return true;
  } catch(e) { console.error("[Ukeplan] Lagring feilet:", e); return false; }
}

// ─── Årsplaner per bruker ───
async function hentArsplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("arsplaner").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    return (data||[]).map(r => r.payload).filter(Boolean);
  } catch { return []; }
}
async function lagreArsplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { error: delErr } = await supabase.from("arsplaner").delete().eq("user_id", brukerId);
    if (delErr) throw delErr;
    if (liste.length > 0) await supabase.from("arsplaner").insert(liste.map(p => ({ user_id: brukerId, tittel: p.tittel||"", aar: parseInt(p.aar)||new Date().getFullYear(), payload: p })));
    return true;
  } catch(e) { console.error("[Årsplan] Lagring feilet:", e); return false; }
}

// ─── Månedsplaner per bruker ───
async function hentMaanedsplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedsplaner").select("*").eq("user_id", brukerId).order("aar", { ascending: false }).order("maaned", { ascending: false });
    return (data||[]).map(r => {
      let extra = {};
      try { extra = JSON.parse(r.innhold||"{}"); } catch {}
      return { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, tema: r.tema, fagomrader: r.fagomrader||[], opprettet: r.created_at, ...extra };
    });
  } catch { return []; }
}
async function lagreMaanedsplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { error: delErr } = await supabase.from("maanedsplaner").delete().eq("user_id", brukerId);
    if (delErr) throw delErr;
    if (liste.length > 0) {
      await supabase.from("maanedsplaner").insert(liste.map(p => {
        const { id, tittel, aar, maaned, tema, fagomrader, opprettet, ...rest } = p;
        return { user_id: brukerId, tittel: tittel||"", aar: parseInt(aar)||new Date().getFullYear(), maaned: parseInt(maaned)||1, tema: tema||"", fagomrader: fagomrader||[], innhold: JSON.stringify(rest) };
      }));
    }
    return true;
  } catch(e) { console.error("[Månedsplan] Lagring feilet:", e); return false; }
}

// ─── Månedsbrev per bruker ───
async function hentMaanedsbrev(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedbrev").select("*").eq("user_id", brukerId).order("aar", { ascending: false }).order("maaned", { ascending: false });
    return (data||[]).map(r => {
      let extra = {};
      try { extra = JSON.parse(r.innhold||"{}"); } catch {}
      return { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, hilsen: r.hilsen, opprettet: r.created_at, ...extra };
    });
  } catch { return []; }
}
async function lagreMaanedsbrev(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { error: delErr } = await supabase.from("maanedbrev").delete().eq("user_id", brukerId);
    if (delErr) throw delErr;
    if (liste.length > 0) {
      await supabase.from("maanedbrev").insert(liste.map(b => {
        const { id, tittel, aar, maaned, hilsen, opprettet, ...rest } = b;
        return { user_id: brukerId, tittel: tittel||"", aar: parseInt(aar)||new Date().getFullYear(), maaned: parseInt(maaned)||1, hilsen: hilsen||"", innhold: JSON.stringify(rest) };
      }));
    }
    return true;
  } catch(e) { console.error("[Månedsbrev] Lagring feilet:", e); return false; }
}

// ── Aktivitetskort: Supabase CRUD ──
async function hentAktivitetskort(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("activity_cards")
      .select("*")
      .or(`created_by.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) { console.error("[Aktivitetskort] hent:", e); return []; }
}
async function lagreNyttAktivitetskort(payload) {
  const { id, ...insertData } = payload;
  const { data, error } = await supabase.from("activity_cards").insert([insertData]).select().single();
  if (error) throw error;
  return data;
}
async function oppdaterAktivitetskort(id, oppdateringer) {
  const { data, error } = await supabase.from("activity_cards").update(oppdateringer).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
async function slettAktivitetskort(id) {
  const { error } = await supabase.from("activity_cards").delete().eq("id", id);
  if (error) throw error;
}
async function hentKortFavoritter(userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase.from("activity_card_favorites").select("card_id").eq("user_id", userId);
  if (error) return new Set();
  return new Set((data || []).map(r => r.card_id));
}

// ═══════════════════════════════════════════
//  PERSONVERN / BRUKSVILKÅR – MODALER
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
function AuthScreen({ onLoginSuccess }) {
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
    setFeil(""); setSuksess(""); setLoading(true);
    localStorage.setItem("bh_husk_meg", huskMeg ? "true" : "false");
    try {
      const r = await loggInnBruker({ epost: li_epost, passord: li_pw });
      if (!r.ok) { setFeil(r.feil); return; }
      sessionStorage.setItem("bh_sesjon", "1");
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
                <input type="email" value={li_epost} onChange={e=>setLiEpost(e.target.value)} style={inputStil} autoComplete="email" placeholder="kari@example.no" />
                <label style={labelStil}>Passord</label>
                <div style={{position:"relative"}}>
                  <input type={visPassord?"text":"password"} value={li_pw} onChange={e=>setLiPw(e.target.value)} style={{...inputStil,paddingRight:60}} autoComplete="current-password" placeholder="••••••••" />
                  <button type="button" onClick={()=>setVisPassord(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:"#5d7390",fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>
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
function AdminPanel({ aktivBruker }) {
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
function KortModal({ kort, onLagre, onLukk }) {
  const iS = { width:"100%", border:"1.5px solid #c4d6ec", borderRadius:9, padding:"9px 13px", fontSize:13, background:"#f5f9fd", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box", marginBottom:10 };
  const lS = { fontSize:11, fontWeight:800, color:C.gr, display:"block", marginBottom:3, marginTop:8 };
  const [form, setForm] = useState({
    title: kort?.title || "",
    description: kort?.description || "",
    category: kort?.category || "Lek",
    age_group: kort?.age_group || "3-5 år",
    materials: kort?.materials || "",
    steps: kort?.steps || "",
    curriculum_area: kort?.curriculum_area || [],
    learning_goal: kort?.learning_goal || "",
    duration: kort?.duration || "",
    difficulty: kort?.difficulty || "middels",
    indoor_outdoor: kort?.indoor_outdoor || "begge",
    icon: kort?.icon || "🎯",
    is_public: kort?.is_public || false,
    id: kort?.id || undefined,
  });
  const opd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFag = (fId) => setForm(p => ({ ...p, curriculum_area: p.curriculum_area.includes(fId) ? p.curriculum_area.filter(x=>x!==fId) : [...p.curriculum_area, fId] }));
  const kat = KORT_KATEGORIER.find(k => k.id === form.category) || KORT_KATEGORIER[0];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:350, overflowY:"auto", padding:"16px 12px", display:"flex", alignItems:"flex-start", justifyContent:"center" }} onClick={e => { if(e.target===e.currentTarget) onLukk(); }}>
      <div className="pop" style={{ background:C.w, borderRadius:18, width:"100%", maxWidth:580, boxShadow:"0 12px 40px rgba(0,0,0,0.22)", overflow:"hidden", marginTop:8 }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${kat.txt},#2c5b8e)`, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff" }}>
            {form.id ? "✏️ Rediger aktivitetskort" : "➕ Nytt aktivitetskort"}
          </div>
          <button onClick={onLukk} style={{ background:"rgba(255,255,255,0.18)", border:"none", color:"#fff", width:30, height:30, borderRadius:7, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ padding:"16px 20px 20px", overflowY:"auto", maxHeight:"76vh" }}>
          {/* Ikon-velger */}
          <label style={lS}>Ikon</label>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
            {KORT_IKONER.map(i => (
              <button key={i} onClick={() => opd("icon", i)} style={{ width:34, height:34, borderRadius:8, border:form.icon===i?"2px solid #2c5b8e":"1.5px solid #c4d6ec", background:form.icon===i?"#e8eff8":"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{i}</button>
            ))}
          </div>

          <label style={lS}>Tittel *</label>
          <input value={form.title} onChange={e=>opd("title",e.target.value)} placeholder="Tittel på aktivitetskortet" style={iS}/>

          <label style={lS}>Beskrivelse</label>
          <textarea value={form.description} onChange={e=>opd("description",e.target.value)} placeholder="Kort beskrivelse av aktiviteten..." style={{ ...iS, minHeight:65, resize:"vertical" }}/>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={lS}>Kategori</label>
              <select value={form.category} onChange={e=>opd("category",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {KORT_KATEGORIER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.id}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Aldersgruppe</label>
              <select value={form.age_group} onChange={e=>opd("age_group",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["0-2 år","1-3 år","2-4 år","3-5 år","3-6 år","4-6 år","5-6 år","Alle aldre"].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10 }}>
            <div>
              <label style={lS}>Tidsbruk</label>
              <select value={form.duration} onChange={e=>opd("duration",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["","5-10 min","10-15 min","15-20 min","20-30 min","30-45 min","45-60 min","Hele dagen"].map(d => <option key={d} value={d}>{d||"Ikke oppgitt"}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Vanskelighet</label>
              <select value={form.difficulty} onChange={e=>opd("difficulty",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {["enkel","middels","avansert"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Inne / ute</label>
              <select value={form.indoor_outdoor} onChange={e=>opd("indoor_outdoor",e.target.value)} style={{ ...iS, marginBottom:0 }}>
                {[["inne","🏠 Inne"],["ute","🌳 Ute"],["begge","🏠🌳 Begge"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <label style={lS}>Utstyr / Materialer</label>
          <textarea value={form.materials} onChange={e=>opd("materials",e.target.value)} placeholder="Hva trenger dere?" style={{ ...iS, minHeight:55, resize:"vertical" }}/>

          <label style={lS}>Gjennomføring (steg-for-steg)</label>
          <textarea value={form.steps} onChange={e=>opd("steps",e.target.value)} placeholder={"Steg 1: ...\nSteg 2: ...\nSteg 3: ..."} style={{ ...iS, minHeight:90, resize:"vertical" }}/>

          <label style={lS}>Hensikt / Læringsmål</label>
          <textarea value={form.learning_goal} onChange={e=>opd("learning_goal",e.target.value)} placeholder="Hva skal barna lære eller oppleve?" style={{ ...iS, minHeight:55, resize:"vertical" }}/>

          <label style={lS}>Fagområder (rammeplan)</label>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12, marginTop:4 }}>
            {FAGOMRADER.map(f => (
              <button key={f.id} onClick={()=>toggleFag(f.id)} style={{ padding:"4px 10px", borderRadius:20, border:form.curriculum_area.includes(f.id)?`2px solid ${f.farge}`:"1.5px solid #c4d6ec", background:form.curriculum_area.includes(f.id)?f.lys:"#fff", color:form.curriculum_area.includes(f.id)?f.farge:C.gr, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
                {f.ikon} {f.id}
              </button>
            ))}
          </div>

          <label style={{ fontSize:12, fontWeight:700, color:C.t, display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom:16 }}>
            <input type="checkbox" checked={form.is_public} onChange={e=>opd("is_public",e.target.checked)} style={{ width:16, height:16, accentColor:"#2c5b8e" }}/>
            🌍 Del med alle i barnehagen (offentlig)
          </label>

          {/* Forhåndsvisning av kortet */}
          <div style={{ background:"#f8fbff", borderRadius:12, padding:12, marginBottom:14, border:"1.5px solid #d8e6f5" }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.gr, marginBottom:8 }}>FORHÅNDSVISNING</div>
            <div style={{ background:C.w, borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(44,91,142,0.09)", maxWidth:240 }}>
              <div style={{ height:5, background:kat.txt }}/>
              <div style={{ padding:"10px 12px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginBottom:6 }}>{form.icon}</div>
                <div style={{ fontWeight:800, fontSize:12, color:C.t, marginBottom:3, lineHeight:1.3 }}>{form.title||"Tittel…"}</div>
                <div style={{ fontSize:10, color:C.gr, lineHeight:1.4, marginBottom:6 }}>{(form.description||"Beskrivelse…").substring(0,60)}</div>
                <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:9, fontWeight:700, background:kat.bg, color:kat.txt }}>{kat.ikon} {form.category}</span>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button className="btn" onClick={()=>onLagre(form,true)} style={{ flex:1, padding:"10px", fontSize:12, background:C.lg2, color:C.t }}>💾 Lagre som utkast</button>
            <button className="btn" onClick={()=>onLagre(form,false)} disabled={!form.title.trim()} style={{ flex:2, padding:"10px", fontSize:13, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff", opacity:form.title.trim()?1:0.5 }}>✅ Lagre aktivitetskort</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  AKTIVITETSKORT – Hoveddpanel
// ═══════════════════════════════════════════
function AktivitetskortPanel({ aktivBruker, onOppdater }) {
  const [kort, setKort] = useState([]);
  const [laster, setLaster] = useState(true);
  const [visning, setVisning] = useState("grid");
  const [sok, setSok] = useState("");
  const [filterKat, setFilterKat] = useState("alle");
  const [filterType, setFilterType] = useState("alle");
  const [valgtKort, setValgtKort] = useState(null);
  const [modalAapen, setModalAapen] = useState(false);
  const [redigererKort, setRedigererKort] = useState(null);
  const [favSet, setFavSet] = useState(new Set());
  const [feedback, setFeedback] = useState("");
  const [bekreftSlett, setBekreftSlett] = useState(null);
  const [aiPanelAapen, setAiPanelAapen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLaster, setAiLaster] = useState(false);
  const [importerAktivVis, setImporterAktivVis] = useState(false);
  const [sokAkt, setSokAkt] = useState("");
  const [printModus, setPrintModus] = useState(false);
  const [valgtForPrint, setValgtForPrint] = useState(new Set());

  const vis = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""),2800); };
  const iS = { width:"100%", border:"1.5px solid #c4d6ec", borderRadius:9, padding:"9px 13px", fontSize:13, background:"#f5f9fd", fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" };

  useEffect(() => {
    if (!aktivBruker?.id) return;
    (async () => {
      setLaster(true);
      try {
        const [data, favs] = await Promise.all([hentAktivitetskort(aktivBruker.id), hentKortFavoritter(aktivBruker.id)]);
        setKort(data);
        setFavSet(favs);
      } catch (e) {
        console.error("Feil ved lasting av aktivitetskort:", e);
      } finally {
        setLaster(false);
      }
    })();
  }, [aktivBruker?.id]);

  const toggleFavKort = async (kortId) => {
    if (!aktivBruker?.id) return;
    const har = favSet.has(kortId);
    const ny = new Set(favSet);
    if (har) {
      ny.delete(kortId);
      const { error } = await supabase.from("activity_card_favorites").delete().eq("user_id", aktivBruker.id).eq("card_id", kortId);
      if (error) { vis("Kunne ikke fjerne favoritt"); return; }
    } else {
      ny.add(kortId);
      const { error } = await supabase.from("activity_card_favorites").insert({ user_id: aktivBruker.id, card_id: kortId });
      if (error) { vis("Kunne ikke legge til favoritt"); return; }
    }
    setFavSet(ny);
    vis(har ? "Fjernet fra favoritter" : "⭐ Lagt til i favoritter");
  };

  const filtrert = kort.filter(k => {
    if (filterType === "mine" && k.created_by !== aktivBruker.id) return false;
    if (filterType === "offentlige" && !k.is_public) return false;
    if (filterType === "utkast" && !k.is_draft) return false;
    if (filterType === "favoritter" && !favSet.has(k.id)) return false;
    if (filterKat !== "alle" && k.category !== filterKat) return false;
    if (sok) { const q = sok.toLowerCase(); return (k.title||"").toLowerCase().includes(q) || (k.description||"").toLowerCase().includes(q); }
    return true;
  });

  const trekkTilfeldig = () => {
    if (filtrert.length === 0) { vis("Ingen kort å trekke"); return; }
    setValgtKort(filtrert[Math.floor(Math.random() * filtrert.length)]);
  };

  const katInfo = (katId) => KORT_KATEGORIER.find(k => k.id === katId) || { ikon:"🎯", bg:"#e8eff8", txt:C.g };

  const togglePrintValg = (id) => setValgtForPrint(p => { const ny = new Set(p); ny.has(id) ? ny.delete(id) : ny.add(id); return ny; });

  const skrivUtEttKort = (k) => {
    const kat = katInfo(k.category);
    const besk = k.description ? '<div style="background:#fff9c4;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#795548;margin-bottom:4px;">🎯 Beskrivelse</div><p style="font-size:13px;line-height:1.7;">' + k.description + '</p></div>' : '';
    const steg = k.steps ? '<div style="background:#e8f5e9;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#2e7d32;margin-bottom:4px;">⚙️ Gjennomføring</div><div style="font-size:13px;line-height:1.8;white-space:pre-line;">' + k.steps + '</div></div>' : '';
    const maal = k.learning_goal ? '<div style="background:#e3f2fd;border-radius:8px;padding:12px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#1565c0;margin-bottom:4px;">❓ Læringsmål</div><div style="font-size:13px;line-height:1.7;">' + k.learning_goal + '</div></div>' : '';
    const mat = k.materials ? '<div style="background:#fce4ec;border-radius:8px;padding:12px;"><div style="font-weight:bold;font-size:12px;color:#c62828;margin-bottom:4px;">🧰 Materialer</div><div style="font-size:13px;">' + k.materials + '</div></div>' : '';
    skrivUtVindu('<div style="max-width:600px;margin:0 auto;"><div style="background:#fff;border-radius:10px;border:1.5px solid #d0dff0;overflow:hidden;"><div style="height:6px;background:' + kat.txt + ';"></div><div style="padding:18px;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;"><div style="width:46px;height:46px;border-radius:10px;background:' + kat.bg + ';display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">' + (k.icon||kat.ikon) + '</div><div><div style="font-weight:bold;font-size:18px;color:#1a2a3a;">' + k.title + '</div><div style="font-size:11px;color:#888;">' + k.category + (k.age_group?' · '+k.age_group:'') + (k.duration?' · ⏱ '+k.duration:'') + (k.difficulty?' · '+k.difficulty:'') + '</div></div></div>' + besk + steg + maal + mat + '</div></div><div style="margin-top:14px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', k.title);
  };

  const skrivUtFlereKort = () => {
    const liste = kort.filter(k => valgtForPrint.has(k.id));
    if (liste.length === 0) { vis("Velg minst ett kort å skrive ut"); return; }
    const kortHtml = liste.map(k => {
      const kat = katInfo(k.category);
      const steg = k.steps ? '<div style="background:#e8f5e9;border-radius:6px;padding:9px 10px;margin-bottom:6px;"><div style="font-weight:bold;font-size:10px;color:#2e7d32;margin-bottom:3px;">⚙️ GJENNOMFØRING</div><div style="font-size:11px;line-height:1.6;white-space:pre-line;">' + k.steps + '</div></div>' : '';
      const maal = k.learning_goal ? '<div style="background:#e3f2fd;border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:10px;color:#1565c0;"><strong>❓ Læringsmål:</strong> ' + k.learning_goal + '</div>' : '';
      const mat = k.materials ? '<div style="font-size:10px;color:#666;"><strong>🧰</strong> ' + k.materials + '</div>' : '';
      return '<div style="background:#fff;border-radius:10px;border:1.5px solid #d0dff0;overflow:hidden;break-inside:avoid;page-break-inside:avoid;"><div style="height:5px;background:' + kat.txt + ';"></div><div style="padding:12px;"><div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;"><div style="width:36px;height:36px;border-radius:8px;background:' + kat.bg + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + (k.icon||kat.ikon) + '</div><div><div style="font-weight:bold;font-size:14px;color:#1a2a3a;">' + k.title + '</div><div style="font-size:10px;color:#888;">' + k.category + (k.age_group?' · '+k.age_group:'') + (k.duration?' · '+k.duration:'') + '</div></div></div>' + (k.description?'<p style="font-size:11px;color:#444;margin-bottom:7px;line-height:1.5;">' + k.description + '</p>':'') + steg + maal + mat + '</div></div>';
    }).join('');
    skrivUtVindu('<div style="max-width:720px;margin:0 auto;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' + kortHtml + '</div><div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev · ' + liste.length + ' aktivitetskort</div></div>', 'Aktivitetskort (' + liste.length + ')');
  };

  const lagreKort = async (data, erUtkast = false) => {
    try {
      const payload = { ...data, created_by: aktivBruker.id, is_custom: true, is_draft: erUtkast };
      let resultat;
      if (data.id) {
        resultat = await oppdaterAktivitetskort(data.id, payload);
        setKort(p => p.map(k => k.id === data.id ? resultat : k));
        if (valgtKort?.id === data.id) setValgtKort(resultat);
        vis(erUtkast ? "💾 Utkast oppdatert" : "✅ Kort oppdatert");
      } else {
        resultat = await lagreNyttAktivitetskort(payload);
        setKort(p => [resultat, ...p]);
        vis(erUtkast ? "💾 Utkast lagret" : "✅ Aktivitetskort lagret!");
      }
      setModalAapen(false);
      setRedigererKort(null);
      onOppdater?.();
    } catch (e) {
      console.error(e);
      vis("❌ Kunne ikke lagre kortet");
    }
  };

  const slettKort = async (id) => {
    try {
      await slettAktivitetskort(id);
      setKort(p => p.filter(k => k.id !== id));
      setValgtKort(null);
      setBekreftSlett(null);
      vis("🗑 Kort slettet");
      onOppdater?.();
    } catch { vis("❌ Kunne ikke slette"); }
  };

  const kopierKort = async (k) => {
    try {
      const kopi = { title:k.title+" (kopi)", description:k.description, category:k.category, age_group:k.age_group, materials:k.materials, steps:k.steps, curriculum_area:k.curriculum_area, learning_goal:k.learning_goal, duration:k.duration, difficulty:k.difficulty, indoor_outdoor:k.indoor_outdoor, icon:k.icon, is_public:false, created_by:aktivBruker.id, is_custom:true, is_draft:true };
      const lagret = await lagreNyttAktivitetskort(kopi);
      setKort(p => [lagret, ...p]);
      vis("📋 Kort kopiert (utkast)");
      onOppdater?.();
    } catch { vis("❌ Kopiering feilet"); }
  };

  const importerFraAktivitet = async (aktivitet) => {
    try {
      const payload = { title:aktivitet.tittel, description:aktivitet.hva, category:aktivitet.kategori||"Lek", age_group:aktivitet.alder||"3-6 år", materials:aktivitet.materialer||"", steps:aktivitet.hvordan||"", curriculum_area:aktivitet.rammeplan||[], learning_goal:aktivitet.hvorfor||"", duration:aktivitet.tid||"", difficulty:"middels", indoor_outdoor:"begge", icon:aktivitet.ikon||"🎯", source_activity_id:aktivitet.id, created_by:aktivBruker.id, is_custom:false, is_public:false, is_draft:false };
      const lagret = await lagreNyttAktivitetskort(payload);
      setKort(p => [lagret, ...p]);
      setImporterAktivVis(false);
      vis("✅ Aktivitet konvertert til kort!");
      onOppdater?.();
    } catch { vis("❌ Konvertering feilet"); }
  };

  const genererMedAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLaster(true);
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    try {
      const system = `Du er en pedagogisk assistent for norske barnehager. Lag et detaljert aktivitetskort. Svar KUN med et JSON-objekt (ingen annen tekst) i dette formatet:
{"title":"...","description":"...","category":"Lek|Natur|Vann|Bevegelse|Kreativt|Språk|Antall|Musikk|Ute|Rolig|Eksperiment|Sosialt","age_group":"...","materials":"...","steps":"Steg 1: ...\\nSteg 2: ...\\nSteg 3: ...","curriculum_area":["kommunikasjon"],"learning_goal":"...","duration":"...","difficulty":"enkel|middels|avansert","indoor_outdoor":"inne|ute|begge","icon":"🎯","weather_tags":["sol","regn"]}`;
      const r = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ system, prompt: aiPrompt, max_tokens: 2500 }), signal: ctrl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      const tekst = d.text || "";
      const jsonMatch = tekst.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setRedigererKort(parsed);
          setModalAapen(true);
          setAiPanelAapen(false);
          setAiPrompt("");
        } catch {
          vis("⚠️ AI-svaret hadde ikke riktig format – prøv igjen");
        }
      } else {
        vis("⚠️ AI-svaret hadde ikke riktig format");
      }
    } catch (e) {
      console.error("[AI Aktivitetskort]", e);
      vis(e.name === "AbortError" ? "⏱ AI brukte for lang tid – prøv igjen" : "❌ AI-generering feilet");
    } finally { clearTimeout(tid); setAiLaster(false); }
  };

  // ── Detaljvisning ──
  if (valgtKort) {
    const kat = katInfo(valgtKort.category);
    const erEier = valgtKort.created_by === aktivBruker.id;
    return (
      <div className="fade">
        <Tilbake onClick={() => setValgtKort(null)} />
        <div style={{ background:C.w, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 16px rgba(44,91,142,0.12)" }}>
          <div style={{ height:8, background:kat.txt }}/>
          <div style={{ padding:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:54, height:54, borderRadius:14, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{valgtKort.icon||kat.ikon}</div>
                <div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:21, color:C.t, lineHeight:1.2 }}>{valgtKort.title}</div>
                  {valgtKort.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", marginTop:4 }}>📝 Utkast</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                <button className={`fav-btn ${favSet.has(valgtKort.id)?"aktiv":""}`} onClick={()=>toggleFavKort(valgtKort.id)}>{favSet.has(valgtKort.id)?"⭐":"☆"}</button>
                <button className="btn" onClick={()=>skrivUtEttKort(valgtKort)} style={{ padding:"5px 10px", fontSize:11, background:"#e8f5e9", color:"#2e7d32" }}>🖨️ Skriv ut</button>
                {erEier && <>
                  <button className="btn" onClick={()=>{setRedigererKort(valgtKort);setModalAapen(true);}} style={{ padding:"5px 10px", fontSize:11, background:C.lg2, color:C.t }}>✏️ Rediger</button>
                  <button className="btn" onClick={()=>kopierKort(valgtKort)} style={{ padding:"5px 10px", fontSize:11, background:C.lg2, color:C.t }}>📋 Kopier</button>
                  <button className="btn" onClick={()=>setBekreftSlett(valgtKort.id)} style={{ padding:"5px 10px", fontSize:11, background:"#fce4ec", color:"#c62828" }}>🗑</button>
                </>}
              </div>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
              <span className="tag" style={{ background:kat.bg, color:kat.txt }}>{kat.ikon} {valgtKort.category}</span>
              {valgtKort.age_group && <span className="tag" style={{ background:"#e8eff8", color:C.g }}>👶 {valgtKort.age_group}</span>}
              {valgtKort.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0" }}>⏱ {valgtKort.duration}</span>}
              {valgtKort.difficulty && <span className="tag" style={{ background:"#f3e5f5", color:"#6a1b9a" }}>📊 {valgtKort.difficulty}</span>}
              {valgtKort.indoor_outdoor && <span className="tag" style={{ background:"#f1f8e9", color:"#33691e" }}>{valgtKort.indoor_outdoor==="inne"?"🏠 Inne":valgtKort.indoor_outdoor==="ute"?"🌳 Ute":"🏠🌳 Begge"}</span>}
              {valgtKort.is_public && <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32" }}>🌍 Offentlig</span>}
            </div>
            {valgtKort.description && <div style={{ background:"#fff9c4", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#795548", marginBottom:4, fontSize:13 }}>🎯 Beskrivelse</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7 }}>{valgtKort.description}</div></div>}
            {valgtKort.steps && <div style={{ background:"#e8f5e9", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#2e7d32", marginBottom:4, fontSize:13 }}>⚙️ Gjennomføring</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7, whiteSpace:"pre-line" }}>{valgtKort.steps}</div></div>}
            {valgtKort.learning_goal && <div style={{ background:"#e3f2fd", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#1565c0", marginBottom:4, fontSize:13 }}>❓ Læringsmål</div><div style={{ color:C.t, fontSize:13, lineHeight:1.7 }}>{valgtKort.learning_goal}</div></div>}
            {valgtKort.materials && <div style={{ background:"#fce4ec", borderRadius:11, padding:"13px 15px", marginBottom:10 }}><div style={{ fontWeight:800, color:"#c62828", marginBottom:4, fontSize:13 }}>🧰 Materialer</div><div style={{ color:C.t, fontSize:13 }}>{valgtKort.materials}</div></div>}
            {valgtKort.curriculum_area?.length > 0 && <div style={{ marginBottom:10 }}><div style={{ fontSize:12, fontWeight:700, color:C.gr, marginBottom:7 }}>Rammeplan:</div><div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>{valgtKort.curriculum_area.map(r=><FagTag key={r} rid={r}/>)}</div></div>}
            {valgtKort.weather_tags?.length > 0 && <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>{valgtKort.weather_tags.map(t=><span key={t} className="tag" style={{ background:"#e1f5fe", color:"#0277bd" }}>🌤 {t}</span>)}</div>}
          </div>
        </div>
        {bekreftSlett && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div className="pop" style={{ background:C.w, borderRadius:16, padding:24, maxWidth:320, width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:C.t, marginBottom:10 }}>Slette kortet?</div>
              <p style={{ fontSize:13, color:C.t, lineHeight:1.6, marginBottom:16 }}>Dette kan ikke angres.</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setBekreftSlett(null)} style={{ flex:1, padding:11, background:C.lg2, color:C.t, border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Avbryt</button>
                <button onClick={()=>slettKort(bekreftSlett)} style={{ flex:1, padding:11, background:"#c62828", color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>🗑 Slett</button>
              </div>
            </div>
          </div>
        )}
        {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
        {modalAapen && <KortModal kort={redigererKort} onLagre={lagreKort} onLukk={()=>{setModalAapen(false);setRedigererKort(null);}}/>}
      </div>
    );
  }

  // ── Import fra eksisterende aktiviteter (modal) ──
  if (importerAktivVis) {
    const allAkt = AKTIVITETER.filter(a => {
      if (!sokAkt) return true;
      return (a.tittel||"").toLowerCase().includes(sokAkt.toLowerCase());
    });
    const alleredeImportert = new Set(kort.filter(k=>k.source_activity_id).map(k=>k.source_activity_id));
    return (
      <div className="fade">
        <Tilbake onClick={()=>setImporterAktivVis(false)}/>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:C.t, marginBottom:4 }}>🔄 Importer fra aktiviteter</div>
        <p style={{ color:C.gr, fontSize:12, marginBottom:12 }}>Velg en aktivitet og konverter den til et aktivitetskort.</p>
        <input value={sokAkt} onChange={e=>setSokAkt(e.target.value)} placeholder="🔍 Søk i aktiviteter..." style={{ ...iS, marginBottom:12 }}/>
        <div style={{ display:"grid", gap:8 }}>
          {allAkt.map(a => (
            <div key={a.id} className="hover" style={{ background:C.w, borderRadius:12, padding:"12px 14px", boxShadow:"0 2px 7px rgba(44,91,142,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:C.t, fontSize:13 }}>{a.tittel}</div>
                <div style={{ fontSize:11, color:C.gr, marginTop:2 }}>{a.kategori} · {a.alder}</div>
              </div>
              {alleredeImportert.has(a.id)
                ? <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:10 }}>✅ Importert</span>
                : <button className="btn" onClick={()=>importerFraAktivitet(a)} style={{ padding:"6px 12px", fontSize:11, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff" }}>Importer →</button>
              }
            </div>
          ))}
        </div>
        {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
      </div>
    );
  }

  // ── Hovedliste / grid ──
  return (
    <div className="fade">
      {/* Topp-header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, gap:8, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.t }}>🃏 Aktivitetskort</div>
          <p style={{ color:C.gr, fontSize:12, marginTop:2 }}>{kort.length} kort · {filtrert.length} vises</p>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <button className="btn" onClick={()=>setAiPanelAapen(!aiPanelAapen)} style={{ padding:"7px 11px", fontSize:11, background:aiPanelAapen?"#4178bd":"#e3f2fd", color:aiPanelAapen?"#fff":"#1565c0" }}>🤖 AI</button>
          <button className="btn" onClick={()=>setImporterAktivVis(true)} style={{ padding:"7px 11px", fontSize:11, background:"#f3e5f5", color:"#6a1b9a" }}>🔄 Importer</button>
          <button className="btn" onClick={trekkTilfeldig} style={{ padding:"7px 11px", fontSize:11, background:"#fff8e1", color:"#ff6f00" }}>🎲 Trekk</button>
          <button className="btn" onClick={()=>{setPrintModus(!printModus);setValgtForPrint(new Set());}} style={{ padding:"7px 11px", fontSize:11, background:printModus?"#2e7d32":"#e8f5e9", color:printModus?"#fff":"#2e7d32" }}>{printModus?"✕ Avbryt":"🖨️ Velg"}</button>
          {printModus && valgtForPrint.size > 0 && <button className="btn" onClick={skrivUtFlereKort} style={{ padding:"7px 13px", fontSize:12, background:"#2e7d32", color:"#fff", fontWeight:800 }}>🖨️ Skriv ut {valgtForPrint.size}</button>}
          <button className="btn" onClick={()=>{setRedigererKort(null);setModalAapen(true);}} style={{ padding:"7px 13px", fontSize:12, background:`linear-gradient(135deg,#3a72b0,#2c5b8e)`, color:"#fff" }}>➕ Nytt kort</button>
        </div>
      </div>

      {/* AI-panel */}
      {aiPanelAapen && (
        <div className="fade" style={{ background:"linear-gradient(135deg,#1f4068,#3a72b0)", borderRadius:14, padding:16, marginBottom:14, color:"#fff" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, marginBottom:6 }}>🤖 AI-generator for aktivitetskort</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", marginBottom:8 }}>Beskriv hva du vil ha – AI lager et komplett aktivitetskort.</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
            {["Naturtema 4-åringer, samarbeid","Vannlek sommeren, eksperimentering","Rolig inneaktivitet, språk 3-5 år","Bevegelseslek ute for hele gruppa"].map(t => (
              <button key={t} className="btn" onClick={()=>setAiPrompt(t)} style={{ padding:"4px 9px", fontSize:10, background:"rgba(255,255,255,0.15)", color:"#fff" }}>{t}</button>
            ))}
          </div>
          <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Eks: Lag et aktivitetskort for 4-åringer med naturtema og fokus på samarbeid..." style={{ ...iS, minHeight:70, resize:"vertical", marginBottom:8 }}/>
          <button className="btn" onClick={genererMedAI} disabled={aiLaster||!aiPrompt.trim()} style={{ padding:"9px 18px", fontSize:13, background:aiLaster?"rgba(255,255,255,0.5)":"#fff", color:C.g, fontWeight:800, opacity:aiPrompt.trim()?1:0.6 }}>
            {aiLaster ? "⏳ Genererer..." : "✨ Generer aktivitetskort"}
          </button>
        </div>
      )}

      {/* Søk */}
      <input value={sok} onChange={e=>setSok(e.target.value)} placeholder="🔍 Søk etter aktivitetskort..." style={{ ...iS, marginBottom:8 }}/>

      {/* Type-filter */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", marginBottom:7, paddingBottom:2 }}>
        <div style={{ display:"flex", gap:5, width:"max-content" }}>
          {[["alle","Alle"],["mine","Mine"],["offentlige","Offentlige"],["favoritter","⭐ Favoritter"],["utkast","📝 Utkast"]].map(([v,l]) => (
            <button key={v} className="btn" onClick={()=>setFilterType(v)} style={{ padding:"5px 11px", fontSize:11, background:filterType===v?C.g:C.lg2, color:filterType===v?"#fff":C.t, whiteSpace:"nowrap" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Kategori-filter */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch", marginBottom:8, paddingBottom:2 }}>
        <div style={{ display:"flex", gap:5, width:"max-content" }}>
          <button className="btn" onClick={()=>setFilterKat("alle")} style={{ padding:"4px 10px", fontSize:10, background:filterKat==="alle"?C.g:C.lg2, color:filterKat==="alle"?"#fff":C.t }}>Alle</button>
          {KORT_KATEGORIER.map(k => (
            <button key={k.id} className="btn" onClick={()=>setFilterKat(k.id)} style={{ padding:"4px 10px", fontSize:10, background:filterKat===k.id?k.txt:k.bg, color:filterKat===k.id?"#fff":k.txt, whiteSpace:"nowrap" }}>
              {k.ikon} {k.id}
            </button>
          ))}
        </div>
      </div>

      {/* Visnings-toggle + tell */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:11, color:C.gr }}>Viser {filtrert.length} aktivitetskort</div>
        <div style={{ display:"flex", gap:4 }}>
          <button className="btn" onClick={()=>setVisning("grid")} style={{ padding:"4px 10px", fontSize:13, background:visning==="grid"?C.g:C.lg2, color:visning==="grid"?"#fff":C.t }}>⊞</button>
          <button className="btn" onClick={()=>setVisning("liste")} style={{ padding:"4px 10px", fontSize:13, background:visning==="liste"?C.g:C.lg2, color:visning==="liste"?"#fff":C.t }}>≡</button>
        </div>
      </div>

      {/* Tom-tilstand: ingen kort enda */}
      {!laster && kort.length === 0 && (
        <div className="fade" style={{ background:"#e8f5e9", borderRadius:12, padding:20, marginBottom:14, border:"1.5px dashed #66bb6a", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🃏</div>
          <div style={{ fontWeight:800, color:"#2e7d32", marginBottom:6, fontSize:14 }}>Ingen aktivitetskort enda</div>
          <p style={{ fontSize:12, color:"#2e7d32", lineHeight:1.6, marginBottom:12 }}>Lag ditt første kort fra bunnen, importer fra eksisterende aktiviteter, eller la AI hjelpe deg!</p>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn" onClick={()=>{setRedigererKort(null);setModalAapen(true);}} style={{ padding:"8px 14px", fontSize:12, background:"#2e7d32", color:"#fff" }}>➕ Lag nytt kort</button>
            <button className="btn" onClick={()=>setAiPanelAapen(true)} style={{ padding:"8px 14px", fontSize:12, background:"#1565c0", color:"#fff" }}>🤖 Lag med AI</button>
            <button className="btn" onClick={()=>setImporterAktivVis(true)} style={{ padding:"8px 14px", fontSize:12, background:"#6a1b9a", color:"#fff" }}>🔄 Importer aktivitet</button>
          </div>
        </div>
      )}

      {laster && <div style={{ display:"flex", justifyContent:"center", padding:32 }}><div className="spin"/></div>}
      {!laster && filtrert.length === 0 && kort.length > 0 && (
        <div style={{ textAlign:"center", padding:28, color:C.gr }}>{sok?`Ingen treff for «${sok}»`:"Ingen kort i denne kategorien"}</div>
      )}

      {/* Grid-visning */}
      {!laster && visning === "grid" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:10 }}>
          {filtrert.map(k => {
            const kat = katInfo(k.category);
            return (
              <div key={k.id} className="hover fade" onClick={()=> printModus ? togglePrintValg(k.id) : setValgtKort(k)} style={{ background:C.w, borderRadius:14, overflow:"hidden", cursor:"pointer", boxShadow:"0 2px 10px rgba(44,91,142,0.09)", position:"relative", outline: printModus && valgtForPrint.has(k.id) ? "2.5px solid #2e7d32" : "none" }}>
                {printModus && <div style={{ position:"absolute", top:8, left:8, zIndex:2, width:20, height:20, borderRadius:5, background: valgtForPrint.has(k.id) ? "#2e7d32" : "#fff", border:"1.5px solid #2e7d32", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800 }}>{valgtForPrint.has(k.id) ? "✓" : ""}</div>}
                <div style={{ height:5, background:kat.txt }}/>
                <div style={{ padding:"14px 14px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:8 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:kat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{k.icon||kat.ikon}</div>
                    {!printModus && <button className={`fav-btn ${favSet.has(k.id)?"aktiv":""}`} onClick={e=>{e.stopPropagation();toggleFavKort(k.id);}} style={{ fontSize:15 }}>{favSet.has(k.id)?"⭐":"☆"}</button>}
                  </div>
                  <div style={{ fontWeight:800, color:C.t, fontSize:14, marginBottom:4, lineHeight:1.3 }}>{k.title}</div>
                  <div style={{ fontSize:11, color:C.gr, lineHeight:1.5, marginBottom:8 }}>{(k.description||"").substring(0,80)}{(k.description||"").length>80?"...":""}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    <span className="tag" style={{ background:kat.bg, color:kat.txt, fontSize:10 }}>{kat.ikon} {k.category}</span>
                    {k.age_group && <span className="tag" style={{ background:"#e8eff8", color:C.g, fontSize:10 }}>👶 {k.age_group}</span>}
                    {k.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0", fontSize:10 }}>⏱ {k.duration}</span>}
                    {k.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", fontSize:10 }}>Utkast</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liste-visning */}
      {!laster && visning === "liste" && (
        <div style={{ display:"grid", gap:7 }}>
          {filtrert.map(k => {
            const kat = katInfo(k.category);
            return (
              <div key={k.id} className="hover fade" onClick={()=> printModus ? togglePrintValg(k.id) : setValgtKort(k)} style={{ background:C.w, borderRadius:12, padding:"13px 15px", cursor:"pointer", boxShadow:"0 2px 7px rgba(44,91,142,0.07)", borderLeft:`4px solid ${kat.txt}`, outline: printModus && valgtForPrint.has(k.id) ? "2.5px solid #2e7d32" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:18 }}>{k.icon||kat.ikon}</span>
                      <div style={{ fontWeight:800, color:C.t, fontSize:14 }}>{k.title}</div>
                    </div>
                    <div style={{ color:C.gr, fontSize:11, marginBottom:5 }}>{(k.description||"").substring(0,90)}{(k.description||"").length>90?"...":""}</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      <span className="tag" style={{ background:kat.bg, color:kat.txt, fontSize:10 }}>{k.category}</span>
                      {k.age_group && <span className="tag" style={{ background:"#e8eff8", color:C.g, fontSize:10 }}>{k.age_group}</span>}
                      {k.duration && <span className="tag" style={{ background:"#e3f2fd", color:"#1565c0", fontSize:10 }}>{k.duration}</span>}
                      {k.is_draft && <span className="tag" style={{ background:"#fff3cd", color:"#856404", fontSize:10 }}>Utkast</span>}
                      {k.is_public && <span className="tag" style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:10 }}>🌍</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {printModus ? <div style={{ width:20, height:20, borderRadius:5, background: valgtForPrint.has(k.id) ? "#2e7d32" : "#fff", border:"1.5px solid #2e7d32", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:800 }}>{valgtForPrint.has(k.id) ? "✓" : ""}</div> : <button className={`fav-btn ${favSet.has(k.id)?"aktiv":""}`} onClick={e=>{e.stopPropagation();toggleFavKort(k.id);}} style={{ fontSize:15 }}>{favSet.has(k.id)?"⭐":"☆"}</button>}
                    <span style={{ color:C.gr, fontSize:17 }}>›</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAapen && <KortModal kort={redigererKort} onLagre={lagreKort} onLukk={()=>{setModalAapen(false);setRedigererKort(null);}}/>}
      {feedback && <div className="fade" style={{ position:"fixed", top:70, right:20, zIndex:500, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>{feedback}</div>}
    </div>
  );
}

function Barnehagehjelpen({ aktivBruker, onLogout, onUserUpdate }) {
  const [tema, setTema] = useState(() => {
    const lagret = localStorage.getItem("bh_tema");
    if (lagret === "dark" || lagret === "light") return lagret;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("bh_tema", tema);
  }, [tema]);

  const [side, setSide] = useState("hjem");
  const [skjemaer, setSkjemaer] = useState([]);
  const [skjemaerLastet, setSkjemaerLastet] = useState(false);
  const [preselectAktiv, setPreselectAktiv] = useState(null);
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
  const [globalDokumentasjon, setGlobalDokumentasjon] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSok, setGlobalSok] = useState("");
  const [planTema, setPlanTema] = useState(() => localStorage.getItem("bh_plan_tema") || "");
  useEffect(() => {
    if (planTema) localStorage.setItem("bh_plan_tema", planTema);
    else localStorage.removeItem("bh_plan_tema");
  }, [planTema]);

  const vis = (m) => { setFeedback(m); setTimeout(()=>setFeedback(""),3000); };

  // Global søk – leter på tvers av sanger, aktiviteter, tegneark, fagområder, rammeplan og brukerens planer
  const sokeResultat = (() => {
    const q = globalSok.trim().toLowerCase();
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
      const samlet = (p.tittel||"") + " " + (p.tema||"") + " " + (p.fagomrader||[]).join(" ");
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
  })();

  // Hjelpere for å navigere fra søketreff
  const aapneTegneark = (t) => { navigerTil("tegneark"); setGlobalSok(""); };
  const aapneAktivitet = (a) => { setPreselectAktiv(a.id); navigerTil("aktiviteter"); setGlobalSok(""); };
  const aapneFagomrade = (f) => { setValgtFag(f); setRammeSeksjon("fagomrader"); navigerTil("rammeplan"); setGlobalSok(""); };
  const aapneRammeplan = (key) => { setRammeSeksjon(key); setValgtFag(null); navigerTil("rammeplan"); setGlobalSok(""); };
  const aapneAktivitetskort = () => { navigerTil("aktivitetskort"); setGlobalSok(""); };
  const aapneDokumentasjon = () => { navigerTil("dokumentasjon"); setGlobalSok(""); };


  // Last favoritter når bruker logger inn
  useEffect(() => {
    if (aktivBruker?.id) hentFavoritter(aktivBruker.id).then(setFavoritter).catch(console.error);
    if (aktivBruker?.id) hentUkeplaner(aktivBruker.id).then(setGlobalUkeplaner).catch(console.error);
    if (aktivBruker?.id) hentMaanedsplaner(aktivBruker.id).then(setGlobalMaanedsplaner).catch(console.error);
    if (aktivBruker?.id) hentMaanedsbrev(aktivBruker.id).then(setGlobalMaanedsbrev).catch(console.error);
    if (aktivBruker?.id) hentArsplaner(aktivBruker.id).then(setGlobalArsplaner).catch(console.error);
    if (aktivBruker?.id) supabase.from("boker").select("id,tittel,forfatter,beskrivelse,kategori").then(({data})=>setGlobalBoker(data||[])).catch(console.error);
    if (aktivBruker?.id) hentUserTegneark(aktivBruker.id).then(setGlobalUserTegneark).catch(console.error);
    if (aktivBruker?.id) hentUserSanger(aktivBruker.id).then(setGlobalUserSanger).catch(console.error);
    if (aktivBruker?.id) hentAktivitetskort(aktivBruker.id).then(setGlobalAktivitetskort).catch(console.error);
    if (aktivBruker?.id) hentDokumentasjon(aktivBruker.id).then(setGlobalDokumentasjon).catch(console.error);
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

  // Lagre skjemaer til storage hver gang de endres (kun etter første lasting for å unngå å overskrive med tom liste)
  useEffect(() => {
    if (!aktivBruker?.id || !skjemaerLastet) return;
    (async () => {
      try {
        const { error: delErr } = await supabase.from("skjemaer").delete().eq("user_id", aktivBruker.id);
        if (delErr) throw delErr;
        if (skjemaer.length > 0) await supabase.from("skjemaer").insert(skjemaer.map(s => ({ user_id: aktivBruker.id, skjema_id: s.id||"", payload: s })));
      } catch(e) { console.error("[Skjemaer] Kunne ikke lagre:", e); }
    })();
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
    {id:"planlegging",i:"🗓️",n:"Planlegging"},
    {id:"samarbeid",i:"👥",n:"Samarbeid"},
    {id:"aktivitetskort",i:"🃏",n:"Aktivitetskort"},
    {id:"dokumentasjon",i:"📔",n:"Dokumentasjon"},
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

  const [vær, setVær] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=auto`);
        if (!r.ok) return;
        const d = await r.json();
        const c = d?.current;
        if (!c) return;
        setVær({ temp: Math.round(c.temperature_2m), kode: c.weather_code, vind: Math.round(c.wind_speed_10m) });
      } catch {}
    }, () => {});
  }, []);

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

  const Hjem = ()=>(
    <div className="fade">
      {/* HERO */}
      <div style={{background:`linear-gradient(135deg, #2c5b8e 0%, #4178bd 50%, #6ba0d9 100%)`, borderRadius:22, padding:"28px 22px 24px", color:"#fff", marginBottom:20, position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-20, right:-20, fontSize:90, opacity:.15, transform:"rotate(15deg)", pointerEvents:"none"}}>🌟</div>
        <div style={{position:"absolute", bottom:-15, left:10, fontSize:70, opacity:.12, transform:"rotate(-10deg)", pointerEvents:"none"}}>🎨</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{fontSize:28}}>{hikon}</div>
          {vær && (
            <div style={{background:"rgba(255,255,255,0.18)",borderRadius:12,padding:"8px 13px",textAlign:"center",backdropFilter:"blur(4px)",minWidth:90}}>
              <div style={{fontSize:22,lineHeight:1}}>{værIkon}</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,lineHeight:1.1,marginTop:2}}>{vær.temp}°</div>
              <div style={{fontSize:10,opacity:.9,marginTop:1}}>{værTekst}</div>
              <div style={{fontSize:10,opacity:.75,marginTop:1}}>💨 {vær.vind} m/s</div>
            </div>
          )}
        </div>
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
        aapneAktivitetskort={aapneAktivitetskort}
        aapneDokumentasjon={aapneDokumentasjon}
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
          ["🎵","Sanger & Rim",`${SANGER.length} sanger og rim`,"#2c5b8e","sanger"],
          ["🏃","Aktiviteter",`${AKTIVITETER.length} ferdige aktiviteter`,"#1565c0","aktiviteter"],
          ["📚","Bøker","Pedagogisk litteratur og AI-fortelling","#00796b","boker"],
          ["🃏","Aktivitetskort","Kort til samlingsstund og lek","#f57f17","aktivitetskort"],
          ["✏️","Nytt skjema","HVA · HVORDAN · HVORFOR","#6a1b9a","skjema-ny"],
          ["🖍️","Tegneark",`${TEGNEARK.length} tegneark å skrive ut`,"#c62828","tegneark"],
          ["📖","Rammeplan","7 fagområder utdypet","#2d6a4f","rammeplan"],
          ["🤖","AI-assistent","Lag sanger, planer og mer","#37474f","ai"],
        ].map(([ic,t,u,fc,sid])=>(
          <div key={t} className="hover fade" onClick={()=>setSide(sid)} style={{background:C.w, borderRadius:14, padding:"16px 14px", cursor:"pointer", boxShadow:`0 2px 10px ${fc}22`, borderLeft:`4px solid ${fc}`}}>
            <div style={{fontSize:26, marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'Fredoka One',cursive", fontSize:15, color:C.t}}>{t}</div>
            <div style={{fontSize:11, color:C.gr, marginTop:2}}>{u}</div>
          </div>
        ))}
      </div>

      {/* PLANLEGGING */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t}}>🗓️ Planlegging</div>
        <button onClick={()=>navigerTil("planlegging")} style={{background:"#d8f3dc",color:"#2d6a4f",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Se alle →</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20}}>
        {[
          ["📅","Ukeplan","Mandag–fredag med tema","ukeplan","#1565c0"],
          ["🗓️","Månedsplan","Hele måneden strukturert","manedsplan","#6a1b9a"],
          ["✉️","Månedsbrev","Brev til foreldre","manedsbrev","#e67e22"],
          ["📆","Årsplan","Overordnet tema og mål","arsplan","#2d6a4f"],
        ].map(([ic,t,u,typeId,fc])=>(
          <div key={t} className="hover" onClick={()=>aapneAImedType(typeId)} style={{background:C.w, borderRadius:12, padding:"12px 13px", cursor:"pointer", boxShadow:`0 2px 8px ${fc}1f`, borderLeft:`3px solid ${fc}`}}>
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
              style={{background:C.lg2, borderRadius:10, padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.18s", borderLeft:`3px solid ${f.farge}`}}>
              <span style={{fontSize:20}}>{f.ikon}</span>
              <div>
                <div data-fag-color={f.id} style={{fontSize:11, fontWeight:800, color:f.farge, lineHeight:1.3}}>{f.navn}</div>
                <div style={{fontSize:9, color:C.gr, marginTop:1}}>{f.kortbeskrivelse}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:C.lg2, borderRadius:13, padding:"13px 15px", borderLeft:`4px solid ${C.g}`}}>
        <div style={{fontWeight:800, color:C.g, fontSize:12, marginBottom:4}}>🌿 Om Barnehagehjelpen</div>
        <div style={{fontSize:12, color:C.t, lineHeight:1.7}}>Alt innhold er koblet til Rammeplan 2017. Bruk AI-assistenten til å generere sanger, aktiviteter og pedagogiske planer tilpasset din barnegruppe.</div>
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
          <Tilbake onClick={()=>{setValgtSkjema(null);setRedigerSkjemaTittel(null);}} />
          {redigerSkjemaTittel !== null ? (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:C.g,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Endre navn</div>
              <div style={{display:"flex",gap:8}}>
                <input autoFocus type="text" value={redigerSkjemaTittel} onChange={e=>setRedigerSkjemaTittel(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter"&&redigerSkjemaTittel.trim()){
                      const nyTittel=redigerSkjemaTittel.trim();
                      setSkjemaer(p=>p.map(s=>s.id===valgtSkjema.id?{...s,tittel:nyTittel}:s));
                      setValgtSkjema(v=>v?{...v,tittel:nyTittel}:v);
                      setRedigerSkjemaTittel(null);
                      vis("✅ Navn oppdatert");
                    }
                    if(e.key==="Escape") setRedigerSkjemaTittel(null);
                  }}
                  style={{flex:1,padding:"9px 12px",border:`2px solid ${C.g}`,borderRadius:9,fontSize:14,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:C.t}} />
                <button className="btn" onClick={()=>{
                  const nyTittel=redigerSkjemaTittel.trim();
                  if(!nyTittel) return;
                  setSkjemaer(p=>p.map(s=>s.id===valgtSkjema.id?{...s,tittel:nyTittel}:s));
                  setValgtSkjema(v=>v?{...v,tittel:nyTittel}:v);
                  setRedigerSkjemaTittel(null);
                  vis("✅ Navn oppdatert");
                }} style={{background:C.g,color:"#fff",padding:"9px 16px",fontSize:13}}>Lagre</button>
                <button className="btn" onClick={()=>setRedigerSkjemaTittel(null)} style={{background:C.lg2,color:C.g,padding:"9px 12px",fontSize:13}}>Avbryt</button>
              </div>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:C.t,flex:1}}>{valgtSkjema.tittel}</div>
              <button className="btn" onClick={()=>setRedigerSkjemaTittel(valgtSkjema.tittel)}
                style={{background:C.lg2,color:C.g,padding:"5px 10px",fontSize:12,flexShrink:0}}>✏️ Endre navn</button>
            </div>
          )}
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {valgtSkjema.alder&&<span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtSkjema.alder}</span>}
            {valgtSkjema.kategori&&<span className="tag" style={{background:"#e8eff8",color:"#3a72b0"}}>{valgtSkjema.kategori}</span>}
            {valgtSkjema.rammeplan?.map(r=><FagTag key={r} rid={r}/>)}
          </div>
          {[
            {felt:valgtSkjema.hva, label:"🎯 HVA", bg:"#fff9c4", col:"#795548"},
            {felt:valgtSkjema.materialer, label:"📦 MATERIALER", bg:"#fce4ec", col:"#c62828"},
            {felt:valgtSkjema.hvordan, label:"⚙️ HVORDAN", bg:"#e8f5e9", col:"#2e7d32"},
            {felt:valgtSkjema.hvorfor, label:"❓ HVORFOR", bg:"#e3f2fd", col:"#1565c0"},
          ].filter(s=>s.felt).map(({felt,label,bg,col})=>(
            <div key={label} style={{background:bg,borderRadius:10,padding:"11px 13px",marginBottom:10}}>
              <div style={{fontWeight:800,color:col,fontSize:12,marginBottom:7}}>{label}</div>
              <RenderTekst tekst={felt} />
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={()=>skrivUtGenerell({tittel:valgtSkjema.tittel,meta:[valgtSkjema.alder,valgtSkjema.kategori].filter(Boolean).join(" • "),seksjoner:[{label:"🎯 Hva",tekst:valgtSkjema.hva,farge:"#795548",bg:"#fff9c4"},{label:"📦 Materialer",tekst:valgtSkjema.materialer,farge:"#c62828",bg:"#fce4ec"},{label:"⚙️ Hvordan",tekst:valgtSkjema.hvordan,farge:"#2e7d32",bg:"#e8f5e9"},{label:"❓ Hvorfor",tekst:valgtSkjema.hvorfor,farge:"#1565c0",bg:"#e3f2fd"}]})} style={{background:"#e3f2fd",color:"#1565c0",padding:"8px 16px",fontSize:12,border:"none",borderRadius:9,cursor:"pointer",fontWeight:800,fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button className="btn" onClick={()=>setBekreftSlettSkjema(valgtSkjema)} style={{background:"#ffebee",color:"#c62828",padding:"8px 16px",fontSize:12}}>🗑 Slett skjema</button>
          </div>
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
                    {(s.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge}}>{f.ikon}</span>:null;})}
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
    const seks=[["oversikt","📋","Oversikt"],["formal","🏛️","Formål"],["verdigrunnlag","💎","Verdigrunnlag"],["lek","🎭","Lek og læring"],["danning","💝","Omsorg og vennskap"],["medvirkning","🗣️","Medvirkning"],["fagomrader","📚","Fagområder"],["livsmestring","🌱","Livsmestring"],["pedagogisk","📋","Pedagogisk arbeid"],["samarbeid","👨‍👩‍👧","Samarbeid"],["overgang","🎒","Overgang"],["barnehageloven","⚖️","Barnehageloven"],["roller","👤","Roller"],["inkludering","♿","Inkludering"]];
    return (
      <div className="fade">
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📖 Rammeplan 2017</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:12}}>Barnehagens viktigste styringsverktøy</p>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {seks.map(([v,ic,l])=>(
            <button key={v} className="btn" onClick={()=>{setRammeSeksjon(v);setValgtFag(null);}} style={{padding:"6px 11px",fontSize:11,background:rammeSeksjon===v?C.g:C.lg2,color:rammeSeksjon===v?"#fff":C.t}}>{ic} {l}</button>
          ))}
        </div>

        {rammeSeksjon==="oversikt"&&(
          <div className="fade">
            <div style={{background:"#fff8e1",borderRadius:13,padding:"13px 15px",marginBottom:14,borderLeft:"4px solid #6ba0d9"}}>
              <div style={{fontWeight:800,color:"#795548",fontSize:13,marginBottom:5}}>Om Rammeplan for barnehagen</div>
              <div style={{fontSize:13,color:"#5d4037",lineHeight:1.7}}>Rammeplan for barnehagen (2017) er en forskrift til barnehageloven som fastsetter verdier, innhold og oppgaver for alle norske barnehager. Den er det viktigste arbeidsverktøyet for alle som jobber i barnehage.</div>
            </div>
            <div style={{display:"grid",gap:9}}>
              {[["🏛️","Formål","Barnehageloven §1 – overordnet formål","formal"],["💎","Verdigrunnlag","Demokrati, mangfold, menneskeverd","verdigrunnlag"],["🎭","Lek og læring","Lekens plass og personalets rolle","lek"],["💝","Omsorg og vennskap","Omsorg, danning og vennskap","danning"],["🗣️","Barnets medvirkning","Rett til innflytelse og deltakelse","medvirkning"],["📚","De 7 fagområdene","Alle faglig innhold og mål","fagomrader"],["🌱","Livsmestring og helse","Trivsel, sosial kompetanse, mobbing","livsmestring"],["📋","Pedagogisk arbeid","Planlegging, vurdering, dokumentasjon","pedagogisk"],["👨‍👩‍👧","Samarbeid med foreldre","Former for godt foreldresamarbeid","samarbeid"],["🎒","Overgang til skole","Forberedelse og ansvarsfordeling","overgang"],["⚖️","Barnehageloven","§1, §2, §3, §4, §16, §19a, §41","barnehageloven"],["👤","Ansvar og roller","Eier, styrer, ped.leder, BUA, assistent","roller"],["♿","Inkludering","Tilrettelegging, PPT, flerspråklige, minoriteter","inkludering"]].map(([ic,t,u,v])=>(
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
                          <div><div data-fag-color={f.id} style={{fontWeight:800,color:f.farge,fontSize:13}}>{f.nr}. {f.navn}</div><div style={{fontSize:11,color:C.gr}}>{f.kortbeskrivelse}</div></div>
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
                <div data-fag={valgtFag.id} style={{background:valgtFag.lys,borderRadius:13,padding:18,marginBottom:12,borderLeft:`5px solid ${valgtFag.farge}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <span style={{fontSize:30}}>{valgtFag.ikon}</span>
                    <div data-fag-color={valgtFag.id} style={{fontFamily:"'Fredoka One',cursive",fontSize:19,color:valgtFag.farge}}>{valgtFag.navn}</div>
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
                  <div data-fag={valgtFag.id} style={{background:valgtFag.lys,borderRadius:8,padding:11,fontSize:13,color:C.t,lineHeight:1.7}}>{valgtFag.progresjon}</div>
                </div>
                <div style={{background:C.w,borderRadius:11,padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(44,91,142,0.07)"}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.t,marginBottom:8}}>🛠 Arbeidsmetoder</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {valgtFag.arbeidsmater.map((a,i)=><div data-fag={valgtFag.id} key={i} style={{background:valgtFag.lys,borderRadius:8,padding:"7px 10px",fontSize:11,color:valgtFag.farge,fontWeight:600}}>✓ {a}</div>)}
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

        {rammeSeksjon==="barnehageloven"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>⚖️ {RE.barnehageloven.tittel}</div>
            <div style={{background:"#fff8e1",borderRadius:12,padding:13,marginBottom:14,fontSize:12,color:"#5d4037",lineHeight:1.7,borderLeft:"4px solid #e67e22"}}>Lovtekstene er fra Lov om barnehager (barnehageloven). Loven gir rammene – Rammeplan for barnehagen (2017) utdyper innholdet.</div>
            <div style={{display:"grid",gap:10}}>
              {RE.barnehageloven.paragrafer.map((p,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                    <span style={{background:C.g,color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,flexShrink:0,whiteSpace:"nowrap"}}>{p.nr}</span>
                    <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
                  </div>
                  <div style={{fontSize:12,color:C.t,lineHeight:1.75,fontStyle:"italic",borderLeft:"3px solid #d8e6f5",paddingLeft:12}}>{p.tekst}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="roller"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>👤 {RE.roller.tittel}</div>
            <div style={{background:"#e8eff8",borderRadius:12,padding:13,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7}}>{RE.roller.innhold}</div>
            <div style={{display:"grid",gap:10}}>
              {RE.roller.personer.map((p,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid "+p.farge}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                    <span style={{fontSize:22}}>{p.ikon}</span>
                    <div style={{fontWeight:800,color:p.farge,fontSize:15}}>{p.rolle}</div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:11,marginBottom:6}}>ANSVAR</div>
                    {p.ansvar.map((a,j)=>(
                      <div key={j} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <span style={{color:p.farge,fontWeight:800,flexShrink:0}}>✓</span>
                        <span style={{fontSize:12,color:C.t,lineHeight:1.6}}>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"#f5f9fd",borderRadius:8,padding:"8px 10px",fontSize:11,color:C.gr,lineHeight:1.6}}>
                    <strong>Krav:</strong> {p.krav}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rammeSeksjon==="inkludering"&&(
          <div className="fade">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:10}}>♿ {RE.inkludering.tittel}</div>
            <div style={{background:"#e8f5e9",borderRadius:12,padding:13,marginBottom:14,fontSize:13,color:C.t,lineHeight:1.7,borderLeft:"4px solid #2d6a4f"}}>{RE.inkludering.innhold}</div>
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              {RE.inkludering.omrader.map((o,i)=>(
                <div key={i} style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid "+o.farge}}>
                  <div style={{fontWeight:800,color:o.farge,fontSize:14,marginBottom:4}}>{o.ikon} {o.navn}</div>
                  <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:8}}>{o.innhold}</div>
                  <div style={{background:"#f5f9fd",borderRadius:8,padding:10}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:10,marginBottom:6}}>TILTAK OG RETTIGHETER</div>
                    {o.tiltak.map((t,j)=>(
                      <div key={j} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                        <span style={{color:o.farge,fontWeight:800,flexShrink:0}}>•</span>
                        <span style={{fontSize:12,color:C.t,lineHeight:1.5}}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.w,borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 7px rgba(44,91,142,0.07)",borderLeft:"4px solid #1565c0"}}>
              <div style={{fontWeight:800,color:"#1565c0",fontSize:14,marginBottom:6}}>🏫 {RE.inkludering.ppt.tittel}</div>
              <div style={{fontSize:12,color:C.t,lineHeight:1.7,marginBottom:10}}>{RE.inkludering.ppt.innhold}</div>
              <div style={{marginBottom:10}}>
                <div style={{fontWeight:800,color:C.t,fontSize:11,marginBottom:6}}>OPPGAVER</div>
                {RE.inkludering.ppt.oppgaver.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:4,alignItems:"flex-start"}}>
                    <span style={{color:"#1565c0",fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:C.t,lineHeight:1.5}}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#e3f2fd",borderRadius:8,padding:"8px 10px",fontSize:11,color:"#1565c0",lineHeight:1.6}}><strong>Hvem kan henvende seg?</strong> {RE.inkludering.ppt.hvemKanHenvise}</div>
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
    const [lokalToast, setLokalToast] = useState("");
    const [visAiPanel, setVisAiPanel] = useState(false);
    const [userTegneark, setUserTegneark] = useState([]);
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const favSet = new Set(favoritter?.tegneark || []);

    useEffect(() => {
      if (!aktivBruker?.id) return;
      hentUserTegneark(aktivBruker.id).then(setUserTegneark);
    }, [aktivBruker?.id]);

    const userMapped = userTegneark.map(t => ({ id:"user_"+t.id, tittel:t.tittel, ikon:t.ikon||"🖍️", kategori:t.kategori||"natur", alder:t.alder, rammeplan:t.rammeplan||[], svg:<SvgPlaceholder/>, oppgave:t.oppgave, samtale:t.samtale, mal:t.mal, _erMin:true, _dbId:t.id }));
    const alleData = [...userMapped, ...TEGNEARK];
    const data = tkat==="favoritter"
      ? alleData.filter(t=>favSet.has(t.id))
      : tkat==="mine"
      ? userMapped
      : (tkat==="alle" ? alleData : alleData.filter(t=>t.kategori===tkat));

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
        visLokal("✅ Filen er lastet ned");
        return true;
      } catch (e) {
        console.error("[Last ned] feilet:", e);
        visLokal("❌ Kunne ikke laste ned");
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
              visLokal("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
              setTimeout(() => lastNed(ark), 700);
            }
            // (ingen logging når print-dialog faktisk åpnes – det er normalfallet)
          }, 1800);
        }, 100);
      } catch (e) {
        console.error("[Skriv ut] uventet feil:", e);
        afterHandler();
        visLokal("⚠️ Utskrift feilet – laster ned i stedet");
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
        visLokal("✅ Delt!");
      } catch (e) {
        if (e.name === "AbortError") return; // bruker avbrøt – ingen melding
        console.warn("[Del] feilet:", e);
        visLokal("❌ Kunne ikke dele");
      }
    };
    
    // Robust copy with fallback and user feedback
    const kopier = async (ark) => {
      const text = `${ark.tittel}\n\n🖍️ Tegneoppgave:\n${ark.oppgave}\n\n💬 Samtale med barna:\n${ark.samtale}\n\n📖 Mål: ${ark.mal}\n\n👶 Alder: ${ark.alder}`;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          visLokal("✅ Kopiert til utklippstavlen!");
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
        visLokal(ok ? "✅ Kopiert til utklippstavlen!" : "❌ Kunne ikke kopiere");
      } catch (e) {
        visLokal("❌ Kunne ikke kopiere");
      }
    };
    
    if (visAiPanel) return <AiTegnearkView aktivBruker={aktivBruker} onLagre={(ny) => { setUserTegneark(p => [ny, ...p]); setGlobalUserTegneark(p => [ny, ...p]); setVisAiPanel(false); }} onAvbryt={() => setVisAiPanel(false)} />;
    const slettMin = async (dbId) => {
      await slettUserTegneark(dbId, aktivBruker.id);
      setUserTegneark(p => p.filter(t => t.id !== dbId));
      setValgtT(null);
    };
    return (
      <div className="fade">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t}}>🖍️ Tegneark</div>
          {aktivBruker&&<button className="btn" onClick={()=>setVisAiPanel(true)} style={{padding:"7px 13px",fontSize:12,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",whiteSpace:"nowrap"}}>🤖 AI-tegneark</button>}
        </div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>{alleData.length} barnevennlige tegneark fordelt på {TEGNEKAT.length-1} kategorier – klikk for å se og skrive ut</p>
        <div style={{background:"#fff8e1",borderRadius:12,padding:"11px 14px",marginBottom:14,borderLeft:"4px solid #6ba0d9",fontSize:12,color:"#795548"}}>
          <strong>💡 Slik bruker du tegnearkene:</strong> Bla i kategoriene under, åpne et ark, trykk "Skriv ut" for å skrive ut, eller "Kopier" for å lagre teksten. Alle ark er koblet til rammeplanen med samtaleforslag.
        </div>
        <div style={{marginBottom:16,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,marginLeft:-4,marginRight:-4,paddingLeft:4,paddingRight:4}}>
          <div style={{display:"flex",gap:7,flexWrap:"nowrap",width:"max-content"}}>
            {[["favoritter","⭐ Favoritter"],["mine","🤖 Mine"],...TEGNEKAT].map(([v,l])=>{
              const cnt = v==="favoritter" ? favSet.size : v==="mine" ? userMapped.length : (v==="alle" ? alleData.length : alleData.filter(t=>t.kategori===v).length);
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
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.t,flex:1,lineHeight:1.2}}>{valgtT.ikon} {valgtT.tittel}</div>
              <button className={`fav-btn ${favSet.has(valgtT.id)?"aktiv":""}`} onClick={()=>toggleFav("tegneark",valgtT.id)} title={favSet.has(valgtT.id)?"Fjern fra favoritter":"Legg til i favoritter"} aria-label="Favoritt" style={{fontSize:20,flexShrink:0}}>
                {favSet.has(valgtT.id)?"⭐":"☆"}
              </button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              <span className="tag" style={{background:C.mint,color:C.g}}>👶 {valgtT.alder}</span>
              {(valgtT.rammeplan||[]).map(r=><FagTag key={r} rid={r}/>)}
            </div>
            {/* SVG */}
            <div id={"svg-ark-"+valgtT.id} className="svg-wrap-hover" style={{background:"linear-gradient(135deg,#fafffe,#f0f9f4)",border:"2px solid #d8f3dc",borderRadius:16,padding:16,textAlign:"center",marginBottom:16}}>
              <div style={{maxWidth:300,margin:"0 auto"}}>{valgtT.svg}</div>
            </div>
            {/* Info-kort */}
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              <div style={{background:"#fff9c4",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>🖍️ Tegneoppgave</div>
                <div style={{fontSize:13,color:C.t,lineHeight:1.65}}>{valgtT.oppgave}</div>
              </div>
              <div style={{background:"#e8f5e9",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#2e7d32",fontSize:11,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>💬 Samtale med barna</div>
                <div style={{display:"grid",gap:4}}>
                  {(valgtT.samtale||"").split("?").map(s=>s.trim()).filter(s=>s.length>3).map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",fontSize:13,color:C.t,lineHeight:1.5}}>
                      <span style={{color:"#2e7d32",fontWeight:800,flexShrink:0,marginTop:1}}>•</span>
                      <span>{s}?</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"#e3f2fd",borderRadius:11,padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#1565c0",fontSize:11,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>📖 Rammeplanen</div>
                <div style={{fontSize:13,color:C.t}}>{valgtT.mal}</div>
              </div>
            </div>
            {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:8,textAlign:"center"}}>{lokalToast}</div>}
            {/* Knapper */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="btn" onClick={()=>skrivUt(valgtT)} style={{background:C.g,color:"#fff",padding:"12px",fontSize:13,fontWeight:800}}>🖨️ Skriv ut</button>
              <button className="btn" onClick={()=>lastNed(valgtT)} style={{background:"#2c5b8e",color:"#fff",padding:"12px",fontSize:13,fontWeight:800}}>💾 Last ned</button>
              <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8f5e9",color:C.t,padding:"12px",fontSize:13,fontWeight:700}}>📋 Kopier tekst</button>
              {kanDele
                ? <button className="btn" onClick={()=>del(valgtT)} style={{background:"#fff3e0",color:"#e65100",padding:"12px",fontSize:13,fontWeight:700}}>📤 Del</button>
                : <button className="btn" onClick={()=>kopier(valgtT)} style={{background:"#e8eff8",color:C.t,padding:"12px",fontSize:13,fontWeight:700}}>📋 Kopier (igjen)</button>
              }
            </div>
            {valgtT._erMin && <button className="btn" onClick={()=>slettMin(valgtT._dbId)} style={{width:"100%",marginTop:8,padding:"10px",fontSize:13,background:"#ffebee",color:"#c62828",fontWeight:700}}>🗑️ Slett mitt tegneark</button>}
          </div>
        ) : (
          <>
            {data.length===0 && (
              <div style={{textAlign:"center",padding:28,color:C.gr,background:C.w,borderRadius:12}}>
                {tkat==="favoritter" ? "Du har ingen favoritt-tegneark ennå – trykk på ⭐ for å lagre" : "Ingen tegneark i denne kategorien"}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {data.map(t=>(
                <div key={t.id} className="hover fade" onClick={()=>setValgtT(t)} style={{background:C.w,borderRadius:14,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 8px rgba(44,91,142,0.08)",position:"relative"}}>
                  <button className={`fav-btn ${favSet.has(t.id)?"aktiv":""}`} onClick={(e)=>{e.stopPropagation();toggleFav("tegneark",t.id);}} style={{position:"absolute",top:7,right:7,fontSize:15,zIndex:2}} aria-label="Favoritt">
                    {favSet.has(t.id)?"⭐":"☆"}
                  </button>
                  <div style={{background:"linear-gradient(135deg,#f0f9f4,#e8f5e9)",padding:"14px 10px 10px",textAlign:"center"}}>
                    <div style={{maxWidth:120,margin:"0 auto",pointerEvents:"none"}}>{t.svg}</div>
                  </div>
                  <div style={{padding:"9px 11px 11px"}}>
                    <div style={{fontWeight:800,color:C.t,fontSize:13,lineHeight:1.3,marginBottom:3}}>{t._erMin&&<span style={{fontSize:9,background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"1px 5px",marginRight:4,fontWeight:700}}>🤖 AI</span>}{t.tittel}</div>
                    <div style={{fontSize:10,color:C.gr,marginBottom:5}}>👶 {t.alder}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(t.rammeplan||[]).map(r=>{const f=FAGOMRADER.find(x=>x.id===r);return f?<span data-fag={f.id} key={r} className="tag" style={{background:f.lys,color:f.farge,fontSize:9,padding:"1px 5px"}}>{f.ikon} {f.navn.split(",")[0]}</span>:null;})}
                    </div>
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


  // ─── MaanedsplanSide ───
  const MAANEDER = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];
  const MaanedsplanSide = () => {
    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste");
    const [valgt, setValgt] = useState(null);
    const [m_tittel, setMTittel] = useState("");
    const [m_aar, setMAar] = useState(new Date().getFullYear());
    const [m_maaned, setMMaaned] = useState(new Date().getMonth()+1);
    const [m_tema, setMTema] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [m_fag, setMFag] = useState([]);
    const [m_uker, setMUker] = useState(["","","",""]);
    const [m_notat, setMNotat] = useState("");
    const [m_loading, setMLoading] = useState(false);
    const [m_feil, setMFeil] = useState("");
    const [m_aiLoading, setMAiLoading] = useState(false);
    const [bekreftSletting, setBekreftSletting] = useState(false);
    useEffect(()=>{
      let avbrutt=false;
      (async()=>{ if(!aktivBruker?.id){setLastet(true);return;} const liste=await hentMaanedsplaner(aktivBruker.id); if(!avbrutt){setPlaner(liste);setLastet(true);} })();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);
    const lagre=async(liste)=>{const ok=await lagreMaanedsplaner(aktivBruker.id,liste);if(!ok){setMFeil("Kunne ikke lagre");return false;}setPlaner(liste);setGlobalMaanedsplaner(liste);return true;};
    const nullstill=()=>{const n=new Date();setMTittel("");setMAar(n.getFullYear());setMMaaned(n.getMonth()+1);setMTema("");setMFag([]);setMUker(["","","",""]);setMNotat("");setMFeil("");};
    const nyPlan=()=>{nullstill();setMTema(planTema);setValgt(null);setVisning("ny");};
    const redigerPlan=(p)=>{setValgt(p);setMTittel(p.tittel||"");setMAar(p.aar||new Date().getFullYear());setMMaaned(p.maaned||1);setMTema(p.tema||"");setMFag(p.fagomrader||[]);setMUker([p.uke1||"",p.uke2||"",p.uke3||"",p.uke4||""]);setMNotat(p.notat||"");setMFeil("");setVisning("rediger");};
    const slettPlan=async(id)=>{const ok=await lagre(planer.filter(p=>p.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};
    const autoTittel=()=>m_tittel.trim()||`${MAANEDER[m_maaned-1]} ${m_aar}`;
    const lagreNy=async()=>{setMFeil("");if(!m_tema.trim()){setMFeil("Skriv et tema");return;}setMLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:autoTittel(),aar:m_aar,maaned:m_maaned,tema:m_tema.trim(),fagomrader:m_fag,uke1:m_uker[0],uke2:m_uker[1],uke3:m_uker[2],uke4:m_uker[3],notat:m_notat,opprettet:new Date().toISOString()},...planer]);setMLoading(false);if(ok){visLokal("✅ Månedsplan lagret");setVisning("liste");}};
    const lagreEndring=async()=>{setMFeil("");if(!valgt)return;setMLoading(true);const ok=await lagre(planer.map(p=>p.id===valgt.id?{...p,tittel:autoTittel(),aar:m_aar,maaned:m_maaned,tema:m_tema.trim(),fagomrader:m_fag,uke1:m_uker[0],uke2:m_uker[1],uke3:m_uker[2],uke4:m_uker[3],notat:m_notat}:p));setMLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const genererAI=async()=>{if(!m_tema.trim()){setMFeil("Skriv et tema først");return;}setMAiLoading(true);setMFeil("");const fagNavn=m_fag.map(f=>FAGOMRADER.find(x=>x.id===f)?.navn||f).join(", ")||"alle fagområder";const prompt=`Lag en månedsplan for norsk barnehage for ${MAANEDER[m_maaned-1]} ${m_aar} med tema "${m_tema}" (fagområder: ${fagNavn}).\nBruk NØYAKTIG denne strukturen:\n\n## Uke 1\n### Tema\n[undertema]\n### Aktiviteter\n• [aktivitet]\n• [aktivitet]\n### Mål\n• [mål]\n\n## Uke 2\n[samme]\n\n## Uke 3\n[samme]\n\n## Uke 4\n[samme]\n\nVær konkret og praktisk. Knyttet til Rammeplan 2017.`;
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),90000);
    try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:2500}),signal:ctrl.signal});if(!r.ok)throw new Error("HTTP "+r.status);const d=await r.json();const tekst=d?.text?.trim()||"";if(tekst.length>20){
      const norm=(tekst.startsWith("##")?"\n":"")+tekst;
      const deler=norm.split(/\n##\s+/).slice(1);
      const nyeUker=["","","",""].map((_,i)=>{if(!deler[i])return"";const nl=deler[i].indexOf("\n");return nl>=0?deler[i].slice(nl+1).trim():deler[i].trim();});
      if(nyeUker.some(u=>u.length>0)){setMUker(nyeUker);visLokal("✅ AI-innhold generert i ukefeltene");}
      else{setMFeil("AI returnerte innhold uten gjenkjennbar struktur – prøv igjen.");}
    }else{setMFeil("AI ga for kort svar – prøv igjen.");}}catch(e){console.error("[AI Månedsplan]",e);setMFeil(e.name==="AbortError"?"⏱ AI brukte for lang tid – prøv igjen.":"❌ AI ikke tilgjengelig – prøv igjen.");}finally{clearTimeout(tid);setMAiLoading(false);};};
    const toggleFag=(f)=>setMFag(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
    const inputStyle={width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"};
    const taStyle={...inputStyle,resize:"vertical",minHeight:90};
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}>Laster...</div>;
    if(visning==="les"&&valgt)return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{background:C.w,borderRadius:16,padding:"18px 16px",boxShadow:"0 2px 14px rgba(44,91,142,0.10)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>{valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[valgt.maaned-1]} {valgt.aar} {valgt.tema&&`• Tema: ${valgt.tema}`}</div>
              {valgt.fagomrader?.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>{valgt.fagomrader.map(f=>{const fg=FAGOMRADER.find(x=>x.id===f);return fg?<span data-fag={fg.id} key={f} style={{background:fg.lys,color:fg.farge,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{fg.ikon} {fg.navn.split(",")[0]}</span>:null;})}</div>}
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel||`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}${valgt.tema?" • Tema: "+valgt.tema:""}`,seksjoner:[...["uke1","uke2","uke3","uke4"].map((u,i)=>({label:`Uke ${i+1}`,tekst:valgt[u],farge:"#2c5b8e",bg:"#f5f9fd"})),{label:"Notat",tekst:valgt.notat,farge:"#795548",bg:"#fff9c4"}]})} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🖨️ Skriv ut</button>
              <button onClick={()=>redigerPlan(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Rediger</button>
              {bekreftSletting
                ? <><button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{background:"#c62828",color:"#fff",border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:12,fontWeight:700}}>Slett</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{background:"#e8eff8",color:C.t,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>Avbryt</button></>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#ffebee",color:"#c62828",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🗑</button>}
            </div>
          </div>
          {["uke1","uke2","uke3","uke4"].map((u,i)=>valgt[u]&&(
            <div key={u} style={{background:"#f5f9fd",borderRadius:10,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid #2c5b8e"}}>
              <div style={{fontWeight:800,color:"#2c5b8e",fontSize:12,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>📅 Uke {i+1}</div>
              <RenderTekst tekst={valgt[u]}/>
            </div>
          ))}
          {valgt.notat&&<div style={{background:"#fff9c4",borderRadius:10,padding:"11px 13px",marginTop:6}}><div style={{fontWeight:800,color:"#795548",fontSize:11,marginBottom:4}}>📝 NOTAT</div><div style={{fontSize:13,color:C.t,lineHeight:1.6}}>{valgt.notat}</div></div>}
        </div>
      </div>
    );
    if(visning==="ny"||visning==="rediger")return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>{visning==="ny"?"📅 Ny månedsplan":"✏️ Rediger månedsplan"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label><input type="number" value={m_aar} onChange={e=>setMAar(parseInt(e.target.value)||new Date().getFullYear())} style={inputStyle}/></div>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
            <select value={m_maaned} onChange={e=>setMMaaned(parseInt(e.target.value))} style={inputStyle}>{MAANEDER.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}</select>
          </div>
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL (valgfri)</label><input value={m_tittel} onChange={e=>setMTittel(e.target.value)} placeholder={`${MAANEDER[m_maaned-1]} ${m_aar}`} style={inputStyle}/></div>
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr}}>TEMA *</label>
            {m_tema.trim() && m_tema.trim() !== planTema && (
              <button type="button" onClick={()=>setPlanTema(m_tema.trim())} style={{background:"none",border:"none",color:"#1565c0",fontSize:10,cursor:"pointer",fontWeight:700,padding:0,fontFamily:"'Nunito',sans-serif"}}>🔗 Sett som felles tema</button>
            )}
          </div>
          <input value={m_tema} onChange={e=>setMTema(e.target.value)} placeholder={planTema||"Eks: Vennskap, Natur og årstider..."} style={inputStyle}/>
          {planTema && !m_tema.trim() && (
            <div onClick={()=>setMTema(planTema)} style={{fontSize:10,color:"#1565c0",marginTop:3,cursor:"pointer",fontWeight:600}}>← Bruk felles tema: «{planTema}»</div>
          )}
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:6}}>FAGOMRÅDER</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{FAGOMRADER.map(f=>(
            <button key={f.id} onClick={()=>toggleFag(f.id)} style={{background:m_fag.includes(f.id)?f.lys:"#f5f7fa",color:m_fag.includes(f.id)?f.farge:C.gr,border:`2px solid ${m_fag.includes(f.id)?f.farge:"#e0e7ef"}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>{f.ikon} {f.navn.split(",")[0]}</button>
          ))}</div>
        </div>
        <div style={{marginBottom:12,background:"#f0f6ff",borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:"#2c5b8e"}}>🤖 Generer innhold med AI</div>
            <button onClick={genererAI} disabled={m_aiLoading||!m_tema.trim()} style={{background:"#2c5b8e",color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:m_tema.trim()?1:0.5}}>{m_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
          </div>
          <div style={{fontSize:11,color:C.gr}}>Fyll ut tema og trykk Generer for å lage ukesinnhold automatisk</div>
        </div>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{marginBottom:10}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>UKE {i+1}</label>
            <textarea value={m_uker[i]} onChange={e=>setMUker(p=>{const ny=[...p];ny[i]=e.target.value;return ny;})} placeholder={`Aktiviteter og mål for uke ${i+1}...`} style={taStyle}/>
          </div>
        ))}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>NOTAT</label><textarea value={m_notat} onChange={e=>setMNotat(e.target.value)} placeholder="Praktisk info, merknader..." style={{...taStyle,minHeight:60}}/></div>
        {m_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>{m_feil}</div>}
        <button onClick={visning==="ny"?lagreNy:lagreEndring} disabled={m_loading} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"11px",width:"100%",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{m_loading?"⏳ Lagrer...":"💾 Lagre månedsplan"}</button>
      </div>
    );
    return(
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 10px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>📅 Månedsplaner</div>
          <button onClick={nyPlan} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",fontWeight:800,fontSize:12}}>+ Ny plan</button>
        </div>
        {lokalToast&&<div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
        {planer.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:C.gr,fontSize:13}}><div style={{fontSize:36,marginBottom:10}}>📅</div>Ingen månedsplaner ennå.<br/>Lag din første plan!</div>
        :<div>{planer.map(p=>(
          <div key={p.id} className="hover" onClick={()=>{setValgt(p);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 14px",marginBottom:8,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",cursor:"pointer",borderLeft:"3px solid #2c5b8e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[p.maaned-1]} {p.aar}{p.tema&&` • ${p.tema}`}</div>
              {p.fagomrader?.length>0&&<div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{p.fagomrader.slice(0,3).map(f=>{const fg=FAGOMRADER.find(x=>x.id===f);return fg?<span data-fag={fg.id} key={f} style={{background:fg.lys,color:fg.farge,borderRadius:6,padding:"1px 6px",fontSize:10,fontWeight:700}}>{fg.ikon}</span>:null;})}</div>}
            </div>
            <span style={{color:C.gr,fontSize:18}}>›</span>
          </div>
        ))}</div>}
      </div>
    );
  };

  // ─── MaanedsbrevSide ───
  const MaanedsbrevSide = () => {
    const [brev, setBrev] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste");
    const [valgt, setValgt] = useState(null);
    const [b_tittel, setBTittel] = useState("");
    const [b_aar, setBAar] = useState(new Date().getFullYear());
    const [b_maaned, setBMaaned] = useState(new Date().getMonth()+1);
    const [b_gjort, setBGjort] = useState("");
    const [b_kommende, setBKommende] = useState("");
    const [b_praktisk, setBPraktisk] = useState("");
    const [b_hilsen, setBHilsen] = useState("");
    const [b_loading, setBLoading] = useState(false);
    const [b_feil, setBFeil] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [b_aiLoading, setBAiLoading] = useState(false);
    const [bekreftSletting, setBekreftSletting] = useState(false);
    useEffect(()=>{
      let avbrutt=false;
      (async()=>{ if(!aktivBruker?.id){setLastet(true);return;} const liste=await hentMaanedsbrev(aktivBruker.id); if(!avbrutt){setBrev(liste);setLastet(true);} })();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);
    const lagre=async(liste)=>{const ok=await lagreMaanedsbrev(aktivBruker.id,liste);if(!ok){setBFeil("Kunne ikke lagre");return false;}setBrev(liste);setGlobalMaanedsbrev(liste);return true;};
    const nullstill=()=>{const n=new Date();setBTittel("");setBAar(n.getFullYear());setBMaaned(n.getMonth()+1);setBGjort("");setBKommende("");setBPraktisk("");setBHilsen("");setBFeil("");};
    const nyBrev=()=>{nullstill();setValgt(null);setVisning("ny");};
    const redigerBrev=(b)=>{setValgt(b);setBTittel(b.tittel||"");setBAar(b.aar||new Date().getFullYear());setBMaaned(b.maaned||1);setBGjort(b.gjort||"");setBKommende(b.kommende||"");setBPraktisk(b.praktisk||"");setBHilsen(b.hilsen||"");setBFeil("");setVisning("rediger");};
    const slettBrev=async(id)=>{const ok=await lagre(brev.filter(b=>b.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};
    const autoTittel=()=>b_tittel.trim()||`Månedsbrev ${MAANEDER[b_maaned-1]} ${b_aar}`;
    const lagreNy=async()=>{setBFeil("");if(!b_gjort.trim()&&!b_kommende.trim()){setBFeil("Fyll inn minst ett felt");return;}setBLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:autoTittel(),aar:b_aar,maaned:b_maaned,gjort:b_gjort,kommende:b_kommende,praktisk:b_praktisk,hilsen:b_hilsen,opprettet:new Date().toISOString()},...brev]);setBLoading(false);if(ok){visLokal("✅ Månedsbrev lagret");setVisning("liste");}};
    const lagreEndring=async()=>{setBFeil("");if(!valgt)return;setBLoading(true);const ok=await lagre(brev.map(b=>b.id===valgt.id?{...b,tittel:autoTittel(),aar:b_aar,maaned:b_maaned,gjort:b_gjort,kommende:b_kommende,praktisk:b_praktisk,hilsen:b_hilsen}:b));setBLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const genererAI=async()=>{setBAiLoading(true);const temaStr=planTema?` Månedstema: «${planTema}».`:"";const prompt=`Skriv et månedsbrev til foreldre fra norsk barnehage for ${MAANEDER[b_maaned-1]} ${b_aar}.${temaStr}\nBruk NØYAKTIG denne strukturen:\n\n## Hva vi har jobbet med\n• [punkt]\n• [punkt]\n• [punkt]\n\n## Kommende aktiviteter\n• [aktivitet/dato]\n• [aktivitet/dato]\n\n## Praktisk informasjon\n• [praktisk info]\n• [praktisk info]\n\nSkriv vennlig og engasjerende. Referer til Rammeplan 2017 og barnehagens pedagogiske arbeid.`;
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),90000);
    try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:1500}),signal:ctrl.signal});if(!r.ok)throw new Error("HTTP "+r.status);const d=await r.json();const tekst=d?.text?.trim()||"";if(tekst.length>20){
      const norm=(tekst.startsWith("##")?"\n":"")+tekst;
      const deler=norm.split(/\n##\s+/).slice(1);
      let sattNoe=false;
      deler.forEach(del=>{const lnr=del.indexOf("\n");const overskrift=lnr>=0?del.slice(0,lnr).toLowerCase().trim():del.toLowerCase().trim();const innhold=lnr>=0?del.slice(lnr+1).trim():"";if(!innhold)return;if(overskrift.includes("jobbet")||overskrift.includes("gjort")){setBGjort(innhold);sattNoe=true;}else if(overskrift.includes("kommende")||overskrift.includes("aktivitet")){setBKommende(innhold);sattNoe=true;}else if(overskrift.includes("praktisk")){setBPraktisk(innhold);sattNoe=true;}});
      if(!sattNoe)setBGjort(tekst);
      visLokal("✅ AI-innhold generert");
    }}catch(e){console.error("[AI Månedsbrev]",e);visLokal(e.name==="AbortError"?"⏱ AI-tidsavbrudd":"ℹ️ AI ikke tilgjengelig");}finally{clearTimeout(tid);setBAiLoading(false);};};
    const kopierBrev=(b)=>{const tekst=`${b.tittel}\n\n${b.gjort?"Vi har jobbet med:\n"+b.gjort+"\n\n":""}${b.kommende?"Kommende:\n"+b.kommende+"\n\n":""}${b.praktisk?"Praktisk info:\n"+b.praktisk+"\n\n":""}${b.hilsen?"Hilsen,\n"+b.hilsen:""}`.trim();navigator.clipboard?.writeText(tekst).then(()=>visLokal("✅ Kopiert")).catch(()=>visLokal("ℹ️ Kopiering ikke støttet"));};
    const inputStyle={width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"};
    const taStyle={...inputStyle,resize:"vertical",minHeight:90};
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}>Laster...</div>;
    if(visning==="les"&&valgt)return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{background:C.w,borderRadius:16,padding:"20px 18px",boxShadow:"0 2px 14px rgba(44,91,142,0.10)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>{valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[valgt.maaned-1]} {valgt.aar}</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel||`Månedsbrev ${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,seksjoner:[{label:"📚 Hva vi har jobbet med",tekst:valgt.gjort,farge:"#1565c0",bg:"#e3f2fd"},{label:"📅 Kommende aktiviteter",tekst:valgt.kommende,farge:"#2e7d32",bg:"#e8f5e9"},{label:"ℹ️ Praktisk informasjon",tekst:valgt.praktisk,farge:"#795548",bg:"#fff9c4"},{label:"Hilsen",tekst:valgt.hilsen,farge:"#5d7390",bg:"#f5f9fd"}]})} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🖨️ Skriv ut</button>
              <button onClick={()=>kopierBrev(valgt)} style={{background:"#e3f2fd",color:"#1565c0",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📋 Kopier</button>
              <button onClick={()=>redigerBrev(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",cursor:"pointer",fontSize:12,fontWeight:700}}>✏️ Rediger</button>
              {bekreftSletting
                ? <><button onClick={()=>{setBekreftSletting(false);slettBrev(valgt.id);}} style={{background:"#c62828",color:"#fff",border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:12,fontWeight:700}}>Slett</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{background:"#e8eff8",color:C.t,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>Avbryt</button></>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#ffebee",color:"#c62828",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>🗑</button>}
            </div>
          </div>
          {[{felt:valgt.gjort,label:"📚 Hva vi har jobbet med",bg:"#e3f2fd",col:"#1565c0"},{felt:valgt.kommende,label:"📅 Kommende aktiviteter",bg:"#e8f5e9",col:"#2e7d32"},{felt:valgt.praktisk,label:"ℹ️ Praktisk informasjon",bg:"#fff9c4",col:"#795548"}].filter(s=>s.felt).map(({felt,label,bg,col})=>(
            <div key={label} style={{background:bg,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontWeight:800,color:col,fontSize:12,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
              <RenderTekst tekst={felt}/>
            </div>
          ))}
          {valgt.hilsen&&<div style={{textAlign:"right",marginTop:16,fontStyle:"italic",color:C.gr,fontSize:13}}>Hilsen,<br/><strong style={{color:C.t}}>{valgt.hilsen}</strong></div>}
        </div>
      </div>
    );
    if(visning==="ny"||visning==="rediger")return(
      <div className="fade">
        <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.t,marginBottom:14}}>{visning==="ny"?"📨 Nytt månedsbrev":"✏️ Rediger månedsbrev"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label><input type="number" value={b_aar} onChange={e=>setBAar(parseInt(e.target.value)||new Date().getFullYear())} style={inputStyle}/></div>
          <div><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
            <select value={b_maaned} onChange={e=>setBMaaned(parseInt(e.target.value))} style={inputStyle}>{MAANEDER.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}</select>
          </div>
        </div>
        <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL (valgfri)</label><input value={b_tittel} onChange={e=>setBTittel(e.target.value)} placeholder={`Månedsbrev ${MAANEDER[b_maaned-1]} ${b_aar}`} style={inputStyle}/></div>
        {planTema && (
          <div style={{background:"#e3f2fd",borderRadius:10,padding:"10px 13px",marginBottom:10,borderLeft:"4px solid #1565c0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#1565c0",marginBottom:2}}>🎯 FELLES TEMA AKTIVT</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1a2c45"}}>«{planTema}»</div>
              <div style={{fontSize:11,color:"#5d7390",marginTop:1}}>Brukes automatisk i AI-generering av brevet</div>
            </div>
            <button onClick={()=>setPlanTema("")} style={{background:"transparent",border:"1px solid #90caf9",color:"#1565c0",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>✕ Fjern</button>
          </div>
        )}
        <div style={{marginBottom:12,background:"#f0f6ff",borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:"#2c5b8e"}}>🤖 Generer brev med AI</div>
            <button onClick={genererAI} disabled={b_aiLoading} style={{background:"#2c5b8e",color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700}}>{b_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
          </div>
          <div style={{fontSize:11,color:C.gr}}>Trykk Generer for å lage brevinnhold for {MAANEDER[b_maaned-1]}{planTema?` med tema «${planTema}»`:""}</div>
        </div>
        {[{label:"📚 HVA VI HAR JOBBET MED",val:b_gjort,setter:setBGjort,ph:"Beskriv hva dere har arbeidet med denne måneden..."},{label:"📅 KOMMENDE AKTIVITETER",val:b_kommende,setter:setBKommende,ph:"Turer, arrangementer, tema-dager..."},{label:"ℹ️ PRAKTISK INFORMASJON",val:b_praktisk,setter:setBPraktisk,ph:"Klær, frister, beskjeder..."}].map(({label,val,setter,ph})=>(
          <div key={label} style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>{label}</label><textarea value={val} onChange={e=>setter(e.target.value)} placeholder={ph} style={taStyle}/></div>
        ))}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>HILSEN</label><input value={b_hilsen} onChange={e=>setBHilsen(e.target.value)} placeholder="Eks: Personalet på Revegruppen" style={inputStyle}/></div>
        {b_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13}}>{b_feil}</div>}
        <button onClick={visning==="ny"?lagreNy:lagreEndring} disabled={b_loading} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"11px",width:"100%",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{b_loading?"⏳ Lagrer...":"💾 Lagre månedsbrev"}</button>
      </div>
    );
    return(
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 10px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>📨 Månedsbrev</div>
          <button onClick={nyBrev} style={{background:C.g,color:"#fff",border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",fontWeight:800,fontSize:12}}>+ Nytt brev</button>
        </div>
        {lokalToast&&<div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
        {brev.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:C.gr,fontSize:13}}><div style={{fontSize:36,marginBottom:10}}>📨</div>Ingen månedsbrev ennå.<br/>Lag ditt første brev!</div>
        :<div>{brev.map(b=>(
          <div key={b.id} className="hover" onClick={()=>{setValgt(b);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 14px",marginBottom:8,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",cursor:"pointer",borderLeft:"3px solid #2d6a4f",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,color:C.t,fontSize:14}}>{b.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{MAANEDER[b.maaned-1]} {b.aar}</div>
              {b.gjort&&<div style={{fontSize:11,color:C.gr,marginTop:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:220}}>{b.gjort.split("\n")[0]}</div>}
            </div>
            <span style={{color:C.gr,fontSize:18}}>›</span>
          </div>
        ))}</div>}
      </div>
    );
  };

  // ─── PlanleggingSide – landingsside for planleggingsverktøy ───
  const PlanleggingSide = () => (
    <div className="fade">
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:10}}>📋 Planlegging</div>
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[
          {id:"ukeplan",  ikon:"📅",tittel:"Ukeplan",    farge:"#1565c0",border:"#90caf9",desc:"Planlegg mandag–fredag med tema og aktiviteter"},
          {id:"maanedsplan",ikon:"🗓️",tittel:"Månedsplan",farge:"#6a1b9a",border:"#ce93d8",desc:"Oversikt over 4 uker med mål og fagområder"},
          {id:"maanedsbrev",ikon:"📨",tittel:"Månedsbrev",farge:"#2d6a4f",border:"#81c995",desc:"Skriv månedsbrev til foreldre med AI-hjelp"},
          {id:"arsplan",  ikon:"📆",tittel:"Årsplan",    farge:"#c62828",border:"#ef9a9a",desc:"Årshjul med tema per måned og pedagogisk grunnsyn"},
        ].map(({id,ikon,tittel,farge,border,desc})=>(
          <div key={id} className="hover" onClick={()=>navigerTil(id)}
            style={{background:C.w,borderRadius:18,padding:"22px 16px",cursor:"pointer",boxShadow:`0 3px 16px ${farge}22`,border:`2px solid ${border}`,textAlign:"center"}}>
            <div style={{fontSize:38,marginBottom:9}}>{ikon}</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:farge,marginBottom:5}}>{tittel}</div>
            <div style={{fontSize:11,color:C.gr,lineHeight:1.5}}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── UkeplanSide – Mandag til fredag med formiddag/ettermiddag/notat ───
  const UkeplanSide = ()=>{
    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

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
      setGlobalUkeplaner(oppdatertListe);
      return true;
    };

    const nyPlan = () => {
      setValgt(null);
      setUTittel(""); setUUke(""); setUTema(planTema);
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
              visLokal("ℹ️ Utskrift er ikke tilgjengelig her – laster ned i stedet");
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
        visLokal("✅ Lastet ned");
      } catch (e) {
        console.error("[Ukeplan nedlasting]", e);
        visLokal("❌ Nedlasting feilet");
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
        visLokal("✅ Kopiert");
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = full; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          visLokal("✅ Kopiert");
        } catch { visLokal("❌ Kopiering feilet"); }
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
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <label style={{...labelStil,marginBottom:0}}>Tema</label>
                  {u_tema.trim() && u_tema.trim() !== planTema && (
                    <button type="button" onClick={()=>setPlanTema(u_tema.trim())} style={{background:"none",border:"none",color:"#1565c0",fontSize:10,cursor:"pointer",fontWeight:700,padding:0,fontFamily:"'Nunito',sans-serif"}}>🔗 Sett som felles</button>
                  )}
                </div>
                <input type="text" value={u_tema} onChange={e=>setUTema(e.target.value)} style={iS} placeholder={planTema||"F.eks. 17. mai og mangfold"}/>
                {planTema && !u_tema.trim() && (
                  <div onClick={()=>setUTema(planTema)} style={{fontSize:10,color:"#1565c0",marginTop:3,cursor:"pointer",fontWeight:600}}>← Bruk felles tema: «{planTema}»</div>
                )}
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

          {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
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

          {bekreftSletting
            ? <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft sletting</button>
                <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
              </div>
            : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",width:"100%",marginTop:8}}>🗑 Slett ukeplan</button>
          }
          <div style={{fontSize:10,color:C.gr,textAlign:"center",marginTop:9}}>Opprettet: {new Date(valgt.opprettet).toLocaleDateString("no-NO")}{valgt.oppdatert!==valgt.opprettet && " • Sist endret: "+new Date(valgt.oppdatert).toLocaleDateString("no-NO")}</div>
        </div>
      );
    }

    // VISNING: Liste (default)
    return (
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
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

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Ukeplaner lagres automatisk i skyen og er tilgjengelige på alle enheter når du er innlogget. Bruk "💾 Last ned"-knappen for lokal backup.
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

    // Lokal toast – unngår å trigge parent re-render som resetter state
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(() => setLokalToast(""), 3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

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

    const skrivUtArsplan = (p) => {
      const sek = SEKSJONER.filter(s=>p.seksjoner?.[s.id]?.trim()).map(s=>({label:`${s.ikon} ${s.navn}`,tekst:p.seksjoner[s.id],farge:"#2c5b8e",bg:"#f5f9fd"}));
      const hjulMnd = MANEDER.filter(m=>p.arshjul?.[m.id]?.tema||p.arshjul?.[m.id]?.aktiviteter);
      if(hjulMnd.length>0){
        const hjulTekst=hjulMnd.map(m=>{const d=p.arshjul[m.id];const l=[];if(d.tema)l.push("Tema: "+d.tema);if(d.aktiviteter)l.push(d.aktiviteter);if(d.notat)l.push("("+d.notat+")");return m.ikon+" "+m.navn+"\n"+l.join("\n");}).join("\n\n");
        sek.push({label:"📅 Årshjul",tekst:hjulTekst,farge:"#52b788",bg:"#e8f5e9"});
      }
      skrivUtGenerell({tittel:p.tittel||"Årsplan",meta:[p.barnehage,p.avdeling,p.alder,p.aar].filter(Boolean).join(" • "),seksjoner:sek});
    };

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
      if (ok) { visLokal("✅ Årsplan lagret"); setVisning("liste"); }
    };

    const lagreEndring = async () => {
      if (!ap?.tittel?.trim()) { setPlanFeil("Skriv en tittel for årsplanen"); return; }
      setLagrer(true);
      const oppdatert = planer.map(p => p.id === ap.id ? { ...ap, oppdatert: new Date().toISOString() } : p);
      const ok = await lagreListe(oppdatert);
      setLagrer(false);
      if (ok) { visLokal("✅ Endringer lagret"); setVisning("liste"); }
    };

    const slettPlan = async (id) => {
      const ny = planer.filter(p => p.id !== id);
      const ok = await lagreListe(ny);
      if (ok) { visLokal("🗑 Slettet"); setVisning("liste"); setValgt(null); }
    };

    // ── AI-hjelper (gjenbruker samme mønster som AiSideComp) ──
    const kallAI = async (prompt, onResultat, maxTokens = 1500) => {
      const AI_ENDPOINT = (typeof window !== "undefined" && window.__BH_AI_ENDPOINT) || "/api/ai";
      const BRUK_BACKEND = AI_ENDPOINT !== "https://api.anthropic.com/v1/messages";
      const body = BRUK_BACKEND
        ? { prompt, max_tokens: maxTokens }
        : { model:"claude-sonnet-4-6", max_tokens: maxTokens, messages:[{ role:"user", content:prompt }] };
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 90000);
      try {
        const r = await fetch(AI_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), signal:ctrl.signal });
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
      const ctx = `Barnehage: "${plan?.barnehage||"ikke oppgitt"}". Avdeling: "${plan?.avdeling||"ikke oppgitt"}". Alder: "${plan?.alder||"ikke oppgitt"}". Barnehageår: ${plan?.aar||"2025/2026"}.${planTema?` Overordnet satsningsområde/tema for barnehagen: «${planTema}». La dette temaet prege innholdet.`:""}`;
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
        if (tekst) { setAiTekst(tekst); visLokal("✨ AI-forslag klart"); }
        else { setAiAktiv(null); visLokal("ℹ️ AI utilgjengelig – skriv selv"); }
      });
    };

    const utforArshjulAI = async (maaned) => {
      const sesId = "arshjul_" + maaned;
      setAiAktiv({ seksjonId: sesId, handling:"maaned" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".${planTema?` Satsningsområde/tema: «${planTema}».`:""}`;
      const sesong = { august:"sommer/høst", september:"tidlig høst", oktober:"midthøst", november:"senhøst", desember:"vinter/jul", januar:"vinter", februar:"vinter/karneval", mars:"vinter/vår", april:"vår/påske", mai:"vår/17. mai", juni:"sommer" };
      const m = MANEDER.find(x => x.id === maaned);
      const prompt = `Du er en erfaren norsk barnehagelærer. Svar kun med JSON – ingen annen tekst, ingen markdown.\nLag et pedagogisk forslag for ${m?.navn} (årstid: ${sesong[maaned]||maaned}) for en norsk barnehage.\nKontekst: ${ctx}\nFormat: {"tema":"...","aktiviteter":"...","notat":"..."}\n- tema: ett inspirerende månedstema (maks 6 ord)\n- aktiviteter: 3–4 konkrete aktiviteter koblet til Rammeplanen (2–3 linjer)\n- notat: 1–2 pedagogiske merknader til personalet`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const jsonMatch = tekst.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Ingen JSON i svar");
            const d = JSON.parse(jsonMatch[0]);
            if (d.tema || d.aktiviteter) {
              oppdaterArshjul(maaned, "tema", d.tema||"");
              oppdaterArshjul(maaned, "aktiviteter", d.aktiviteter||"");
              oppdaterArshjul(maaned, "notat", d.notat||"");
              visLokal("✨ Forslag lagt inn for " + m?.navn);
            } else { visLokal("ℹ️ AI ga uventet format"); }
          } catch (e) { console.error("[AI Årshjul]", e); visLokal("ℹ️ AI utilgjengelig"); }
        } else { visLokal("ℹ️ AI utilgjengelig"); }
      });
    };

    const utforKomplettArshjul = async () => {
      setAiAktiv({ seksjonId:"arshjul_alle", handling:"alle" });
      setAiLoading(true);
      const ctx = `Barnehage: "${ap?.barnehage||"ikke oppgitt"}". Avdeling: "${ap?.avdeling||"ikke oppgitt"}". Alder: "${ap?.alder||"ikke oppgitt"}".${planTema?` Satsningsområde/tema: «${planTema}». La dette gjennomsyre årshjulet.`:""}`;
      const prompt = `Du er en erfaren norsk barnehagelærer. Svar kun med JSON – ingen annen tekst.\nLag et komplett årshjul for barnehageåret august–juni. Kontekst: ${ctx}\nKrav: tema maks 6 ord. aktiviteter: 2 aktiviteter på EN LINJE atskilt med " | ", med fagområde i parentes, f.eks. "Skogstur og naturobservasjon (Natur og miljø) | Samlingsstund om årstider (Kommunikasjon)". notat: 1 setning.\nFormat (alle 11 måneder):\n{"august":{"tema":"...","aktiviteter":"...","notat":"..."},"september":{"tema":"...","aktiviteter":"...","notat":"..."},"oktober":{"tema":"...","aktiviteter":"...","notat":"..."},"november":{"tema":"...","aktiviteter":"...","notat":"..."},"desember":{"tema":"...","aktiviteter":"...","notat":"..."},"januar":{"tema":"...","aktiviteter":"...","notat":"..."},"februar":{"tema":"...","aktiviteter":"...","notat":"..."},"mars":{"tema":"...","aktiviteter":"...","notat":"..."},"april":{"tema":"...","aktiviteter":"...","notat":"..."},"mai":{"tema":"...","aktiviteter":"...","notat":"..."},"juni":{"tema":"...","aktiviteter":"...","notat":"..."}}`;
      await kallAI(prompt, (tekst) => {
        setAiLoading(false);
        setAiAktiv(null);
        if (tekst) {
          try {
            const jsonMatch = tekst.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Ingen JSON i svar");
            const d = JSON.parse(jsonMatch[0]);
            setAp(prev => {
              const nyArshjul = { ...prev.arshjul };
              MANEDER.forEach(m => {
                if (d[m.id]) nyArshjul[m.id] = { tema:d[m.id].tema||"", aktiviteter:d[m.id].aktiviteter||"", notat:d[m.id].notat||"" };
              });
              return { ...prev, arshjul: nyArshjul };
            });
            visLokal("✨ Komplett årshjul generert!");
          } catch (e) { console.error("[AI Komplett årshjul]", e); visLokal("ℹ️ AI utilgjengelig"); }
        } else { visLokal("ℹ️ AI utilgjengelig"); }
      }, 4096);
    };

    const aksepterForslag = (seksjonId) => { oppdaterSeksjon(seksjonId, aiTekst); setAiTekst(""); setAiAktiv(null); visLokal("✅ Forslag lagt inn"); };
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
            <div ref={el => el && el.scrollIntoView({ behavior:"smooth", block:"nearest" })} className="fade" style={{background:"#f0f7ff",border:"2px solid #2c5b8e",borderRadius:10,padding:12,marginTop:10}}>
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
          {lokalToast && <div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}
          <button onClick={() => setVisning("liste")} style={{background:"transparent",border:"none",color:"#2c5b8e",fontSize:13,cursor:"pointer",fontWeight:700,padding:0,marginBottom:14}}>← Tilbake til oversikt</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>{erRediger ? "✏️ Rediger årsplan" : "📆 Ny årsplan"}</div>
          <p style={{color:C.gr,fontSize:12,marginBottom:14,lineHeight:1.5}}>Fyll ut seksjonene og bruk AI-knappene for hjelp. Du bestemmer alltid innholdet.</p>

          {planFeil && <div className="fade" style={{background:"#fdecea",color:"#c62828",padding:"10px 13px",borderRadius:9,fontSize:12,marginBottom:12,fontWeight:700,borderLeft:"4px solid #c62828"}}>⚠️ {planFeil}</div>}

          {planTema && (
            <div style={{background:"#e3f2fd",borderRadius:10,padding:"10px 13px",marginBottom:12,borderLeft:"4px solid #1565c0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#1565c0",marginBottom:2}}>🎯 FELLES TEMA AKTIVT</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a2c45"}}>«{planTema}»</div>
                <div style={{fontSize:11,color:"#5d7390",marginTop:1}}>Brukes i alle AI-forslag for seksjoner og årshjul</div>
              </div>
              <button onClick={()=>setPlanTema("")} style={{background:"transparent",border:"1px solid #90caf9",color:"#1565c0",borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>✕ Fjern</button>
            </div>
          )}

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

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            <button onClick={()=>skrivUtArsplan(valgt)} style={{background:"#e3f2fd",color:"#1565c0",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
            <button onClick={() => redigerPlan(valgt)} style={{background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
            {bekreftSletting
              ? <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft</button>
                  <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:C.lg2,color:C.t,padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                </div>
              : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
            }
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
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
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

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Årsplaner lagres automatisk i skyen og er tilgjengelige på alle enheter når du er innlogget. Bruk "💾 Last ned"-knappen for lokal backup.
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
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

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
    const skannRef = useRef(null);

    const kjorOCR = async (fil) => {
      if (!fil) return;
      setSkannLoading(true);
      try {
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.onerror = rej;
          reader.readAsDataURL(fil);
        });
        // Skaler ned til maks 1400px og konverter til JPEG
        const b64 = await new Promise(res => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1400;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            res(c.toDataURL("image/jpeg", 0.88).replace(/^data:image\/jpeg;base64,/, ""));
          };
          img.src = dataUrl;
        });
        // Les tekst via Claude Vision
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 60000);
        try {
          const r = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: "Du er en OCR-assistent. Trekk ut ALL tekst fra dette bildet nøyaktig slik den fremstår. Bevar linjeskift og avsnitt. Svar kun med den ekstraherte teksten – ingen forklaring eller kommentar. Hvis det ikke finnes lesbar tekst, svar med tom streng.",
              image: { data: b64, media_type: "image/jpeg" },
              max_tokens: 2000,
            }),
            signal: ctrl.signal,
          });
          if (r.ok) {
            const d = await r.json();
            const lest = (d?.text || "").trim();
            if (lest) {
              setDFortelling(prev => prev ? prev + "\n\n" + lest : lest);
              visLokal("✅ Tekst lest fra bilde – sjekk og rediger ved behov");
            } else {
              visLokal("ℹ️ Ingen lesbar tekst funnet – prøv med bedre belysning");
            }
          } else {
            visLokal("❌ Skanning feilet – prøv igjen");
          }
        } finally {
          clearTimeout(tid);
        }
      } catch (e) {
        console.warn("[OCR]", e);
        visLokal("❌ Skanning feilet – prøv igjen");
      } finally {
        setSkannLoading(false);
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
      setGlobalDokumentasjon(oppdatertListe);
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
        visLokal("✅ Eksportert");
      } catch (e) {
        console.error("[Dokumentasjon] eksport:", e);
        visLokal("❌ Eksport feilet");
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
          visLokal("✅ Dokument skannet og lagt til i dokumentasjon");
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
          {lokalToast && <div style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"9px 14px",fontSize:13,fontWeight:700,marginBottom:12,textAlign:"center"}}>{lokalToast}</div>}

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
                {skannLoading ? "⏳ Leser tekst…" : "📷 Skann tekst"}
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
                <span style={{display:"flex",gap:5,flexWrap:"wrap"}}>{valgt.fag.map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span data-fag={f.id} key={fid} style={{background:f.lys,color:f.farge,padding:"1px 8px",borderRadius:7,fontSize:10,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}</span>
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

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:6}}>
              <button onClick={()=>skrivUtGenerell({tittel:valgt.tittel,meta:new Date(valgt.dato).toLocaleDateString("no-NO",{day:"numeric",month:"long",year:"numeric"}),seksjoner:[{label:"📖 Praksisfortelling",tekst:valgt.fortelling,farge:"#2c5b8e",bg:"#f5f9fd"},{label:"💭 Refleksjon",tekst:valgt.refleksjon,farge:"#2d6a4f",bg:"#e8f5e9"}]})} style={{background:"#e3f2fd",color:"#1565c0",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖨️ Skriv ut</button>
              <button onClick={()=>redigerDokument(valgt)} style={{background:"#2c5b8e",color:"#fff",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✏️ Rediger</button>
              {bekreftSletting
                ? <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setBekreftSletting(false);slettDokument(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft</button>
                    <button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:C.lg2,color:C.t,padding:"11px 6px",fontSize:11,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button>
                  </div>
                : <button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:13,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🗑 Slett</button>
              }
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
        {lokalToast && <div className="fade" style={{position:"sticky",top:8,zIndex:99,background:"#1a2c45",color:"#fff",padding:"9px 15px",borderRadius:10,fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{lokalToast}</div>}

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
                    {d.fag.slice(0,3).map(fid=>{const f=FAGOMRADER.find(x=>x.id===fid);return f?<span data-fag={f.id} key={fid} style={{background:f.lys,color:f.farge,padding:"1px 7px",borderRadius:6,fontSize:9,fontWeight:700}}>{f.ikon} {f.navn}</span>:null;})}
                    {d.fag.length>3 && <span style={{fontSize:10,color:C.gr}}>+{d.fag.length-3} til</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{background:C.lg2,borderRadius:10,padding:"11px 13px",fontSize:11,color:C.t,borderLeft:"3px solid var(--c-g)",marginTop:14,lineHeight:1.6}}>
          <strong>☁️ Lagring:</strong> Dokumentasjon lagres automatisk i skyen og er tilgjengelig på alle enheter når du er innlogget. Bruk "💾 Eksporter alle"-knappen for lokal backup.
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

  const sider={hjem:Hjem(),skjemaer:<MineSkjemaer/>,rammeplan:<RammeplanSide/>,tegneark:<TegnearkSide/>,ai:<AiSideComp onLagreSomSkjema={lagreAISomSkjema} initialType={aiInitialType} clearInitialType={()=>setAiInitialType(null)}/>,admin:<AdminPanel aktivBruker={aktivBruker}/>,favoritter:<FavoritterSide/>,profil:<ProfilSide/>,support:<SupportSide/>,dokumentasjon:<DokumentasjonSide/>,planlegging:<PlanleggingSide/>,maanedsplan:<MaanedsplanSide/>,maanedsbrev:<MaanedsbrevSide/>,ukeplan:<UkeplanSide/>,arsplan:<ArsplanSide/>,boker:<BokerSide aktivBruker={aktivBruker}/>,aktivitetskort:<AktivitetskortPanel aktivBruker={aktivBruker} onOppdater={()=>hentAktivitetskort(aktivBruker.id).then(setGlobalAktivitetskort).catch(console.error)}/>,samarbeid:<SamarbeidSide aktivBruker={aktivBruker}/>};

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
              <button key={item.id} className={`nb ${(side===item.id||(item.id==="planlegging"&&["ukeplan","arsplan","maanedsplan","maanedsbrev"].includes(side)))?"on":""}`} onClick={()=>navigerTil(item.id)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",marginBottom:5,background:(side===item.id||(item.id==="planlegging"&&["ukeplan","arsplan","maanedsplan","maanedsbrev"].includes(side)))?"rgba(255,255,255,0.2)":"transparent",borderRadius:8,color:"#fff",fontSize:13,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16}}>{item.i}</span>
                <span style={{fontWeight:(side===item.id||(item.id==="planlegging"&&["ukeplan","arsplan","maanedsplan","maanedsbrev"].includes(side)))?800:600}}>{item.n}</span>
                {item.badge>0&&<span style={{marginLeft:"auto",background:"#6ba0d9",borderRadius:9,padding:"1px 7px",fontSize:10}}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{padding:"0 12px 14px"}}>
            {/* Mørk modus-bryter */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",marginBottom:7,background:"rgba(255,255,255,0.08)",borderRadius:9}}>
              <span style={{color:"rgba(255,255,255,0.85)",fontSize:12,fontWeight:700}}>
                {tema==="dark" ? "🌙 Mørk modus" : "☀️ Lys modus"}
              </span>
              <button
                onClick={()=>setTema(t=>t==="dark"?"light":"dark")}
                title="Bytt tema"
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
        <main className="bh-main">
          {feedback && <div className="fade" style={{position:"fixed",top:70,right:20,zIndex:200,background:C.g,color:"#fff",borderRadius:9,padding:"10px 16px",fontWeight:700,fontSize:13,boxShadow:"0 4px 14px rgba(0,0,0,0.18)"}}>{feedback}</div>}
          {side==="sanger" ? <SangerSideComp favoritter={favoritter} toggleFav={toggleFav} aktivBruker={aktivBruker} onNyUserSang={(ny) => setGlobalUserSanger(p => [ny, ...p])}/>
           : side==="aktiviteter" ? <AktivSideComp preselectId={preselectAktiv} clearPreselect={()=>setPreselectAktiv(null)} favoritter={favoritter} toggleFav={toggleFav}/>
           : side==="skjema-ny" ? <NyttSkjemaForm onSave={s=>setSkjemaer(p=>[s,...p])} onNavigate={setSide}/>
           : (sider[side]||Hjem())
          }
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
    if (this.state.feil) return (
      <div style={{padding:32,fontFamily:"monospace",background:"#1a1a2e",color:"#ff6b6b",minHeight:"100vh"}}>
        <h2 style={{color:"#fff",marginBottom:12}}>Noe gikk galt</h2>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.feil}</pre>
        <button onClick={()=>window.location.reload()} style={{marginTop:20,padding:"10px 24px",background:"#2c5b8e",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>Last inn på nytt</button>
      </div>
    );
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
    sessionStorage.removeItem("bh_sesjon");
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
    return <GjenopprettPassordSkjerm onFerdig={() => { setVisGjenopprettPassord(false); setVisInnlogging(true); }} />;
  }

  if (!aktivBruker && !visInnlogging) {
    return <Velkomst onStart={() => setVisInnlogging(true)} sjekkSesjon={false}/>;
  }

  if (!aktivBruker) {
    return <AuthScreen onLoginSuccess={setAktivBruker}/>;
  }

  return <Barnehagehjelpen aktivBruker={aktivBruker} onLogout={handleLogout} onUserUpdate={handleUserUpdate} storageInfo={storageStatus}/>;
}

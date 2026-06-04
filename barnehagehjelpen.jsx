import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS as dndCSS } from "@dnd-kit/utilities";
import DokumentSkanner from "./DokumentSkanner.jsx";
import BokerSide from "./Boker.jsx";
import Velkomst from "./Velkomst.jsx";
import SamarbeidSide from "./Samarbeid.jsx";
import { supabase } from "./supabase.js";
import { FAGOMRADER, RE } from './data/rammeplan.js';
import { SANGER } from './data/sanger.js';
import { AKTIVITETER } from './data/aktiviteter.js';
import { TEGNEARK, TEGNEKAT, SvgPlaceholder } from './data/tegneark.jsx';

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
  .btn { cursor:pointer; border:none; border-radius:11px; font-family:'Nunito',sans-serif; font-weight:700; transition:all 0.18s ease; }
  .btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
  .btn:active { transform:translateY(0); transition-duration:0.06s; }
  .btn:focus-visible { outline: 2px solid #2c5b8e; outline-offset: 2px; }
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

function SangerSideComp({ favoritter, toggleFav, aktivBruker, onNyUserSang, preselectId, clearPreselect }) {
  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState("alle");
  const [valgt, setValgt] = useState(() => preselectId ? SANGER.find(s => s.id === preselectId) || null : null);
  const [visAiPanel, setVisAiPanel] = useState(false);
  const [userSanger, setUserSanger] = useState([]);
  const [lasterMine, setLasterMine] = useState(false);
  const favSet = new Set(favoritter?.sanger || []);

  useEffect(() => {
    if (!aktivBruker?.id) return;
    setLasterMine(true);
    hentUserSanger(aktivBruker.id)
      .then(s => {
        setUserSanger(s);
        // Prøv å åpne preselect i bruker-sanger (lastet asynkront)
        if (preselectId && !valgt) {
          const funnet = s.find(us => "user_"+us.id === preselectId);
          if (funnet) setValgt({ id:"user_"+funnet.id, tittel:funnet.tittel, tekst:funnet.tekst, kategori:funnet.kategori, alder:funnet.alder, melodi:funnet.melodi, tips:funnet.tips, rammeplan:funnet.rammeplan||[], _dbId:funnet.id, _erMin:true });
        }
      })
      .catch(() => {})
      .finally(() => setLasterMine(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivBruker?.id]);

  useEffect(() => {
    if (preselectId && clearPreselect) clearPreselect();
  }, [preselectId, clearPreselect]);

  const userSangerMapped = userSanger.map(s => ({ id:"user_"+s.id, tittel:s.tittel, tekst:s.tekst, kategori:s.kategori, alder:s.alder, melodi:s.melodi, tips:s.tips, rammeplan:s.rammeplan||[], _dbId:s.id, _erMin:true }));
  const alleData = [...userSangerMapped, ...SANGER];
  const iS = {width:"100%",border:"1.5px solid #c4d6ec",borderRadius:9,padding:"9px 13px",fontSize:13,background:"#f5f9fd",fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"};
  const data = alleData.filter(s=>{
    if (filter==="mine") return !!s._erMin && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    if (filter==="favoritter") return favSet.has(s.id) && (!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
    return (filter==="alle"||s.kategori===filter)&&(!sok||s.tittel.toLowerCase().includes(sok.toLowerCase()));
  });
  const skrivUtSang = (s) => {
    const melodiHtml = s.melodi ? ' · 🎼 ' + escapeHTML(s.melodi) : '';
    const tipsHtml = s.tips ? '<div style="margin-top:12px;padding:12px;background:#fffde7;border-radius:8px;font-size:13px;"><strong>💡 Tips:</strong> ' + mdToHtml(s.tips) + '</div>' : '';
    skrivUtVindu('<div style="max-width:620px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + escapeHTML(s.tittel) + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + escapeHTML(s.kategori) + ' · ' + escapeHTML(s.alder) + melodiHtml + '</div><pre style="font-size:16px;line-height:2.1;white-space:pre-wrap;font-family:inherit;background:#f5f9fd;padding:18px;border-radius:10px;border:1px solid #c4d6ec;">' + stripMd(s.tekst) + '</pre>' + tipsHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', escapeHTML(s.tittel));
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
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,margin:0}}>🎵 Sanger, Rim og Regler</h1>
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
function GlobalSok({ verdi, setVerdi, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, C }) {
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
                    <div key={"s"+s.id} onClick={()=>aapneSang?.(s)} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">{s.tittel}</div>
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
                  <div style={{padding:"7px 14px",fontSize:10,fontWeight:800,color:"#6a1b9a",background:"#f9f3fd",textTransform:"uppercase",letterSpacing:0.5}}>📋 Dine planer ({sokeResultat.maanedsplaner.length})</div>
                  {sokeResultat.maanedsplaner.slice(0,5).map(p=>(
                    <div key={"mp"+p.id} onClick={()=>{navigerTil(p.type==="kalender"?"maanedskalender":"maanedsplan");setVerdi("");}} style={{padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid #f0f5fb",fontSize:13,color:C.t}} className="hover">
                      <div style={{fontWeight:700}}>{p.type==="kalender"?"🗓️ ":"📋 "}{p.tittel}</div>
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
    const tidHtml = a.tid ? ' · ⏱ ' + escapeHTML(a.tid) : '';
    const gruppeHtml = a.gruppe ? ' · 👥 ' + escapeHTML(a.gruppe) : '';
    const matHtml = a.materialer ? '<div style="background:#fce4ec;border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:#c62828;margin-bottom:4px;">🧰 Materialer</div><div style="font-size:13px;">' + mdToHtml(a.materialer) + '</div></div>' : '';
    const seksjoner = [['🎯 HVA – Beskrivelse', a.hva, '#fffde7', '#795548'], ['⚙️ HVORDAN – Gjennomføring', a.hvordan, '#e8f5e9', '#2e7d32'], ['❓ HVORFOR – Pedagogisk begrunnelse', a.hvorfor, '#e3f2fd', '#1565c0']].map(([t,v,bg,tc]) => '<div style="background:' + bg + ';border-radius:8px;padding:12px 14px;margin-bottom:10px;"><div style="font-weight:bold;font-size:12px;color:' + tc + ';margin-bottom:4px;">' + t + '</div><div style="font-size:13px;line-height:1.7;">' + mdToHtml(v) + '</div></div>').join('');
    skrivUtVindu('<div style="max-width:640px;margin:0 auto;"><h1 style="font-size:22px;color:#2c5b8e;margin-bottom:6px;">' + escapeHTML(a.tittel) + '</h1><div style="font-size:12px;color:#888;margin-bottom:16px;">' + escapeHTML(a.kategori) + ' · ' + escapeHTML(a.alder) + tidHtml + gruppeHtml + '</div>' + seksjoner + matHtml + '<div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center;">Barnehagehjelpen – barnehagehjelpen.pages.dev</div></div>', escapeHTML(a.tittel));
  };
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🏃 Aktiviteter</h1>
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
  { id:"manedsplan", navn:"Månedsplan", ikon:"📋", beskrivelse:"En hel måned strukturert etter rammeplan og årstid" },
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
    const timeoutId = setTimeout(() => controller.abort(), 55000);

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
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const { data } = await supabase.from("user_profiles").select("*").eq("id", userId).single().abortSignal(ctrl.signal);
    return data || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
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
      <div style="font-size:13px;color:#1a2c45;line-height:1.75;white-space:pre-wrap">${esc(s.tekst).replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>")}</div>
    </section>`).join("");
  const html=`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${esc(tittel)} – Barnehagehjelpen</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,"Segoe UI",sans-serif;background:#f3f7fc;color:#1a2c45;padding:24px 20px;line-height:1.6}.topp{max-width:700px;margin:0 auto 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px}h1{font-size:22px;color:#2c5b8e}.meta{font-size:12px;color:#5d7390;margin-top:4px}.innhold{max-width:700px;margin:0 auto}.knapper{display:flex;gap:8px}.knapp{padding:9px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.lukk{padding:9px 14px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px}.bunn{font-size:11px;color:#8a9bb0;text-align:center;margin-top:28px}@media print{@page{margin:12mm}.knapper{display:none}body{background:white;padding:0}}</style></head>
<body><div class="topp"><div><h1>${esc(tittel)}</h1>${meta?`<div class="meta">${esc(meta)}</div>`:""}</div><div class="knapper"><button class="lukk" onclick="window.close()">← Lukk</button><button class="knapp" onclick="window.print()">🖨️ Skriv ut</button></div></div><div class="innhold">${seksHTML}</div><div class="bunn">${esc(logoTekst||"Barnehagehjelpen • Rammeplan 2017")}</div></body></html>`;
  const v=window.open("","_blank","width=820,height=720");
  if(!v){
    try {
      const blob=new Blob([html],{type:"text/html;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`${(tittel||"dokument").replace(/[^a-zA-Z0-9æøåÆØÅ \-]/g,"")}.html`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    } catch { alert("Popup ble blokkert. Tillat popup for barnehagehjelpen.pages.dev for å skrive ut."); }
    return;
  }
  v.document.write(html);v.document.close();
}

async function lastNedPlanPDF({ tittel, meta, seksjoner, logoTekst }) {
  try {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const mX = 18, pw = 174;
    let y = 20;
    const nyeside = () => { pdf.addPage(); y = 20; };
    const sjekk = (h) => { if (y + h > 278) nyeside(); };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(44, 91, 142);
    pdf.text(tittel || "Plan", mX, y); y += 7;

    if (meta) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(93, 115, 144);
      pdf.text(meta, mX, y); y += 6;
    }

    pdf.setDrawColor(216, 230, 245);
    pdf.setLineWidth(0.5);
    pdf.line(mX, y, mX + pw, y); y += 7;

    for (const sek of (seksjoner || []).filter(s => s?.tekst?.trim())) {
      sjekk(14);
      if (sek.label) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.setTextColor(44, 91, 142);
        pdf.text(sek.label.toUpperCase(), mX, y); y += 4.5;
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(26, 44, 69);
      for (const linje of pdf.splitTextToSize(stripMd(sek.tekst.trim()), pw - 2)) {
        sjekk(5.5);
        pdf.text(linje, mX + 1, y); y += 5.5;
      }
      y += 4;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(138, 155, 176);
    pdf.text(logoTekst || "Barnehagehjelpen • Rammeplan 2017", mX, 290);

    const filnavn = (tittel || "plan").replace(/[^a-zA-Z0-9æøåÆØÅ ]/g, "-").replace(/\s+/g, "-");
    pdf.save(`${filnavn}.pdf`);
  } catch (e) {
    console.error("[PDF]", e);
    alert("Kunne ikke generere PDF – prøv 'Skriv ut' i stedet.");
  }
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
  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password"))
      return { ok: false, feil: "Feil e-post eller passord. Prøv igjen." };
    if (msg.includes("email not confirmed"))
      return { ok: false, feil: "E-postadressen er ikke bekreftet. Sjekk innboksen din." };
    if (msg.includes("too many requests") || msg.includes("rate limit"))
      return { ok: false, feil: "For mange innloggingsforsøk. Vent noen minutter og prøv igjen." };
    if (msg.includes("user not found") || msg.includes("no user"))
      return { ok: false, feil: "Finner ingen konto med denne e-postadressen." };
    return { ok: false, feil: "Innlogging feilet. Prøv igjen." };
  }

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

// ── Månedskalender: egne Supabase-funksjoner (type:"kalender" i innhold-JSON) ──
async function hentKalenderplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedsplaner").select("*").eq("user_id", brukerId).order("aar",{ascending:false}).order("maaned",{ascending:false});
    return (data||[]).filter(r=>{ try{return JSON.parse(r.innhold||"{}").type==="kalender";}catch{return false;} }).map(r=>{
      let extra={};try{extra=JSON.parse(r.innhold||"{}");}catch{}
      return {id:r.id,tittel:r.tittel,aar:r.aar,maaned:r.maaned,tema:r.tema||"",events:extra.events||{},opprettet:r.created_at};
    });
  } catch { return []; }
}
async function lagreKalenderplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const {data:eks}=await supabase.from("maanedsplaner").select("id,innhold").eq("user_id",brukerId);
    const kIds=(eks||[]).filter(r=>{try{return JSON.parse(r.innhold||"{}").type==="kalender";}catch{return false;}}).map(r=>r.id);
    if(kIds.length>0) await supabase.from("maanedsplaner").delete().in("id",kIds);
    if(liste.length>0) await supabase.from("maanedsplaner").insert(liste.map(p=>({user_id:brukerId,tittel:p.tittel||"",aar:parseInt(p.aar)||new Date().getFullYear(),maaned:parseInt(p.maaned)||1,tema:p.tema||"",fagomrader:[],innhold:JSON.stringify({type:"kalender",events:p.events||{}})})));
    return true;
  } catch(e){console.error("[Kalender] Lagring feilet:",e);return false;}
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
    setFeil(""); setSuksess("");
    if (!li_epost.trim()) { setFeil("E-postadresse er påkrevd"); return; }
    if (!/\S+@\S+\.\S+/.test(li_epost)) { setFeil("Skriv en gyldig e-postadresse"); return; }
    if (!li_pw) { setFeil("Passord er påkrevd"); return; }
    setLoading(true);
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
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8, maxHeight:116, overflowY:"auto", padding:"2px 0" }}>
            {KORT_IKONER.map(i => (
              <button key={i} onClick={() => opd("icon", i)} style={{ width:34, height:34, borderRadius:8, border:form.icon===i?"2px solid #2c5b8e":"1.5px solid #c4d6ec", background:form.icon===i?"#e8eff8":"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i}</button>
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
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.t, margin:0 }}>🃏 Aktivitetskort</h1>
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

// ── Modul-nivå hjelpere og konstanter ──

function hilsen() {
  const h = new Date().getHours();
  if (h < 10) return ["God morgen","☀️","Klar for en ny dag i barnehagen?"];
  if (h < 12) return ["God formiddag","🌤️","Hva skal barna oppdage i dag?"];
  if (h < 17) return ["God ettermiddag","🌈","Midttimen er full av muligheter!"];
  return ["God kveld","🌙","Planlegger du morgendagen?"];
}

const DAGENS_TIPS = [
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

// ── Modul-nivå komponenter (stabile referanser – monteres ikke på nytt ved parent-render) ──

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

function PlanleggingSide({ planTema, setPlanTema, navigerTil, antallUkeplaner=0, antallMaanedsplaner=0, antallMaanedsbrev=0, antallArsplaner=0 }) {
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {[
          {id:"ukeplan",    ikon:"📋",tittel:"Ukeplan",    farge:"#1565c0",border:"#90caf9",desc:"Mandag–fredag med drag & drop", antall:antallUkeplaner},
          {id:"maanedsplan",ikon:"📋",tittel:"Månedsplan", farge:"#6a1b9a",border:"#ce93d8",desc:"4 uker med mål og fagområder",  antall:antallMaanedsplaner},
          {id:"maanedsbrev",ikon:"📨",tittel:"Månedsbrev", farge:"#2d6a4f",border:"#81c995",desc:"Foreldrebrev med AI-hjelp",      antall:antallMaanedsbrev},
          {id:"arsplan",    ikon:"📋",tittel:"Årsplan",    farge:"#c62828",border:"#ef9a9a",desc:"Årshjul og pedagogisk grunnsyn",  antall:antallArsplaner},
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
          {id:"ukeplan",   ikon:"📅",tittel:"Ukeplan",        farge:"#1565c0",bg:"#e3f2fd",desc:"Klassisk Man–Fre tavleplan"},
          {id:"maanedskalender",ikon:"🗓️",tittel:"Månedskalender",farge:"#0277bd",bg:"#e1f5fe",desc:"Kalendervisning med hendelser"},
          {id:"arsplan",   ikon:"📆",tittel:"Årshjul",         farge:"#c62828",bg:"#ffebee",desc:"11 måneder med tema og mål"},
          {id:"ukeplan",   ikon:"🏫",tittel:"Avdelingsplan",  farge:"#2d6a4f",bg:"#e8f5e9",desc:"Avdelingsplan som ukeplan"},
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

// ── Ytterligere modul-nivå Side-komponenter (stabile referanser) ──

function RammeplanSide({ ctx }) {
  const { rammeSeksjon, setRammeSeksjon, valgtFag, setValgtFag, setPreselectAktiv, setSide } = ctx;

    const seks=[["oversikt","📋","Oversikt"],["formal","🏛️","Formål"],["verdigrunnlag","💎","Verdigrunnlag"],["lek","🎭","Lek og læring"],["danning","💝","Omsorg og vennskap"],["medvirkning","🗣️","Medvirkning"],["fagomrader","📚","Fagområder"],["livsmestring","🌱","Livsmestring"],["pedagogisk","📋","Pedagogisk arbeid"],["samarbeid","👨‍👩‍👧","Samarbeid"],["overgang","🎒","Overgang"],["barnehageloven","⚖️","Barnehageloven"],["roller","👤","Roller"],["inkludering","♿","Inkludering"]];
    return (
      <div className="fade">
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📖 Rammeplan 2017</h1>
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
                        <div style={{fontSize:10,color:C.gr}}>{a.hva?.substring(0,55)}...</div>
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
  }

function TegnearkSide({ ctx }) {
  const { aktivBruker, vis, preselectTegneark, setPreselectTegneark, favoritter, toggleFav, setGlobalUserTegneark } = ctx;

    const [tkat, setTkat] = useState("alle");
    const [valgtT, setValgtT] = useState(() => preselectTegneark ? TEGNEARK.find(t => t.id === preselectTegneark) || null : null);
    const [lokalToast, setLokalToast] = useState("");
    const [visAiPanel, setVisAiPanel] = useState(false);
    const [userTegneark, setUserTegneark] = useState([]);
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const favSet = new Set(favoritter?.tegneark || []);

    useEffect(() => {
      if (!aktivBruker?.id) return;
      hentUserTegneark(aktivBruker.id).then(ut => {
        setUserTegneark(ut);
        if (preselectTegneark && !valgtT) {
          const funnet = ut.find(t => "user_"+t.id === preselectTegneark);
          if (funnet) setValgtT({ id:"user_"+funnet.id, tittel:funnet.tittel, ikon:funnet.ikon||"🖍️", kategori:funnet.kategori||"natur", alder:funnet.alder, rammeplan:funnet.rammeplan||[], svg:<SvgPlaceholder/>, oppgave:funnet.oppgave, samtale:funnet.samtale, mal:funnet.mal, _erMin:true, _dbId:funnet.id });
        }
      });
    }, [aktivBruker?.id]);

    useEffect(() => {
      if (preselectTegneark) setPreselectTegneark(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        await navigator.clipboard.writeText(text);
        visLokal("✅ Kopiert til utklippstavlen!");
      } catch {
        visLokal("❌ Kopiering støttes ikke i denne nettleseren");
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
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,margin:0}}>🖍️ Tegneark</h1>
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
  }

const MAANEDER = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

function MaanedsplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalMaanedsplaner } = ctx;

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
    const genererAI=async()=>{if(!m_tema.trim()){setMFeil("Skriv et tema først");return;}setMAiLoading(true);setMFeil("");const fagNavn=m_fag.filter(Boolean).map(f=>FAGOMRADER.find(x=>x.id===f)?.navn.split(",")[0]||f).join(", ")||"generelt";const prompt=`Lag en kort månedsoversikt for norsk barnehage. Tema: "${m_tema}". Fagområder: ${fagNavn}.\nSkriv KUN dette (ingen innledning, ingen forklaring):\n\n## Uke 1\n[undertema + 2-3 korte aktiviteter + 1 mål, maks 5 linjer]\n\n## Uke 2\n[samme]\n\n## Uke 3\n[samme]\n\n## Uke 4\n[samme]`;
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),32000);
    try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:900}),signal:ctrl.signal});
    if(!r.ok){let msg="Serverfeil "+r.status;try{const e=await r.json();if(e?.error)msg=e.error;}catch{}setMFeil("❌ "+msg);return;}
    const d=await r.json();const tekst=d?.text?.trim()||"";if(tekst.length>20){
      const norm=(tekst.startsWith("##")?"\n":"")+tekst;
      const deler=norm.split(/\n##\s+/).slice(1);
      const nyeUker=["","","",""].map((_,i)=>{if(!deler[i])return"";const nl=deler[i].indexOf("\n");return nl>=0?deler[i].slice(nl+1).trim():deler[i].trim();});
      if(nyeUker.some(u=>u.length>0)){setMUker(nyeUker);visLokal("✅ AI-innhold generert i ukefeltene");}
      else{setMFeil("AI returnerte innhold uten gjenkjennbar struktur – prøv igjen.");}
    }else{setMFeil("AI ga for kort svar – prøv igjen.");}}catch(e){console.error("[AI Månedsplan]",e);setMFeil(e.name==="AbortError"?"⏱ AI brukte for lang tid – prøv igjen.":e.name==="TypeError"?"❌ Nettverksfeil – sjekk internett og prøv igjen.":"❌ "+e.message);}finally{clearTimeout(tid);setMAiLoading(false);};};
    const toggleFag=(f)=>setMFag(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
    const inputStyle={width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",outline:"none"};
    const taStyle={...inputStyle,resize:"vertical",minHeight:90};
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 10px"}}/>Laster...</div>;
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
              <button onClick={()=>lastNedPlanPDF({tittel:valgt.tittel||`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}${valgt.tema?" • Tema: "+valgt.tema:""}`,seksjoner:[...["uke1","uke2","uke3","uke4"].map((u,i)=>({label:`Uke ${i+1}`,tekst:valgt[u]})),{label:"Notat",tekst:valgt.notat}]})} style={{background:"#e8f5e9",color:"#2e7d32",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📄 PDF</button>
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
        <div style={{marginBottom:12,background:C.lg2,borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Generer innhold med AI</div>
            <button onClick={genererAI} disabled={m_aiLoading||!m_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:m_tema.trim()?1:0.5}}>{m_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
          </div>
          <div style={{fontSize:11,color:C.gr}}>{m_aiLoading?"Dette kan ta 10–25 sekunder – vennligst vent...":"Fyll ut tema og trykk Generer for å lage ukesinnhold automatisk"}</div>
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
  }

function MaanedsbrevSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalMaanedsbrev } = ctx;

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
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),25000);
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
    if(!lastet)return <div style={{padding:24,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 10px"}}/>Laster...</div>;
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
              <button onClick={()=>lastNedPlanPDF({tittel:valgt.tittel||`Månedsbrev ${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,meta:`${MAANEDER[valgt.maaned-1]} ${valgt.aar}`,seksjoner:[{label:"📚 Hva vi har jobbet med",tekst:valgt.gjort},{label:"📅 Kommende aktiviteter",tekst:valgt.kommende},{label:"ℹ️ Praktisk informasjon",tekst:valgt.praktisk},{label:"Hilsen",tekst:valgt.hilsen}]})} style={{background:"#e8f5e9",color:"#2e7d32",border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>📄 PDF</button>
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
        <div style={{marginBottom:12,background:C.lg2,borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Generer brev med AI</div>
            <button onClick={genererAI} disabled={b_aiLoading} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700}}>{b_aiLoading?"⏳ Genererer...":"✨ Generer"}</button>
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
  }

// ─── Hjelpkomponent for sorterbar aktivitet i ukeplan (dnd-kit krever eget komponent på modul-nivå) ───
function SortableAktivitetItem({ a, tidCol, tidBg, dager, dag, slettFn, flyttFn }) {
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:a.id});
  return(
    <div ref={setNodeRef} style={{transform:dndCSS.Transform.toString(transform),transition,opacity:isDragging?0.5:1,display:"flex",alignItems:"center",gap:5,background:tidBg,borderRadius:6,padding:"4px 7px",marginBottom:3}}>
      <span {...attributes} {...listeners} style={{cursor:"grab",color:tidCol,fontSize:11,lineHeight:1,touchAction:"none"}}>⠿</span>
      <span style={{flex:1,fontSize:11,color:"var(--c-t)"}}>{a.tekst}</span>
      <div style={{display:"flex",gap:2,flexShrink:0}}>
        {dager.filter(x=>x!==dag).map(t2=><button key={t2} type="button" title={"Flytt til "+t2} onClick={()=>flyttFn(dag,a.id,t2)} style={{background:"none",border:"none",color:"var(--c-gr)",cursor:"pointer",fontSize:9,padding:"0 2px",lineHeight:1}}>→{t2.slice(0,3)}</button>)}
        <button type="button" onClick={()=>slettFn(dag,a.id)} style={{background:"none",border:"none",color:"#c62828",cursor:"pointer",fontSize:11,padding:0,lineHeight:1}}>✕</button>
      </div>
    </div>
  );
}

function UkeplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema, setGlobalUkeplaner } = ctx;

    const [planer, setPlaner] = useState([]);
    const [lastet, setLastet] = useState(false);
    const [visning, setVisning] = useState("liste"); // liste | ny | rediger | les
    const [valgt, setValgt] = useState(null);
    const [sok, setSok] = useState("");
    const [lokalToast, setLokalToast] = useState("");
    const visLokal = (m) => { setLokalToast(m); setTimeout(()=>setLokalToast(""),3000); };
    const [bekreftSletting, setBekreftSletting] = useState(false);

    // Skjema-state
    const tomDag = () => ({ bilde:"", farge:"", ansvarlig:"", maaltid:"", aktiviteter:[] });
    const migrerDag = (dag) => {
      if (!dag) return tomDag();
      if (Array.isArray(dag.aktiviteter)) return { bilde:dag.bilde||"", farge:dag.farge||"", ansvarlig:dag.ansvarlig||"", maaltid:dag.maaltid||"", aktiviteter:dag.aktiviteter };
      const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
      const akt=[];
      (dag.formiddag||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"formiddag",tekst:t}));
      (dag.ettermiddag||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"ettermiddag",tekst:t}));
      (dag.notat||"").split('\n').filter(Boolean).forEach(t=>akt.push({id:uid(),tid:"notat",tekst:t}));
      return { bilde:dag.bilde||"", farge:dag.farge||"", ansvarlig:dag.ansvarlig||"", maaltid:dag.maaltid||"", aktiviteter:akt };
    };
    const [u_tittel, setUTittel] = useState("");
    const [u_uke, setUUke] = useState("");
    const [u_tema, setUTema] = useState("");
    const [u_dager, setUDager] = useState({
      mandag: tomDag(), tirsdag: tomDag(), onsdag: tomDag(),
      torsdag: tomDag(), fredag: tomDag()
    });
    const [u_loading, setULoading] = useState(false);
    const [u_feil, setUFeil] = useState("");
    const [u_aiLoading, setUAiLoading] = useState(false);
    const [bildevelgerForDag, setBildevelgerForDag] = useState(null);
    const [bildeOpplaster, setBildeOpplaster] = useState(false);
    const [nyAktivitet, setNyAktivitet] = useState({});
    const dndSensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
      useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
    );
    const DAG_FARGER_DEF = { mandag:"#1565c0",tirsdag:"#0277bd",onsdag:"#6a1b9a",torsdag:"#c62828",fredag:"#2d6a4f" };
    const TID_FARGER = { formiddag:{label:"Formiddag",col:"#1565c0",bg:"#e3f2fd"}, ettermiddag:{label:"Ettermiddag",col:"#6a1b9a",bg:"#f3e5f5"}, notat:{label:"Notat",col:"#5d7390",bg:"#f5f9fd"} };
    const FARGEVALG = ["","#1565c0","#6a1b9a","#2d6a4f","#c62828","#f57c00"];

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
      const dg = p.dager || {};
      setUDager({
        mandag: migrerDag(dg.mandag), tirsdag: migrerDag(dg.tirsdag), onsdag: migrerDag(dg.onsdag),
        torsdag: migrerDag(dg.torsdag), fredag: migrerDag(dg.fredag)
      });
      setUFeil(""); setVisning("rediger");
    };

    const lesPlan = (p) => { setValgt(p); setVisning("les"); };

    const oppdaterDag = (dag, felt, verdi) => {
      setUDager(prev => ({ ...prev, [dag]: { ...prev[dag], [felt]: verdi } }));
    };

    const leggTilAktivitet = (dag, tid) => {
      const tekst = (nyAktivitet[dag+tid]||"").trim();
      if (!tekst) return;
      const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5);
      setUDager(prev=>({...prev,[dag]:{...prev[dag],aktiviteter:[...(prev[dag].aktiviteter||[]),{id,tid,tekst}]}}));
      setNyAktivitet(p=>({...p,[dag+tid]:""}));
    };
    const slettAktivitet = (dag, id) => {
      setUDager(prev=>({...prev,[dag]:{...prev[dag],aktiviteter:(prev[dag].aktiviteter||[]).filter(a=>a.id!==id)}}));
    };
    const handleDagDragEnd = (dag, event) => {
      const {active,over} = event;
      if (!over||active.id===over.id) return;
      setUDager(prev=>{
        const akt=[...(prev[dag].aktiviteter||[])];
        const oldIdx=akt.findIndex(a=>a.id===active.id);
        const newIdx=akt.findIndex(a=>a.id===over.id);
        if(oldIdx<0||newIdx<0)return prev;
        return {...prev,[dag]:{...prev[dag],aktiviteter:arrayMove(akt,oldIdx,newIdx)}};
      });
    };
    const flyttAktivitet = (fraDag, aktivitetId, tilDag) => {
      setUDager(prev=>{
        const akt=(prev[fraDag].aktiviteter||[]).find(a=>a.id===aktivitetId);
        if(!akt)return prev;
        return {...prev,
          [fraDag]:{...prev[fraDag],aktiviteter:(prev[fraDag].aktiviteter||[]).filter(a=>a.id!==aktivitetId)},
          [tilDag]:{...prev[tilDag],aktiviteter:[...(prev[tilDag].aktiviteter||[]),{...akt}]}
        };
      });
    };

    const fyllMedAI = async () => {
      if(!u_tema.trim()){setUFeil("Skriv et tema først");return;}
      setUAiLoading(true);setUFeil("");
      const prompt=`Du er pedagog i norsk barnehage. Fyll en ukeplan med tema "${u_tema}" for uke ${u_uke||"?"}.
Returner KUN gyldig JSON uten markdown:
{"mandag":{"formiddag":"9:00 Samling","ettermiddag":"12:30 Utelek"},"tirsdag":{"formiddag":"...","ettermiddag":"...","maaltid":"Varm mat"},"onsdag":{"formiddag":"...","ettermiddag":"..."},"torsdag":{"formiddag":"...","ettermiddag":"..."},"fredag":{"formiddag":"...","ettermiddag":"...","notat":"Kortdag"}}`;
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),30000);
      try{
        const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:800}),signal:ctrl.signal});
        if(!r.ok){const d=await r.json().catch(()=>({}));setUFeil("❌ "+(d.error||"Serverfeil "+r.status));return;}
        const d=await r.json();const raw=d.text||"";
        const m=raw.match(/\{[\s\S]*\}/);if(!m)throw new Error("Ingen JSON");
        const parsed=JSON.parse(m[0]);
        const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
        const str=v=>typeof v==="string"?v.trim():"";
        const dagNavn=["mandag","tirsdag","onsdag","torsdag","fredag"];
        setUDager(prev=>{const ny={...prev};dagNavn.forEach(dag=>{if(!parsed[dag])return;const p=parsed[dag];const akt=[];const fm=str(p.formiddag);const em=str(p.ettermiddag);const no=str(p.notat);if(fm)akt.push({id:uid(),tid:"formiddag",tekst:fm});if(em)akt.push({id:uid(),tid:"ettermiddag",tekst:em});if(no)akt.push({id:uid(),tid:"notat",tekst:no});ny[dag]={...ny[dag],aktiviteter:akt,maaltid:str(p.maaltid)||ny[dag].maaltid||""};});return ny;});
        visLokal("✨ AI fylte inn aktiviteter for alle dager");
      }catch(e){console.error("[AI Ukeplan]",e);setUFeil(e.name==="AbortError"?"⏱ Tidsavbrudd – prøv igjen.":"❌ AI utilgjengelig");}
      finally{clearTimeout(tid);setUAiLoading(false);}
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
      const renderDagInnhold = (raw) => {
        if (!raw) return "";
        const data = Array.isArray(raw.aktiviteter) ? raw : (() => {
          const akt=[];
          if(raw.formiddag)(raw.formiddag).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"formiddag",tekst:t}));
          if(raw.ettermiddag)(raw.ettermiddag).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"ettermiddag",tekst:t}));
          if(raw.notat)(raw.notat).split('\n').filter(Boolean).forEach(t=>akt.push({tid:"notat",tekst:t}));
          return {...raw, aktiviteter:akt};
        })();
        const TID_LABEL={formiddag:"Formiddag",ettermiddag:"Ettermiddag",notat:"Notat"};
        const TID_COL={formiddag:"#1565c0",ettermiddag:"#6a1b9a",notat:"#5d7390"};
        let html="";
        if(data.ansvarlig||data.maaltid)html+=`<div class="meta">${data.ansvarlig?`👤 ${escapeHTML(data.ansvarlig)} `:""}${data.maaltid?`🍽 ${escapeHTML(data.maaltid)}`:""}</div>`;
        ["formiddag","ettermiddag","notat"].forEach(tid=>{
          const akt=(data.aktiviteter||[]).filter(a=>a.tid===tid);
          if(!akt.length)return;
          html+=`<div class="felt"><strong style="color:${TID_COL[tid]}">${TID_LABEL[tid]}:</strong><br>${akt.map(a=>`• ${escapeHTML(a.tekst)}`).join("<br>")}</div>`;
        });
        return html;
      };
      const innholdHTML = ["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
        const data = p.dager?.[d] || {};
        return `<td>${renderDagInnhold(data)}</td>`;
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
          const raw = p.dager?.[d] || {};
          const akt=Array.isArray(raw.aktiviteter)?raw.aktiviteter:(()=>{const a=[];if(raw.formiddag)(raw.formiddag).split('\n').filter(Boolean).forEach(t=>a.push({tid:"formiddag",tekst:t}));if(raw.ettermiddag)(raw.ettermiddag).split('\n').filter(Boolean).forEach(t=>a.push({tid:"ettermiddag",tekst:t}));if(raw.notat)(raw.notat).split('\n').filter(Boolean).forEach(t=>a.push({tid:"notat",tekst:t}));return a;})();
          const meta=(raw.ansvarlig||raw.maaltid)?`<div class="felt meta">${raw.ansvarlig?`👤 ${escapeHTML(raw.ansvarlig)} `:""}${raw.maaltid?`🍽 ${escapeHTML(raw.maaltid)}`:""}</div>`:"";
          const innhTids=["formiddag","ettermiddag","notat"].map(tid=>{const ts=akt.filter(a=>a.tid===tid);return ts.length?`<div class="felt"><strong>${tid.charAt(0).toUpperCase()+tid.slice(1)}:</strong>${ts.map(a=>`<br>• ${escapeHTML(a.tekst)}`).join("")}</div>`:""}).join("");
          return `<td>${meta}${innhTids}</td>`;
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
        const raw = p.dager?.[d] || {};
        const data = migrerDag(raw);
        const dagN = d.charAt(0).toUpperCase() + d.slice(1);
        const emojiPrefix = erEmoji(data.bilde) ? data.bilde + " " : "";
        const linjer = [];
        const tidLabel = { formiddag:"Formiddag", ettermiddag:"Ettermiddag", notat:"Notat" };
        ["formiddag","ettermiddag","notat"].forEach(tid => {
          const akt = (data.aktiviteter||[]).filter(a=>a.tid===tid);
          if (akt.length) linjer.push(`  ${tidLabel[tid]}: ${akt.map(a=>a.tekst).join(", ")}`);
        });
        if (data.ansvarlig) linjer.push(`  Ansvarlig: ${data.ansvarlig}`);
        if (data.maaltid) linjer.push(`  Måltid: ${data.maaltid}`);
        return `${emojiPrefix}${dagN}:\n${linjer.length ? linjer.join("\n") : "  -"}`;
      }).join("\n\n");
      const full = `${p.tittel}\n${p.uke ? "Uke " + p.uke : ""}${p.tema ? "\nTema: " + p.tema : ""}\n\n${tekst}`;
      try {
        await navigator.clipboard.writeText(full);
        visLokal("✅ Kopiert");
      } catch {
        visLokal("❌ Kopiering støttes ikke i denne nettleseren");
      }
    };

    const filtrert = planer.filter(p => {
      if (!sok) return true;
      const s = sok.toLowerCase();
      return p.tittel.toLowerCase().includes(s) || (p.tema||"").toLowerCase().includes(s);
    });

    const iS = {width:"100%",border:"1.5px solid #d8e6f5",borderRadius:10,padding:"11px 13px",fontSize:14,background:"#f5f9fd",color:C.t,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10,outline:"none"};
    const labelStil = {display:"block",fontWeight:700,color:C.t,fontSize:12,marginBottom:5};

    if (!lastet) return <div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster ...</div>;

    // VISNING: Ny / Rediger
    if (visning === "ny" || visning === "rediger") {
      const erRediger = visning === "rediger";
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger ukeplan":"📅 Ny ukeplan"}</div>

          {lokalToast && <div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",padding:"9px 13px",borderRadius:9,fontSize:12,marginBottom:10,fontWeight:700,textAlign:"center"}}>{lokalToast}</div>}
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

          <div style={{background:C.lg2,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Fyll med AI</div>
              <button onClick={fyllMedAI} disabled={u_aiLoading||!u_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:u_tema.trim()?1:0.5}}>{u_aiLoading?"⏳ Genererer...":"✨ Fyll alle dager"}</button>
            </div>
            <div style={{fontSize:11,color:C.gr}}>{u_aiLoading?"Henter aktiviteter fra AI – ca. 10 sek...":"Skriv tema og la AI fylle inn aktiviteter for hele uken"}</div>
          </div>

          {["mandag","tirsdag","onsdag","torsdag","fredag"].map(d => {
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagBilde = u_dager[d].bilde;
            const dagFarge = u_dager[d].farge || DAG_FARGER_DEF[d];
            const erEmoji = dagBilde && !dagBilde.startsWith("data:");
            const dAgAkt = u_dager[d].aktiviteter || [];
            return (
              <div key={d} style={{background:C.w,borderRadius:11,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(44,91,142,0.06)",borderLeft:`3px solid ${dagFarge}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9,gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontWeight:800,color:dagFarge,fontSize:14}}>{dagN}</div>
                    <div style={{display:"flex",gap:4}}>{FARGEVALG.map(f=><button key={f||"ingen"} type="button" onClick={()=>oppdaterDag(d,"farge",f)} style={{width:14,height:14,borderRadius:"50%",border:(u_dager[d].farge||"")===f?"2px solid #333":"1.5px solid #ccc",background:f||DAG_FARGER_DEF[d],cursor:"pointer",padding:0}}/>)}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {dagBilde ? (<>
                      {erEmoji?<span style={{fontSize:22,lineHeight:1}}>{dagBilde}</span>:<img src={dagBilde} alt="" style={{width:32,height:32,borderRadius:6,objectFit:"cover",border:"1px solid #d8e6f5"}}/>}
                      <button type="button" aria-label="Slett bilde" onClick={()=>oppdaterDag(d,"bilde","")} style={{background:"#fdecea",color:"#c62828",border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:12,padding:0}}>✕</button>
                    </>) : (
                      <button type="button" onClick={()=>setBildevelgerForDag(d)} style={{background:"#e8eff8",color:dagFarge,border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>📷 Bilde</button>
                    )}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <label style={{...labelStil,fontSize:10}}>Ansvarlig</label>
                    <input value={u_dager[d].ansvarlig||""} onChange={e=>oppdaterDag(d,"ansvarlig",e.target.value)} placeholder="Navn..." style={{...iS,marginBottom:0,padding:"7px 10px",fontSize:12}}/>
                  </div>
                  <div>
                    <label style={{...labelStil,fontSize:10}}>Måltid</label>
                    <input value={u_dager[d].maaltid||""} onChange={e=>oppdaterDag(d,"maaltid",e.target.value)} placeholder="Frokost, lunsj..." style={{...iS,marginBottom:0,padding:"7px 10px",fontSize:12}}/>
                  </div>
                </div>

                {["formiddag","ettermiddag","notat"].map(tid=>{
                  const tidAkt=dAgAkt.filter(a=>a.tid===tid);
                  const tidInfo=TID_FARGER[tid];
                  return(
                    <div key={tid} style={{marginBottom:8}}>
                      <div style={{fontSize:9,fontWeight:800,color:tidInfo.col,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{tidInfo.label}</div>
                      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={e=>handleDagDragEnd(d,e)}>
                        <SortableContext items={tidAkt.map(a=>a.id)} strategy={verticalListSortingStrategy}>
                          {tidAkt.map(a=><SortableAktivitetItem key={a.id} a={a} tidCol={tidInfo.col} tidBg={tidInfo.bg} dager={["mandag","tirsdag","onsdag","torsdag","fredag"]} dag={d} slettFn={slettAktivitet} flyttFn={flyttAktivitet}/>)}
                        </SortableContext>
                      </DndContext>
                      <div style={{display:"flex",gap:5,marginTop:2}}>
                        <input value={nyAktivitet[d+tid]||""} onChange={e=>setNyAktivitet(p=>({...p,[d+tid]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&leggTilAktivitet(d,tid)} placeholder={`+ Legg til ${tidInfo.label.toLowerCase()}...`} style={{flex:1,padding:"5px 8px",borderRadius:7,border:"1.5px dashed #d0dff0",fontSize:11,fontFamily:"'Nunito',sans-serif",background:tidInfo.bg,color:C.t,outline:"none"}}/>
                        <button type="button" onClick={()=>leggTilAktivitet(d,tid)} style={{background:tidInfo.col,color:"#fff",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* BILDEVELGER-MODAL */}
          {bildevelgerForDag && (
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setBildevelgerForDag(null)} onKeyDown={e=>e.key==="Escape"&&setBildevelgerForDag(null)} tabIndex={-1}>
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
      return (
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
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
            const raw = valgt.dager?.[d] || {};
            const data = migrerDag(raw);
            const dagN = d.charAt(0).toUpperCase() + d.slice(1);
            const dagFarge = data.farge || DAG_FARGER_DEF[d];
            const erEmoji = data.bilde && !data.bilde.startsWith("data:");
            const harInnhold = data.aktiviteter?.length > 0 || data.ansvarlig || data.maaltid;
            return (
              <div key={d} style={{background:C.w,borderRadius:11,padding:13,marginBottom:10,boxShadow:"0 1px 5px rgba(44,91,142,0.06)",borderLeft:`3px solid ${dagFarge}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{fontWeight:800,color:dagFarge,fontSize:14,flex:1}}>{dagN}</div>
                  {data.ansvarlig&&<span style={{fontSize:10,color:C.gr,background:"#f5f9fd",borderRadius:6,padding:"2px 7px"}}>{data.ansvarlig}</span>}
                  {data.maaltid&&<span style={{fontSize:10,color:"#f57c00",background:"#fff3e0",borderRadius:6,padding:"2px 7px"}}>🍽 {data.maaltid}</span>}
                  {data.bilde && (erEmoji?<span style={{fontSize:24,lineHeight:1}}>{data.bilde}</span>:<img src={data.bilde} alt="" style={{width:38,height:38,borderRadius:7,objectFit:"cover",border:"1px solid #d8e6f5"}}/>)}
                </div>
                {!harInnhold ? (
                  <div style={{fontSize:12,color:C.gr,fontStyle:"italic"}}>– ingen plan –</div>
                ) : (
                  <>
                    {["formiddag","ettermiddag","notat"].map(tid=>{
                      const tidAkt=(data.aktiviteter||[]).filter(a=>a.tid===tid);
                      if(!tidAkt.length)return null;
                      const ti=TID_FARGER[tid];
                      return(
                        <div key={tid} style={{marginBottom:8}}>
                          <div style={{fontSize:9,fontWeight:800,color:ti.col,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{ti.label}</div>
                          {tidAkt.map(a=>(
                            <div key={a.id} style={{background:ti.bg,borderRadius:6,padding:"4px 9px",marginBottom:3,fontSize:12,color:"#1a2c45"}}>{a.tekst}</div>
                          ))}
                        </div>
                      );
                    })}
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
  }

function MaanedskalenderSide({ ctx }) {
  const { aktivBruker, navigerTil, planTema, setGlobalMaanedsplaner } = ctx;

    const MAANEDER_KAL = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];
    const UKEDAGER = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
    const EVENT_TYPER = {
      aktivitet:{farge:"#1565c0",bg:"#e3f2fd",label:"Aktivitet",ikon:"🎨"},
      tur:{farge:"#2e7d32",bg:"#e8f5e9",label:"Tur",ikon:"🌲"},
      bursdag:{farge:"#6a1b9a",bg:"#f3e5f5",label:"Bursdag",ikon:"🎂"},
      praktisk:{farge:"#f57c00",bg:"#fff3e0",label:"Praktisk",ikon:"📋"},
    };
    const [planer,setPlaner]=useState([]);
    const [lastet,setLastet]=useState(false);
    const [visning,setVisning]=useState("liste");
    const [valgt,setValgt]=useState(null);
    const [lokalToast,setLokalToast]=useState("");
    const visLokal=m=>{setLokalToast(m);setTimeout(()=>setLokalToast(""),3000);};
    const [bekreftSletting,setBekreftSletting]=useState(false);
    const [printModus,setPrintModus]=useState(false);
    const [k_tittel,setKTittel]=useState("");
    const [k_aar,setKAar]=useState(new Date().getFullYear());
    const [k_maaned,setKMaaned]=useState(new Date().getMonth()+1);
    const [k_tema,setKTema]=useState("");
    const [k_events,setKEvents]=useState({});
    const [k_loading,setKLoading]=useState(false);
    const [k_feil,setKFeil]=useState("");
    const [k_aiLoading,setKAiLoading]=useState(false);
    const [aktivDag,setAktivDag]=useState(null);
    const [nyEvent,setNyEvent]=useState({type:"aktivitet",tekst:"",ikon:""});

    useEffect(()=>{
      let avbrutt=false;
      (async()=>{if(!aktivBruker?.id){setLastet(true);return;}const liste=await hentKalenderplaner(aktivBruker.id);if(!avbrutt){setPlaner(liste);setLastet(true);}})();
      return()=>{avbrutt=true;};
    },[aktivBruker?.id]);

    const lagre=async(liste)=>{const ok=await lagreKalenderplaner(aktivBruker.id,liste);if(!ok){setKFeil("Kunne ikke lagre");return false;}setPlaner(liste);hentMaanedsplaner(aktivBruker.id).then(setGlobalMaanedsplaner).catch(console.error);return true;};

    const nyPlan=()=>{setValgt(null);setKTittel("");setKAar(new Date().getFullYear());setKMaaned(new Date().getMonth()+1);setKTema(planTema);setKEvents({});setKFeil("");setVisning("ny");};
    const redigerPlan=p=>{setValgt(p);setKTittel(p.tittel||"");setKAar(p.aar);setKMaaned(p.maaned);setKTema(p.tema||"");setKEvents(p.events||{});setKFeil("");setVisning("rediger");};

    const leggTilEvent=()=>{
      if(!nyEvent.tekst.trim())return;
      const ikon=nyEvent.ikon||EVENT_TYPER[nyEvent.type]?.ikon||"📅";
      const event={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),type:nyEvent.type,tekst:nyEvent.tekst.trim(),ikon};
      setKEvents(prev=>({...prev,[aktivDag]:[...(prev[aktivDag]||[]),event]}));
      setNyEvent({type:"aktivitet",tekst:"",ikon:""});
    };
    const slettEvent=(dag,id)=>setKEvents(prev=>({...prev,[dag]:(prev[dag]||[]).filter(e=>e.id!==id)}));

    const lagreNy=async()=>{if(!k_tittel.trim()){setKFeil("Skriv en tittel");return;}if(Object.keys(k_events).length===0){setKFeil("Kalenderen er tom – legg til minst én hendelse eller bruk AI-generering.");return;}setKLoading(true);const ok=await lagre([{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),tittel:k_tittel.trim(),aar:k_aar,maaned:k_maaned,tema:k_tema.trim(),events:k_events,opprettet:new Date().toISOString()},...planer]);setKLoading(false);if(ok){visLokal("✅ Kalender lagret");setVisning("liste");}};
    const lagreEndring=async()=>{if(!valgt)return;if(!k_tittel.trim()){setKFeil("Skriv en tittel");return;}setKLoading(true);const ok=await lagre(planer.map(p=>p.id===valgt.id?{...p,tittel:k_tittel.trim(),aar:k_aar,maaned:k_maaned,tema:k_tema.trim(),events:k_events}:p));setKLoading(false);if(ok){visLokal("✅ Endringer lagret");setVisning("liste");}};
    const slettPlan=async id=>{const ok=await lagre(planer.filter(p=>p.id!==id));if(ok){visLokal("🗑 Slettet");setVisning("liste");setValgt(null);}};

    const genererAI=async()=>{
      if(!k_tema.trim()){setKFeil("Skriv et tema først");return;}
      setKAiLoading(true);setKFeil("");
      const mNavn=MAANEDER_KAL[k_maaned-1];
      const antallDager=new Date(k_aar,k_maaned,0).getDate();
      const prompt=`Du er pedagog i norsk barnehage. Lag en fullstendig månedsoversikt for ${mNavn} ${k_aar} (${antallDager} dager) med tema "${k_tema}".\nDekk ALLE hverdager (mandag–fredag) med minst én hendelse per dag – ca. 18–22 hendelser totalt.\nTyper: aktivitet (daglig pedagogisk aktivitet), tur (uteaktivitet/tur), bursdag (markering), praktisk (info til foreldre).\nReturner KUN gyldig JSON uten markdown, eksempel:\n{"events":{"1":[{"type":"aktivitet","tekst":"Samlingsstund: tema ${k_tema}","ikon":"🎨"}],"2":[{"type":"tur","tekst":"Skogstur","ikon":"🌲"}],"3":[{"type":"aktivitet","tekst":"Forming og kreativitet","ikon":"✂️"}]}}\nBruk dagtall som nøkler (1–${antallDager}). Hopp over lørdager og søndager. Varier aktivitetene gjennom måneden.`;
      const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),25000);
      try{
        const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,max_tokens:1100}),signal:ctrl.signal});
        if(!r.ok){const d=await r.json().catch(()=>({}));setKFeil("❌ "+(d.error||"Serverfeil "+r.status));return;}
        const d=await r.json();const raw=d.text||"";
        const m=raw.match(/\{[\s\S]*\}/);
        if(!m){setKFeil("❌ AI svarte uten JSON – prøv igjen.");return;}
        let parsed;try{parsed=JSON.parse(m[0]);}catch{setKFeil("❌ AI-svaret var ikke gyldig JSON – prøv igjen.");return;}
        if(parsed.events&&Object.keys(parsed.events).length>0){
          setKEvents(prev=>{const ny={...prev};Object.entries(parsed.events).forEach(([dag,evts])=>{ny[dag]=[...(ny[dag]||[]),...(Array.isArray(evts)?evts:[]).map(e=>({...e,id:Date.now().toString(36)+Math.random().toString(36).slice(2,5)}))];});return ny;});
          const antHend=Object.values(parsed.events).reduce((s,a)=>s+(a?.length||0),0);
          visLokal(`✨ AI la til ${antHend} hendelser i kalenderen`);
        }else{setKFeil("❌ AI fant ingen hendelser å legge til – prøv igjen.");}
      }catch(e){
        console.error("[AI Kalender]",e);
        if(e.name==="AbortError")setKFeil("⏱ AI brukte for lang tid – prøv igjen.");
        else if(e.name==="TypeError")setKFeil("❌ Nettverksfeil – sjekk internett og prøv igjen.");
        else setKFeil("❌ "+e.message);
      }finally{clearTimeout(tid);setKAiLoading(false);}
    };

    const kalenderGrid=(aar,maaned,events,redigerbar)=>{
      const forste=new Date(aar,maaned-1,1);
      const siste=new Date(aar,maaned,0);
      const startUkedag=(forste.getDay()+6)%7;
      const antallDager=siste.getDate();
      const celler=[];
      for(let i=0;i<startUkedag;i++)celler.push(null);
      for(let d=1;d<=antallDager;d++)celler.push(d);
      while(celler.length%7!==0)celler.push(null);
      const iDag=new Date();const erIDag=(d)=>d&&aar===iDag.getFullYear()&&maaned===iDag.getMonth()+1&&d===iDag.getDate();
      return(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {UKEDAGER.map(u=><div key={u} style={{textAlign:"center",fontSize:10,fontWeight:800,color:C.gr,padding:"4px 0"}}>{u}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {celler.map((d,i)=>{
              const dagEvents=(events||{})[String(d)]||[];
              return(
                <div key={i} onClick={()=>{if(d&&redigerbar){setAktivDag(String(d));setNyEvent({type:"aktivitet",tekst:"",ikon:""});}}}
                  style={{minHeight:printModus?54:64,borderRadius:7,border:erIDag(d)?"2px solid "+C.g:"1px solid #e8eff8",background:d?C.w:"#f8fafd",padding:"3px 4px",cursor:d&&redigerbar?"pointer":undefined,position:"relative",overflow:"hidden"}}>
                  {d&&<div style={{fontSize:11,fontWeight:erIDag(d)?900:700,color:erIDag(d)?C.g:C.t,marginBottom:2}}>{d}</div>}
                  {dagEvents.map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
                    <div key={ev.id} style={{background:t.bg,color:t.farge,borderRadius:4,fontSize:9,padding:"1px 4px",marginBottom:1,display:"flex",alignItems:"center",gap:2,whiteSpace:"nowrap",overflow:"hidden"}}>
                      <span>{ev.ikon||t.ikon}</span><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{ev.tekst}</span>
                      {redigerbar&&<button aria-label="Slett hendelse" onClick={e=>{e.stopPropagation();slettEvent(String(d),ev.id);}} style={{marginLeft:"auto",background:"none",border:"none",color:t.farge,cursor:"pointer",fontSize:9,padding:0,flexShrink:0}}>✕</button>}
                    </div>
                  );})}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const skrivUtKalender=(p)=>{
      const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
      const mNavn=MAANEDER_KAL[(p.maaned||1)-1];
      const forste=new Date(p.aar,p.maaned-1,1);
      const antDager=new Date(p.aar,p.maaned,0).getDate();
      const startUkedag=(forste.getDay()+6)%7;
      const celler=[];
      for(let i=0;i<startUkedag;i++)celler.push(null);
      for(let d=1;d<=antDager;d++)celler.push(d);
      while(celler.length%7!==0)celler.push(null);
      const typeBg={aktivitet:"#dbeafe",tur:"#dcfce7",bursdag:"#f3e8ff",praktisk:"#fef9c3"};
      const typeCol={aktivitet:"#1e40af",tur:"#166534",bursdag:"#7e22ce",praktisk:"#854d0e"};
      const rader=[];
      for(let r=0;r<celler.length/7;r++){
        const cHtml=celler.slice(r*7,r*7+7).map(d=>{
          if(!d)return`<td style="background:#f8f8f8;border:1px solid #e0e0e0;"></td>`;
          const evts=(p.events||{})[String(d)]||[];
          const eHtml=evts.map(e=>`<div style="background:${typeBg[e.type]||"#f0f0f0"};color:${typeCol[e.type]||"#333"};border-radius:3px;padding:1px 5px;font-size:8px;margin-bottom:1px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${esc(e.ikon||"")} ${esc(e.tekst)}</div>`).join("");
          return`<td style="border:1px solid #ccc;padding:4px;vertical-align:top;height:72px;"><div style="font-size:11px;font-weight:700;color:#1a2c45;margin-bottom:3px">${d}</div>${eHtml}</td>`;
        }).join("");
        rader.push(`<tr>${cHtml}</tr>`);
      }
      const html=`<!DOCTYPE html><html lang="no"><head><meta charset="utf-8"><title>${esc(p.tittel)} – Barnehagehjelpen</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,"Segoe UI",sans-serif;color:#1a2c45;background:#fff;padding:16px}
.topp{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:8px}
h1{font-size:20px;color:#2c5b8e}p{font-size:12px;color:#5d7390;margin-top:3px}
.knapper{display:flex;gap:8px}.knapp{padding:8px 14px;background:#2c5b8e;color:#fff;border:none;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}
.lukk{padding:8px 14px;background:#e8eff8;color:#2c5b8e;border:none;border-radius:7px;font-weight:700;cursor:pointer;font-size:12px}
table{width:100%;border-collapse:collapse;table-layout:fixed}
th{background:#2c5b8e;color:#fff;padding:6px 4px;text-align:center;font-size:11px;border:1px solid #1a4063}
.legend{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}
.leg-item{display:flex;align-items:center;gap:4px;font-size:10px}
.leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
@media print{@page{margin:10mm;size:portrait}.knapper{display:none}body{padding:0}}</style>
</head><body>
<div class="topp"><div><h1>🗓 ${esc(p.tittel)}</h1><p>${mNavn} ${p.aar}${p.tema?" • Tema: "+esc(p.tema):""}</p></div>
<div class="knapper"><button class="lukk" onclick="window.close()">← Lukk</button><button class="knapp" onclick="window.print()">🖨️ Skriv ut</button></div></div>
<table><thead><tr>${["Man","Tir","Ons","Tor","Fre","Lør","Søn"].map(d=>`<th>${d}</th>`).join("")}</tr></thead>
<tbody>${rader.join("")}</tbody></table>
<div class="legend"><div class="leg-item"><div class="leg-dot" style="background:#dbeafe"></div>Aktivitet</div><div class="leg-item"><div class="leg-dot" style="background:#dcfce7"></div>Tur</div><div class="leg-item"><div class="leg-dot" style="background:#f3e8ff"></div>Bursdag</div><div class="leg-item"><div class="leg-dot" style="background:#fef9c3"></div>Praktisk</div></div>
</body></html>`;
      const v=window.open("","_blank","width=900,height=720");
      if(!v){
        try{
          const blob=new Blob([html],{type:"text/html;charset=utf-8"});
          const url=URL.createObjectURL(blob);
          const a=document.createElement("a");
          a.href=url;a.download=`kalender-${esc(p.tittel).replace(/[^a-zA-Z0-9æøåÆØÅ]/g,"-")}.html`;
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          setTimeout(()=>URL.revokeObjectURL(url),1500);
          visLokal("💾 Popup blokkert – kalender lastet ned som HTML");
        }catch{visLokal("⚠️ Popup blokkert – tillat popup for å skrive ut");}
        return;
      }
      v.document.write(html);v.document.close();v.focus();
      setTimeout(()=>v.print(),400);
    };

    if(!lastet)return<div style={{padding:18,textAlign:"center",color:C.gr}}><div className="spin" style={{margin:"0 auto 8px"}}/>Laster...</div>;

    // VISNING: Ny / Rediger
    if(visning==="ny"||visning==="rediger"){
      const erRediger=visning==="rediger";
      return(
        <div className="fade">
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t,marginBottom:14}}>{erRediger?"✏️ Rediger kalender":"🗓 Ny månedskalender"}</div>
          {k_feil&&<div style={{background:"#ffebee",color:"#c62828",borderRadius:9,padding:"9px 12px",fontSize:12,marginBottom:12}}>{k_feil}</div>}
          <div style={{background:C.w,borderRadius:13,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TITTEL</label>
            <input value={k_tittel} onChange={e=>setKTittel(e.target.value)} placeholder="F.eks. 'September – Blå avdeling'" style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:10}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:10}}>
              <div>
                <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>ÅR</label>
                <input type="number" value={k_aar} onChange={e=>setKAar(parseInt(e.target.value)||new Date().getFullYear())} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>MÅNED</label>
                <select value={k_maaned} onChange={e=>setKMaaned(parseInt(e.target.value))} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}>
                  {MAANEDER_KAL.map((n,i)=><option key={i+1} value={i+1}>{n}</option>)}
                </select>
              </div>
            </div>
            <label style={{fontSize:11,fontWeight:800,color:C.gr,display:"block",marginBottom:4}}>TEMA</label>
            <input value={k_tema} onChange={e=>setKTema(e.target.value)} placeholder={planTema||"F.eks. Natur og årstider"} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box"}}/>
          </div>

          <div style={{background:C.lg2,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontWeight:800,fontSize:12,color:C.g}}>🤖 Fyll med AI</div>
              <button onClick={genererAI} disabled={k_aiLoading||!k_tema.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:700,opacity:k_tema.trim()?1:0.5}}>{k_aiLoading?"⏳ Genererer...":"✨ Generer hendelser"}</button>
            </div>
            <div style={{fontSize:11,color:C.gr}}>{k_aiLoading?"Henter hendelser fra AI – ca. 10 sek...":"Fyll ut tema og la AI foreslå aktiviteter, turer og hendelser"}</div>
          </div>

          <div style={{background:C.w,borderRadius:13,padding:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>KALENDER — {MAANEDER_KAL[k_maaned-1]} {k_aar}</div>
            <div style={{fontSize:11,color:C.gr,marginBottom:10}}>Klikk på en dag for å legge til hendelser</div>
            {kalenderGrid(k_aar,k_maaned,k_events,true)}
          </div>

          {aktivDag&&(
            <div className="fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={()=>setAktivDag(null)} onKeyDown={e=>e.key==="Escape"&&setAktivDag(null)} tabIndex={-1}>
              <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:18,maxWidth:380,width:"100%",boxShadow:"0 10px 40px rgba(0,0,0,0.25)"}}>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.t,marginBottom:12}}>{MAANEDER_KAL[k_maaned-1]} {aktivDag}</div>
                {(k_events[aktivDag]||[]).length>0&&(
                  <div style={{marginBottom:12}}>
                    {(k_events[aktivDag]||[]).map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
                      <div key={ev.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:t.bg,borderRadius:7,marginBottom:4}}>
                        <span>{ev.ikon||t.ikon}</span><span style={{flex:1,fontSize:12,color:t.farge}}>{ev.tekst}</span>
                        <button aria-label="Slett hendelse" onClick={()=>slettEvent(aktivDag,ev.id)} style={{background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                    );})}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                  {Object.entries(EVENT_TYPER).map(([k,v])=><button key={k} onClick={()=>setNyEvent(p=>({...p,type:k}))} style={{padding:"5px 8px",borderRadius:7,border:nyEvent.type===k?"2px solid "+v.farge:"1.5px solid #e8eff8",background:nyEvent.type===k?v.bg:"#fff",color:v.farge,fontSize:11,fontWeight:700,cursor:"pointer"}}>{v.ikon} {v.label}</button>)}
                </div>
                <input value={nyEvent.tekst} onChange={e=>setNyEvent(p=>({...p,tekst:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&leggTilEvent()} placeholder="Beskriv hendelsen..." style={{width:"100%",padding:"8px 11px",borderRadius:8,border:"1.5px solid #d0dff0",fontSize:13,fontFamily:"'Nunito',sans-serif",boxSizing:"border-box",marginBottom:8}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
                  <button onClick={leggTilEvent} disabled={!nyEvent.tekst.trim()} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Legg til</button>
                  <button onClick={()=>setAktivDag(null)} style={{background:"#e8eff8",color:C.t,border:"none",borderRadius:8,padding:"9px 14px",fontSize:13,cursor:"pointer"}}>Lukk</button>
                </div>
              </div>
            </div>
          )}

          <button onClick={erRediger?lagreEndring:lagreNy} disabled={k_loading} style={{width:"100%",padding:"13px",fontSize:14,fontWeight:800,background:k_loading?"#ccc":"linear-gradient(135deg,#2c5b8e,#4178bd)",color:"#fff",border:"none",borderRadius:11,cursor:k_loading?"wait":"pointer",fontFamily:"'Nunito',sans-serif",marginTop:4}}>
            {k_loading?"Lagrer...":"💾 Lagre kalender"}
          </button>
        </div>
      );
    }

    // VISNING: Les enkelt-kalender
    if(visning==="les"&&valgt){
      const mNavn=MAANEDER_KAL[(valgt.maaned||1)-1];
      const totalEvents=Object.values(valgt.events||{}).reduce((s,a)=>s+(a||[]).length,0);
      return(
        <div className="fade">
          <button onClick={()=>{setVisning("liste");setPrintModus(false);}} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.t}}>🗓 {valgt.tittel}</div>
              <div style={{fontSize:12,color:C.gr,marginTop:2}}>{mNavn} {valgt.aar}{valgt.tema&&" • "+valgt.tema} • {totalEvents} hendelser</div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>setPrintModus(p=>!p)} style={{background:printModus?"#1565c0":"#e8eff8",color:printModus?"#fff":C.t,border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{printModus?"📺 Skjermvisning":"🖨️ Utskriftsmodus"}</button>
              <button onClick={()=>skrivUtKalender(valgt)} style={{background:"#2c5b8e",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>🖨️ Skriv ut</button>
              <button onClick={()=>redigerPlan(valgt)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Rediger</button>
            </div>
          </div>
          {lokalToast&&<div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
          <div style={{background:C.w,borderRadius:13,padding:printModus?10:14,boxShadow:"0 2px 10px rgba(44,91,142,0.08)",marginBottom:12}}>
            {printModus&&<div style={{textAlign:"center",marginBottom:8}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:"#2c5b8e"}}>{valgt.tittel}</div>
              <div style={{fontSize:11,color:"#666"}}>{mNavn} {valgt.aar}{valgt.tema&&" • "+valgt.tema}</div>
            </div>}
            {!printModus&&<div style={{fontWeight:800,fontSize:12,color:C.gr,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{mNavn} {valgt.aar}</div>}
            {kalenderGrid(valgt.aar,valgt.maaned,valgt.events,false)}
          </div>
          <div style={{background:C.lg2,borderRadius:10,padding:"10px 13px",marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:11,color:C.gr,marginBottom:6,textTransform:"uppercase"}}>Hendelser denne måneden</div>
            {Object.entries(valgt.events||{}).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([dag,evts])=>evts.map(ev=>{const t=EVENT_TYPER[ev.type]||EVENT_TYPER.aktivitet;return(
              <div key={ev.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid #e8eff8"}}>
                <span style={{fontSize:11,fontWeight:700,color:C.gr,minWidth:22,textAlign:"right"}}>{dag}.</span>
                <span style={{background:t.bg,color:t.farge,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700}}>{ev.ikon||t.ikon} {ev.tekst}</span>
              </div>
            );}))}
          </div>
          {bekreftSletting
            ?<div style={{display:"flex",gap:8}}><button onClick={()=>{setBekreftSletting(false);slettPlan(valgt.id);}} style={{flex:1,background:"#c62828",color:"#fff",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Bekreft sletting</button><button onClick={()=>setBekreftSletting(false)} style={{flex:1,background:"#e8eff8",color:C.t,padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avbryt</button></div>
            :<button onClick={()=>setBekreftSletting(true)} style={{background:"#fdecea",color:"#c62828",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",width:"100%"}}>🗑 Slett kalender</button>}
        </div>
      );
    }

    // VISNING: Liste
    return(
      <div className="fade">
        <button onClick={()=>navigerTil("planlegging")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 8px",display:"flex",alignItems:"center",gap:5}}>← Planlegging</button>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>🗓 Månedskalender</div>
        <p style={{color:C.gr,fontSize:12,marginBottom:14}}>Ekte kalendervisning med hendelser, turer og bursdager per dag</p>
        <button onClick={nyPlan} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#1565c0,#1976d2)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 3px 9px rgba(21,101,192,0.3)",marginBottom:12}}>🗓 Lag ny kalender</button>
        {lokalToast&&<div className="fade" style={{background:"#e8f5e9",color:"#2e7d32",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:700,marginBottom:10,textAlign:"center"}}>{lokalToast}</div>}
        {planer.length===0?<div style={{textAlign:"center",padding:34,background:C.w,borderRadius:12,boxShadow:"0 1px 5px rgba(44,91,142,0.07)"}}>
          <div style={{fontSize:42,marginBottom:9}}>🗓</div>
          <div style={{fontWeight:800,color:C.t,fontSize:15,marginBottom:6}}>Ingen kalendre ennå</div>
          <div style={{fontSize:12,color:C.gr,lineHeight:1.6,maxWidth:280,margin:"0 auto"}}>Lag månedsoversikter med aktiviteter, turer og bursdager. AI kan hjelpe deg å fylle inn hendelser.</div>
        </div>:(
          <div style={{display:"grid",gap:9}}>
            {planer.map(p=>{const mN=MAANEDER_KAL[(p.maaned||1)-1];const antall=Object.values(p.events||{}).reduce((s,a)=>s+(a||[]).length,0);return(
              <div key={p.id} className="hover" onClick={()=>{setValgt(p);setVisning("les");}} style={{background:C.w,borderRadius:12,padding:"13px 15px",cursor:"pointer",boxShadow:"0 1px 5px rgba(44,91,142,0.07)",borderLeft:"3px solid #1565c0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{fontWeight:800,color:C.t,fontSize:14}}>{p.tittel}</div>
                  <span style={{fontSize:10,color:C.gr,background:"#e8eff8",padding:"2px 8px",borderRadius:7,fontWeight:700,flexShrink:0}}>{mN} {p.aar}</span>
                </div>
                {p.tema&&<div style={{fontSize:12,color:C.gr,marginTop:2}}>{p.tema}</div>}
                <div style={{fontSize:11,color:C.gr,marginTop:4}}>{antall} hendelser</div>
              </div>
            );})}
          </div>
        )}
      </div>
    );
  }

function AIKnapper({ seksjonId, aiAktiv, aiLoading, aiTekst, utforSeksjonAI, aksepterForslag, avvisForslag }) {
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
        <div ref={el => el && el.scrollIntoView({ behavior:"smooth", block:"nearest" })} className="fade" style={{background:C.lg2,border:"2px solid var(--c-g)",borderRadius:10,padding:12,marginTop:10}}>
          <div style={{fontSize:11,fontWeight:800,color:C.g,marginBottom:6}}>✨ AI-forslag – klikk "Bruk" for å legge inn i seksjonen:</div>
          <div style={{fontSize:12,color:C.t,whiteSpace:"pre-wrap",lineHeight:1.6,marginBottom:8,maxHeight:220,overflowY:"auto"}}>{aiTekst}</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={() => aksepterForslag(seksjonId)} style={{background:C.g,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✅ Bruk forslaget</button>
            <button onClick={avvisForslag} style={{background:"transparent",color:C.gr,border:"1px solid var(--c-divider)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Avvis</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArsplanSide({ ctx }) {
  const { aktivBruker, vis, navigerTil, planTema, setPlanTema } = ctx;

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
      { id:"juli",      navn:"Juli",      ikon:"🏖️", farge:"#e67e22" },
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
      const tid = setTimeout(() => ctrl.abort(), 25000);
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
      }, 1200);
    };

    const aksepterForslag = (seksjonId) => { oppdaterSeksjon(seksjonId, aiTekst); setAiTekst(""); setAiAktiv(null); visLokal("✅ Forslag lagt inn"); };
    const avvisForslag = () => { setAiTekst(""); setAiAktiv(null); };

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
              <AIKnapper seksjonId={s.id} aiAktiv={aiAktiv} aiLoading={aiLoading} aiTekst={aiTekst} utforSeksjonAI={utforSeksjonAI} aksepterForslag={aksepterForslag} avvisForslag={avvisForslag} />
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
            <button onClick={()=>{const sek=SEKSJONER.filter(s=>valgt.seksjoner?.[s.id]?.trim()).map(s=>({label:`${s.ikon} ${s.navn}`,tekst:valgt.seksjoner[s.id]}));lastNedPlanPDF({tittel:valgt.tittel||"Årsplan",meta:[valgt.barnehage,valgt.avdeling,valgt.alder,valgt.aar].filter(Boolean).join(" • "),seksjoner:sek});}} style={{background:"#e8f5e9",color:"#2e7d32",padding:"11px",fontSize:12,fontWeight:800,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>📄 PDF</button>
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
  }

function DokumentasjonSide({ ctx }) {
  const { aktivBruker, vis, setGlobalDokumentasjon } = ctx;

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
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
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
          <button onClick={()=>setVisning("liste")} style={{background:"none",border:"none",color:C.g,cursor:"pointer",fontWeight:700,fontSize:13,padding:"0 0 12px",display:"flex",alignItems:"center",gap:5}}>← Tilbake</button>
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
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📔 Dokumentasjon</h1>
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
  }

function ProfilSide({ ctx }) {
  const { aktivBruker, onUserUpdate, onLogout } = ctx;

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
            <p style={{fontSize:12,color:C.gr,marginBottom:14,lineHeight:1.6}}>Valgfritt. Lagres sikkert i skyen og synkroniseres på tvers av enheter. Krever ikke passord å endre.</p>
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
              <button type="button" aria-label={pw_vis?"Skjul passord":"Vis passord"} onClick={()=>setPwVis(v=>!v)} style={{position:"absolute",right:11,top:11,background:"transparent",border:"none",color:C.gr,fontSize:11,cursor:"pointer",fontWeight:700,padding:"3px 6px"}}>{pw_vis?"Skjul":"Vis"}</button>
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
  }


function Hjem({ ctx }) {
  const { hikon, vær, værIkon, værTekst, hils, hsub, skjemaer, globalSok, setGlobalSok, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, tips, tipsFag, nesteTips, setValgtFag, setRammeSeksjon } = ctx;
  return (
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
        aapneSang={aapneSang}
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
            style={{background:"transparent", border:"1.5px solid var(--c-divider)", color:C.g, width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:14, fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
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
          <div key={t} className="hover fade" onClick={()=>navigerTil(sid)} style={{background:C.w, borderRadius:14, padding:"16px 14px", cursor:"pointer", boxShadow:`0 2px 10px ${fc}22`, borderLeft:`4px solid ${fc}`}}>
            <div style={{fontSize:26, marginBottom:4}}>{ic}</div>
            <div style={{fontFamily:"'Fredoka One',cursive", fontSize:15, color:C.t}}>{t}</div>
            <div style={{fontSize:11, color:C.gr, marginTop:2}}>{u}</div>
          </div>
        ))}
      </div>

      {/* PLANLEGGING */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{fontFamily:"'Fredoka One',cursive", fontSize:16, color:C.t}}>📋 Planlegging</div>
        <button onClick={()=>navigerTil("planlegging")} style={{background:"#d8f3dc",color:"#2d6a4f",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Se alle →</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20}}>
        {[
          ["📅","Ukeplan","Mandag–fredag med tema","ukeplan","#1565c0"],
          ["📋","Månedsplan","Hele måneden strukturert","maanedsplan","#6a1b9a"],
          ["✉️","Månedsbrev","Brev til foreldre","maanedsbrev","#e67e22"],
          ["📆","Årsplan","Overordnet tema og mål","arsplan","#2d6a4f"],
        ].map(([ic,t,u,sideId,fc])=>(
          <div key={t} className="hover" onClick={()=>navigerTil(sideId)} style={{background:C.w, borderRadius:12, padding:"12px 13px", cursor:"pointer", boxShadow:`0 2px 8px ${fc}1f`, borderLeft:`3px solid ${fc}`}}>
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
            <div key={f.id} className="hover" onClick={()=>{setValgtFag(f);setRammeSeksjon("fagomrader");navigerTil("rammeplan");}}
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
}

function MineSkjemaer({ ctx }) {
  const { skjemaer, setSkjemaer, feedback, vis, valgtSkjema, setValgtSkjema, redigerSkjemaTittel, setRedigerSkjemaTittel, setBekreftSlettSkjema, navigerTil } = ctx;
  return (
    <div className="fade">
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.t,marginBottom:3}}>📋 Mine skjemaer</h1>
      <p style={{color:C.gr,fontSize:12,marginBottom:12}}>{skjemaer.length} skjema{skjemaer.length!==1?"er":""} lagret</p>
      {feedback&&<div className="fade" style={{marginBottom:12,background:C.mint,borderRadius:8,padding:"9px 13px",color:C.g,fontWeight:700}}>{feedback}</div>}
      {skjemaer.length===0?(
        <div style={{background:C.w,borderRadius:16,padding:28,textAlign:"center",boxShadow:"0 2px 10px rgba(44,91,142,0.07)"}}>
          <div style={{fontSize:40,marginBottom:8}}>📝</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.t}}>Ingen skjemaer ennå</div>
          <div style={{color:C.gr,fontSize:12,marginTop:4,marginBottom:12}}>Lag ditt første aktivitetsskjema!</div>
          <button className="btn" onClick={()=>navigerTil("skjema-ny")} style={{background:C.g,color:"#fff",padding:"10px 18px",fontSize:13}}>✏️ Lag nytt skjema</button>
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
  const [globalDokumentasjon, setGlobalDokumentasjon] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSok, setGlobalSok] = useState("");
  const [sokDebounced, setSokDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSokDebounced(globalSok), 200);
    return () => clearTimeout(t);
  }, [globalSok]);
  const [planTema, setPlanTema] = useState(() => localStorage.getItem("bh_plan_tema") || "");
  useEffect(() => {
    if (planTema) localStorage.setItem("bh_plan_tema", planTema);
    else localStorage.removeItem("bh_plan_tema");
  }, [planTema]);

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


  // Last alle brukerdata ved innlogging – én samlet Promise.all for færre round-trips
  useEffect(() => {
    const uid = aktivBruker?.id;
    if (!uid) return;
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
    ]).then(([fav, ukeplaner, maanedsplaner, maanedsbrev, arsplaner, boker, tegneark, sanger, aktivitetskort, dokumentasjon]) => {
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
    }).catch(console.error);
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
    {id:"planlegging",i:"📅",n:"Planlegging"},
    {id:"samarbeid",i:"👥",n:"Samarbeid"},
    {id:"aktivitetskort",i:"🃏",n:"Aktivitetskort"},
    {id:"dokumentasjon",i:"📔",n:"Dokumentasjon"},
    {id:"support",i:"❓",n:"Hjelp & FAQ"},
    ...(aktivBruker?.admin?[{id:"admin",i:"👑",n:"Admin-panel"}]:[])
  ];

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
    globalUserTegneark,
    setGlobalUserTegneark,
    preselectTegneark,
    setPreselectTegneark,
    onUserUpdate,
    onLogout,
  };

  const hjemCtx = { hikon, vær, værIkon, værTekst, hils, hsub, skjemaer, globalSok, setGlobalSok, sokeResultat, navigerTil, aapneAktivitet, aapneSang, aapneTegneark, aapneFagomrade, aapneRammeplan, aapneAktivitetskort, aapneDokumentasjon, tips, tipsFag, nesteTips, setValgtFag, setRammeSeksjon };
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
    planlegging:<PlanleggingSide planTema={planTema} setPlanTema={setPlanTema} navigerTil={navigerTil} antallUkeplaner={globalUkeplaner.length} antallMaanedsplaner={globalMaanedsplaner.length} antallMaanedsbrev={globalMaanedsbrev.length} antallArsplaner={globalArsplaner.length}/>,
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
      <div className="bh-layout">
        {/* Mobil-header med hamburger */}
        <div className="bh-mobile-header">
          <button className="bh-hamburger" onClick={()=>setSidebarOpen(true)} aria-label="Åpne meny">☰</button>
          <div className="bh-mobile-title">
            {(() => { const n = nav.find(x => x.id === side); return n ? `${n.i} ${n.n}` : "🌿 Barnehagehjelpen"; })()}
          </div>
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
        <main className="bh-main">
          <div aria-live="polite" aria-atomic="true" style={{position:"fixed",top:70,right:20,zIndex:200,pointerEvents:"none"}}>
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

  return <Barnehagehjelpen aktivBruker={aktivBruker} onLogout={handleLogout} onUserUpdate={handleUserUpdate}/>;
}

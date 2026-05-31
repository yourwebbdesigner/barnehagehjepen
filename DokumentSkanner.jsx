import { useState, useRef, useCallback, useEffect } from "react";
import { supabase as supabaseClient } from "./supabase.js";

function lagSupabase() { return supabaseClient; }

// ═══════════════════════════════════════════
//  PERSPEKTIVKORREKSJON (homografi + warp)
// ═══════════════════════════════════════════

function gaussElim(M) {
  const n = M.length;
  const A = M.map(r => [...r]);
  for (let col = 0; col < n; col++) {
    let mx = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(A[r][col]) > Math.abs(A[mx][col])) mx = r;
    [A[col], A[mx]] = [A[mx], A[col]];
    if (Math.abs(A[col][col]) < 1e-10) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let k = col; k <= n; k++) A[r][k] -= f * A[col][k];
    }
  }
  return A.map((r, i) => r[n] / r[i]);
}

function beregnHomografi(src, dst) {
  const A = [];
  for (let i = 0; i < 4; i++) {
    const { x: sx, y: sy } = src[i];
    const { x: dx, y: dy } = dst[i];
    A.push([-sx, -sy, -1, 0, 0, 0, sx * dx, sy * dx, dx]);
    A.push([0, 0, 0, -sx, -sy, -1, sx * dy, sy * dy, dy]);
  }
  const h = gaussElim(A);
  return [...h, 1];
}

function mapP(H, x, y) {
  const d = H[6] * x + H[7] * y + H[8];
  return { x: (H[0] * x + H[1] * y + H[2]) / d, y: (H[3] * x + H[4] * y + H[5]) / d };
}

function warpCanvas(srcCv, pts) {
  const [tl, tr, br, bl] = pts;
  const W = Math.round(Math.max(
    Math.hypot(tr.x - tl.x, tr.y - tl.y),
    Math.hypot(br.x - bl.x, br.y - bl.y)
  ));
  const H = Math.round(Math.max(
    Math.hypot(bl.x - tl.x, bl.y - tl.y),
    Math.hypot(br.x - tr.x, br.y - tr.y)
  ));
  const dst = document.createElement("canvas");
  dst.width = W; dst.height = H;
  const dCtx = dst.getContext("2d");
  const Hinv = beregnHomografi(
    [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }],
    pts
  );
  const sCtx = srcCv.getContext("2d");
  const sImg = sCtx.getImageData(0, 0, srcCv.width, srcCv.height);
  const dImg = dCtx.createImageData(W, H);
  const sW = srcCv.width, sH = srcCv.height;
  const get = (px, py) => {
    const x = Math.max(0, Math.min(sW - 1, px | 0));
    const y = Math.max(0, Math.min(sH - 1, py | 0));
    const i = (y * sW + x) * 4;
    return [sImg.data[i], sImg.data[i + 1], sImg.data[i + 2]];
  };
  for (let dy = 0; dy < H; dy++) {
    for (let dx = 0; dx < W; dx++) {
      const { x: sx, y: sy } = mapP(Hinv, dx, dy);
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const fx = sx - x0, fy = sy - y0;
      const p00 = get(x0, y0), p10 = get(x0 + 1, y0);
      const p01 = get(x0, y0 + 1), p11 = get(x0 + 1, y0 + 1);
      const i = (dy * W + dx) * 4;
      for (let c = 0; c < 3; c++) {
        dImg.data[i + c] = Math.round(
          p00[c] * (1 - fx) * (1 - fy) + p10[c] * fx * (1 - fy) +
          p01[c] * (1 - fx) * fy + p11[c] * fx * fy
        );
      }
      dImg.data[i + 3] = 255;
    }
  }
  dCtx.putImageData(dImg, 0, 0);
  return dst;
}


function lastBildeCanvas(src, maxDim = 1800) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      res(cv);
    };
    img.onerror = () => rej(new Error("Kunne ikke laste bildet"));
    img.src = src;
  });
}


// ═══════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

  .ds-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 20px; border-radius: 12px; border: none;
    font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 14px;
    cursor: pointer; transition: all 0.18s ease; letter-spacing: 0.2px;
  }
  .ds-btn:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(44,91,142,0.2); }
  .ds-btn:active:not(:disabled) { transform: translateY(0); }
  .ds-btn:disabled { opacity: 0.55; cursor: default; }
  .ds-btn-prim { background: linear-gradient(135deg, #2c5b8e, #4178bd); color: #fff; box-shadow: 0 3px 10px rgba(44,91,142,0.25); }
  .ds-btn-sek  { background: #e8eff8; color: #2c5b8e; }
  .ds-btn-grn  { background: linear-gradient(135deg, #2d6a4f, #52b788); color: #fff; box-shadow: 0 3px 10px rgba(45,106,79,0.25); }

  .ds-kort {
    background: #fff; border: 1.5px solid #e8eff8; border-radius: 16px;
    padding: 20px; margin-bottom: 14px;
    box-shadow: 0 2px 12px rgba(44,91,142,0.06);
  }

  .ds-steg-ind {
    display: flex; gap: 6px; margin-bottom: 20px;
  }
  .ds-steg-dot {
    height: 4px; border-radius: 2px; flex: 1; background: #e8eff8; transition: background 0.3s;
  }
  .ds-steg-dot.aktiv { background: #2c5b8e; }
  .ds-steg-dot.ferdig { background: #52b788; }

  .ds-bilde-wrap {
    position: relative; display: block; width: 100%;
    border-radius: 10px; overflow: hidden;
    background: #000; touch-action: none;
  }
  .ds-bilde-wrap img { width: 100%; display: block; }

  .ds-hjorne {
    position: absolute; width: 32px; height: 32px; border-radius: 50%;
    background: #2c5b8e; border: 3px solid #fff;
    box-shadow: 0 2px 10px rgba(44,91,142,0.5);
    cursor: grab; transform: translate(-50%, -50%);
    touch-action: none; z-index: 10;
    transition: transform 0.1s, background 0.1s;
  }
  .ds-hjorne:active { background: #1f4068; transform: translate(-50%, -50%) scale(1.15); cursor: grabbing; }
  .ds-hjorne-inner {
    width: 10px; height: 10px; border-radius: 50%;
    background: #fff; position: absolute;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
  }

  .ds-overlay-svg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none;
  }

  .ds-fremgang { height: 6px; background: #e8eff8; border-radius: 3px; overflow: hidden; margin: 8px 0; }
  .ds-fremgang-inner { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #2c5b8e, #4178bd); transition: width 0.25s; }

  @keyframes ds-spin { to { transform: rotate(360deg); } }
  .ds-spinn {
    width: 28px; height: 28px;
    border: 3px solid rgba(44,91,142,0.15);
    border-top-color: #2c5b8e;
    border-radius: 50%;
    animation: ds-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  .ds-ocr-tekst {
    white-space: pre-wrap; font-family: 'Nunito', sans-serif; font-size: 13px;
    color: #3d5a7a; line-height: 1.75; background: #f5f9fd;
    padding: 14px; border-radius: 10px; max-height: 280px;
    overflow-y: auto; border: 1.5px solid #e8eff8;
  }

  .ds-info {
    background: #f0f5fb; border-radius: 10px; padding: 12px 14px;
    font-size: 12px; color: #5d7390; line-height: 1.65;
  }

  [data-theme="dark"] .ds-kort {
    background: var(--c-card);
    border-color: var(--c-divider);
  }
  [data-theme="dark"] .ds-btn-sek {
    background: var(--c-lg2);
    color: var(--c-g);
  }
  [data-theme="dark"] .ds-steg-dot {
    background: var(--c-lg2);
  }
  [data-theme="dark"] .ds-steg-dot.aktiv {
    background: var(--c-g);
  }
  [data-theme="dark"] .ds-fremgang {
    background: var(--c-lg2);
  }
  [data-theme="dark"] .ds-spinn {
    border-color: rgba(74,143,212,0.2);
    border-top-color: var(--c-g);
  }
  [data-theme="dark"] .ds-ocr-tekst {
    background: var(--c-input-bg);
    color: var(--c-input-t);
    border-color: var(--c-divider);
  }
  [data-theme="dark"] .ds-info {
    background: var(--c-lg2);
    color: var(--c-gr);
  }
`;

// ═══════════════════════════════════════════
//  HOVED-KOMPONENT
// ═══════════════════════════════════════════

const STEG = ["fangst", "beskjær", "prosesserer", "ferdig"];

export default function DokumentSkanner({ aktivBruker, onFerdig }) {
  const supabase = useRef(lagSupabase()).current;
  const [steg, setSteg] = useState("fangst");
  const [bildeSrc, setBildeSrc] = useState(null);
  const [bildeCanvas, setBildeCanvas] = useState(null);
  const [hjørner, setHjørner] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [ocrTekst, setOcrTekst] = useState("");
  const [lasterStatus, setLasterStatus] = useState("");
  const [lagretUrl, setLagretUrl] = useState(null);
  const [feil, setFeil] = useState("");

  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const getScale = () => {
    if (!imgRef.current || !bildeCanvas) return { sx: 1, sy: 1 };
    const r = imgRef.current.getBoundingClientRect();
    return { sx: r.width / bildeCanvas.width, sy: r.height / bildeCanvas.height };
  };

  // ── Last inn bildefil ──────────────────────────────────────────────────────
  const handleFil = async (fil) => {
    if (!fil?.type?.startsWith("image/")) {
      setFeil("Kun bildefiler støttes (JPG, PNG)"); return;
    }
    setFeil("");
    const src = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.onerror = () => rej(new Error("Kunne ikke lese filen"));
      reader.readAsDataURL(fil);
    }).catch(err => { setFeil(err.message); return null; });
    if (!src) return;
    setBildeSrc(src);
    let cv;
    try {
      cv = await lastBildeCanvas(src);
    } catch (err) {
      setFeil("Kunne ikke laste bildet – prøv et annet bilde");
      return;
    }
    setBildeCanvas(cv);
    const m = 40; // innmarg for hjørner (litt innenfor kanten)
    setHjørner([
      { x: m, y: m },
      { x: cv.width - m, y: m },
      { x: cv.width - m, y: cv.height - m },
      { x: m, y: cv.height - m },
    ]);
    setSteg("beskjær");
  };

  // ── Dra-logikk ─────────────────────────────────────────────────────────────
  const startDrag = useCallback((e, i) => {
    e.preventDefault();
    setDragIdx(i);
  }, []);

  const moveDrag = useCallback((clientX, clientY) => {
    if (dragIdx === null || !imgRef.current || !bildeCanvas) return;
    const rect = imgRef.current.getBoundingClientRect();
    const { sx, sy } = getScale();
    const x = Math.max(0, Math.min(bildeCanvas.width, (clientX - rect.left) / sx));
    const y = Math.max(0, Math.min(bildeCanvas.height, (clientY - rect.top) / sy));
    setHjørner(prev => prev.map((p, idx) => idx === dragIdx ? { x, y } : p));
  }, [dragIdx, bildeCanvas]);

  const endDrag = useCallback(() => setDragIdx(null), []);

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mouseup", onUp); window.removeEventListener("touchend", onUp); };
  }, [endDrag]);

  // Non-passive touchmove: must be registered via addEventListener to allow preventDefault (React registers touch events as passive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      if (dragIdx === null) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) moveDrag(touch.clientX, touch.clientY);
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [dragIdx, moveDrag]);

  // ── Prosesser ──────────────────────────────────────────────────────────────
  const prosesser = async () => {
    setFeil(""); setSteg("prosesserer");
    try {
      // 1. Perspektivkorreksjon
      setLasterStatus("Korrigerer perspektiv …");
      const warped = warpCanvas(bildeCanvas, hjørner);

      // 2. OCR via Claude Vision – bruker det perspektivkorrigerte originalbildet direkte
      setLasterStatus("Leser tekst med AI …");
      let tekst = "";
      try {
        const ocrCv = document.createElement("canvas");
        const ocrMax = 1400;
        const ocrScale = Math.min(1, ocrMax / Math.max(warped.width, warped.height));
        ocrCv.width = Math.round(warped.width * ocrScale);
        ocrCv.height = Math.round(warped.height * ocrScale);
        ocrCv.getContext("2d").drawImage(warped, 0, 0, ocrCv.width, ocrCv.height);
        const dataUrl = ocrCv.toDataURL("image/jpeg", 0.92);
        const b64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

        const ocrCtrl = new AbortController();
        const ocrTid = setTimeout(() => ocrCtrl.abort(), 60000);
        try {
          const r = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: "Du er en OCR-assistent. Trekk ut ALL tekst fra dette dokumentbildet nøyaktig slik den fremstår. Bevar linjeskift og avsnitt. Svar kun med den ekstraherte teksten – ingen forklaring eller kommentar. Hvis det ikke finnes lesbar tekst, svar med tom streng.",
              image: { data: b64, media_type: "image/jpeg" },
              max_tokens: 2000,
            }),
            signal: ocrCtrl.signal,
          });
          if (r.ok) {
            const d = await r.json();
            tekst = (d?.text || "").trim();
          } else {
            const errData = await r.json().catch(() => null);
            console.warn("[OCR API feil]", r.status, errData?.error || "ukjent feil");
          }
        } finally {
          clearTimeout(ocrTid);
        }
      } catch (ocrErr) {
        console.warn("[OCR]", ocrErr);
      }
      setOcrTekst(tekst);

      // 3. Lag PDF (A4-format, bilde skalert til å passe)
      setLasterStatus("Genererer PDF …");
      const { jsPDF } = await import("jspdf");
      const erLandskap = warped.width > warped.height;
      const a4w = erLandskap ? 297 : 210;
      const a4h = erLandskap ? 210 : 297;
      // Bruk PNG – universelt støttet i alle nettlesere (JPEG kan gi blankt ark på Safari/iOS)
      const dataUrl = warped.toDataURL("image/png");
      if (!dataUrl || dataUrl === "data:,") throw new Error("Kunne ikke lese bildepikslene");
      // Sikre at dimensjonene er gyldige før vi regner ut ratio
      const pxW = warped.width || 1, pxH = warped.height || 1;
      const ratio = Math.min(a4w / pxW, a4h / pxH);
      const imgW = Math.round(pxW * ratio * 10) / 10;
      const imgH = Math.round(pxH * ratio * 10) / 10;
      const pdf = new jsPDF({ orientation: erLandskap ? "l" : "p", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH);
      if (tekst) {
        pdf.addPage();
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const linjer = pdf.splitTextToSize(tekst, 180);
        pdf.text(linjer, 15, 15);
      }
      const pdfBlob = pdf.output("blob");

      // 4. Last opp til Supabase Storage (med fallback til lokal nedlasting)
      setLasterStatus("Laster opp til skyen …");
      let publicUrl = null;
      if (supabase) {
        try {
          const filnavn = `skanner/${aktivBruker?.id || "anon"}/${Date.now()}_skan.pdf`;
          const { error: upErr } = await supabase.storage
            .from("boker-filer")
            .upload(filnavn, pdfBlob, { contentType: "application/pdf" });
          if (upErr) throw upErr;
          const { data } = supabase.storage.from("boker-filer").getPublicUrl(filnavn);
          publicUrl = data?.publicUrl || null;
        } catch (upErr) {
          console.warn("[DokumentSkanner] Supabase-opplasting feilet, laster ned lokalt:", upErr);
        }
      }
      // Alltid last ned lokalt som backup
      if (!publicUrl) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skannet-dokument-${Date.now()}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      setLagretUrl(publicUrl);

      // 5. Bygg dokument-data og send til forelder for lagring i lokal dokumentasjonsliste
      const idag = new Date().toISOString().slice(0, 10);
      const ts = new Date().toISOString();
      const dokData = {
        tittel: "📷 Skannet dokument",
        dato: idag,
        fag: [],
        fortelling: tekst || "(Ingen lesbar tekst funnet i dokumentet)",
        refleksjon: "",
        opprettet: ts,
        oppdatert: ts,
        fil_url: publicUrl,
      };

      setSteg("ferdig");
      if (onFerdig) setTimeout(() => onFerdig(dokData), 1800);
    } catch (e) {
      setFeil("Noe gikk galt: " + (e.message || "ukjent feil"));
      setSteg("beskjær");
    } finally {
      setLasterStatus("");
    }
  };

  const startNytt = () => {
    setBildeSrc(null); setBildeCanvas(null); setHjørner(null);
    setOcrTekst(""); setLagretUrl(null);
    setFeil(""); setSteg("fangst");
  };

  const stegIdx = STEG.indexOf(steg);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", color: "#1a2c45" }}>
      <style>{CSS}</style>

      {/* Tittel */}
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1a2c45", marginBottom: 3 }}>
        📷 Dokumentskanner
      </div>
      <p style={{ color: "#5d7390", fontSize: 12, marginBottom: 18 }}>
        Skann dokumenter med kamera – automatisk perspektivkorreksjon, OCR og lagring som PDF
      </p>

      {/* Steg-indikator */}
      <div className="ds-steg-ind">
        {["📷 Fangst", "✂️ Beskjær", "⚙️ Prosesserer", "✅ Ferdig"].map((s, i) => (
          <div key={i} className={`ds-steg-dot ${i < stegIdx ? "ferdig" : i === stegIdx ? "aktiv" : ""}`}
            title={s} />
        ))}
      </div>

      {/* Feilmelding */}
      {feil && (
        <div style={{ background: "#fdecea", borderLeft: "4px solid #c62828", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#c62828", fontWeight: 700, fontSize: 13 }}>
          ⚠️ {feil}
        </div>
      )}

      {/* ── STEG 1: FANGST ── */}
      {steg === "fangst" && (
        <div className="ds-kort">
          <p style={{ color: "#3d5a7a", fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
            Fotografer et dokument, notat, kvittering eller tegning. Appen retter perspektivet, leser teksten og lagrer som PDF i skyen.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="ds-btn ds-btn-prim" style={{ width: "100%" }}
              onClick={() => {
                fileRef.current.setAttribute("capture", "environment");
                fileRef.current.click();
              }}>
              📷 Ta bilde med kamera
            </button>
            <button className="ds-btn ds-btn-sek" style={{ width: "100%" }}
              onClick={() => {
                fileRef.current.removeAttribute("capture");
                fileRef.current.click();
              }}>
              🖼️ Velg bilde fra galleri
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { if (e.target.files?.[0]) handleFil(e.target.files[0]); e.target.value = ""; }} />
          <div className="ds-info" style={{ marginTop: 18 }}>
            💡 <strong>Tips:</strong> Legg dokumentet på mørk bakgrunn. Hold telefonen rett over og unngå skygger for best resultat.
          </div>
        </div>
      )}

      {/* ── STEG 2: BESKJÆR ── */}
      {steg === "beskjær" && bildeSrc && hjørner && (
        <>
          <div className="ds-kort" style={{ padding: 14 }}>
            <p style={{ fontSize: 13, color: "#3d5a7a", marginBottom: 12, lineHeight: 1.6 }}>
              Dra de <strong>blå hjørnene</strong> til kantene av dokumentet. Appen retter perspektivet automatisk.
            </p>

            {/* Bilde med overlay */}
            <div
              ref={containerRef}
              className="ds-bilde-wrap"
              onMouseMove={e => moveDrag(e.clientX, e.clientY)}
            >
              <img ref={imgRef} src={bildeSrc} alt="Dokument" draggable={false} />

              {/* SVG polygon overlay */}
              <svg className="ds-overlay-svg"
                viewBox={`0 0 ${bildeCanvas.width} ${bildeCanvas.height}`}
                preserveAspectRatio="none">
                <polygon
                  points={hjørner.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(65,120,189,0.12)"
                  stroke="#4178bd"
                  strokeWidth={Math.max(3, bildeCanvas.width / 150)}
                  strokeDasharray={`${bildeCanvas.width / 35} ${bildeCanvas.width / 70}`}
                />
              </svg>

              {/* Draggable corner handles */}
              {hjørner.map((pt, i) => {
                const { sx, sy } = getScale();
                return (
                  <div key={i} className="ds-hjorne"
                    style={{ left: pt.x * sx, top: pt.y * sy }}
                    onMouseDown={e => startDrag(e, i)}
                    onTouchStart={e => startDrag(e, i)}>
                    <div className="ds-hjorne-inner" />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="ds-btn ds-btn-sek" onClick={startNytt} style={{ flex: 1 }}>
              ← Avbryt
            </button>
            <button className="ds-btn ds-btn-prim" onClick={prosesser} style={{ flex: 2 }}>
              ✂️ Beskjær og prosesser
            </button>
          </div>
        </>
      )}

      {/* ── STEG 3: PROSESSERER ── */}
      {steg === "prosesserer" && (
        <div className="ds-kort" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div className="ds-spinn" style={{ margin: "0 auto 18px" }} />
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
            {lasterStatus || "Prosesserer …"}
          </div>
          <div className="ds-info" style={{ marginTop: 20, textAlign: "left", maxWidth: 320, margin: "20px auto 0" }}>
            AI leser teksten fra dokumentet. Dette tar vanligvis 5–15 sekunder.
          </div>
        </div>
      )}

      {/* ── STEG 4: FERDIG ── */}
      {steg === "ferdig" && (
        <>
          <div className="ds-kort" style={{ background: "#d8f3dc", borderColor: "#52b788" }}>
            <div style={{ fontWeight: 800, color: "#1b5e47", fontSize: 15, marginBottom: 10 }}>
              ✅ Dokument skannet og lagret i skyen!
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {lagretUrl && (
                <a href={lagretUrl} target="_blank" rel="noopener noreferrer"
                  className="ds-btn ds-btn-grn" style={{ textDecoration: "none" }}>
                  📄 Åpne PDF
                </a>
              )}
              <button className="ds-btn ds-btn-sek" onClick={startNytt}>
                📷 Skann nytt
              </button>
            </div>
          </div>

          {ocrTekst ? (
            <div className="ds-kort">
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📝 Lest tekst (OCR)</span>
                <button
                  className="ds-btn ds-btn-sek"
                  style={{ padding: "5px 11px", fontSize: 12 }}
                  onClick={() => navigator.clipboard?.writeText(ocrTekst)}>
                  📋 Kopier
                </button>
              </div>
              <div className="ds-ocr-tekst">{ocrTekst}</div>
              <div className="ds-info" style={{ marginTop: 10 }}>
                ☁️ Teksten er også lagret i <strong>Dokumentasjon</strong> for enkel gjenfinning.
              </div>
            </div>
          ) : (
            <div className="ds-kort">
              <div style={{ color: "#5d7390", fontSize: 13 }}>
                Ingen tekst ble gjenkjent (bildet kan være utydelig eller utelukkende grafisk). PDF er likevel lagret.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

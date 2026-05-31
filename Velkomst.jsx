import { useEffect, useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }

  @keyframes vh-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vh-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes vh-pulse {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50%       { opacity: 0.2;  transform: scale(1.08); }
  }
  @keyframes vh-badge {
    from { opacity: 0; transform: scale(0.85) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .vh-root {
    min-height: 100vh;
    background: linear-gradient(160deg, #1a3558 0%, #2c5b8e 42%, #3a72b0 72%, #5b90cc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    position: relative;
    overflow: hidden;
  }

  .vh-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    animation: vh-pulse 7s ease-in-out infinite;
  }

  .vh-card {
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 28px;
    box-shadow:
      0 28px 72px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    padding: 48px 44px 44px;
    max-width: 540px;
    width: 100%;
    text-align: center;
    animation: vh-fadeUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    position: relative;
    z-index: 1;
  }

  .vh-logo-wrap {
    display: inline-block;
    animation: vh-float 5s ease-in-out infinite;
    margin-bottom: 10px;
  }
  .vh-logo-icon {
    font-size: 66px;
    line-height: 1;
    filter: drop-shadow(0 6px 18px rgba(255, 255, 255, 0.25));
  }

  .vh-title {
    font-family: 'Fredoka One', cursive;
    font-size: 38px;
    color: #ffffff;
    margin: 0 0 5px;
    letter-spacing: 0.4px;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.22);
    animation: vh-fadeUp 0.7s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .vh-tagline {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 2.2px;
    text-transform: uppercase;
    margin-bottom: 30px;
    animation: vh-fadeUp 0.6s 0.18s ease both;
  }

  .vh-divider {
    width: 52px;
    height: 3px;
    background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08));
    border-radius: 2px;
    margin: 0 auto 30px;
    animation: vh-fadeUp 0.5s 0.22s ease both;
  }

  .vh-text {
    font-size: 16.5px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.75;
    font-weight: 500;
    margin-bottom: 34px;
    animation: vh-fadeUp 0.6s 0.28s ease both;
  }

  .vh-features {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    justify-content: center;
    margin-bottom: 38px;
  }

  .vh-badge {
    background: rgba(255, 255, 255, 0.13);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 22px;
    padding: 6px 15px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.92);
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    opacity: 0;
    animation: vh-badge 0.4s ease forwards;
  }

  .vh-btn {
    width: 100%;
    padding: 17px;
    font-size: 16px;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(255,255,255,0.97), rgba(235,244,255,0.95));
    color: #1f4068;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
    transition: all 0.2s ease;
    letter-spacing: 0.2px;
    animation: vh-fadeUp 0.6s 0.55s ease both;
    position: relative;
    overflow: hidden;
  }
  .vh-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 60%, rgba(44,91,142,0.07));
    pointer-events: none;
  }
  .vh-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
    background: #ffffff;
  }
  .vh-btn:active:not(:disabled) { transform: translateY(0); }
  .vh-btn:disabled {
    opacity: 0.75;
    cursor: default;
  }

  .vh-btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .vh-spinner {
    width: 17px;
    height: 17px;
    border: 2.5px solid rgba(31,64,104,0.25);
    border-top-color: #1f4068;
    border-radius: 50%;
    animation: vh-spin 0.75s linear infinite;
    flex-shrink: 0;
  }
  @keyframes vh-spin { to { transform: rotate(360deg); } }

  .vh-footer {
    margin-top: 22px;
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
    letter-spacing: 0.4px;
    animation: vh-fadeUp 0.5s 0.65s ease both;
  }

  @media (max-width: 520px) {
    .vh-card   { padding: 38px 22px 34px; }
    .vh-title  { font-size: 32px; }
    .vh-logo-icon { font-size: 54px; }
    .vh-text   { font-size: 15px; }
    .vh-btn    { padding: 15px; font-size: 15px; }
  }
`;

const FEATURES = [
  "📋 Aktiviteter",
  "🎵 Sanger",
  "✏️ Tegneark",
  "📖 Rammeplan",
  "🤖 AI-hjelp",
  "📅 Ukeplaner",
];

export default function Velkomst({ onStart, sjekkSesjon }) {
  const [synlig, setSynlig] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSynlig(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="vh-root">
        {/* Dekorative bakgrunnsblobs */}
        <div
          className="vh-blob"
          style={{
            width: 480, height: 480,
            background: "#5b90cc",
            top: -140, right: -120,
            animationDelay: "0s",
          }}
        />
        <div
          className="vh-blob"
          style={{
            width: 340, height: 340,
            background: "#52b788",
            bottom: -100, left: -80,
            animationDelay: "2.5s",
          }}
        />
        <div
          className="vh-blob"
          style={{
            width: 220, height: 220,
            background: "#4178bd",
            top: "55%", left: "65%",
            animationDelay: "1.2s",
          }}
        />

        {synlig && (
          <div className="vh-card">
            {/* Logo */}
            <div className="vh-logo-wrap">
              <div className="vh-logo-icon">🌿</div>
            </div>

            <h1 className="vh-title">Barnehagehjelpen</h1>
            <p className="vh-tagline">Planleggingsverktøy for alle barnehager</p>
            <div className="vh-divider" />

            {/* Hoveddtekst */}
            <p className="vh-text">
              Barnehagehjelpen er et pedagogisk verktøy bygget med rammeplanen
              i bunn, som hjelper barnehager med planlegging, aktiviteter og
              det pedagogiske arbeidet.
            </p>

            {/* Feature-badges */}
            <div className="vh-features">
              {FEATURES.map((f, i) => (
                <span
                  key={f}
                  className="vh-badge"
                  style={{ animationDelay: `${0.32 + i * 0.07}s` }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Hovedknapp */}
            <button
              className="vh-btn"
              onClick={onStart}
              disabled={sjekkSesjon}
            >
              <span className="vh-btn-inner">
                {sjekkSesjon ? (
                  <>
                    <span className="vh-spinner" />
                    Laster …
                  </>
                ) : (
                  <>🌿 Åpne Barnehagehjelpen</>
                )}
              </span>
            </button>

            <p className="vh-footer">Tilpasset norsk barnehagepraksis · Rammeplan 2017</p>
            <p className="vh-footer" style={{marginTop:6,opacity:0.55}}>Kilde: Utdanningsdirektoratet, Rammeplan for barnehagen 2017</p>
          </div>
        )}
      </div>
    </>
  );
}

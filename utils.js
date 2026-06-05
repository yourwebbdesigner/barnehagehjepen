// ─── Delte hjelpefunksjoner brukt på tvers av komponenter ───

export const C = {
  g:"var(--c-g)", lg:"var(--c-lg)", mint:"var(--c-mint)", bg:"var(--c-bg)",
  yl:"var(--c-yl)", w:"var(--c-w)", t:"var(--c-t)", gr:"var(--c-gr)", lg2:"var(--c-lg2)"
};

export const escapeHTML = (s) =>
  String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export const mdToHtml = (s) =>
  escapeHTML(s).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

export const stripMd = (s) =>
  String(s || "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/^#{1,3}\s+/gm, "").replace(/^[-*]\s+/gm, "• ");

export function skrivUtVindu(html, tittel = "Barnehagehjelpen") {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Popup ble blokkert av nettleseren. Tillat popup for barnehagehjelpen.pages.dev for å skrive ut.");
    return;
  }
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

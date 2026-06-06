import { supabase } from "./supabase.js";
import { stripMd } from './utils.js';
// ═══════════════════════════════════════════
//  AUTH MODUL – Supabase Auth
// ═══════════════════════════════════════════

export const storageStatus = { persistent: true, diagnostisert: true, detaljer: "Supabase Auth" };
export async function diagnostiserStorage() { return storageStatus; }

// Helper: hent brukerprofil fra user_profiles – maks 4s timeout
export async function hentProfil(userId) {
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
export function byggBruker(user, profil) {
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

export function skrivUtGenerell({ tittel, meta, seksjoner, logoTekst }) {
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

export async function lastNedPlanPDF({ tittel, meta, seksjoner, logoTekst }) {
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

export async function registrerBruker({ brukernavn, epost, passord, telefon }) {
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

export async function loggInnBruker({ epost, passord }) {
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

export async function sendTilbakestillEpost(epost) {
  const { error } = await supabase.auth.resetPasswordForEmail(epost.trim().toLowerCase(), {
    redirectTo: window.location.origin,
  });
  if (error) return { ok: false, feil: error.message };
  return { ok: true };
}

export async function hentSesjon() {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  const profil = await hentProfil(data.session.user.id);
  return byggBruker(data.session.user, profil);
}

export async function slettSesjon() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[slettSesjon]", error.message);
}

// ─── Profilendringer ───
export async function oppdaterVisningsnavn(brukerId, nyttNavn) {
  const navn = (nyttNavn || "").trim();
  const { error } = await supabase.from("user_profiles").update({ visningsnavn: navn, display_name: navn }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Kunne ikke oppdatere visningsnavn" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

export function publiskBruker(u) {
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
export function validerTelefon(tlf) {
  const t = String(tlf || "").trim();
  if (t === "") return { ok: true, renset: "" };
  const renset = t.replace(/\s+/g, " ");
  if (!/^[+0-9 ]+$/.test(renset)) return { ok: false, feil: "Telefonnummer kan kun inneholde sifre, mellomrom og +" };
  const sifre = renset.replace(/[^0-9]/g, "");
  if (sifre.length < 6) return { ok: false, feil: "Telefonnummer er for kort" };
  if (sifre.length > 15) return { ok: false, feil: "Telefonnummer er for langt" };
  return { ok: true, renset };
}

export async function oppdaterTelefon(brukerId, nyTelefon) {
  const v = validerTelefon(nyTelefon);
  if (!v.ok) return { ok: false, feil: v.feil };
  const { error } = await supabase.from("user_profiles").update({ phone: v.renset }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

export async function oppdaterAvatar(brukerId, emoji) {
  const { error } = await supabase.from("user_profiles").update({ avatar: emoji }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

// Bildekomprimering: leser fil, beskjærer kvadratisk (sentrert), skalerer til maxSize, returnerer JPEG data-URL
export async function komprimerBilde(file, maxSize = 400, quality = 0.85) {
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

export async function oppdaterProfilbilde(brukerId, dataUrl) {
  const update = dataUrl === null ? { profilbilde: null } : { profilbilde: dataUrl };
  const { error } = await supabase.from("user_profiles").update(update).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet – bildet er kanskje for stort" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

export async function oppdaterBrukernavn(brukerId, nyttBrukernavn) {
  const navn = (nyttBrukernavn || "").trim();
  if (navn.length < 3) return { ok: false, feil: "Brukernavn må være minst 3 tegn" };
  const { error } = await supabase.from("user_profiles").update({ brukernavn: navn }).eq("id", brukerId);
  if (error) return { ok: false, feil: "Lagring feilet" };
  const profil = await hentProfil(brukerId);
  const { data } = await supabase.auth.getUser();
  return { ok: true, bruker: data.user ? byggBruker(data.user, profil) : null };
}

export async function oppdaterEpost(brukerId, nyEpost) {
  const epost = (nyEpost || "").trim().toLowerCase();
  if (!epost.includes("@") || !epost.includes(".")) return { ok: false, feil: "Ugyldig e-postadresse" };
  const { error } = await supabase.auth.updateUser({ email: epost });
  if (error) return { ok: false, feil: error.message };
  // Oppdaterer IKKE user_profiles.epost her — Supabase sender bekreftelsesmail til ny adresse.
  // Profilen oppdateres automatisk via onAuthStateChange når brukeren bekrefter den nye adressen.
  return { ok: true, bekreftEpost: true };
}

export async function oppdaterPassord(brukerId, gammeltPassord, nyttPassord) {
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
export function passordStyrke(p) {
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

export const AVATAR_VALG = ["👤","🌿","🌸","🌻","🌳","🌈","🐰","🐱","🐶","🐻","🦊","🐼","🐨","🐯","🦁","🐸","🐧","🦉","🦋","🐞","🌞","🌙","⭐","🎨","🎵","📚","🍎","🌺","🎯","✨","🦄","🐢"];



// ─── Felles planTema per bruker – lagres i user_profiles ───
export async function hentPlanTema(brukerId) {
  if (!brukerId) return "";
  try {
    const { data } = await supabase.from("user_profiles").select("plan_tema").eq("id", brukerId).single();
    return data?.plan_tema || "";
  } catch { return ""; }
}
export async function lagrePlanTema(brukerId, tema) {
  if (!brukerId) return;
  try {
    await supabase.from("user_profiles").update({ plan_tema: tema || null }).eq("id", brukerId);
  } catch(e) { console.error("[planTema] Lagring feilet:", e); }
}

// ─── Favoritter per bruker ───
export function tomFav() { return { sanger: [], aktiviteter: [], tegneark: [] }; }
export async function hentFavoritter(brukerId) {
  if (!brukerId) return tomFav();
  try {
    const { data } = await supabase.from("favoritter").select("sanger,aktiviteter,tegneark").eq("user_id", brukerId).maybeSingle();
    return data ? { sanger: data.sanger||[], aktiviteter: data.aktiviteter||[], tegneark: data.tegneark||[] } : tomFav();
  } catch { return tomFav(); }
}
export async function lagreFavoritter(brukerId, fav) {
  if (!brukerId) return;
  try {
    await supabase.from("favoritter").upsert({ user_id: brukerId, sanger: fav.sanger||[], aktiviteter: fav.aktiviteter||[], tegneark: fav.tegneark||[], updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch(e) { console.error("[Favoritter]", e); }
}

// ─── Dokumentasjon (praksisfortellinger og refleksjoner) per bruker ───
export async function hentDokumentasjon(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("dokumentasjon").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    return (data||[]).map(r => r.payload).filter(Boolean);
  } catch { return []; }
}
export async function lagreDokumentasjon(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { data: eks, error: lesErr } = await supabase.from("dokumentasjon").select("id").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleIds = (eks||[]).map(r => r.id);

    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("dokumentasjon").insert(liste.map(d => ({ user_id: brukerId, payload: d })));
      if (insertErr) throw insertErr;
    }

    if (gamleIds.length > 0) {
      await supabase.from("dokumentasjon").delete().in("id", gamleIds);
    }
    return true;
  } catch(e) { console.error("[Dokumentasjon] Lagring feilet:", e); return false; }
}

// ─── Ukeplaner per bruker ───
export async function hentUkeplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("ukeplaner").select("id,payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    // Dedupliser på payload.id i tilfelle en tidligere lagring la igjen duplikater
    const sett = new Map();
    for (const r of (data||[])) {
      const p = r.payload;
      if (!p) continue;
      const key = p.id || r.id;
      if (!sett.has(key)) sett.set(key, p);
    }
    return [...sett.values()];
  } catch { return []; }
}
// Sjekk om noen (på en annen enhet/tab) lagret planer etter at denne sesjonen lastet data.
// Returnerer true = konflikt oppdaget, false = trygt å lagre.
export async function sjekkPlanKonflikt(brukerId, tabell, sesjonsStart) {
  if (!brukerId || !sesjonsStart) return false;
  try {
    const { data } = await supabase
      .from(tabell)
      .select("created_at")
      .eq("user_id", brukerId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!data?.length) return false;
    return new Date(data[0].created_at) > new Date(sesjonsStart);
  } catch { return false; }
}

export async function lagreUkeplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    // Steg 1: Les eksisterende rad-IDer FØR vi endrer noe
    const { data: eks, error: lesErr } = await supabase.from("ukeplaner").select("id").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleIds = (eks||[]).map(r => r.id);

    // Steg 2: Sett inn NYE rader – hvis dette feiler, er gamle data fortsatt intakte
    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("ukeplaner").insert(liste.map(p => ({ user_id: brukerId, payload: p })));
      if (insertErr) throw insertErr;
    }

    // Steg 3: Slett GAMLE rader (nå som nye er trygt lagret)
    if (gamleIds.length > 0) {
      await supabase.from("ukeplaner").delete().in("id", gamleIds);
    }
    return true;
  } catch(e) { console.error("[Ukeplan] Lagring feilet:", e); return false; }
}

// ─── Årsplaner per bruker ───
export async function hentArsplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("arsplaner").select("id,payload").eq("user_id", brukerId).order("created_at", { ascending: false });
    const sett = new Map();
    for (const r of (data||[])) {
      const p = r.payload;
      if (!p) continue;
      const key = p.id || r.id;
      if (!sett.has(key)) sett.set(key, p);
    }
    return [...sett.values()];
  } catch { return []; }
}
export async function lagreArsplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { data: eks, error: lesErr } = await supabase.from("arsplaner").select("id").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleIds = (eks||[]).map(r => r.id);

    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("arsplaner").insert(liste.map(p => ({ user_id: brukerId, tittel: p.tittel||"", aar: parseInt(p.aar)||new Date().getFullYear(), payload: p })));
      if (insertErr) throw insertErr;
    }

    if (gamleIds.length > 0) {
      await supabase.from("arsplaner").delete().in("id", gamleIds);
    }
    return true;
  } catch(e) { console.error("[Årsplan] Lagring feilet:", e); return false; }
}

// ─── Månedsplaner per bruker ───
export async function hentMaanedsplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedsplaner").select("*").eq("user_id", brukerId).order("aar", { ascending: false }).order("maaned", { ascending: false });
    // Filtrer ut kalenderplaner (har egen funksjon) og dedupliser på tittel+aar+maaned
    const sett = new Map();
    for (const r of (data||[])) {
      let extra = {};
      try { extra = JSON.parse(r.innhold||"{}"); } catch {}
      if (extra.type === "kalender") continue; // Kalenderplaner håndteres separat
      const key = `${r.tittel}|${r.aar}|${r.maaned}`;
      if (!sett.has(key)) {
        sett.set(key, { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, tema: r.tema, fagomrader: r.fagomrader||[], opprettet: r.created_at, ...extra });
      }
    }
    return [...sett.values()];
  } catch { return []; }
}
export async function lagreMaanedsplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    // Les eksisterende ikke-kalender-rader
    const { data: eks, error: lesErr } = await supabase.from("maanedsplaner").select("id,innhold").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleIds = (eks||[]).filter(r => {
      try { return JSON.parse(r.innhold||"{}").type !== "kalender"; } catch { return true; }
    }).map(r => r.id);

    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("maanedsplaner").insert(liste.map(p => {
        const { id, tittel, aar, maaned, tema, fagomrader, opprettet, ...rest } = p;
        return { user_id: brukerId, tittel: tittel||"", aar: parseInt(aar)||new Date().getFullYear(), maaned: parseInt(maaned)||1, tema: tema||"", fagomrader: fagomrader||[], innhold: JSON.stringify(rest) };
      }));
      if (insertErr) throw insertErr;
    }

    if (gamleIds.length > 0) {
      await supabase.from("maanedsplaner").delete().in("id", gamleIds);
    }
    return true;
  } catch(e) { console.error("[Månedsplan] Lagring feilet:", e); return false; }
}

// ─── Månedsbrev per bruker ───
export async function hentMaanedsbrev(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedbrev").select("*").eq("user_id", brukerId).order("aar", { ascending: false }).order("maaned", { ascending: false });
    const sett = new Map();
    for (const r of (data||[])) {
      let extra = {};
      try { extra = JSON.parse(r.innhold||"{}"); } catch {}
      const key = `${r.tittel}|${r.aar}|${r.maaned}`;
      if (!sett.has(key)) {
        sett.set(key, { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, hilsen: r.hilsen, opprettet: r.created_at, ...extra });
      }
    }
    return [...sett.values()];
  } catch { return []; }
}
export async function lagreMaanedsbrev(brukerId, liste) {
  if (!brukerId) return false;
  try {
    const { data: eks, error: lesErr } = await supabase.from("maanedbrev").select("id").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleIds = (eks||[]).map(r => r.id);

    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("maanedbrev").insert(liste.map(b => {
        const { id, tittel, aar, maaned, hilsen, opprettet, ...rest } = b;
        return { user_id: brukerId, tittel: tittel||"", aar: parseInt(aar)||new Date().getFullYear(), maaned: parseInt(maaned)||1, hilsen: hilsen||"", innhold: JSON.stringify(rest) };
      }));
      if (insertErr) throw insertErr;
    }

    if (gamleIds.length > 0) {
      await supabase.from("maanedbrev").delete().in("id", gamleIds);
    }
    return true;
  } catch(e) { console.error("[Månedsbrev] Lagring feilet:", e); return false; }
}

// ── Månedskalender: egne Supabase-funksjoner (type:"kalender" i innhold-JSON) ──
export async function hentKalenderplaner(brukerId) {
  if (!brukerId) return [];
  try {
    const { data } = await supabase.from("maanedsplaner").select("*").eq("user_id", brukerId).order("aar",{ascending:false}).order("maaned",{ascending:false});
    const sett = new Map();
    for (const r of (data||[])) {
      let extra={};try{extra=JSON.parse(r.innhold||"{}");}catch{}
      if (extra.type !== "kalender") continue;
      const key = `${r.aar}|${r.maaned}`;
      if (!sett.has(key)) sett.set(key, {id:r.id,tittel:r.tittel,aar:r.aar,maaned:r.maaned,tema:r.tema||"",events:extra.events||{},opprettet:r.created_at});
    }
    return [...sett.values()];
  } catch { return []; }
}
export async function lagreKalenderplaner(brukerId, liste) {
  if (!brukerId) return false;
  try {
    // Les eksisterende kalender-rad-IDer FØR vi endrer noe
    const { data: eks, error: lesErr } = await supabase.from("maanedsplaner").select("id,innhold").eq("user_id", brukerId);
    if (lesErr) throw lesErr;
    const gamleKalIds = (eks||[]).filter(r=>{try{return JSON.parse(r.innhold||"{}").type==="kalender";}catch{return false;}}).map(r=>r.id);

    if (liste.length > 0) {
      const { error: insertErr } = await supabase.from("maanedsplaner").insert(liste.map(p=>({user_id:brukerId,tittel:p.tittel||"",aar:parseInt(p.aar)||new Date().getFullYear(),maaned:parseInt(p.maaned)||1,tema:p.tema||"",fagomrader:[],innhold:JSON.stringify({type:"kalender",events:p.events||{}})})));
      if (insertErr) throw insertErr;
    }

    if (gamleKalIds.length > 0) {
      await supabase.from("maanedsplaner").delete().in("id", gamleKalIds);
    }
    return true;
  } catch(e){console.error("[Kalender] Lagring feilet:",e);return false;}
}

// ── Aktivitetskort: Supabase CRUD ──
export async function hentAktivitetskort(userId) {
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
export async function lagreNyttAktivitetskort(payload) {
  const { id, ...insertData } = payload;
  const { data, error } = await supabase.from("activity_cards").insert([insertData]).select().single();
  if (error) throw error;
  return data;
}
export async function oppdaterAktivitetskort(id, oppdateringer) {
  const { data, error } = await supabase.from("activity_cards").update(oppdateringer).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function slettAktivitetskort(id) {
  const { error } = await supabase.from("activity_cards").delete().eq("id", id);
  if (error) throw error;
}
export async function hentKortFavoritter(userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase.from("activity_card_favorites").select("card_id").eq("user_id", userId);
  if (error) return new Set();
  return new Set((data || []).map(r => r.card_id));
}

// ═══════════════════════════════════════════
//  PERSONVERN / BRUKSVILKÅR – MODALER


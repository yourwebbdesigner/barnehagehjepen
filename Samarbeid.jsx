import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

// ══════════════════════════════════════════
//  KONSTANTER OG HJELPERE
// ══════════════════════════════════════════
const C = {
  g:"#2c5b8e", lg:"#3a72b0", mint:"#d8e6f5", bg:"#f3f7fc",
  w:"#ffffff", t:"#1a2c45", gr:"#5d7390", lg2:"#e8eff8",
};

const ROLLER = {
  eier:    { label:"Eier",          farge:"#1565c0", bg:"#e3f2fd", ikon:"👑" },
  rediger: { label:"Kan redigere",  farge:"#2e7d32", bg:"#e8f5e9", ikon:"✏️" },
  lese:    { label:"Kun lese",      farge:"#6a1b9a", bg:"#f3e5f5", ikon:"👁️" },
};

const PLANTYPE = {
  ukeplan:     { label:"Ukeplan",      ikon:"📅", kategori:"plan" },
  maanedsplan: { label:"Månedsplan",   ikon:"🗓️", kategori:"plan" },
  arsplan:     { label:"Årsplan",      ikon:"📋", kategori:"plan" },
  maanedsbrev: { label:"Månedsbrev",   ikon:"📨", kategori:"plan" },
  dokument:    { label:"Dokumentasjon",ikon:"📔", kategori:"annet" },
  skjema:      { label:"Skjema",       ikon:"✏️", kategori:"annet" },
  sang:        { label:"Sang/Rim",     ikon:"🎵", kategori:"annet" },
  tegneark:    { label:"Tegneark",     ikon:"🖍️", kategori:"annet" },
};

const datoKort = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("nb-NO", { day:"numeric", month:"short", year:"numeric" });
};

const datoTid = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("nb-NO", { day:"numeric", month:"short" }) +
    " kl. " + d.toLocaleTimeString("nb-NO", { hour:"2-digit", minute:"2-digit" });
};

// ══════════════════════════════════════════
//  SUPABASE HJELPEFUNKSJONER
// ══════════════════════════════════════════

async function hentMineDelte(brukerId) {
  const { data, error } = await supabase
    .from("delte_planer")
    .select("*")
    .eq("eier_id", brukerId)
    .order("oppdatert", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function hentDeltMedMeg(brukerId) {
  const { data, error } = await supabase
    .from("plan_tillatelser")
    .select("rolle, delte_planer(*)")
    .eq("bruker_id", brukerId)
    .neq("rolle", "eier");
  if (error) throw error;

  const planer = (data || [])
    .filter(r => r.delte_planer)
    .map(r => ({ ...r.delte_planer, min_rolle: r.rolle }));

  if (!planer.length) return [];

  const eierIds = [...new Set(planer.map(p => p.eier_id))];
  const { data: profiler } = await supabase
    .from("user_profiles")
    .select("id, visningsnavn, brukernavn, avatar")
    .in("id", eierIds);
  const pm = Object.fromEntries((profiler || []).map(p => [p.id, p]));
  return planer.map(p => ({ ...p, eier_profil: pm[p.eier_id] || null }));
}

async function hentTillatelser(deltPlanId) {
  const { data: t, error } = await supabase
    .from("plan_tillatelser")
    .select("bruker_id, rolle, opprettet")
    .eq("delt_plan_id", deltPlanId);
  if (error) throw error;
  if (!t?.length) return [];

  const { data: profiler } = await supabase
    .from("user_profiles")
    .select("id, visningsnavn, brukernavn, avatar")
    .in("id", t.map(r => r.bruker_id));
  const pm = Object.fromEntries((profiler || []).map(p => [p.id, p]));
  return t.map(r => ({ ...r, profil: pm[r.bruker_id] || null }));
}

async function hentInvitasjoner(deltPlanId) {
  const { data, error } = await supabase
    .from("plan_invitasjoner")
    .select("*")
    .eq("delt_plan_id", deltPlanId)
    .eq("akseptert", false)
    .order("opprettet", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function hentPendingInvites(epost) {
  if (!epost) return [];
  const { data, error } = await supabase
    .from("plan_invitasjoner")
    .select("*, delte_planer(id, plan_type, payload, eier_id)")
    .eq("epost", epost.toLowerCase())
    .eq("akseptert", false);
  if (error) return [];
  return data || [];
}

async function opprettDelPlan(plan, planType, brukerId) {
  const { data, error } = await supabase
    .from("delte_planer")
    .insert({
      plan_id:   plan.id || Date.now().toString(36),
      plan_type: planType,
      eier_id:   brukerId,
      payload:   plan,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("plan_tillatelser").insert({
    delt_plan_id: data.id,
    bruker_id:    brukerId,
    rolle:        "eier",
    lagt_til_av:  brukerId,
  });

  return data;
}

async function inviterBruker(deltPlanId, søk, rolle, invitasjonsEierId) {
  const trimmet = søk.trim();
  const lower   = trimmet.toLowerCase();

  // Søk etter bruker — epost og brukernavn i separate queries for å unngå
  // at spesialtegn i input brekker PostgREST OR-filteret
  const erEpost = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower);
  let profiler = [];
  if (erEpost) {
    const { data } = await supabase.from("user_profiles")
      .select("id, visningsnavn, brukernavn, epost")
      .eq("epost", lower).limit(1);
    profiler = data || [];
  } else {
    const { data } = await supabase.from("user_profiles")
      .select("id, visningsnavn, brukernavn, epost")
      .ilike("brukernavn", trimmet).limit(1);
    profiler = data || [];
  }

  const funnet = profiler?.[0];

  if (funnet) {
    if (funnet.id === invitasjonsEierId)
      throw new Error("Du kan ikke invitere deg selv");

    const { data: eks } = await supabase
      .from("plan_tillatelser")
      .select("id")
      .eq("delt_plan_id", deltPlanId)
      .eq("bruker_id", funnet.id)
      .maybeSingle();
    if (eks) throw new Error("Denne brukeren har allerede tilgang");

    const { error } = await supabase.from("plan_tillatelser").insert({
      delt_plan_id: deltPlanId,
      bruker_id:    funnet.id,
      rolle,
      lagt_til_av:  invitasjonsEierId,
    });
    if (error) throw error;
    return { type: "direkte", navn: funnet.visningsnavn || funnet.brukernavn };
  }

  // Ingen bruker funnet – prøv som e-postinvitasjon
  const epostRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostRegex.test(lower))
    throw new Error("Fant ingen bruker med det brukernavnet. Skriv en gyldig e-postadresse for å invitere.");

  const { data: eksInv } = await supabase
    .from("plan_invitasjoner")
    .select("id")
    .eq("delt_plan_id", deltPlanId)
    .eq("epost", lower)
    .eq("akseptert", false)
    .maybeSingle();
  if (eksInv) throw new Error("Invitasjon er allerede sendt til denne e-posten");

  const { error } = await supabase.from("plan_invitasjoner").insert({
    delt_plan_id: deltPlanId,
    epost:        lower,
    rolle,
  });
  if (error) throw error;
  return { type: "invitasjon", epost: lower };
}

async function aksepterInvitasjon(invId, brukerId, deltPlanId, rolle) {
  const { error: t } = await supabase.from("plan_tillatelser").insert({
    delt_plan_id: deltPlanId,
    bruker_id:    brukerId,
    rolle,
    lagt_til_av:  null,
  });
  if (t) throw t;
  const { error: invErr } = await supabase.from("plan_invitasjoner")
    .update({ akseptert: true, akseptert_av: brukerId })
    .eq("id", invId);
  if (invErr) console.error("Kunne ikke oppdatere invitasjonsstatus:", invErr.message);
}

async function oppdaterDelPlan(deltPlanId, payload, brukerId, brukerNavn) {
  // Lagre gammel versjon som snapshot
  const { data: gammel } = await supabase
    .from("delte_planer")
    .select("payload")
    .eq("id", deltPlanId)
    .single();

  if (gammel?.payload) {
    await supabase.from("plan_historikk").insert({
      delt_plan_id: deltPlanId,
      bruker_id:    brukerId,
      bruker_navn:  brukerNavn,
      payload:      gammel.payload,
    });
  }

  const { error } = await supabase
    .from("delte_planer")
    .update({ payload, oppdatert: new Date().toISOString() })
    .eq("id", deltPlanId);
  if (error) throw error;
}

async function hentHistorikk(deltPlanId) {
  const { data, error } = await supabase
    .from("plan_historikk")
    .select("*")
    .eq("delt_plan_id", deltPlanId)
    .order("opprettet", { ascending: false })
    .limit(15);
  if (error) throw error;
  return data || [];
}

async function fjernTillatelse(deltPlanId, brukerId) {
  const { error } = await supabase
    .from("plan_tillatelser")
    .delete()
    .eq("delt_plan_id", deltPlanId)
    .eq("bruker_id", brukerId);
  if (error) throw error;
}

async function oppdaterRolle(deltPlanId, brukerId, nyRolle) {
  const { error } = await supabase
    .from("plan_tillatelser")
    .update({ rolle: nyRolle })
    .eq("delt_plan_id", deltPlanId)
    .eq("bruker_id", brukerId);
  if (error) throw error;
}

async function slettDelPlan(deltPlanId) {
  const { error } = await supabase
    .from("delte_planer")
    .delete()
    .eq("id", deltPlanId);
  if (error) throw error;
}

async function hentAlleMinePlaner(brukerId) {
  // allSettled: én feil skal ikke stoppe alle andre typer fra å laste
  const results = await Promise.allSettled([
    supabase.from("ukeplaner").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false }),
    supabase.from("maanedsplaner").select("*").eq("user_id", brukerId).order("aar", { ascending: false }),
    supabase.from("arsplaner").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false }),
    supabase.from("maanedbrev").select("*").eq("user_id", brukerId).order("aar", { ascending: false }),
    supabase.from("dokumentasjon").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false }),
    supabase.from("skjemaer").select("payload").eq("user_id", brukerId).order("created_at", { ascending: false }),
    supabase.from("user_sanger").select("*").eq("user_id", brukerId).order("created_at", { ascending: false }),
    supabase.from("user_tegneark").select("*").eq("user_id", brukerId).order("created_at", { ascending: false }),
  ]);
  const val = (i) => results[i].status === "fulfilled" ? (results[i].value.data || []) : [];
  const [uk, ma, ar, mb, dok, sk, sang, ta] = [val(0),val(1),val(2),val(3),val(4),val(5),val(6),val(7)];

  // val() har allerede trukket ut .data, så uk/ma/ar etc. er direkte arrays
  const ukeplaner  = uk.map(r => r.payload).filter(Boolean);
  const arsplaner  = ar.map(r => r.payload).filter(Boolean);
  const dokumenter = dok.map(r => r.payload).filter(Boolean);
  const skjemaer   = sk.map(r => r.payload).filter(Boolean);

  const maanedsplaner = ma.map(r => {
    let extra = {};
    try { extra = JSON.parse(r.innhold || "{}"); } catch {}
    return { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, tema: r.tema, fagomrader: r.fagomrader || [], opprettet: r.created_at, ...extra };
  });

  const maanedsbrev = mb.map(r => {
    let extra = {};
    try { extra = JSON.parse(r.innhold || "{}"); } catch {}
    return { id: r.id, tittel: r.tittel, aar: r.aar, maaned: r.maaned, opprettet: r.created_at, ...extra };
  });

  const sanger   = sang.map(r => ({ id: r.id, tittel: r.tittel, tekst: r.tekst, kategori: r.kategori, alder: r.alder, melodi: r.melodi, tips: r.tips, rammeplan: r.rammeplan || [], opprettet: r.created_at }));
  const tegneark = ta.map(r => ({ id: r.id, tittel: r.tittel, ikon: r.ikon, oppgave: r.oppgave, samtale: r.samtale, mal: r.mal, kategori: r.kategori, alder: r.alder, rammeplan: r.rammeplan || [], opprettet: r.created_at }));

  return { ukeplaner, maanedsplaner, arsplaner, maanedsbrev, dokumenter, skjemaer, sanger, tegneark };
}

// ══════════════════════════════════════════
//  PRESENCE BAR
// ══════════════════════════════════════════
function PresenceBar({ presence, aktivBrukerId }) {
  const andre = presence.filter(p => p.bruker_id !== aktivBrukerId);
  if (!andre.length) return null;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px", background:"#e3f2fd", borderRadius:10, marginBottom:12, flexWrap:"wrap", border:"1px solid #90caf9" }}>
      <span style={{ fontSize:13, color:C.g, fontWeight:700 }}>👥 Inne nå:</span>
      {andre.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"#fff", borderRadius:20, padding:"3px 10px 3px 5px", boxShadow:"0 1px 4px rgba(44,91,142,0.10)" }}>
          <span style={{ fontSize:16 }}>{p.avatar || "👤"}</span>
          <span style={{ fontSize:12, fontWeight:700, color:C.t }}>{p.visningsnavn || "Ukjent"}</span>
          {p.skriver_i && <span style={{ fontSize:10, color:C.gr, fontStyle:"italic" }}>skriver...</span>}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════
//  DELT PLAN EDITOR (innholds-redigering)
// ══════════════════════════════════════════
function DeltPlanEditor({ planType, payload, kanRedigere, onChange }) {
  const inp = (val, setter, placeholder = "") => (
    <input type="text" value={val || ""} onChange={e => setter(e.target.value)} readOnly={!kanRedigere}
      placeholder={kanRedigere ? placeholder : ""}
      style={{ width:"100%", padding:"8px 11px", border:`1px solid ${C.mint}`, borderRadius:9, fontSize:13, fontFamily:"'Nunito',sans-serif", background:kanRedigere?"#fff":"#f9f9f9", color:C.t, boxSizing:"border-box" }} />
  );

  const txt = (val, setter, rader = 3, placeholder = "") => (
    <textarea value={val || ""} onChange={e => setter(e.target.value)} readOnly={!kanRedigere} rows={rader}
      placeholder={kanRedigere ? placeholder : ""}
      style={{ width:"100%", padding:"9px 11px", border:`1px solid ${C.mint}`, borderRadius:9, fontSize:13, resize:"vertical", fontFamily:"'Nunito',sans-serif", lineHeight:1.6, background:kanRedigere?"#fff":"#f9f9f9", color:C.t, boxSizing:"border-box" }} />
  );

  const felt = (label, barn) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 }}>{label}</div>
      {barn}
    </div>
  );

  const sett = (key, val) => onChange({ ...payload, [key]: val });

  // ── UKEPLAN ─────────────────────────────
  if (planType === "ukeplan") {
    const dager = payload.dager || {};
    const dagNavn  = ["mandag","tirsdag","onsdag","torsdag","fredag"];
    const dagLabel = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag"];
    const oppdaterDag = (dag, f, v) => onChange({
      ...payload, dager: { ...dager, [dag]: { ...(dager[dag] || {}), [f]: v } }
    });

    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Tittel", inp(payload.tittel, v => sett("tittel", v), "Tittel på ukeplan"))}
          {felt("Uke", inp(payload.uke, v => sett("uke", v), "Ukenummer"))}
        </div>
        {felt("Tema", inp(payload.tema, v => sett("tema", v), "Ukas tema"))}
        {dagNavn.map((dag, i) => (
          <div key={dag} style={{ background:"var(--c-w)", borderRadius:10, padding:"12px 14px", marginBottom:10, border:`1px solid ${C.mint}` }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.g, marginBottom:8 }}>{dagLabel[i]}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:6 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Formiddag</div>
                {txt(dager[dag]?.formiddag, v => oppdaterDag(dag, "formiddag", v), 2, "Aktiviteter formiddag")}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Ettermiddag</div>
                {txt(dager[dag]?.ettermiddag, v => oppdaterDag(dag, "ettermiddag", v), 2, "Aktiviteter ettermiddag")}
              </div>
            </div>
            <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Notat</div>
            {txt(dager[dag]?.notat, v => oppdaterDag(dag, "notat", v), 1, "Notat")}
          </div>
        ))}
      </div>
    );
  }

  // ── MÅNEDSPLAN ───────────────────────────
  if (planType === "maanedsplan") {
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("År",    inp(payload.aar,    v => sett("aar", v),    "2025"))}
          {felt("Måned", inp(payload.maaned, v => sett("maaned", v), "1–12"))}
        </div>
        {felt("Tema *", inp(payload.tema,   v => sett("tema", v),   "Temaet for måneden"))}
        {felt("Tittel", inp(payload.tittel, v => sett("tittel", v), "Valgfri tittel"))}
        {[1,2,3,4].map(u => felt(`Uke ${u}`, txt(payload[`uke${u}`], v => sett(`uke${u}`, v), 3, `Innhold for uke ${u}`)))}
        {felt("Notat", txt(payload.notat, v => sett("notat", v), 3, "Generelle notater"))}
      </div>
    );
  }

  // ── ÅRSPLAN ──────────────────────────────
  if (planType === "arsplan") {
    const seksjoner = [
      { id:"om_barnehagen",    label:"Om barnehagen" },
      { id:"verdigrunnlag",    label:"Verdigrunnlag" },
      { id:"pedagogisk_profil",label:"Pedagogisk profil" },
      { id:"omsorg_lek_laering",label:"Omsorg, lek og læring" },
      { id:"fagomrader",       label:"Fagområder" },
      { id:"samarbeid_foresatte",label:"Samarbeid med foresatte" },
      { id:"dokumentasjon_vurd",label:"Dokumentasjon og vurdering" },
      { id:"overganger",       label:"Overganger" },
    ];
    const mnd = ["august","september","oktober","november","desember","januar","februar","mars","april","mai","juni"];
    const s2  = payload.seksjoner || {};
    const ahj = payload.arshjul   || {};

    const settSeksjon = (id, v) => onChange({ ...payload, seksjoner: { ...s2, [id]: v } });
    const settHjul    = (m, f, v) => onChange({ ...payload, arshjul: { ...ahj, [m]: { ...(ahj[m]||{}), [f]: v } } });

    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Tittel",    inp(payload.tittel,    v => sett("tittel", v),    "Tittel på årsplan"))}
          {felt("Barnehage", inp(payload.barnehage, v => sett("barnehage", v), "Barnehagens navn"))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Avdeling",  inp(payload.avdeling,  v => sett("avdeling", v)))}
          {felt("År",        inp(payload.aar,        v => sett("aar", v),        "2025/2026"))}
        </div>

        <div style={{ fontWeight:800, fontSize:13, color:C.g, marginBottom:8, marginTop:4 }}>📝 Seksjoner</div>
        {seksjoner.map(s => felt(s.label, txt(s2[s.id], v => settSeksjon(s.id, v), 4)))}

        <div style={{ fontWeight:800, fontSize:13, color:C.g, marginBottom:8, marginTop:12 }}>📅 Årshjul</div>
        {mnd.map(m => (
          <div key={m} style={{ background:"var(--c-w)", borderRadius:10, padding:"10px 12px", marginBottom:8, border:`1px solid ${C.mint}` }}>
            <div style={{ fontWeight:800, fontSize:12, color:C.g, marginBottom:6, textTransform:"capitalize" }}>{m}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:4 }}>
              {["tema","aktiviteter"].map(f => (
                <div key={f}>
                  <div style={{ fontSize:10, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:3 }}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>
                  {txt(ahj[m]?.[f], v => settHjul(m, f, v), 2)}
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:3 }}>Notat</div>
            {txt(ahj[m]?.notat, v => settHjul(m, "notat", v), 1)}
          </div>
        ))}
      </div>
    );
  }

  // ── MÅNEDSBREV ───────────────────────────
  if (planType === "maanedsbrev") {
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("År",    inp(payload.aar,    v => sett("aar", v)))}
          {felt("Måned", inp(payload.maaned, v => sett("maaned", v)))}
        </div>
        {felt("Tittel",                inp(payload.tittel,   v => sett("tittel", v)))}
        {felt("Hva har vi gjort?",     txt(payload.gjort,    v => sett("gjort", v),    4))}
        {felt("Hva skjer fremover?",   txt(payload.kommende, v => sett("kommende", v), 4))}
        {felt("Praktisk informasjon",  txt(payload.praktisk, v => sett("praktisk", v), 3))}
        {felt("Hilsen",                txt(payload.hilsen,   v => sett("hilsen", v),   2))}
      </div>
    );
  }

  // ── DOKUMENTASJON ───────────────────────
  if (planType === "dokument") {
    const fagLabel = (Array.isArray(payload.fag) ? payload.fag : []).join(", ");
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Tittel", inp(payload.tittel, v => sett("tittel", v), "Tittel på dokumentasjonen"))}
          {felt("Dato",   inp(payload.dato,   v => sett("dato", v),   "ÅÅÅÅ-MM-DD"))}
        </div>
        {felt("Fagområder", inp(fagLabel, v => sett("fag", v.split(",").map(s => s.trim()).filter(Boolean)), "Fagområde-IDer, kommaseparert"))}
        {felt("Fortelling / praksisfortelling", txt(payload.fortelling,  v => sett("fortelling", v),  6, "Beskriv situasjonen..."))}
        {felt("Refleksjon",                      txt(payload.refleksjon,  v => sett("refleksjon", v),  4, "Hva tenker du om dette?"))}
      </div>
    );
  }

  // ── SKJEMA ───────────────────────────────
  if (planType === "skjema") {
    return (
      <div>
        {felt("Tittel",              inp(payload.tittel,     v => sett("tittel", v),     "Aktivitetens navn"))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Alder",    inp(payload.alder,    v => sett("alder", v),    "f.eks. 3–6 år"))}
          {felt("Kategori", inp(payload.kategori, v => sett("kategori", v), "f.eks. kreativ"))}
        </div>
        {felt("Hva gjør barna?",          txt(payload.hva,        v => sett("hva", v),        3, "Beskriv aktiviteten"))}
        {felt("Slik gjennomfører du det", txt(payload.hvordan,    v => sett("hvordan", v),    4, "Steg for steg..."))}
        {felt("Pedagogisk begrunnelse",   txt(payload.hvorfor,    v => sett("hvorfor", v),    3, "Læringsmål og rammeplantilknytning"))}
        {felt("Materialer",               inp(payload.materialer,  v => sett("materialer", v),  "Hva trengs?"))}
      </div>
    );
  }

  // ── SANG / RIM / REGLE ───────────────────
  if (planType === "sang") {
    return (
      <div>
        {felt("Tittel",   inp(payload.tittel,   v => sett("tittel", v),   "Sangens tittel"))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Type",  inp(payload.kategori, v => sett("kategori", v), "sang / rim / regle"))}
          {felt("Alder", inp(payload.alder,    v => sett("alder", v),    "f.eks. 3–6 år"))}
        </div>
        {felt("Melodi / melodi-hint", inp(payload.melodi, v => sett("melodi", v), "f.eks. «Byssan lull»"))}
        {felt("Tekst",                txt(payload.tekst,  v => sett("tekst", v),  8, "Skriv teksten her..."))}
        {felt("Tips til bruk",        txt(payload.tips,   v => sett("tips", v),   2, "Pedagogiske tips"))}
      </div>
    );
  }

  // ── TEGNEARK ─────────────────────────────
  if (planType === "tegneark") {
    return (
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Tittel",   inp(payload.tittel,   v => sett("tittel", v),   "Tegnearkets tittel"))}
          {felt("Ikon/emoji", inp(payload.ikon,   v => sett("ikon", v),     "🖍️"))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
          {felt("Kategori", inp(payload.kategori, v => sett("kategori", v), "f.eks. dyr, natur"))}
          {felt("Alder",    inp(payload.alder,    v => sett("alder", v),    "f.eks. 3–6 år"))}
        </div>
        {felt("Oppgave (4 steg)",     txt(payload.oppgave,  v => sett("oppgave", v),  3, "Tegn steg for steg..."))}
        {felt("Samtalespørsmål",      txt(payload.samtale,  v => sett("samtale", v),  3, "3 spørsmål til samtale"))}
        {felt("Læringsmål",           inp(payload.mal,      v => sett("mal", v),      "Ett læringsmål"))}
      </div>
    );
  }

  return <div style={{ color:C.gr, fontSize:13 }}>Ukjent innholdstype: {planType}</div>;
}

// ══════════════════════════════════════════
//  DELT PLAN VISNING (detail-view med faner)
// ══════════════════════════════════════════
function DeltPlanVisning({ plan, aktivBruker, minRolle, onTilbake, onOppdater, onSlett }) {
  const [tab,           setTab]           = useState("innhold");
  const [editPayload,   setEditPayload]   = useState(plan.payload || {});
  const [lagretPayload, setLagretPayload] = useState(plan.payload || {});
  const [lagrer,        setLagrer]        = useState(false);
  const [feil,          setFeil]          = useState("");
  const [toast,         setToast]         = useState("");
  const [presence,      setPresence]      = useState([]);
  const [historikk,     setHistorikk]     = useState([]);
  const [tillatelser,   setTillatelser]   = useState([]);
  const [invitasjoner,  setInvitasjoner]  = useState([]);
  const [inviterSøk,    setInviterSøk]    = useState("");
  const [inviterRolle,  setInviterRolle]  = useState("rediger");
  const [inviterer,     setInviterer]     = useState(false);
  const [søkeForslag,   setSøkeForslag]   = useState([]);
  const [visForslag,    setVisForslag]    = useState(false);
  const [eksternVar,    setEksternVar]    = useState(null);
  const [bekreftSlett,  setBekreftSlett]  = useState(false);
  const [sletter,       setSletter]       = useState(false);
  const channelRef = useRef(null);
  const søkTimer    = useRef(null);

  const vis        = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };
  const kanRedigere = minRolle === "eier" || minRolle === "rediger";
  const erEier      = minRolle === "eier";

  // Reset redigeringsdata når plan byttes
  useEffect(() => {
    setEditPayload(plan.payload || {});
    setLagretPayload(plan.payload || {});
    setTab("innhold");
    setFeil("");
    setEksternVar(null);
  }, [plan.id]);

  // Last tab-data separat
  useEffect(() => {
    if (tab === "tilgang" && erEier) {
      hentTillatelser(plan.id).then(setTillatelser).catch(console.error);
      hentInvitasjoner(plan.id).then(setInvitasjoner).catch(console.error);
    }
    if (tab === "historikk") {
      hentHistorikk(plan.id).then(setHistorikk).catch(console.error);
    }
  }, [tab, plan.id]);

  // Realtime: presence + postgres-endringer
  useEffect(() => {
    const kanal = supabase.channel(`delt-plan-${plan.id}`, {
      config: { presence: { key: aktivBruker.id } },
    });
    channelRef.current = kanal;

    kanal
      .on("presence", { event: "sync" }, () => {
        const state = kanal.presenceState();
        setPresence(Object.values(state).flat());
      })
      .on("postgres_changes", {
        event:  "UPDATE",
        schema: "public",
        table:  "delte_planer",
        filter: `id=eq.${plan.id}`,
      }, (evt) => {
        if (evt.new?.payload) setEksternVar(evt.new);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await kanal.track({
            bruker_id:   aktivBruker.id,
            visningsnavn: aktivBruker.visningsnavn || aktivBruker.brukernavn,
            avatar:      aktivBruker.avatar || "👤",
            skriver_i:   null,
          });
        }
      });

    return () => { kanal.unsubscribe(); };
  }, [plan.id, aktivBruker.id]);

  // Live brukersøk med debounce — viser forslag mens man skriver
  useEffect(() => {
    const tekst = inviterSøk.trim();
    if (tekst.length < 2) { setSøkeForslag([]); setVisForslag(false); return; }

    clearTimeout(søkTimer.current);
    søkTimer.current = setTimeout(async () => {
      try {
        const erEpostSøk = tekst.includes("@");
        let query = supabase.from("user_profiles")
          .select("id, visningsnavn, brukernavn, avatar")
          .neq("id", aktivBruker.id)
          .limit(6);

        if (erEpostSøk) {
          query = query.ilike("epost", `${tekst}%`);
        } else {
          // To separate queries for å unngå PostgREST OR spesialtegn-feil
          const [r1, r2] = await Promise.all([
            supabase.from("user_profiles").select("id, visningsnavn, brukernavn, avatar")
              .neq("id", aktivBruker.id).ilike("brukernavn", `%${tekst}%`).limit(6),
            supabase.from("user_profiles").select("id, visningsnavn, brukernavn, avatar")
              .neq("id", aktivBruker.id).ilike("visningsnavn", `%${tekst}%`).limit(6),
          ]);
          // Slå sammen og dedupliser
          const sett = new Map();
          [...(r1.data || []), ...(r2.data || [])].forEach(u => sett.set(u.id, u));
          const resultater = [...sett.values()].slice(0, 6);
          // Filtrer ut de som allerede har tilgang
          const harTilgang = new Set(tillatelser.map(t => t.bruker_id));
          setSøkeForslag(resultater.filter(u => !harTilgang.has(u.id)));
          setVisForslag(true);
          return;
        }

        const { data } = await query;
        const harTilgang = new Set(tillatelser.map(t => t.bruker_id));
        setSøkeForslag((data || []).filter(u => !harTilgang.has(u.id)));
        setVisForslag(true);
      } catch { setSøkeForslag([]); setVisForslag(false); }
    }, 280);

    return () => clearTimeout(søkTimer.current);
  }, [inviterSøk, aktivBruker.id, tillatelser]);

  const handleLagre = async () => {
    setLagrer(true); setFeil("");
    try {
      await oppdaterDelPlan(
        plan.id, editPayload,
        aktivBruker.id,
        aktivBruker.visningsnavn || aktivBruker.brukernavn
      );
      vis("✅ Lagret!");
      setLagretPayload(editPayload);
      onOppdater(plan.id, editPayload);
    } catch (e) {
      setFeil("Kunne ikke lagre: " + (e.message || "ukjent feil"));
    } finally {
      setLagrer(false);
    }
  };

  const handleInviter = async () => {
    if (!inviterSøk.trim()) return;
    setInviterer(true); setFeil("");
    try {
      const res = await inviterBruker(plan.id, inviterSøk, inviterRolle, aktivBruker.id);
      setInviterSøk("");
      if (res.type === "direkte")
        vis(`✅ ${res.navn} lagt til som "${ROLLER[inviterRolle].label}"`);
      else
        vis(`📧 Invitasjon lagret for ${res.epost} – de ser den neste gang de logger inn`);

      const [nt, ni] = await Promise.all([
        hentTillatelser(plan.id),
        hentInvitasjoner(plan.id),
      ]);
      setTillatelser(nt);
      setInvitasjoner(ni);
    } catch (e) {
      setFeil(e.message || "Kunne ikke invitere");
    } finally {
      setInviterer(false);
    }
  };

  const handleFjernBruker = async (brukerId) => {
    try {
      await fjernTillatelse(plan.id, brukerId);
      setTillatelser(prev => prev.filter(t => t.bruker_id !== brukerId));
      vis("Bruker fjernet");
    } catch (e) { setFeil("Kunne ikke fjerne bruker"); }
  };

  const handleRolleEndring = async (brukerId, nyRolle) => {
    try {
      await oppdaterRolle(plan.id, brukerId, nyRolle);
      setTillatelser(prev => prev.map(t => t.bruker_id === brukerId ? { ...t, rolle: nyRolle } : t));
      vis("Rolle oppdatert");
    } catch (e) { setFeil("Kunne ikke endre rolle"); }
  };

  const handleGjenopprett = async (snapshot) => {
    if (!window.confirm("Gjenopprette denne versjonen? Gjeldende innhold lagres i historikken.")) return;
    setLagrer(true);
    try {
      await oppdaterDelPlan(plan.id, snapshot.payload, aktivBruker.id, aktivBruker.visningsnavn || aktivBruker.brukernavn);
      setEditPayload(snapshot.payload);
      onOppdater(plan.id, snapshot.payload);
      setHistorikk(await hentHistorikk(plan.id));
      vis("✅ Versjon gjenopprettet!");
    } catch (e) { setFeil("Kunne ikke gjenopprette"); }
    finally { setLagrer(false); }
  };

  const handleSlettPlan = async () => {
    setSletter(true);
    try {
      await slettDelPlan(plan.id);
      onSlett(plan.id);
    } catch (e) {
      setFeil("Kunne ikke slette plan");
      setSletter(false);
      setBekreftSlett(false);
    }
  };

  const planInfo  = PLANTYPE[plan.plan_type] || { label: plan.plan_type, ikon: "📄" };
  const planTittel = plan.payload?.tittel || `${planInfo.label} (uten tittel)`;

  return (
    <div className="fade">
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:70, right:20, zIndex:200, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>
          {toast}
        </div>
      )}

      {/* Ekstern oppdatering-banner */}
      {eksternVar && (
        <div style={{ background:"#fff3e0", border:"1px solid #ffb74d", borderRadius:10, padding:"12px 14px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:13, color:"#e65100", fontWeight:700 }}>
            ⚠️ En annen bruker har lagret endringer i denne planen
          </span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn" onClick={() => { setEditPayload(eksternVar.payload); setEksternVar(null); }}
              style={{ background:"#ff9800", color:"#fff", padding:"6px 12px", fontSize:12 }}>
              Last inn ny versjon
            </button>
            <button className="btn" onClick={() => setEksternVar(null)}
              style={{ background:"#e0e0e0", color:C.t, padding:"6px 12px", fontSize:12 }}>
              Behold mine endringer
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <button className="btn" onClick={onTilbake}
          style={{ background:C.lg2, color:C.g, padding:"7px 12px", fontSize:12, fontWeight:700 }}>
          ← Tilbake
        </button>
        <span style={{ fontSize:20 }}>{planInfo.ikon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:16, color:C.t, wordBreak:"break-word" }}>{planTittel}</div>
          <div style={{ fontSize:11, color:C.gr, marginTop:2 }}>
            {planInfo.label} · Oppdatert {datoKort(plan.oppdatert)}
            {!erEier && (
              <span style={{ marginLeft:8, background:ROLLER[minRolle]?.bg, color:ROLLER[minRolle]?.farge, borderRadius:8, padding:"1px 7px", fontWeight:700, fontSize:10 }}>
                {ROLLER[minRolle]?.ikon} {ROLLER[minRolle]?.label}
              </span>
            )}
          </div>
        </div>
        {erEier && !bekreftSlett && (
          <button className="btn" onClick={() => setBekreftSlett(true)}
            style={{ background:"#ffebee", color:"#c62828", padding:"7px 12px", fontSize:12 }}>
            🗑️ Slett
          </button>
        )}
        {bekreftSlett && (
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn" onClick={handleSlettPlan} disabled={sletter}
              style={{ background:"#c62828", color:"#fff", padding:"7px 12px", fontSize:12, opacity:sletter?0.7:1 }}>
              {sletter ? "Sletter..." : "Bekreft slett"}
            </button>
            <button className="btn" onClick={() => setBekreftSlett(false)}
              style={{ background:"#e0e0e0", color:C.t, padding:"7px 12px", fontSize:12 }}>
              Avbryt
            </button>
          </div>
        )}
      </div>

      {/* Presence */}
      <PresenceBar presence={presence} aktivBrukerId={aktivBruker.id} />

      {/* Feil */}
      {feil && (
        <div style={{ background:"#ffebee", border:"1px solid #ef9a9a", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#c62828", marginBottom:10 }}>
          {feil}
        </div>
      )}

      {/* Faner */}
      <div style={{ display:"flex", gap:6, marginBottom:16, borderBottom:`1px solid ${C.mint}`, paddingBottom:8 }}>
        {[
          { id:"innhold",  label:"📄 Innhold" },
          ...(erEier ? [{ id:"tilgang", label:"👥 Tilgang" }] : []),
          { id:"historikk", label:"🕐 Historikk" },
        ].map(t => (
          <button key={t.id} className="btn" onClick={() => setTab(t.id)}
            style={{ background:tab===t.id?C.g:"transparent", color:tab===t.id?"#fff":C.gr, padding:"7px 14px", fontSize:12, border:tab===t.id?"none":`1px solid ${C.mint}`, fontWeight:700 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: INNHOLD ── */}
      {tab === "innhold" && (
        <div>
          <DeltPlanEditor
            planType={plan.plan_type}
            payload={editPayload}
            kanRedigere={kanRedigere}
            onChange={setEditPayload}
          />
          {kanRedigere && (
            <div style={{ display:"flex", gap:10, marginTop:16, justifyContent:"flex-end" }}>
              <button className="btn" onClick={() => setEditPayload(lagretPayload)}
                style={{ background:C.lg2, color:C.g, padding:"9px 16px", fontSize:13 }}>
                Tilbakestill
              </button>
              <button className="btn" onClick={handleLagre} disabled={lagrer}
                style={{ background:C.g, color:"#fff", padding:"9px 20px", fontSize:13, opacity:lagrer?0.7:1 }}>
                {lagrer ? "Lagrer..." : "💾 Lagre"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TILGANG ── */}
      {tab === "tilgang" && erEier && (
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:C.g, marginBottom:12 }}>Inviter samarbeidspartner</div>

          {/* Søkefelt med autocomplete */}
          <div style={{ position:"relative", marginBottom:6 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:180, position:"relative" }}>
                <input type="text" value={inviterSøk}
                  onChange={e => { setInviterSøk(e.target.value); }}
                  onKeyDown={e => { if (e.key === "Enter") { setVisForslag(false); handleInviter(); } if (e.key === "Escape") { setVisForslag(false); } }}
                  onFocus={() => søkeForslag.length > 0 && setVisForslag(true)}
                  onBlur={() => setTimeout(() => setVisForslag(false), 180)}
                  placeholder="Søk etter navn eller skriv e-postadresse..."
                  style={{ width:"100%", padding:"9px 12px", border:`1px solid ${visForslag ? C.g : C.mint}`, borderRadius:9, fontSize:13, fontFamily:"'Nunito',sans-serif", boxSizing:"border-box" }} />

                {/* Autocomplete-dropdown */}
                {visForslag && søkeForslag.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:`1px solid ${C.mint}`, borderRadius:10, boxShadow:"0 6px 24px rgba(44,91,142,0.13)", zIndex:100, overflow:"hidden", marginTop:3 }}>
                    {søkeForslag.map((u, i) => (
                      <div key={u.id}
                        onMouseDown={() => { setInviterSøk(u.brukernavn || u.visningsnavn || ""); setVisForslag(false); }}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 13px", cursor:"pointer", background:"#fff", borderBottom:i < søkeForslag.length-1 ? `1px solid ${C.lg2}` : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.lg2}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                        <span style={{ fontSize:20, lineHeight:1 }}>{u.avatar || "👤"}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:C.t }}>{u.visningsnavn || u.brukernavn}</div>
                          <div style={{ fontSize:11, color:C.gr }}>@{u.brukernavn}</div>
                        </div>
                        <span style={{ marginLeft:"auto", fontSize:10, color:C.gr }}>Trykk for å velge</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select value={inviterRolle} onChange={e => setInviterRolle(e.target.value)}
                style={{ padding:"9px 10px", border:`1px solid ${C.mint}`, borderRadius:9, fontSize:13, fontFamily:"'Nunito',sans-serif", background:"#fff", color:C.t }}>
                <option value="rediger">✏️ Kan redigere</option>
                <option value="lese">👁️ Kun lese</option>
              </select>
              <button className="btn" onClick={() => { setVisForslag(false); handleInviter(); }}
                disabled={inviterer || !inviterSøk.trim()}
                style={{ background:C.g, color:"#fff", padding:"9px 16px", fontSize:13, opacity:(inviterer||!inviterSøk.trim())?0.6:1 }}>
                {inviterer ? "Inviterer..." : "Inviter"}
              </button>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.gr, marginBottom:20 }}>
            Søk etter kollegers navn — eller skriv inn e-postadresse for å invitere noen som ikke er registrert ennå.
          </div>

          <div style={{ fontWeight:800, fontSize:13, color:C.g, marginBottom:8 }}>
            Hvem har tilgang ({tillatelser.length})
          </div>
          {tillatelser.length === 0 && (
            <div style={{ color:C.gr, fontSize:13 }}>Ingen andre har tilgang ennå</div>
          )}
          {tillatelser.map((t) => {
            const erMeg = t.bruker_id === aktivBruker.id;
            const r     = ROLLER[t.rolle] || ROLLER.lese;
            return (
              <div key={t.bruker_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"var(--c-w)", borderRadius:9, marginBottom:6, border:`1px solid ${C.mint}` }}>
                <span style={{ fontSize:20 }}>{t.profil?.avatar || "👤"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.t }}>
                    {t.profil?.visningsnavn || t.profil?.brukernavn || t.bruker_id.slice(0, 8)}
                    {erMeg && <span style={{ fontSize:10, color:C.gr, marginLeft:6 }}>(deg)</span>}
                  </div>
                  <div style={{ fontSize:11, color:C.gr }}>@{t.profil?.brukernavn || "—"}</div>
                </div>
                {erMeg ? (
                  <span style={{ fontSize:11, background:r.bg, color:r.farge, borderRadius:8, padding:"3px 8px", fontWeight:700 }}>
                    {r.ikon} {r.label}
                  </span>
                ) : (
                  <>
                    <select value={t.rolle} onChange={e => handleRolleEndring(t.bruker_id, e.target.value)}
                      style={{ padding:"5px 8px", border:`1px solid ${C.mint}`, borderRadius:7, fontSize:12, fontFamily:"'Nunito',sans-serif", background:"#fff", color:C.t }}>
                      <option value="rediger">✏️ Kan redigere</option>
                      <option value="lese">👁️ Kun lese</option>
                    </select>
                    <button className="btn" onClick={() => {
                        if (window.confirm(`Fjerne ${t.profil?.visningsnavn || t.profil?.brukernavn || "denne brukeren"} fra planen?`))
                          handleFjernBruker(t.bruker_id);
                      }}
                      style={{ background:"#ffebee", color:"#c62828", padding:"5px 10px", fontSize:12 }}>
                      Fjern
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {invitasjoner.length > 0 && (
            <>
              <div style={{ fontWeight:800, fontSize:13, color:C.g, marginBottom:8, marginTop:18 }}>
                Ventende e-postinvitasjoner ({invitasjoner.length})
              </div>
              {invitasjoner.map((inv) => (
                <div key={inv.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"#fffde7", borderRadius:9, marginBottom:6, border:"1px solid #ffe082" }}>
                  <span style={{ fontSize:16 }}>📧</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{inv.epost}</div>
                    <div style={{ fontSize:11, color:C.gr }}>Lagret {datoKort(inv.opprettet)} · vises ved neste innlogging</div>
                  </div>
                  <span style={{ fontSize:11, background:ROLLER[inv.rolle]?.bg, color:ROLLER[inv.rolle]?.farge, borderRadius:8, padding:"2px 7px", fontWeight:700 }}>
                    {ROLLER[inv.rolle]?.label}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── TAB: HISTORIKK ── */}
      {tab === "historikk" && (
        <div>
          {historikk.length === 0 ? (
            <div style={{ color:C.gr, fontSize:13, padding:"16px 0" }}>
              Ingen versjonshistorikk ennå. Historikk lagres automatisk ved hvert lagring.
            </div>
          ) : (
            historikk.map((h, i) => (
              <div key={h.id || i} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"var(--c-w)", borderRadius:10, marginBottom:8, border:`1px solid ${C.mint}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.t }}>
                    Versjon {historikk.length - i}
                    <span style={{ fontSize:11, fontWeight:400, color:C.gr, marginLeft:8 }}>
                      {datoTid(h.opprettet)}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:C.gr }}>Lagret av: {h.bruker_navn || "Ukjent"}</div>
                </div>
                {kanRedigere && (
                  <button className="btn" onClick={() => handleGjenopprett(h)}
                    disabled={lagrer}
                    style={{ background:C.lg2, color:C.g, padding:"6px 12px", fontSize:12, fontWeight:700, opacity:lagrer?0.5:1 }}>
                    {lagrer ? "Gjenoppretter..." : "↩️ Gjenopprett"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//  PLAN KORT (listevisning)
// ══════════════════════════════════════════
function PlanKort({ plan, minRolle, eierProfil, onClick }) {
  const planInfo = PLANTYPE[plan.plan_type] || { label: plan.plan_type, ikon:"📄" };
  const tittel   = plan.payload?.tittel || `${planInfo.label} (uten tittel)`;
  const r        = ROLLER[minRolle] || ROLLER.lese;

  return (
    <div className="hover" onClick={onClick}
      style={{ background:"#fff", borderRadius:12, padding:"14px 16px", marginBottom:10, border:`1px solid ${C.mint}`, cursor:"pointer", boxShadow:"0 2px 8px rgba(44,91,142,0.06)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1.2, flexShrink:0 }}>{planInfo.ikon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.t, marginBottom:2, wordBreak:"break-word" }}>{tittel}</div>
          <div style={{ fontSize:11, color:C.gr, display:"flex", gap:10, flexWrap:"wrap" }}>
            <span>{planInfo.label}</span>
            <span>Oppdatert: {datoKort(plan.oppdatert)}</span>
            {eierProfil && (
              <span>Delt av: {eierProfil.visningsnavn || eierProfil.brukernavn}</span>
            )}
          </div>
        </div>
        <span style={{ fontSize:10, background:r.bg, color:r.farge, borderRadius:8, padding:"3px 8px", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
          {r.ikon} {r.label}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  DEL NY PLAN MODAL
// ══════════════════════════════════════════
function DelNyPlanModal({ aktivBruker, onOpprett, onLukk }) {
  const [planType,   setPlanType]   = useState("ukeplan");
  const [minePlaner, setMinePlaner] = useState({ ukeplaner:[], maanedsplaner:[], arsplaner:[], maanedsbrev:[] });
  const [valgtPlan,  setValgtPlan]  = useState(null);
  const [laster,     setLaster]     = useState(true);
  const [lagrer,     setLagrer]     = useState(false);
  const [feil,       setFeil]       = useState("");

  useEffect(() => {
    hentAlleMinePlaner(aktivBruker.id)
      .then(setMinePlaner)
      .catch(() => {})
      .finally(() => setLaster(false));
  }, [aktivBruker.id]);

  const typeNøkkel = {
    ukeplan:"ukeplaner", maanedsplan:"maanedsplaner", arsplan:"arsplaner",
    maanedsbrev:"maanedsbrev", dokument:"dokumenter", skjema:"skjemaer",
    sang:"sanger", tegneark:"tegneark",
  };
  const aktivListe = minePlaner[typeNøkkel[planType]] || [];
  const mnd = ["","Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"];

  const getPlanLabel = (p) => {
    if (p.tittel) return p.tittel;
    if (planType === "ukeplan")
      return `Uke ${p.uke || "?"} – ${p.tema || ""}`.trim();
    if (planType === "maanedsplan" || planType === "maanedsbrev")
      return `${mnd[p.maaned] || ""} ${p.aar || ""} – ${p.tema || ""}`.trim();
    if (planType === "arsplan")
      return `${p.aar || ""} – ${p.barnehage || ""}`.trim();
    if (planType === "sang")
      return `${p.kategori || "sang"} – ${p.alder || ""}`.trim();
    if (planType === "tegneark")
      return `${p.ikon || "🖍️"} ${p.kategori || ""} – ${p.alder || ""}`.trim();
    return `${PLANTYPE[planType]?.label || ""} ${p.id?.slice(0,6) || ""}`;
  };

  const handleOpprett = async () => {
    if (!valgtPlan) { setFeil("Velg en plan å dele"); return; }
    setLagrer(true); setFeil("");
    try {
      const delt = await opprettDelPlan(valgtPlan, planType, aktivBruker.id);
      onOpprett(delt);
    } catch (e) {
      setFeil(e.message || "Kunne ikke dele plan");
    } finally {
      setLagrer(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div className="pop" style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 12px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:C.g, marginBottom:4 }}>Del innhold</div>
        <div style={{ fontSize:13, color:C.gr, marginBottom:18 }}>Velg hva du vil dele med kolleger</div>

        <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Innholdstype</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:18 }}>
          {Object.entries(PLANTYPE).map(([key, val]) => (
            <button key={key} className="btn" onClick={() => { setPlanType(key); setValgtPlan(null); }}
              style={{ background:planType===key?C.g:C.lg2, color:planType===key?"#fff":C.g, padding:"7px 4px", fontSize:11, textAlign:"center", lineHeight:1.3 }}>
              <div style={{ fontSize:16 }}>{val.ikon}</div>
              <div>{val.label}</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize:11, fontWeight:800, color:C.g, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
          Velg {PLANTYPE[planType]?.label?.toLowerCase() || "innhold"}
        </div>
        {laster ? (
          <div style={{ display:"flex", justifyContent:"center", padding:16 }}><div className="spin"/></div>
        ) : aktivListe.length === 0 ? (
          <div style={{ background:"var(--c-w)", borderRadius:9, padding:"12px 14px", fontSize:13, color:C.gr }}>
            Du har ingen {PLANTYPE[planType]?.label?.toLowerCase() || "innhold"} ennå.
          </div>
        ) : (
          <div style={{ maxHeight:200, overflowY:"auto", border:`1px solid ${C.mint}`, borderRadius:10 }}>
            {aktivListe.map((p, i) => (
              <div key={i} onClick={() => setValgtPlan(p)}
                style={{ padding:"10px 12px", cursor:"pointer", background:valgtPlan===p?"#e3f2fd":"transparent", borderBottom:i<aktivListe.length-1?`1px solid ${C.lg2}`:"none", fontSize:13, fontWeight:valgtPlan===p?700:400, color:C.t, display:"flex", alignItems:"center", gap:8 }}>
                {valgtPlan === p && <span style={{ color:C.g }}>✓</span>}
                {getPlanLabel(p)}
              </div>
            ))}
          </div>
        )}

        {feil && (
          <div style={{ background:"#ffebee", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#c62828", marginTop:10 }}>
            {feil}
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
          <button className="btn" onClick={onLukk}
            style={{ background:C.lg2, color:C.g, padding:"9px 16px", fontSize:13 }}>
            Avbryt
          </button>
          <button className="btn" onClick={handleOpprett} disabled={lagrer || !valgtPlan || laster}
            style={{ background:C.g, color:"#fff", padding:"9px 20px", fontSize:13, opacity:(lagrer||!valgtPlan||laster)?0.6:1 }}>
            {lagrer ? "Deler..." : "👥 Del"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  SAMARBEID SIDE  (hoved-eksport)
// ══════════════════════════════════════════
export default function SamarbeidSide({ aktivBruker }) {
  const [tab,           setTab]           = useState("mine");
  const [mineDelte,     setMineDelte]     = useState([]);
  const [deltMedMeg,    setDeltMedMeg]    = useState([]);
  const [lastet,        setLastet]        = useState(false);
  const [apentPlan,     setApentPlan]     = useState(null);
  const [apentRolle,    setApentRolle]    = useState(null);
  const [visDelModal,   setVisDelModal]   = useState(false);
  const [pendingInvites,setPendingInvites]= useState([]);
  const [toast,         setToast]         = useState("");
  const [aksepterer,    setAksepterer]    = useState(null);

  const vis = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const lastData = useCallback(async () => {
    if (!aktivBruker?.id) return;
    try {
      const [mine, felles] = await Promise.all([
        hentMineDelte(aktivBruker.id),
        hentDeltMedMeg(aktivBruker.id),
      ]);
      setMineDelte(mine);
      setDeltMedMeg(felles);

      if (aktivBruker.epost) {
        const inv = await hentPendingInvites(aktivBruker.epost);
        setPendingInvites(inv);
      }
    } catch (e) {
      console.error("[Samarbeid]", e);
    } finally {
      setLastet(true);
    }
  }, [aktivBruker?.id, aktivBruker?.epost]);

  useEffect(() => { lastData(); }, [lastData]);

  // Realtime: lyt på egne tillatelser og egne planer for live-oppdatering av listen
  useEffect(() => {
    if (!aktivBruker?.id) return;
    const kanal = supabase.channel(`samarbeid-liste-${aktivBruker.id}`)
      .on("postgres_changes", {
        event:  "*",
        schema: "public",
        table:  "plan_tillatelser",
        filter: `bruker_id=eq.${aktivBruker.id}`,
      }, () => lastData())
      .on("postgres_changes", {
        event:  "*",
        schema: "public",
        table:  "delte_planer",
        filter: `eier_id=eq.${aktivBruker.id}`,
      }, () => lastData())
      .subscribe();
    return () => kanal.unsubscribe();
  }, [aktivBruker?.id, lastData]);

  const handleOpprettDelt = (nyPlan) => {
    setMineDelte(prev => [nyPlan, ...prev]);
    setVisDelModal(false);
    setApentPlan(nyPlan);
    setApentRolle("eier");
    setTab("mine");
    vis("✅ Plan delt! Åpne 'Tilgang'-fanen for å invitere samarbeidspartnere.");
  };

  const handleOppdaterPlan = (planId, nyPayload) => {
    const oppdatert = new Date().toISOString();
    const oppdater  = p => p.id === planId ? { ...p, payload: nyPayload, oppdatert } : p;
    setMineDelte(prev  => prev.map(oppdater));
    setDeltMedMeg(prev => prev.map(oppdater));
    setApentPlan(prev  => prev?.id === planId ? { ...prev, payload: nyPayload, oppdatert } : prev);
  };

  const handleSlettPlan = (planId) => {
    setMineDelte(prev  => prev.filter(p => p.id !== planId));
    setApentPlan(null);
    setApentRolle(null);
    vis("Plan slettet");
  };

  const handleAksepterInvite = async (inv) => {
    if (!aktivBruker?.id) return;
    setAksepterer(inv.id);
    try {
      await aksepterInvitasjon(inv.id, aktivBruker.id, inv.delt_plan_id, inv.rolle);
      setPendingInvites(prev => prev.filter(i => i.id !== inv.id));
      await lastData();
      vis("✅ Invitasjon akseptert!");
    } catch (e) {
      vis("❌ Kunne ikke akseptere invitasjonen");
    } finally {
      setAksepterer(null);
    }
  };

  // ── Åpen plan ──
  if (apentPlan) {
    return (
      <DeltPlanVisning
        plan={apentPlan}
        aktivBruker={aktivBruker}
        minRolle={apentRolle}
        onTilbake={() => { setApentPlan(null); setApentRolle(null); }}
        onOppdater={handleOppdaterPlan}
        onSlett={handleSlettPlan}
      />
    );
  }

  // ── Listevisning ──
  return (
    <div className="fade">
      {toast && (
        <div style={{ position:"fixed", top:70, right:20, zIndex:200, background:C.g, color:"#fff", borderRadius:9, padding:"10px 16px", fontWeight:700, fontSize:13, boxShadow:"0 4px 14px rgba(0,0,0,0.18)" }}>
          {toast}
        </div>
      )}

      {visDelModal && (
        <DelNyPlanModal
          aktivBruker={aktivBruker}
          onOpprett={handleOpprettDelt}
          onLukk={() => setVisDelModal(false)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.g, marginBottom:4 }}>👥 Samarbeid</div>
        <div style={{ fontSize:13, color:C.gr }}>Del planer med kolleger og rediger sammen i sanntid</div>
      </div>

      {/* Ventende invitasjoner */}
      {pendingInvites.length > 0 && (
        <div style={{ background:"#e8f5e9", border:"1px solid #a5d6a7", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:13, color:"#2e7d32", marginBottom:10 }}>
            📬 Du har {pendingInvites.length} ventende invitasjon{pendingInvites.length > 1 ? "er" : ""}
          </div>
          {pendingInvites.map((inv, i) => {
            const pInfo  = PLANTYPE[inv.delte_planer?.plan_type] || { label:"Plan", ikon:"📄" };
            const tittel = inv.delte_planer?.payload?.tittel || `${pInfo.label} (uten tittel)`;
            return (
              <div key={inv.id} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", borderRadius:9, padding:"10px 12px", marginBottom:i<pendingInvites.length-1?6:0, flexWrap:"wrap" }}>
                <span style={{ fontSize:18 }}>{pInfo.ikon}</span>
                <div style={{ flex:1, minWidth:120 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.t }}>{tittel}</div>
                  <div style={{ fontSize:11, color:C.gr }}>
                    Rolle: <span style={{ fontWeight:700 }}>{ROLLER[inv.rolle]?.label}</span>
                  </div>
                </div>
                <button className="btn" onClick={() => handleAksepterInvite(inv)}
                  disabled={aksepterer === inv.id}
                  style={{ background:"#4caf50", color:"#fff", padding:"7px 14px", fontSize:12, opacity:aksepterer===inv.id?0.7:1 }}>
                  {aksepterer === inv.id ? "Aksepterer..." : "Aksepter"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs + Del-knapp */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:6 }}>
          {[
            { id:"mine",   label:`Mine delte (${mineDelte.length})` },
            { id:"felles", label:`Delt med meg (${deltMedMeg.length})` },
          ].map(t => (
            <button key={t.id} className="btn" onClick={() => setTab(t.id)}
              style={{ background:tab===t.id?C.g:"transparent", color:tab===t.id?"#fff":C.gr, padding:"8px 14px", fontSize:12, border:tab===t.id?"none":`1px solid ${C.mint}`, fontWeight:700 }}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn" onClick={() => setVisDelModal(true)}
          style={{ background:C.g, color:"#fff", padding:"8px 16px", fontSize:13, fontWeight:700 }}>
          + Del en plan
        </button>
      </div>

      {/* Planlister */}
      {!lastet ? (
        <div style={{ display:"flex", justifyContent:"center", padding:30 }}>
          <div className="spin"/>
        </div>
      ) : (
        <>
          {tab === "mine" && (
            mineDelte.length === 0 ? (
              <div style={{ background:"var(--c-w)", borderRadius:12, padding:"28px 20px", textAlign:"center", border:`1px solid ${C.mint}` }}>
                <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
                <div style={{ fontWeight:700, fontSize:14, color:C.t, marginBottom:6 }}>Ingen delte planer ennå</div>
                <div style={{ fontSize:12, color:C.gr, marginBottom:14 }}>Del en eksisterende plan og inviter kolleger til å samarbeide</div>
                <button className="btn" onClick={() => setVisDelModal(true)}
                  style={{ background:C.g, color:"#fff", padding:"9px 20px", fontSize:13 }}>
                  Del din første plan
                </button>
              </div>
            ) : (
              mineDelte.map(p => (
                <PlanKort key={p.id} plan={p} minRolle="eier" eierProfil={null}
                  onClick={() => { setApentPlan(p); setApentRolle("eier"); }} />
              ))
            )
          )}

          {tab === "felles" && (
            deltMedMeg.length === 0 ? (
              <div style={{ background:"var(--c-w)", borderRadius:12, padding:"28px 20px", textAlign:"center", border:`1px solid ${C.mint}` }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📬</div>
                <div style={{ fontWeight:700, fontSize:14, color:C.t, marginBottom:6 }}>Ingen planer delt med deg</div>
                <div style={{ fontSize:12, color:C.gr }}>Når kolleger deler planer med deg, vises de her</div>
              </div>
            ) : (
              deltMedMeg.map(p => (
                <PlanKort key={p.id} plan={p} minRolle={p.min_rolle} eierProfil={p.eier_profil}
                  onClick={() => { setApentPlan(p); setApentRolle(p.min_rolle); }} />
              ))
            )
          )}
        </>
      )}

      {/* Info-boks */}
      <div style={{ background:"linear-gradient(135deg,#e3f2fd,#e8f5e9)", borderRadius:12, padding:"14px 16px", marginTop:24, border:`1px solid ${C.mint}` }}>
        <div style={{ fontWeight:800, fontSize:12, color:C.g, marginBottom:6 }}>⚡ Slik fungerer sanntidssamarbeid</div>
        <div style={{ fontSize:12, color:C.gr, lineHeight:1.75 }}>
          <b>Hvem er inne:</b> Se profilbilder øverst når noen åpner samme plan.<br/>
          <b>Automatisk oppdatering:</b> Gult varsel vises hvis noen andre lagrer mens du redigerer – velg å hente inn eller beholde dine endringer.<br/>
          <b>Versjonshistorikk:</b> Hvert lagring lagrer et snapshot – trykk «Historikk»-fanen for å angre.
        </div>
      </div>
    </div>
  );
}

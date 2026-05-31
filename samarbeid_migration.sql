-- ============================================================
-- Barnehagehjelpen – Samarbeid / Delte planer
-- Kjør dette i Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. DELTE PLANER (eneste kilde til sannhet for delt innhold)
CREATE TABLE public.delte_planer (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id     text        NOT NULL,
  plan_type   text        NOT NULL CHECK (plan_type IN ('ukeplan','maanedsplan','arsplan','maanedsbrev')),
  eier_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload     jsonb       NOT NULL DEFAULT '{}',
  oppdatert   timestamptz DEFAULT now(),
  opprettet   timestamptz DEFAULT now()
);

-- 2. TILLATELSER (hvem har tilgang og med hvilken rolle)
CREATE TABLE public.plan_tillatelser (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  delt_plan_id   uuid NOT NULL REFERENCES public.delte_planer(id) ON DELETE CASCADE,
  bruker_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rolle          text NOT NULL CHECK (rolle IN ('eier','rediger','lese')),
  lagt_til_av    uuid REFERENCES auth.users(id),
  opprettet      timestamptz DEFAULT now(),
  UNIQUE(delt_plan_id, bruker_id)
);

-- 3. INVITASJONER (e-post til brukere som ennå ikke er registrert)
CREATE TABLE public.plan_invitasjoner (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  delt_plan_id   uuid NOT NULL REFERENCES public.delte_planer(id) ON DELETE CASCADE,
  epost          text NOT NULL,
  rolle          text NOT NULL CHECK (rolle IN ('rediger','lese')),
  akseptert      boolean DEFAULT false,
  akseptert_av   uuid REFERENCES auth.users(id),
  opprettet      timestamptz DEFAULT now()
);

-- 4. VERSJONSHISTORIKK (snapshot lagres ved hvert lagring)
CREATE TABLE public.plan_historikk (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  delt_plan_id   uuid NOT NULL REFERENCES public.delte_planer(id) ON DELETE CASCADE,
  bruker_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  bruker_navn    text,
  payload        jsonb NOT NULL,
  opprettet      timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES (for ytelse)
-- ============================================================
CREATE INDEX ON public.delte_planer(eier_id);
CREATE INDEX ON public.delte_planer(oppdatert DESC);
CREATE INDEX ON public.plan_tillatelser(delt_plan_id);
CREATE INDEX ON public.plan_tillatelser(bruker_id);
CREATE INDEX ON public.plan_historikk(delt_plan_id);
CREATE INDEX ON public.plan_historikk(opprettet DESC);
CREATE INDEX ON public.plan_invitasjoner(delt_plan_id);
CREATE INDEX ON public.plan_invitasjoner(epost);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.delte_planer      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tillatelser  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_invitasjoner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_historikk    ENABLE ROW LEVEL SECURITY;

-- ── delte_planer ──────────────────────────────────────────

-- Eier: full tilgang (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "delte_planer: eier full tilgang" ON public.delte_planer
  FOR ALL USING (eier_id = auth.uid());

-- Andre med tillatelse: kan lese
CREATE POLICY "delte_planer: tillatelse kan lese" ON public.delte_planer
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plan_tillatelser t
      WHERE t.delt_plan_id = id AND t.bruker_id = auth.uid()
    )
  );

-- Andre med redigerings-tillatelse: kan oppdatere
CREATE POLICY "delte_planer: rediger-tillatelse kan oppdatere" ON public.delte_planer
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.plan_tillatelser t
      WHERE t.delt_plan_id = id
        AND t.bruker_id = auth.uid()
        AND t.rolle IN ('eier','rediger')
    )
  );

-- ── plan_tillatelser ──────────────────────────────────────

-- Eier av planen: full tilgang på tillatelsene
CREATE POLICY "plan_tillatelser: eier full tilgang" ON public.plan_tillatelser
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.delte_planer dp
      WHERE dp.id = delt_plan_id AND dp.eier_id = auth.uid()
    )
  );

-- Bruker: kan se egne tillatelser
CREATE POLICY "plan_tillatelser: se egne" ON public.plan_tillatelser
  FOR SELECT USING (bruker_id = auth.uid());

-- Bruker: kan fjerne seg selv (forlate plan), men ikke eier-rollen
CREATE POLICY "plan_tillatelser: forlate plan" ON public.plan_tillatelser
  FOR DELETE USING (bruker_id = auth.uid() AND rolle != 'eier');

-- ── plan_invitasjoner ─────────────────────────────────────

-- Eier av planen: full tilgang på invitasjoner
CREATE POLICY "plan_invitasjoner: eier full tilgang" ON public.plan_invitasjoner
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.delte_planer dp
      WHERE dp.id = delt_plan_id AND dp.eier_id = auth.uid()
    )
  );

-- Alle autentiserte: kan lese invitasjoner adressert til sin e-post
CREATE POLICY "plan_invitasjoner: se egne" ON public.plan_invitasjoner
  FOR SELECT USING (
    epost = (
      SELECT p.epost FROM public.user_profiles p WHERE p.id = auth.uid()
    )
  );

-- Alle autentiserte: kan akseptere åpne invitasjoner
CREATE POLICY "plan_invitasjoner: akseptere" ON public.plan_invitasjoner
  FOR UPDATE USING (akseptert = false AND auth.uid() IS NOT NULL);

-- ── plan_historikk ────────────────────────────────────────

-- Eier av planen: kan se historikk
CREATE POLICY "plan_historikk: eier kan se" ON public.plan_historikk
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.delte_planer dp
      WHERE dp.id = delt_plan_id AND dp.eier_id = auth.uid()
    )
  );

-- Andre med tillatelse: kan se historikk
CREATE POLICY "plan_historikk: tillatelse kan se" ON public.plan_historikk
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plan_tillatelser t
      WHERE t.delt_plan_id = plan_historikk.delt_plan_id AND t.bruker_id = auth.uid()
    )
  );

-- Brukere med rediger-tilgang: kan legge til historikk (INSERT)
CREATE POLICY "plan_historikk: rediger kan lagre" ON public.plan_historikk
  FOR INSERT WITH CHECK (
    bruker_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.delte_planer dp
        WHERE dp.id = delt_plan_id AND dp.eier_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM public.plan_tillatelser t
        WHERE t.delt_plan_id = plan_historikk.delt_plan_id
          AND t.bruker_id = auth.uid()
          AND t.rolle IN ('eier','rediger')
      )
    )
  );

-- ============================================================
-- REALTIME: Aktiver lytting på relevante tabeller
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.delte_planer;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_tillatelser;

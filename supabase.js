import { createClient } from "@supabase/supabase-js";

// Sikker localStorage-tilgang: Safari private browsing kan kaste SecurityError
function tryLocalStorage() {
  try { return window.localStorage; } catch { return undefined; }
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: tryLocalStorage(),
    },
  }
);

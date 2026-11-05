import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://ozwgrmebffsmqatnvdyf.supabase.co";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nEM0CWiNtoAkB8ncA1gj8g_jA9tpRv3";

/** Cliente público. La autorización vive en RLS; esta llave es publishable. */
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

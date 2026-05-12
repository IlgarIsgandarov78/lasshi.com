import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const env = import.meta.env ?? {};
const browserConfig = globalThis.LASSHI_SUPABASE_CONFIG ?? {};

const SUPABASE_URL = env.VITE_SUPABASE_URL ?? browserConfig.url;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? browserConfig.anonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase configuration. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

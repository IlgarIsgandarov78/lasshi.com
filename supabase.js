import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const env = import.meta.env ?? {};
const browserConfig = globalThis.LASSHI_SUPABASE_CONFIG ?? {};

const SUPABASE_URL =
  env.VITE_SUPABASE_URL ??
  browserConfig.url ??
  "https://vddomatxmutsdmmlclxj.supabase.co";

const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY ??
  browserConfig.anonKey ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZG9tYXR4bXV0c2RtbWxjbHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDM2MzQsImV4cCI6MjA5NDE3OTYzNH0.bEimNOFIaQpy9T57phvo30cS5fXci6nubvf5Q7imzhk";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or LASSHI_SUPABASE_CONFIG."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

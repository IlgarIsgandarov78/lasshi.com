import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://vddomatxmutsdmmlclxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZG9tYXR4bXV0c2RtbWxjbHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDM2MzQsImV4cCI6MjA5NDE3OTYzNH0.bEimNOFIaQpy9T57phvo30cS5fXci6nubvf5Q7imzhk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =============================================
   SUPABASE CLIENT CONFIG
   ============================================= */
const SUPABASE_URL = 'https://zaffhwofeqvikdihuerf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZmZod29mZXF2aWtkaWh1ZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjcyNzAsImV4cCI6MjA4OTcwMzI3MH0.JO6zotH0SF3WatrXHKESx6vNLacTG_WqBmPjlp3tQLA';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

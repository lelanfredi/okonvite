import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jzdcpgfqpipesujjudgo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZGNwZ2ZxcGlwZXN1amp1ZGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDIzMTgsImV4cCI6MjA1NTExODMxOH0.1FF_HirchhxiPHXd7tb8QX1udvudQ8kxoWEbi67N-Oo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

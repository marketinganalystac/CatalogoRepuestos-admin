import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vzjhzuvahejosdojllcm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amh6dXZhaGVqb3Nkb2psbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI3NTAsImV4cCI6MjA4Nzc4ODc1MH0.8PNlIh3HQDIq1u6IiRQeKx3o9gZyNWU3SeZ4qJ_F7Ew";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

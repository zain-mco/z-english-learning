import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmvjwzzjwdjmcrfdsfjq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptdmp3enpqd2RqbWNyZmRzZmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDM3MDEsImV4cCI6MjA3NjM3OTcwMX0.dsRyWmexoRavVSOBAJ6YdpCZBB06wxK-PAgwOegYXKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

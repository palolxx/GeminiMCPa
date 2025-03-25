import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Get these from your project's settings in Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured
export const isSupabaseConfigured = 
  SUPABASE_URL && SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'your-project-url' && 
  SUPABASE_ANON_KEY !== 'your-anon-key';

// Create client only if properly configured
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Type for our items table
export type DbItem = {
  id: string;
  name: string;
  quantity: number;
  created_at: string;
};

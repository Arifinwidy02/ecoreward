import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

console.log('[Supabase] Initializing client with URL:', SUPABASE_URL);
console.log('[Supabase] Anon key prefix:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

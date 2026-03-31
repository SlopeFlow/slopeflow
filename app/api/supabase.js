import { createClient } from '@supabase/supabase-js';

// Public config — safe to include in app bundle
const SUPABASE_URL = 'https://fraiwczymmclehzswblf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KW5eAkD_jqBcgthrCYyF8A_DfIeAse9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

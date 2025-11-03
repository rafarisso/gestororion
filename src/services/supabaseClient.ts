import { createClient } from '@supabase/supabase-js'
const url = (window as any).ENV?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const anon = (window as any).ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
export async function getUserId() { const { data } = await supabase.auth.getUser(); return data.user?.id ?? null }

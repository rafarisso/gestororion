import { supabase, getUserId } from './supabaseClient'
export type Kind = 'income' | 'expense'
export async function addTransaction(input: { occurred_at: string; kind: Kind; amount: number; category_id?: number; description?: string; payment_method?: string; source?: string; source_ref?: string; }) {
  const user_id = await getUserId()
  const { data, error } = await supabase.from('transactions').insert([{ ...input, user_id }]).select('*').single()
  if (error) throw error; return data
}
export async function listDailySummary(from: string, to: string) {
  const { data, error } = await supabase.from('daily_summary').select('*').gte('day', from).lte('day', to).order('day', { ascending: true })
  if (error) throw error; return data
}
export async function listTransactions(params: { limit?: number } = {}) {
  const { data, error } = await supabase.from('transactions').select('*').order('occurred_at', { ascending: false }).limit(params.limit ?? 200)
  if (error) throw error; return data
}

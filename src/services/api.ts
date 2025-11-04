import { supabase } from './supabaseClient'
import { getCurrentProfile } from './profile'
export type Kind = 'income' | 'expense'
export async function addTransaction(input: { occurred_at: string; kind: Kind; amount: number; category_id?: number; description?: string; payment_method?: string; source?: string; source_ref?: string; }) {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Perfil não encontrado. Faça login novamente.')
  const ownerId = profile.owner_id
  const payload = {
    ...input,
    user_id: ownerId,
    organization_id: profile.organization_id,
    created_by: profile.user_id,
  }
  const { data, error } = await supabase.from('transactions').insert([payload]).select('*').single()
  if (error) throw error; return data
}
export async function listDailySummary(from: string, to: string) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'owner') return []
  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .gte('day', from)
    .lte('day', to)
    .order('day', { ascending: true })
  if (error) throw error; return data
}
export async function listTransactions(params: { limit?: number } = {}) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'owner') return []
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('occurred_at', { ascending: false })
    .limit(params.limit ?? 200)
  if (error) throw error; return data
}

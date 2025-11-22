import { supabase } from './supabaseClient'

export type ProfileRole = 'owner' | 'employee'
export type UserProfile = {
  user_id: string
  organization_id: string
  role: ProfileRole
  owner_id: string
}

let cachedProfile: UserProfile | null | undefined

export async function getCurrentProfile(): Promise<UserProfile | null> {
  if (cachedProfile !== undefined) return cachedProfile
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user.user) {
    cachedProfile = null
    return null
  }
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, organization_id, role, owner_id')
    .eq('user_id', user.user.id)
    .maybeSingle()
  if (error) throw error
  cachedProfile = data ?? null
  return cachedProfile
}

export function clearCachedProfile() {
  cachedProfile = undefined
}

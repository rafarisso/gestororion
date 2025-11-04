import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { UserProfile, getCurrentProfile, clearCachedProfile } from '../services/profile'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getCurrentProfile()
        if (isMounted) setProfile(data)
      } catch (err) {
        console.error(err)
        if (isMounted) setError('Não foi possível carregar o perfil.')
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        clearCachedProfile()
        setProfile(null)
      } else {
        clearCachedProfile()
        getCurrentProfile().then(setProfile).catch(console.error)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { profile, loading, error }
}

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Dashboard from './pages/Dashboard'
import WelcomeScreen from './components/WelcomeScreen'
import { supabase } from './services/supabaseClient'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
        Verificando sessão...
      </div>
    )
  }

  if (!session) {
    return <WelcomeScreen />
  }

  return <Dashboard session={session} />
}

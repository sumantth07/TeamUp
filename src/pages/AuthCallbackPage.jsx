import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true })
      else navigate('/', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <span className="text-blue-500 text-2xl font-mono animate-pulse">✦</span>
        <p className="text-white/40 font-mono text-sm mt-3">signing you in...</p>
      </div>
    </div>
  )
}

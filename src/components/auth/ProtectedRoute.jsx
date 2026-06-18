import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from './AuthModal'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-blue-500 font-mono text-sm animate-pulse">loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-mono text-white/40 text-sm">[auth required]</p>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    )
  }

  return children
}

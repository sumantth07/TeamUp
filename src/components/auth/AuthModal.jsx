import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle } = useAuth()

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      onClose()
    } catch (err) {
      toast.error('Sign in failed. Try again.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="bg-[#080808] border border-white/10 p-8 relative w-full max-w-sm">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-blue-500">✦</span>
                  <span className="text-xs font-mono text-white/30 tracking-widest uppercase">TeamUp</span>
                </div>
                <h2 className="font-mono text-xl font-bold text-white mb-2">
                  join the crew.
                </h2>
                <p className="text-sm text-white/40 font-body">
                  Sign in to post opportunities, apply to teams, and connect with builders.
                </p>
              </div>

              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black font-mono text-sm font-bold hover:bg-white/90 transition-all duration-200"
              >
                <GoogleIcon />
                continue with google
              </button>

              <p className="text-xs text-white/20 font-mono text-center mt-4">
                works with college gmail accounts too
              </p>

              <div className="mt-6 pt-6 border-t border-white/8">
                <p className="text-xs text-white/25 text-center font-body">
                  By continuing, you agree to our terms. Your college email = instant access.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

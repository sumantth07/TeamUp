import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { User, LogOut, Plus, FileText, Bookmark, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthModal from '../auth/AuthModal'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('signed out')
      navigate('/')
    } catch {
      toast.error('Error signing out')
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-blue-500 text-lg font-mono">✦</span>
            <span className="font-mono font-bold text-white tracking-tight text-sm group-hover:text-blue-400 transition-colors">
              TEAM<span className="text-blue-500">UP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors">
              [explore]
            </Link>

            {user ? (
              <>
                <Link
                  to="/create"
                  className="btn-primary text-xs ml-2 flex items-center gap-1.5"
                >
                  <Plus size={12} />
                  post
                </Link>

                <div className="relative ml-2">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/25 transition-colors"
                  >
                    <div className="w-5 h-5 bg-blue-600/20 border border-blue-600/40 flex items-center justify-center">
                      <span className="text-blue-400 text-[10px] font-mono">
                        {profile?.username?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-white/70">
                      @{profile?.username ?? '...'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-1 w-44 bg-[#0a0a0a] border border-white/10 py-1 z-50"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        {[
                          { to: `/user/${profile?.username}`, icon: User, label: 'my profile' },
                          { to: '/my-posts', icon: FileText, label: 'my posts' },
                          { to: '/my-applications', icon: Bookmark, label: 'my applications' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Icon size={12} />
                            [{label}]
                          </Link>
                        ))}
                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
                          >
                            <LogOut size={12} />
                            [sign out]
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="btn-primary text-xs ml-2"
              >
                [sign in]
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/8 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2">
                <Link to="/" onClick={() => setMenuOpen(false)} className="block text-xs font-mono text-white/60 py-2">[explore]</Link>
                {user ? (
                  <>
                    <Link to="/create" onClick={() => setMenuOpen(false)} className="block text-xs font-mono text-blue-400 py-2">[+ post]</Link>
                    <Link to={`/user/${profile?.username}`} onClick={() => setMenuOpen(false)} className="block text-xs font-mono text-white/60 py-2">[profile]</Link>
                    <Link to="/my-posts" onClick={() => setMenuOpen(false)} className="block text-xs font-mono text-white/60 py-2">[my posts]</Link>
                    <Link to="/my-applications" onClick={() => setMenuOpen(false)} className="block text-xs font-mono text-white/60 py-2">[my applications]</Link>
                    <button onClick={handleSignOut} className="block text-xs font-mono text-red-400/60 py-2">[sign out]</button>
                  </>
                ) : (
                  <button onClick={() => { setAuthOpen(true); setMenuOpen(false) }} className="block text-xs font-mono text-blue-400 py-2">[sign in]</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

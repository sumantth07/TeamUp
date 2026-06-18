import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-mono text-blue-500 text-6xl font-bold mb-4">404</p>
        <h1 className="font-mono text-white text-xl mb-2">page not found.</h1>
        <p className="text-white/35 font-body text-sm mb-8">
          This crew doesn't exist (yet).
        </p>
        <Link to="/" className="btn-primary">← back to home</Link>
      </motion.div>
    </div>
  )
}

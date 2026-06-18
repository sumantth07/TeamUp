import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function ApplyModal({ isOpen, onClose, post }) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.full_name || '',
    skills: profile?.skills?.join(', ') || '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.skills.trim() || !form.message.trim()) {
      toast.error('Fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('applications').insert({
        post_id: post.id,
        applicant_id: user.id,
        name: form.name.trim(),
        skills: form.skills.trim(),
        message: form.message.trim(),
      })
      if (error) {
        if (error.code === '23505') toast.error('You already applied to this post')
        else throw error
      } else {
        toast.success('Application sent!')
        onClose()
      }
    } catch (err) {
      toast.error('Failed to apply. Try again.')
    } finally {
      setSubmitting(false)
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
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="bg-[#080808] border border-white/10 p-6 relative w-full max-w-md">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500" />

              <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
                <X size={16} />
              </button>

              <div className="mb-5">
                <span className="section-label">Applying to</span>
                <h3 className="font-mono font-bold text-white mt-1 text-sm line-clamp-2">{post?.title}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="section-label mb-1.5 block">Your Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="input"
                  />
                </div>

                <div>
                  <label className="section-label mb-1.5 block">Your Skills *</label>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Python, UI/UX, ML..."
                    className="input"
                  />
                  <p className="text-[10px] font-mono text-white/25 mt-1">comma separated</p>
                </div>

                <div>
                  <label className="section-label mb-1.5 block">Why do you want to join? *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell the team what you bring to the table..."
                    className="input resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'sending...' : 'send application'}
                </button>
                <button onClick={onClose} className="btn-ghost">cancel</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

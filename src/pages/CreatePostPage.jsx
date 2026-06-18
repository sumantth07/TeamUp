import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CATEGORIES, MODES } from '../lib/constants'
import toast from 'react-hot-toast'

export default function CreatePostPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    mode: '',
    location: '',
    team_size_needed: '',
    skills_needed: [],
    event_date: '',
    deadline: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills_needed.includes(s)) {
      setForm({ ...form, skills_needed: [...form.skills_needed, s] })
    }
    setSkillInput('')
  }

  const removeSkill = (skill) =>
    setForm({ ...form, skills_needed: form.skills_needed.filter((s) => s !== skill) })

  const handleSkillKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  const validate = () => {
    if (!form.title.trim()) return 'Title is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.category) return 'Select a category'
    if (!form.mode) return 'Select online/offline/hybrid'
    if (!form.team_size_needed || Number(form.team_size_needed) < 1) return 'Team size must be at least 1'
    if (form.mode !== 'online' && !form.location.trim()) return 'Location required for offline/hybrid events'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }

    setSubmitting(true)
    try {
      const { data, error } = await supabase.from('posts').insert({
        author_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        mode: form.mode,
        location: form.mode !== 'online' ? form.location.trim() : null,
        team_size_needed: Number(form.team_size_needed),
        skills_needed: form.skills_needed,
        event_date: form.event_date || null,
        deadline: form.deadline || null,
      }).select().single()

      if (error) throw error
      toast.success('Post created!')
      navigate(`/post/${data.id}`)
    } catch (err) {
      toast.error('Failed to create post')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <span className="section-label">✦ &nbsp;new post</span>
          <h1 className="font-mono font-bold text-3xl text-white mt-2">
            find your <span className="text-blue-500">team.</span>
          </h1>
          <p className="text-sm text-white/40 mt-2 font-body">
            Tell builders what you're working on and who you need.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="section-label mb-2 block">Post Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Looking for 2 devs for Smart India Hackathon 2025"
              className="input"
              maxLength={120}
            />
            <p className="text-[10px] font-mono text-white/20 mt-1 text-right">
              {form.title.length}/120
            </p>
          </div>

          {/* Category + Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-2 block">Category *</label>
              <div className="grid grid-cols-1 gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`text-left px-3 py-2 text-xs font-mono border transition-all ${
                      form.category === cat
                        ? 'border-blue-600/60 bg-blue-600/10 text-blue-400'
                        : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="section-label mb-2 block">Mode *</label>
              <div className="grid grid-cols-1 gap-1">
                {MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, mode })}
                    className={`text-left px-3 py-2 text-xs font-mono border capitalize transition-all ${
                      form.mode === mode
                        ? 'border-blue-600/60 bg-blue-600/10 text-blue-400'
                        : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {form.mode && form.mode !== 'online' && (
                <div className="mt-3">
                  <label className="section-label mb-1.5 block">Location *</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City / Venue"
                    className="input text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="section-label mb-2 block">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your project/event, what you're building, timeline, and what kind of people you want..."
              className="input resize-none"
            />
          </div>

          {/* Team size */}
          <div>
            <label className="section-label mb-2 block">Teammates Needed *</label>
            <input
              name="team_size_needed"
              type="number"
              min={1}
              max={20}
              value={form.team_size_needed}
              onChange={handleChange}
              placeholder="How many teammates do you need?"
              className="input"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="section-label mb-2 block">Skills Needed</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                placeholder="Type a skill and press Enter"
                className="input flex-1 text-sm"
              />
              <button type="button" onClick={addSkill} className="btn-ghost px-3">
                <Plus size={14} />
              </button>
            </div>
            {form.skills_needed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills_needed.map((s) => (
                  <span key={s} className="tag-blue flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-2 block">Event Date</label>
              <input
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="section-label mb-2 block">Application Deadline</label>
              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Preview row */}
          <div className="border border-white/8 p-4 bg-white/2">
            <p className="section-label mb-2">posting as</p>
            <p className="text-xs font-mono text-white/60">
              @{profile?.username} · {profile?.college || <span className="text-yellow-400/60">college not set — update your profile</span>}
            </p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
            {submitting ? 'posting...' : 'publish post →'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

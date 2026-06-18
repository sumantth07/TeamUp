import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, X, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    college: '',
    location: '',
    bio: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  })
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [hackathons, setHackathons] = useState([])
  const [newHackathon, setNewHackathon] = useState({ event_name: '', role: '', result: '', year: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        college: profile.college || '',
        location: profile.location || '',
        bio: profile.bio || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      })
      setSkills(profile.skills || [])
    }
  }, [profile])

  useEffect(() => {
    const fetchHackathons = async () => {
      if (!user) return
      const { data } = await supabase
        .from('hackathon_participations')
        .select('*')
        .eq('profile_id', user.id)
        .order('year', { ascending: false })
      setHackathons(data || [])
    }
    fetchHackathons()
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setSkillInput('')
  }

  const handleSaveProfile = async () => {
    if (!form.full_name.trim() || !form.username.trim() || !form.college.trim()) {
      toast.error('Name, username, and college are required')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        ...form,
        skills,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      if (error) {
        if (error.code === '23505') toast.error('Username already taken')
        else throw error
      } else {
        await refreshProfile()
        toast.success('Profile updated!')
        navigate(`/user/${form.username}`)
      }
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddHackathon = async () => {
    if (!newHackathon.event_name.trim()) { toast.error('Event name required'); return }
    try {
      const { data, error } = await supabase.from('hackathon_participations').insert({
        profile_id: user.id,
        ...newHackathon,
        year: newHackathon.year ? Number(newHackathon.year) : null,
      }).select().single()
      if (error) throw error
      setHackathons([data, ...hackathons])
      setNewHackathon({ event_name: '', role: '', result: '', year: '', description: '' })
      toast.success('Hackathon added')
    } catch { toast.error('Failed to add hackathon') }
  }

  const handleDeleteHackathon = async (id) => {
    try {
      await supabase.from('hackathon_participations').delete().eq('id', id)
      setHackathons(hackathons.filter((h) => h.id !== id))
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <span className="section-label">✦ &nbsp;settings</span>
          <h1 className="font-mono font-bold text-3xl text-white mt-2">
            edit <span className="text-blue-500">profile.</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/8 mb-6">
          {['profile', 'hackathons'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 -mb-px capitalize ${
                tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-1.5 block">Full Name *</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm">@</span>
                  <input name="username" value={form.username} onChange={handleChange} className="input pl-7" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-1.5 block">College *</label>
                <input name="college" value={form.college} onChange={handleChange} placeholder="Your college name" className="input" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="City, State" className="input" />
              </div>
            </div>

            <div>
              <label className="section-label mb-1.5 block">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                placeholder="Tell people about yourself..." className="input resize-none" />
            </div>

            {/* Skills */}
            <div>
              <label className="section-label mb-1.5 block">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }}}
                  placeholder="Add a skill (Enter to add)"
                  className="input flex-1 text-sm"
                />
                <button type="button" onClick={addSkill} className="btn-ghost px-3"><Plus size={14} /></button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="tag-blue flex items-center gap-1.5 text-xs">
                      {s}
                      <button onClick={() => setSkills(skills.filter((x) => x !== s))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div>
              <label className="section-label mb-2 block">Links</label>
              <div className="space-y-2">
                {[
                  { name: 'github_url', placeholder: 'https://github.com/username' },
                  { name: 'linkedin_url', placeholder: 'https://linkedin.com/in/username' },
                  { name: 'portfolio_url', placeholder: 'https://yourportfolio.com' },
                ].map(({ name, placeholder }) => (
                  <input key={name} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder} className="input text-sm" />
                ))}
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full py-3">
              {saving ? 'saving...' : 'save profile →'}
            </button>
          </div>
        )}

        {tab === 'hackathons' && (
          <div className="space-y-5">
            {/* Add hackathon form */}
            <div className="card p-5">
              <p className="font-mono text-sm font-bold text-white mb-4">add hackathon</p>
              <div className="space-y-3">
                <input
                  value={newHackathon.event_name}
                  onChange={(e) => setNewHackathon({ ...newHackathon, event_name: e.target.value })}
                  placeholder="Event name *"
                  className="input text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={newHackathon.role}
                    onChange={(e) => setNewHackathon({ ...newHackathon, role: e.target.value })}
                    placeholder="Role (e.g. Lead Dev)"
                    className="input text-sm"
                  />
                  <input
                    value={newHackathon.result}
                    onChange={(e) => setNewHackathon({ ...newHackathon, result: e.target.value })}
                    placeholder="Result (e.g. Winner)"
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    value={newHackathon.year}
                    onChange={(e) => setNewHackathon({ ...newHackathon, year: e.target.value })}
                    placeholder="Year"
                    className="input text-sm"
                    min={2000} max={2030}
                  />
                </div>
                <textarea
                  value={newHackathon.description}
                  onChange={(e) => setNewHackathon({ ...newHackathon, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  rows={2}
                  className="input resize-none text-sm"
                />
                <button onClick={handleAddHackathon} className="btn-primary text-xs w-full">
                  + add hackathon
                </button>
              </div>
            </div>

            {/* Existing hackathons */}
            <div className="space-y-2">
              {hackathons.length === 0 ? (
                <p className="text-xs font-mono text-white/25 text-center py-4">no hackathons yet</p>
              ) : (
                hackathons.map((h) => (
                  <div key={h.id} className="card p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-white">{h.event_name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {h.role && <span className="text-[10px] font-mono text-white/40">{h.role}</span>}
                        {h.result && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 border border-blue-600/40 text-blue-400">
                            {h.result}
                          </span>
                        )}
                        {h.year && <span className="text-[10px] font-mono text-white/25">{h.year}</span>}
                      </div>
                      {h.description && <p className="text-xs text-white/35 mt-1">{h.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteHackathon(h.id)}
                      className="text-red-400/40 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Linkedin, Globe, ExternalLink, Trophy, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { timeAgo } from '../lib/constants'
import PostCard from '../components/posts/PostCard'

export default function ProfilePage() {
  const { username } = useParams()
  const { user, profile: myProfile } = useAuth()

  const [profile, setProfile] = useState(null)
  const [hackathons, setHackathons] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')

  const isOwnProfile = myProfile?.username === username

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, full_name, college, bio, skills, github_url, linkedin_url, portfolio_url, created_at')
          .eq('username', username)
          .single()

        if (!profileData) { setLoading(false); return }
        setProfile(profileData)

        // Fetch hackathons
        const { data: hackData } = await supabase
          .from('hackathon_participations')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('year', { ascending: false })
        setHackathons(hackData || [])

        // Fetch posts by this user
        const { data: postsData } = await supabase
          .from('posts_with_authors')
          .select('*')
          .eq('author_id', profileData.id)
          .order('created_at', { ascending: false })
        setPosts(postsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [username])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-blue-500 font-mono text-sm animate-pulse">loading...</span>
    </div>
  )

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="font-mono text-white/30">user not found</span>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile header */}
        <div className="card p-6 mb-6 relative">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-blue-500/40" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 bg-blue-600/15 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                <span className="font-mono font-bold text-blue-400 text-xl">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>

              <div>
                <h1 className="font-mono font-bold text-white text-xl">{profile.full_name}</h1>
                <p className="text-sm font-mono text-blue-400 mb-1">@{profile.username}</p>
                <p className="text-xs font-mono text-white/40">{profile.college}</p>
              </div>
            </div>

            {isOwnProfile && (
              <Link to="/profile/edit" className="btn-ghost flex items-center gap-1.5 text-xs flex-shrink-0">
                <Edit size={12} /> edit profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-white/55 font-body mt-4 leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="mt-4">
              <p className="section-label mb-2">skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="tag-blue text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 mt-4">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors">
                <Github size={13} /> GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors">
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors">
                <Globe size={13} /> Portfolio
              </a>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/8">
            <div className="text-center">
              <p className="font-mono font-bold text-white text-lg">{posts.length}</p>
              <p className="text-[10px] font-mono text-white/30">posts</p>
            </div>
            <div className="text-center">
              <p className="font-mono font-bold text-white text-lg">{hackathons.length}</p>
              <p className="text-[10px] font-mono text-white/30">hackathons</p>
            </div>
            <div className="text-center">
              <p className="font-mono font-bold text-white text-lg">
                {timeAgo(profile.created_at)}
              </p>
              <p className="text-[10px] font-mono text-white/30">member since</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/8">
          {['posts', 'hackathons'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 -mb-px capitalize ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'posts' && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-xs font-mono text-white/25 py-10 text-center">no posts yet</p>
            ) : (
              posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
            )}
          </div>
        )}

        {tab === 'hackathons' && (
          <div className="space-y-3">
            {hackathons.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs font-mono text-white/25 mb-2">no hackathons listed</p>
                {isOwnProfile && (
                  <Link to="/profile/edit" className="text-xs font-mono text-blue-400 hover:text-blue-300">
                    add your hackathon history →
                  </Link>
                )}
              </div>
            ) : (
              hackathons.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Trophy size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-mono font-bold text-white text-sm">{h.event_name}</p>
                        {h.role && <p className="text-xs text-white/40 font-body mt-0.5">{h.role}</p>}
                        {h.description && (
                          <p className="text-xs text-white/35 font-body mt-1 leading-relaxed">{h.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {h.result && (
                        <span className="text-[10px] font-mono px-2 py-0.5 border border-blue-600/40 text-blue-400 bg-blue-600/10">
                          {h.result}
                        </span>
                      )}
                      {h.year && (
                        <p className="text-[10px] font-mono text-white/25 mt-1">{h.year}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

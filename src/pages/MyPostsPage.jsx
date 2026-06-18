import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, ExternalLink, Mail, Github, Linkedin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CATEGORY_ICONS, timeAgo, formatDate } from '../lib/constants'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending: 'border-yellow-600/40 text-yellow-400 bg-yellow-600/10',
  accepted: 'border-green-600/40 text-green-400 bg-green-600/10',
  rejected: 'border-red-600/40 text-red-400 bg-red-600/10',
}

export default function MyPostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState(null)
  const [applications, setApplications] = useState({})
  const [loadingApps, setLoadingApps] = useState({})

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [user])

  const loadApplications = async (postId) => {
    if (applications[postId]) {
      setExpandedPost(expandedPost === postId ? null : postId)
      return
    }
    setLoadingApps((prev) => ({ ...prev, [postId]: true }))
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles(username, full_name, college, skills, github_url, linkedin_url, portfolio_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (!error) {
        setApplications((prev) => ({ ...prev, [postId]: data || [] }))
        setExpandedPost(postId)
      }
    } catch { toast.error('Failed to load applications') }
    finally { setLoadingApps((prev) => ({ ...prev, [postId]: false })) }
  }

  const updateStatus = async (appId, postId, status) => {
    try {
      await supabase.from('applications').update({ status }).eq('id', appId)
      setApplications((prev) => ({
        ...prev,
        [postId]: prev[postId].map((a) => a.id === appId ? { ...a, status } : a),
      }))
      toast.success(`Application ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const togglePostOpen = async (postId, current) => {
    try {
      await supabase.from('posts').update({ is_open: !current }).eq('id', postId)
      setPosts(posts.map((p) => p.id === postId ? { ...p, is_open: !current } : p))
      toast.success(!current ? 'Post reopened' : 'Post closed')
    } catch { toast.error('Failed to update') }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-blue-500 font-mono text-sm animate-pulse">loading...</span>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <span className="section-label">✦ &nbsp;dashboard</span>
          <h1 className="font-mono font-bold text-3xl text-white mt-2">
            my <span className="text-blue-500">posts.</span>
          </h1>
          <p className="text-sm text-white/40 mt-2 font-body">
            Manage your team listings and review applicants.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-white/25 mb-4">no posts yet</p>
            <Link to="/create" className="btn-primary text-sm">create your first post →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const isExpanded = expandedPost === post.id
              const apps = applications[post.id] || []
              const pendingCount = apps.filter((a) => a.status === 'pending').length

              return (
                <motion.div
                  key={post.id}
                  layout
                  className="card overflow-hidden"
                >
                  {/* Post row */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-mono text-white/30">
                            {CATEGORY_ICONS[post.category]} {post.category}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                            post.is_open
                              ? 'border-green-600/30 text-green-400 bg-green-600/10'
                              : 'border-white/10 text-white/25'
                          }`}>
                            {post.is_open ? 'open' : 'closed'}
                          </span>
                          {pendingCount > 0 && (
                            <span className="text-[10px] font-mono px-2 py-0.5 border border-yellow-600/40 text-yellow-400 bg-yellow-600/10">
                              {pendingCount} pending
                            </span>
                          )}
                        </div>
                        <Link to={`/post/${post.id}`} className="font-mono font-bold text-white text-sm hover:text-blue-300 transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-[10px] font-mono text-white/25 mt-1">
                          posted {timeAgo(post.created_at)}
                          {post.event_date && ` · event ${formatDate(post.event_date)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePostOpen(post.id, post.is_open)}
                          className="text-[10px] font-mono text-white/30 hover:text-white border border-white/10 hover:border-white/25 px-2 py-1 transition-colors"
                        >
                          {post.is_open ? 'close' : 'reopen'}
                        </button>
                        <button
                          onClick={() => loadApplications(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-all ${
                            isExpanded
                              ? 'border-blue-600/50 text-blue-400 bg-blue-600/10'
                              : 'border-white/10 text-white/50 hover:border-white/25'
                          }`}
                        >
                          {loadingApps[post.id] ? '...' : (
                            <>
                              applicants
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Applicants panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/8 overflow-hidden"
                      >
                        <div className="p-5">
                          <p className="section-label mb-4">
                            {apps.length} applicant{apps.length !== 1 ? 's' : ''}
                          </p>
                          {apps.length === 0 ? (
                            <p className="text-xs font-mono text-white/25 text-center py-6">
                              no applications yet
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {apps.map((app) => (
                                <div key={app.id} className="border border-white/8 p-4 bg-white/2">
                                  {/* Applicant header */}
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-mono font-bold text-white text-sm">{app.name}</p>
                                        <Link
                                          to={`/user/${app.applicant?.username}`}
                                          className="text-[10px] font-mono text-blue-400 hover:text-blue-300"
                                        >
                                          @{app.applicant?.username}
                                        </Link>
                                      </div>
                                      <p className="text-[10px] font-mono text-white/35 mt-0.5">
                                        {app.applicant?.college}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className={`text-[10px] font-mono px-2 py-0.5 border ${STATUS_STYLES[app.status]}`}>
                                        {app.status}
                                      </span>
                                      <span className="text-[10px] font-mono text-white/20">
                                        {timeAgo(app.created_at)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Skills */}
                                  <div className="mb-2">
                                    <p className="section-label mb-1">skills</p>
                                    <p className="text-xs font-mono text-blue-400/80">{app.skills}</p>
                                  </div>

                                  {/* Message */}
                                  <div className="mb-3">
                                    <p className="section-label mb-1">why they want to join</p>
                                    <p className="text-sm text-white/55 font-body leading-relaxed">{app.message}</p>
                                  </div>

                                  {/* Links */}
                                  <div className="flex items-center gap-3 mb-4">
                                    {app.applicant?.github_url && (
                                      <a href={app.applicant.github_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white">
                                        <Github size={11} /> GitHub
                                      </a>
                                    )}
                                    {app.applicant?.linkedin_url && (
                                      <a href={app.applicant.linkedin_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white">
                                        <Linkedin size={11} /> LinkedIn
                                      </a>
                                    )}
                                    {app.applicant?.portfolio_url && (
                                      <a href={app.applicant.portfolio_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white">
                                        <ExternalLink size={11} /> Portfolio
                                      </a>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  {app.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateStatus(app.id, post.id, 'accepted')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-green-600/40 text-green-400 hover:bg-green-600/10 transition-colors"
                                      >
                                        <CheckCircle size={12} /> accept
                                      </button>
                                      <button
                                        onClick={() => updateStatus(app.id, post.id, 'rejected')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-red-600/40 text-red-400 hover:bg-red-600/10 transition-colors"
                                      >
                                        <XCircle size={12} /> decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

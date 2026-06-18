import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CATEGORY_ICONS, timeAgo, formatDate } from '../lib/constants'

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'border-yellow-600/30 bg-yellow-600/5', label: 'pending' },
  accepted: { icon: CheckCircle, color: 'text-green-400', bg: 'border-green-600/30 bg-green-600/5', label: 'accepted' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'border-red-600/30 bg-red-600/5', label: 'declined' },
}

export default function MyApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          post:posts(id, title, category, mode, event_date, is_open, author_id,
            author:profiles(username, college))
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setApplications(data || [])
      setLoading(false)
    }
    fetchApplications()
  }, [user])

  const filtered = tab === 'all' ? applications : applications.filter((a) => a.status === tab)

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-blue-500 font-mono text-sm animate-pulse">loading...</span>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <span className="section-label">✦ &nbsp;applications</span>
          <h1 className="font-mono font-bold text-3xl text-white mt-2">
            my <span className="text-blue-500">applications.</span>
          </h1>
          <p className="text-sm text-white/40 mt-2 font-body">
            Track all the teams you've applied to.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <div key={key} className="card p-3 text-center">
              <p className="font-mono font-bold text-white text-xl">{count}</p>
              <p className="text-[10px] font-mono text-white/30 capitalize">{key}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/8 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-px capitalize ${
                tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {t}
              {counts[t] > 0 && (
                <span className="ml-1.5 text-[9px] text-white/20">{counts[t]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Application list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-mono text-white/25 text-sm mb-3">no applications here</p>
            <Link to="/" className="text-xs font-mono text-blue-400 hover:text-blue-300">
              browse posts →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app, i) => {
              const statusConf = STATUS_CONFIG[app.status]
              const StatusIcon = statusConf.icon

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Post info */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-mono text-white/30">
                          {CATEGORY_ICONS[app.post?.category]} {app.post?.category}
                        </span>
                        {!app.post?.is_open && (
                          <span className="text-[10px] font-mono text-white/20 border border-white/10 px-1.5 py-0.5">
                            closed
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/post/${app.post?.id}`}
                        className="font-mono font-bold text-white text-sm hover:text-blue-300 transition-colors flex items-center gap-1.5"
                      >
                        {app.post?.title}
                        <ExternalLink size={11} className="text-white/20" />
                      </Link>

                      <p className="text-[10px] font-mono text-white/30 mt-1">
                        by @{app.post?.author?.username} · {app.post?.author?.college}
                        {app.post?.event_date && ` · ${formatDate(app.post.event_date)}`}
                      </p>

                      {/* Your application details */}
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="section-label mb-1">your skills</p>
                        <p className="text-xs font-mono text-blue-400/70 mb-2">{app.skills}</p>
                        <p className="section-label mb-1">your message</p>
                        <p className="text-xs text-white/45 font-body leading-relaxed line-clamp-2">
                          {app.message}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 border ${statusConf.bg} ${statusConf.color}`}>
                        <StatusIcon size={11} />
                        {statusConf.label}
                      </span>
                      <span className="text-[10px] font-mono text-white/20">
                        {timeAgo(app.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Accepted message */}
                  {app.status === 'accepted' && (
                    <div className="mt-3 pt-3 border-t border-green-600/20">
                      <p className="text-xs font-mono text-green-400">
                        🎉 You were accepted! Check the post for contact details or reach out to @{app.post?.author?.username}.
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

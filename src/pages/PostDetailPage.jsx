import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUp, MessageSquare, Users, Calendar, MapPin,
  Wifi, WifiOff, Bookmark, ArrowLeft, Send, ExternalLink, Trash2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CATEGORY_COLORS, CATEGORY_ICONS, formatDate, timeAgo } from '../lib/constants'
import Comment from '../components/posts/Comment'
import ApplyModal from '../components/posts/ApplyModal'
import AuthModal from '../components/auth/AuthModal'
import toast from 'react-hot-toast'

export default function PostDetailPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  const fetchPost = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts_with_authors')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setPost(data)
  }, [id])

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author_username:profiles(username)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      // Flatten author username
      const flat = data.map((c) => ({
        ...c,
        author_username: c.author_username?.username ?? 'anon',
      }))
      // Build nested tree
      setComments(buildTree(flat))
    }
  }, [id])

  const checkUserState = useCallback(async () => {
    if (!user) return
    const [voteRes, saveRes, applyRes] = await Promise.all([
      supabase.from('post_votes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('saved_posts').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle(),
      supabase.from('applications').select('id').eq('post_id', id).eq('applicant_id', user.id).maybeSingle(),
    ])
    setVoted(!!voteRes.data)
    setSaved(!!saveRes.data)
    setHasApplied(!!applyRes.data)
  }, [id, user])

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments(), checkUserState()]).finally(() => setLoading(false))
  }, [fetchPost, fetchComments, checkUserState])

  const buildTree = (flat) => {
    const map = {}
    flat.forEach((c) => (map[c.id] = { ...c, replies: [] }))
    const roots = []
    flat.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id])
      else roots.push(map[c.id])
    })
    return roots
  }

  const handleVote = async () => {
    if (!user) { setAuthOpen(true); return }
    if (voted) return
    try {
      await supabase.from('post_votes').insert({ post_id: id, user_id: user.id })
      setVoted(true)
      setPost((p) => ({ ...p, upvotes: p.upvotes + 1 }))
    } catch {
      toast.error('Already voted')
    }
  }

  const handleSave = async () => {
    if (!user) { setAuthOpen(true); return }
    try {
      if (saved) {
        await supabase.from('saved_posts').delete().eq('post_id', id).eq('user_id', user.id)
        setSaved(false)
        toast.success('Removed from saved')
      } else {
        await supabase.from('saved_posts').insert({ post_id: id, user_id: user.id })
        setSaved(true)
        toast.success('Post saved')
      }
    } catch { toast.error('Error') }
  }

  const handleComment = async () => {
    if (!user) { setAuthOpen(true); return }
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      await supabase.from('comments').insert({
        post_id: id,
        author_id: user.id,
        content: commentText.trim(),
      })
      setCommentText('')
      fetchComments()
      toast.success('Comment posted')
    } catch { toast.error('Failed to post') }
    finally { setSubmittingComment(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await supabase.from('posts').delete().eq('id', id)
      toast.success('Post deleted')
      navigate('/')
    } catch { toast.error('Failed to delete') }
  }

  const isOwner = user?.id === post?.author_id

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-blue-500 font-mono text-sm animate-pulse">loading...</span>
    </div>
  )

  if (!post) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="font-mono text-white/30">post not found</span>
    </div>
  )

  const categoryColor = CATEGORY_COLORS[post.category] || '#0000ff'
  const categoryIcon = CATEGORY_ICONS[post.category] || '📌'

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={12} /> back to feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6">
          {/* Main */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Post header */}
            <div className="card p-6 mb-4">
              {/* Category + status */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="text-[11px] font-mono px-2.5 py-1 border"
                  style={{ color: categoryColor, borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}10` }}
                >
                  {categoryIcon} {post.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
                  {post.mode === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {post.mode}
                </span>
                {!post.is_open && (
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-red-500/30 text-red-400 bg-red-500/10">
                    CLOSED
                  </span>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="ml-auto flex items-center gap-1 text-[10px] font-mono text-red-400/50 hover:text-red-400"
                  >
                    <Trash2 size={11} /> delete post
                  </button>
                )}
              </div>

              <h1 className="font-mono font-bold text-xl text-white mb-4 leading-snug">
                {post.title}
              </h1>

              <p className="text-sm text-white/60 font-body leading-relaxed mb-5 whitespace-pre-wrap">
                {post.description}
              </p>

              {/* Skills needed */}
              {post.skills_needed?.length > 0 && (
                <div className="mb-5">
                  <p className="section-label mb-2">skills needed</p>
                  <div className="flex flex-wrap gap-2">
                    {post.skills_needed.map((s) => (
                      <span key={s} className="tag-blue text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-t border-white/8 mb-4">
                <div>
                  <p className="section-label mb-1">team size</p>
                  <p className="text-sm font-mono text-white flex items-center gap-1">
                    <Users size={13} className="text-blue-500" /> {post.team_size_needed} needed
                  </p>
                </div>
                {post.event_date && (
                  <div>
                    <p className="section-label mb-1">event date</p>
                    <p className="text-sm font-mono text-white flex items-center gap-1">
                      <Calendar size={13} className="text-blue-500" /> {formatDate(post.event_date)}
                    </p>
                  </div>
                )}
                {post.deadline && (
                  <div>
                    <p className="section-label mb-1">apply by</p>
                    <p className="text-sm font-mono text-white">{formatDate(post.deadline)}</p>
                  </div>
                )}
                {post.location && (
                  <div>
                    <p className="section-label mb-1">location</p>
                    <p className="text-sm font-mono text-white flex items-center gap-1">
                      <MapPin size={13} className="text-blue-500" /> {post.location}
                    </p>
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-white/8">
                <Link to={`/user/${post.author_username}`} className="flex items-center gap-2 group">
                  <div className="w-7 h-7 bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-mono">
                      {post.author_username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-blue-400 group-hover:text-blue-300">
                      @{post.author_username}
                    </p>
                    <p className="text-[10px] font-mono text-white/30">{post.author_college}</p>
                  </div>
                </Link>
                <span className="text-[10px] font-mono text-white/25">{timeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={handleVote}
                className={`flex items-center gap-1.5 px-3 py-2 border text-xs font-mono transition-all ${
                  voted
                    ? 'border-blue-600/50 text-blue-400 bg-blue-600/10'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
                }`}
              >
                <ArrowUp size={13} />
                {post.upvotes} upvotes
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-2 border text-xs font-mono transition-all ${
                  saved
                    ? 'border-blue-600/50 text-blue-400 bg-blue-600/10'
                    : 'border-white/10 text-white/50 hover:border-white/25'
                }`}
              >
                <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'saved' : 'save'}
              </button>

              <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-white/30">
                <MessageSquare size={13} />
                {comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)} comments
              </span>
            </div>

            {/* Comments */}
            <div className="card p-5">
              <h2 className="font-mono text-sm font-bold text-white mb-4">
                discussion
              </h2>

              {/* Comment input */}
              <div className="mb-5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? 'share your thoughts...' : 'sign in to comment'}
                  rows={3}
                  disabled={!user}
                  className="input resize-none w-full text-sm mb-2"
                />
                <div className="flex justify-end">
                  <button
                    onClick={user ? handleComment : () => setAuthOpen(true)}
                    disabled={submittingComment}
                    className="btn-primary flex items-center gap-1.5 text-xs"
                  >
                    <Send size={12} />
                    {submittingComment ? 'posting...' : 'comment'}
                  </button>
                </div>
              </div>

              {/* Comment list */}
              <div className="divider pt-4 space-y-1">
                {comments.length === 0 ? (
                  <p className="text-xs font-mono text-white/25 text-center py-6">
                    no comments yet. start the discussion.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      postId={id}
                      onRefresh={fetchComments}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Apply CTA */}
            {!isOwner && post.is_open && (
              <div className="card p-5">
                <h3 className="font-mono text-sm font-bold text-white mb-2">
                  interested?
                </h3>
                <p className="text-xs text-white/40 font-body mb-4">
                  Apply to join this team. The poster will review your application.
                </p>
                {hasApplied ? (
                  <div className="text-center py-3 border border-blue-600/30 bg-blue-600/5">
                    <p className="text-xs font-mono text-blue-400">✓ application sent</p>
                  </div>
                ) : (
                  <button
                    onClick={() => user ? setApplyOpen(true) : setAuthOpen(true)}
                    className="btn-primary w-full"
                  >
                    apply to join
                  </button>
                )}
              </div>
            )}

            {/* Owner: view applicants */}
            {isOwner && (
              <div className="card p-5">
                <h3 className="font-mono text-sm font-bold text-white mb-3">your post</h3>
                <Link
                  to="/my-posts"
                  className="btn-outline w-full text-center block text-xs"
                >
                  view applicants →
                </Link>
              </div>
            )}

            {/* Post stats */}
            <div className="card p-5">
              <h3 className="section-label mb-3">post info</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/30">posted</span>
                  <span className="text-white/60">{timeAgo(post.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">team needed</span>
                  <span className="text-white/60">{post.team_size_needed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">mode</span>
                  <span className="text-white/60 capitalize">{post.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">status</span>
                  <span className={post.is_open ? 'text-green-400' : 'text-red-400'}>
                    {post.is_open ? 'open' : 'closed'}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <ApplyModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} post={post} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { timeAgo } from '../../lib/constants'
import toast from 'react-hot-toast'

export default function Comment({ comment, postId, onRefresh, depth = 0 }) {
  const { user } = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes)

  const handleVote = async () => {
    if (!user) { toast.error('Sign in to vote'); return }
    if (voted) return

    try {
      await supabase.from('comment_votes').insert({ comment_id: comment.id, user_id: user.id })
      setLocalUpvotes((v) => v + 1)
      setVoted(true)
    } catch {
      toast.error('Already voted')
    }
  }

  const handleReply = async () => {
    if (!user) { toast.error('Sign in to reply'); return }
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        parent_id: comment.id,
        content: replyText.trim(),
      })
      setReplyText('')
      setReplyOpen(false)
      onRefresh()
      toast.success('Reply posted')
    } catch {
      toast.error('Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const replies = comment.replies || []
  const maxDepth = 4
  const indentColor = depth % 2 === 0 ? 'border-white/8' : 'border-blue-900/30'

  return (
    <div className={`${depth > 0 ? `ml-4 pl-3 border-l ${indentColor}` : ''}`}>
      <div className="py-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 text-[8px] font-mono">
              {comment.author_username?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] font-mono text-blue-400">@{comment.author_username}</span>
          <span className="text-[10px] font-mono text-white/20">{timeAgo(comment.created_at)}</span>
          {replies.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto text-[10px] font-mono text-white/25 hover:text-white/50 flex items-center gap-0.5"
            >
              {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
              {collapsed ? `show ${replies.length}` : 'collapse'}
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-white/75 font-body leading-relaxed mb-2 pl-6">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 pl-6">
          <button
            onClick={handleVote}
            className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
              voted ? 'text-blue-400' : 'text-white/30 hover:text-blue-400'
            }`}
          >
            <ArrowUp size={11} />
            {localUpvotes}
          </button>
          {depth < maxDepth && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1 text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors"
            >
              <MessageSquare size={11} />
              reply
            </button>
          )}
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {replyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pl-6 overflow-hidden"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="write a reply..."
                rows={2}
                className="input text-xs resize-none w-full mb-2"
              />
              <div className="flex gap-2">
                <button onClick={handleReply} disabled={submitting} className="btn-primary text-xs px-3 py-1.5">
                  {submitting ? '...' : 'post reply'}
                </button>
                <button onClick={() => setReplyOpen(false)} className="btn-ghost text-xs px-3 py-1.5">
                  cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      <AnimatePresence>
        {!collapsed && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                postId={postId}
                onRefresh={onRefresh}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Calendar, MapPin, ArrowUp, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_ICONS, timeAgo, formatDate } from '../../lib/constants'

export default function PostCard({ post, index = 0 }) {
  const categoryColor = CATEGORY_COLORS[post.category] || '#0000ff'
  const categoryIcon = CATEGORY_ICONS[post.category] || '📌'
  const isClosed = !post.is_open

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/post/${post.id}`} className="block group">
        <div className="card border border-white/8 group-hover:border-blue-600/30 transition-all duration-300 p-5 relative">
          {/* Closed overlay */}
          {isClosed && (
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-white/30">
              CLOSED
            </div>
          )}

          {/* Category + mode */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-mono px-2 py-0.5 border"
              style={{ color: categoryColor, borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}10` }}
            >
              {categoryIcon} {post.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
              {post.mode === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
              {post.mode}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-mono font-bold text-white text-sm mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 leading-relaxed">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-white/40 font-body mb-4 line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          {/* Skills */}
          {post.skills_needed?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.skills_needed.slice(0, 4).map((skill) => (
                <span key={skill} className="tag text-[10px] px-2 py-0.5">
                  {skill}
                </span>
              ))}
              {post.skills_needed.length > 4 && (
                <span className="text-[10px] text-white/25 font-mono self-center">
                  +{post.skills_needed.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-4">
              {/* Upvotes */}
              <span className="flex items-center gap-1 text-[11px] font-mono text-white/35">
                <ArrowUp size={11} />
                {post.upvotes}
              </span>
              {/* Comments placeholder */}
              <span className="flex items-center gap-1 text-[11px] font-mono text-white/35">
                <MessageSquare size={11} />
                {post.comment_count ?? 0}
              </span>
              {/* Team size */}
              <span className="flex items-center gap-1 text-[11px] font-mono text-white/35">
                <Users size={11} />
                {post.team_size_needed} needed
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono text-white/25">
              {post.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(post.event_date)}
                </span>
              )}
              {post.location && post.mode !== 'online' && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {post.location}
                </span>
              )}
            </div>
          </div>

          {/* Author + time */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] font-mono text-white/25">
              by @{post.author_username} · {post.author_college}
            </span>
            <span className="text-[10px] font-mono text-white/20">
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

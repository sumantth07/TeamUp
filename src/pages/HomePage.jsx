import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PostCard from '../components/posts/PostCard'
import Filters from '../components/posts/Filters'

const SORT_OPTIONS = [
  { label: 'newest', value: 'created_at' },
  { label: 'most voted', value: 'upvotes' },
  { label: 'event date', value: 'event_date' },
]

const defaultFilters = { category: '', mode: '', college: '', dateFrom: '', dateTo: '' }

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('created_at')
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts_with_authors')
        .select('*, comment_count:comments(count)', { count: 'exact' })

      if (search) query = query.ilike('title', `%${search}%`)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.mode) query = query.eq('mode', filters.mode)
      if (filters.college) query = query.ilike('author_college', `%${filters.college}%`)
      if (filters.dateFrom) query = query.gte('event_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('event_date', filters.dateTo)

      query = query.order(sort, { ascending: sort === 'event_date' })

      const { data, error, count } = await query

      if (error) throw error

      // Flatten comment count
      const formatted = (data || []).map((p) => ({
        ...p,
        comment_count: p.comment_count?.[0]?.count ?? 0,
      }))

      setPosts(formatted)
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }, [search, filters, sort])

  useEffect(() => {
    const t = setTimeout(fetchPosts, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchPosts, search])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setSearch('')
  }

  const hasFilters = Object.values(filters).some(Boolean) || search

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="mb-3">
          <span className="section-label">✦ &nbsp;college teammate finder</span>
        </div>
        <h1 className="font-mono font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
          find your<br />
          <span className="text-blue-500 glow-text">crew.</span>
        </h1>
        <p className="text-white/40 font-body text-base max-w-md">
          Hackathons, projects, research, startups — post what you're building and find teammates who ship.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search posts..."
              className="input pl-9 font-mono text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden flex items-center gap-2 px-4 border text-xs font-mono transition-colors ${
              hasFilters
                ? 'border-blue-600/50 text-blue-400 bg-blue-600/10'
                : 'border-white/10 text-white/50 hover:border-white/25'
            }`}
          >
            <Filter size={13} />
            {hasFilters && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 mt-3">
          <span className="text-[10px] font-mono text-white/25 mr-2">sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-2.5 py-1 text-[10px] font-mono transition-colors border ${
                sort === opt.value
                  ? 'border-blue-600/50 text-blue-400 bg-blue-600/10'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-red-400"
            >
              <X size={10} /> clear all
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:block w-52 flex-shrink-0"
        >
          <Filters filters={filters} onChange={handleFilterChange} onClear={() => setFilters(defaultFilters)} />
        </motion.aside>

        {/* Mobile filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden fixed inset-0 z-40 bg-black/95 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-mono text-sm text-white">Filters</span>
              <button onClick={() => setShowFilters(false)} className="text-white/50">
                <X size={18} />
              </button>
            </div>
            <Filters filters={filters} onChange={handleFilterChange} onClear={() => setFilters(defaultFilters)} />
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-6">
              show results
            </button>
          </motion.div>
        )}

        {/* Posts grid */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/25">
              {loading ? '...' : `${totalCount} post${totalCount !== 1 ? 's' : ''}`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-36 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <span className="text-3xl mb-4">🛸</span>
              <p className="font-mono text-white/30 text-sm mb-1">no posts found</p>
              <p className="text-xs text-white/20">try different filters or be the first to post</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

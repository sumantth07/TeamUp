export const CATEGORIES = [
  'Hackathon',
  'Team Project',
  'Research',
  'Startup',
  'Design Challenge',
  'Case Competition',
]

export const MODES = ['online', 'offline', 'hybrid']

export const CATEGORY_COLORS = {
  Hackathon: '#0000FF',
  'Team Project': '#6600ff',
  Research: '#00aaff',
  Startup: '#ff6600',
  'Design Challenge': '#ff0066',
  'Case Competition': '#00cc88',
}

export const CATEGORY_ICONS = {
  Hackathon: '⚡',
  'Team Project': '🛠',
  Research: '🔬',
  Startup: '🚀',
  'Design Challenge': '🎨',
  'Case Competition': '🏆',
}

export const formatDate = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const timeAgo = (dateStr) => {
  const now = new Date()
  const past = new Date(dateStr)
  const diffMs = now - past
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) return formatDate(dateStr)
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

export const TICKER_ITEMS = [
  'find teammates',
  'build together',
  'hack the future',
  'ship products',
  'win hackathons',
  'research together',
  'launch startups',
  'design together',
  'collaborate',
]

import { motion } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, MODES } from '../../lib/constants'

export default function Filters({ filters, onChange, onClear }) {
  const hasActive = filters.category || filters.mode || filters.college || filters.dateFrom || filters.dateTo

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-mono text-white/40">
          <SlidersHorizontal size={12} />
          FILTERS
        </span>
        {hasActive && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300"
          >
            <X size={10} /> clear
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="section-label mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange('category', filters.category === cat ? '' : cat)}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-all duration-150 border ${
                filters.category === cat
                  ? 'border-blue-600/50 bg-blue-600/10 text-blue-400'
                  : 'border-transparent text-white/40 hover:text-white/70 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        <p className="section-label mb-2">Mode</p>
        <div className="flex flex-col gap-1">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => onChange('mode', filters.mode === mode ? '' : mode)}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-all duration-150 border capitalize ${
                filters.mode === mode
                  ? 'border-blue-600/50 bg-blue-600/10 text-blue-400'
                  : 'border-transparent text-white/40 hover:text-white/70 hover:border-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* College search */}
      <div>
        <p className="section-label mb-2">College</p>
        <input
          type="text"
          value={filters.college}
          onChange={(e) => onChange('college', e.target.value)}
          placeholder="e.g. IIT Bombay"
          className="input text-xs py-2"
        />
      </div>

      {/* Date range */}
      <div>
        <p className="section-label mb-2">Event Date</p>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-mono text-white/25 mb-1 block">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange('dateFrom', e.target.value)}
              className="input text-xs py-2"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-white/25 mb-1 block">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange('dateTo', e.target.value)}
              className="input text-xs py-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { TICKER_ITEMS } from '../../lib/constants'

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="border-t border-white/8 bg-black/60 backdrop-blur-sm py-2.5 overflow-hidden">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-4">
              <span className="text-blue-500 text-xs">✦</span>
              <span className="text-xs font-mono text-white/25 uppercase tracking-widest">{item}</span>
            </span>
          ))}
          {items.map((item, i) => (
            <span key={`b-${i}`} className="inline-flex items-center gap-3 mx-4">
              <span className="text-blue-500 text-xs">✦</span>
              <span className="text-xs font-mono text-white/25 uppercase tracking-widest">{item}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

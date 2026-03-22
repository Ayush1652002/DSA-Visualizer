import { useState, useEffect } from 'react'
import Stack from '../components/Stack.jsx'
import Queue from '../components/Queue.jsx'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const h = e => setV(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return v
}

const ACCENT = '#22d3ee'

export default function StackQueue() {
  const isDesktop = useIsDesktop()
  const [tab, setTab] = useState('both')  // 'stack' | 'queue' | 'both'

  return (
    <div
      className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
      style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}
    >

      {/* ── Tabs ── */}
      <div className="flex shrink-0 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {[
          ['both',  'Stack + Queue'],
          ['stack', 'Stack only'   ],
          ['queue', 'Queue only'   ],
        ].map(([key, label]) => (
          <button key={key}
            onClick={() => setTab(key)}
            className="px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all duration-200"
            style={{
              border:       'none',
              borderBottom: `2px solid ${tab === key ? ACCENT : 'transparent'}`,
              background:   tab === key ? `${ACCENT}12` : 'transparent',
              color:        tab === key ? ACCENT : '#4b5563',
              cursor:       'pointer',
            }}>
            {label}
          </button>
        ))}

        {/* Info badges */}
        <div className="flex items-center gap-4 ml-auto px-4">
          <span className="text-xs font-mono text-slate-600">
            Stack: <span style={{ color: '#fb7185' }}>LIFO</span>
          </span>
          <span className="text-xs font-mono text-slate-600">
            Queue: <span style={{ color: '#a78bfa' }}>FIFO</span>
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex:          1,
          display:       'flex',
          flexDirection: isDesktop && tab === 'both' ? 'row' : 'column',
          overflow:      'hidden',
          minHeight:     0,
          gap:           0,
        }}
      >

        {/* Stack panel */}
        {(tab === 'stack' || tab === 'both') && (
          <div
            style={{
              flex:        tab === 'both' ? '0 0 380px' : 1,
              overflow:    'auto',
              padding:     24,
              borderRight: isDesktop && tab === 'both' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderBottom: !isDesktop && tab === 'both' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              minWidth:    0,
              minHeight:   tab === 'both' ? 320 : 0,
            }}
          >
            <Stack />
          </div>
        )}

        {/* Queue panel */}
        {(tab === 'queue' || tab === 'both') && (
          <div
            style={{
              flex:     1,
              overflow: 'auto',
              padding:  24,
              minWidth: 0,
              minHeight: tab === 'both' ? 320 : 0,
            }}
          >
            <Queue />
          </div>
        )}
      </div>

      {/* ── Footer legend / info bar ── */}
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/10 bg-white/5 shrink-0"
        style={{ padding: '8px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fb7185', display: 'inline-block', boxShadow: '0 0 5px #fb718577' }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Stack Top</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 5px #22d3ee77' }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Queue Front</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#4ade80', display: 'inline-block', boxShadow: '0 0 5px #4ade8077' }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Queue Rear</span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
          Stack max 10 · Queue max 8
        </span>
      </div>
    </div>
  )
}
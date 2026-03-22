// Stack.jsx — LIFO visualizer
// Items stack vertically, top is highlighted, push/pop animate

import { useState } from 'react'

const ACCENT  = '#22d3ee'
const TOP_CLR = '#fb7185'   // top element highlight

export default function Stack() {
  const [items,    setItems]    = useState([])
  const [input,    setInput]    = useState('')
  const [error,    setError]    = useState('')
  const [animIdx,  setAnimIdx]  = useState(null)   // index being animated
  const [animType, setAnimType] = useState(null)   // 'push' | 'pop'

  function push() {
    const val = input.trim()
    if (!val) { setError('Enter a value to push'); return }
    if (items.length >= 10) { setError('Stack is full (max 10)'); return }
    setError('')
    setInput('')
    const newIdx = items.length  // will be at top after push
    setItems(prev => [...prev, val])
    setAnimIdx(newIdx)
    setAnimType('push')
    setTimeout(() => { setAnimIdx(null); setAnimType(null) }, 400)
  }

  function pop() {
    if (items.length === 0) { setError('Stack is empty'); return }
    setError('')
    const topIdx = items.length - 1
    setAnimIdx(topIdx)
    setAnimType('pop')
    setTimeout(() => {
      setItems(prev => prev.slice(0, -1))
      setAnimIdx(null)
      setAnimType(null)
    }, 350)
  }

  function peek() {
    if (items.length === 0) { setError('Stack is empty'); return }
    setError('')
    setAnimIdx(items.length - 1)
    setAnimType('peek')
    setTimeout(() => { setAnimIdx(null); setAnimType(null) }, 800)
  }

  function reset() {
    setItems([]); setInput(''); setError('')
    setAnimIdx(null); setAnimType(null)
  }

  // Display items top → bottom (reverse so top is visually at top)
  const displayed = [...items].reverse()

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: ACCENT }}>Stack</span>
        <span className="text-xs text-slate-600 font-mono ml-1">LIFO · {items.length}/10</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && push()}
          placeholder="value..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none flex-1 min-w-0"
          style={{ maxWidth: 120 }}
        />
        <button onClick={push}
          className="px-4 py-2 rounded-lg text-xs font-bold font-mono"
          style={{ background: ACCENT, color: '#000', border: `1px solid ${ACCENT}`, boxShadow: `0 0 10px ${ACCENT}44`, cursor: 'pointer' }}>
          Push
        </button>
        <button onClick={pop}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400"
          style={{ background: 'transparent', cursor: 'pointer' }}>
          Pop
        </button>
        <button onClick={peek}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500"
          style={{ background: 'transparent', cursor: 'pointer' }}>
          Peek
        </button>
        <button onClick={reset}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-600"
          style={{ background: 'transparent', cursor: 'pointer' }}>
          Reset
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-xs font-mono text-red-400">⚠ {error}</p>}

      {/* Stack visualization */}
      <div
        className="flex-1 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-end overflow-hidden"
        style={{ padding: '12px 16px', minHeight: 200, gap: 0 }}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-2xl opacity-20">⬜</span>
            <span className="text-xs font-mono text-slate-700">Stack is empty</span>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-1.5">
            {items.map((val, idx) => {
              const isTop    = idx === items.length - 1
              const isAnim   = idx === animIdx
              const pushing  = isAnim && animType === 'push'
              const popping  = isAnim && animType === 'pop'
              const peeking  = isAnim && animType === 'peek'

              return (
                <div
                  key={idx}
                  style={{
                    background:  isTop ? `linear-gradient(to right, ${TOP_CLR}22, ${TOP_CLR}44)` : 'rgba(255,255,255,0.04)',
                    border:      `1px solid ${isTop ? TOP_CLR + '88' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 8,
                    padding:     '10px 16px',
                    display:     'flex',
                    alignItems:  'center',
                    justifyContent: 'space-between',
                    transform:   pushing ? 'translateY(-8px) scale(1.02)' : popping ? 'translateX(40px) scale(0.9)' : peeking ? 'scale(1.04)' : 'none',
                    opacity:     popping ? 0 : 1,
                    transition:  'transform 300ms cubic-bezier(0.34,1.4,0.64,1), opacity 300ms ease, background 200ms ease',
                    boxShadow:   isTop ? `0 0 12px ${TOP_CLR}33` : peeking ? `0 0 16px ${ACCENT}55` : 'none',
                  }}
                >
                  <span className="text-sm font-bold font-mono" style={{ color: isTop ? TOP_CLR : '#cbd5e1' }}>
                    {val}
                  </span>
                  <div className="flex items-center gap-2">
                    {isTop && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ background: `${TOP_CLR}22`, color: TOP_CLR, border: `1px solid ${TOP_CLR}44` }}>
                        TOP
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-700">[{idx}]</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Base plate */}
        <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="text-center mt-1">
          <span className="text-xs font-mono text-slate-700">▼ base</span>
        </div>
      </div>
    </div>
  )
}

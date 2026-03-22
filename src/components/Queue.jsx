// Queue.jsx — FIFO visualizer
// Items in a horizontal row, front left, rear right

import { useState } from 'react'

const ACCENT   = '#a78bfa'   // purple for queue
const FRONT_CLR = '#22d3ee'  // cyan front
const REAR_CLR  = '#4ade80'  // green rear

export default function Queue() {
  const [items,    setItems]    = useState([])
  const [input,    setInput]    = useState('')
  const [error,    setError]    = useState('')
  const [animIdx,  setAnimIdx]  = useState(null)
  const [animType, setAnimType] = useState(null)  // 'enqueue' | 'dequeue'

  function enqueue() {
    const val = input.trim()
    if (!val) { setError('Enter a value to enqueue'); return }
    if (items.length >= 8) { setError('Queue is full (max 8)'); return }
    setError('')
    setInput('')
    const newIdx = items.length
    setItems(prev => [...prev, val])
    setAnimIdx(newIdx)
    setAnimType('enqueue')
    setTimeout(() => { setAnimIdx(null); setAnimType(null) }, 400)
  }

  function dequeue() {
    if (items.length === 0) { setError('Queue is empty'); return }
    setError('')
    setAnimIdx(0)
    setAnimType('dequeue')
    setTimeout(() => {
      setItems(prev => prev.slice(1))
      setAnimIdx(null)
      setAnimType(null)
    }, 350)
  }

  function peek() {
    if (items.length === 0) { setError('Queue is empty'); return }
    setError('')
    setAnimIdx(0)
    setAnimType('peek')
    setTimeout(() => { setAnimIdx(null); setAnimType(null) }, 800)
  }

  function reset() {
    setItems([]); setInput(''); setError('')
    setAnimIdx(null); setAnimType(null)
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: ACCENT }}>Queue</span>
        <span className="text-xs text-slate-600 font-mono ml-1">FIFO · {items.length}/8</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="value..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none flex-1 min-w-0"
          style={{ maxWidth: 120 }}
        />
        <button onClick={enqueue}
          className="px-4 py-2 rounded-lg text-xs font-bold font-mono"
          style={{ background: ACCENT, color: '#000', border: `1px solid ${ACCENT}`, boxShadow: `0 0 10px ${ACCENT}44`, cursor: 'pointer' }}>
          Enqueue
        </button>
        <button onClick={dequeue}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400"
          style={{ background: 'transparent', cursor: 'pointer' }}>
          Dequeue
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

      {/* Queue visualization */}
      <div
        className="flex-1 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-center overflow-hidden"
        style={{ padding: '16px 20px', minHeight: 200 }}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-2xl opacity-20">⬜</span>
            <span className="text-xs font-mono text-slate-700">Queue is empty</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Direction labels */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono" style={{ color: FRONT_CLR }}>← DEQUEUE (front)</span>
              <span className="text-xs font-mono" style={{ color: REAR_CLR }}>ENQUEUE (rear) →</span>
            </div>

            {/* Items row */}
            <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
              {items.map((val, idx) => {
                const isFront  = idx === 0
                const isRear   = idx === items.length - 1
                const isAnim   = idx === animIdx
                const enqueueing = isAnim && animType === 'enqueue'
                const dequeueing = isAnim && animType === 'dequeue'
                const peeking    = isAnim && animType === 'peek'

                const borderColor = isFront ? FRONT_CLR : isRear ? REAR_CLR : 'rgba(255,255,255,0.08)'
                const bgColor     = isFront
                  ? `${FRONT_CLR}22`
                  : isRear
                  ? `${REAR_CLR}18`
                  : 'rgba(255,255,255,0.04)'

                return (
                  <div
                    key={idx}
                    style={{
                      minWidth:    70,
                      background:  bgColor,
                      border:      `1px solid ${borderColor}`,
                      borderRadius: 8,
                      padding:     '12px 10px',
                      display:     'flex',
                      flexDirection: 'column',
                      alignItems:  'center',
                      gap:         6,
                      transform:   enqueueing ? 'translateY(-10px) scale(1.05)' : dequeueing ? 'translateX(-30px) scale(0.85)' : peeking ? 'scale(1.08)' : 'none',
                      opacity:     dequeueing ? 0 : 1,
                      transition:  'transform 300ms cubic-bezier(0.34,1.4,0.64,1), opacity 300ms ease',
                      boxShadow:   isFront ? `0 0 10px ${FRONT_CLR}33` : isRear ? `0 0 10px ${REAR_CLR}33` : peeking ? `0 0 14px ${ACCENT}55` : 'none',
                      flexShrink:  0,
                    }}
                  >
                    <span className="text-sm font-bold font-mono"
                      style={{ color: isFront ? FRONT_CLR : isRear ? REAR_CLR : '#cbd5e1' }}>
                      {val}
                    </span>
                    <span className="text-xs font-mono text-slate-700">[{idx}]</span>
                    {isFront && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                        style={{ background: `${FRONT_CLR}22`, color: FRONT_CLR, border: `1px solid ${FRONT_CLR}44`, fontSize: 9 }}>
                        FRONT
                      </span>
                    )}
                    {isRear && items.length > 1 && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                        style={{ background: `${REAR_CLR}22`, color: REAR_CLR, border: `1px solid ${REAR_CLR}44`, fontSize: 9 }}>
                        REAR
                      </span>
                    )}
                    {isFront && isRear && (
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                        style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44`, fontSize: 9 }}>
                        F+R
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Arrow track */}
            <div className="flex items-center gap-0 px-1">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs font-mono text-slate-700 mx-2">→</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

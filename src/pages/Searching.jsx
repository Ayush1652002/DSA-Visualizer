import { useState, useEffect, useRef } from 'react'
import { linearCode, generateLinearSteps } from '../algorithms/Searching/linear.js'
import { binaryCode, generateBinarySteps } from '../algorithms/Searching/binary.js'
import CodeViewer from '../components/CodeViewer.jsx'

// ── Colors ────────────────────────────────────────────────────────
const CYAN   = '#22d3ee'   // current index being checked
const PURPLE = '#a78bfa'   // mid pointer (binary)
const GREEN  = '#4ade80'   // found
const DIMMED = '#0f2d40'   // out of search range

const SPEEDS = { slow: 700, medium: 250, fast: 60 }

function makeArray(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 88) + 8)
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const h = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return isDesktop
}

const ALGORITHMS = {
  linear: { name: 'Linear Search', color: CYAN,   code: linearCode },
  binary: { name: 'Binary Search', color: PURPLE, code: binaryCode },
}

export default function Searching() {
  const [algoKey,   setAlgoKey]   = useState('linear')
  const [rawArr,    setRawArr]    = useState(() => makeArray(16))
  const [steps,     setSteps]     = useState([])
  const [stepIdx,   setStepIdx]   = useState(0)
  const [running,   setRunning]   = useState(false)
  const [finished,  setFinished]  = useState(false)
  const [target,    setTarget]    = useState('')
  const [speedKey,  setSpeedKey]  = useState('medium')
  const [inputErr,  setInputErr]  = useState('')
  const timerRef  = useRef(null)
  const isDesktop = useIsDesktop()

  const algo        = ALGORITHMS[algoKey]
  const currentStep = steps[stepIdx] ?? { line: -2, current: -1, found: -1, mid: -1, low: -1, high: -1, done: false }
  // Binary search returns a sorted array — use it if available
  const displayArr  = currentStep.arr ?? rawArr

  // ── Generate steps ────────────────────────────────────────────
  function runSearch() {
    const t = parseInt(target.trim(), 10)
    if (isNaN(t)) { setInputErr('Enter a valid number to search'); return }
    setInputErr('')
    clearInterval(timerRef.current)
    setRunning(false)
    setFinished(false)
    setStepIdx(0)

    if (algoKey === 'linear') {
      setSteps(generateLinearSteps(rawArr, t))
    } else {
      const { steps: s } = generateBinarySteps(rawArr, t)
      setSteps(s)
    }
  }

  // ── Auto-play ─────────────────────────────────────────────────
  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          setFinished(true)
          return prev
        }
        return prev + 1
      })
    }, SPEEDS[speedKey])
    return () => clearInterval(timerRef.current)
  }, [running, steps.length, speedKey])

  function handleStart() {
    if (steps.length === 0) { runSearch(); return }
    if (finished) { resetAll(); return }
    setRunning(r => !r)
  }

  function handleNext() {
    if (running) setRunning(false)
    setStepIdx(p => {
      const n = Math.min(p + 1, steps.length - 1)
      if (n >= steps.length - 1) setFinished(true)
      return n
    })
  }

  function handlePrev() {
    if (running) setRunning(false)
    setFinished(false)
    setStepIdx(p => Math.max(p - 1, 0))
  }

  function resetAll() {
    clearInterval(timerRef.current)
    setRunning(false)
    setFinished(false)
    setSteps([])
    setStepIdx(0)
  }

  function generateNew() {
    resetAll()
    setRawArr(makeArray(16))
  }

  // ── Bar coloring ──────────────────────────────────────────────
  function getBarColor(idx) {
    if (currentStep.found === idx)    return GREEN
    if (algoKey === 'binary') {
      if (currentStep.mid === idx)    return PURPLE
      // Dim bars outside current search range
      const low  = currentStep.low  ?? 0
      const high = currentStep.high ?? displayArr.length - 1
      if (idx < low || idx > high)    return DIMMED
    }
    if (currentStep.current === idx)  return CYAN
    return null
  }

  const max     = Math.max(...displayArr, 1)
  const progress = steps.length > 1 ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0

  const primaryLabel = steps.length === 0
    ? '▶ Search'
    : finished ? '↺ Reset'
    : running  ? '⏸ Pause'
    : stepIdx === 0 ? '▶ Start' : '▶ Resume'

  // Code panel dimensions — same as Sorting
  const codePanelStyle = isDesktop
    ? { width: 260, height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }
    : { width: '100%', height: 200, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }

  // Hint message
  function getHint() {
    if (steps.length === 0) return { text: 'Enter a target value and press Search', color: '#475569' }
    if (currentStep.found >= 0)  return { text: `✓ Found ${displayArr[currentStep.found]} at index ${currentStep.found}`, color: GREEN }
    if (currentStep.done)        return { text: `✗ Target not found in array`, color: '#f87171' }
    if (algoKey === 'linear' && currentStep.current >= 0)
      return { text: `Checking index ${currentStep.current} → value ${displayArr[currentStep.current]}`, color: CYAN }
    if (algoKey === 'binary' && currentStep.mid >= 0)
      return { text: `mid = ${currentStep.mid}, arr[mid] = ${displayArr[currentStep.mid]}, low = ${currentStep.low}, high = ${currentStep.high}`, color: PURPLE }
    return { text: 'Running…', color: CYAN }
  }

  const hint = getHint()

  return (
    <div
      className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
      style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}
    >
      {/* ── Algorithm tabs ── */}
      <div className="flex shrink-0 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {Object.entries(ALGORITHMS).map(([key, a]) => (
          <button key={key}
            onClick={() => { setAlgoKey(key); resetAll() }}
            className="px-4 md:px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all duration-200"
            style={{
              border:       'none',
              borderBottom: `2px solid ${algoKey === key ? a.color : 'transparent'}`,
              background:   algoKey === key ? `${a.color}15` : 'transparent',
              color:        algoKey === key ? a.color : '#4b5563',
              cursor:       'pointer',
            }}>
            {a.name}
          </button>
        ))}
      </div>

      {/* ── Controls ── */}
      <div
        className="flex flex-col gap-3 px-4 md:px-6 py-4 bg-white/5 border-b border-white/10 shrink-0"
      >
        {/* Row 1: target input + search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target input */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-xs font-mono text-slate-500">Target:</span>
            <input
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="e.g. 42"
              className="bg-transparent outline-none text-slate-200 text-xs font-mono w-20"
            />
          </div>

          {/* Primary button */}
          <button
            onClick={handleStart}
            className="px-5 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition-all duration-200"
            style={{
              background: running ? 'transparent' : algo.color,
              color:      running ? algo.color     : '#000',
              border:     `1px solid ${algo.color}`,
              boxShadow:  running ? 'none' : `0 0 16px ${algo.color}44`,
              cursor:     'pointer',
            }}
          >
            {primaryLabel}
          </button>

          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={stepIdx === 0 || steps.length === 0}
            className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'transparent', cursor: 'pointer' }}
          >
            ← Prev
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={finished || steps.length === 0}
            className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'transparent', cursor: 'pointer' }}
          >
            Next →
          </button>

          {/* Generate new */}
          <button
            onClick={generateNew}
            className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 transition-all duration-200"
            style={{ background: 'transparent', cursor: 'pointer' }}
          >
            ↺ New Array
          </button>

          <div className="flex-1" />

          {/* Speed */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {[['slow','Slow'],['medium','Med'],['fast','Fast']].map(([k, label]) => (
              <button key={k} onClick={() => setSpeedKey(k)}
                className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-150"
                style={{
                  background: speedKey === k ? `${algo.color}22` : 'transparent',
                  color:      speedKey === k ? algo.color : '#475569',
                  border:     'none', cursor: 'pointer',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: progress bar */}
        {steps.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 w-8 text-right shrink-0">{progress}%</span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%`, background: algo.color, boxShadow: `0 0 6px ${algo.color}` }} />
            </div>
            <span className="text-xs font-mono text-slate-600 w-16 text-right shrink-0">
              {stepIdx} / {steps.length - 1}
            </span>
          </div>
        )}

        {/* Error */}
        {inputErr && (
          <p className="text-xs font-mono text-red-400 flex items-center gap-1">
            <span>⚠</span> {inputErr}
          </p>
        )}
      </div>

      {/* ── Main body ── */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        overflow: 'hidden', minHeight: 0,
      }}>
        {/* Code panel */}
        <div style={{ ...codePanelStyle, overflow: 'hidden' }}>
          <CodeViewer
            code={algo.code}
            activeLine={currentStep.line}
            accentColor={algo.color}
          />
        </div>

        {/* Bars panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0 }}>

          {/* Hint */}
          <div
            className="flex items-center gap-2 px-4 py-2 mx-3 mt-3 rounded-lg shrink-0 text-xs font-mono"
            style={{
              background:  `${hint.color}0d`,
              border:      `1px solid ${hint.color}33`,
              color:       hint.color,
              transition:  'all 200ms ease',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: hint.color, boxShadow: `0 0 5px ${hint.color}` }} />
            {hint.text}
          </div>

          {/* Bars */}
          <div style={{ flex: 1, padding: isDesktop ? 16 : 12, overflow: 'hidden', minHeight: 0 }}>
            <div
              className="rounded-xl border border-white/10 bg-white/5"
              style={{ width: '100%', height: '100%', padding: 12, boxSizing: 'border-box', overflow: 'hidden' }}
            >
              <SearchBars
                arr={displayArr}
                getColor={getBarColor}
                max={max}
              />
            </div>
          </div>

          {/* Footer legend */}
          <div
            className="flex items-center border-t border-white/10 bg-white/5 shrink-0 flex-wrap"
            style={{ padding: '8px 16px', gap: '20px' }}
          >
            {[
              { color: CYAN,   label: 'Checking' },
              ...(algoKey === 'binary' ? [{ color: PURPLE, label: 'Mid point' }] : []),
              { color: GREEN,  label: 'Found' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: color, boxShadow: `0 0 5px ${color}`, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
              </div>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
              n = <strong style={{ color: '#64748b' }}>{displayArr.length}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Simple bar renderer (no swap animation needed for search) ─────
function SearchBars({ arr, getColor, max }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const n   = arr.length
  const gap = 3
  const barW = Math.min(60, Math.max(2, (w - gap * (n - 1)) / n))
  const totalW = barW * n + gap * (n - 1)
  const offsetX = (w - totalW) / 2

  function barBg(color) {
    if (!color) return 'linear-gradient(to top, #0d1f3c, #163354)'
    if (color === DIMMED) return 'linear-gradient(to top, #0a1a2a, #0f2040)'
    return `linear-gradient(to top, ${color}88, ${color})`
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', paddingTop: 20, boxSizing: 'border-box' }}>
      {w > 0 && arr.map((val, idx) => {
        const color = getColor(idx)
        const barH  = Math.max(2, (val / max) * h)
        const left  = offsetX + idx * (barW + gap)
        const top   = h - barH
        const labelColor = color && color !== DIMMED ? color : '#334155'

        return (
          <div
            key={idx}
            style={{ position: 'absolute', left, top: top - 18, width: barW }}
          >
            {/* Value label */}
            {barW >= 12 && (
              <div style={{
                width:      '100%',
                textAlign:  'center',
                fontSize:   Math.min(11, Math.max(8, barW * 0.45)),
                fontFamily: 'monospace',
                color:      labelColor,
                fontWeight: color && color !== DIMMED ? 700 : 400,
                height:     18,
                lineHeight: '18px',
                transition: 'color 150ms ease',
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {val}
              </div>
            )}
            {/* Bar */}
            <div
              style={{
                width:        barW,
                height:       barH,
                background:   barBg(color),
                boxShadow:    color && color !== DIMMED ? `0 0 10px ${color}77` : 'none',
                border:       color && color !== DIMMED ? `1px solid ${color}55` : 'none',
                borderRadius: '6px 6px 0 0',
                boxSizing:    'border-box',
                transition:   'background 150ms ease, box-shadow 150ms ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

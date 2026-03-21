import { useState, useEffect, useRef, useCallback } from 'react'
import Bars       from '../components/Bars.jsx'
import CodeViewer from '../components/CodeViewer.jsx'
import Controls   from '../components/Controls.jsx'
import { bubbleCode,    generateBubbleSteps    } from '../algorithms/bubble.js'
import { selectionCode, generateSelectionSteps } from '../algorithms/selection.js'
import { insertionCode, generateInsertionSteps } from '../algorithms/insertion.js'
import { mergeCode,     generateMergeSteps     } from '../algorithms/merge.js'
import { quickCode,     generateQuickSteps     } from '../algorithms/quick.js'

const ALGORITHMS = {
  bubble:    { name: 'Bubble',    color: '#22d3ee', code: bubbleCode,    gen: generateBubbleSteps    },
  selection: { name: 'Selection', color: '#a78bfa', code: selectionCode, gen: generateSelectionSteps },
  insertion: { name: 'Insertion', color: '#34d399', code: insertionCode, gen: generateInsertionSteps },
  merge:     { name: 'Merge',     color: '#38bdf8', code: mergeCode,     gen: generateMergeSteps     },
  quick:     { name: 'Quick',     color: '#fb7185', code: quickCode,     gen: generateQuickSteps     },
}

const SPEEDS   = { slow: 650, medium: 220, fast: 60 }
const MIN_SIZE = 4
const MAX_SIZE = 60

function makeArray(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 88) + 8)
}

// Simple hook to track if we're on desktop (>=768px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function Sorting() {
  const [algoKey,     setAlgoKey]     = useState('bubble')
  const [arraySize,   setArraySize]   = useState(28)
  const [speedKey,    setSpeedKey]    = useState('medium')
  const [baseArr,     setBaseArr]     = useState(() => makeArray(28))
  const [steps,       setSteps]       = useState([])
  const [stepIdx,     setStepIdx]     = useState(0)
  const [running,     setRunning]     = useState(false)
  const [finished,    setFinished]    = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [inputError,  setInputError]  = useState('')
  const timerRef   = useRef(null)
  const isDesktop  = useIsDesktop()

  const algo        = ALGORITHMS[algoKey]
  const currentStep = steps[stepIdx] ?? {
    arr: baseArr, comparing: [], swapped: [], sorted: [], line: -2,
  }

  useEffect(() => {
    clearInterval(timerRef.current)
    setRunning(false); setFinished(false)
    setSteps(algo.gen(baseArr)); setStepIdx(0)
  }, [algoKey, baseArr])

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timerRef.current); setRunning(false); setFinished(true); return prev
        }
        return prev + 1
      })
    }, SPEEDS[speedKey])
    return () => clearInterval(timerRef.current)
  }, [running, steps.length, speedKey])

  const stop = useCallback(() => {
    clearInterval(timerRef.current); setRunning(false); setFinished(false)
  }, [])

  const handleAlgoChange     = useCallback((key) => { stop(); setAlgoKey(key) }, [stop])
  const handleStartPause     = useCallback(() => {
    if (finished) { setBaseArr(makeArray(arraySize)); return }
    if (stepIdx >= steps.length - 1) { setFinished(true); return }
    setRunning((r) => !r)
  }, [finished, stepIdx, steps.length, arraySize])
  const handleNextStep       = useCallback(() => {
    if (running) setRunning(false)
    setStepIdx((prev) => {
      const next = Math.min(prev + 1, steps.length - 1)
      if (next >= steps.length - 1) setFinished(true)
      return next
    })
  }, [running, steps.length])
  const handleReset          = useCallback(() => {
    stop(); setBaseArr(makeArray(arraySize)); setCustomInput(''); setInputError('')
  }, [arraySize, stop])
  const handleSizeChange     = useCallback((n) => {
    stop(); setArraySize(n); setBaseArr(makeArray(n)); setCustomInput(''); setInputError('')
  }, [stop])
  const handleGenerateRandom = useCallback(() => {
    stop(); setBaseArr(makeArray(arraySize)); setCustomInput(''); setInputError('')
  }, [arraySize, stop])
  const handleUseCustomInput = useCallback(() => {
    if (!customInput.trim()) { setInputError('Input is empty.'); return }
    const parsed = customInput.split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 999)
    if (parsed.length < 2)       { setInputError('Enter at least 2 valid numbers (1–999).'); return }
    if (parsed.length > MAX_SIZE) { setInputError(`Max ${MAX_SIZE} values allowed.`); return }
    setInputError(''); stop(); setArraySize(parsed.length); setBaseArr(parsed)
  }, [customInput, stop])

  const comparingCount = currentStep.comparing?.length ?? 0
  const swappedCount   = currentStep.swapped?.length   ?? 0
  const sortedCount    = currentStep.sorted?.length    ?? 0
  const progress       = steps.length > 1
    ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0

  // ─── Layout dimensions ────────────────────────────────────────────
  // Code panel: 260px wide on desktop (sidebar), 200px tall on mobile (top strip)
  const codePanelStyle = isDesktop
    ? { width: 260, height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }
    : { width: '100%', height: 200, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }

  return (
    // position:fixed + inset:0 gives a guaranteed concrete pixel height so
    // every flex-1 child resolves correctly on all browsers / screen sizes.
    <div
      className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
    >

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: algo.color, boxShadow: `0 0 10px ${algo.color}` }} />
          <span className="text-sm font-bold tracking-widest uppercase">
            Sort<span style={{ color: algo.color }}>Lab</span>
          </span>
          <span className="hidden sm:inline text-xs text-slate-600">— DSA Visualizer</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'Comparing', color: '#22d3ee', count: comparingCount },
            { label: 'Swapping',  color: '#c084fc', count: swappedCount   },
            { label: 'Sorted',    color: '#4ade80', count: sortedCount    },
          ].map(({ label, color, count }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
              <span className="text-xs text-slate-500 hidden sm:inline">{label}</span>
              <span className="text-xs font-bold" style={{ color }}>{count}</span>
            </div>
          ))}
          <span className="text-xs text-slate-500 hidden md:block">
            Step <strong className="text-slate-300">{stepIdx}</strong>
            <span className="text-slate-700"> / {steps.length - 1}</span>
          </span>
        </div>
      </header>

      {/* ── Algorithm tabs ─────────────────────────────────────── */}
      <div className="flex shrink-0 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {Object.entries(ALGORITHMS).map(([key, a]) => (
          <button key={key} onClick={() => handleAlgoChange(key)}
            className="px-4 md:px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all duration-200"
            style={{
              border:       'none',
              borderBottom: `2px solid ${algoKey === key ? a.color : 'transparent'}`,
              background:   algoKey === key ? a.color + '15' : 'transparent',
              color:        algoKey === key ? a.color : '#4b5563',
              cursor:       'pointer',
            }}>
            {a.name}
          </button>
        ))}
      </div>

      {/* ── Controls ───────────────────────────────────────────── */}
      <Controls
        running={running} finished={finished}
        stepIdx={stepIdx} totalSteps={steps.length} progress={progress}
        arraySize={arraySize} speedKey={speedKey} accentColor={algo.color}
        customInput={customInput} inputError={inputError}
        minSize={MIN_SIZE} maxSize={MAX_SIZE}
        onStartPause={handleStartPause} onNextStep={handleNextStep}
        onReset={handleReset} onSizeChange={handleSizeChange}
        onSpeedChange={setSpeedKey} onCustomInputChange={setCustomInput}
        onUseCustomInput={handleUseCustomInput} onGenerateRandom={handleGenerateRandom}
      />

      {/* ── Main body ──────────────────────────────────────────────
           flex-1 resolves correctly because parent is position:fixed.
           isDesktop → row layout. mobile → column layout.
      ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex:     1,
          display:  'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >

        {/* Code panel — exact pixel sizes, no ambiguity */}
        <div style={{ ...codePanelStyle, overflow: 'hidden' }}>
          <CodeViewer
            code={algo.code}
            activeLine={currentStep.line}
            accentColor={algo.color}
          />
        </div>

        {/* Bars panel — takes ALL remaining space */}
        <div
          style={{
            flex:     1,
            display:  'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* Bar card */}
          <div style={{ flex: 1, padding: isDesktop ? 16 : 12, overflow: 'hidden', minHeight: 0 }}>
            <div
              className="rounded-xl border border-white/10 bg-white/5"
              style={{ width: '100%', height: '100%', padding: 12, boxSizing: 'border-box' }}
            >
              <Bars
                arr={currentStep.arr}
                comparing={currentStep.comparing ?? []}
                swapped={currentStep.swapped     ?? []}
                sorted={currentStep.sorted       ?? []}
                algoKey={algoKey}
                accentColor={algo.color}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex flex-wrap items-center gap-4 border-t border-white/10 bg-white/5 text-xs font-mono text-slate-600"
            style={{ padding: '8px 20px', flexShrink: 0 }}
          >
            <span>n = <strong className="text-slate-400">{currentStep.arr?.length ?? arraySize}</strong></span>
            <span>line = <strong style={{ color: algo.color }}>{currentStep.line >= 0 ? currentStep.line + 1 : '—'}</strong></span>
            <span>steps = <strong className="text-slate-400">{steps.length - 1}</strong></span>
            {finished && <span className="font-bold ml-auto text-green-400">✓ Sorted!</span>}
          </div>
        </div>

      </div>
    </div>
  )
}

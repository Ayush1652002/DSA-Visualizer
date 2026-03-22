import { useState, useEffect, useRef, useCallback } from 'react'
import GraphCanvas from '../components/GraphCanvas.jsx'
import CodeViewer  from '../components/CodeViewer.jsx'
import { bfsCode, runGraphBFS } from '../algorithms/graph/bfs.js'
import { dfsCode, runGraphDFS } from '../algorithms/graph/dfs.js'

const ACCENT  = '#22d3ee'
const SPEEDS  = { slow: 800, medium: 250, fast: 60 }

const ALGO = {
  bfs: { name: 'BFS', color: ACCENT,   code: bfsCode, run: runGraphBFS, dataLabel: 'Queue' },
  dfs: { name: 'DFS', color: '#a78bfa', code: dfsCode, run: runGraphDFS, dataLabel: 'Stack' },
}

// Default sample graph so page isn't blank
const DEFAULT_NODES = [
  { id: 'A', label: 'A', x: 200, y: 120 },
  { id: 'B', label: 'B', x: 100, y: 260 },
  { id: 'C', label: 'C', x: 320, y: 260 },
  { id: 'D', label: 'D', x: 60,  y: 380 },
  { id: 'E', label: 'E', x: 200, y: 380 },
  { id: 'F', label: 'F', x: 380, y: 380 },
]
const DEFAULT_EDGES = [
  { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
  { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
  { from: 'C', to: 'E' }, { from: 'C', to: 'F' },
]

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

let nodeCounter = 7  // next node label index (A=1,B=2... continue from G)
const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function Graph() {
  const isDesktop = useIsDesktop()

  const [nodes,     setNodes]     = useState(DEFAULT_NODES)
  const [edges,     setEdges]     = useState(DEFAULT_EDGES)
  const [algoKey,   setAlgoKey]   = useState('bfs')
  const [mode,      setMode]      = useState('add')     // 'add'|'connect'|'delete'|'move'
  const [selected,  setSelected]  = useState(null)      // node id selected in connect mode
  const [startNode, setStartNode] = useState('A')
  const [speedKey,  setSpeedKey]  = useState('medium')
  const [running,   setRunning]   = useState(false)
  const [finished,  setFinished]  = useState(false)
  const [steps,     setSteps]     = useState([])
  const [stepIdx,   setStepIdx]   = useState(-1)

  const timerRef   = useRef(null)
  const runningRef = useRef(false)
  const speedRef   = useRef(SPEEDS[speedKey])
  const algo       = ALGO[algoKey]

  useEffect(() => { speedRef.current = SPEEDS[speedKey] }, [speedKey])
  useEffect(() => { runningRef.current = running }, [running])

  // Canvas size
  const canvasW = isDesktop ? 560 : 340
  const canvasH = isDesktop ? 460 : 320

  // Current step data
  const currentStep = steps[stepIdx] ?? null
  const stepData    = currentStep ? {
    activeNode:   currentStep.activeNode,
    visitedNodes: currentStep.visitedNodes,
    activeEdge:   currentStep.activeEdge,
  } : null

  const activeLine = currentStep?.line ?? -1
  const hint       = currentStep?.hint ?? (steps.length === 0
    ? `Select start node, then press Start (${mode} mode active)`
    : 'Paused')
  const dataSize   = currentStep?.queueSize ?? currentStep?.stackDepth ?? 0

  // ── Reset viz ────────────────────────────────────────────────
  function stopTimer() { clearTimeout(timerRef.current) }

  function resetViz() {
    stopTimer(); runningRef.current = false
    setRunning(false); setFinished(false)
    setStepIdx(-1); setSteps([])
  }

  function resetGraph() {
    resetViz()
    setNodes(DEFAULT_NODES); setEdges(DEFAULT_EDGES)
    setStartNode('A'); setSelected(null)
    nodeCounter = 7
  }

  function clearGraph() {
    resetViz()
    setNodes([]); setEdges([])
    setSelected(null); setStartNode(null)
    nodeCounter = 0
  }

  // ── Prepare + run ────────────────────────────────────────────
  function prepareSteps() {
    if (!startNode) return []
    resetViz()
    const s = algo.run(nodes, edges, startNode)
    setSteps(s)
    return s
  }

  // ── Auto-play ────────────────────────────────────────────────
  useEffect(() => {
    if (!running || steps.length === 0) { stopTimer(); return }
    const len = steps.length
    function tick() {
      if (!runningRef.current) return
      setStepIdx(prev => {
        const next = prev + 1
        if (next >= len) { setRunning(false); runningRef.current = false; setFinished(true); return prev }
        timerRef.current = setTimeout(tick, speedRef.current)
        return next
      })
    }
    timerRef.current = setTimeout(tick, speedRef.current)
    return stopTimer
  }, [running, steps.length])

  // ── Controls ─────────────────────────────────────────────────
  function handleStart() {
    if (running) { stopTimer(); runningRef.current = false; setRunning(false); return }
    if (finished) { resetViz(); return }
    if (!startNode) return
    if (steps.length === 0) {
      const s = prepareSteps()
      setStepIdx(0)
      setTimeout(() => { runningRef.current = true; setRunning(true) }, 50)
      return
    }
    runningRef.current = true; setRunning(true)
  }

  function handleNext() {
    stopTimer(); runningRef.current = false; setRunning(false)
    if (steps.length === 0) { const s = prepareSteps(); setStepIdx(0); return }
    setStepIdx(prev => { const n = Math.min(prev + 1, steps.length - 1); if (n >= steps.length - 1) setFinished(true); return n })
  }

  function handlePrev() {
    stopTimer(); runningRef.current = false; setRunning(false); setFinished(false)
    setStepIdx(prev => Math.max(prev - 1, 0))
  }

  function handleSkip() {
    stopTimer(); runningRef.current = false; setRunning(false)
    if (steps.length === 0) { const s = prepareSteps(); setStepIdx(s.length - 1); setFinished(true); return }
    setStepIdx(steps.length - 1); setFinished(true)
  }

  // ── Canvas interactions ──────────────────────────────────────
  function handleCanvasClick(x, y) {
    if (mode !== 'add') return
    resetViz()
    const label = LABELS[nodeCounter % 26] + (nodeCounter >= 26 ? Math.floor(nodeCounter / 26) : '')
    const newNode = { id: label, label, x: Math.round(x), y: Math.round(y) }
    nodeCounter++
    setNodes(prev => [...prev, newNode])
    if (!startNode) setStartNode(newNode.id)
  }

  function handleNodeClick(id) {
    if (mode === 'delete') {
      resetViz()
      setNodes(prev => prev.filter(n => n.id !== id))
      setEdges(prev => prev.filter(e => e.from !== id && e.to !== id))
      if (startNode === id) setStartNode(nodes.find(n => n.id !== id)?.id ?? null)
      return
    }
    if (mode === 'connect') {
      resetViz()
      if (!selected) { setSelected(id); return }
      if (selected === id) { setSelected(null); return }
      // Add edge if not exists
      const exists = edges.some(e =>
        (e.from === selected && e.to === id) || (e.from === id && e.to === selected)
      )
      if (!exists) setEdges(prev => [...prev, { from: selected, to: id }])
      setSelected(null)
      return
    }
    if (mode === 'start') {
      setStartNode(id); resetViz(); return
    }
    // Default — set start node
    setStartNode(id); resetViz()
  }

  function handleNodeDrag(id, x, y) {
    if (mode !== 'move') return
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: Math.round(x), y: Math.round(y) } : n))
  }

  const primaryLabel = running ? '⏸ Pause' : finished ? '↺ Reset' : steps.length === 0 ? '▶ Start' : '▶ Resume'
  const progress     = steps.length > 0 ? Math.round((Math.max(stepIdx, 0) / (steps.length - 1)) * 100) : 0

  const codePanelStyle = isDesktop
    ? { width: 220, height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }
    : { width: '100%', height: 160, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }

  return (
    <div className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
      style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>

      {/* ── Algorithm tabs ── */}
      <div className="flex shrink-0 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {Object.entries(ALGO).map(([key, a]) => (
          <button key={key} onClick={() => { setAlgoKey(key); resetViz() }}
            className="px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0"
            style={{
              border: 'none',
              borderBottom: `2px solid ${algoKey === key ? a.color : 'transparent'}`,
              background:   algoKey === key ? `${a.color}15` : 'transparent',
              color:        algoKey === key ? a.color : '#4b5563',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {a.name}
          </button>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3 bg-white/5 border-b border-white/10 shrink-0">

        {/* Playback */}
        <button onClick={handleStart} disabled={!startNode || nodes.length === 0}
          className="px-5 py-2 rounded-lg text-xs font-bold font-mono disabled:opacity-40"
          style={{ background: running ? 'transparent' : algo.color, color: running ? algo.color : '#000', border: `1px solid ${algo.color}`, boxShadow: running ? 'none' : `0 0 12px ${algo.color}44`, cursor: 'pointer', transition: 'all 0.15s' }}>
          {primaryLabel}
        </button>

        <button onClick={handlePrev} disabled={stepIdx <= 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>← Prev</button>

        <button onClick={handleNext} disabled={finished || nodes.length === 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>Next →</button>

        <button onClick={handleSkip} disabled={nodes.length === 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>⚡ Skip</button>

        <button onClick={resetViz} disabled={stepIdx < 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>↺ Reset Viz</button>

        <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

        {/* Mode selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[
            ['add',     '✚ Add Node'],
            ['connect', '⟵ Connect'],
            ['move',    '✥ Move'],
            ['delete',  '✕ Delete'],
          ].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setSelected(null) }}
              className="px-3 py-1 rounded-md text-xs font-mono font-semibold"
              style={{ background: mode === m ? `${algo.color}22` : 'transparent', color: mode === m ? algo.color : '#475569', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Start node selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 shrink-0">Start:</span>
          <select
            value={startNode ?? ''}
            onChange={e => { setStartNode(e.target.value); resetViz() }}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 outline-none"
            style={{ cursor: 'pointer' }}
          >
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>

        {/* Graph controls */}
        <button onClick={resetGraph}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400"
          style={{ background: 'transparent', cursor: 'pointer' }}>↺ Sample</button>

        <button onClick={clearGraph}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-600"
          style={{ background: 'transparent', cursor: 'pointer' }}>🗑 Clear</button>

        {/* Speed */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[['slow','Slow'],['medium','Med'],['fast','Fast']].map(([k, l]) => (
            <button key={k} onClick={() => setSpeedKey(k)}
              className="px-3 py-1 rounded-md text-xs font-mono font-semibold"
              style={{ background: speedKey === k ? `${algo.color}22` : 'transparent', color: speedKey === k ? algo.color : '#475569', border: 'none', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hint + progress ── */}
      <div className="shrink-0 px-4 md:px-6 py-2 border-b border-white/10 flex flex-col gap-1.5"
        style={{ background: 'rgba(4,9,18,0.7)' }}>

        {steps.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 w-8 text-right shrink-0">{progress}%</span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: algo.color, boxShadow: `0 0 6px ${algo.color}` }} />
            </div>
            <span className="text-xs font-mono text-slate-600 shrink-0">{Math.max(stepIdx,0)} / {steps.length-1}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono"
          style={{ color: finished ? '#4ade80' : algo.color }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'currentColor', boxShadow: '0 0 4px currentColor' }} />
          <span>{hint}</span>
          {dataSize > 0 && (
            <span className="ml-auto text-slate-600">{algo.dataLabel}: <strong style={{ color: algo.color }}>{dataSize}</strong></span>
          )}
        </div>

        {/* Mode hint */}
        <div className="text-xs font-mono text-slate-700">
          {mode === 'add'     && 'Click anywhere on canvas to add a node'}
          {mode === 'connect' && (selected ? `Node ${selected} selected — click another node to connect` : 'Click a node to start connecting')}
          {mode === 'move'    && 'Drag nodes to reposition them'}
          {mode === 'delete'  && 'Click a node to delete it and its edges'}
        </div>
      </div>

      {/* ── Main body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Code panel */}
        <div style={codePanelStyle}>
          <CodeViewer code={algo.code} activeLine={activeLine} accentColor={algo.color} />
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-center justify-center"
          style={{ padding: isDesktop ? 20 : 10, minWidth: 0, minHeight: 0 }}>
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            mode={mode}
            selected={selected}
            startNode={startNode}
            stepData={stepData}
            onCanvasClick={handleCanvasClick}
            onNodeClick={handleNodeClick}
            onNodeDrag={handleNodeDrag}
            width={canvasW}
            height={canvasH}
          />
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center flex-wrap border-t border-white/10 bg-white/5 shrink-0"
        style={{ padding: '7px 16px', gap: 16 }}>
        {[
          { color: '#fb7185', label: 'Start node'   },
          { color: '#22d3ee', label: 'Active node'  },
          { color: '#0f2d4a', label: 'Visited',  border: '#22d3ee' },
          { color: '#22d3ee', label: 'Active edge', line: true },
          { color: '#a78bfa', label: 'Selected', dashed: true },
        ].map(({ color, label, border, line, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {line
              ? <div style={{ width: 16, height: 2, background: color, borderRadius: 1, boxShadow: `0 0 4px ${color}` }} />
              : <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, border: `1.5px solid ${border || color}`, display: 'inline-block', boxShadow: `0 0 5px ${color}77`, outline: dashed ? `2px dashed ${color}` : 'none', outlineOffset: 1 }} />
            }
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>
    </div>
  )
}
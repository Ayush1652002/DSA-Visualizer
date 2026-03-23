import { useState, useEffect, useRef, useCallback } from 'react'
import GraphCanvas from '../components/GraphCanvas.jsx'
import CodeViewer  from '../components/CodeViewer.jsx'
import { bfsCode, runGraphBFS } from '../algorithms/graph/bfs.js'
import { dfsCode, runGraphDFS } from '../algorithms/graph/dfs.js'

const ACCENT = '#22d3ee'
const SPEEDS = { slow: 800, medium: 250, fast: 60 }

const ALGO = {
  bfs: { name: 'BFS', color: ACCENT,   code: bfsCode, run: runGraphBFS, dataLabel: 'Queue',
         desc: 'Visits neighbors level by level — always finds shortest path' },
  dfs: { name: 'DFS', color: '#a78bfa', code: dfsCode, run: runGraphDFS, dataLabel: 'Stack',
         desc: 'Dives deep into one path before backtracking' },
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Build a binary tree from array values, centered in canvas
function buildTreeFromArray(values, canvasW, canvasH) {
  const nodes = []
  const edges = []
  const n = Math.min(values.length, 15) // max 15 nodes

  const levelHeight = Math.min(90, (canvasH - 60) / Math.ceil(Math.log2(n + 1)))
  const startY = 60

  for (let i = 0; i < n; i++) {
    const level  = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, level) - 1)
    const nodesInLevel = Math.pow(2, level)
    const totalW = canvasW - 80
    const x = 40 + (totalW / (nodesInLevel + 1)) * (posInLevel + 1)
    const y = startY + level * levelHeight
    const id = LABELS[i] || `N${i}`
    nodes.push({ id, label: String(values[i]), x: Math.round(x), y: Math.round(y) })

    // Parent edge
    if (i > 0) {
      const parentIdx = Math.floor((i - 1) / 2)
      const parentId  = LABELS[parentIdx] || `N${parentIdx}`
      edges.push({ from: parentId, to: id })
    }
  }

  return { nodes, edges, startId: nodes[0]?.id ?? null }
}

// Default centered tree
function makeDefaultGraph(canvasW, canvasH) {
  const cx = canvasW / 2
  const cy = canvasH / 2 - 60
  const lh = 100  // level height
  const lw = 140  // level width

  const nodes = [
    { id: 'A', label: 'A', x: cx,         y: cy          },
    { id: 'B', label: 'B', x: cx - lw,    y: cy + lh     },
    { id: 'C', label: 'C', x: cx + lw,    y: cy + lh     },
    { id: 'D', label: 'D', x: cx - lw*1.5, y: cy + lh*2  },
    { id: 'E', label: 'E', x: cx - lw*0.5, y: cy + lh*2  },
    { id: 'F', label: 'F', x: cx + lw*1.5, y: cy + lh*2  },
  ]
  const edges = [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
  ]
  return { nodes, edges }
}

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

let nodeCounter = 0
const MANUAL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function Graph() {
  const isDesktop = useIsDesktop()
  const baseW     = isDesktop ? 680 : 480
  const defGraph  = makeDefaultGraph(baseW, 580)

  const [nodes,     setNodes]     = useState(defGraph.nodes)
  const [edges,     setEdges]     = useState(defGraph.edges)
  const [algoKey,   setAlgoKey]   = useState('bfs')
  const [mode,      setMode]      = useState('add')
  const [selected,  setSelected]  = useState(null)
  const [startNode, setStartNode] = useState('A')
  const [speedKey,  setSpeedKey]  = useState('medium')
  const [running,   setRunning]   = useState(false)
  const [finished,  setFinished]  = useState(false)
  const [steps,     setSteps]     = useState([])
  const [stepIdx,   setStepIdx]   = useState(-1)
  const [arrayInput, setArrayInput] = useState('')
  const [arrayErr,   setArrayErr]   = useState('')
  const [visitOrder, setVisitOrder] = useState({})

  // Canvas grows to fit all nodes + 80px padding on each side
  const canvasW = Math.max(baseW, ...nodes.map(n => n.x + 80))
  const canvasH = Math.max(580,   ...nodes.map(n => n.y + 80))

  // Fix nodeCounter to be past existing nodes on mount
  useEffect(() => {
    const usedLabels = new Set(defGraph.nodes.map(n => n.id))
    let i = 0
    while (usedLabels.has(MANUAL_LABELS[i % 26])) i++
    nodeCounter = i
  }, [])

  const timerRef   = useRef(null)
  const runningRef = useRef(false)
  const speedRef   = useRef(SPEEDS[speedKey])
  const algo       = ALGO[algoKey]

  useEffect(() => { speedRef.current = SPEEDS[speedKey] }, [speedKey])
  useEffect(() => { runningRef.current = running }, [running])

  // Build visit order up to current step
  useEffect(() => {
    if (stepIdx < 0 || steps.length === 0) { setVisitOrder({}); return }
    const order = {}
    let count = 1
    for (let i = 0; i <= stepIdx; i++) {
      const s = steps[i]
      if ((s.type === 'visit' || s.type === 'dequeue' || s.type === 'pop') &&
          s.activeNode && !order[s.activeNode]) {
        order[s.activeNode] = count++
      }
    }
    setVisitOrder(order)
  }, [stepIdx, steps])

  // Current step
  const currentStep = steps[stepIdx] ?? null
  const stepData    = currentStep ? {
    activeNode:   currentStep.activeNode,
    visitedNodes: currentStep.visitedNodes,
    activeEdge:   currentStep.activeEdge,
    visitOrder,
  } : null

  const activeLine = currentStep?.line ?? -1
  const dataSize   = currentStep?.queueSize ?? currentStep?.stackDepth ?? 0

  // Live queue/stack content derived from steps
  function getLiveQueue() {
    if (!currentStep || stepIdx < 0) return []
    const visited = new Set(currentStep.visitedNodes ?? [])
    const active  = currentStep.activeNode
    return (currentStep.visitedNodes ?? []).filter(n => n !== active)
  }

  // Hint
  function getHint() {
    if (!currentStep) {
      if (steps.length === 0) return { text: algo.desc + ' — press ▶ Start', color: '#475569' }
      return { text: 'Paused', color: '#475569' }
    }
    if (currentStep.hint) return { text: currentStep.hint, color: algo.color }
    return { text: 'Running…', color: algo.color }
  }
  const hintData = getHint()

  // ── Reset ───────────────────────────────────────────────────
  function stopTimer() { clearTimeout(timerRef.current) }

  function resetViz() {
    stopTimer(); runningRef.current = false
    setRunning(false); setFinished(false)
    setStepIdx(-1); setSteps([])
    setVisitOrder({})
  }

  function resetGraph() {
    resetViz()
    const g = makeDefaultGraph(canvasW, 580)
    setNodes(g.nodes); setEdges(g.edges)
    setStartNode('A'); setSelected(null)
    nodeCounter = g.nodes.length  // A-F = 6 nodes, next is G
    setArrayInput('')
  }

  function clearGraph() {
    resetViz()
    setNodes([]); setEdges([])
    setSelected(null); setStartNode(null)
    nodeCounter = 0
  }

  // ── Build tree from array input ─────────────────────────────
  function handleBuildTree() {
    const raw = arrayInput.trim()
    if (!raw) { setArrayErr('Enter values e.g. 1,2,3,4,5'); return }
    const vals = raw.split(',').map(s => s.trim()).filter(Boolean)
    if (vals.length < 1)  { setArrayErr('Enter at least 1 value'); return }
    if (vals.length > 15) { setArrayErr('Max 15 values'); return }
    setArrayErr('')
    resetViz()
    const { nodes: n, edges: e, startId } = buildTreeFromArray(vals, canvasW, canvasH)
    setNodes(n); setEdges(e)
    setStartNode(startId)
    nodeCounter = n.length
    setSelected(null)
  }

  // ── Prepare ─────────────────────────────────────────────────
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
    if (steps.length === 0) { prepareSteps(); setStepIdx(0); return }
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

  // ── Canvas interactions ───────────────────────────────────────
  function handleCanvasClick(x, y) {
    if (mode !== 'add') return
    resetViz()
    // Find next unused label
    const usedIds = new Set(nodes.map(n => n.id))
    while (usedIds.has(MANUAL_LABELS[nodeCounter % 26])) nodeCounter++
    const id = MANUAL_LABELS[nodeCounter % 26]
    nodeCounter++
    const newNode = { id, label: id, x: Math.round(x), y: Math.round(y) }
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
      const exists = edges.some(e =>
        (e.from === selected && e.to === id) || (e.from === id && e.to === selected))
      if (!exists) setEdges(prev => [...prev, { from: selected, to: id }])
      setSelected(null); return
    }
    if (mode === 'start' || mode === 'add') {
      setStartNode(id); resetViz()
    }
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

      {/* Algorithm tabs */}
      <div className="flex shrink-0 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {Object.entries(ALGO).map(([key, a]) => (
          <button key={key} onClick={() => { setAlgoKey(key); resetViz() }}
            className="px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0"
            style={{ border: 'none', borderBottom: `2px solid ${algoKey === key ? a.color : 'transparent'}`, background: algoKey === key ? `${a.color}15` : 'transparent', color: algoKey === key ? a.color : '#4b5563', cursor: 'pointer', transition: 'all 0.15s' }}>
            {a.name}
          </button>
        ))}
        <span className="flex items-center ml-4 text-xs font-mono text-slate-600 hidden md:flex">{algo.desc}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-3 md:px-6 py-2 bg-white/5 border-b border-white/10 shrink-0"
        style={{ overflowX: isDesktop ? 'visible' : 'auto', flexWrap: isDesktop ? 'wrap' : 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={handleStart} disabled={!startNode || nodes.length === 0}
          className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono disabled:opacity-40"
          style={{ background: running ? 'transparent' : algo.color, color: running ? algo.color : '#000', border: `1px solid ${algo.color}`, boxShadow: running ? 'none' : `0 0 12px ${algo.color}44`, cursor: 'pointer', transition: 'all 0.15s' }}>
          {primaryLabel}
        </button>
        <button onClick={handlePrev} disabled={stepIdx <= 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>← Prev</button>
        <button onClick={handleNext} disabled={finished || nodes.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>Next →</button>
        <button onClick={handleSkip} disabled={nodes.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>⚡ Skip</button>
        <button onClick={resetViz} disabled={stepIdx < 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>↺ Reset Viz</button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Mode */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/10">
          {[['add','✚ Add'],['connect','⟵ Connect'],['move','✥ Move'],['delete','✕ Delete']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setSelected(null) }}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
              style={{ background: mode === m ? `${algo.color}22` : 'transparent', color: mode === m ? algo.color : '#475569', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Start node */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Start:</span>
          <select value={startNode ?? ''} onChange={e => { setStartNode(e.target.value); resetViz() }}
            className="rounded-lg px-2 py-1 text-xs font-mono text-slate-300 outline-none"
            style={{ background: '#0d1b2e', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>

        <button onClick={resetGraph}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400"
          style={{ background: 'transparent', cursor: 'pointer' }}>↺ Sample</button>
        <button onClick={clearGraph}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-600"
          style={{ background: 'transparent', cursor: 'pointer' }}>🗑 Clear</button>

        {/* Speed */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/10">
          {[['slow','Slow'],['medium','Med'],['fast','Fast']].map(([k, l]) => (
            <button key={k} onClick={() => setSpeedKey(k)}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
              style={{ background: speedKey === k ? `${algo.color}22` : 'transparent', color: speedKey === k ? algo.color : '#475569', border: 'none', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Array input row */}
      <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-2 bg-white/[0.02] border-b border-white/10 shrink-0">
        <span className="text-xs font-mono text-slate-500 shrink-0">Build Tree:</span>
        <div className="flex items-center gap-2 flex-1">
          <input type="text" value={arrayInput} onChange={e => setArrayInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuildTree()}
            placeholder="Enter values e.g. 1, 2, 3, 4, 5, 6, 7"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none placeholder-slate-700"
            style={{ minWidth: 200 }} />
          <button onClick={handleBuildTree}
            className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono whitespace-nowrap"
            style={{ background: `${algo.color}1a`, color: algo.color, border: `1px solid ${algo.color}44`, cursor: 'pointer' }}>
            Build Tree
          </button>
        </div>
        {arrayErr && <span className="text-xs font-mono text-red-400">⚠ {arrayErr}</span>}
        <span className="text-xs font-mono text-slate-700 hidden md:block">or click canvas to add nodes manually</span>
      </div>

      {/* Hint + progress + queue panel */}
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

        <div className="flex items-center gap-3 flex-wrap">
          {/* Hint */}
          <div className="flex items-center gap-2 text-xs font-mono flex-1"
            style={{ color: finished ? '#4ade80' : hintData.color }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'currentColor', boxShadow: '0 0 4px currentColor' }} />
            <span>{hintData.text}</span>
          </div>

          {/* Live Queue/Stack display */}
          {dataSize > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-600">{algo.dataLabel}:</span>
              <div className="flex items-center gap-1">
                {(currentStep?.visitedNodes ?? []).slice(-6).map((nid, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded font-bold"
                    style={{ background: `${algo.color}22`, color: algo.color, border: `1px solid ${algo.color}44`, fontSize: 10 }}>
                    {nodes.find(n => n.id === nid)?.label ?? nid}
                  </span>
                ))}
                {dataSize > 6 && <span className="text-slate-600 text-xs">+{dataSize - 6}</span>}
              </div>
            </div>
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

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Code panel */}
        <div style={codePanelStyle}>
          <CodeViewer code={algo.code} activeLine={activeLine} accentColor={algo.color} />
        </div>

        {/* Canvas */}
        <div style={{
            flex: 1, overflow: 'auto',
            padding: isDesktop ? 16 : 4,
            minWidth: 0, minHeight: 0,
            display: 'flex',
            alignItems: isDesktop ? 'center' : 'flex-start',
            justifyContent: isDesktop ? 'center' : 'flex-start',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',  // allow scroll but canvas handles pinch
          }}>
          <GraphCanvas
            nodes={nodes} edges={edges}
            mode={mode} selected={selected}
            startNode={startNode} stepData={stepData}
            onCanvasClick={handleCanvasClick}
            onNodeClick={handleNodeClick}
            onNodeDrag={handleNodeDrag}
            width={canvasW} height={canvasH}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap border-t border-white/10 bg-white/5 shrink-0"
        style={{ padding: '7px 16px', gap: 16 }}>
        {[
          { color: '#fb7185', label: 'Start node' },
          { color: '#22d3ee', label: 'Active (being explored)' },
          { color: '#0f2d4a', label: 'Visited', border: '#22d3ee' },
          { color: '#22d3ee', label: 'Active edge', line: true },
        ].map(({ color, label, border, line }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {line
              ? <div style={{ width: 16, height: 2, background: color, borderRadius: 1, boxShadow: `0 0 4px ${color}` }} />
              : <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, border: `1.5px solid ${border || color}`, display: 'inline-block', boxShadow: `0 0 5px ${color}77` }} />
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
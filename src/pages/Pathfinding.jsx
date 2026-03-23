import { useState, useEffect, useRef, useCallback } from 'react'
import Grid       from '../components/Grid.jsx'
import CodeViewer from '../components/CodeViewer.jsx'
import { bfsCode, runBFS } from '../algorithms/pathfinding/bfs.js'
import { dfsCode, runDFS } from '../algorithms/pathfinding/dfs.js'
import { generateMaze }    from '../algorithms/pathfinding/maze.js'

const ACCENT = '#22d3ee'
const SPEEDS = {
  slow:   { interval: 280, stepsPerTick: 1  },
  medium: { interval: 30,  stepsPerTick: 1  },
  fast:   { interval: 16,  stepsPerTick: 12 },
}

const ALGO = {
  bfs: { name: 'BFS (Shortest Path)', color: ACCENT,   code: bfsCode, run: runBFS, dataLabel: 'Queue' },
  dfs: { name: 'DFS',                 color: '#a78bfa', code: dfsCode, run: runDFS, dataLabel: 'Stack' },
}

// Wall presets
const PRESETS = {
  empty:    'Empty Grid',
  random10: 'Random 10%',
  random30: 'Random 30%',
  random50: 'Random 50%',
  vertical: 'Vertical Barriers',
  spiral:   'Spiral',
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

function makeGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill('empty'))
}
function cloneGrid(g) { return g.map(r => [...r]) }

// Apply preset walls
function applyPreset(preset, rows, cols, start, end) {
  const g = makeGrid(rows, cols)
  const skip = (r, c) => (r === start.row && c === start.col) || (r === end.row && c === end.col)

  if (preset === 'random10' || preset === 'random30' || preset === 'random50') {
    const density = preset === 'random10' ? 0.10 : preset === 'random30' ? 0.30 : 0.50
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (!skip(r, c) && Math.random() < density) g[r][c] = 'wall'
  }
  if (preset === 'vertical') {
    const step = Math.floor(cols / 4)
    for (let c = step; c < cols - 1; c += step)
      for (let r = 0; r < rows; r++)
        if (!skip(r, c) && r !== Math.floor(rows / 2)) g[r][c] = 'wall'
  }
  if (preset === 'spiral') {
    let top = 1, bottom = rows - 2, left = 1, right = cols - 2
    let dir = 0
    while (top <= bottom && left <= right) {
      if (dir === 0) { for (let c = left; c <= right; c++) { if (!skip(top, c)) g[top][c] = 'wall' } top++ }
      else if (dir === 1) { for (let r = top; r <= bottom; r++) { if (!skip(r, right)) g[r][right] = 'wall' } right-- }
      else if (dir === 2) { for (let c = right; c >= left; c--) { if (!skip(bottom, c)) g[bottom][c] = 'wall' } bottom-- }
      else { for (let r = bottom; r >= top; r--) { if (!skip(r, left)) g[r][left] = 'wall' } left++ }
      dir = (dir + 1) % 4
    }
    // clear a gap in each wall for path
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (g[r][c] === 'wall' && (r === Math.floor(rows/2) || c === Math.floor(cols/2))) g[r][c] = 'empty'
    }
  }
  return g
}

function buildVizData(baseGrid, steps, upTo, start, end) {
  const g       = cloneGrid(baseGrid)
  const distMap = {}
  const dirMap  = {}

  function getDir(fromKey, toR, toC) {
    if (!fromKey) return null
    const [fr, fc] = fromKey.split(',').map(Number)
    if (fr < toR) return 'down'
    if (fr > toR) return 'up'
    if (fc < toC) return 'right'
    if (fc > toC) return 'left'
    return null
  }

  let visitOrder = 0

  for (let i = 0; i <= upTo && i < steps.length; i++) {
    const s = steps[i]
    if (s.row < 0) continue
    const key = `${s.row},${s.col}`
    if (['visit','dequeue','pop','mark'].includes(s.type)) {
      if (s.row === start.row && s.col === start.col) continue
      if (s.row === end.row   && s.col === end.col)   continue
      g[s.row][s.col] = 'visited'
      if (distMap[key] === undefined) { distMap[key] = visitOrder++ }
      if (s.parentKey !== undefined) dirMap[key] = getDir(s.parentKey, s.row, s.col)
    }
    if (s.type === 'path') {
      if (s.row === start.row && s.col === start.col) continue
      if (s.row === end.row   && s.col === end.col)   continue
      g[s.row][s.col] = 'path'
    }
  }

  const cur = steps[upTo]
  if (cur && cur.row >= 0 &&
    !(cur.row === start.row && cur.col === start.col) &&
    !(cur.row === end.row   && cur.col === end.col) &&
    ['dequeue','pop','visit','mark','check_neighbor'].includes(cur.type)) {
    g[cur.row][cur.col] = 'frontier'
  }

  g[start.row][start.col] = 'start'
  g[end.row][end.col]     = 'end'

  const distRatios = {}
  const maxVisit = visitOrder
  Object.entries(distMap).forEach(([k, d]) => {
    distRatios[k] = maxVisit > 0 ? d / maxVisit : 0
  })

  return { grid: g, distRatios, directions: dirMap }
}

export default function Pathfinding() {
  const isDesktop = useIsDesktop()

  const [gridSize, setGridSize] = useState(isDesktop ? 10 : 10)
  const ROWS      = gridSize
  const COLS      = isDesktop ? Math.round(gridSize * 1.8) : Math.round(gridSize * 1.4)
  const CELL_SIZE = isDesktop
    ? Math.max(20, Math.min(40, Math.floor(700 / COLS)))
    : Math.max(16, Math.min(28, Math.floor(340 / COLS)))

  const [grid,      setGrid]      = useState(() => makeGrid(ROWS, COLS))
  const [start,     setStart]     = useState({ row: 2, col: 2 })
  const [end,       setEnd]       = useState({ row: ROWS - 3, col: COLS - 3 })
  const [algoKey,   setAlgoKey]   = useState('bfs')
  const [speedKey,  setSpeedKey]  = useState('medium')
  const [running,   setRunning]   = useState(false)
  const [finished,  setFinished]  = useState(false)
  const [mode,      setMode]      = useState('wall')
  const [stepIdx,   setStepIdx]   = useState(-1)
  const [steps,     setSteps]     = useState([])
  const [stats,     setStats]     = useState({ visited: 0, pathLen: 0 })

  // User input state
  const [wallInput,    setWallInput]    = useState('')
  const [wallInputErr, setWallInputErr] = useState('')
  const [startInput,   setStartInput]   = useState('')
  const [endInput,     setEndInput]     = useState('')
  const [posInputErr,  setPosInputErr]  = useState('')
  const [preset,       setPreset]       = useState('empty')

  const timerRef   = useRef(null)
  const speedRef   = useRef(SPEEDS[speedKey])
  const runningRef = useRef(false)
  const mouseDown  = useRef(false)
  const algo       = ALGO[algoKey]

  useEffect(() => { speedRef.current = SPEEDS[speedKey] }, [speedKey])
  useEffect(() => { runningRef.current = running }, [running])

  // Viz data
  const vizData = stepIdx >= 0
    ? buildVizData(grid, steps, stepIdx, start, end)
    : { grid: (() => { const g = cloneGrid(grid); g[start.row][start.col] = 'start'; g[end.row][end.col] = 'end'; return g })(), distRatios: {}, directions: {} }

  const displayGrid = vizData.grid
  const distRatios  = vizData.distRatios
  const directions  = vizData.directions

  const currentStep = steps[stepIdx] ?? null
  const activeLine  = currentStep?.line ?? -1
  const dataSize    = currentStep?.queueSize ?? currentStep?.stackDepth ?? 0

  // Better hint text
  function getHint() {
    if (!currentStep) {
      if (steps.length === 0) return { text: 'Draw walls, set start/end, then press ▶ Start', color: '#475569' }
      return { text: 'Paused — press ▶ Resume or use Next/Prev', color: '#475569' }
    }
    if (currentStep.hint) {
      // Enrich hint with algo context
      const h = currentStep.hint
      if (algoKey === 'bfs' && currentStep.type === 'visit')
        return { text: `${h} — BFS explores level by level (wave expansion)`, color: ACCENT }
      if (algoKey === 'dfs' && currentStep.type === 'visit')
        return { text: `${h} — DFS goes deep before backtracking`, color: '#a78bfa' }
      if (currentStep.type === 'found')
        return { text: algoKey === 'bfs' ? `✓ ${h} — BFS guarantees this is the SHORTEST path!` : `✓ ${h} — Note: DFS path may not be shortest`, color: '#4ade80' }
      if (currentStep.type === 'no_path')
        return { text: '✗ No path exists — walls completely block the route', color: '#f87171' }
      if (currentStep.type === 'path')
        return { text: 'Tracing final path from end back to start…', color: '#4ade80' }
      return { text: h, color: algo.color }
    }
    return { text: 'Running…', color: algo.color }
  }

  const hintData = getHint()

  const tooltips = {}
  if (stepIdx >= 0) {
    steps.slice(0, stepIdx + 1).forEach(s => {
      if (s.row >= 0 && s.hint) tooltips[`${s.row},${s.col}`] = s.hint
    })
  }

  // ── Reset ──────────────────────────────────────────────────────
  function stopTimer() { clearTimeout(timerRef.current) }

  function resetViz() {
    stopTimer(); runningRef.current = false
    setRunning(false); setFinished(false)
    setStepIdx(-1); setSteps([])
    setStats({ visited: 0, pathLen: 0 })
  }

  function resetGrid() {
    resetViz()
    setGrid(makeGrid(ROWS, COLS))
    setStart({ row: 2, col: 2 })
    setEnd({ row: ROWS - 3, col: COLS - 3 })
    setPreset('empty')
  }

  // ── Prepare ────────────────────────────────────────────────────
  function prepareSteps() {
    resetViz()
    const { steps: s, path } = algo.run(grid, start, end)
    const pathS = path.map(n => ({ ...n, type: 'path', line: -1, hint: `Path cell (${n.row}, ${n.col})` }))
    const all   = [...s, ...pathS]
    const vc    = s.filter(x => ['visit','dequeue','pop'].includes(x.type)).length
    setSteps(all)
    setStats({ visited: vc, pathLen: path.length })
    return all
  }

  // ── Auto-play ──────────────────────────────────────────────────
  useEffect(() => {
    if (!running || steps.length === 0) { stopTimer(); return }
    const stepsLen = steps.length
    function tick() {
      if (!runningRef.current) return
      const { interval, stepsPerTick } = speedRef.current
      setStepIdx(prev => {
        const next = Math.min(prev + stepsPerTick, stepsLen - 1)
        if (next >= stepsLen - 1) { setRunning(false); runningRef.current = false; setFinished(true); return next }
        timerRef.current = setTimeout(tick, interval)
        return next
      })
    }
    timerRef.current = setTimeout(tick, speedRef.current.interval)
    return () => clearTimeout(timerRef.current)
  }, [running, steps.length])

  // ── Controls ──────────────────────────────────────────────────
  function handleStart() {
    if (running)  { stopTimer(); runningRef.current = false; setRunning(false); return }
    if (finished) { resetViz(); return }
    if (steps.length === 0) {
      const all = prepareSteps()
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

  function handleSkipToEnd() {
    stopTimer(); runningRef.current = false; setRunning(false)
    if (steps.length === 0) { const all = prepareSteps(); setStepIdx(all.length - 1); setFinished(true); return }
    setStepIdx(steps.length - 1); setFinished(true)
  }

  function handleMaze() {
    resetViz()
    const maze = generateMaze(ROWS, COLS)
    const s = { row: 1, col: 1 }
    const e = { row: ROWS - 2, col: COLS - 2 }
    maze[s.row][s.col] = 'empty'
    maze[e.row][e.col] = 'empty'
    setGrid(maze); setStart(s); setEnd(e)
    setPreset('empty')
  }

  function handlePreset(p) {
    setPreset(p)
    resetViz()
    if (p === 'empty') { setGrid(makeGrid(ROWS, COLS)); return }
    setGrid(applyPreset(p, ROWS, COLS, start, end))
  }

  // ── User input: wall coordinates ──────────────────────────────
  function applyWallInput() {
    if (!wallInput.trim()) { setWallInputErr('Enter wall coordinates'); return }
    const pairs = wallInput.trim().split(/\s+/)
    const walls = []
    for (const p of pairs) {
      const [r, c] = p.split(',').map(Number)
      if (isNaN(r) || isNaN(c) || r < 0 || r >= ROWS || c < 0 || c >= COLS) {
        setWallInputErr(`Invalid coord: ${p} — use row,col format`); return
      }
      walls.push({ r, c })
    }
    setWallInputErr('')
    resetViz()
    setGrid(prev => {
      const next = cloneGrid(prev)
      walls.forEach(({ r, c }) => {
        if (r === start.row && c === start.col) return
        if (r === end.row   && c === end.col)   return
        next[r][c] = 'wall'
      })
      return next
    })
  }

  // ── User input: start/end position ────────────────────────────
  function applyPositions() {
    const parsePos = str => {
      const [r, c] = str.trim().split(',').map(Number)
      return { r, c, valid: !isNaN(r) && !isNaN(c) && r >= 0 && r < ROWS && c >= 0 && c < COLS }
    }
    if (startInput.trim()) {
      const p = parsePos(startInput)
      if (!p.valid) { setPosInputErr('Invalid start position — use row,col'); return }
      setStart({ row: p.r, col: p.c })
    }
    if (endInput.trim()) {
      const p = parsePos(endInput)
      if (!p.valid) { setPosInputErr('Invalid end position — use row,col'); return }
      setEnd({ row: p.r, col: p.c })
    }
    setPosInputErr(''); resetViz()
  }

  // ── Mouse interaction ──────────────────────────────────────────
  const handleMouseDown = useCallback((r, c) => {
    if (running) return
    mouseDown.current = true
    applyInteraction(r, c)
  }, [running, mode, start, end])

  const handleMouseEnter = useCallback((r, c) => {
    if (!mouseDown.current || running) return
    applyInteraction(r, c)
  }, [running, mode, start, end])

  function applyInteraction(r, c) {
    resetViz()
    if (mode === 'start') { if (r !== end.row || c !== end.col) setStart({ row: r, col: c }); return }
    if (mode === 'end')   { if (r !== start.row || c !== start.col) setEnd({ row: r, col: c }); return }
    if ((r === start.row && c === start.col) || (r === end.row && c === end.col)) return
    setGrid(prev => { const next = cloneGrid(prev); next[r][c] = next[r][c] === 'wall' ? 'empty' : 'wall'; return next })
  }

  useEffect(() => {
    const up = () => { mouseDown.current = false }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  useEffect(() => {
    resetViz()
    setGrid(makeGrid(ROWS, COLS))
    setStart({ row: 2, col: 2 })
    setEnd({ row: ROWS - 3, col: COLS - 3 })
  }, [ROWS, COLS])

  const primaryLabel = running ? '⏸ Pause' : finished ? '↺ Reset' : steps.length === 0 ? '▶ Start' : '▶ Resume'
  const progress     = steps.length > 0 ? Math.round((Math.max(stepIdx, 0) / (steps.length - 1)) * 100) : 0

  const codePanelStyle = isDesktop
    ? { width: 240, height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }
    : { width: '100%', height: 170, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }

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
        {/* BFS vs DFS description */}
        <div className="flex items-center ml-auto px-4 gap-4">
          {algoKey === 'bfs' && <span className="text-xs font-mono text-slate-600 hidden md:block">Wave expansion — always finds shortest path</span>}
          {algoKey === 'dfs' && <span className="text-xs font-mono text-slate-600 hidden md:block">Deep dive — fast but may not find shortest path</span>}
        </div>
      </div>

      {/* Controls row 1: playback + mode + tools */}
      <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-2 bg-white/5 border-b border-white/10 shrink-0">
        <button onClick={handleStart}
          className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono"
          style={{ background: running ? 'transparent' : algo.color, color: running ? algo.color : '#000', border: `1px solid ${algo.color}`, boxShadow: running ? 'none' : `0 0 12px ${algo.color}44`, cursor: 'pointer', transition: 'all 0.15s' }}>
          {primaryLabel}
        </button>
        <button onClick={handlePrev} disabled={stepIdx <= 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>← Prev</button>
        <button onClick={handleNext} disabled={finished}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>Next →</button>
        <button onClick={handleSkipToEnd}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500"
          style={{ background: 'transparent', cursor: 'pointer' }}>⚡ Skip</button>
        <button onClick={resetViz} disabled={stepIdx < 0}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}>↺ Reset Viz</button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Draw mode */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/10">
          {[['wall','✏ Wall'],['start','▶ Start'],['end','⬛ End']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold"
              style={{ background: mode === m ? `${algo.color}22` : 'transparent', color: mode === m ? algo.color : '#475569', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Grid size */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 shrink-0">Size: <strong style={{ color: algo.color }}>{ROWS}×{COLS}</strong></span>
          <input type="range" min={10} max={isDesktop ? 28 : 18} value={gridSize}
            onChange={e => setGridSize(Number(e.target.value))}
            style={{ width: 70, accentColor: algo.color, cursor: 'pointer' }} />
        </div>

        {/* Maze */}
        <button onClick={handleMaze}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-400"
          style={{ background: 'transparent', cursor: 'pointer' }}>🎲 Maze</button>
        <button onClick={resetGrid}
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

      {/* Controls row 2: user inputs */}
      <div className="flex flex-wrap items-start gap-3 px-4 md:px-6 py-2 bg-white/[0.02] border-b border-white/10 shrink-0">

        {/* Wall preset */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 shrink-0">Preset:</span>
          <select value={preset} onChange={e => handlePreset(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs font-mono text-slate-300 outline-none"
            style={{ background: '#0d1b2e', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#cbd5e1' }}>
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Wall coords input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 shrink-0">Walls:</span>
            <input type="text" value={wallInput} onChange={e => setWallInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyWallInput()}
              placeholder="e.g. 2,3 2,4 2,5"
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 outline-none"
              style={{ width: 160 }} />
            <button onClick={applyWallInput}
              className="px-3 py-1 rounded-lg text-xs font-mono border border-white/10 text-slate-400"
              style={{ background: 'transparent', cursor: 'pointer' }}>Add</button>
          </div>
          {wallInputErr && <span className="text-xs font-mono text-red-400">⚠ {wallInputErr}</span>}
        </div>

        {/* Start/End position input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500 shrink-0">Start:</span>
            <input type="text" value={startInput} onChange={e => setStartInput(e.target.value)}
              placeholder={`${start.row},${start.col}`}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 outline-none"
              style={{ width: 70 }} />
            <span className="text-xs font-mono text-slate-500 shrink-0">End:</span>
            <input type="text" value={endInput} onChange={e => setEndInput(e.target.value)}
              placeholder={`${end.row},${end.col}`}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 outline-none"
              style={{ width: 70 }} />
            <button onClick={applyPositions}
              className="px-3 py-1 rounded-lg text-xs font-mono border border-white/10 text-slate-400"
              style={{ background: 'transparent', cursor: 'pointer' }}>Set</button>
          </div>
          {posInputErr && <span className="text-xs font-mono text-red-400">⚠ {posInputErr}</span>}
        </div>
      </div>

      {/* Hint + progress */}
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

        {/* Hint bar */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-mono"
          style={{ background: `${hintData.color}0d`, border: `1px solid ${hintData.color}22`, color: hintData.color, transition: 'all 200ms ease' }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hintData.color, boxShadow: `0 0 4px ${hintData.color}` }} />
          <span>{hintData.text}</span>
          {dataSize > 0 && (
            <span className="ml-auto text-slate-600">{algo.dataLabel}: <strong style={{ color: algo.color }}>{dataSize}</strong></span>
          )}
        </div>

        {/* Stats */}
        {(finished || stepIdx > 0) && (
          <div className="flex items-center gap-6 text-xs font-mono text-slate-500 flex-wrap">
            <span>Explored: <strong style={{ color: algo.color }}>{stats.visited}</strong> cells</span>
            <span>Path: <strong style={{ color: stats.pathLen > 0 ? '#4ade80' : '#f87171' }}>
              {stats.pathLen > 0 ? `${stats.pathLen} cells` : 'No path found'}
            </strong></span>
            {algoKey === 'bfs' && stats.pathLen > 0 && <span className="text-slate-700">✓ Shortest path guaranteed by BFS</span>}
            {algoKey === 'dfs' && stats.pathLen > 0 && <span className="text-slate-700">⚠ Path may not be shortest (DFS)</span>}
            {finished && stats.pathLen === 0 && <span className="text-red-400">No path — walls block all routes</span>}
          </div>
        )}
      </div>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isDesktop ? 'row' : 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* Code panel */}
        <div style={codePanelStyle}>
          <CodeViewer code={algo.code} activeLine={activeLine} accentColor={algo.color} />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto flex items-center justify-center"
          style={{ padding: isDesktop ? 16 : 8, minWidth: 0, minHeight: 0 }}
          onMouseLeave={() => { mouseDown.current = false }}>
          <div className="rounded-xl border border-white/10 bg-white/5"
            style={{ padding: isDesktop ? 10 : 6, display: 'inline-block' }}>
            <Grid
              grid={displayGrid}
              cellSize={CELL_SIZE}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              tooltips={tooltips}
              distRatios={distRatios}
              directions={directions}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap border-t border-white/10 bg-white/5 shrink-0"
        style={{ padding: '7px 16px', gap: 14 }}>
        {[
          { color: '#4ade80', label: 'Start'    },
          { color: '#fb7185', label: 'End'      },
          { color: '#22d3ee', label: 'Exploring', glow: true },
          { color: '#0e2a42', label: 'Visited',  border: '#1a3a55' },
          { color: '#facc15', label: 'Path'      },
          { color: '#1a1a2e', label: 'Wall',     border: '#2a2a4a' },
        ].map(({ color, label, border, glow }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: 2, background: color, border: `1px solid ${border || color}`, display: 'inline-block', boxShadow: glow ? `0 0 6px ${color}` : 'none' }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{ROWS} × {COLS}</span>
      </div>
    </div>
  )
}
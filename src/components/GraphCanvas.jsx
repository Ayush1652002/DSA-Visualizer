import { useRef, useState } from 'react'
import Node from './Node.jsx'
import Edge from './Edge.jsx'

export default function GraphCanvas({
  nodes, edges,
  mode, selected, startNode, stepData,
  onCanvasClick, onNodeClick, onNodeDrag,
  width, height,
}) {
  const svgRef      = useRef(null)
  const dragging    = useRef(null)
  const lastDist    = useRef(null)
  const lastScale   = useRef(1)
  const [scale, setScale] = useState(1)

  const visitedSet = new Set(stepData?.visitedNodes ?? [])
  const activeNode = stepData?.activeNode ?? null
  const activeEdge = stepData?.activeEdge ?? null
  const visitOrder = stepData?.visitOrder ?? {}

  function getNodeState(id) {
    if (id === activeNode)              return 'active'
    if (stepData && visitedSet.has(id)) return 'visited'
    return 'default'
  }

  function isEdgeActive(e) {
    if (!activeEdge) return false
    return (e.from === activeEdge.from && e.to === activeEdge.to) ||
           (e.from === activeEdge.to   && e.to === activeEdge.from)
  }

  function isEdgeVisited(e) {
    return visitedSet.has(e.from) && visitedSet.has(e.to)
  }

  function getSVGPoint(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left)  / scale,
      y: (clientY - rect.top)   / scale,
    }
  }

  // ── Mouse ───────────────────────────────────────────────────
  function handleSVGClick(e) {
    if (e.target !== svgRef.current && e.target.tagName === 'circle') return
    if (mode !== 'add') return
    const { x, y } = getSVGPoint(e.clientX, e.clientY)
    onCanvasClick(x, y)
  }

  function handleNodeMouseDown(e, id) {
    if (mode !== 'move') return
    e.stopPropagation()
    dragging.current = id
  }

  function handleMouseMove(e) {
    if (!dragging.current) return
    const { x, y } = getSVGPoint(e.clientX, e.clientY)
    onNodeDrag(dragging.current, x, y)
  }

  function handleMouseUp() { dragging.current = null }

  // ── Touch ───────────────────────────────────────────────────
  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault()
      lastDist.current  = getTouchDist(e.touches)
      lastScale.current = scale
      return
    }
    if (e.touches.length === 1 && mode === 'move') {
      const t   = e.touches[0]
      const el  = document.elementFromPoint(t.clientX, t.clientY)
      const grp = el?.closest('[data-nodeid]')
      if (grp?.dataset?.nodeid) {
        dragging.current = grp.dataset.nodeid
        e.stopPropagation()
      }
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist     = getTouchDist(e.touches)
      const newScale = Math.min(3, Math.max(0.3, lastScale.current * (dist / lastDist.current)))
      setScale(newScale)
      return
    }
    if (e.touches.length === 1 && dragging.current) {
      e.preventDefault()
      const t = e.touches[0]
      const { x, y } = getSVGPoint(t.clientX, t.clientY)
      onNodeDrag(dragging.current, x, y)
    }
  }

  function handleTouchEnd(e) {
    dragging.current  = null
    lastDist.current  = null
    // Tap to add node
    if (mode === 'add' && e.changedTouches.length === 1) {
      const t  = e.changedTouches[0]
      const el = document.elementFromPoint(t.clientX, t.clientY)
      if (el?.tagName !== 'circle' && el?.closest('[data-nodeid]') === null) {
        const { x, y } = getSVGPoint(t.clientX, t.clientY)
        onCanvasClick(x, y)
      }
    }
  }

  const scaledW = width  * scale
  const scaledH = height * scale

  return (
    // Outer div carries the scaled dimensions so parent scroll knows true size
    <div style={{ width: scaledW, height: scaledH, flexShrink: 0, position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width} height={height}
        onClick={handleSVGClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          background:      'rgba(6,13,27,0.8)',
          borderRadius:    12,
          border:          '1px solid rgba(255,255,255,0.08)',
          cursor:          mode === 'add' ? 'crosshair' : mode === 'move' ? 'grab' : 'default',
          display:         'block',
          transformOrigin: '0 0',
          transform:       `scale(${scale})`,
          touchAction:     'none',  // SVG handles all touch — no page zoom
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.8" fill="rgba(30,58,95,0.25)" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" rx={12} />

        {edges.map((edge, i) => (
          <Edge key={i} edge={edge} nodes={nodes}
            isActive={isEdgeActive(edge)}
            isVisited={isEdgeVisited(edge)} />
        ))}

        {nodes.map(node => (
          <Node
            key={node.id} node={node}
            state={getNodeState(node.id)}
            isStart={node.id === startNode}
            isSelected={node.id === selected}
            visitNum={visitOrder[node.id]}
            onClick={e => { e.stopPropagation(); onNodeClick(node.id) }}
            onMouseDown={e => handleNodeMouseDown(e, node.id)}
            nodeId={node.id}
          />
        ))}

        {nodes.length === 0 && (
          <text x={width / 2} y={height / 2}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(71,85,105,0.5)" fontSize={13} fontFamily="monospace">
            Type values above to build a tree, or click to add nodes
          </text>
        )}
      </svg>
    </div>
  )
}
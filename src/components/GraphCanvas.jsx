// GraphCanvas.jsx — SVG canvas for graph visualization
// Handles: click to add node, click node to select, connect two nodes, drag nodes

import { useRef } from 'react'
import Node from './Node.jsx'
import Edge from './Edge.jsx'

export default function GraphCanvas({
  nodes, edges,
  mode,           // 'add' | 'connect' | 'delete' | 'move'
  selected,       // selected node id (for connect mode)
  startNode,      // start node id for traversal
  stepData,       // { activeNode, visitedNodes, activeEdge }
  onCanvasClick,
  onNodeClick,
  onNodeDrag,
  width, height,
}) {
  const svgRef    = useRef(null)
  const dragging  = useRef(null)

  const visitedSet = new Set(stepData?.visitedNodes ?? [])
  const activeNode = stepData?.activeNode ?? null
  const activeEdge = stepData?.activeEdge ?? null

  function getNodeState(id) {
    if (id === activeNode)      return 'active'
    if (stepData && visitedSet.has(id) && id !== activeNode) return 'visited'
    return 'default'
  }

  function isEdgeActive(edge) {
    if (!activeEdge) return false
    return (edge.from === activeEdge.from && edge.to === activeEdge.to) ||
           (edge.from === activeEdge.to   && edge.to === activeEdge.from)
  }

  function isEdgeVisited(edge) {
    return visitedSet.has(edge.from) && visitedSet.has(edge.to)
  }

  function getSVGPoint(e) {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function handleSVGClick(e) {
    if (e.target !== svgRef.current && e.target.tagName === 'circle') return
    if (mode !== 'add') return
    const { x, y } = getSVGPoint(e)
    onCanvasClick(x, y)
  }

  function handleNodeMouseDown(e, id) {
    if (mode !== 'move') return
    e.stopPropagation()
    dragging.current = id
  }

  function handleMouseMove(e) {
    if (!dragging.current) return
    const { x, y } = getSVGPoint(e)
    onNodeDrag(dragging.current, x, y)
  }

  function handleMouseUp() {
    dragging.current = null
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      onClick={handleSVGClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        background:  'rgba(6,13,27,0.8)',
        borderRadius: 12,
        border:      '1px solid rgba(255,255,255,0.08)',
        cursor:      mode === 'add' ? 'crosshair' : mode === 'move' ? 'grab' : 'default',
        display:     'block',
      }}
    >
      {/* Grid dots */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="0.8" fill="rgba(30,58,95,0.3)" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid)" rx={12} />

      {/* Edges */}
      {edges.map((edge, i) => (
        <Edge
          key={i}
          edge={edge}
          nodes={nodes}
          isActive={isEdgeActive(edge)}
          isVisited={isEdgeVisited(edge)}
        />
      ))}

      {/* Connecting line preview — shown in connect mode when one node selected */}
      {/* (handled by parent passing a temp edge) */}

      {/* Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          state={getNodeState(node.id)}
          isStart={node.id === startNode}
          isSelected={node.id === selected}
          onClick={e => { e.stopPropagation(); onNodeClick(node.id) }}
          onMouseDown={e => handleNodeMouseDown(e, node.id)}
        />
      ))}

      {/* Empty state */}
      {nodes.length === 0 && (
        <text x={width / 2} y={height / 2}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(71,85,105,0.6)" fontSize={13} fontFamily="monospace">
          Click canvas to add nodes
        </text>
      )}
    </svg>
  )
}
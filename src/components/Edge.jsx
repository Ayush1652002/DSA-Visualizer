// Edge.jsx — a graph edge rendered as SVG line

export default function Edge({ edge, nodes, isActive, isVisited }) {
  const from = nodes.find(n => n.id === edge.from)
  const to   = nodes.find(n => n.id === edge.to)
  if (!from || !to) return null

  const stroke = isActive  ? '#22d3ee'
               : isVisited ? '#0f4a6a'
               : 'rgba(30,58,95,0.6)'

  const width  = isActive ? 3 : isVisited ? 2 : 1.5
  const glow   = isActive ? 'drop-shadow(0 0 4px #22d3ee)' : 'none'

  // Midpoint for edge label (optional weight display)
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2

  return (
    <g style={{ filter: glow }}>
      <line
        x1={from.x} y1={from.y}
        x2={to.x}   y2={to.y}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        style={{ transition: 'stroke 200ms ease, stroke-width 150ms ease' }}
      />
      {/* Invisible wider hit area for easier clicking */}
      <line
        x1={from.x} y1={from.y}
        x2={to.x}   y2={to.y}
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: 'pointer' }}
      />
    </g>
  )
}
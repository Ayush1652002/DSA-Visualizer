// Node.jsx — graph node with visit order number badge

const COLORS = {
  default: { fill: '#0d1b2e', stroke: '#1e3a5f', text: '#64748b' },
  active:  { fill: '#22d3ee', stroke: '#22d3ee', text: '#000'    },
  visited: { fill: '#0f2d4a', stroke: '#22d3ee', text: '#22d3ee' },
  start:   { fill: '#fb7185', stroke: '#fb7185', text: '#000'    },
  done:    { fill: '#4ade80', stroke: '#4ade80', text: '#000'    },
}

export default function Node({ node, state, isStart, isSelected, visitNum, onClick, onMouseDown, r = 22 }) {
  const s = state === 'active'  ? COLORS.active
          : state === 'visited' ? COLORS.visited
          : isStart             ? COLORS.start
          : COLORS.default

  const glow = state === 'active'  ? `drop-shadow(0 0 10px #22d3ee)`
             : state === 'visited' ? `drop-shadow(0 0 4px #22d3ee55)`
             : isStart             ? `drop-shadow(0 0 10px #fb718588)`
             : isSelected          ? `drop-shadow(0 0 6px #a78bfa)`
             : 'none'

  return (
    <g style={{ cursor: 'pointer', filter: glow }} onClick={onClick} onMouseDown={onMouseDown} data-nodeid={node.id}>

      {/* Selected ring */}
      {isSelected && (
        <circle cx={node.x} cy={node.y} r={r + 6}
          fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8} />
      )}

      {/* Main circle */}
      <circle cx={node.x} cy={node.y} r={r}
        fill={s.fill} stroke={s.stroke} strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ transition: 'fill 200ms ease, stroke 200ms ease' }} />

      {/* Node label */}
      <text x={node.x} y={node.y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight="700" fontFamily="monospace"
        fill={s.text}
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {node.label}
      </text>

      {/* Visit order badge — shows 1st, 2nd, 3rd etc */}
      {visitNum !== undefined && (
        <>
          <circle cx={node.x + r - 2} cy={node.y - r + 2} r={9}
            fill="#facc15" stroke="#000" strokeWidth={1} />
          <text x={node.x + r - 2} y={node.y - r + 2}
            textAnchor="middle" dominantBaseline="central"
            fontSize={8} fontWeight="900" fontFamily="monospace"
            fill="#000"
            style={{ userSelect: 'none', pointerEvents: 'none' }}>
            {visitNum}
          </text>
        </>
      )}

      {/* START label above */}
      {isStart && (
        <text x={node.x} y={node.y - r - 4}
          textAnchor="middle" fontSize={9} fontWeight="700"
          fill="#fb7185" fontFamily="monospace"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          START
        </text>
      )}
    </g>
  )
}
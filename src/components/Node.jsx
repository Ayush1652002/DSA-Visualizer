// Node.jsx — a single graph node rendered as SVG circle

const COLORS = {
  default:  { fill: '#0d1b2e', stroke: '#1e3a5f', text: '#64748b' },
  active:   { fill: '#22d3ee', stroke: '#22d3ee', text: '#000'    },
  visited:  { fill: '#0f2d4a', stroke: '#22d3ee', text: '#22d3ee' },
  done:     { fill: '#4ade80', stroke: '#4ade80', text: '#000'    },
  start:    { fill: '#fb7185', stroke: '#fb7185', text: '#000'    },
}

export default function Node({ node, state, isStart, isSelected, onClick, onMouseDown, r = 22 }) {
  const s = state === 'active'  ? COLORS.active
           : state === 'visited' ? COLORS.visited
           : state === 'done'   ? COLORS.done
           : isStart            ? COLORS.start
           : COLORS.default

  const glow = state === 'active'  ? `drop-shadow(0 0 8px #22d3ee)`
             : state === 'done'    ? `drop-shadow(0 0 6px #4ade80)`
             : isStart             ? `drop-shadow(0 0 8px #fb7185)`
             : isSelected          ? `drop-shadow(0 0 6px #a78bfa)`
             : 'none'

  return (
    <g
      style={{ cursor: 'pointer', filter: glow }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {/* Outer ring for selected */}
      {isSelected && (
        <circle cx={node.x} cy={node.y} r={r + 5}
          fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8} />
      )}

      {/* Main circle */}
      <circle
        cx={node.x} cy={node.y} r={r}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ transition: 'fill 200ms ease, stroke 200ms ease' }}
      />

      {/* Label */}
      <text
        x={node.x} y={node.y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight="700" fontFamily="monospace"
        fill={s.text}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {node.label}
      </text>

      {/* Start badge */}
      {isStart && (
        <text x={node.x} y={node.y - r - 6}
          textAnchor="middle" fontSize={9} fontWeight="700"
          fill="#fb7185" fontFamily="monospace"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          START
        </text>
      )}
    </g>
  )
}
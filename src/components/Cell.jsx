// Cell.jsx — single grid cell
// Supports: distance-based opacity for BFS wave, direction arrow for visited cells

const START_COLOR    = '#22d3ee'
const END_COLOR      = '#fb7185'
const FRONTIER_COLOR = '#22d3ee'
const PATH_COLOR     = '#4ade80'
const VISITED_BASE   = '#0f2d4a'

// Direction arrow characters
const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' }

export default function Cell({ type, size, onMouseDown, onMouseEnter, tooltip, distRatio, direction }) {
  let background, border, boxShadow, content

  switch (type) {
    case 'wall':
      background = 'linear-gradient(135deg, #0a0f1a, #0f1520)'
      border     = '1px solid #0f1520'
      boxShadow  = 'none'
      break

    case 'start':
      background = `linear-gradient(135deg, ${START_COLOR}cc, ${START_COLOR})`
      border     = `1px solid ${START_COLOR}`
      boxShadow  = `0 0 10px ${START_COLOR}99`
      break

    case 'end':
      background = `linear-gradient(135deg, ${END_COLOR}cc, ${END_COLOR})`
      border     = `1px solid ${END_COLOR}`
      boxShadow  = `0 0 10px ${END_COLOR}99`
      break

    case 'frontier':
      background = `linear-gradient(to top, ${FRONTIER_COLOR}66, ${FRONTIER_COLOR})`
      border     = `1px solid ${FRONTIER_COLOR}`
      boxShadow  = `0 0 10px ${FRONTIER_COLOR}88`
      break

    case 'path':
      background = `linear-gradient(to top, ${PATH_COLOR}88, ${PATH_COLOR})`
      border     = `1px solid ${PATH_COLOR}`
      boxShadow  = `0 0 8px ${PATH_COLOR}88`
      break

    case 'visited': {
      // BFS wave: distRatio 0 = close to start (darker), 1 = far (lighter)
      const ratio   = distRatio ?? 0.5
      const opacity = 0.25 + ratio * 0.55   // range 0.25 → 0.80
      background = `rgba(15, 45, 74, ${opacity})`
      border     = `1px solid rgba(30, 58, 95, ${opacity * 0.8})`
      boxShadow  = 'none'
      // Direction arrow for visited cells
      if (direction && size >= 18) {
        content = ARROWS[direction]
      }
      break
    }

    default:
      background = '#0d1b2e'
      border     = '1px solid rgba(30, 58, 95, 0.13)'
      boxShadow  = 'none'
  }

  return (
    <div
      title={tooltip}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={{
        width:        size,
        height:       size,
        background,
        border,
        borderRadius: size > 18 ? 4 : 2,
        boxSizing:    'border-box',
        cursor:       'pointer',
        flexShrink:   0,
        boxShadow,
        transition:   'background 80ms ease, box-shadow 80ms ease',
        userSelect:   'none',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        fontSize:     size * 0.45,
        color:        'rgba(34, 211, 238, 0.5)',
        fontWeight:   700,
        pointerEvents: 'auto',
      }}
    >
      {content}
    </div>
  )
}

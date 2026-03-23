// Cell.jsx — clean 3-color system for pathfinding
// 🟢 Green  = Start
// 🔴 Red    = End
// ⬛ Dark   = Wall (visible but not distracting)
// 🔵 Cyan   = Visited / Frontier
// 🟡 Yellow = Path (final result)
// ⬜ Navy   = Empty

const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' }

export default function Cell({ type, size, onMouseDown, onMouseEnter, tooltip, distRatio, direction }) {
  let background, border, boxShadow, textColor

  switch (type) {
    case 'empty':
      background = '#0d1b2e'
      border     = '1px solid rgba(255,255,255,0.06)'
      boxShadow  = 'none'
      textColor  = 'transparent'
      break

    case 'wall':
      background = '#1a1a2e'
      border     = '1px solid #2a2a4a'
      boxShadow  = 'none'
      textColor  = 'transparent'
      break

    case 'start':
      background = 'linear-gradient(135deg, #4ade80bb, #4ade80)'
      border     = '2px solid #4ade80'
      boxShadow  = '0 0 14px #4ade8088'
      textColor  = 'transparent'
      break

    case 'end':
      background = 'linear-gradient(135deg, #fb7185bb, #fb7185)'
      border     = '2px solid #fb7185'
      boxShadow  = '0 0 14px #fb718588'
      textColor  = 'transparent'
      break

    case 'frontier':
      background = 'linear-gradient(135deg, #22d3ee88, #22d3ee)'
      border     = '1px solid #22d3ee'
      boxShadow  = '0 0 10px #22d3ee88'
      textColor  = 'transparent'
      break

    case 'visited':
      background = '#0f2d4a'
      border     = '1px solid rgba(34,211,238,0.15)'
      boxShadow  = 'none'
      textColor  = direction && size >= 18 ? 'rgba(34,211,238,0.4)' : 'transparent'
      break

    case 'path':
      background = 'linear-gradient(135deg, #facc1588, #facc15)'
      border     = '1px solid #facc15'
      boxShadow  = '0 0 10px #facc1566'
      textColor  = 'transparent'
      break

    default:
      background = '#0d1b2e'
      border     = '1px solid rgba(255,255,255,0.06)'
      boxShadow  = 'none'
      textColor  = 'transparent'
  }

  return (
    <div
      title={tooltip}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={{
        width:          size,
        height:         size,
        background,
        border,
        borderRadius:   size > 20 ? 6 : size > 14 ? 4 : 2,
        boxSizing:      'border-box',
        cursor:         'pointer',
        flexShrink:     0,
        boxShadow,
        transition:     'background 80ms ease, box-shadow 80ms ease',
        userSelect:     'none',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       size * 0.42,
        color:          textColor,
        fontWeight:     700,
      }}
    >
      {type === 'visited' && direction && size >= 18 ? ARROWS[direction] ?? '' : ''}
    </div>
  )
}
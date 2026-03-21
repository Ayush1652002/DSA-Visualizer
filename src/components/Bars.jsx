// Bars.jsx — all colors via inline styles, layout only via Tailwind

const ALGO_COLORS = {
  bubble:    { comparing: '#22d3ee', swapping: '#c084fc', sorted: '#4ade80' },
  selection: { comparing: '#818cf8', swapping: '#f472b6', sorted: '#a78bfa' },
  insertion: { comparing: '#6ee7b7', swapping: '#fbbf24', sorted: '#34d399' },
  merge:     { comparing: '#7dd3fc', swapping: '#60a5fa', sorted: '#38bdf8' },
  quick:     { comparing: '#fca5a5', swapping: '#f97316', sorted: '#fb7185' },
}

export default function Bars({ arr, comparing, swapped, sorted, algoKey, accentColor }) {
  if (!arr || arr.length === 0) return null

  const max    = Math.max(...arr, 1)
  const colors = ALGO_COLORS[algoKey] || { comparing: '#e2e8f0', swapping: '#facc15', sorted: accentColor }
  const n      = arr.length
  const gap    = n > 50 ? 0 : n > 35 ? 1 : n > 20 ? 2 : 3

  function getStyle(idx) {
    let bg, shadow
    if (sorted.includes(idx)) {
      bg = `linear-gradient(to top, ${colors.sorted}bb, ${colors.sorted})`
      shadow = `0 0 10px ${colors.sorted}88`
    } else if (swapped.includes(idx)) {
      bg = `linear-gradient(to top, ${colors.swapping}bb, ${colors.swapping})`
      shadow = `0 0 12px ${colors.swapping}aa`
    } else if (comparing.includes(idx)) {
      bg = `linear-gradient(to top, ${colors.comparing}99, ${colors.comparing})`
      shadow = `0 0 10px ${colors.comparing}77`
    } else {
      bg = 'linear-gradient(to top, #0d1f3c, #163354)'
      shadow = 'none'
    }
    return {
      height:       `${(arr[idx] / max) * 100}%`,
      minHeight:    '2px',
      background:   bg,
      boxShadow:    shadow,
      borderRadius: gap > 1 ? '3px 3px 0 0' : '1px 1px 0 0',
      transition:   'height 120ms ease, background 100ms ease, box-shadow 100ms ease',
    }
  }

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'center',
        width:          '100%',
        height:         '100%',
        gap:            `${gap}px`,
        padding:        '0 2px 2px',
        boxSizing:      'border-box',
      }}
    >
      {arr.map((_, idx) => (
        <div
          key={idx}
          style={{
            flex:     '1 1 0%',
            minWidth: '2px',
            maxWidth: n <= 16 ? '60px' : n <= 30 ? '40px' : '100%',
            ...getStyle(idx),
          }}
        />
      ))}
    </div>
  )
}

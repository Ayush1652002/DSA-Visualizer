import { useRef, useState, useEffect } from 'react'

const DIMMED = '#0d1b2e'

function SearchBars({ arr, getColor, max }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const n   = arr.length
  const gap = 3
  const barW = Math.min(60, Math.max(2, (w - gap * (n - 1)) / n))
  const totalW = barW * n + gap * (n - 1)
  const offsetX = (w - totalW) / 2

  function barBg(color) {
    if (!color || color === DIMMED) return 'linear-gradient(to top, #0d1f3c, #163354)'
    return `linear-gradient(to top, ${color}88, ${color})`
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', paddingTop: 20, boxSizing: 'border-box' }}>
      {w > 0 && arr.map((val, idx) => {
        const color = getColor(idx)
        const barH  = Math.max(2, (val / max) * h)
        const left  = offsetX + idx * (barW + gap)
        const top   = h - barH
        const labelColor = color && color !== DIMMED ? color : '#334155'

        return (
          <div
            key={idx}
            style={{ position: 'absolute', left, top: top - 18, width: barW }}
          >
            {/* Value label */}
            {barW >= 12 && (
              <div style={{
                width:      '100%',
                textAlign:  'center',
                fontSize:   Math.min(11, Math.max(8, barW * 0.45)),
                fontFamily: 'monospace',
                color:      labelColor,
                fontWeight: color && color !== DIMMED ? 700 : 400,
                height:     18,
                lineHeight: '18px',
                transition: 'color 150ms ease',
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {val}
              </div>
            )}
            {/* Bar */}
            <div
              style={{
                width:        barW,
                height:       barH,
                background:   barBg(color),
                boxShadow:    color && color !== DIMMED ? `0 0 10px ${color}77` : 'none',
                border:       color && color !== DIMMED ? `1px solid ${color}55` : 'none',
                borderRadius: '6px 6px 0 0',
                boxSizing:    'border-box',
                transition:   'background 150ms ease, box-shadow 150ms ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
export default SearchBars
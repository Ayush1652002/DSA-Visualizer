import { useRef, useLayoutEffect, useState, useEffect } from 'react'

const GREEN  = '#4ade80'
const YELLOW = '#facc15'
const CYAN   = '#22d3ee'
const PURPLE = '#c084fc'
const LIFT   = 16

function barBg(c) { return `linear-gradient(to top, ${c}88, ${c})` }

export default function Bars({
  arr,
  comparing = [],
  swapped   = [],
  sorted    = [],
  pivot     = [],
  boundary  = [],
  mid       = [],
  algoKey   = '',
}) {
  if (!arr || arr.length === 0) return null

  const max      = Math.max(...arr, 1)
  const n        = arr.length
  const gap      = n > 50 ? 1 : n > 35 ? 2 : n > 20 ? 3 : 4
  const pivotIdx = pivot.length > 0 ? pivot[0] : -1
  const midIdx   = mid.length   > 0 ? mid[0]   : -1

  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const [phase, setPhase] = useState('idle')
  const prevPositions     = useRef({})  // { idx: { x, val } }
  const lastKey           = useRef('')
  const timers            = useRef([])

  useEffect(() => {
    const a = swapped[0], b = swapped[1]
    if (a === undefined || b === undefined) return

    const key = `${a}-${b}-${arr[a]}-${arr[b]}`
    if (key === lastKey.current) return
    lastKey.current = key

    timers.current.forEach(clearTimeout)
    timers.current = []

    if (size.w > 0) {
      const barW  = Math.min(60, Math.max(2, (size.w - gap * (n - 1)) / n))
      const total = barW * n + gap * (n - 1)
      const offX  = (size.w - total) / 2
      const xOf   = i => offX + i * (barW + gap)

      // arr is already swapped so arr[a] is what was at b, arr[b] is what was at a
      // Store: where bar came FROM (x) and its ORIGINAL value (before swap)
      prevPositions.current = {
        [a]: { x: xOf(b), val: arr[b] },  // bar now at a came from b, had value arr[b]
        [b]: { x: xOf(a), val: arr[a] },  // bar now at b came from a, had value arr[a]
      }
    }

    setPhase('lift')
    timers.current.push(setTimeout(() => setPhase('slide'), 160))
    timers.current.push(setTimeout(() => setPhase('drop'),  360))
    timers.current.push(setTimeout(() => setPhase('idle'),  520))

    return () => timers.current.forEach(clearTimeout)
  }, [swapped[0], swapped[1], arr[swapped[0]], arr[swapped[1]]])

  const { w, h } = size
  if (w === 0 || h === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  }

  const barW    = Math.min(60, Math.max(2, (w - gap * (n - 1)) / n))
  const totalW  = barW * n + gap * (n - 1)
  const offsetX = (w - totalW) / 2
  const xOf     = i => offsetX + i * (barW + gap)

  const [pA, pB] = swapped

  function getPos(idx) {
    const naturalX   = xOf(idx)
    const naturalH   = Math.max(2, (arr[idx] / max) * h)
    const naturalTop = h - naturalH

    const isAnimating = phase !== 'idle' && (idx === pA || idx === pB)
    if (!isAnimating) return { left: naturalX, top: naturalTop, height: naturalH }

    const prev  = prevPositions.current[idx]
    const fromX = prev?.x ?? naturalX
    // Freeze height at original value during lift+slide so bar doesn't change size mid-air
    const frozenH   = prev ? Math.max(2, (prev.val / max) * h) : naturalH
    const frozenTop = h - frozenH

    if (phase === 'lift') {
      return { left: fromX,    top: frozenTop - LIFT, height: frozenH }
    }
    if (phase === 'slide') {
      return { left: naturalX, top: frozenTop - LIFT, height: frozenH }
    }
    if (phase === 'drop') {
      return { left: naturalX, top: naturalTop,       height: naturalH }
    }
    return { left: naturalX, top: naturalTop, height: naturalH }
  }

  function getColor(idx) {
    if (sorted.includes(idx))                               return GREEN
    if (swapped.includes(idx))                              return PURPLE
    if (idx === pivotIdx || idx === midIdx)                 return YELLOW
    if (comparing.includes(idx) || boundary.includes(idx)) return CYAN
    return null
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', paddingTop: 20, boxSizing: 'border-box' }}>
      {arr.map((val, idx) => {
        const color  = getColor(idx)
        const isSwap = swapped.includes(idx)
        const isPiv  = idx === pivotIdx || idx === midIdx
        const isAnim = phase !== 'idle' && (idx === pA || idx === pB)
        const isDrop = phase === 'drop'  && (idx === pA || idx === pB)
        const { left, top, height } = getPos(idx)

        const transition = isDrop
          ? 'top 160ms cubic-bezier(0.34,1.5,0.64,1), height 150ms ease, background 120ms ease, box-shadow 120ms ease'
          : 'left 200ms linear, top 160ms cubic-bezier(0.34,1.5,0.64,1), height 150ms ease, background 120ms ease, box-shadow 120ms ease'

        const labelColor = isSwap ? PURPLE : isPiv ? YELLOW : color ? color : '#334155'
        const showLabel  = barW >= 12

        return (
          <div
            key={idx}
            style={{
              position:  'absolute',
              left,
              top:       top - 18,   // wrapper starts 18px above bar top (label space)
              width:     barW,
              zIndex:    isAnim ? 10 : 0,
              transition,            // whole wrapper (bar+label) moves together
            }}
          >
            {/* Value label */}
            {showLabel && (
              <div style={{
                width:      '100%',
                textAlign:  'center',
                fontSize:   Math.min(11, Math.max(8, barW * 0.45)),
                fontFamily: 'monospace',
                color:      labelColor,
                fontWeight: color ? 700 : 400,
                height:     18,
                lineHeight: '18px',
                transition: 'color 120ms ease',
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
                height,
                background:   color ? barBg(color) : 'linear-gradient(to top, #0d1f3c, #163354)',
                boxShadow:    isSwap ? `0 0 18px ${PURPLE}, 0 0 5px ${PURPLE}88`
                            : isPiv  ? `0 0 14px ${YELLOW}99`
                            : color  ? `0 0 8px ${color}55`
                            : 'none',
                border:       isSwap ? `1px solid ${PURPLE}99`
                            : isPiv  ? `1px solid ${YELLOW}66`
                            : 'none',
                borderRadius: '6px 6px 0 0',
                boxSizing:    'border-box',
                transition:   'height 150ms ease, background 120ms ease, box-shadow 120ms ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

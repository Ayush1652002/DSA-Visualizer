import { useRef, useLayoutEffect, useState, useEffect } from 'react'

const GREEN  = '#4ade80'
const YELLOW = '#facc15'
const CYAN   = '#22d3ee'
const PURPLE = '#c084fc'

function barBg(c) { return `linear-gradient(to top, ${c}88, ${c})` }

export default function Bars({
  arr, comparing = [], swapped = [], sorted = [],
  pivot = [], boundary = [], mid = [], algoKey = '',
}) {
  if (!arr || arr.length === 0) return null

  const n        = arr.length
  const gap      = n > 50 ? 1 : n > 35 ? 2 : n > 20 ? 3 : 4
  const pivotIdx = pivot.length > 0 ? pivot[0] : -1
  const midIdx   = mid.length   > 0 ? mid[0]   : -1

  // Container measurement
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // We use a FIXED max computed once per arr identity so heights never change mid-animation
  const fixedMax = useRef(1)
  const prevArrRef = useRef(arr)
  // Only recompute max when arr LENGTH changes or when not animating
  if (prevArrRef.current !== arr && swapped.length < 2) {
    fixedMax.current = Math.max(...arr, 1)
    prevArrRef.current = arr
  }
  const max = fixedMax.current

  // ── Swap animation ─────────────────────────────────────────────
  // Store the x positions of swapping bars BEFORE they move
  const [offsets, setOffsets] = useState({}) // { idxA: deltaX, idxB: deltaX }
  const animating = useRef(false)
  const lastSwapKey = useRef('')
  const timerRef = useRef(null)

  const { w, h } = size
  const barW   = w > 0 ? Math.min(60, Math.max(2, (w - gap * (n - 1)) / n)) : 0
  const totalW = barW * n + gap * (n - 1)
  const offsetX = w > 0 ? (w - totalW) / 2 : 0
  const xOf = i => offsetX + i * (barW + gap)

  useEffect(() => {
    const a = swapped[0], b = swapped[1]
    if (a === undefined || b === undefined || a === b) return
    if (barW === 0) return

    const key = `${Math.min(a,b)}-${Math.max(a,b)}`
    if (key === lastSwapKey.current) return
    lastSwapKey.current = key

    clearTimeout(timerRef.current)

    // At this point arr is ALREADY swapped
    // Bar A is now at index a but visually should START at xOf(b) and move to xOf(a)
    // Bar B is now at index b but visually should START at xOf(a) and move to xOf(b)
    const dxA = xOf(b) - xOf(a)  // how far A needs to travel (negative = leftward)
    const dxB = xOf(a) - xOf(b)  // how far B needs to travel

    // Step 1: snap bars to their OLD positions instantly (no transition)
    setOffsets({ [a]: dxA, [b]: dxB, transitioning: false })

    // Step 2: one frame later, enable transition and set offset to 0 → they slide to new pos
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOffsets({ [a]: 0, [b]: 0, transitioning: true })
        timerRef.current = setTimeout(() => setOffsets({}), 350)
      })
    })

    return () => clearTimeout(timerRef.current)
  }, [swapped[0], swapped[1]])

  if (w === 0 || h === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  }

  function getColor(idx) {
    if (sorted.includes(idx))                               return GREEN
    if (swapped.includes(idx))                              return PURPLE
    if (idx === pivotIdx || idx === midIdx)                 return YELLOW
    if (comparing.includes(idx) || boundary.includes(idx)) return CYAN
    return null
  }

  const isTransitioning = offsets.transitioning === true

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', paddingTop: 22, boxSizing: 'border-box' }}>
      {arr.map((val, idx) => {
        const color    = getColor(idx)
        const isSwap   = swapped.includes(idx)
        const isPiv    = idx === pivotIdx || idx === midIdx
        const dx       = offsets[idx] ?? 0
        const hasOffset = dx !== 0 || (offsets[idx] === 0 && isTransitioning)
        const barH     = Math.max(2, (val / max) * (h - 22))
        const left     = xOf(idx)

        return (
          <div
            key={idx}
            style={{
              position:   'absolute',
              left:       left + dx,
              bottom:     0,
              width:      barW,
              height:     barH + 22,  // bar + label space
              zIndex:     hasOffset ? 10 : 0,
              transition: isTransitioning ? 'left 280ms ease-in-out' : 'none',
            }}
          >
            {/* Number label — always shows val, never changes during animation */}
            {barW >= 12 && (
              <div style={{
                width: '100%', height: 22, lineHeight: '22px',
                textAlign: 'center',
                fontSize:   Math.min(11, Math.max(8, barW * 0.45)),
                fontFamily: 'monospace',
                color:      isSwap ? PURPLE : isPiv ? YELLOW : color ?? '#334155',
                fontWeight: color ? 700 : 400,
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {val}
              </div>
            )}

            {/* Bar */}
            <div style={{
              position:     'absolute',
              left: 0, right: 0,
              bottom: 0,
              height:       barH,
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
              transition:   'background 120ms ease, box-shadow 120ms ease',
            }} />
          </div>
        )
      })}
    </div>
  )
}
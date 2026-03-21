// CodeViewer.jsx
// Uses Tailwind for layout/spacing. Active line highlight uses inline styles
// (dynamic accentColor cannot be a static Tailwind class).
// Zero Tailwind pseudo-variants → zero PostCSS warnings.

import { useRef, useEffect } from 'react'

export default function CodeViewer({ code, activeLine, accentColor }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeLine])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/5 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <span className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-xs text-slate-500 font-mono tracking-widest uppercase ml-1">
            pseudocode
          </span>
        </div>
        {activeLine >= 0 && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-md"
            style={{
              background: accentColor + '1a',
              color: accentColor,
              border: `1px solid ${accentColor}33`,
            }}
          >
            L{activeLine + 1}
          </span>
        )}
      </div>

      {/* Code lines */}
      <div className="flex-1 overflow-y-auto py-2">
        {code.map((line) => {
          const isActive = activeLine === line.id
          return (
            <div
              key={line.id}
              ref={isActive ? activeRef : null}
              className="flex items-center py-1"
              style={{
                borderLeft: `3px solid ${isActive ? accentColor : 'transparent'}`,
                background: isActive ? accentColor + '12' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              {/* Line number */}
              <span
                className="w-9 shrink-0 text-right pr-3 text-xs font-mono select-none tabular-nums"
                style={{ color: isActive ? accentColor : '#1e3a5f' }}
              >
                {line.id + 1}
              </span>
              {/* Code text */}
              <span
                className="text-xs font-mono whitespace-nowrap leading-relaxed"
                style={{
                  paddingLeft: line.indent * 14 + 'px',
                  color: isActive ? '#f1f5f9' : '#3d5a7a',
                  fontWeight: isActive ? 600 : 400,
                  textShadow: isActive ? `0 0 14px ${accentColor}77` : 'none',
                  transition: 'color 0.15s',
                }}
              >
                {isActive && (
                  <span style={{ color: accentColor, marginRight: 4, fontSize: 9 }}>▶</span>
                )}
                {line.text}
              </span>
            </div>
          )
        })}

        {activeLine === -1 && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-mono text-center text-green-400 bg-green-500/10 border border-green-500/20">
            ✓ Array Sorted!
          </div>
        )}
      </div>
    </div>
  )
}

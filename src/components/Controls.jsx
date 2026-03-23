import { useState } from 'react'

export default function Controls({
  running, finished, stepIdx, totalSteps, progress,
  arraySize, speedKey, accentColor, customInput, inputError,
  minSize, maxSize,
  onStartPause, onNextStep, onPrevStep, onReset, onSizeChange,
  onSpeedChange, onCustomInputChange, onUseCustomInput, onGenerateRandom,
}) {
  const [focused, setFocused] = useState(false)

  const primaryLabel =
    finished ? '↺ Reset' : running ? '⏸ Pause' : stepIdx === 0 ? '▶ Start' : '▶ Resume'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>

      {/* Row 1: playback + speed inline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'nowrap', overflowX: 'auto' }}>
        <button onClick={onStartPause}
          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: running ? 'transparent' : accentColor, color: running ? accentColor : '#000', border: `1px solid ${accentColor}`, boxShadow: running ? 'none' : `0 0 10px ${accentColor}44`, cursor: 'pointer', flexShrink: 0 }}>
          {primaryLabel}
        </button>
        <button onClick={onPrevStep} disabled={stepIdx === 0}
          style={{ padding: '6px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: 'monospace', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', opacity: stepIdx === 0 ? 0.3 : 1, flexShrink: 0 }}>
          ← Prev
        </button>
        <button onClick={onNextStep} disabled={finished}
          style={{ padding: '6px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: 'monospace', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', opacity: finished ? 0.3 : 1, flexShrink: 0 }}>
          Next →
        </button>
        <button onClick={onReset}
          style={{ padding: '6px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: 'monospace', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>
          ↺ New
        </button>
        <div style={{ flex: 1, minWidth: 4 }} />
        {/* Speed inline */}
        <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {[['slow','Slow'],['medium','Med'],['fast','Fast']].map(([k, l]) => (
            <button key={k} onClick={() => onSpeedChange(k)}
              style={{ padding: '4px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', background: speedKey === k ? accentColor + '22' : 'transparent', color: speedKey === k ? accentColor : '#475569', border: 'none', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', width: 28, textAlign: 'right', flexShrink: 0 }}>{progress}%</span>
        <div style={{ flex: 1, height: 3, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: accentColor, boxShadow: `0 0 6px ${accentColor}80`, borderRadius: 9999, transition: 'width 200ms' }} />
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', flexShrink: 0 }}>{stepIdx}/{totalSteps - 1}</span>
      </div>

      {/* Row 3: size slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', flexShrink: 0 }}>
          Size: <strong style={{ color: '#e2e8f0' }}>{arraySize}</strong>
        </span>
        <input type="range" min={minSize} max={maxSize} value={arraySize}
          onChange={e => onSizeChange(Number(e.target.value))}
          style={{ flex: 1, accentColor }} />
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {[12, 24, 40].map(n => (
            <button key={n} onClick={() => onSizeChange(n)}
              style={{ padding: '3px 7px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', background: arraySize === n ? accentColor + '20' : 'rgba(255,255,255,0.04)', border: `1px solid ${arraySize === n ? accentColor : 'rgba(255,255,255,0.08)'}`, color: arraySize === n ? accentColor : '#4b5563', cursor: 'pointer' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: custom input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '5px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}` }}>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', flexShrink: 0, letterSpacing: 1, textTransform: 'uppercase' }}>arr[]</span>
          <input type="text" value={customInput}
            onChange={e => onCustomInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onUseCustomInput()}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Enter your own array e.g. 5, 3, 8, 1, 9, 2"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 10, fontFamily: 'monospace', color: '#e2e8f0' }} />
        </div>
        <button onClick={onUseCustomInput}
          style={{ padding: '5px 10px', borderRadius: 8, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Use
        </button>
        <button onClick={onGenerateRandom}
          style={{ padding: '5px 10px', borderRadius: 8, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, background: accentColor + '1a', border: `1px solid ${accentColor}44`, color: accentColor, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Generate
        </button>
      </div>

      {inputError && (
        <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#f87171', margin: 0 }}>⚠ {inputError}</p>
      )}
    </div>
  )
}
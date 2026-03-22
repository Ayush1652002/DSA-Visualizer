// Controls.jsx
// Uses Tailwind for layout, spacing, borders, bg, text, rounded, shadow.
// Dynamic colors (accentColor) use inline styles only.
// Avoided: active:, focus-within: → zero PostCSS nesting warnings.

import { useState } from 'react'

export default function Controls({
  running,
  finished,
  stepIdx,
  totalSteps,
  progress,
  arraySize,
  speedKey,
  accentColor,
  customInput,
  inputError,
  minSize,
  maxSize,
  onStartPause,
  onNextStep,
  onPrevStep,
  onReset,
  onSizeChange,
  onSpeedChange,
  onCustomInputChange,
  onUseCustomInput,
  onGenerateRandom,
}) {
  const [focused, setFocused] = useState(false)

  const primaryLabel =
    finished ? '↺ Reset' : running ? '⏸ Pause' : stepIdx === 0 ? '▶ Start' : '▶ Resume'

  return (
    <div className="flex flex-col gap-3 px-4 md:px-6 py-4 bg-white/5 border-b border-white/10 shrink-0">

      {/* ── Row 1: Playback controls + speed ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Primary button */}
        <button
          onClick={onStartPause}
          className="px-5 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition-all duration-200"
          style={{
            background:  running ? 'transparent' : accentColor,
            color:       running ? accentColor : '#000',
            border:      `1px solid ${accentColor}`,
            boxShadow:   running ? 'none' : `0 0 16px ${accentColor}44`,
            cursor: 'pointer',
          }}
        >
          {primaryLabel}
        </button>

        {/* Prev step */}
        <button
          onClick={onPrevStep}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide border border-white/10 text-slate-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'transparent', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer' }}
        >
          ← Prev
        </button>

        {/* Next step */}
        <button
          onClick={onNextStep}
          disabled={finished}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide border border-white/10 text-slate-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'transparent', cursor: finished ? 'not-allowed' : 'pointer' }}
        >
          Next →
        </button>

        {/* New array */}
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-white/10 text-slate-500 transition-all duration-200"
          style={{ background: 'transparent', cursor: 'pointer' }}
        >
          ↺ New
        </button>

        <div className="flex-1" />

        {/* Speed selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[['slow', 'Slow'], ['medium', 'Med'], ['fast', 'Fast']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => onSpeedChange(k)}
              className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-150"
              style={{
                background: speedKey === k ? accentColor + '22' : 'transparent',
                color:      speedKey === k ? accentColor : '#475569',
                border:     'none',
                cursor:     'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 2: Progress bar ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-600 w-8 text-right shrink-0 tabular-nums">
          {progress}%
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: progress + '%',
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}80`,
            }}
          />
        </div>
        <span className="text-xs font-mono text-slate-600 w-16 text-right shrink-0 tabular-nums">
          {stepIdx} / {totalSteps - 1}
        </span>
      </div>

      {/* ── Row 3: Array size slider ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-mono text-slate-400 shrink-0">
          Size: <strong className="text-slate-200">{arraySize}</strong>
        </span>
        <input
          type="range"
          min={minSize}
          max={maxSize}
          value={arraySize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="flex-1 min-w-16"
          style={{ accentColor }}
        />
        <div className="flex gap-1.5 shrink-0">
          {[12, 24, 40].map((n) => (
            <button
              key={n}
              onClick={() => onSizeChange(n)}
              className="px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-150"
              style={{
                background:  arraySize === n ? accentColor + '20' : 'rgba(255,255,255,0.04)',
                border:      `1px solid ${arraySize === n ? accentColor : 'rgba(255,255,255,0.08)'}`,
                color:       arraySize === n ? accentColor : '#4b5563',
                cursor:      'pointer',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 4: Custom input ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {/* Text field */}
          <div
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2 bg-white/5 transition-all duration-200"
            style={{
              border: `1px solid ${focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span className="text-xs font-mono text-slate-600 shrink-0 tracking-widest uppercase">
              arr[]
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onUseCustomInput()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. 5, 3, 8, 1, 9, 2"
              className="flex-1 min-w-0 bg-transparent text-xs font-mono text-slate-200 outline-none placeholder-slate-700"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onUseCustomInput}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-mono font-semibold border border-white/10 text-slate-400 bg-white/5 transition-all duration-200 whitespace-nowrap"
              style={{ cursor: 'pointer' }}
            >
              Use Input
            </button>
            <button
              onClick={onGenerateRandom}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 whitespace-nowrap"
              style={{
                background: accentColor + '1a',
                color:      accentColor,
                border:     `1px solid ${accentColor}44`,
                cursor:     'pointer',
              }}
            >
              Generate Array
            </button>
          </div>
        </div>

        {/* Validation error */}
        {inputError && (
          <p className="flex items-center gap-1.5 text-xs font-mono text-red-400 pl-1">
            <span>⚠</span>
            <span>{inputError}</span>
          </p>
        )}
      </div>
    </div>
  )
}

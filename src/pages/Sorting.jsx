import { useState } from 'react'
import Bars       from '../components/Bars.jsx'
import CodeViewer from '../components/CodeViewer.jsx'
import Controls   from '../components/Controls.jsx'
import AlgoHint   from '../components/AlgoHint.jsx'
import { bubbleCode,    generateBubbleSteps    } from '../algorithms/bubble.js'
import { selectionCode, generateSelectionSteps } from '../algorithms/selection.js'
import { insertionCode, generateInsertionSteps } from '../algorithms/insertion.js'
import { mergeCode,     generateMergeSteps     } from '../algorithms/merge.js'
import { quickCode,     generateQuickSteps     } from '../algorithms/quick.js'
import { useSortingVisualizer, MIN_SIZE, MAX_SIZE } from '../hooks/useSortingVisualizer.js'
import { useIsDesktop } from '../hooks/useIsDesktop.js'

const ALGORITHMS = {
  bubble:    { name: 'Bubble',    color: '#22d3ee', code: bubbleCode,    gen: generateBubbleSteps    },
  selection: { name: 'Selection', color: '#a78bfa', code: selectionCode, gen: generateSelectionSteps },
  insertion: { name: 'Insertion', color: '#34d399', code: insertionCode, gen: generateInsertionSteps },
  merge:     { name: 'Merge',     color: '#38bdf8', code: mergeCode,     gen: generateMergeSteps     },
  quick:     { name: 'Quick',     color: '#fb7185', code: quickCode,     gen: generateQuickSteps     },
}

export default function Sorting() {
  const [algoKey, setAlgoKey] = useState('bubble')
  const isDesktop = useIsDesktop()
  const algo = ALGORITHMS[algoKey]

  const {
    arraySize, speedKey, steps, stepIdx,
    running, finished, customInput, inputError,
    currentStep, progress,
    setSpeedKey, setCustomInput,
    handleStartPause, handleNextStep, handlePrevStep,
    handleReset, handleSizeChange, handleGenerateRandom,
    handleUseCustomInput,
  } = useSortingVisualizer(algo)

  function handleAlgoChange(key) {
    setAlgoKey(key)
  }

  const codePanelStyle = isDesktop
    ? { width: 260, height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }
    : { width: '100%', height: 140, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }

  return (
    <>
      {/* Algo tabs */}
      <div className="flex shrink-0 bg-white/[0.03] border-b border-white/10"
        style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        {Object.entries(ALGORITHMS).map(([key, a]) => (
          <button key={key} onClick={() => handleAlgoChange(key)}
            className="px-4 md:px-5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all duration-200"
            style={{
              border:       'none',
              borderBottom: `2px solid ${algoKey === key ? a.color : 'transparent'}`,
              background:   algoKey === key ? a.color + '15' : 'transparent',
              color:        algoKey === key ? a.color : '#4b5563',
              cursor:       'pointer',
            }}>
            {a.name}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span className="text-xs text-slate-500 hidden md:flex items-center px-4">
          step <strong className="text-slate-300 mx-1">{stepIdx}</strong>
          <span className="text-slate-700">/ {steps.length - 1}</span>
        </span>
      </div>

      {/* Controls */}
      <Controls
        running={running} finished={finished}
        stepIdx={stepIdx} totalSteps={steps.length} progress={progress}
        arraySize={arraySize} speedKey={speedKey} accentColor={algo.color}
        customInput={customInput} inputError={inputError}
        minSize={MIN_SIZE} maxSize={MAX_SIZE}
        onStartPause={handleStartPause} onNextStep={handleNextStep} onPrevStep={handlePrevStep}
        onReset={handleReset} onSizeChange={handleSizeChange}
        onSpeedChange={setSpeedKey} onCustomInputChange={setCustomInput}
        onUseCustomInput={handleUseCustomInput} onGenerateRandom={handleGenerateRandom}
      />

      {/* Main body */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        overflow: 'hidden', minHeight: 0,
      }}>

        {/* Code panel */}
        <div style={{ ...codePanelStyle, overflow: 'hidden' }}>
          <CodeViewer
            code={algo.code}
            activeLine={currentStep.line}
            accentColor={algo.color}
          />
        </div>

        {/* Bars panel */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0, minHeight: 0,
        }}>
          <AlgoHint algoKey={algoKey} step={currentStep} />

          <div style={{ flex: 1, padding: isDesktop ? 16 : 6, overflow: 'hidden', minHeight: isDesktop ? 0 : 220 }}>
            <div
              className="rounded-xl border border-white/10 bg-white/5"
              style={{ width: '100%', height: '100%', padding: 12, boxSizing: 'border-box', overflow: 'hidden' }}
            >
              <Bars
                arr={currentStep.arr}
                comparing={currentStep.comparing ?? []}
                swapped={currentStep.swapped     ?? []}
                sorted={currentStep.sorted       ?? []}
                pivot={currentStep.pivot         ?? []}
                boundary={currentStep.boundary   ?? []}
                mid={currentStep.mid             ?? []}
                range={currentStep.range         ?? []}
                algoKey={algoKey}
                accentColor={algo.color}
              />
            </div>
          </div>

          {/* Footer legend */}
          <div
            className="flex items-center border-t border-white/10 bg-white/5 shrink-0 flex-wrap"
            style={{ padding: '0 16px', gap: '16px', height: 36, minHeight: 36, maxHeight: 36, overflow: 'hidden' }}
          >
            {(algoKey === 'quick'
              ? [
                  { color: '#facc15', label: 'Pivot' },
                  { color: '#22d3ee', label: 'Scanning' },
                  { color: '#4ade80', label: 'Sorted' },
                ]
              : algoKey === 'merge'
              ? [
                  { color: '#facc15', label: 'Mid point' },
                  { color: '#22d3ee', label: 'Comparing' },
                  { color: '#4ade80', label: 'Sorted' },
                ]
              : [
                  { color: '#22d3ee', label: 'Comparing' },
                  { color: '#c084fc', label: 'Swapping' },
                  { color: '#4ade80', label: 'Sorted' },
                ]
            ).map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
              </div>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
              step <strong style={{ color: '#64748b' }}>{stepIdx}</strong> / {steps.length - 1}
            </span>
            {finished && <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>✓ Sorted!</span>}
          </div>
        </div>
      </div>
    </>
  )
}
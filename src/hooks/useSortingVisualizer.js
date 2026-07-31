import { useState, useEffect, useRef, useCallback } from 'react'

const SPEEDS = { slow: 650, medium: 220, fast: 60 }
export const MIN_SIZE = 4
export const MAX_SIZE = 60

function makeArray(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 88) + 8)
}

export function useSortingVisualizer(algo) {
  const [arraySize,   setArraySize]   = useState(13)
  const [speedKey,    setSpeedKey]    = useState('medium')
  const [baseArr,     setBaseArr]     = useState(() => makeArray(13))
  const [steps,       setSteps]       = useState([])
  const [stepIdx,     setStepIdx]     = useState(0)
  const [running,     setRunning]     = useState(false)
  const [finished,    setFinished]    = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [inputError,  setInputError]  = useState('')
  const timerRef = useRef(null)

  const currentStep = steps[stepIdx] ?? {
    arr: baseArr, comparing: [], swapped: [], sorted: [],
    pivot: [], boundary: [], mid: [], range: [], line: -2,
  }

  const progress = steps.length > 1
    ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0

  useEffect(() => {
    clearInterval(timerRef.current)
    setRunning(false)
    setFinished(false)
    setSteps(algo.gen(baseArr))
    setStepIdx(0)
  }, [algo, baseArr])

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          setFinished(true)
          return prev
        }
        return prev + 1
      })
    }, SPEEDS[speedKey])
    return () => clearInterval(timerRef.current)
  }, [running, steps.length, speedKey])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    setRunning(false)
    setFinished(false)
  }, [])

  const handleStartPause = useCallback(() => {
    if (finished) { setBaseArr(makeArray(arraySize)); return }
    if (stepIdx >= steps.length - 1) { setFinished(true); return }
    setRunning((r) => !r)
  }, [finished, stepIdx, steps.length, arraySize])

  const handleNextStep = useCallback(() => {
    if (running) setRunning(false)
    setStepIdx((prev) => {
      const next = Math.min(prev + 1, steps.length - 1)
      if (next >= steps.length - 1) setFinished(true)
      return next
    })
  }, [running, steps.length])

  const handlePrevStep = useCallback(() => {
    if (running) setRunning(false)
    setFinished(false)
    setStepIdx((prev) => Math.max(prev - 1, 0))
  }, [running])

  const handleReset = useCallback(() => {
    stop()
    setBaseArr(makeArray(arraySize))
    setCustomInput('')
    setInputError('')
  }, [arraySize, stop])

  const handleSizeChange = useCallback((n) => {
    stop()
    setArraySize(n)
    setBaseArr(makeArray(n))
    setCustomInput('')
    setInputError('')
  }, [stop])

  const handleGenerateRandom = useCallback(() => {
    stop()
    setBaseArr(makeArray(arraySize))
    setCustomInput('')
    setInputError('')
  }, [arraySize, stop])

  const handleUseCustomInput = useCallback(() => {
    if (!customInput.trim()) { setInputError('Input is empty.'); return }
    const parsed = customInput.split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 999)
    if (parsed.length < 2) { setInputError('Enter at least 2 valid numbers (1–999).'); return }
    if (parsed.length > MAX_SIZE) { setInputError(`Max ${MAX_SIZE} values allowed.`); return }
    setInputError('')
    stop()
    setArraySize(parsed.length)
    setBaseArr(parsed)
  }, [customInput, stop])

  return {
    arraySize, speedKey, baseArr, steps, stepIdx,
    running, finished, customInput, inputError,
    currentStep, progress,
    setSpeedKey, setCustomInput,
    handleStartPause, handleNextStep, handlePrevStep,
    handleReset, handleSizeChange, handleGenerateRandom,
    handleUseCustomInput,
  }
}
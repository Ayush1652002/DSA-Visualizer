// AlgoHint.jsx
// Shows a plain-English sentence describing what is happening RIGHT NOW.

const CYAN   = '#22d3ee'
const YELLOW = '#facc15'
const GREEN  = '#4ade80'
const PURPLE = '#c084fc'

// ── Bubble Sort hint ──────────────────────────────────────────────────
function bubbleHint(step) {
  const { line, arr, comparing, swapped } = step
  const [ci, cj] = comparing ?? []
  const [si, sj] = swapped   ?? []
  const va = ci >= 0 && arr ? arr[ci] : null
  const vb = cj >= 0 && arr ? arr[cj] : null

  if (line === -1) return { text: 'Array is fully sorted!', color: GREEN }
  if (line === 0)  return { text: 'Outer loop — starting a new pass through the array', color: CYAN }
  if (line === 1)  return { text: `Inner loop — comparing adjacent elements`, color: CYAN }
  if (line === 2) {
    if (va !== null && vb !== null)
      return va > vb
        ? { text: `${va} > ${vb} — out of order, swap them!`, color: PURPLE }
        : { text: `${va} ≤ ${vb} — already in order, no swap needed`, color: CYAN }
    return { text: 'Comparing adjacent bars…', color: CYAN }
  }
  if (line === 3) {
    const a = arr?.[si], b = arr?.[sj]
    return { text: `Swapping ${b} ↔ ${a} — larger bubble moves right`, color: PURPLE }
  }
  if (line === 4)  return { text: 'Largest unsorted element is now in its final position ✓', color: GREEN }
  return { text: 'Running…', color: CYAN }
}

// ── Selection Sort hint ───────────────────────────────────────────────
function selectionHint(step) {
  const { line, arr, comparing, swapped } = step
  const [ci, minI] = comparing ?? []
  const [si, sj]   = swapped   ?? []
  const cv   = ci   >= 0 && arr ? arr[ci]   : null
  const minV = minI >= 0 && arr ? arr[minI] : null

  if (line === -1) return { text: 'Array is fully sorted!', color: GREEN }
  if (line === 0)  return { text: 'Outer loop — finding minimum for current position', color: CYAN }
  if (line === 1)  return { text: `Assuming current position is the minimum`, color: CYAN }
  if (line === 2)  return { text: 'Scanning remaining unsorted elements', color: CYAN }
  if (line === 3) {
    if (cv !== null && minV !== null)
      return cv < minV
        ? { text: `${cv} < ${minV} (current min) — found a smaller element!`, color: YELLOW }
        : { text: `${cv} ≥ ${minV} (current min) — not smaller, continue`, color: CYAN }
    return { text: 'Checking if this element is smaller than current minimum…', color: CYAN }
  }
  if (line === 4)  return { text: `New minimum found — updating minimum index`, color: YELLOW }
  if (line === 5) {
    const a = arr?.[si], b = arr?.[sj]
    return { text: `Swapping minimum ${a} to its correct position`, color: PURPLE }
  }
  if (line === 6)  return { text: 'Element placed in its final sorted position ✓', color: GREEN }
  return { text: 'Running…', color: CYAN }
}

// ── Insertion Sort hint ───────────────────────────────────────────────
function insertionHint(step) {
  const { line, arr, comparing, swapped } = step
  const [ci, cj] = comparing ?? []
  const [si, sj] = swapped   ?? []
  const va = ci >= 0 && arr ? arr[ci] : null
  const vb = cj >= 0 && arr ? arr[cj] : null

  if (line === -1) return { text: 'Array is fully sorted!', color: GREEN }
  if (line === 0)  return { text: 'Outer loop — picking next element to insert', color: CYAN }
  if (line === 1)  return { text: `Picking key element to insert into sorted portion`, color: YELLOW }
  if (line === 2)  return { text: 'Starting from the element just before key', color: CYAN }
  if (line === 3) {
    if (va !== null && vb !== null)
      return va > vb
        ? { text: `${va} > ${vb} — element is larger than key, shift it right`, color: PURPLE }
        : { text: `Found correct position — key is larger, stop shifting`, color: CYAN }
    return { text: 'Checking if we need to shift more…', color: CYAN }
  }
  if (line === 4)  return { text: 'Shifting element one position right to make room', color: PURPLE }
  if (line === 5)  return { text: 'Moving one position left to continue checking', color: CYAN }
  if (line === 6)  return { text: 'Key inserted at its correct sorted position ✓', color: GREEN }
  if (line === 7)  return { text: 'Left portion is now sorted up to this index', color: GREEN }
  return { text: 'Running…', color: CYAN }
}

// ── Quick Sort hint ───────────────────────────────────────────────────
function quickHint(step) {
  const { line, arr, pivot, boundary, comparing, swapped, range } = step
  const pivotIdx    = pivot?.[0]    ?? -1
  const boundaryIdx = boundary?.[0] ?? -1
  const compareIdx  = comparing?.[0] ?? -1
  const pivotVal    = pivotIdx >= 0 && arr ? arr[pivotIdx] : null
  const compareVal  = compareIdx >= 0 && arr ? arr[compareIdx] : null

  if (line === -1) return { text: 'Array is fully sorted!', color: GREEN }
  if (line === 0)  return { text: `Working on subarray [ ${range?.[0] ?? '?'} … ${range?.[1] ?? '?'} ]`, color: CYAN }
  if (line === 1)  return { text: 'Single element — already in place.', color: GREEN }
  if (line === 2)  return { text: `Pivot chosen → value ${pivotVal} (rightmost bar, shown in yellow)`, color: YELLOW }
  if (line === 3)  return { text: 'Setting wall (i) at position before subarray starts.', color: CYAN }
  if (line === 4)  return { text: `Scanning bar at index ${compareIdx} (value ${compareVal}) — is it ≤ pivot (${pivotVal})?`, color: CYAN }
  if (line === 5) {
    if (compareVal !== null && pivotVal !== null) {
      return compareVal <= pivotVal
        ? { text: `${compareVal} ≤ ${pivotVal} (pivot) → move wall right and swap it left`, color: CYAN }
        : { text: `${compareVal} > ${pivotVal} (pivot) → leave it on the right side`, color: PURPLE }
    }
    return { text: 'Comparing current bar against pivot…', color: CYAN }
  }
  if (line === 6) {
    const [si, sj] = swapped ?? []
    const va = arr?.[si], vb = arr?.[sj]
    return { text: `Swapping values ${va} ↔ ${vb} — smaller element crosses to left side`, color: PURPLE }
  }
  if (line === 7)  return { text: `Pivot (${pivotVal}) placed in its final position — it's sorted! ✓`, color: GREEN }
  if (line === 8)  return { text: 'Recursing into LEFT half (elements smaller than pivot)', color: CYAN }
  if (line === 9)  return { text: 'Recursing into RIGHT half (elements larger than pivot)', color: CYAN }
  return { text: 'Running…', color: CYAN }
}

// ── Merge Sort hint ───────────────────────────────────────────────────
function mergeHint(step) {
  const { line, arr, mid, comparing, swapped, range } = step
  const midIdx    = mid?.[0]       ?? -1
  const leftIdx   = comparing?.[0] ?? -1
  const rightIdx  = comparing?.[1] ?? -1
  const placedIdx = swapped?.[0]   ?? -1
  const midVal    = midIdx >= 0 && arr ? arr[midIdx] : null
  const leftVal   = leftIdx >= 0 && arr ? arr[leftIdx] : null
  const rightVal  = rightIdx >= 0 && arr ? arr[rightIdx] : null
  const placedVal = placedIdx >= 0 && arr ? arr[placedIdx] : null
  const l = range?.[0] ?? '?'
  const r = range?.[1] ?? '?'

  if (line === -1) return { text: 'Array is fully sorted!', color: GREEN }
  if (line === 0)  return { text: `Splitting subarray [ ${l} … ${r} ] into two halves`, color: CYAN }
  if (line === 1)  return { text: 'Single element — nothing to split, it is already sorted.', color: GREEN }
  if (line === 2)  return { text: `Mid = index ${midIdx} (value ${midVal}) — left half ends here, right half starts after`, color: YELLOW }
  if (line === 3)  return { text: `Sorting LEFT half [ ${l} … ${midIdx} ]`, color: CYAN }
  if (line === 4)  return { text: `Sorting RIGHT half [ ${midIdx + 1} … ${r} ]`, color: CYAN }
  if (line === 5)  return { text: `Both halves sorted — now merging them back together`, color: CYAN }
  if (line === 6) {
    if (leftVal !== null && rightVal !== null) {
      const winner = leftVal <= rightVal ? leftVal : rightVal
      return {
        text: `Comparing ${leftVal} (left) vs ${rightVal} (right) → ${winner} is smaller, place it next`,
        color: CYAN,
      }
    }
    return { text: 'Comparing one element from each half…', color: CYAN }
  }
  if (line === 7)  return { text: `Placed ${placedVal} into merged position ✓`, color: PURPLE }
  return { text: 'Running…', color: CYAN }
}

// ── Component ─────────────────────────────────────────────────────────
export default function AlgoHint({ algoKey, step }) {
  if (!step) return null

  const hintFn = {
    bubble:    bubbleHint,
    selection: selectionHint,
    insertion: insertionHint,
    quick:     quickHint,
    merge:     mergeHint,
  }[algoKey]

  if (!hintFn) return null

  const { text, color } = hintFn(step)

  return (
    <div
      className="flex items-center gap-2 px-3 mx-0 border text-xs font-mono shrink-0"
      style={{
        background:   `${color}0d`,
        borderColor:  `${color}33`,
        borderWidth:  '0 0 1px 0',
        color:        color,
        height:       36,
        minHeight:    36,
        maxHeight:    36,
        overflow:     'hidden',
        transition:   'background 200ms ease, border-color 200ms ease, color 200ms ease',
      }}
    >
      {/* Colored dot */}
      <span
        className="shrink-0 rounded-full"
        style={{ width: 6, height: 6, background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {/* Message */}
      <span style={{ lineHeight: 1.4 }}>{text}</span>
    </div>
  )
}
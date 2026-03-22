// AlgoHint.jsx
// Shows a plain-English sentence describing what is happening RIGHT NOW.
// Only renders for 'quick' and 'merge'. Zero impact on other algorithms.

const CYAN   = '#22d3ee'
const YELLOW = '#facc15'
const GREEN  = '#4ade80'
const PURPLE = '#c084fc'

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
  if (algoKey !== 'quick' && algoKey !== 'merge') return null
  if (!step) return null

  const { text, color } = algoKey === 'quick' ? quickHint(step) : mergeHint(step)

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mx-0 rounded-lg border text-xs font-mono shrink-0"
      style={{
        background:  `${color}0d`,
        borderColor: `${color}33`,
        color:       color,
        minHeight:   32,
        transition:  'background 200ms ease, border-color 200ms ease, color 200ms ease',
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

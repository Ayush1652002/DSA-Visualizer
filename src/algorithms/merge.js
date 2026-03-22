export const mergeCode = [
  { id: 0, text: 'mergeSort(arr, l, r):',         indent: 0 },
  { id: 1, text: 'if l >= r: return',             indent: 1 },
  { id: 2, text: 'mid = floor((l + r) / 2)',      indent: 1 },
  { id: 3, text: 'mergeSort(arr, l, mid)',         indent: 1 },
  { id: 4, text: 'mergeSort(arr, mid+1, r)',       indent: 1 },
  { id: 5, text: 'merge(l, mid, r):',             indent: 1 },
  { id: 6, text: 'compare L[i] vs R[j]',          indent: 2 },
  { id: 7, text: 'place smaller into arr[k]',     indent: 2 },
]

export function generateMergeSteps(input) {
  const steps = []
  const arr = [...input]
  const sortedSet = new Set()

  /*
    Each step carries:
      comparing : [i, j]   — the two elements being compared (cyan)
      swapped   : [k]      — element just placed (purple)
      sorted    : [...]    — fully sorted indices (green)
      mid       : [midIdx] — the dividing midpoint bar (orange)
      range     : [l, r]   — active subarray boundaries (dim highlight)
  */
  function push(line, a, comparing, swapped, mid = [], range = []) {
    steps.push({
      line,
      arr:      [...a],
      comparing,
      swapped,
      sorted:   [...sortedSet],
      mid,
      range,
    })
  }

  function merge(a, l, midIdx, r) {
    const L = a.slice(l, midIdx + 1)
    const R = a.slice(midIdx + 1, r + 1)
    let i = 0, j = 0, k = l

    push(5, a, [], [], [midIdx], [l, r])

    while (i < L.length && j < R.length) {
      // Show the two elements being compared across the split
      push(6, a, [l + i, midIdx + 1 + j], [], [midIdx], [l, r])
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++]
      push(7, a, [], [k - 1], [midIdx], [l, r])
    }
    while (i < L.length) {
      a[k++] = L[i++]
      push(7, a, [], [k - 1], [midIdx], [l, r])
    }
    while (j < R.length) {
      a[k++] = R[j++]
      push(7, a, [], [k - 1], [midIdx], [l, r])
    }
    for (let x = l; x <= r; x++) sortedSet.add(x)
  }

  function ms(a, l, r) {
    push(0, a, [], [], [], [l, r])
    if (l >= r) {
      push(1, a, [l], [], [], [l, r])
      if (l === r) sortedSet.add(l)
      return
    }
    const midIdx = Math.floor((l + r) / 2)
    push(2, a, [], [], [midIdx], [l, r])  // mid bar = orange
    push(3, a, [], [], [midIdx], [l, midIdx]); ms(a, l, midIdx)
    push(4, a, [], [], [midIdx], [midIdx + 1, r]); ms(a, midIdx + 1, r)
    merge(a, l, midIdx, r)
  }

  ms(arr, 0, arr.length - 1)
  steps.push({
    line: -1, arr: [...arr], comparing: [], swapped: [],
    sorted: arr.map((_, i) => i), mid: [], range: [],
  })
  return steps
}

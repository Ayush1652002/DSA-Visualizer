export const mergeCode = [
  { id: 0, text: 'mergeSort(arr, l, r):',       indent: 0 },
  { id: 1, text: 'if l >= r: return',           indent: 1 },
  { id: 2, text: 'mid = (l + r) / 2',           indent: 1 },
  { id: 3, text: 'mergeSort(arr, l, mid)',       indent: 1 },
  { id: 4, text: 'mergeSort(arr, mid+1, r)',     indent: 1 },
  { id: 5, text: 'merge(l, mid, r)',             indent: 1 },
  { id: 6, text: 'compare L[i] vs R[j]',        indent: 2 },
  { id: 7, text: 'place smaller into arr[k]',   indent: 2 },
]

export function generateMergeSteps(input) {
  const steps     = []
  const arr       = [...input]
  const n         = arr.length
  const sortedSet = new Set()

  function push(line, comparing = [], swapped = [], mid = [], range = []) {
    steps.push({
      line, arr: [...arr], comparing, swapped,
      sorted:   [...sortedSet],
      mid, range, pivot: [], boundary: [],
    })
  }

  function merge(l, midIdx, r) {
    // Snapshot BOTH halves into auxiliary arrays before touching arr
    const L = arr.slice(l,          midIdx + 1)
    const R = arr.slice(midIdx + 1, r + 1)
    let i = 0, j = 0, k = l

    push(5, [], [], [midIdx], [l, r])

    while (i < L.length && j < R.length) {
      const idxL = l + i
      const idxR = midIdx + 1 + j

      push(6, [idxL, idxR], [], [midIdx], [l, r])

      if (L[i] <= R[j]) {
        arr[k] = L[i]; i++
        // Left element placed — highlight only destination (no cross needed)
        push(7, [], [k], [midIdx], [l, r])
      } else {
        arr[k] = R[j]; j++
        // Right element crossed over left — show as swap between idxR and k
        push(7, [], [idxR, k], [midIdx], [l, r])
      }
      k++
    }

    while (i < L.length) {
      arr[k] = L[i]; i++
      push(7, [], [k], [midIdx], [l, r])
      k++
    }

    while (j < R.length) {
      arr[k] = R[j]; j++
      push(7, [], [k], [midIdx], [l, r])
      k++
    }

    for (let x = l; x <= r; x++) sortedSet.add(x)
  }

  function ms(l, r) {
    push(0, [], [], [], [l, r])
    if (l >= r) {
      if (l === r) sortedSet.add(l)
      push(1, [l], [], [], [l, r])
      return
    }
    const midIdx = Math.floor((l + r) / 2)
    push(2, [], [], [midIdx], [l, r])
    push(3, [], [], [midIdx], [l, midIdx]);    ms(l, midIdx)
    push(4, [], [], [midIdx], [midIdx + 1, r]); ms(midIdx + 1, r)
    merge(l, midIdx, r)
  }

  ms(0, n - 1)
  steps.push({
    line: -1, arr: [...arr], comparing: [], swapped: [],
    sorted: arr.map((_, i) => i),
    mid: [], range: [], pivot: [], boundary: [],
  })
  return steps
}
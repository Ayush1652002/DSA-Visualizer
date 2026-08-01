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
  const steps   = []
  const display = [...input]
  const n       = input.length
  const sortedSet = new Set()

  function push(line, comparing = [], swapped = [], mid = [], range = []) {
    steps.push({
      line,
      arr: [...display],
      comparing, swapped,
      sorted:   [...sortedSet],
      mid, range, pivot: [], boundary: [],
    })
  }

  function merge(l, midIdx, r) {
    push(5, [], [], [midIdx], [l, r])

    const L = display.slice(l, midIdx + 1)
    const R = display.slice(midIdx + 1, r + 1)
    let i = 0, j = 0, k = l

    while (i < L.length && j < R.length) {
      const posL = display.indexOf(L[i], l)
      const posR = display.indexOf(R[j], midIdx + 1)

      push(6, [posL, posR], [], [midIdx], [l, r])

      if (L[i] <= R[j]) {
        if (posL !== k) {
          push(7, [], [posL, k], [midIdx], [l, r])
          ;[display[posL], display[k]] = [display[k], display[posL]]
          push(7, [], [posL, k], [midIdx], [l, r])
        }
        i++
      } else {
        const posR2 = display.indexOf(R[j], k)
        if (posR2 !== k) {
          push(7, [], [posR2, k], [midIdx], [l, r])
          ;[display[posR2], display[k]] = [display[k], display[posR2]]
          push(7, [], [posR2, k], [midIdx], [l, r])
        }
        j++
      }
      k++
    }

    for (let x = l; x <= r; x++) sortedSet.add(x)
    push(5, [], [], [midIdx], [l, r])
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
    push(3, [], [], [midIdx], [l, midIdx]);     ms(l, midIdx)
    push(4, [], [], [midIdx], [midIdx + 1, r]); ms(midIdx + 1, r)
    merge(l, midIdx, r)
  }

  ms(0, n - 1)
  steps.push({
    line: -1, arr: [...display], comparing: [], swapped: [],
    sorted: display.map((_, i) => i),
    mid: [], range: [], pivot: [], boundary: [],
  })
  return steps
}
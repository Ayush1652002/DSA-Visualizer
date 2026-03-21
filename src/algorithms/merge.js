export const mergeCode = [
  { id: 0, text: 'mergeSort(arr, l, r):',         indent: 0 },
  { id: 1, text: 'if l >= r: return',             indent: 1 },
  { id: 2, text: 'mid = floor((l + r) / 2)',      indent: 1 },
  { id: 3, text: 'mergeSort(arr, l, mid)',         indent: 1 },
  { id: 4, text: 'mergeSort(arr, mid+1, r)',       indent: 1 },
  { id: 5, text: 'merge(l, mid, r):',             indent: 1 },
  { id: 6, text: 'pick smaller of L[i] / R[j]',   indent: 2 },
  { id: 7, text: 'place into arr[k]',             indent: 2 },
]

export function generateMergeSteps(input) {
  const steps = []
  const arr = [...input]
  const sortedSet = new Set()

  function merge(a, l, mid, r) {
    const L = a.slice(l, mid + 1)
    const R = a.slice(mid + 1, r + 1)
    let i = 0, j = 0, k = l
    steps.push({ line: 5, arr: [...a], comparing: [l, r], swapped: [], sorted: [...sortedSet] })
    while (i < L.length && j < R.length) {
      steps.push({ line: 6, arr: [...a], comparing: [l + i, mid + 1 + j], swapped: [], sorted: [...sortedSet] })
      a[k++] = L[i] <= R[j] ? L[i++] : R[j++]
      steps.push({ line: 7, arr: [...a], comparing: [], swapped: [k - 1], sorted: [...sortedSet] })
    }
    while (i < L.length) { a[k++] = L[i++]; steps.push({ line: 7, arr: [...a], comparing: [], swapped: [k - 1], sorted: [...sortedSet] }) }
    while (j < R.length) { a[k++] = R[j++]; steps.push({ line: 7, arr: [...a], comparing: [], swapped: [k - 1], sorted: [...sortedSet] }) }
    for (let x = l; x <= r; x++) sortedSet.add(x)
  }

  function ms(a, l, r) {
    steps.push({ line: 0, arr: [...a], comparing: [l, r], swapped: [], sorted: [...sortedSet] })
    if (l >= r) {
      steps.push({ line: 1, arr: [...a], comparing: [l], swapped: [], sorted: [...sortedSet] })
      if (l === r) sortedSet.add(l)
      return
    }
    const mid = Math.floor((l + r) / 2)
    steps.push({ line: 2, arr: [...a], comparing: [l, mid, r], swapped: [], sorted: [...sortedSet] })
    steps.push({ line: 3, arr: [...a], comparing: [], swapped: [], sorted: [...sortedSet] }); ms(a, l, mid)
    steps.push({ line: 4, arr: [...a], comparing: [], swapped: [], sorted: [...sortedSet] }); ms(a, mid + 1, r)
    merge(a, l, mid, r)
  }

  ms(arr, 0, arr.length - 1)
  steps.push({ line: -1, arr: [...arr], comparing: [], swapped: [], sorted: arr.map((_, i) => i) })
  return steps
}

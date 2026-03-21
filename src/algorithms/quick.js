export const quickCode = [
  { id: 0, text: 'quickSort(arr, low, high):',    indent: 0 },
  { id: 1, text: 'if low >= high: return',        indent: 1 },
  { id: 2, text: 'pivot = arr[high]',             indent: 1 },
  { id: 3, text: 'i = low - 1',                  indent: 1 },
  { id: 4, text: 'for j = low to high-1:',        indent: 1 },
  { id: 5, text: 'if arr[j] <= pivot:',           indent: 2 },
  { id: 6, text: 'i++; swap(arr[i], arr[j])',     indent: 3 },
  { id: 7, text: 'swap(arr[i+1], arr[high])',     indent: 1 },
  { id: 8, text: 'quickSort(arr, low, pi-1)',     indent: 1 },
  { id: 9, text: 'quickSort(arr, pi+1, high)',    indent: 1 },
]

export function generateQuickSteps(input) {
  const steps = []
  const arr = [...input]
  const sortedSet = new Set()

  function partition(a, low, high) {
    steps.push({ line: 2, arr: [...a], comparing: [high], swapped: [], sorted: [...sortedSet] })
    let i = low - 1
    steps.push({ line: 3, arr: [...a], comparing: [], swapped: [], sorted: [...sortedSet] })
    for (let j = low; j < high; j++) {
      steps.push({ line: 4, arr: [...a], comparing: [j], swapped: [], sorted: [...sortedSet] })
      steps.push({ line: 5, arr: [...a], comparing: [j, high], swapped: [], sorted: [...sortedSet] })
      if (a[j] <= a[high]) {
        i++
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
        steps.push({ line: 6, arr: [...a], comparing: [], swapped: [i, j], sorted: [...sortedSet] })
      }
    }
    const tmp = a[i + 1]; a[i + 1] = a[high]; a[high] = tmp
    sortedSet.add(i + 1)
    steps.push({ line: 7, arr: [...a], comparing: [], swapped: [i + 1, high], sorted: [...sortedSet] })
    return i + 1
  }

  function qs(a, low, high) {
    if (low > high) return
    steps.push({ line: 0, arr: [...a], comparing: [low, high], swapped: [], sorted: [...sortedSet] })
    if (low >= high) {
      steps.push({ line: 1, arr: [...a], comparing: [low], swapped: [], sorted: [...sortedSet] })
      if (low === high) sortedSet.add(low)
      return
    }
    const pi = partition(a, low, high)
    steps.push({ line: 8, arr: [...a], comparing: [], swapped: [], sorted: [...sortedSet] }); qs(a, low, pi - 1)
    steps.push({ line: 9, arr: [...a], comparing: [], swapped: [], sorted: [...sortedSet] }); qs(a, pi + 1, high)
  }

  qs(arr, 0, arr.length - 1)
  steps.push({ line: -1, arr: [...arr], comparing: [], swapped: [], sorted: arr.map((_, i) => i) })
  return steps
}

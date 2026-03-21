export const selectionCode = [
  { id: 0, text: 'for i = 0 to n-1:',           indent: 0 },
  { id: 1, text: 'minIdx = i',                   indent: 1 },
  { id: 2, text: 'for j = i+1 to n:',            indent: 1 },
  { id: 3, text: 'if arr[j] < arr[minIdx]:',     indent: 2 },
  { id: 4, text: 'minIdx = j',                   indent: 3 },
  { id: 5, text: 'swap(arr[i], arr[minIdx])',     indent: 1 },
  { id: 6, text: 'mark arr[i] as sorted',        indent: 1 },
]

export function generateSelectionSteps(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sorted = new Set()

  for (let i = 0; i < n - 1; i++) {
    steps.push({ line: 0, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
    let minIdx = i
    steps.push({ line: 1, arr: [...arr], comparing: [i], swapped: [], sorted: [...sorted] })
    for (let j = i + 1; j < n; j++) {
      steps.push({ line: 2, arr: [...arr], comparing: [j, minIdx], swapped: [], sorted: [...sorted] })
      steps.push({ line: 3, arr: [...arr], comparing: [j, minIdx], swapped: [], sorted: [...sorted] })
      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({ line: 4, arr: [...arr], comparing: [minIdx], swapped: [], sorted: [...sorted] })
      }
    }
    if (minIdx !== i) {
      const tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp
      steps.push({ line: 5, arr: [...arr], comparing: [], swapped: [i, minIdx], sorted: [...sorted] })
    }
    sorted.add(i)
    steps.push({ line: 6, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
  }
  sorted.add(n - 1)
  steps.push({ line: -1, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
  return steps
}

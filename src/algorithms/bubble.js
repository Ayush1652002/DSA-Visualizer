export const bubbleCode = [
  { id: 0, text: 'for i = 0 to n-1:',            indent: 0 },
  { id: 1, text: 'for j = 0 to n-i-2:',          indent: 1 },
  { id: 2, text: 'if arr[j] > arr[j+1]:',        indent: 2 },
  { id: 3, text: 'swap(arr[j], arr[j+1])',        indent: 3 },
  { id: 4, text: 'mark arr[n-1-i] as sorted',     indent: 1 },
]

export function generateBubbleSteps(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sorted = new Set()

  for (let i = 0; i < n - 1; i++) {
    steps.push({ line: 0, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ line: 1, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
      steps.push({ line: 2, arr: [...arr], comparing: [j, j + 1], swapped: [], sorted: [...sorted] })
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp
        steps.push({ line: 3, arr: [...arr], comparing: [], swapped: [j, j + 1], sorted: [...sorted] })
      }
    }
    sorted.add(n - 1 - i)
    steps.push({ line: 4, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
  }
  sorted.add(0)
  steps.push({ line: -1, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
  return steps
}

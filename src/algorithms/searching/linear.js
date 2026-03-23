export const linearCode = [
  { id: 0, text: 'for i = 0 to n-1:',         indent: 0 },
  { id: 1, text: 'if arr[i] == target:',       indent: 1 },
  { id: 2, text: 'return i  ✓ found',          indent: 2 },
  { id: 3, text: 'return -1  ✗ not found',     indent: 0 },
]

export function generateLinearSteps(arr, target) {
  const steps = []

  for (let i = 0; i < arr.length; i++) {
    steps.push({ line: 0, current: i, found: -1, done: false })
    steps.push({ line: 1, current: i, found: -1, done: false })

    if (arr[i] === target) {
      steps.push({ line: 2, current: i, found: i, done: true })
      return steps
    }
  }

  steps.push({ line: 3, current: -1, found: -1, done: true })
  return steps
}

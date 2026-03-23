export const binaryCode = [
  { id: 0, text: 'low = 0, high = n-1',        indent: 0 },
  { id: 1, text: 'while low <= high:',          indent: 0 },
  { id: 2, text: 'mid = (low + high) / 2',      indent: 1 },
  { id: 3, text: 'if arr[mid] == target:',      indent: 1 },
  { id: 4, text: 'return mid  ✓ found',         indent: 2 },
  { id: 5, text: 'if arr[mid] < target:',       indent: 1 },
  { id: 6, text: 'low = mid + 1',               indent: 2 },
  { id: 7, text: 'else: high = mid - 1',        indent: 1 },
  { id: 8, text: 'return -1  ✗ not found',      indent: 0 },
]

export function generateBinarySteps(arr, target) {
  // Binary search requires sorted array
  const sorted = [...arr].sort((a, b) => a - b)
  const steps  = []

  let low = 0, high = sorted.length - 1

  steps.push({ line: 0, low, high, mid: -1, found: -1, done: false, arr: sorted })

  while (low <= high) {
    steps.push({ line: 1, low, high, mid: -1, found: -1, done: false, arr: sorted })

    const mid = Math.floor((low + high) / 2)
    steps.push({ line: 2, low, high, mid, found: -1, done: false, arr: sorted })
    steps.push({ line: 3, low, high, mid, found: -1, done: false, arr: sorted })

    if (sorted[mid] === target) {
      steps.push({ line: 4, low, high, mid, found: mid, done: true, arr: sorted })
      return { steps, arr: sorted }
    }

    steps.push({ line: 5, low, high, mid, found: -1, done: false, arr: sorted })

    if (sorted[mid] < target) {
      steps.push({ line: 6, low, high, mid, found: -1, done: false, arr: sorted })
      low = mid + 1
    } else {
      steps.push({ line: 7, low, high, mid, found: -1, done: false, arr: sorted })
      high = mid - 1
    }
  }

  steps.push({ line: 8, low, high, mid: -1, found: -1, done: true, arr: sorted })
  return { steps, arr: sorted }
}

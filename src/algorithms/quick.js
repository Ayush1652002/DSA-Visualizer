export const quickCode = [
  { id: 0, text: 'quickSort(arr, low, high):',    indent: 0 },
  { id: 1, text: 'if low >= high: return',        indent: 1 },
  { id: 2, text: 'pivot = arr[high]',             indent: 1 },
  { id: 3, text: 'i = low - 1  (boundary)',       indent: 1 },
  { id: 4, text: 'for j = low to high-1:',        indent: 1 },
  { id: 5, text: 'if arr[j] <= pivot:',           indent: 2 },
  { id: 6, text: 'i++; swap(arr[i], arr[j])',     indent: 3 },
  { id: 7, text: 'place pivot: swap(arr[i+1], pivot)', indent: 1 },
  { id: 8, text: 'quickSort(arr, low, pi-1)',     indent: 1 },
  { id: 9, text: 'quickSort(arr, pi+1, high)',    indent: 1 },
]

export function generateQuickSteps(input) {
  const steps = []
  const arr = [...input]
  const sortedSet = new Set()

  /*
    Each step carries:
      comparing : [j]         — current j scanner bar (cyan)
      swapped   : [i, j]      — bars being swapped (purple)
      sorted    : [...]        — finalized pivot positions (green)
      pivot     : [high]       — the pivot bar — stays YELLOW the whole partition
      boundary  : [i]          — i pointer — the "wall" between smaller/larger (orange)
      range     : [low, high]  — active subarray
  */
  function push(line, a, comparing, swapped, pivot = [], boundary = [], range = []) {
    steps.push({
      line,
      arr:      [...a],
      comparing,
      swapped,
      sorted:   [...sortedSet],
      pivot,
      boundary,
      range,
    })
  }

  function partition(a, low, high) {
    push(2, a, [], [], [high], [], [low, high])

    let i = low - 1
    push(3, a, [], [], [high], i >= low ? [i] : [], [low, high])

    for (let j = low; j < high; j++) {
      push(4, a, [j], [], [high], i >= low ? [i] : [], [low, high])
      push(5, a, [j], [], [high], i >= low ? [i] : [], [low, high])

      if (a[j] <= a[high]) {
        i++
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
        push(6, a, [], [i, j], [high], [i], [low, high])
      }
    }

    // Place pivot in final position
    const tmp = a[i + 1]; a[i + 1] = a[high]; a[high] = tmp
    sortedSet.add(i + 1)
    push(7, a, [], [i + 1, high], [], [], [low, high])
    return i + 1
  }

  function qs(a, low, high) {
    if (low > high) return
    push(0, a, [], [], [], [], [low, high])
    if (low >= high) {
      if (low === high) sortedSet.add(low)
      push(1, a, [], [], [], [], [low, high])
      return
    }
    const pi = partition(a, low, high)
    push(8, a, [], [], [], [], [low, pi - 1]); qs(a, low, pi - 1)
    push(9, a, [], [], [], [], [pi + 1, high]); qs(a, pi + 1, high)
  }

  qs(arr, 0, arr.length - 1)
  steps.push({
    line: -1, arr: [...arr], comparing: [], swapped: [],
    sorted: arr.map((_, i) => i), pivot: [], boundary: [], range: [],
  })
  return steps
}

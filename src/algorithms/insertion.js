export const insertionCode = [
  { id: 0, text: 'for i = 1 to n-1:',              indent: 0 },
  { id: 1, text: 'key = arr[i]',                   indent: 1 },
  { id: 2, text: 'j = i - 1',                      indent: 1 },
  { id: 3, text: 'while j >= 0 and arr[j] > key:', indent: 1 },
  { id: 4, text: 'swap arr[j] and arr[j+1]',       indent: 2 },
  { id: 5, text: 'j = j - 1',                      indent: 2 },
  { id: 6, text: 'key placed at arr[j+1]',         indent: 1 },
  { id: 7, text: 'mark i as sorted',               indent: 1 },
]

export function generateInsertionSteps(input) {
  const steps = []
  const arr   = [...input]
  const n     = arr.length
  const sortedSet = new Set([0])

  function push(line, comparing = [], swapped = []) {
    steps.push({
      line, arr: [...arr], comparing, swapped,
      sorted: [...sortedSet],
      pivot: [], boundary: [], mid: [], range: [],
    })
  }

  for (let i = 1; i < n; i++) {
    push(0)
    push(1, [i])

    let j = i - 1
    push(2, [j])

    // Instead of shifting, do actual adjacent swaps — same as bubble sort
    // This means the key "bubbles" left to its correct position
    // No duplicates because each step is a real full swap
    while (j >= 0 && arr[j] > arr[j + 1]) {
      push(3, [j, j + 1])

      // Real swap
      const tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp
      push(4, [], [j, j + 1])

      j--
      push(5, j >= 0 ? [j] : [])
    }

    push(3)   // while condition false — exit

    sortedSet.add(i)
    push(6, [], [j + 1])
    push(7)
  }

  steps.push({
    line: -1, arr: [...arr], comparing: [], swapped: [],
    sorted: arr.map((_, i) => i),
    pivot: [], boundary: [], mid: [], range: [],
  })
  return steps
}
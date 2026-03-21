export const insertionCode = [
  { id: 0, text: 'for i = 1 to n-1:',             indent: 0 },
  { id: 1, text: 'key = arr[i]',                  indent: 1 },
  { id: 2, text: 'j = i - 1',                     indent: 1 },
  { id: 3, text: 'while j >= 0 and arr[j] > key:', indent: 1 },
  { id: 4, text: 'arr[j+1] = arr[j]',             indent: 2 },
  { id: 5, text: 'j = j - 1',                     indent: 2 },
  { id: 6, text: 'arr[j+1] = key',                indent: 1 },
  { id: 7, text: 'mark i as sorted',              indent: 1 },
]

export function generateInsertionSteps(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sorted = new Set([0])

  for (let i = 1; i < n; i++) {
    steps.push({ line: 0, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
    const key = arr[i]
    steps.push({ line: 1, arr: [...arr], comparing: [i], swapped: [], sorted: [...sorted] })
    let j = i - 1
    steps.push({ line: 2, arr: [...arr], comparing: [j], swapped: [], sorted: [...sorted] })
    while (j >= 0 && arr[j] > key) {
      steps.push({ line: 3, arr: [...arr], comparing: [j, j + 1], swapped: [], sorted: [...sorted] })
      arr[j + 1] = arr[j]
      steps.push({ line: 4, arr: [...arr], comparing: [], swapped: [j, j + 1], sorted: [...sorted] })
      j--
      steps.push({ line: 5, arr: [...arr], comparing: j >= 0 ? [j] : [], swapped: [], sorted: [...sorted] })
    }
    steps.push({ line: 3, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
    arr[j + 1] = key
    sorted.add(i)
    steps.push({ line: 6, arr: [...arr], comparing: [], swapped: [j + 1], sorted: [...sorted] })
    steps.push({ line: 7, arr: [...arr], comparing: [], swapped: [], sorted: [...sorted] })
  }
  steps.push({ line: -1, arr: [...arr], comparing: [], swapped: [], sorted: arr.map((_, i) => i) })
  return steps
}

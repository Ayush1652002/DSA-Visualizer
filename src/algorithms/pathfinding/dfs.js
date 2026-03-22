// DFS — explores deeply, does not guarantee shortest path

export const dfsCode = [
  { id: 0, text: 'stack = [start]',             indent: 0 },
  { id: 1, text: 'visited = {}',                indent: 0 },
  { id: 2, text: 'while stack not empty:',      indent: 0 },
  { id: 3, text: 'cell = stack.pop()',           indent: 1 },
  { id: 4, text: 'if cell == end: return path', indent: 1 },
  { id: 5, text: 'if cell visited: skip',       indent: 1 },
  { id: 6, text: 'mark visited',                indent: 1 },
  { id: 7, text: 'for each neighbor:',          indent: 1 },
  { id: 8, text: 'if not wall: push to stack',  indent: 2 },
  { id: 9, text: 'return no path found',        indent: 0 },
]

export function runDFS(grid, start, end) {
  const rows = grid.length
  const cols = grid[0].length
  const steps = []
  const prev  = {}
  const seen  = new Set()
  const key   = (r, c) => `${r},${c}`
  const dirs  = [[-1,0],[1,0],[0,-1],[0,1]]

  const stack = [[start.row, start.col]]
  steps.push({ line: 0, row: start.row, col: start.col, stackDepth: 1, type: 'init', hint: `Initialize stack with start cell (${start.row}, ${start.col})` })
  steps.push({ line: 1, row: start.row, col: start.col, stackDepth: 1, type: 'init', hint: 'Initialize visited set' })

  let found = false

  while (stack.length > 0) {
    steps.push({ line: 2, row: -1, col: -1, stackDepth: stack.length, type: 'check', hint: `Stack has ${stack.length} cell(s) — continuing DFS` })

    const [r, c] = stack.pop()
    steps.push({ line: 3, row: r, col: c, stackDepth: stack.length, type: 'pop', hint: `Popped (${r}, ${c}) from top of stack` })

    if (r === end.row && c === end.col) {
      steps.push({ line: 4, row: r, col: c, stackDepth: stack.length, type: 'found', hint: 'Reached end cell! Tracing path back to start' })
      found = true; break
    }

    if (seen.has(key(r, c))) {
      steps.push({ line: 5, row: r, col: c, stackDepth: stack.length, type: 'skip', hint: `(${r}, ${c}) already visited — skipping` })
      continue
    }

    seen.add(key(r, c))
    steps.push({ line: 6, row: r, col: c, stackDepth: stack.length, type: 'visit', hint: `Marking (${r}, ${c}) as visited` })
    steps.push({ line: 7, row: r, col: c, stackDepth: stack.length, type: 'neighbors', hint: `Checking neighbors of (${r}, ${c})` })

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (seen.has(key(nr, nc)) || grid[nr][nc] === 'wall') continue
      if (!prev[key(nr, nc)]) prev[key(nr, nc)] = key(r, c)
      stack.push([nr, nc])
      steps.push({ line: 8, row: nr, col: nc, stackDepth: stack.length, type: 'push', hint: `Pushed (${nr}, ${nc}) onto stack — depth now ${stack.length}` })
    }
  }

  if (!found) {
    steps.push({ line: 9, row: -1, col: -1, stackDepth: 0, type: 'no_path', hint: 'Stack empty — no path exists' })
    return { steps, path: [] }
  }

  const path = []
  let cur = key(end.row, end.col)
  while (cur && cur !== key(start.row, start.col)) {
    const [r, c] = cur.split(',').map(Number)
    path.unshift({ row: r, col: c })
    cur = prev[cur]
  }

  return { steps, path }
}

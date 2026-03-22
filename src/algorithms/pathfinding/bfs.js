// BFS — guarantees shortest path
// Each step includes: line (pseudocode), current cell, queue size, distance map

export const bfsCode = [
  { id: 0, text: 'queue = [start]',              indent: 0 },
  { id: 1, text: 'visited = {start}',            indent: 0 },
  { id: 2, text: 'while queue not empty:',       indent: 0 },
  { id: 3, text: 'cell = queue.dequeue()',        indent: 1 },
  { id: 4, text: 'if cell == end: return path',  indent: 1 },
  { id: 5, text: 'for each neighbor of cell:',   indent: 1 },
  { id: 6, text: 'if not visited and not wall:', indent: 2 },
  { id: 7, text: 'mark visited',                 indent: 3 },
  { id: 8, text: 'queue.enqueue(neighbor)',       indent: 3 },
  { id: 9, text: 'return no path found',         indent: 0 },
]

export function runBFS(grid, start, end) {
  const rows = grid.length
  const cols = grid[0].length
  const steps = []
  const prev  = {}
  const dist  = {}
  const seen  = new Set()
  const key   = (r, c) => `${r},${c}`
  const dirs  = [[-1,0],[1,0],[0,-1],[0,1]]

  const queue = [[start.row, start.col]]
  seen.add(key(start.row, start.col))
  dist[key(start.row, start.col)] = 0

  steps.push({ line: 0, row: start.row, col: start.col, queueSize: 1,  type: 'init', hint: `Initialize queue with start cell (${start.row}, ${start.col})` })
  steps.push({ line: 1, row: start.row, col: start.col, queueSize: 1,  type: 'init', hint: 'Mark start as visited' })

  let found = false

  while (queue.length > 0) {
    steps.push({ line: 2, row: -1, col: -1, queueSize: queue.length, type: 'check', hint: `Queue has ${queue.length} cell(s) to explore` })

    const [r, c] = queue.shift()
    const d = dist[key(r, c)]
    steps.push({ line: 3, row: r, col: c, queueSize: queue.length, type: 'dequeue', hint: `Dequeued (${r}, ${c}) — distance from start: ${d}` })

    if (r === end.row && c === end.col) {
      steps.push({ line: 4, row: r, col: c, queueSize: queue.length, type: 'found', hint: `Reached end! Path found at distance ${d}` })
      found = true; break
    }

    steps.push({ line: 5, row: r, col: c, queueSize: queue.length, type: 'visit', hint: `Exploring neighbors of (${r}, ${c})` })

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      steps.push({ line: 6, row: nr, col: nc, queueSize: queue.length, type: 'check_neighbor', hint: `Checking neighbor (${nr}, ${nc})` })
      if (seen.has(key(nr, nc)) || grid[nr][nc] === 'wall') continue
      seen.add(key(nr, nc))
      prev[key(nr, nc)] = key(r, c)
      dist[key(nr, nc)] = d + 1
      steps.push({ line: 7, row: nr, col: nc, queueSize: queue.length + 1, type: 'mark', hint: `Marked (${nr}, ${nc}) as visited — distance ${d + 1}` })
      steps.push({ line: 8, row: nr, col: nc, queueSize: queue.length + 1, type: 'enqueue', hint: `Added (${nr}, ${nc}) to queue` })
      queue.push([nr, nc])
    }
  }

  if (!found) {
    steps.push({ line: 9, row: -1, col: -1, queueSize: 0, type: 'no_path', hint: 'Queue empty — no path exists to end cell' })
    return { steps, path: [] }
  }

  // Reconstruct path
  const path = []
  let cur = key(end.row, end.col)
  while (cur && cur !== key(start.row, start.col)) {
    const [r, c] = cur.split(',').map(Number)
    path.unshift({ row: r, col: c })
    cur = prev[cur]
  }

  return { steps, path }
}

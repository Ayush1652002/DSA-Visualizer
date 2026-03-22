// Recursive backtracker maze generator
// Returns a grid with walls carved out — guaranteed solvable

export function generateMaze(rows, cols) {
  // Start with all walls
  const grid = Array.from({ length: rows }, () => Array(cols).fill('wall'))

  // Work on odd cells only so walls are between cells
  const visited = new Set()
  const key = (r, c) => `${r},${c}`

  function carve(r, c) {
    visited.add(key(r, c))
    grid[r][c] = 'empty'

    // Shuffle directions
    const dirs = [[-2,0],[2,0],[0,-2],[0,2]].sort(() => Math.random() - 0.5)

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (visited.has(key(nr, nc))) continue
      // Carve wall between
      grid[r + dr/2][c + dc/2] = 'empty'
      carve(nr, nc)
    }
  }

  // Start from (1,1) — must be odd
  carve(1, 1)

  // Make sure borders are walls
  for (let r = 0; r < rows; r++) {
    grid[r][0] = 'wall'; grid[r][cols-1] = 'wall'
  }
  for (let c = 0; c < cols; c++) {
    grid[0][c] = 'wall'; grid[rows-1][c] = 'wall'
  }

  return grid
}

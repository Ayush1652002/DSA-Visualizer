// Grid.jsx — renders the 2D grid
// Passes distRatio and direction to each cell for enhanced visualization

import Cell from './Cell.jsx'

export default function Grid({ grid, cellSize, onMouseDown, onMouseEnter, tooltips, distRatios, directions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, userSelect: 'none' }}>
      {grid.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: 2 }}>
          {row.map((type, c) => (
            <Cell
              key={c}
              type={type}
              size={cellSize}
              onMouseDown={() => onMouseDown(r, c)}
              onMouseEnter={() => onMouseEnter(r, c)}
              tooltip={tooltips?.[`${r},${c}`]}
              distRatio={distRatios?.[`${r},${c}`]}
              direction={directions?.[`${r},${c}`]}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

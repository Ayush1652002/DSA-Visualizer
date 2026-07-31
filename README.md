# DSA Lab — Algorithm Visualizer

An interactive visualizer for core Data Structures and Algorithms, built with React 19 and Vite.

## Live Demo
[https://dsa-visualizer-peach.vercel.app/]

## Features

| Module | Algorithms |
|--------|-----------|
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick Sort |
| **Searching** | Linear Search, Binary Search |
| **Pathfinding** | BFS (shortest path), DFS |
| **Graph Traversal** | BFS, DFS with interactive node/edge builder |
| **Data Structures** | Stack (LIFO), Queue (FIFO) |

### Key interactions
- Step-by-step playback with Prev / Next controls
- Adjustable speed (Slow / Medium / Fast)
- Live pseudocode highlighting synchronized to each step
- Plain-English hint bar explaining what is happening at every step
- Custom array input for all visualizers
- Interactive graph builder — add nodes, connect edges, drag to reposition
- Pathfinding grid editor — draw walls, set start/end, run maze presets
- Touch and pinch-to-zoom support on mobile

## Tech Stack

- **React 19** with hooks (no Redux, no class components)
- **Vite 8** for bundling
- **Tailwind CSS v3** for utility styling
- **React Router v7** for client-side routing
- Animations via CSS transitions + `requestAnimationFrame`
- Responsive layout using `ResizeObserver` and `window.matchMedia`

## Architecture
src/
├── algorithms/ # Pure step-generator functions (zero React)
│ ├── bubble.js
│ ├── merge.js
│ ├── quick.js
│ ├── searching/
│ │ ├── linear.js
│ │ └── binary.js
│ ├── pathfinding/
│ │ ├── bfs.js
│ │ └── dfs.js
│ └── graph/
│ ├── bfs.js
│ └── dfs.js
├── components/ # Shared presentational components
│ ├── Bars.jsx # Sorting bar renderer with swap animation
│ ├── CodeViewer.jsx # Pseudocode panel with line highlighting
│ ├── AlgoHint.jsx # Plain-English step descriptions
│ ├── GraphCanvas.jsx # SVG graph renderer with touch support
│ ├── Cell.jsx # Pathfinding grid cell
│ ├── Node.jsx # Graph node (SVG)
│ ├── Edge.jsx # Graph edge (SVG)
│ ├── Stack.jsx # Stack visualizer
│ ├── Queue.jsx # Queue visualizer
│ ├── Controls.jsx # Shared playback controls
│ └── Navbar.jsx # Top navigation
├── hooks/ # Reusable custom hooks
│ ├── useIsDesktop.js # Responsive breakpoint hook
│ └── useSortingVisualizer.js # All sorting playback logic
├── layouts/
│ └── AppLayout.jsx # Shared page shell (Navbar + Outlet)
└── pages/ # Route-level components (UI only)
├── Sorting.jsx
├── Searching.jsx
├── Pathfinding.jsx
├── StackQueue.jsx
└── Graph.jsx

## Key Design Decisions

**Step generation vs live animation**
All algorithm steps are pre-computed into an array before playback begins. This enables O(1) seek to any step, true undo via Prev, and speed changes without restarting the algorithm. The UI is a pure function of `steps[stepIdx]`.

**ResizeObserver for bar sizing**
Bar widths are computed from the actual container size via `ResizeObserver`, not hardcoded pixel values. The visualization fills available space on any screen size automatically.

**Swap animation using the FLIP technique**
The bar swap animation in `Bars.jsx` captures the old pixel position, applies a CSS offset to freeze bars in place, then releases the offset one frame later so the browser plays the transition forward. This is the same principle used internally by animation libraries like Framer Motion.

**Custom hooks for logic separation**
All playback state and timer logic lives in `useSortingVisualizer`. Pages are pure UI composition — they call the hook and render. This makes the logic independently testable and the UI independently readable.

## Running Locally

```bash
npm install
npm run dev
```

## Deployment

Deployed on Vercel. Any push to `main` triggers a new deployment automatically.
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sorting     from './pages/Sorting.jsx'
import Searching   from './pages/Searching.jsx'
import Pathfinding from './pages/Pathfinding.jsx'
import StackQueue  from './pages/StackQueue.jsx'
import Graph       from './pages/Graph.jsx'
import Navbar      from './components/Navbar.jsx'

// Small floating nav pill shown on top of Sorting's fixed layout
function SortingNav() {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'fixed', top: 48, right: 12, zIndex: 200, display: 'flex', gap: 6 }}>
      {[
        ['Search',  '/searching'  ],
        ['Path',    '/pathfinding'],
        ['Stack/Q', '/stack-queue'],
        ['Graph',   '/graph'      ],
      ].map(([label, path]) => (
        <button key={path} onClick={() => navigate(path)}
          className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-white/10 text-slate-400 bg-[#060d1b]/90"
          style={{ cursor: 'pointer' }}>
          {label} →
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={
          <>
            <Sorting />
            <SortingNav />
          </>
        } />

        <Route path="/searching" element={
          <div
            className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
          >
            <Navbar />
            <Searching />
          </div>
        } />

        <Route path="/pathfinding" element={
          <div
            className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
          >
            <Navbar />
            <Pathfinding />
          </div>
        } />

        <Route path="/stack-queue" element={
          <div className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
            <Navbar />
            <StackQueue />
          </div>
        } />

        <Route path="/graph" element={
          <div className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
            <Navbar />
            <Graph />
          </div>
        } />

      </Routes>
    </BrowserRouter>
  )
}
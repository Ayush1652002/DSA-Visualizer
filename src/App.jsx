import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sorting     from './pages/Sorting.jsx'
import Searching   from './pages/Searching.jsx'
import Pathfinding from './pages/Pathfinding.jsx'
import StackQueue  from './pages/StackQueue.jsx'
import Navbar      from './components/Navbar.jsx'

// Small floating nav pill shown on top of Sorting's fixed layout
function SortingNav() {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'fixed', top: 10, right: 16, zIndex: 200, display: 'flex', gap: 8 }}>
      <button onClick={() => navigate('/searching')}
        className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 bg-[#060d1b]/90"
        style={{ cursor: 'pointer' }}>
        Searching →
      </button>
      <button onClick={() => navigate('/pathfinding')}
        className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 bg-[#060d1b]/90"
        style={{ cursor: 'pointer' }}>
        Pathfinding →
      </button>
      <button onClick={() => navigate('/stack-queue')}
        className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 bg-[#060d1b]/90"
        style={{ cursor: 'pointer' }}>
        Stack/Queue →
      </button>
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
          <div
            className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
          >
            <Navbar />
            <StackQueue />
          </div>
        } />

      </Routes>
    </BrowserRouter>
  )
}
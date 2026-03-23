import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sorting     from './pages/Sorting.jsx'
import Searching   from './pages/Searching.jsx'
import Pathfinding from './pages/Pathfinding.jsx'
import StackQueue  from './pages/StackQueue.jsx'
import Graph       from './pages/Graph.jsx'
import Navbar      from './components/Navbar.jsx'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Sorting />} />

        <Route path="/searching" element={
          <div className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
            <Navbar />
            <Searching />
          </div>
        } />

        <Route path="/pathfinding" element={
          <div className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
            style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
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
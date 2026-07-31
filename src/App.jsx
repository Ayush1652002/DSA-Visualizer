import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout    from './layouts/AppLayout.jsx'
import Sorting      from './pages/Sorting.jsx'
import Searching    from './pages/Searching.jsx'
import Pathfinding  from './pages/Pathfinding.jsx'
import StackQueue   from './pages/StackQueue.jsx'
import Graph        from './pages/Graph.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"            element={<Sorting />}     />
          <Route path="/searching"   element={<Searching />}   />
          <Route path="/pathfinding" element={<Pathfinding />} />
          <Route path="/stack-queue" element={<StackQueue />}  />
          <Route path="/graph"       element={<Graph />}       />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
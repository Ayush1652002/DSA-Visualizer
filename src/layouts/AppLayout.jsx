import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

export default function AppLayout() {
  return (
    <div
      className="flex flex-col bg-[#060d1b] text-slate-200 font-sans"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
    >
      <Navbar />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  )
}
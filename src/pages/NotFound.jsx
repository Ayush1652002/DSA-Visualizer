import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
      <div className="text-6xl font-mono font-black text-slate-800">404</div>
      <div className="text-slate-500 font-mono text-sm">Page not found.</div>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 rounded-lg text-xs font-bold font-mono"
        style={{ background: '#22d3ee', color: '#000' }}
      >
        ← Back to Sorting
      </button>
    </div>
  )
}
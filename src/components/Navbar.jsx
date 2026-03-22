import { useNavigate, useLocation } from 'react-router-dom'

const ACCENT = '#22d3ee'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Sorting',     path: '/'             },
    { label: 'Searching',   path: '/searching'    },
    { label: 'Pathfinding', path: '/pathfinding'  },
    { label: 'Stack/Queue', path: '/stack-queue'  },
    { label: 'Graph',       path: '/graph'        },
  ]

  return (
    <nav
      className="flex items-center shrink-0 border-b border-white/10"
      style={{ background: 'rgba(4,9,18,0.95)', height: 40 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full shrink-0">
        <div className="w-2 h-2 rounded-full"
          style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <span className="text-xs font-bold tracking-widest uppercase text-slate-200">
          DSA<span style={{ color: ACCENT }}>Lab</span>
        </span>
      </div>

      {/* Tabs */}
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="px-5 h-full text-xs font-semibold tracking-wide transition-all duration-200"
            style={{
              border:       'none',
              borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
              background:   active ? `${ACCENT}12` : 'transparent',
              color:        active ? ACCENT : '#4b5563',
              cursor:       'pointer',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

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
    <nav style={{
      display: 'flex', alignItems: 'center', flexShrink: 0,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(4,9,18,0.95)', height: 40,
      overflow: 'hidden',
    }}>
      {/* Brand — pinned left */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 14px',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        height: '100%', flexShrink: 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e2e8f0' }}>
          DSA<span style={{ color: ACCENT }}>Lab</span>
        </span>
      </div>

      {/* Scrollable tabs */}
      <div style={{
        display: 'flex', alignItems: 'center',
        overflowX: 'auto', overflowY: 'hidden',
        flex: 1, height: '100%',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{
                padding: '0 14px', height: '100%',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                border: 'none', flexShrink: 0,
                borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
                background: active ? `${ACCENT}12` : 'transparent',
                color: active ? ACCENT : '#4b5563',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
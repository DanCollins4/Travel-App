import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signOutUser } from '../firebase'

const TABS = [
  { to: '/', label: 'Itinerary', icon: '🗓️', end: true },
  { to: '/ideas', label: 'Ideas', icon: '💡' },
  { to: '/booked', label: 'Booked', icon: '🎫' },
  { to: '/map', label: 'Map', icon: '🗺️' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/packing', label: 'Packing', icon: '🎒' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/recommendations', label: 'Recommendations', icon: '🌏' },
]

export default function Nav() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <span className="font-semibold text-slate-100">Gap Year Planner</span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {user.displayName?.[0] ?? '?'}
              </div>
            )}
            <button
              onClick={() => signOutUser()}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <nav className="max-w-6xl mx-auto px-2 overflow-x-auto no-scrollbar">
        <ul className="flex gap-1 px-2 pb-2 min-w-max">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <span>{tab.icon}</span>
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

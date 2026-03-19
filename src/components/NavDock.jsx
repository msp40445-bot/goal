import { LayoutDashboard, Target, ListTodo, Bot, BarChart3, Link2 } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'ai', label: 'AI Coach', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
]

export default function NavDock({ activePage, onNavigate }) {
  return (
    <nav className="nav-dock">
      <div className="nav-dock-inner">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-dock-item ${isActive ? 'nav-dock-item-active' : ''}`}
              title={item.label}
            >
              <div className={`nav-dock-icon ${isActive ? 'nav-dock-icon-active' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`nav-dock-label ${isActive ? 'nav-dock-label-active' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

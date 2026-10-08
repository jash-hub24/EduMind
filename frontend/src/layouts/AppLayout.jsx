import { Bell, BookOpenText, ChevronRight, LogOut, Menu, Moon, Search, Settings, Sun, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BookOpenText },
  { to: '/materials', label: 'Study Materials', icon: BookOpenText },
  { to: '/question-bank', label: 'Question Bank', icon: BookOpenText },
  { to: '/pyq', label: 'Previous Papers', icon: BookOpenText },
  { to: '/quizzes', label: 'Quizzes', icon: BookOpenText },
  { to: '/ai-chat', label: 'AI Study Copilot', icon: BookOpenText },
  { to: '/scan-solve', label: 'Scan & Solve', icon: BookOpenText },
  { to: '/flashcards', label: 'Flashcards', icon: BookOpenText },
  { to: '/bookmarks', label: 'Bookmarks', icon: BookOpenText },
  { to: '/planner', label: 'Study Planner', icon: BookOpenText },
  { to: '/revision', label: 'Smart Revision', icon: BookOpenText },
  { to: '/progress', label: 'Progress Analytics', icon: BookOpenText },
]

const bottomItems = [
  { to: '/profile', label: 'Profile', icon: BookOpenText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout({ children, title = 'Dashboard' }) {
  const { authUser, logout, theme, toggleTheme, notifications, materials, quizzes, flashcards, apiError, isLoading, clearApiError, refreshData } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return [
      ...materials.filter((item) => `${item.title} ${item.subject} ${item.topic}`.toLowerCase().includes(q)).slice(0, 4),
      ...quizzes.filter((quiz) => quiz.title.toLowerCase().includes(q)).slice(0, 3),
      ...flashcards.filter((card) => `${card.subject} ${card.topic} ${card.question}`.toLowerCase().includes(q)).slice(0, 3),
    ]
  }, [query, materials, quizzes, flashcards])

  const userName = authUser?.name || 'Student'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">E</div>
          <div>
            <h2>EduMind</h2>
            <small>Learning OS</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {bottomItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button type="button" className="nav-item nav-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button type="button" className="nav-item nav-toggle danger" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button mobile-menu" onClick={() => setSidebarOpen((prev) => !prev)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="eyebrow">EduMind</p>
              <h1>{title}</h1>
            </div>
          </div>

          <div className="topbar-center">
            <div className="global-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search materials, topics, quizzes..." />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item, idx) => (
                    <Link key={`${item.id || item.title}-${idx}`} to={item.resourceType ? `/materials/${item.id}` : item.questions ? `/quizzes` : `/flashcards`} onClick={() => setQuery('')}>
                      <span>{item.title || item.subject}</span>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <div className="notification-wrap">
              <button type="button" className="icon-button" aria-label="Notifications">
                <Bell size={18} />
                {notifications.length > 0 && <span className="notif-dot" />}
              </button>
              <div className="notification-panel">
                {notifications.map((note) => (
                  <div key={note} className="notification-item">{note}</div>
                ))}
              </div>
            </div>
            <div className="user-badge">
              <div className="avatar">{userName.slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{userName}</strong>
                <small>{authUser?.role === 'admin' ? 'Admin' : 'Student'}</small>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          {(apiError || isLoading) && (
            <div className={`api-status ${apiError ? 'has-error' : ''}`} role={apiError ? 'alert' : 'status'}>
              <span>{apiError || 'Syncing EduMind data…'}</span>
              {apiError && <button type="button" className="table-button" onClick={clearApiError}>Dismiss</button>}
              {apiError && <button type="button" className="table-button" onClick={refreshData}>Retry</button>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

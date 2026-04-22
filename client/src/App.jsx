import { useState, useEffect } from 'react';
import Login from './components/Login';
import TaskBoard from './components/TaskBoard';
import ProfilePage from './components/ProfilePage';
import { getMe, logout } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('tasks'); // 'tasks' | 'profile'

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.username))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function handleLogin(username) {
    setUser(username);
    setView('tasks');
  }

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.removeItem('auth_token');
    setUser(null);
    setView('tasks');
  }

  if (loading) {
    return (
      <div className="app-loading" data-testid="app-loading">
        Loading…
      </div>
    );
  }

  return (
    <div className="app" data-testid="app">
      <header className="app-header" data-testid="app-header">
        <div className="app-header__brand">
          <button
            className="app-header__brand-btn"
            onClick={() => user && setView('tasks')}
            aria-label="Go to task board"
            data-testid="nav-brand"
          >
            <span className="app-header__logo">✓</span>
            <span className="app-header__title">TaskFlow</span>
          </button>
        </div>

        {user && (
          <nav className="app-header__nav" data-testid="app-nav">
            <button
              className={`nav-link ${view === 'tasks' ? 'nav-link--active' : ''}`}
              onClick={() => setView('tasks')}
              data-testid="nav-tasks"
              aria-current={view === 'tasks' ? 'page' : undefined}
            >
              Tasks
            </button>
            <button
              className={`nav-link ${view === 'profile' ? 'nav-link--active' : ''}`}
              onClick={() => setView('profile')}
              data-testid="nav-profile"
              aria-current={view === 'profile' ? 'page' : undefined}
            >
              Profile
            </button>

            <div className="app-header__divider" />

            <span className="app-header__username" data-testid="header-username">
              👤 {user}
            </span>
            <button
              className="btn btn--ghost"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              Log out
            </button>
          </nav>
        )}
      </header>

      <main className="app-main">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : view === 'profile' ? (
          <ProfilePage onBack={() => setView('tasks')} />
        ) : (
          <TaskBoard username={user} />
        )}
      </main>
    </div>
  );
}

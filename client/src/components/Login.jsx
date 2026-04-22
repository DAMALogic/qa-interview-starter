import { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem('auth_token', data.token);
      onLogin(data.username);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper" data-testid="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Welcome to TaskFlow</h1>
        <p className="login-card__subtitle">Sign in to manage your tasks</p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          data-testid="login-form"
          noValidate
        >
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              data-testid="username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              data-testid="password-input"
            />
          </div>

          {error && (
            <div className="alert alert--error" data-testid="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-card__hint" data-testid="login-hint">
          <strong>Demo credentials:</strong>
          <br />
          admin / password123 &nbsp;|&nbsp; tester / tester123
        </div>
      </div>
    </div>
  );
}

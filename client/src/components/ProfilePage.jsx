import { useState, useEffect } from 'react';
import { getProfile, updateProfile, updatePassword } from '../api';

/**
 * ProfilePage
 *
 * Two independent sections:
 *   1. Personal Info  — update display name (username is read-only)
 *   2. Change Password — requires current password + new + confirm
 *
 * Every interactive element carries a data-testid attribute so Playwright
 * selectors work without coupling to CSS class names or DOM structure.
 *
 * Testability highlights for candidates:
 *   - Two independent forms with their own submit / error / success states
 *   - Field-level validation messages (not just form-level)
 *   - Display name length limit (50 chars) — visible counter
 *   - Password rules: min 8 chars, must differ from current, must match confirm
 *   - Success banners auto-dismiss after 3 s
 *   - Loading skeleton while profile fetches
 *   - Username field is truly read-only (cannot be typed into)
 */
export default function ProfilePage({ onBack }) {
  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // ── Info form state ───────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('');
  const [infoSubmitting, setInfoSubmitting] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');

  // ── Password form state ───────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // ── Load profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setDisplayName(data.displayName || '');
      })
      .catch((err) => setProfileError(err.message || 'Failed to load profile'))
      .finally(() => setProfileLoading(false));
  }, []);

  // Auto-dismiss success banners
  function flashSuccess(setter, message) {
    setter(message);
    setTimeout(() => setter(''), 3000);
  }

  // ── Info form handler ─────────────────────────────────────────────────────
  async function handleInfoSubmit(e) {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!displayName.trim()) {
      setInfoError('Display name cannot be blank');
      return;
    }
    if (displayName.trim().length > 50) {
      setInfoError('Display name must be 50 characters or fewer');
      return;
    }

    setInfoSubmitting(true);
    try {
      const updated = await updateProfile({ displayName: displayName.trim() });
      setProfile(updated);
      flashSuccess(setInfoSuccess, 'Profile updated successfully');
    } catch (err) {
      setInfoError(err.message || 'Failed to update profile');
    } finally {
      setInfoSubmitting(false);
    }
  }

  // ── Password form handler ─────────────────────────────────────────────────
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    // Client-side checks (mirrors server validation)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match');
      return;
    }
    if (newPassword === currentPassword) {
      setPwError('New password must differ from the current password');
      return;
    }

    setPwSubmitting(true);
    try {
      await updatePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      flashSuccess(setPwSuccess, 'Password changed successfully');
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="profile-page" data-testid="profile-page">

      {/* Page header */}
      <div className="profile-page__header">
        <button
          className="btn btn--ghost btn--back"
          onClick={onBack}
          data-testid="profile-back-btn"
          aria-label="Back to task board"
        >
          ← Back to Tasks
        </button>
        <h2 className="profile-page__title">My Profile</h2>
      </div>

      {/* Loading skeleton */}
      {profileLoading && (
        <div className="profile-skeleton" data-testid="profile-loading" aria-busy="true">
          <div className="skeleton-line skeleton-line--wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      )}

      {/* Top-level fetch error */}
      {profileError && !profileLoading && (
        <div className="alert alert--error" data-testid="profile-fetch-error" role="alert">
          {profileError}
        </div>
      )}

      {/* Content — only rendered once profile is loaded */}
      {!profileLoading && profile && (
        <div className="profile-sections">

          {/* ── Section 1: Personal Info ─────────────────────────────────── */}
          <section className="profile-card" data-testid="profile-info-section">
            <h3 className="profile-card__title">Personal Information</h3>

            <form
              onSubmit={handleInfoSubmit}
              noValidate
              data-testid="profile-info-form"
            >
              {/* Username — read-only */}
              <div className="form-group">
                <label htmlFor="profile-username" className="form-label">
                  Username
                  <span className="form-label__hint"> (cannot be changed)</span>
                </label>
                <input
                  id="profile-username"
                  type="text"
                  className="form-input form-input--readonly"
                  value={profile.username}
                  readOnly
                  aria-readonly="true"
                  data-testid="profile-username-display"
                />
              </div>

              {/* Display name */}
              <div className="form-group">
                <label htmlFor="profile-display-name" className="form-label">
                  Display Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Your display name"
                  data-testid="profile-display-name-input"
                  aria-describedby="display-name-count"
                />
                <span
                  id="display-name-count"
                  className={`char-count ${displayName.length > 45 ? 'char-count--warn' : ''}`}
                  data-testid="profile-display-name-count"
                  aria-live="polite"
                >
                  {displayName.length} / 50
                </span>
              </div>

              {infoError && (
                <div
                  className="alert alert--error"
                  data-testid="profile-info-error"
                  role="alert"
                >
                  {infoError}
                </div>
              )}

              {infoSuccess && (
                <div
                  className="alert alert--success"
                  data-testid="profile-info-success"
                  role="status"
                  aria-live="polite"
                >
                  {infoSuccess}
                </div>
              )}

              <div className="profile-card__actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={infoSubmitting}
                  data-testid="profile-info-submit"
                >
                  {infoSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* ── Section 2: Change Password ───────────────────────────────── */}
          <section className="profile-card" data-testid="profile-password-section">
            <h3 className="profile-card__title">Change Password</h3>

            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              data-testid="profile-password-form"
            >
              <div className="form-group">
                <label htmlFor="current-password" className="form-label">
                  Current Password <span aria-hidden="true">*</span>
                </label>
                <input
                  id="current-password"
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Your current password"
                  data-testid="profile-current-password-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  New Password <span aria-hidden="true">*</span>
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  data-testid="profile-new-password-input"
                  aria-describedby="password-rules"
                />
                <span
                  id="password-rules"
                  className="form-hint"
                  data-testid="profile-password-rules"
                >
                  Must be at least 8 characters and differ from your current password.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">
                  Confirm New Password <span aria-hidden="true">*</span>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  data-testid="profile-confirm-password-input"
                />
                {/* Inline match indicator */}
                {confirmPassword.length > 0 && (
                  <span
                    className={`match-indicator ${newPassword === confirmPassword ? 'match-indicator--ok' : 'match-indicator--mismatch'}`}
                    data-testid="profile-password-match-indicator"
                    aria-live="polite"
                  >
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>

              {pwError && (
                <div
                  className="alert alert--error"
                  data-testid="profile-password-error"
                  role="alert"
                >
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div
                  className="alert alert--success"
                  data-testid="profile-password-success"
                  role="status"
                  aria-live="polite"
                >
                  {pwSuccess}
                </div>
              )}

              <div className="profile-card__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPwError('');
                    setPwSuccess('');
                  }}
                  data-testid="profile-password-reset-btn"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={pwSubmitting}
                  data-testid="profile-password-submit"
                >
                  {pwSubmitting ? 'Updating…' : 'Change Password'}
                </button>
              </div>
            </form>
          </section>

        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { colors, fonts, fontWeights, fontSizes, spacing, borderRadius, shadows } from './tokens';

/**
 * Reusable authentication form for Empowered Vote applications.
 * Supports login and register modes with consistent branding.
 *
 * @param {Object} props
 * @param {string} props.logoSrc - URL for the logo image (default: "/EVLogo.svg")
 * @param {string} props.appName - App name shown under logo (default: "Empowered Vote")
 * @param {string} props.appSubtitle - Subtitle under app name (optional)
 * @param {"login"|"register"} props.mode - Current form mode
 * @param {Function} props.onSubmit - async (username, password) => void
 * @param {Function} props.onModeSwitch - Called when user clicks the mode toggle link
 * @param {string|null} props.error - Error message to display
 * @param {boolean} props.submitting - Whether the form is currently submitting
 */
export default function AuthForm({
  logoSrc = '/EVLogo.svg',
  appName = 'Empowered Vote',
  appSubtitle,
  mode = 'login',
  onSubmit,
  onModeSwitch,
  error = null,
  submitting = false,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    if (!isLogin && password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    onSubmit?.(username.trim(), password);
  };

  const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const EyeClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPasswords((prev) => !prev)}
      style={styles.passwordToggle}
    >
      {showPasswords ? <EyeOpen /> : <EyeClosed />}
    </button>
  );

  const displayError = passwordMismatch ? 'Passwords do not match.' : error;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Logo and Title */}
        <div style={styles.header}>
          {logoSrc && (
            <img src={logoSrc} alt={appName} style={styles.logo} />
          )}
          {appName && (
            <h1 style={styles.appName}>{appName}</h1>
          )}
          {appSubtitle && (
            <p style={styles.appSubtitle}>{appSubtitle}</p>
          )}
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* Username */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              autoComplete="off"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = colors.borderLight;
              }}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPasswords ? 'text' : 'password'}
                name="password"
                style={{ ...styles.input, paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = colors.borderLight;
                }}
                required
              />
              <PasswordToggle />
            </div>
          </div>

          {/* Confirm Password (register only) */}
          {!isLogin && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  name="confirmPassword"
                  style={{ ...styles.input, paddingRight: '40px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = colors.borderLight;
                  }}
                  required
                />
                <PasswordToggle />
              </div>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{displayError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            style={{
              ...styles.submitButton,
              opacity: (submitting || !username.trim() || !password) ? 0.6 : 1,
              cursor: (submitting || !username.trim() || !password) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.target.style.backgroundColor = '#e64d38';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.evCoral;
            }}
          >
            {submitting
              ? (isLogin ? 'Signing In...' : 'Creating Account...')
              : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          {/* Mode Switch */}
          {onModeSwitch && (
            <div style={styles.modeSwitch}>
              <p style={styles.modeSwitchText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                onClick={onModeSwitch}
                style={styles.modeSwitchButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.evTeal;
                  e.target.style.color = colors.textWhite;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.evTeal;
                }}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: `0 ${spacing[4]}`,
    fontFamily: fonts.primary,
  },
  container: {
    width: '100%',
    maxWidth: '384px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    height: '64px',
    width: 'auto',
    marginBottom: spacing[4],
  },
  appName: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    color: colors.evTeal,
    margin: 0,
    fontFamily: fonts.primary,
  },
  appSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: spacing[1],
    margin: `${spacing[1]} 0 0 0`,
    fontFamily: fonts.primary,
  },
  card: {
    backgroundColor: colors.bgWhite,
    padding: spacing[8],
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.borderLight}`,
  },
  cardTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing[6],
    textAlign: 'center',
    color: colors.textSecondary,
    margin: `0 0 ${spacing[6]} 0`,
    fontFamily: fonts.primary,
  },
  fieldGroup: {
    marginBottom: spacing[4],
  },
  label: {
    display: 'block',
    marginBottom: spacing[1],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    fontFamily: fonts.primary,
  },
  input: {
    width: '100%',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.lg,
    padding: `10px ${spacing[4]}`,
    fontSize: fontSizes.base,
    fontFamily: fonts.primary,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    outline: 'none',
    boxShadow: `0 0 0 2px ${colors.evTealLight}`,
    borderColor: 'transparent',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    top: 0,
    right: '12px',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    padding: 0,
  },
  errorBox: {
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: borderRadius.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    margin: 0,
    fontFamily: fonts.primary,
  },
  submitButton: {
    width: '100%',
    backgroundColor: colors.evCoral,
    color: colors.textWhite,
    padding: '10px 0',
    borderRadius: borderRadius.lg,
    border: 'none',
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.base,
    fontFamily: fonts.primary,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: shadows.sm,
  },
  modeSwitch: {
    marginTop: spacing[6],
    paddingTop: spacing[6],
    borderTop: `1px solid ${colors.borderLight}`,
  },
  modeSwitchText: {
    textAlign: 'center',
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing[3],
    margin: `0 0 ${spacing[3]} 0`,
    fontFamily: fonts.primary,
  },
  modeSwitchButton: {
    width: '100%',
    padding: '10px 0',
    border: `2px solid ${colors.evTeal}`,
    color: colors.evTeal,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.base,
    fontFamily: fonts.primary,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
};

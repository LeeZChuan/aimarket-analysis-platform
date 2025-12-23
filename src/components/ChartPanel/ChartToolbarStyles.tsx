export const chartToolbarStyles = {
  container: {
    background: 'var(--bg-primary)',
    borderTop: '1px solid var(--border-primary)',
    transition: 'all 0.3s ease',
  },

  divider: {
    background: 'var(--border-primary)',
  },

  button: {
    color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },

  buttonHover: {
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    color: 'var(--text-muted)',
  },
};

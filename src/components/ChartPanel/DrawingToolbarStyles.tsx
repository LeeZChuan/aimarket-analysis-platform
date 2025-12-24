export const drawingToolbarStyles = {
  container: {
    background: 'var(--bg-primary)',
    borderRight: '1px solid var(--border-primary)',
    transition: 'all 0.3s ease',
  },

  toggleButton: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },

  toggleButtonHover: {
    borderColor: 'var(--accent-primary)',
    background: 'var(--bg-tertiary)',
    color: 'var(--accent-primary)',
  },

  divider: {
    background: 'var(--border-primary)',
  },

  toolButton: {
    color: 'var(--text-muted)',
    background: 'var(--bg-transparent)',
    transition: 'all 0.3s ease',
  },

  toolButtonHover: {
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
  },

  toolButtonActive: {
    background: 'var(--accent-primary)',
    color: 'white',
  },

  menu: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
  },

  menuItem: {
    color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },

  menuItemHover: {
    color: 'var(--text-primary)',
    background: 'var(--bg-tertiary)',
  },

  menuItemSelected: {
    background: 'var(--bg-active)',
    color: 'var(--accent-primary)',
  },
};

export const sidebarStyles = {
  container: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },

  header: {
    borderBottom: '1px solid var(--border-primary)',
  },

  searchButton: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },

  searchButtonHover: {
    color: 'var(--text-primary)',
    borderColor: 'var(--accent-primary)',
  },

  searchIcon: {
    color: 'var(--text-muted)',
    transition: 'color 0.3s ease',
  },

  searchIconHover: {
    color: 'var(--accent-primary)',
  },

  tabButton: {
    color: 'var(--text-muted)',
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },

  tabButtonHover: {
    color: 'var(--text-secondary)',
    background: 'rgba(var(--accent-primary-rgb), 0.1)',
  },

  tabButtonActive: {
    background: 'var(--bg-active)',
    color: 'var(--accent-primary)',
    borderColor: 'rgba(var(--accent-primary-rgb), 0.5)',
  },

  stockItem: {
    background: 'var(--bg-primary)',
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },

  stockItemHover: {
    borderColor: 'var(--border-primary)',
  },

  stockItemActive: {
    background: 'var(--bg-active)',
    borderColor: 'var(--border-active)',
  },

  stockSymbol: {
    color: 'var(--text-primary)',
  },

  stockName: {
    color: 'var(--text-muted)',
  },

  stockPrice: {
    color: 'var(--text-primary)',
  },

  stockChangeUp: {
    color: 'var(--success)',
  },

  stockChangeDown: {
    color: 'var(--error)',
  },

  iconButton: {
    color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },

  iconButtonHover: {
    background: 'var(--bg-tertiary)',
    color: 'var(--accent-primary)',
  },

  footer: {
    borderTop: '1px solid var(--border-primary)',
    color: 'var(--text-muted)',
  },

  loadingText: {
    color: 'var(--text-muted)',
  },

  emptyText: {
    color: 'var(--text-muted)',
  },
};

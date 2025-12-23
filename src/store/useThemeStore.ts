import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme: Theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-storage');
  const theme = storedTheme ? JSON.parse(storedTheme).state.theme : 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  window.setAppTheme = (theme: Theme) => {
    useThemeStore.getState().setTheme(theme);
  };

  window.getAppTheme = () => {
    return useThemeStore.getState().theme;
  };

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_THEME') {
      const theme = event.data.theme;
      if (theme === 'light' || theme === 'dark') {
        useThemeStore.getState().setTheme(theme);
      }
    }
  });
}

declare global {
  interface Window {
    setAppTheme: (theme: Theme) => void;
    getAppTheme: () => Theme;
  }
}

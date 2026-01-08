import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './router';
import { useThemeStore } from './store/useThemeStore';
import { initializeTemplates } from './prompt';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 初始化提示词模板（只需一次）
  useEffect(() => {
    initializeTemplates();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;

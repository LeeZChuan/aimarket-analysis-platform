import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';
import { injectTokens } from './design/tokenLoader';

injectTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center" richColors theme="dark" />
    <App />
  </StrictMode>
);

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TradingView } from '../views/TradingView';
import { LoginView } from '../views/LoginView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/trading" replace />,
  },
  {
    path: '/trading',
    element: <TradingView />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
]);

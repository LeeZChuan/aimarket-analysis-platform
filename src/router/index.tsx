import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TradingView } from '../views/TradingView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/trading" replace />,
  },
  {
    path: '/trading',
    element: <TradingView />,
  },
]);

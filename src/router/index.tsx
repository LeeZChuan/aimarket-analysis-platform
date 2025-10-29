import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../views/Layout';
import { TradingView } from '../views/TradingView';
import { StockDetailView } from '../views/StockDetailView';
import { LoginView } from '../views/LoginView';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/trading" replace />,
      },
      {
        path: 'trading',
        element: (
          <ProtectedRoute>
            <TradingView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'stocks',
        element: (
          <ProtectedRoute>
            <StockDetailView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginView />,
      },
    ],
  },
]);

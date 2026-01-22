import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom, adminUserAtom } from './store/atoms';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rounds from './pages/Rounds';
import Users from './pages/Users';
import Operators from './pages/Operators';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import './App.css';

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const adminUser = useAtomValue(adminUserAtom);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles specified, check access
  if (allowedRoles && adminUser) {
    const hasAccess = allowedRoles.includes(adminUser.role) || adminUser.role === 'super_admin';
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'rounds',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Rounds />
          </ProtectedRoute>
        )
      },
      { path: 'users', element: <Users /> },
      {
        path: 'operators',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Operators />
          </ProtectedRoute>
        )
      },
      {
        path: 'admins',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Admins />
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Settings />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

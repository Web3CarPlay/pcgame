import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from './store/atoms';
import Login from './pages/Login';
import Home from './pages/Home';
import GameLobby from './pages/GameLobby';
import Game from './pages/Game';
import History from './pages/History';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import './App.css';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Public route (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/lobby',
    element: (
      <ProtectedRoute>
        <GameLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game',
    element: (
      <ProtectedRoute>
        <Game />
      </ProtectedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/stats',
    element: (
      <ProtectedRoute>
        <Stats />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  // Parse URL params and store in localStorage on first load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const opCode = urlParams.get('op');
    const refCode = urlParams.get('ref');

    if (opCode) {
      localStorage.setItem('op_code', opCode);
    }
    if (refCode) {
      localStorage.setItem('ref_code', refCode);
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;

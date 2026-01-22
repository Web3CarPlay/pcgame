import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import History from './pages/History';
import Profile from './pages/Profile';
import './App.css';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/game', element: <Game /> },
  { path: '/history', element: <History /> },
  { path: '/profile', element: <Profile /> },
]);

// Parse and store referral/operator codes from URL
function parseReferralCodes() {
  const params = new URLSearchParams(window.location.search);
  const opCode = params.get('op');
  const refCode = params.get('ref');

  if (opCode) {
    localStorage.setItem('operator_code', opCode);
  }
  if (refCode) {
    localStorage.setItem('referrer_code', refCode);
  }

  // Clean URL
  if (opCode || refCode) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function App() {
  useEffect(() => {
    parseReferralCodes();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;

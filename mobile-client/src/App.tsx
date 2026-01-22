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

function App() {
  return <RouterProvider router={router} />;
}

export default App;

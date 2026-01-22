import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rounds from './pages/Rounds';
import Users from './pages/Users';
import Operators from './pages/Operators';
import Settings from './pages/Settings';
import './App.css';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'rounds', element: <Rounds /> },
      { path: 'users', element: <Users /> },
      { path: 'operators', element: <Operators /> },
      { path: 'settings', element: <Settings /> },
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

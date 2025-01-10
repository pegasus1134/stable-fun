import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import Dashboard from './views/Dashboard';
import CreateCoin from './views/CreateCoin';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'create',
                element: <CreateCoin />,
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

export default router;
import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BoardPage from '../pages/BoardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { RequireAuth } from '../components/organisms/RequireAuth';
import InvitePage from '../pages/InvitePage';

export const router = createBrowserRouter([
    { path: '/', element: <RequireAuth><HomePage /></RequireAuth> },
    { path: '/boards/:boardId', element: <RequireAuth><BoardPage /></RequireAuth> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage />},
    { path: '*', element: <Navigate to="/" replace />},
    { path: '/invite/:token', element: <InvitePage />}
]);
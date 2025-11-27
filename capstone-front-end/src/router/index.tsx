import { createBrowserRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage';
import ProjectPage from '../pages/ProjectPage/ProjectPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/projects',
    element: <ProjectPage />,
  },
]);

export default router;

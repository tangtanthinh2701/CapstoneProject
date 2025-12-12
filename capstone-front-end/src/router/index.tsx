import { createBrowserRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage';
import ProjectPage from '../pages/ProjectPage/ProjectPage';
import ProjectDetailPage from '../pages/ProjectDetailPage/ProjectDetailPage';
import ProjectFormPage from '../pages/ProjectFormPage/ProjectFormPage';
import TreeSpeciesPage from '../pages/TreeSpeciesPage/TreeSpeciesPage';
import TreeSpeciesFormPage from '../pages/TreeSpeciesFormPage/TreeSpeciesFormPage';

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
  {
    path: '/projects/:id',
    element: <ProjectDetailPage />,
  },
  {
    path: '/projects/new',
    element: <ProjectFormPage />,
  },
  {
    path: '/projects/:id/edit',
    element: <ProjectFormPage />,
  },
  {
    path: '/treespecies',
    element: <TreeSpeciesPage />,
  },
  {
    path: '/tree-species/new',
    element: <TreeSpeciesFormPage />,
  },
  {
    path: '/tree-species/:id/edit',
    element: <TreeSpeciesFormPage />,
  }
]);

export default router;

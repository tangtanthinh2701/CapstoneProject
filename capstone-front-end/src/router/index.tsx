import { createBrowserRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage';
import ProjectPage from '../pages/ProjectPage/ProjectPage';
import ProjectDetailPage from '../pages/ProjectDetailPage/ProjectDetailPage';
import ProjectFormPage from '../pages/ProjectFormPage/ProjectFormPage';
import TreeSpeciesPage from '../pages/TreeSpeciesPage/TreeSpeciesPage';
import TreeSpeciesFormPage from '../pages/TreeSpeciesFormPage/TreeSpeciesFormPage';
import CarbonCreditPage from '../pages/CarbonCreditPage/CarbonCreditPage';
import TransactionPage from '../pages/TransactionPage/TransactionPage';
import TreeSpeciesDetailPage from '../pages/TreeSpeciesDetailPage/TreeSpeciesDetailPage';
import FarmPage from '../pages/FarmPage/FarmPage';
import FarmFormPage from '../pages/FarmFormPage/FarmFormPage';
import FarmDetailPage from '../pages/FarmDetailPage/FarmDetailPage';

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
    path: '/tree-species',
    element: <TreeSpeciesPage />,
  },
  {
    path: '/tree-species/:id',
    element: <TreeSpeciesDetailPage />,
  },
  {
    path: '/tree-species/new',
    element: <TreeSpeciesFormPage />,
  },
  {
    path: '/tree-species/:id/edit',
    element: <TreeSpeciesFormPage />,
  },
  {
    path: '/farms',
    element: <FarmPage />,
  },
  {
    path: '/farms/new',
    element: <FarmFormPage />,
  },
  {
    path: '/farms/:id/edit',
    element: <FarmFormPage />,
  },
  {
    path: '/farms/:id',
    element: <FarmDetailPage />,
  },
  {
    path: '/credits',
    element: <CarbonCreditPage />,
  },
  {
    path: '/payments',
    element: <TransactionPage />,
  },
]);

export default router;

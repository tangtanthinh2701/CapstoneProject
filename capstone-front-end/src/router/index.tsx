import { createBrowserRouter } from 'react-router-dom';

// ========================
// PUBLIC PAGES
// ========================
import LoginPage from '../pages/LoginPage/LoginPage';
import SignUpPage from '../pages/SignupPage/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import HomePage from '../pages/HomePage/index';

// ========================
// PROTECTED PAGES
// ========================
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';

// Project
import ProjectPage from '../pages/ProjectPage/ProjectPage';
import ProjectDetailPage from '../pages/ProjectPage/ProjectDetailPage';
import ProjectFormPage from '../pages/ProjectPage/ProjectFormPage';

// Farm
import FarmPage from '../pages/FarmPage/FarmPage';
import FarmFormPage from '../pages/FarmPage/FarmFormPage';
import FarmDetailPage from '../pages/FarmPage/FarmDetailPage';

// Tree Species
import TreeSpeciesPage from '../pages/TreeSpeciesPage/TreeSpeciesPage';
import TreeSpeciesFormPage from '../pages/TreeSpeciesPage/TreeSpeciesFormPage';
import TreeSpeciesDetailPage from '../pages/TreeSpeciesPage/TreeSpeciesDetailPage';

// Tree Batch
import TreeBatchPage from '../pages/TreeBatchPage/TreeBatchPage';
import TreeBatchFormPage from '../pages/TreeBatchPage/TreeBatchFormPage';
import TreeBatchDetailPage from '../pages/TreeBatchPage/TreeBatchDetailPage';

// Contracts
import ContractPage from '../pages/ContractPage/ContractPage';
import ContractFormPage from '../pages/ContractPage/ContractFormPage';
import ContractDetailPage from '../pages/ContractPage/ContractDetailPage';
import ContractWorkflowPage from '../pages/ContractPage/ContractWorkflowPage';

// Carbon Credits  
import CarbonCreditPage from '../pages/CarbonCreditPage/CarbonCreditPage';

// Transactions
import TransactionPage from '../pages/TransactionPage/TransactionPage';

// Admin
import UserManagementPage from '../pages/UserPage/UserManagementPage';

// ========================
// PROTECTED ROUTE WRAPPER
// ========================
import ProtectedRoute from '../components/ProtectedRoute';

// ========================
// ROUTER
// ========================
const router = createBrowserRouter([
  // PUBLIC
  { path: '/', element: <HomePage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // DASHBOARD & PROFILE
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  },

  // PROJECTS
  {
    path: '/projects',
    element: <ProtectedRoute><ProjectPage /></ProtectedRoute>,
  },
  {
    path: '/projects/new',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><ProjectFormPage /></ProtectedRoute>,
  },
  {
    path: '/projects/:id',
    element: <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>,
  },
  {
    path: '/projects/:id/edit',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><ProjectFormPage /></ProtectedRoute>,
  },

  // FARMS
  {
    path: '/farms',
    element: <ProtectedRoute><FarmPage /></ProtectedRoute>,
  },
  {
    path: '/farms/new',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><FarmFormPage /></ProtectedRoute>,
  },
  {
    path: '/farms/:id',
    element: <ProtectedRoute><FarmDetailPage /></ProtectedRoute>,
  },
  {
    path: '/farms/:id/edit',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><FarmFormPage /></ProtectedRoute>,
  },

  // TREE SPECIES
  {
    path: '/tree-species',
    element: <ProtectedRoute><TreeSpeciesPage /></ProtectedRoute>,
  },
  {
    path: '/tree-species/new',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><TreeSpeciesFormPage /></ProtectedRoute>,
  },
  {
    path: '/tree-species/:id',
    element: <ProtectedRoute><TreeSpeciesDetailPage /></ProtectedRoute>,
  },
  {
    path: '/tree-species/:id/edit',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><TreeSpeciesFormPage /></ProtectedRoute>,
  },

  // TREE BATCHES
  {
    path: '/tree-batches',
    element: <ProtectedRoute><TreeBatchPage /></ProtectedRoute>,
  },
  {
    path: '/tree-batches/new',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><TreeBatchFormPage /></ProtectedRoute>,
  },
  {
    path: '/tree-batches/:id',
    element: <ProtectedRoute><TreeBatchDetailPage /></ProtectedRoute>,
  },
  {
    path: '/tree-batches/:id/edit',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><TreeBatchFormPage /></ProtectedRoute>,
  },

  // CONTRACTS
  {
    path: '/contracts',
    element: <ProtectedRoute><ContractPage /></ProtectedRoute>,
  },
  {
    path: '/contracts/new',
    element: <ProtectedRoute><ContractFormPage /></ProtectedRoute>,
  },
  {
    path: '/contracts/workflow',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><ContractWorkflowPage /></ProtectedRoute>,
  },
  {
    path: '/contracts/:id',
    element: <ProtectedRoute><ContractDetailPage /></ProtectedRoute>,
  },

  // CARBON CREDITS
  {
    path: '/credits',
    element: <ProtectedRoute><CarbonCreditPage /></ProtectedRoute>,
  },

  // ADMIN
  {
    path: '/users',
    element: <ProtectedRoute requiredRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>,
  },
]);

export default router;

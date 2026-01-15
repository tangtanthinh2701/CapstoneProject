import { createBrowserRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage';
import ProjectPage from '../pages/ProjectPage/ProjectPage';
import ProjectDetailPage from '../pages/ProjectPage/ProjectDetailPage';
import ProjectFormPage from '../pages/ProjectPage/ProjectFormPage';
import TreeSpeciesPage from '../pages/TreeSpeciesPage/TreeSpeciesPage';
import TreeSpeciesFormPage from '../pages/TreeSpeciesPage/TreeSpeciesFormPage';
import CarbonCreditPage from '../pages/CarbonCreditPage/CarbonCreditPage';
import TransactionPage from '../pages/TransactionPage/TransactionPage';
import TreeSpeciesDetailPage from '../pages/TreeSpeciesPage/TreeSpeciesDetailPage';
import FarmPage from '../pages/FarmPage/FarmPage';
import FarmFormPage from '../pages/FarmPage/FarmFormPage';
import FarmDetailPage from '../pages/FarmPage/FarmDetailPage';
import ProjectCarbonReservePage from '../pages/ProjectCarbonReservePage/ProjectCarbonReservePage';
import { PartnerPage } from '../pages/PartnerPage/PartnerPage';
import ContractPage from '../pages/ContractPage/ContractPage';
import ContractFormPage from '../pages/ContractPage/ContractFormPage';
import ContractDetailPage from '../pages/ContractPage/ContractDetailPage';
import ContractWorkflowPage from '../pages/ContractPage/ContractWorkflowPage';
import ContractApprovalPage from '../pages/ContractPage/ContractApprovalPage';
import ContractRenewalPage from '../pages/ContractPage/ContractRenewalPage';
import ContractTerminatePage from '../pages/ContractPage/ContractTerminatePage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';

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
    path: '/dashboard',
    element: <DashboardPage />,
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
    path: '/projects/:id/carbon-reserve',
    element: <ProjectCarbonReservePage />,
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
    path: '/partners',
    element: <PartnerPage />,
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
    path: '/contracts',
    element: <ContractPage />,
  },
  {
    path: '/contracts/new',
    element: <ContractFormPage />,
  },
  {
    path: '/contracts/:id',
    element: <ContractDetailPage />,
  },
  {
    path: '/contracts/:id/edit',
    element: <ContractFormPage />,
  },
  {
    path: '/contracts/workflow',
    element: <ContractWorkflowPage />,
  },
  {
    path: '/contracts/:id/approve',
    element: <ContractApprovalPage />,
  },
  {
    path: '/contracts/:id/renew',
    element: <ContractRenewalPage />,
  },
  {
    path: '/contracts/:id/terminate',
    element: <ContractTerminatePage />,
  },
  {
    path: '/payments',
    element: <TransactionPage />,
  },
]);

export default router;

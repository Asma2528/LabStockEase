import { createBrowserRouter } from "react-router-dom";
import App from '../App';
import AuthorizedRoute from './AuthorizedRoute';

import Register from "../pages/Register";
import Login from "../pages/Login";
import ErrorPage from "../components/Error";
import ForgotPassword from "../pages/forgotPassword";
import ResetPassword from "../pages/resetPassword";
import Unauthorized from "../components/Unauthorized";

// Chemistry
import ChemistryPage from "../pages/Chemistry/Overview";

import RequisitionPage from "../pages/Requisition/index";
import ApproveRequisitionPage from "../pages/Requisition/approveRequisition"
import ViewApprovedRequisitionPage from "../pages/Requisition/viewApprovedRequisition"
import ReturnRequisitionPage from "../pages/Requisition/returnRequisition"
import ViewReturnedRequisitionPage from "../pages/Requisition/view.returned.requisition"

import OrderRequestPage from "../pages/NewRequisition/order.request";
import ApproveOrderRequestPage from "../pages/NewRequisition/approveOrderRequest";
import ViewApprovedOrderRequestPage from "../pages/NewRequisition/viewApprovedOrderRequest";
import NewIndentPage from "../pages/NewRequisition/newIndent";
import ApproveNewIndentPage from "../pages/NewRequisition/approve.newIndent";
import ViewApprovedNewIndentPage from "../pages/NewRequisition/view.approved.newIndent";

import ChemicalsPage from "../pages/Chemistry/Chemicals/New";
import ChemicalsRestockPage from "../pages/Chemistry/Chemicals/Restock/restock.chemicals";
import ChemicalsLogPage from "../pages/Chemistry/Chemicals/Issue/log.chemicals";

import EquipmentsPage from "../pages/Chemistry/Equipments/New";
import EquipmentsRestockPage from "../pages/Chemistry/Equipments/Restock/restock.equipments";
import EquipmentsLogPage from "../pages/Chemistry/Equipments/Issue/log.equipments";

import BooksPage from "../pages/Chemistry/Books/New";
import BooksRestockPage from "../pages/Chemistry/Books/Restock/restock.books";
import BooksLogPage from "../pages/Chemistry/Books/Issue/log.books";

import GlasswaresPage from "../pages/Chemistry/Glasswares/New";
import GlasswaresRestockPage from "../pages/Chemistry/Glasswares/Restock/restock.glasswares";
import GlasswaresLogPage from "../pages/Chemistry/Glasswares/Issue/log.glasswares";

import OthersPage from "../pages/Chemistry/Others/New";
import OthersRestockPage from "../pages/Chemistry/Others/Restock/restock.others";
import OthersLogPage from "../pages/Chemistry/Others/Issue/log.others";

import ConsumablesPage from "../pages/Chemistry/Consumables/New";
import ConsumablesRestockPage from "../pages/Chemistry/Consumables/Restock/restock.consumables";
import ConsumablesLogPage from "../pages/Chemistry/Consumables/Issue/log.consumables";

import VendorsPage from "../pages/Vendors/index"
import OrdersPage from "../pages/Order/index"
import ProjectsPage from "../pages/Project/index"
import PracticalPage from "../pages/Practical/index"
import OtherPage from "../pages/Other/index"
import GeneralPage from "../pages/General/index"
import OrderApprovalPage from "../pages/Order/approval.order";

import InvoicesPage from "../pages/Invoice/index";
import ApproveInvoicePage from "../pages/Invoice/approveInvoice";
import PaymentRequestPage from "../pages/Invoice/PaymentRequest";

import InwardsPage from "../pages/Inwards/index";
import UserPage from "../pages/User/index";
import ForecastPage from "../components/Forecast";
import AIDashboard from "../components/AIDashboard";


export const Routes = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '/',
        element: <AuthorizedRoute element={<AIDashboard />} allowedRoles={['admin','manager']} />
      },
      {
        path: '/forecast',
        element: <AuthorizedRoute element={<ForecastPage />} allowedRoles={['admin','manager','lab-assistant']} />
      },
      // Chemistry Routes
      {
        path: '/chemistry',
        element: <AuthorizedRoute element={<ChemistryPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/chemicals',
        element: <AuthorizedRoute element={<ChemicalsPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/chemicals/restock',
        element: <AuthorizedRoute element={<ChemicalsRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/chemicals/logs',
        element: <AuthorizedRoute element={<ChemicalsLogPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/consumables',
        element: <AuthorizedRoute element={<ConsumablesPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/consumables/restock',
        element: <AuthorizedRoute element={<ConsumablesRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/consumables/logs',
        element: <AuthorizedRoute element={<ConsumablesLogPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/equipments',
        element: <AuthorizedRoute element={<EquipmentsPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/equipments/restock',
        element: <AuthorizedRoute element={<EquipmentsRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/equipments/logs',
        element: <AuthorizedRoute element={<EquipmentsLogPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/books',
        element: <AuthorizedRoute element={<BooksPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/books/restock',
        element: <AuthorizedRoute element={<BooksRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/books/logs',
        element: <AuthorizedRoute element={<BooksLogPage/>} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/glasswares',
        element: <AuthorizedRoute element={<GlasswaresPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/glasswares/restock',
        element: <AuthorizedRoute element={<GlasswaresRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/glasswares/logs',
        element: <AuthorizedRoute element={<GlasswaresLogPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/others',
        element: <AuthorizedRoute element={<OthersPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/others/restock',
        element: <AuthorizedRoute element={<OthersRestockPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/chemistry/others/logs',
        element: <AuthorizedRoute element={<OthersLogPage />} allowedRoles={['admin', 'lab-assistant']} />
      },
      {
        path: '/vendors',
        element: <AuthorizedRoute element={<VendorsPage />} allowedRoles={['admin','stores','accountant']} />
      },
      {
        path: '/orders',
        element: <AuthorizedRoute element={<OrdersPage />} allowedRoles={['admin','stores','accountant']} />
      },
      {
        path: '/approve-order',
        element: <AuthorizedRoute element={<OrderApprovalPage />} allowedRoles={['admin','manager']} />
      },
      {
        path: '/projects',
        element: <AuthorizedRoute element={<ProjectsPage />} allowedRoles={['admin','lab-assistant','stores','faculty']} />
      },
      {
        path: '/practical',
        element: <AuthorizedRoute element={<PracticalPage />} allowedRoles={['admin','lab-assistant','stores','faculty']} />
      },
      {
        path: '/other',
        element: <AuthorizedRoute element={<OtherPage />} allowedRoles={['admin','lab-assistant','stores','faculty']} />
      },
      {
        path: '/general',
        element: <AuthorizedRoute element={<GeneralPage />} allowedRoles={['admin','lab-assistant','stores','faculty']} />
      },
      {
        path:'/manage-requisition',
        element:<AuthorizedRoute element={<RequisitionPage/>} allowedRoles={['admin','lab-assistant','faculty']} />
      },
      {
        path:'/approve-requisition',
        element:<AuthorizedRoute element={<ApproveRequisitionPage/>} allowedRoles={['admin']} />
      },
      {
        path:'/issue-requisition',
        element:<AuthorizedRoute element={<ViewApprovedRequisitionPage/>} allowedRoles={['admin','lab-assistant','manager']} />
      },
      {
        path:'/return-requisition',
        element:<AuthorizedRoute element={<ReturnRequisitionPage/>} allowedRoles={['admin','lab-assistant','faculty']} />
      },
      {
        path:'/view-return-requisition',
        element:<AuthorizedRoute element={<ViewReturnedRequisitionPage/>} allowedRoles={['admin','lab-assistant']} />
      },
      {
        path: '/order-request',
        element: <AuthorizedRoute element={<OrderRequestPage />} allowedRoles={['admin','lab-assistant','faculty']} />
      },
      {
        path: '/approve-order-request',
        element: <AuthorizedRoute element={<ApproveOrderRequestPage />} allowedRoles={['admin']} />
      },
      {
        path: '/view-approved-order-request',
        element: <AuthorizedRoute element={<ViewApprovedOrderRequestPage />} allowedRoles={['admin','lab-assistant']} />
      },
      {
        path: '/new-indent',
        element: <AuthorizedRoute element={<NewIndentPage />} allowedRoles={['admin','lab-assistant','faculty']} />
      },
      {
        path: '/approve-new-indent',
        element: <AuthorizedRoute element={<ApproveNewIndentPage />} allowedRoles={['admin']} />
      },
      {
        path: '/view-approved-new-indent',
        element: <AuthorizedRoute element={<ViewApprovedNewIndentPage />} allowedRoles={['admin','lab-assistant']} />
      },
      {
        path: '/manage-invoice',
        element: <AuthorizedRoute element={<InvoicesPage />} allowedRoles={['admin','stores']} />
      },
      {
        path: '/approve-invoice',
        element: <AuthorizedRoute element={<ApproveInvoicePage />} allowedRoles={['admin','manager']} />
      },
      {
        path: '/payment-request',
        element: <AuthorizedRoute element={<PaymentRequestPage />} allowedRoles={['admin','accountant']} />
      },
      {
        path: '/inwards',
        element: <AuthorizedRoute element={<InwardsPage />} allowedRoles={['admin','stores','manager','lab-assistant']} />
      },
      {
        path: '/user',
        element: <AuthorizedRoute element={<UserPage />} allowedRoles={['admin']} />
      },
      // Error Page
      {
        path: '*',
        element: <ErrorPage />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <AuthorizedRoute element={<Register />} allowedRoles={['admin']} />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  }
]);

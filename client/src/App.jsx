import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/common/ErrorBoundary';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import UserManagementPage from './pages/users/UserManagementPage';
import AssetListPage from './pages/assets/AssetListPage';
import AssetDetailPage from './pages/assets/AssetDetailPage';
import AssetFormPage from './pages/assets/AssetFormPage';
import SearchPage from './pages/search/SearchPage';
import MyRequestsPage from './pages/requests/MyRequestsPage';
import RequestFormPage from './pages/requests/RequestFormPage';
import ApprovalsPage from './pages/requests/ApprovalsPage';
import ActiveBorrowingsPage from './pages/checkout/ActiveBorrowingsPage';
import OverduePage from './pages/checkout/OverduePage';
import LocationsOverviewPage from './pages/locations/LocationsOverviewPage';
import ProcurementListPage from './pages/procurement/ProcurementListPage';
import ProcurementFormPage from './pages/procurement/ProcurementFormPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AnalyticsDashboardPage from './pages/reports/AnalyticsDashboardPage';

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-ink-400 text-sm">
    Loading…
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return children;
};

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

    {/* All protected pages share DashboardLayout (Topbar + Sidebar + Outlet) */}
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard" element={<DashboardHome />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Module 1 — Asset Registry */}
      <Route path="/assets" element={<AssetListPage />} />
      <Route
        path="/assets/new"
        element={<ProtectedRoute roles={['Administrator', 'ProjectLead']}><AssetFormPage /></ProtectedRoute>}
      />
      <Route
        path="/assets/:id/edit"
        element={<ProtectedRoute roles={['Administrator', 'ProjectLead']}><AssetFormPage /></ProtectedRoute>}
      />
      <Route path="/assets/:id" element={<AssetDetailPage />} />

      {/* Module 2 — Search & Discovery */}
      <Route path="/search" element={<SearchPage />} />

      {/* Module 3 — Resource Requests */}
      <Route path="/requests" element={<MyRequestsPage />} />
      <Route path="/requests/new" element={<RequestFormPage />} />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute roles={['Administrator', 'ResourceManager', 'ProjectLead']}>
            <ApprovalsPage />
          </ProtectedRoute>
        }
      />

      {/* Module 4 — Checkout / Borrowing */}
      <Route path="/checkout" element={<ActiveBorrowingsPage />} />
      <Route
        path="/checkout/overdue"
        element={
          <ProtectedRoute roles={['Administrator', 'ResourceManager', 'ProjectLead']}>
            <OverduePage />
          </ProtectedRoute>
        }
      />

      {/* Module 5 + 7 — Locations & Reuse */}
      <Route path="/locations" element={<LocationsOverviewPage />} />

      {/* Module 6 — Procurement */}
      <Route path="/procurement" element={<ProcurementListPage />} />
      <Route
        path="/procurement/new"
        element={<ProtectedRoute roles={['Administrator', 'ResourceManager']}><ProcurementFormPage /></ProtectedRoute>}
      />
      <Route
        path="/procurement/:id/edit"
        element={<ProtectedRoute roles={['Administrator', 'ResourceManager']}><ProcurementFormPage /></ProtectedRoute>}
      />

      {/* Module 8 — Notifications */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Module 9 — Reporting & Analytics */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['Administrator', 'ResourceManager']}>
            <AnalyticsDashboardPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

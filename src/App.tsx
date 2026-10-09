import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { OpsProvider } from './context/OpsContext'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { DashboardPage } from './pages/DashboardPage'
import { FailuresPage } from './pages/FailuresPage'
import { OrdersPage } from './pages/OrdersPage'
import { ServiceHealthPage } from './pages/ServiceHealthPage'
import { WorkflowsPage } from './pages/WorkflowsPage'
import { AuthLandingPage, AuthFormPage } from './pages/AuthPages'
import {
  CustomerPortalHomePage,
  CustomerPortalLayout,
  CustomerOrdersPage,
  CustomerOrderDetailsPage,
  CustomerPlansPage,
  CustomerNotificationsPage,
} from './pages/CustomerPortalPage'
import { OrderDetailsPage } from './pages/FeaturePages'

export default function App() {
  return (
    <OpsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthLandingPage />} />
          <Route path="/login/admin" element={<AuthFormPage mode="login" role="admin" />} />
          <Route path="/signup/admin" element={<AuthFormPage mode="signup" role="admin" />} />
          <Route path="/login/user" element={<AuthFormPage mode="login" role="customer" />} />
          <Route path="/signup/user" element={<AuthFormPage mode="signup" role="customer" />} />

          {/* Customer Self-Service Portal */}
          <Route path="/portal" element={<CustomerPortalLayout />}>
            <Route index element={<CustomerPortalHomePage />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
            <Route path="orders/:orderId" element={<CustomerOrderDetailsPage />} />
            <Route path="plans" element={<CustomerPlansPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
          </Route>

          {/* Admin Orchestration Workspace */}
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="workflows" element={<WorkflowsPage />} />
            <Route path="health" element={<ServiceHealthPage />} />
            <Route path="failures" element={<FailuresPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OpsProvider>
  )
}

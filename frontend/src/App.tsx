import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import ProductsPage from './features/products/ProductsPage'
import InventoryPage from './features/inventory/InventoryPage'
import SuppliersPage from './features/suppliers/SuppliersPage'
import PurchasesPage from './features/purchases/PurchasesPage'
import CustomersPage from './features/customers/CustomersPage'
import SalesPage from './features/sales/SalesPage'
import BillingPage from './features/sales/BillingPage'
import ReportsPage from './features/reports/ReportsPage'
import SettingsPage from './features/settings/SettingsPage'
import UsersPage from './features/users/UsersPage'
import RolesPage from './features/roles/RolesPage'
import MastersPage from './features/masters/MastersPage'

function App() {
  return (
    <>
      <AnimatePresence initial={false}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products/*" element={<ProductsPage />} />
            <Route path="inventory/*" element={<InventoryPage />} />
            <Route path="masters/*" element={<MastersPage />} />
            <Route path="suppliers/*" element={<SuppliersPage />} />
            <Route path="purchases/*" element={<PurchasesPage />} />
            <Route path="customers/*" element={<CustomersPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports/*" element={<ReportsPage />} />
            <Route path="users/*" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="top-right" />
    </>
  )
}

export default App

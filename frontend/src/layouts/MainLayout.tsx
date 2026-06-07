import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

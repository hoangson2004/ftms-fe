import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { featureModules } from '@/app/config/navigation'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { AuthLayout } from '@/common/components/layout/AuthLayout'
import { MainLayout } from '@/common/components/layout/MainLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { getResourceConfigByKey } from '@/features/admin/config/resourceConfigs'
import { CrudResourcePage } from '@/features/admin/pages/CrudResourcePage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

const resourceRoutes = featureModules
  .map((module) => {
    const resourceConfig = getResourceConfigByKey(module.key)

    return resourceConfig
      ? {
          path: module.path.slice(1),
          element: <CrudResourcePage key={resourceConfig.key} config={resourceConfig} />,
        }
      : {
          path: module.path.slice(1),
          element: <Navigate replace to="/" />,
        }
  })

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          ...resourceRoutes,
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

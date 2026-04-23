import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { RoleRoute } from '@/app/router/RoleRoute'
import { AuthLayout } from '@/common/components/layout/AuthLayout'
import { MainLayout } from '@/common/components/layout/MainLayout'
import { AvailabilityPage } from '@/features/availability/pages/AvailabilityPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { MatchmakingPage } from '@/features/matchmaking/pages/MatchmakingPage'
import { MatchesPage } from '@/features/matches/pages/MatchesPage'
import { MembersPage } from '@/features/members/pages/MembersPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { TeamsPage } from '@/features/teams/pages/TeamsPage'
import { UsersPage } from '@/features/users/pages/UsersPage'

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
          {
            path: 'teams',
            element: <TeamsPage />,
          },
          {
            path: 'members',
            element: <MembersPage />,
          },
          {
            path: 'availability',
            element: <AvailabilityPage />,
          },
          {
            path: 'matches',
            element: <MatchesPage />,
          },
          {
            path: 'finance',
            element: <FinancePage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
          {
            path: 'matchmaking',
            element: <MatchmakingPage />,
          },
          {
            element: <RoleRoute allowedRoles={['admin']} />,
            children: [
              {
                path: 'users',
                element: <UsersPage />,
              },
            ],
          },
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

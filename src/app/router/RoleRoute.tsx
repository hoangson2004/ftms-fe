import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import type { UserRole } from '@/common/types/auth'

type RoleRouteProps = {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const role = useAuthStore((state) => state.user?.role)

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate replace to="/" />
  }

  return <Outlet />
}

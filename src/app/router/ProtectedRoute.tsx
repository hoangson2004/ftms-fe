import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { Loading } from '@/common/components/feedback/Loading'
import { getCurrentUser } from '@/features/auth/api/authApi'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const signOut = useAuthStore((state) => state.signOut)
  const location = useLocation()
  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me', 'guard'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated && Boolean(accessToken) && !user,
    retry: false,
  })

  useEffect(() => {
    if (currentUserQuery.data) {
      updateUser(currentUserQuery.data)
    }
  }, [currentUserQuery.data, updateUser])

  useEffect(() => {
    if (currentUserQuery.isError) {
      signOut()
    }
  }, [currentUserQuery.isError, signOut])

  if (!isAuthenticated || !accessToken) {
    return <Navigate replace state={{ from: location }} to="/auth/login" />
  }

  if (!user && currentUserQuery.isPending) {
    return <Loading />
  }

  return <Outlet />
}

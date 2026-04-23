import { create } from 'zustand'
import { storage } from '@/common/lib/storage'
import type { UserRole } from '@/common/types/auth'

type CurrentUser = {
  id: string
  fullName: string
  role: UserRole
}

type AuthState = {
  isAuthenticated: boolean
  user: CurrentUser | null
  signIn: (payload?: Partial<CurrentUser>) => void
  signOut: () => void
}

const AUTH_STORAGE_KEY = 'football-management-auth'

const initialUser: CurrentUser = {
  id: 'seed-admin',
  fullName: 'Club Admin',
  role: 'admin',
}

function getInitialState() {
  const persisted = storage.get<boolean>(AUTH_STORAGE_KEY)

  if (persisted) {
    return {
      isAuthenticated: true,
      user: initialUser,
    }
  }

  return {
    isAuthenticated: false,
    user: null,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  signIn: (payload) => {
    storage.set(AUTH_STORAGE_KEY, true)
    set({
      isAuthenticated: true,
      user: {
        ...initialUser,
        ...payload,
      },
    })
  },
  signOut: () => {
    storage.remove(AUTH_STORAGE_KEY)
    set({
      isAuthenticated: false,
      user: null,
    })
  },
}))

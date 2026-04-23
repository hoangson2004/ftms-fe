import { create } from 'zustand'
import { AUTH_STORAGE_KEY } from '@/common/constants/storage'
import { storage } from '@/common/lib/storage'
import type { CurrentUser, PersistedAuthState } from '@/common/types/auth'

type AuthState = {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: CurrentUser | null
  signIn: (payload: PersistedAuthState) => void
  updateUser: (user: CurrentUser) => void
  signOut: () => void
}

function getInitialState() {
  const persisted = storage.get<PersistedAuthState>(AUTH_STORAGE_KEY)

  if (persisted?.accessToken) {
    return {
      isAuthenticated: true,
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken,
      user: persisted.user,
    }
  }

  return {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
  }
}

function persistAuthState(payload: PersistedAuthState | null) {
  if (!payload?.accessToken) {
    storage.remove(AUTH_STORAGE_KEY)

    return
  }

  storage.set(AUTH_STORAGE_KEY, payload)
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  signIn: (payload) => {
    persistAuthState(payload)
    set({
      isAuthenticated: true,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    })
  },
  updateUser: (user) => {
    const currentAuth = storage.get<PersistedAuthState>(AUTH_STORAGE_KEY)

    persistAuthState({
      accessToken: currentAuth?.accessToken ?? '',
      refreshToken: currentAuth?.refreshToken ?? '',
      tokenType: currentAuth?.tokenType,
      expiresInMs: currentAuth?.expiresInMs,
      refreshExpiresInMs: currentAuth?.refreshExpiresInMs,
      user,
    })

    set((state) => ({
      ...state,
      user,
    }))
  },
  signOut: () => {
    persistAuthState(null)
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
    })
  },
}))

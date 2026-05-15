import Axios, { AxiosHeaders } from 'axios'
import { AUTH_STORAGE_KEY } from '@/common/constants/storage'
import { storage } from '@/common/lib/storage'
import type { PersistedAuthState } from '@/common/types/auth'
import type { LoginResult } from '@/features/auth/api/authApi'

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL

  if (typeof configuredUrl === 'string' && configuredUrl.trim()) {
    return configuredUrl
  }

  return import.meta.env.DEV ? '' : 'http://localhost:8080'
}

export const axios = Axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
})

type RetriableRequestConfig = {
  _retry?: boolean
}

let refreshRequest: Promise<LoginResult> | null = null

function getPersistedAuth() {
  return storage.get<PersistedAuthState>(AUTH_STORAGE_KEY)
}

function persistAuthState(payload: PersistedAuthState | null) {
  if (!payload?.accessToken || !payload.refreshToken) {
    storage.remove(AUTH_STORAGE_KEY)

    return
  }

  storage.set(AUTH_STORAGE_KEY, payload)
}

async function runRefreshTokenRequest(refreshToken: string) {
  const response = await Axios.post(`${getApiBaseUrl()}/api/auth/refresh`, {
    refreshToken,
  })

  const body = response.data?.data ?? response.data

  return {
    accessToken: typeof body?.accessToken === 'string' ? body.accessToken : '',
    refreshToken:
      typeof body?.refreshToken === 'string' && body.refreshToken
        ? body.refreshToken
        : refreshToken,
    tokenType: typeof body?.tokenType === 'string' ? body.tokenType : undefined,
    expiresInMs: typeof body?.expiresInMs === 'number' ? body.expiresInMs : undefined,
    refreshExpiresInMs:
      typeof body?.refreshExpiresInMs === 'number' ? body.refreshExpiresInMs : undefined,
    user: body?.user ?? null,
  }
}

axios.interceptors.request.use((config) => {
  const auth = getPersistedAuth()
  const token = auth?.accessToken

  if (!token) {
    return config
  }

  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers = AxiosHeaders.from({
      ...config.headers,
      Authorization: `Bearer ${token}`,
    })
  }

  return config
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config as typeof error.config & RetriableRequestConfig
    const requestUrl = String(originalRequest?.url ?? '')

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    const auth = getPersistedAuth()

    if (!auth?.refreshToken) {
      persistAuthState(null)

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshRequest ??= runRefreshTokenRequest(auth.refreshToken)
      const refreshed = await refreshRequest
      const nextAuth: PersistedAuthState = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        tokenType: refreshed.tokenType,
        expiresInMs: refreshed.expiresInMs,
        refreshExpiresInMs: refreshed.refreshExpiresInMs,
        user: auth.user,
      }

      persistAuthState(nextAuth)

      if (typeof originalRequest.headers?.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
      } else {
        originalRequest.headers = AxiosHeaders.from({
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshed.accessToken}`,
        })
      }

      return axios(originalRequest)
    } catch (refreshError) {
      persistAuthState(null)

      return Promise.reject(refreshError)
    } finally {
      refreshRequest = null
    }
  },
)

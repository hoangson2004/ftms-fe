import { axios } from '@/common/lib/axios'
import { getErrorMessage, unwrapApiData } from '@/common/lib/api'
import type { AnyRecord } from '@/common/types/api'
import type { CurrentUser } from '@/common/types/auth'
import { mapAuthUser } from '@/features/auth/utils/mapAuthUser'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResult = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresInMs?: number
  refreshExpiresInMs?: number
  user: CurrentUser | null
}

function readString(payload: AnyRecord, key: string) {
  const value = payload[key]

  return typeof value === 'string' ? value : ''
}

function readNumber(payload: AnyRecord, key: string) {
  const value = payload[key]

  return typeof value === 'number' ? value : undefined
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await axios.post('/api/auth/login', payload)
  const data = unwrapApiData<AnyRecord>(response.data)
  const accessToken = readString(data, 'accessToken')
  const refreshToken = readString(data, 'refreshToken')
  const user = mapAuthUser(data.user)

  if (!accessToken || !refreshToken) {
    throw new Error('Login response is missing token data.')
  }

  return {
    accessToken,
    refreshToken,
    tokenType: readString(data, 'tokenType') || undefined,
    expiresInMs: readNumber(data, 'expiresInMs'),
    refreshExpiresInMs: readNumber(data, 'refreshExpiresInMs'),
    user,
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResult> {
  const response = await axios.post('/api/auth/refresh', {
    refreshToken,
  })
  const data = unwrapApiData<AnyRecord>(response.data)
  const accessToken = readString(data, 'accessToken')
  const nextRefreshToken = readString(data, 'refreshToken') || refreshToken
  const user = mapAuthUser(data.user)

  if (!accessToken) {
    throw new Error('Refresh response is missing access token.')
  }

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    tokenType: readString(data, 'tokenType') || undefined,
    expiresInMs: readNumber(data, 'expiresInMs'),
    refreshExpiresInMs: readNumber(data, 'refreshExpiresInMs'),
    user,
  }
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const response = await axios.get('/api/auth/me')
    const data = unwrapApiData<unknown>(response.data)
    const user = mapAuthUser(data)

    if (!user) {
      throw new Error('Current user payload is missing required fields.')
    }

    return user
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

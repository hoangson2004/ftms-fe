export type UserRole = string

export type CurrentUser = {
  id: string
  fullName: string
  email?: string
  role: UserRole
  teamId?: string | null
  avatarUrl?: string | null
}

export type PersistedAuthState = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresInMs?: number
  refreshExpiresInMs?: number
  user: CurrentUser | null
}

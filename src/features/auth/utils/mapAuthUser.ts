import type { AnyRecord } from '@/common/types/api'
import type { CurrentUser } from '@/common/types/auth'
import { getValueByPath, isRecord } from '@/common/lib/api'

function firstString(candidates: unknown[]) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }

    if (typeof candidate === 'number') {
      return String(candidate)
    }
  }

  return undefined
}

export function mapAuthUser(payload: unknown): CurrentUser | null {
  if (!isRecord(payload)) {
    return null
  }

  const id = firstString([payload.id, payload.userId])

  if (!id) {
    return null
  }

  const roles = Array.isArray(payload.roles) ? payload.roles : []
  const firstRole = roles[0]
  const role = firstString([
    getValueByPath(payload, 'role.code'),
    getValueByPath(payload, 'role.name'),
    payload.role,
    isRecord(firstRole) ? firstRole.code : undefined,
    isRecord(firstRole) ? firstRole.name : undefined,
    firstRole,
    'member',
  ])

  return {
    id,
    fullName: firstString([payload.fullName, payload.name]) ?? 'Unknown user',
    email: firstString([payload.email]),
    role: role ?? 'member',
    teamId: firstString([payload.teamId, getValueByPath(payload, 'team.id')]) ?? null,
    avatarUrl: firstString([payload.avatarUrl]) ?? null,
  }
}

export function toAnyRecord(user: CurrentUser | null): AnyRecord {
  return user ? { ...user } : {}
}

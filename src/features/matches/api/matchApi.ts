import { axios } from '@/common/lib/axios'
import { compactObject, extractListResponse, unwrapApiData } from '@/common/lib/api'
import type { AnyRecord, ApiListResult } from '@/common/types/api'

export type MemberAvailability = {
  id: number
  teamId: number
  planId: number
  teamMemberId: number
  userName: string
  availableFrom: string
  availableTo: string
  createdAt: string
  updatedAt: string
}

export type MatchPlan = {
  id: number
  teamId: number
  name: string
  description?: string | null
  planType: 'INTERNAL' | 'MATCHMAKING'
  fromAt: string
  toAt: string
  durationMinutes: number
  stepMinutes: number
  minPlayers: number
  status: 'ACTIVE' | 'CALCULATED' | 'SEARCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED'
  createdAt: string
  updatedAt: string
}

export type SuggestionMember = {
  id: number
  teamId: number
  teamMemberId: number
  userName: string
  availabilityStatus: 'AVAILABLE' | 'ABSENT'
}

export type InternalMatchSuggestion = {
  id: number
  planId: number
  teamId: number
  startAt: string
  endAt: string
  availableCount: number
  absentCount: number
  rankOrder: number
  status: string
  members: SuggestionMember[]
  createdAt: string
  updatedAt: string
}

export type MatchmakingSuggestion = {
  id: number
  planAId: number
  planBId: number
  teamAId: number
  teamAName: string | null
  teamBId: number
  teamBName: string | null
  startAt: string
  endAt: string
  teamAAvailableCount: number
  teamBAvailableCount: number
  totalAvailableCount: number
  balanceScore: number
  status: string
  members: SuggestionMember[]
  createdAt: string
  updatedAt: string
}

export type MatchRecord = {
  id: number
  matchType: 'INTERNAL' | 'FRIENDLY_MATCH'
  homeTeamId: number | null
  homeTeamName: string | null
  awayTeamId: number | null
  awayTeamName: string | null
  sourcePlanId: number | null
  sourceSuggestionId: number | null
  startAt: string
  endAt: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function searchMemberAvailabilities(params: AnyRecord): Promise<ApiListResult<MemberAvailability>> {
  const response = await axios.get('/api/member-availabilities', {
    params: compactObject(params),
  })

  return extractListResponse<MemberAvailability>(response.data)
}

export async function createMemberAvailability(payload: AnyRecord) {
  const response = await axios.post('/api/member-availabilities', payload)

  return unwrapApiData<MemberAvailability>(response.data)
}

export async function updateMemberAvailability(id: string | number, payload: AnyRecord) {
  const response = await axios.put(`/api/member-availabilities/${id}`, payload)

  return unwrapApiData<MemberAvailability>(response.data)
}

export async function deleteMemberAvailability(id: string | number) {
  await axios.delete(`/api/member-availabilities/${id}`)
}

export async function searchMatchPlans(params: AnyRecord): Promise<ApiListResult<MatchPlan>> {
  const response = await axios.get('/api/match-plans', {
    params: compactObject(params),
  })

  return extractListResponse<MatchPlan>(response.data)
}

export async function createMatchPlan(payload: AnyRecord) {
  const response = await axios.post('/api/match-plans', payload)

  return unwrapApiData<MatchPlan>(response.data)
}

export async function updateMatchPlan(id: string | number, payload: AnyRecord) {
  const response = await axios.put(`/api/match-plans/${id}`, payload)

  return unwrapApiData<MatchPlan>(response.data)
}

export async function deleteMatchPlan(id: string | number) {
  await axios.delete(`/api/match-plans/${id}`)
}

export async function calculateInternalMatchSuggestions(planId: string | number) {
  const response = await axios.post(`/api/internal-match-suggestions/plans/${planId}/calculate`)

  return unwrapApiData<InternalMatchSuggestion[]>(response.data)
}

export async function searchInternalMatchSuggestions(
  params: AnyRecord,
): Promise<ApiListResult<InternalMatchSuggestion>> {
  const response = await axios.get('/api/internal-match-suggestions', {
    params: compactObject(params),
  })

  return extractListResponse<InternalMatchSuggestion>(response.data)
}

export async function selectInternalMatchSuggestion(id: string | number) {
  const response = await axios.post(`/api/internal-match-suggestions/${id}/select`)

  return unwrapApiData<MatchRecord>(response.data)
}

export async function calculateMatchmakingSuggestions(planId: string | number) {
  const response = await axios.post(`/api/matchmaking-suggestions/plans/${planId}/calculate`)

  return unwrapApiData<MatchmakingSuggestion[]>(response.data)
}

export async function searchMatchmakingSuggestions(
  params: AnyRecord,
): Promise<ApiListResult<MatchmakingSuggestion>> {
  const response = await axios.get('/api/matchmaking-suggestions', {
    params: compactObject(params),
  })

  return extractListResponse<MatchmakingSuggestion>(response.data)
}

export async function acceptMatchmakingSuggestion(id: string | number) {
  const response = await axios.post(`/api/matchmaking-suggestions/${id}/accept`)

  return unwrapApiData<MatchRecord>(response.data)
}

export async function rejectMatchmakingSuggestion(id: string | number) {
  const response = await axios.post(`/api/matchmaking-suggestions/${id}/reject`)

  return unwrapApiData<MatchmakingSuggestion>(response.data)
}

export async function searchMatches(params: AnyRecord): Promise<ApiListResult<MatchRecord>> {
  const response = await axios.get('/api/matches', {
    params: compactObject(params),
  })

  return extractListResponse<MatchRecord>(response.data)
}

export async function cancelMatch(id: string | number) {
  const response = await axios.post(`/api/matches/${id}/cancel`)

  return unwrapApiData<MatchRecord>(response.data)
}

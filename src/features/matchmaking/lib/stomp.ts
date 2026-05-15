import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export type MatchmakingSocketEventType =
  | 'SUGGESTIONS_REFRESHED'
  | 'MATCH_ACCEPTED'
  | 'MATCH_REJECTED'

export type MatchmakingSocketMatch = {
  id: number
  sourcePlanId: number | null
  sourceSuggestionId: number | null
  homeTeamId: number | null
  homeTeamName?: string | null
  awayTeamId: number | null
  awayTeamName?: string | null
  startAt: string
  endAt: string
  status: string
}

export type MatchmakingRealtimeEvent = {
  eventType?: MatchmakingSocketEventType | string
  teamId?: number | string
  planId?: number | string
  suggestionCount?: number | null
  refreshRequired?: boolean
  affectedPlanIds?: Array<number | string> | null
  emittedAt?: string
  match?: MatchmakingSocketMatch | null
}

export function getSockJsEndpoint() {
  const configuredUrl = import.meta.env.VITE_WS_URL

  if (typeof configuredUrl === 'string' && configuredUrl.trim()) {
    const normalizedUrl = configuredUrl.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:')

    return normalizedUrl.endsWith('/ws') ? normalizedUrl : `${normalizedUrl.replace(/\/$/, '')}/ws`
  }

  if (import.meta.env.DEV) {
    return '/ws'
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
  const url = new URL(apiBaseUrl)
  url.protocol = url.protocol === 'https:' ? 'https:' : 'http:'
  url.pathname = '/ws'
  url.search = ''
  url.hash = ''

  return url.toString()
}

export function createMatchmakingStompClient(accessToken: string) {
  return new Client({
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    webSocketFactory: () => new SockJS(getSockJsEndpoint()),
    debug: () => {},
  })
}

import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import { App, Badge, Button, Col, Row, Select, Space, Typography } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, PlayCircleOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppTable } from '@/common/components/ui/AppTable'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { useAuth } from '@/common/hooks/useAuth'
import { getErrorMessage } from '@/common/lib/api'
import type { ApiListResult } from '@/common/types/api'
import { formatDateTime } from '@/common/utils/format'
import {
  createMatchmakingStompClient,
  type MatchmakingRealtimeEvent,
} from '@/features/matchmaking/lib/stomp'
import {
  acceptMatchmakingSuggestion,
  cancelMatch,
  calculateMatchmakingSuggestions,
  rejectMatchmakingSuggestion,
  searchMatches,
  searchMatchPlans,
  searchMatchmakingSuggestions,
  type MatchmakingSuggestion,
  type MatchPlan,
  type MatchRecord,
} from '@/features/matches/api/matchApi'

const defaultPageSize = 10

const suggestionStatusOptions = [
  { label: 'SUGGESTED', value: 'SUGGESTED' },
  { label: 'REJECTED', value: 'REJECTED' },
]

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

function toNumericId(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)

    return Number.isNaN(parsed) ? null : parsed
  }

  return null
}

function getSocketStatusBadge(status: SocketStatus) {
  if (status === 'connected') {
    return { label: 'Live sync connected', status: 'success' as const }
  }

  if (status === 'connecting') {
    return { label: 'Connecting live sync', status: 'processing' as const }
  }

  if (status === 'error') {
    return { label: 'Live sync error', status: 'error' as const }
  }

  return { label: 'Live sync offline', status: 'default' as const }
}

function getRealtimeEventSummary(event: MatchmakingRealtimeEvent | null) {
  if (!event?.eventType) {
    return 'Waiting for realtime updates.'
  }

  const planId = toNumericId(event.planId)
  const emittedAt = formatDateTime(event.emittedAt)

  if (event.eventType === 'SUGGESTIONS_REFRESHED') {
    return `Suggestions refreshed for plan #${planId ?? '-'} at ${emittedAt}.`
  }

  if (event.eventType === 'MATCH_ACCEPTED') {
    return `A friendly match was accepted for plan #${planId ?? '-'} at ${emittedAt}.`
  }

  if (event.eventType === 'MATCH_REJECTED') {
    return `A suggestion was rejected for plan #${planId ?? '-'} at ${emittedAt}.`
  }

  return `Received ${event.eventType} at ${emittedAt}.`
}

function upsertMatchResult(
  current: ApiListResult<MatchRecord> | undefined,
  incomingMatch: MatchRecord,
): ApiListResult<MatchRecord> | undefined {
  if (!current) {
    return current
  }

  const nextItems = [...current.items]
  const existingIndex = nextItems.findIndex((item) => item.id === incomingMatch.id)

  if (existingIndex >= 0) {
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...incomingMatch,
    }

    return {
      ...current,
      items: nextItems,
    }
  }

  return {
    items: [incomingMatch, ...nextItems].slice(0, nextItems.length),
    total: current.total + 1,
  }
}

export function MatchmakingPage() {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const { accessToken, user } = useAuth()
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [suggestionStatus, setSuggestionStatus] = useState<string | undefined>(undefined)
  const [suggestionPagination, setSuggestionPagination] = useState({ offset: 0, limit: defaultPageSize })
  const [matchesPagination, setMatchesPagination] = useState({ offset: 0, limit: defaultPageSize })
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected')
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<MatchmakingRealtimeEvent | null>(null)
  const currentTeamId = user?.teamId ?? null
  const effectiveSocketStatus =
    !accessToken || !currentTeamId ? 'disconnected' : socketStatus

  const plansQuery = useQuery({
    queryKey: ['friendly-matches', 'plans'],
    queryFn: () =>
      searchMatchPlans({
        planType: 'MATCHMAKING',
        offset: 0,
        limit: 100,
      }),
  })

  const selectedPlan =
    plansQuery.data?.items.find((plan) => plan.id === selectedPlanId) ??
    null

  const suggestionsQuery = useQuery({
    queryKey: ['friendly-matches', 'suggestions', selectedPlanId, suggestionStatus, suggestionPagination],
    queryFn: () =>
      searchMatchmakingSuggestions({
        planId: selectedPlanId,
        status: suggestionStatus,
        ...suggestionPagination,
      }),
    enabled: Boolean(selectedPlanId),
  })

  const matchesQuery = useQuery({
    queryKey: ['friendly-matches', 'registry', matchesPagination],
    queryFn: () =>
      searchMatches({
        matchType: 'FRIENDLY_MATCH',
        ...matchesPagination,
      }),
  })

  const calculateMutation = useMutation({
    mutationFn: calculateMatchmakingSuggestions,
    onSuccess: (results) => {
      message.success(`Calculated ${results.length} friendly suggestion(s).`)
      void suggestionsQuery.refetch()
      void plansQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const acceptMutation = useMutation({
    mutationFn: acceptMatchmakingSuggestion,
    onSuccess: () => {
      message.success('Accepted matchmaking suggestion and created a friendly match.')
      void suggestionsQuery.refetch()
      void matchesQuery.refetch()
      void plansQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectMatchmakingSuggestion,
    onSuccess: () => {
      message.success('Rejected matchmaking suggestion.')
      void suggestionsQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelMatch,
    onSuccess: (match) => {
      message.success('Cancelled match successfully.')
      void matchesQuery.refetch()
      void plansQuery.refetch()

      if (match.sourcePlanId) {
        startTransition(() => {
          setSelectedPlanId(match.sourcePlanId)
          setSuggestionPagination({ offset: 0, limit: defaultPageSize })
        })
        return
      }

      void suggestionsQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const handleRealtimeEvent = useEffectEvent((payload: MatchmakingRealtimeEvent) => {
    setLastRealtimeEvent(payload)

    if (!payload.refreshRequired) {
      return
    }

    const eventPlanId = toNumericId(payload.planId)

    void queryClient.invalidateQueries({
      queryKey: ['friendly-matches', 'plans'],
    })

    if (
      eventPlanId !== null &&
      selectedPlanId === eventPlanId &&
      (payload.eventType === 'SUGGESTIONS_REFRESHED' || payload.eventType === 'MATCH_REJECTED')
    ) {
      void suggestionsQuery.refetch()
    } else if (payload.eventType === 'SUGGESTIONS_REFRESHED' || payload.eventType === 'MATCH_REJECTED') {
      void queryClient.invalidateQueries({
        queryKey: ['friendly-matches', 'suggestions'],
      })
    }

    if (payload.eventType === 'MATCH_ACCEPTED') {
      const match = payload.match

      if (match) {
        const nextMatch: MatchRecord = {
          id: match.id,
          matchType: 'FRIENDLY_MATCH',
          homeTeamId: match.homeTeamId,
          homeTeamName: match.homeTeamName ?? null,
          awayTeamId: match.awayTeamId,
          awayTeamName: match.awayTeamName ?? null,
          sourcePlanId: match.sourcePlanId,
          sourceSuggestionId: match.sourceSuggestionId,
          startAt: match.startAt,
          endAt: match.endAt,
          status: match.status,
          createdAt: '',
          updatedAt: '',
        }

        queryClient.setQueriesData<ApiListResult<MatchRecord> | undefined>(
          { queryKey: ['friendly-matches', 'registry'] },
          (current) => upsertMatchResult(current, nextMatch),
        )
      }

      if (eventPlanId !== null && selectedPlanId === eventPlanId) {
        void suggestionsQuery.refetch()
      } else {
        void queryClient.invalidateQueries({
          queryKey: ['friendly-matches', 'suggestions'],
        })
      }

      void queryClient.invalidateQueries({
        queryKey: ['friendly-matches', 'registry'],
      })
    }
  })

  const isViewingPlan = (planId: number) => selectedPlanId === planId

  useEffect(() => {
    if (!accessToken || !currentTeamId) {
      return
    }

    const client = createMatchmakingStompClient(accessToken)
    let unsubscribe: (() => void) | null = null

    client.beforeConnect = async () => {
      setSocketStatus('connecting')
    }

    client.onConnect = () => {
      setSocketStatus('connected')
      unsubscribe = client.subscribe(`/topic/matchmaking/team/${currentTeamId}`, (messageFrame) => {
        try {
          handleRealtimeEvent(JSON.parse(messageFrame.body) as MatchmakingRealtimeEvent)
        } catch {
          return
        }
      }).unsubscribe
    }

    client.onStompError = () => {
      setSocketStatus('error')
    }

    client.onWebSocketClose = () => {
      setSocketStatus('disconnected')
    }

    client.activate()

    return () => {
      unsubscribe?.()
      void client.deactivate()
    }
  }, [accessToken, currentTeamId])

  const socketBadge = getSocketStatusBadge(effectiveSocketStatus)

  return (
    <PageContainer
      extra={
        <Space size="middle" wrap>
          <Badge status={socketBadge.status} text={socketBadge.label} />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              void plansQuery.refetch()
              void suggestionsQuery.refetch()
              void matchesQuery.refetch()
            }}
          >
            Refresh
          </Button>
        </Space>
      }
      subtitle="Use MATCHMAKING plans to calculate opponent suggestions, then accept or reject the proposed friendly match slots."
      title="Friendly Match Finder"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AppCard title="Realtime activity">
            <Space direction="vertical" size={4}>
              <Typography.Text>{getRealtimeEventSummary(lastRealtimeEvent)}</Typography.Text>
              {lastRealtimeEvent?.affectedPlanIds?.length ? (
                <Typography.Text type="secondary">
                  Affected plans: {lastRealtimeEvent.affectedPlanIds.join(', ')}
                </Typography.Text>
              ) : null}
            </Space>
          </AppCard>
        </Col>

        <Col span={24}>
          <AppCard title="Matchmaking plans">
            {!plansQuery.data && plansQuery.isPending ? <Loading /> : null}
            {plansQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(plansQuery.error)} title="Cannot load matchmaking plans" />
            ) : null}
            {plansQuery.data ? (
              <AppTable<MatchPlan>
                columns={[
                  { key: 'name', title: 'Name', dataIndex: 'name' },
                  { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: (value) => <StatusTag status={String(value)} /> },
                  {
                    key: 'window',
                    title: 'Window',
                    render: (_value, record) => `${formatDateTime(record.fromAt)} - ${formatDateTime(record.toAt)}`,
                  },
                  { key: 'minPlayers', title: 'Min players', dataIndex: 'minPlayers', width: 120 },
                  {
                    key: 'actions',
                    title: 'Actions',
                    width: 280,
                    render: (_value, record) => (
                      <Space wrap>
                        <Button
                          disabled={isViewingPlan(record.id)}
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setSelectedPlanId(record.id)
                            setSuggestionPagination({ offset: 0, limit: defaultPageSize })
                          }}
                          size="small"
                          type={isViewingPlan(record.id) ? 'primary' : 'default'}
                        >
                          {isViewingPlan(record.id) ? 'Viewing' : 'View Plan'}
                        </Button>
                        <Button
                          icon={<PlayCircleOutlined />}
                          loading={calculateMutation.isPending && selectedPlanId === record.id}
                          onClick={() => {
                            setSelectedPlanId(record.id)
                            calculateMutation.mutate(record.id)
                          }}
                          size="small"
                        >
                          Calculate
                        </Button>
                        {isViewingPlan(record.id) ? <Typography.Text type="secondary">Current plan</Typography.Text> : null}
                      </Space>
                    ),
                  },
                ]}
                dataSource={plansQuery.data.items}
                loading={plansQuery.isFetching}
                pagination={false}
                rowKey="id"
              />
            ) : null}
          </AppCard>
        </Col>

        <Col span={24}>
          <AppCard
            extra={
              <Space wrap>
                <Select
                  allowClear
                  onChange={(value) => {
                    setSuggestionStatus(value)
                    setSuggestionPagination((current) => ({ ...current, offset: 0 }))
                  }}
                  options={suggestionStatusOptions}
                  placeholder="Filter status"
                  style={{ width: 180 }}
                  value={suggestionStatus}
                />
                {selectedPlan ? (
                  <Typography.Text strong>{selectedPlan.name}</Typography.Text>
                ) : (
                  <Typography.Text type="secondary">Choose a plan above to load suggestions.</Typography.Text>
                )}
              </Space>
            }
            title="Friendly suggestions"
          >
            {!selectedPlanId ? <EmptyState description="Select a matchmaking plan first." /> : null}
            {selectedPlanId && !suggestionsQuery.data && suggestionsQuery.isPending ? <Loading /> : null}
            {selectedPlanId && suggestionsQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(suggestionsQuery.error)} title="Cannot load friendly suggestions" />
            ) : null}
            {selectedPlanId && suggestionsQuery.data ? (
              <AppTable<MatchmakingSuggestion>
                columns={[
                  {
                    key: 'teams',
                    title: 'Teams',
                    render: (_value, record) => `${record.teamAName ?? `Team #${record.teamAId}`} vs ${record.teamBName ?? `Team #${record.teamBId}`}`,
                  },
                  {
                    key: 'time',
                    title: 'Time slot',
                    render: (_value, record) => `${formatDateTime(record.startAt)} - ${formatDateTime(record.endAt)}`,
                  },
                  { key: 'totalAvailableCount', title: 'Players', dataIndex: 'totalAvailableCount', width: 90 },
                  { key: 'balanceScore', title: 'Balance', dataIndex: 'balanceScore', width: 90 },
                  { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: (value) => <StatusTag status={String(value)} /> },
                  {
                    key: 'members',
                    title: 'Members',
                    render: (_value, record) =>
                      record.members.length
                        ? `${record.members.map((member) => member.userName).slice(0, 3).join(', ')}${record.members.length > 3 ? ` +${record.members.length - 3}` : ''}`
                        : '-',
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    width: 160,
                    render: (_value, record) => (
                      <Space>
                        <Button
                          icon={<CheckOutlined />}
                          loading={acceptMutation.isPending}
                          onClick={() => acceptMutation.mutate(record.id)}
                          size="small"
                          type="primary"
                        >
                          Accept
                        </Button>
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          loading={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(record.id)}
                          size="small"
                        >
                          Reject
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={suggestionsQuery.data.items}
                loading={suggestionsQuery.isFetching}
                pagination={{
                  current: Math.floor(suggestionPagination.offset / suggestionPagination.limit) + 1,
                  pageSize: suggestionPagination.limit,
                  pageSizeOptions: [10, 20, 50, 100],
                  showSizeChanger: true,
                  total: suggestionsQuery.data.total,
                  onChange: (page, pageSize) => {
                    setSuggestionPagination({
                      offset: (page - 1) * pageSize,
                      limit: pageSize,
                    })
                  },
                }}
                rowKey="id"
              />
            ) : null}
          </AppCard>
        </Col>

        <Col span={24}>
          <AppCard title="Scheduled friendly matches">
            {!matchesQuery.data && matchesQuery.isPending ? <Loading /> : null}
            {matchesQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(matchesQuery.error)} title="Cannot load friendly matches" />
            ) : null}
            {matchesQuery.data ? (
              <AppTable<MatchRecord>
                columns={[
                  { key: 'id', title: 'Match ID', dataIndex: 'id', width: 100 },
                  {
                    key: 'teams',
                    title: 'Teams',
                    render: (_value, record) => `${record.homeTeamName ?? `Team #${record.homeTeamId}`} vs ${record.awayTeamName ?? `Team #${record.awayTeamId}`}`,
                  },
                  {
                    key: 'time',
                    title: 'Time slot',
                    render: (_value, record) => `${formatDateTime(record.startAt)} - ${formatDateTime(record.endAt)}`,
                  },
                  { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: (value) => <StatusTag status={String(value)} /> },
                  {
                    key: 'actions',
                    title: 'Actions',
                    width: 120,
                    render: (_value, record) => (
                      <Button
                        danger
                        disabled={record.status === 'CANCELLED'}
                        icon={<StopOutlined />}
                        loading={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(record.id)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    ),
                  },
                ]}
                dataSource={matchesQuery.data.items}
                loading={matchesQuery.isFetching}
                pagination={{
                  current: Math.floor(matchesPagination.offset / matchesPagination.limit) + 1,
                  pageSize: matchesPagination.limit,
                  pageSizeOptions: [10, 20, 50, 100],
                  showSizeChanger: true,
                  total: matchesQuery.data.total,
                  onChange: (page, pageSize) => {
                    setMatchesPagination({
                      offset: (page - 1) * pageSize,
                      limit: pageSize,
                    })
                  },
                }}
                rowKey="id"
              />
            ) : null}
          </AppCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

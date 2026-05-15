import { useState } from 'react'
import { App, Button, Col, Row, Select, Space, Typography } from 'antd'
import { CheckOutlined, EyeOutlined, PlayCircleOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppTable } from '@/common/components/ui/AppTable'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { getErrorMessage } from '@/common/lib/api'
import { formatDateTime } from '@/common/utils/format'
import {
  cancelMatch,
  calculateInternalMatchSuggestions,
  searchInternalMatchSuggestions,
  searchMatches,
  searchMatchPlans,
  selectInternalMatchSuggestion,
  type InternalMatchSuggestion,
  type MatchPlan,
  type MatchRecord,
} from '@/features/matches/api/matchApi'

const defaultPageSize = 10

const suggestionStatusOptions = [
  { label: 'SUGGESTED', value: 'SUGGESTED' },
  { label: 'SELECTED', value: 'SELECTED' },
]

export function MatchesPage() {
  const { message } = App.useApp()
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [suggestionStatus, setSuggestionStatus] = useState<string | undefined>(undefined)
  const [suggestionPagination, setSuggestionPagination] = useState({ offset: 0, limit: defaultPageSize })
  const [matchesPagination, setMatchesPagination] = useState({ offset: 0, limit: defaultPageSize })

  const plansQuery = useQuery({
    queryKey: ['internal-matches', 'plans'],
    queryFn: () =>
      searchMatchPlans({
        planType: 'INTERNAL',
        offset: 0,
        limit: 100,
      }),
  })

  const selectedPlan =
    plansQuery.data?.items.find((plan) => plan.id === selectedPlanId) ??
    null

  const suggestionsQuery = useQuery({
    queryKey: ['internal-matches', 'suggestions', selectedPlanId, suggestionStatus, suggestionPagination],
    queryFn: () =>
      searchInternalMatchSuggestions({
        planId: selectedPlanId,
        status: suggestionStatus,
        ...suggestionPagination,
      }),
    enabled: Boolean(selectedPlanId),
  })

  const matchesQuery = useQuery({
    queryKey: ['internal-matches', 'registry', matchesPagination],
    queryFn: () =>
      searchMatches({
        matchType: 'INTERNAL',
        ...matchesPagination,
      }),
  })

  const calculateMutation = useMutation({
    mutationFn: calculateInternalMatchSuggestions,
    onSuccess: (results) => {
      message.success(`Calculated ${results.length} internal suggestion(s).`)
      void suggestionsQuery.refetch()
      void plansQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const selectMutation = useMutation({
    mutationFn: selectInternalMatchSuggestion,
    onSuccess: () => {
      message.success('Selected internal suggestion and created a match.')
      void suggestionsQuery.refetch()
      void matchesQuery.refetch()
      void plansQuery.refetch()
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
        setSelectedPlanId(match.sourcePlanId)
        setSuggestionPagination({ offset: 0, limit: defaultPageSize })
      }

      void suggestionsQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const isViewingPlan = (planId: number) => selectedPlanId === planId

  return (
    <PageContainer
      extra={
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
      }
      subtitle="Use INTERNAL plans to calculate the best internal match slots, then select the suggestion that should become a scheduled match."
      title="Internal Match Finder"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AppCard title="Internal plans">
            {!plansQuery.data && plansQuery.isPending ? <Loading /> : null}
            {plansQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(plansQuery.error)} title="Cannot load internal plans" />
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
            title="Internal suggestions"
          >
            {!selectedPlanId ? <EmptyState description="Select an internal plan first." /> : null}
            {selectedPlanId && !suggestionsQuery.data && suggestionsQuery.isPending ? <Loading /> : null}
            {selectedPlanId && suggestionsQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(suggestionsQuery.error)} title="Cannot load internal suggestions" />
            ) : null}
            {selectedPlanId && suggestionsQuery.data ? (
              <AppTable<InternalMatchSuggestion>
                columns={[
                  {
                    key: 'rankOrder',
                    title: 'Rank',
                    dataIndex: 'rankOrder',
                    width: 80,
                  },
                  {
                    key: 'time',
                    title: 'Time slot',
                    render: (_value, record) => `${formatDateTime(record.startAt)} - ${formatDateTime(record.endAt)}`,
                  },
                  { key: 'availableCount', title: 'Available', dataIndex: 'availableCount', width: 110 },
                  { key: 'absentCount', title: 'Absent', dataIndex: 'absentCount', width: 90 },
                  { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: (value) => <StatusTag status={String(value)} /> },
                  {
                    key: 'members',
                    title: 'Members',
                    render: (_value, record) =>
                      record.members.length
                        ? `${record.members.filter((member) => member.availabilityStatus === 'AVAILABLE').map((member) => member.userName).slice(0, 3).join(', ')}${record.members.length > 3 ? ` +${record.members.length - 3}` : ''}`
                        : '-',
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    width: 120,
                    render: (_value, record) => (
                      <Button
                        icon={<CheckOutlined />}
                        loading={selectMutation.isPending}
                        onClick={() => selectMutation.mutate(record.id)}
                        size="small"
                        type="primary"
                      >
                        Select
                      </Button>
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
          <AppCard title="Scheduled internal matches">
            {!matchesQuery.data && matchesQuery.isPending ? <Loading /> : null}
            {matchesQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(matchesQuery.error)} title="Cannot load internal matches" />
            ) : null}
            {matchesQuery.data ? (
              <AppTable<MatchRecord>
                columns={[
                  { key: 'id', title: 'Match ID', dataIndex: 'id', width: 100 },
                  {
                    key: 'time',
                    title: 'Time slot',
                    render: (_value, record) => `${formatDateTime(record.startAt)} - ${formatDateTime(record.endAt)}`,
                  },
                  { key: 'sourcePlanId', title: 'Plan ID', dataIndex: 'sourcePlanId', width: 100 },
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

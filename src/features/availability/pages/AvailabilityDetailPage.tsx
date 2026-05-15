import { useState } from 'react'
import dayjs from 'dayjs'
import { App, Button, DatePicker, Flex, Form, Input, Row, Col, Select, Space, Typography } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppModal } from '@/common/components/ui/AppModal'
import { AppTable } from '@/common/components/ui/AppTable'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { getErrorMessage } from '@/common/lib/api'
import { formatDateTime } from '@/common/utils/format'
import { fetchRemoteOptions } from '@/features/admin/api/resourceApi'
import {
  createMemberAvailability,
  deleteMemberAvailability,
  searchMatchPlans,
  searchMemberAvailabilities,
  updateMemberAvailability,
  type MemberAvailability,
} from '@/features/matches/api/matchApi'

type AvailabilityFilters = {
  teamMemberId?: number
}

const defaultPageSize = 10

function toApiDateTime(value: dayjs.Dayjs) {
  return value.format('YYYY-MM-DDTHH:mm:ss')
}

export function AvailabilityDetailPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const { planId } = useParams()
  const numericPlanId = Number(planId)
  const isValidPlanId = Number.isFinite(numericPlanId)
  const [availabilitySearchForm] = Form.useForm()
  const [availabilityEditorForm] = Form.useForm()
  const [availabilityFilters, setAvailabilityFilters] = useState<AvailabilityFilters>({})
  const [availabilityPagination, setAvailabilityPagination] = useState({ offset: 0, limit: defaultPageSize })
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [selectedAvailability, setSelectedAvailability] = useState<MemberAvailability | null>(null)

  const teamMemberOptionsQuery = useQuery({
    queryKey: ['match-planning', 'team-member-options'],
    queryFn: () => fetchRemoteOptions('/api/team-members', { offset: 0, limit: 999 }),
  })

  const planQuery = useQuery({
    queryKey: ['match-planning', 'match-plan-detail', numericPlanId],
    queryFn: async () => {
      const response = await searchMatchPlans({
        id: numericPlanId,
        offset: 0,
        limit: 1,
      })

      return response.items[0] ?? null
    },
    enabled: isValidPlanId,
  })

  const availabilityQuery = useQuery({
    queryKey: ['match-planning', 'member-availabilities', numericPlanId, availabilityFilters, availabilityPagination],
    queryFn: () =>
      searchMemberAvailabilities({
        planId: numericPlanId,
        ...availabilityFilters,
        ...availabilityPagination,
      }),
    enabled: isValidPlanId,
  })

  const createAvailabilityMutation = useMutation({
    mutationFn: createMemberAvailability,
    onSuccess: () => {
      message.success('Created member availability successfully.')
      setIsAvailabilityModalOpen(false)
      availabilityEditorForm.resetFields()
      void availabilityQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateMemberAvailability(id, payload),
    onSuccess: () => {
      message.success('Updated member availability successfully.')
      setIsAvailabilityModalOpen(false)
      availabilityEditorForm.resetFields()
      setSelectedAvailability(null)
      void availabilityQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: number) => deleteMemberAvailability(id),
    onSuccess: () => {
      message.success('Deleted member availability successfully.')
      void availabilityQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const openCreateAvailabilityModal = () => {
    availabilityEditorForm.resetFields()
    availabilityEditorForm.setFieldsValue({
      planId: numericPlanId,
    })
    setSelectedAvailability(null)
    setIsAvailabilityModalOpen(true)
  }

  const openEditAvailabilityModal = (record: MemberAvailability) => {
    setSelectedAvailability(record)
    availabilityEditorForm.setFieldsValue({
      planId: record.planId,
      teamMemberId: record.teamMemberId,
      availableFrom: dayjs(record.availableFrom),
      availableTo: dayjs(record.availableTo),
    })
    setIsAvailabilityModalOpen(true)
  }

  const handleAvailabilitySubmit = async () => {
    const values = await availabilityEditorForm.validateFields()
    const payload = {
      planId: numericPlanId,
      teamMemberId: values.teamMemberId,
      availableFrom: toApiDateTime(values.availableFrom),
      availableTo: toApiDateTime(values.availableTo),
    }

    if (selectedAvailability) {
      await updateAvailabilityMutation.mutateAsync({
        id: selectedAvailability.id,
        payload,
      })
      return
    }

    await createAvailabilityMutation.mutateAsync(payload)
  }

  if (!isValidPlanId) {
    return (
      <PageContainer
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/match-plans')}>
            Back to plans
          </Button>
        }
        title="Plan Detail"
      >
        <ErrorState title="Invalid plan id" />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      extra={
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/match-plans')}>
            Back to plans
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              void planQuery.refetch()
              void availabilityQuery.refetch()
            }}
          >
            Refresh
          </Button>
        </Space>
      }
      title="Plan Detail"
    >
      {!planQuery.data && planQuery.isPending ? <Loading /> : null}
      {planQuery.isError ? (
        <ErrorState subTitle={getErrorMessage(planQuery.error)} title="Cannot load match plan" />
      ) : null}
      {planQuery.data ? (
        <AppCard title={planQuery.data.name}>
          <Space direction="vertical" size={8} style={{ display: 'flex' }}>
            <Typography.Text type="secondary">
              {planQuery.data.description || 'No description'}
            </Typography.Text>
            <Space wrap>
              <StatusTag status={planQuery.data.planType} />
              <StatusTag status={planQuery.data.status} />
              <Typography.Text>Window: {formatDateTime(planQuery.data.fromAt)} - {formatDateTime(planQuery.data.toAt)}</Typography.Text>
              <Typography.Text>Min players: {planQuery.data.minPlayers}</Typography.Text>
            </Space>
          </Space>
        </AppCard>
      ) : null}

      <AppCard
        extra={
          <Button icon={<PlusOutlined />} onClick={openCreateAvailabilityModal} type="primary">
            Add availability
          </Button>
        }
        title="Member availability"
      >
        <Form
          form={availabilitySearchForm}
          layout="vertical"
          onFinish={(values) => {
            setAvailabilityFilters(values)
            setAvailabilityPagination((current) => ({ ...current, offset: 0 }))
          }}
        >
          <Row gutter={[16, 8]}>
            <Col lg={8} md={12} xs={24}>
              <Form.Item label="Team member" name="teamMemberId">
                <Select
                  allowClear
                  loading={teamMemberOptionsQuery.isFetching}
                  optionFilterProp="label"
                  options={(teamMemberOptionsQuery.data ?? []).map((record) => ({
                    label: String(record.userName ?? record.fullName ?? record.name ?? record.id),
                    value: record.id,
                  }))}
                  placeholder="Select team member"
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Flex gap={12} justify="flex-end" wrap="wrap">
                <Button
                  onClick={() => {
                    availabilitySearchForm.resetFields()
                    setAvailabilityFilters({})
                    setAvailabilityPagination({ offset: 0, limit: defaultPageSize })
                  }}
                >
                  Reset
                </Button>
                <Button htmlType="submit" icon={<SearchOutlined />} type="primary">
                  Search
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>

        {!availabilityQuery.data && availabilityQuery.isPending ? <Loading /> : null}
        {availabilityQuery.isError ? (
          <ErrorState subTitle={getErrorMessage(availabilityQuery.error)} title="Cannot load member availability" />
        ) : null}
        {availabilityQuery.data ? (
          <AppTable<MemberAvailability>
            columns={[
              {
                key: 'stt',
                title: 'STT',
                width: 72,
                render: (_value, _record, index) => availabilityPagination.offset + index + 1,
              },
              { key: 'userName', title: 'User name', dataIndex: 'userName' },
              {
                key: 'availableFrom',
                title: 'Available from',
                dataIndex: 'availableFrom',
                render: (value) => formatDateTime(value),
              },
              {
                key: 'availableTo',
                title: 'Available to',
                dataIndex: 'availableTo',
                render: (value) => formatDateTime(value),
              },
              {
                key: 'actions',
                title: 'Actions',
                width: 120,
                render: (_value, record) => (
                  <Flex gap={4}>
                    <Button icon={<EditOutlined />} onClick={() => openEditAvailabilityModal(record)} size="small" type="text" />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        modal.confirm({
                          title: 'Delete member availability',
                          content: 'This availability window will be removed.',
                          okButtonProps: { danger: true, loading: deleteAvailabilityMutation.isPending },
                          onOk: async () => {
                            await deleteAvailabilityMutation.mutateAsync(record.id)
                          },
                        })
                      }}
                      size="small"
                      type="text"
                    />
                  </Flex>
                ),
              },
            ]}
            dataSource={availabilityQuery.data.items}
            loading={availabilityQuery.isFetching}
            pagination={{
              current: Math.floor(availabilityPagination.offset / availabilityPagination.limit) + 1,
              pageSize: availabilityPagination.limit,
              pageSizeOptions: [10, 20, 50, 100],
              showSizeChanger: true,
              total: availabilityQuery.data.total,
              onChange: (page, pageSize) => {
                setAvailabilityPagination({
                  offset: (page - 1) * pageSize,
                  limit: pageSize,
                })
              },
            }}
            rowKey="id"
          />
        ) : null}
      </AppCard>

      <AppModal
        onCancel={() => {
          setIsAvailabilityModalOpen(false)
          setSelectedAvailability(null)
        }}
        open={isAvailabilityModalOpen}
        title={selectedAvailability ? 'Edit member availability' : 'Create member availability'}
      >
        <Form form={availabilityEditorForm} layout="vertical">
          <Form.Item hidden name="planId">
            <Input />
          </Form.Item>
          <Form.Item label="Plan">
            <Input disabled value={planQuery.data ? `${planQuery.data.name} (#${planQuery.data.id})` : ''} />
          </Form.Item>
          <Form.Item label="Team member" name="teamMemberId" rules={[{ required: true, message: 'Please select a team member.' }]}>
            <Select
              loading={teamMemberOptionsQuery.isFetching}
              optionFilterProp="label"
              options={(teamMemberOptionsQuery.data ?? []).map((record) => ({
                label: String(record.userName ?? record.fullName ?? record.name ?? record.id),
                value: record.id,
              }))}
              placeholder="Select team member"
              showSearch
            />
          </Form.Item>
          <Form.Item label="Available from" name="availableFrom" rules={[{ required: true, message: 'Please choose available from.' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Available to" name="availableTo" rules={[{ required: true, message: 'Please choose available to.' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Flex gap={12} justify="flex-end">
            <Button onClick={() => setIsAvailabilityModalOpen(false)}>Cancel</Button>
            <Button
              loading={createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending}
              onClick={handleAvailabilitySubmit}
              type="primary"
            >
              {selectedAvailability ? 'Save' : 'Create'}
            </Button>
          </Flex>
        </Form>
      </AppModal>
    </PageContainer>
  )
}

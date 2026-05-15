import { useState } from 'react'
import dayjs from 'dayjs'
import { App, Button, Col, DatePicker, Flex, Form, Input, InputNumber, Row, Select, Space, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppModal } from '@/common/components/ui/AppModal'
import { AppTable } from '@/common/components/ui/AppTable'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { getErrorMessage } from '@/common/lib/api'
import { formatDateTime } from '@/common/utils/format'
import {
  createMatchPlan,
  deleteMatchPlan,
  searchMatchPlans,
  updateMatchPlan,
  type MatchPlan,
} from '@/features/matches/api/matchApi'

type PlanFilters = {
  planType?: string
  status?: string
}

const defaultPageSize = 10

const planTypeOptions = [
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'Matchmaking', value: 'MATCHMAKING' },
]

const planStatusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'CALCULATED', value: 'CALCULATED' },
  { label: 'SEARCHING', value: 'SEARCHING' },
  { label: 'MATCHED', value: 'MATCHED' },
  { label: 'CANCELLED', value: 'CANCELLED' },
  { label: 'EXPIRED', value: 'EXPIRED' },
]

function toApiDateTime(value: dayjs.Dayjs) {
  return value.format('YYYY-MM-DDTHH:mm:ss')
}

export function AvailabilityPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const [planSearchForm] = Form.useForm()
  const [planEditorForm] = Form.useForm()
  const [planFilters, setPlanFilters] = useState<PlanFilters>({})
  const [planPagination, setPlanPagination] = useState({ offset: 0, limit: defaultPageSize })
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MatchPlan | null>(null)

  const planQuery = useQuery({
    queryKey: ['match-planning', 'match-plans', planFilters, planPagination],
    queryFn: () =>
      searchMatchPlans({
        ...planFilters,
        ...planPagination,
      }),
  })

  const createPlanMutation = useMutation({
    mutationFn: createMatchPlan,
    onSuccess: () => {
      message.success('Created match plan successfully.')
      setIsPlanModalOpen(false)
      planEditorForm.resetFields()
      void planQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateMatchPlan(id, payload),
    onSuccess: () => {
      message.success('Updated match plan successfully.')
      setIsPlanModalOpen(false)
      planEditorForm.resetFields()
      setSelectedPlan(null)
      void planQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => deleteMatchPlan(id),
    onSuccess: () => {
      message.success('Deleted match plan successfully.')
      void planQuery.refetch()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const openCreatePlanModal = () => {
    setSelectedPlan(null)
    planEditorForm.resetFields()
    planEditorForm.setFieldsValue({
      planType: 'INTERNAL',
      durationMinutes: 120,
      stepMinutes: 30,
      minPlayers: 10,
    })
    setIsPlanModalOpen(true)
  }

  const openEditPlanModal = (record: MatchPlan) => {
    setSelectedPlan(record)
    planEditorForm.setFieldsValue({
      ...record,
      fromAt: dayjs(record.fromAt),
      toAt: dayjs(record.toAt),
    })
    setIsPlanModalOpen(true)
  }

  const handlePlanSubmit = async () => {
    const values = await planEditorForm.validateFields()
    const payload = {
      name: values.name,
      description: values.description,
      planType: values.planType,
      fromAt: toApiDateTime(values.fromAt),
      toAt: toApiDateTime(values.toAt),
      durationMinutes: values.durationMinutes,
      stepMinutes: values.stepMinutes,
      minPlayers: values.minPlayers,
      ...(selectedPlan ? { status: values.status } : {}),
    }

    if (selectedPlan) {
      await updatePlanMutation.mutateAsync({
        id: selectedPlan.id,
        payload,
      })
      return
    }

    await createPlanMutation.mutateAsync(payload)
  }

  return (
    <PageContainer
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            void planQuery.refetch()
          }}
        >
          Refresh
        </Button>
      }
      title="Match Planning"
    >
      <AppCard
        extra={
          <Button icon={<PlusOutlined />} onClick={openCreatePlanModal} type="primary">
            Add plan
          </Button>
        }
        title="Match plans"
      >
        <Form
          form={planSearchForm}
          layout="vertical"
          onFinish={(values) => {
            setPlanFilters(values)
            setPlanPagination((current) => ({ ...current, offset: 0 }))
          }}
        >
          <Row gutter={[16, 8]}>
            <Col lg={8} md={12} xs={24}>
              <Form.Item label="Plan type" name="planType">
                <Select allowClear options={planTypeOptions} placeholder="Select plan type" />
              </Form.Item>
            </Col>
            <Col lg={8} md={12} xs={24}>
              <Form.Item label="Status" name="status">
                <Select allowClear options={planStatusOptions} placeholder="Select status" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Flex gap={12} justify="flex-end" wrap="wrap">
                <Button
                  onClick={() => {
                    planSearchForm.resetFields()
                    setPlanFilters({})
                    setPlanPagination({ offset: 0, limit: defaultPageSize })
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

        {!planQuery.data && planQuery.isPending ? <Loading /> : null}
        {planQuery.isError ? (
          <ErrorState subTitle={getErrorMessage(planQuery.error)} title="Cannot load match plans" />
        ) : null}
        {planQuery.data ? (
          <AppTable<MatchPlan>
            columns={[
              {
                key: 'stt',
                title: 'STT',
                width: 72,
                render: (_value, _record, index) => planPagination.offset + index + 1,
              },
              { key: 'name', title: 'Name', dataIndex: 'name' },
              { key: 'planType', title: 'Plan type', dataIndex: 'planType', render: (value) => <StatusTag status={String(value)} /> },
              {
                key: 'window',
                title: 'Window',
                render: (_value, record) => `${formatDateTime(record.fromAt)} - ${formatDateTime(record.toAt)}`,
              },
              { key: 'minPlayers', title: 'Min players', dataIndex: 'minPlayers', width: 120 },
              { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: (value) => <StatusTag status={String(value)} /> },
              {
                key: 'actions',
                title: 'Actions',
                width: 120,
                render: (_value, record) => (
                  <Space size={4}>
                    <Tooltip title="View plan">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/match-plans/${record.id}`)}
                        size="small"
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title="Edit plan">
                      <Button icon={<EditOutlined />} onClick={() => openEditPlanModal(record)} size="small" type="text" />
                    </Tooltip>
                    <Tooltip title="Delete plan">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          modal.confirm({
                            title: 'Delete match plan',
                            content: 'This plan will be removed.',
                            okButtonProps: { danger: true, loading: deletePlanMutation.isPending },
                            onOk: async () => {
                              await deletePlanMutation.mutateAsync(record.id)
                            },
                          })
                        }}
                        size="small"
                        type="text"
                      />
                    </Tooltip>
                  </Space>
                ),
              },
            ]}
            dataSource={planQuery.data.items}
            loading={planQuery.isFetching}
            pagination={{
              current: Math.floor(planPagination.offset / planPagination.limit) + 1,
              pageSize: planPagination.limit,
              pageSizeOptions: [10, 20, 50, 100],
              showSizeChanger: true,
              total: planQuery.data.total,
              onChange: (page, pageSize) => {
                setPlanPagination({
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
          setIsPlanModalOpen(false)
          setSelectedPlan(null)
        }}
        open={isPlanModalOpen}
        title={selectedPlan ? 'Edit match plan' : 'Create match plan'}
      >
        <Form form={planEditorForm} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Plan type" name="planType" rules={[{ required: true, message: 'Please select a plan type.' }]}>
            <Select options={planTypeOptions} />
          </Form.Item>
          <Row gutter={[16, 8]}>
            <Col md={12} xs={24}>
              <Form.Item label="From at" name="fromAt" rules={[{ required: true, message: 'Please choose from at.' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="To at" name="toAt" rules={[{ required: true, message: 'Please choose to at.' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col md={8} xs={24}>
              <Form.Item label="Duration minutes" name="durationMinutes" rules={[{ required: true, message: 'Please enter duration.' }]}>
                <InputNumber min={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col md={8} xs={24}>
              <Form.Item label="Step minutes" name="stepMinutes" rules={[{ required: true, message: 'Please enter step.' }]}>
                <InputNumber min={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col md={8} xs={24}>
              <Form.Item label="Min players" name="minPlayers" rules={[{ required: true, message: 'Please enter min players.' }]}>
                <InputNumber min={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          {selectedPlan ? (
            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status.' }]}>
              <Select options={planStatusOptions} />
            </Form.Item>
          ) : null}
          <Flex gap={12} justify="flex-end">
            <Button onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
            <Button loading={createPlanMutation.isPending || updatePlanMutation.isPending} onClick={handlePlanSubmit} type="primary">
              {selectedPlan ? 'Save' : 'Create'}
            </Button>
          </Flex>
        </Form>
      </AppModal>
    </PageContainer>
  )
}

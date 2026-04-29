import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppModal } from '@/common/components/ui/AppModal'
import { AppTable } from '@/common/components/ui/AppTable'
import { getErrorMessage } from '@/common/lib/api'
import type { ApiListResult, AnyRecord } from '@/common/types/api'
import {
  createResource,
  deleteResource,
  fetchRemoteOptions,
  searchResource,
  updateResource,
} from '@/features/admin/api/resourceApi'
import type {
  FormField,
  RemoteSelectSource,
  ResourceConfig,
  ResourceRecord,
  SearchField,
} from '@/features/admin/types'

type CrudResourcePageProps = {
  config: ResourceConfig
}

type EditorMode = 'create' | 'edit'

function normalizeIdValue(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return value
    }

    const asNumber = Number(trimmed)

    return Number.isNaN(asNumber) ? value : asNumber
  }

  return value
}

function normalizeFieldValue(field: FormField, value: unknown) {
  if (field.type === 'datetime') {
    return dayjs.isDayjs(value) ? value.toISOString() : value
  }

  const looksLikeIdField = field.name.endsWith('Id') || field.name.endsWith('Ids')

  if (!looksLikeIdField) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(normalizeIdValue)
  }

  return normalizeIdValue(value)
}

function getRecordId(config: ResourceConfig, record: ResourceRecord) {
  return config.getRecordId?.(record) ?? record.id
}

function buildSearchParams(values: AnyRecord) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

function getVisibleFormFields(config: ResourceConfig, mode: EditorMode) {
  return config.formFields.filter((field) => {
    if (mode === 'create' && field.hiddenOnCreate) {
      return false
    }

    if (mode === 'edit' && field.hiddenOnEdit) {
      return false
    }

    return true
  })
}

function buildPayload(fields: FormField[], values: AnyRecord) {
  const payload: AnyRecord = {}

  for (const field of fields) {
    if (field.disabledWhen?.(values)) {
      continue
    }

    const rawValue = values[field.name]

    if ((rawValue === '' || rawValue === undefined) && field.emptyValue === undefined) {
      continue
    }

    if ((rawValue === '' || rawValue === undefined) && field.emptyValue !== undefined) {
      payload[field.name] = field.emptyValue
      continue
    }

    payload[field.name] = normalizeFieldValue(field, rawValue)
  }

  return payload
}

function buildInitialValues(config: ResourceConfig, record: ResourceRecord | null) {
  const values: AnyRecord = {
    ...(config.getInitialFormValues?.() ?? {}),
  }

  if (!record) {
    return values
  }

  for (const field of config.formFields) {
    const rawValue = field.getInitialValue ? field.getInitialValue(record) : record[field.name]

    if (field.type === 'datetime' && rawValue) {
      values[field.name] = dayjs(String(rawValue))
      continue
    }

    values[field.name] = rawValue
  }

  return values
}

function isFieldDisabled(field: FormField, values: AnyRecord) {
  return field.disabledWhen?.(values) ?? false
}

function RemoteSelectField({
  source,
  multiple,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  source: RemoteSelectSource
  multiple?: boolean
  placeholder?: string
  value?: unknown
  onChange?: (nextValue: unknown) => void
  disabled?: boolean
}) {
  const optionsQuery = useQuery({
    queryKey: ['remote-options', source.queryKey, source.params],
    queryFn: () => fetchRemoteOptions(source.path, source.params),
  })

  return (
    <Select
      allowClear={!multiple}
      loading={optionsQuery.isFetching}
      mode={multiple ? 'multiple' : undefined}
      optionFilterProp="label"
      options={(optionsQuery.data ?? []).map((record) => ({
        label: source.label(record),
        value: normalizeIdValue(source.valuePath ? record[source.valuePath] : record.id),
      }))}
      placeholder={placeholder ?? 'Select an option'}
      filterOption={(input, option) =>
        String(option?.label ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      onChange={onChange}
      showSearch
      disabled={disabled}
      value={value as string | number | Array<string | number> | undefined}
    />
  )
}

function renderSearchField(field: SearchField) {
  if (field.type === 'number') {
    return <InputNumber min={0} placeholder={field.placeholder ?? `Search ${field.label.toLowerCase()}`} style={{ width: '100%' }} />
  }

  if (field.type === 'remote-select' && field.remote) {
    return (
      <RemoteSelectField
        multiple={field.multiple}
        placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
        source={field.remote}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <Select
        allowClear
        options={field.options}
        placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
      />
    )
  }

  return <Input placeholder={field.placeholder ?? `Search ${field.label.toLowerCase()}`} />
}

function renderFormField(field: FormField) {
  if (field.type === 'textarea') {
    return <Input.TextArea disabled={field.disabled} placeholder={field.placeholder} rows={4} />
  }

  if (field.type === 'password') {
    return <Input.Password disabled={field.disabled} placeholder={field.placeholder} />
  }

  if (field.type === 'email' || field.type === 'tel' || field.type === 'text') {
    return (
      <Input
        disabled={field.disabled}
        placeholder={field.placeholder}
        type={field.type === 'text' ? 'text' : field.type}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <InputNumber
        disabled={field.disabled}
        min={field.min}
        placeholder={field.placeholder}
        precision={field.precision}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <Select
        allowClear={!field.multiple}
        disabled={field.disabled}
        mode={field.multiple ? 'multiple' : undefined}
        options={field.options}
        placeholder={field.placeholder}
      />
    )
  }

  if (field.type === 'switch') {
    return <Switch disabled={field.disabled} />
  }

  if (field.type === 'datetime') {
    return <DatePicker disabled={field.disabled} showTime style={{ width: '100%' }} />
  }

  return <Input disabled={field.disabled} placeholder={field.placeholder} />
}

function isIdColumn(column: { key?: React.Key; dataIndex?: unknown }) {
  if (column.key === 'id') {
    return true
  }

  if (typeof column.dataIndex === 'string' && column.dataIndex === 'id') {
    return true
  }

  return false
}

export function CrudResourcePage({ config }: CrudResourcePageProps) {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()
  const [editorForm] = Form.useForm()
  const [filters, setFilters] = useState<AnyRecord>({})
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: config.pageSize ?? 10,
  })
  const [listData, setListData] = useState<ApiListResult<ResourceRecord> | null>(null)
  const [listError, setListError] = useState<unknown>(null)
  const [isListLoading, setIsListLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ResourceRecord | null>(null)
  const editorValues = Form.useWatch([], editorForm) ?? {}

  useEffect(() => {
    let isCancelled = false

    const loadList = async () => {
      setIsListLoading(true)
      setListError(null)

      try {
        const response = await searchResource(config, {
          ...filters,
          ...pagination,
        })

        if (isCancelled) {
          return
        }

        setListData(response)
      } catch (error) {
        if (isCancelled) {
          return
        }

        setListError(error)
      } finally {
        if (!isCancelled) {
          setIsListLoading(false)
        }
      }
    }

    void loadList()

    return () => {
      isCancelled = true
    }
  }, [config, filters, pagination, reloadKey])

  const createMutation = useMutation({
    mutationFn: (payload: AnyRecord) => createResource(config, payload),
    onSuccess: (created) => {
      if (Array.isArray(created)) {
        const batchLabel = config.batchCreateLabel ?? `${config.singularLabel}s`
        message.success(`Created ${created.length} ${batchLabel} successfully.`)
      } else {
        message.success(`Created ${config.singularLabel} successfully.`)
      }

      setReloadKey((current) => current + 1)
      setIsModalOpen(false)
      editorForm.resetFields()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: AnyRecord }) =>
      updateResource(config, id, payload),
    onSuccess: () => {
      message.success(`Updated ${config.singularLabel} successfully.`)
      setReloadKey((current) => current + 1)
      setIsModalOpen(false)
      editorForm.resetFields()
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteResource(config, id),
    onSuccess: () => {
      message.success(`Deleted ${config.singularLabel} successfully.`)
      setReloadKey((current) => current + 1)
    },
    onError: (error) => {
      message.error(getErrorMessage(error))
    },
  })

  const canCreate = config.allowCreate ?? config.formFields.length > 0
  const canUpdate = config.allowUpdate ?? config.formFields.length > 0
  const canDelete = config.allowDelete ?? true
  const visibleFields = getVisibleFormFields(config, editorMode)

  const columns = [
    {
      key: 'stt',
      title: 'STT',
      width: 80,
      align: 'center' as const,
      render: (_value: unknown, _record: ResourceRecord, index: number) =>
        pagination.offset + index + 1,
    },
    ...config.columns.filter((column) => !isIdColumn(column)),
    ...(canUpdate || canDelete
      ? [
          {
            key: 'actions',
            title: 'Actions',
            width: 96,
            align: 'center' as const,
            render: (_value: unknown, record: ResourceRecord) => {
              const id = getRecordId(config, record)

              return (
                <Space size={4}>
                  {canUpdate ? (
                    <Tooltip title="Edit">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditorMode('edit')
                          setSelectedRecord(record)
                          editorForm.resetFields()
                          editorForm.setFieldsValue(buildInitialValues(config, record))
                          setIsModalOpen(true)
                        }}
                        size="small"
                        type="text"
                      />
                    </Tooltip>
                  ) : null}
                  {canDelete && id !== undefined ? (
                    <Tooltip title="Delete">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          modal.confirm({
                            title: `Delete ${config.singularLabel}`,
                            content: 'This action will call the backend delete endpoint.',
                            okButtonProps: { danger: true, loading: deleteMutation.isPending },
                            onOk: async () => {
                              await deleteMutation.mutateAsync(id)
                            },
                          })
                        }}
                        size="small"
                        type="text"
                      />
                    </Tooltip>
                  ) : null}
                </Space>
              )
            },
          },
        ]
      : []),
  ]

  const openCreateModal = () => {
    setEditorMode('create')
    setSelectedRecord(null)
    editorForm.resetFields()
    editorForm.setFieldsValue(buildInitialValues(config, null))
    setIsModalOpen(true)
  }

  const handleSearch = (values: AnyRecord) => {
    setFilters(buildSearchParams(values))
    setPagination((current) => ({
      ...current,
      offset: 0,
    }))
  }

  const handleResetFilters = () => {
    searchForm.resetFields()
    setFilters({})
    setPagination((current) => ({
      ...current,
      offset: 0,
    }))
  }

  const handleSubmitForm = async () => {
    const values = await editorForm.validateFields()
    const payload = buildPayload(visibleFields, values)

    if (editorMode === 'create') {
      await createMutation.mutateAsync(payload)

      return
    }

    const id = selectedRecord ? getRecordId(config, selectedRecord) : undefined

    if (id === undefined) {
      message.error('This record does not have an ID for update.')

      return
    }

    await updateMutation.mutateAsync({
      id,
      payload,
    })
  }

  return (
    <PageContainer
      extra={
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => setReloadKey((current) => current + 1)}>
            Refresh
          </Button>
          {canCreate ? (
            <Button icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
              Create
            </Button>
          ) : null}
        </Space>
      }
      subtitle={config.subtitle}
      title={config.title}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AppCard
            extra={
              <Button
                icon={isFiltersCollapsed ? <DownOutlined /> : <UpOutlined />}
                onClick={() => setIsFiltersCollapsed((current) => !current)}
                size="small"
                type="text"
              >
                {isFiltersCollapsed ? 'Expand' : 'Collapse'}
              </Button>
            }
            title="Filters"
          >
            {!isFiltersCollapsed ? (
              <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
                <Row gutter={[16, 8]}>
                  {config.searchFields.map((field) => (
                    <Col key={field.name} lg={field.span ?? 6} md={12} xs={24}>
                      <Form.Item label={field.label} name={field.name}>
                        {renderSearchField(field)}
                      </Form.Item>
                    </Col>
                  ))}
                  <Col span={24}>
                    <Flex gap={12} justify="flex-end" wrap="wrap">
                      <Button onClick={handleResetFilters}>Reset</Button>
                      <Button htmlType="submit" icon={<SearchOutlined />} type="primary">
                        Search
                      </Button>
                    </Flex>
                  </Col>
                </Row>
              </Form>
            ) : null}
          </AppCard>
        </Col>
        <Col span={24}>
          <AppCard title={`${config.title} table`}>
            {!listData && isListLoading ? <Loading /> : null}
            {listError ? (
              <ErrorState subTitle={getErrorMessage(listError)} title={`Cannot load ${config.title.toLowerCase()}`} />
            ) : null}
            {listData ? (
              <AppTable<ResourceRecord>
                columns={columns}
                dataSource={listData.items}
                loading={isListLoading}
                pagination={{
                  current: Math.floor(pagination.offset / pagination.limit) + 1,
                  pageSize: pagination.limit,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  total: listData.total,
                  onChange: (page, pageSize) => {
                    setPagination({
                      offset: (page - 1) * pageSize,
                      limit: pageSize,
                    })
                  },
                }}
                rowKey={(record) => String(getRecordId(config, record) ?? `${config.key}-${JSON.stringify(record)}`)}
              />
            ) : null}
          </AppCard>
        </Col>
      </Row>

      <AppModal
        onCancel={() => {
          setIsModalOpen(false)
          setSelectedRecord(null)
        }}
        open={isModalOpen}
        title={`${editorMode === 'create' ? 'Create' : 'Edit'} ${config.singularLabel}`}
      >
        <Form form={editorForm} layout="vertical">
          <Row gutter={[16, 8]}>
            {visibleFields.map((field) => {
              const disabled = isFieldDisabled(field, editorValues)
              const isRequired =
                !disabled &&
                (field.required ||
                  (editorMode === 'create' && field.requiredOnCreate) ||
                  (editorMode === 'edit' && field.requiredOnEdit))

              return (
                <Col key={field.name} lg={field.span ?? 12} xs={24}>
                  <Form.Item
                    help={field.help}
                    label={field.label}
                    name={field.name}
                    rules={
                      isRequired
                        ? [
                            {
                              required: true,
                              message: `Please enter ${field.label.toLowerCase()}.`,
                            },
                            ...(field.multiple
                              ? [
                                  {
                                    validator: async (_rule: unknown, value: unknown) => {
                                      if (Array.isArray(value) && value.length > 0) {
                                        return
                                      }

                                      throw new Error(
                                        `Please select at least one ${field.label.toLowerCase()}.`,
                                      )
                                    },
                                  },
                                ]
                              : []),
                          ]
                        : undefined
                    }
                    valuePropName={field.type === 'switch' ? 'checked' : 'value'}
                  >
                    {field.type === 'remote-select' && field.remote ? (
                      <RemoteSelectField
                        disabled={disabled}
                        multiple={field.multiple}
                        placeholder={field.placeholder}
                        source={field.remote}
                      />
                    ) : (
                      renderFormField({
                        ...field,
                        disabled,
                        placeholder: disabled ? 'Not applicable for the selected option' : field.placeholder,
                      })
                    )}
                  </Form.Item>
                </Col>
              )
            })}
          </Row>
          <Flex gap={12} justify="flex-end" style={{ marginTop: 8 }} wrap="wrap">
            <Button
              onClick={() => {
                setIsModalOpen(false)
                setSelectedRecord(null)
              }}
            >
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmitForm}
              type="primary"
            >
              {editorMode === 'create' ? 'Create' : 'Save'}
            </Button>
          </Flex>
        </Form>
      </AppModal>
    </PageContainer>
  )
}

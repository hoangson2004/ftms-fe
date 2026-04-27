import type { ReactNode } from 'react'
import type { TableColumnsType } from 'antd'
import type { AnyRecord } from '@/common/types/api'

export type ResourceRecord = AnyRecord & {
  id?: string | number
}

export type SelectOption = {
  label: string
  value: string | number | boolean
}

export type SearchField = {
  name: string
  label: string
  type: 'text' | 'select' | 'number' | 'remote-select'
  placeholder?: string
  multiple?: boolean
  options?: SelectOption[]
  remote?: RemoteSelectSource
  span?: number
}

export type RemoteSelectSource = {
  path: string
  queryKey: string
  label: (record: ResourceRecord) => string
  valuePath?: string
  params?: Record<string, unknown>
}

export type FormField = {
  name: string
  label: string
  type:
    | 'text'
    | 'textarea'
    | 'password'
    | 'email'
    | 'tel'
    | 'select'
    | 'remote-select'
    | 'number'
    | 'switch'
    | 'datetime'
  placeholder?: string
  help?: ReactNode
  required?: boolean
  requiredOnCreate?: boolean
  requiredOnEdit?: boolean
  multiple?: boolean
  options?: SelectOption[]
  remote?: RemoteSelectSource
  min?: number
  precision?: number
  span?: number
  hiddenOnCreate?: boolean
  hiddenOnEdit?: boolean
  emptyValue?: unknown
  getInitialValue?: (record: ResourceRecord) => unknown
  disabled?: boolean
  disabledWhen?: (values: AnyRecord) => boolean
}

export type ResourceConfig = {
  key: string
  routePath: string
  title: string
  subtitle: string
  singularLabel: string
  batchCreateLabel?: string
  basePath: string
  queryKey: string
  searchFields: SearchField[]
  formFields: FormField[]
  columns: TableColumnsType<ResourceRecord>
  note?: string
  allowCreate?: boolean
  allowUpdate?: boolean
  allowDelete?: boolean
  pageSize?: number
  getRecordId?: (record: ResourceRecord) => string | number | undefined
  getInitialFormValues?: () => AnyRecord
}

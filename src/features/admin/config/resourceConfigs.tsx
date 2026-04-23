import type { ReactNode } from 'react'
import { Space, Tag, Typography } from 'antd'
import { featureModules } from '@/app/config/navigation'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { formatDateTime } from '@/common/utils/format'
import type { ResourceConfig, SelectOption } from '@/features/admin/types'

const statusOptions: SelectOption[] = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
]

const booleanOptions: SelectOption[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

function getSubtitle(routeKey: string) {
  return featureModules.find((module) => module.key === routeKey)?.subtitle ?? ''
}

function renderCode(value: unknown) {
  return <Typography.Text strong>{String(value ?? '-')}</Typography.Text>
}

function renderStatus(value: unknown) {
  return <StatusTag status={typeof value === 'string' ? value : null} />
}

function renderBoolean(value: unknown) {
  return <Tag color={value ? 'green' : 'default'}>{value ? 'YES' : 'NO'}</Tag>
}

function renderTagList(
  values: Array<{ id?: number | string; code?: string; name?: string }> | undefined,
  emptyLabel = '-',
) {
  if (!values?.length) {
    return emptyLabel
  }

  return (
    <Space size={[6, 6]} wrap>
      {values.map((item) => (
        <Tag key={String(item.id ?? item.code ?? item.name)}>
          {item.name ?? item.code ?? item.id}
        </Tag>
      ))}
    </Space>
  )
}

function buildRoutePath(routeKey: string) {
  return featureModules.find((module) => module.key === routeKey)?.path ?? '/'
}

export const resourceConfigs: ResourceConfig[] = [
  {
    key: 'users',
    routePath: buildRoutePath('users'),
    title: 'Users',
    subtitle: getSubtitle('users'),
    singularLabel: 'user',
    basePath: '/api/users',
    queryKey: 'users',
    searchFields: [
      { name: 'id', label: 'ID', type: 'text' },
      { name: 'fullName', label: 'Full name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    formFields: [
      { name: 'fullName', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true },
      { name: 'avatarUrl', label: 'Avatar URL', type: 'text' },
      {
        name: 'roleId',
        label: 'Role',
        type: 'remote-select',
        required: true,
        remote: {
          path: '/api/roles',
          queryKey: 'user-role-options',
          label: (record) => `${record.name ?? record.code ?? record.id}`,
        },
      },
      { name: 'status', label: 'Status', type: 'select', required: true, options: statusOptions },
    ],
    columns: [
      { key: 'fullName', title: 'Full name', dataIndex: 'fullName' },
      { key: 'email', title: 'Email', dataIndex: 'email' },
      { key: 'phone', title: 'Phone', dataIndex: 'phone' },
      { key: 'roleName', title: 'Role', dataIndex: 'roleName' },
      { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: renderStatus },
    ],
    getInitialFormValues: () => ({
      status: 'ACTIVE',
    }),
  },
  {
    key: 'roles',
    routePath: buildRoutePath('roles'),
    title: 'Roles',
    subtitle: getSubtitle('roles'),
    singularLabel: 'role',
    basePath: '/api/roles',
    queryKey: 'roles',
    searchFields: [
      { name: 'id', label: 'ID', type: 'text' },
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'isDefault', label: 'Default', type: 'select', options: booleanOptions },
    ],
    formFields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isDefault', label: 'Default role', type: 'switch' },
      {
        name: 'permissionGroupIds',
        label: 'Permission groups',
        type: 'remote-select',
        required: true,
        multiple: true,
        remote: {
          path: '/api/permission-groups',
          queryKey: 'role-permission-group-options',
          label: (record) => `${record.name ?? record.code ?? record.id}`,
        },
        getInitialValue: (record) =>
          Array.isArray(record.permissionGroups)
            ? record.permissionGroups
                .map((group) =>
                  group && typeof group === 'object' && 'id' in group ? group.id : undefined,
                )
                .filter((value) => value !== undefined)
            : [],
      },
    ],
    columns: [
      { key: 'code', title: 'Code', dataIndex: 'code', width: 220, render: renderCode },
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'description', title: 'Description', dataIndex: 'description' },
      {
        key: 'permissionGroups',
        title: 'Permission groups',
        render: (_value, record) =>
          renderTagList(
            Array.isArray(record.permissionGroups)
              ? (record.permissionGroups as Array<{ id?: number | string; code?: string; name?: string }>)
              : undefined,
          ),
      },
      { key: 'isDefault', title: 'Default', dataIndex: 'isDefault', width: 120, render: renderBoolean },
    ],
    getInitialFormValues: () => ({
      isDefault: false,
      permissionGroupIds: [],
    }),
  },
  {
    key: 'permission-categories',
    routePath: buildRoutePath('permission-categories'),
    title: 'Permission Categories',
    subtitle: getSubtitle('permission-categories'),
    singularLabel: 'permission category',
    basePath: '/api/permission-categories',
    queryKey: 'permission-categories',
    note: 'Permission category is read-only on FE. This screen only supports search/list.',
    allowCreate: false,
    allowUpdate: false,
    allowDelete: false,
    searchFields: [
      { name: 'id', label: 'ID', type: 'text' },
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'name', label: 'Name', type: 'text' },
    ],
    formFields: [],
    columns: [
      { key: 'code', title: 'Code', dataIndex: 'code', width: 220, render: renderCode },
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'description', title: 'Description', dataIndex: 'description' },
      { key: 'createdAt', title: 'Created at', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
    ],
  },
  {
    key: 'permission-groups',
    routePath: buildRoutePath('permission-groups'),
    title: 'Permission Groups',
    subtitle: getSubtitle('permission-groups'),
    singularLabel: 'permission group',
    basePath: '/api/permission-groups',
    queryKey: 'permission-groups',
    searchFields: [
      { name: 'id', label: 'ID', type: 'text' },
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'name', label: 'Name', type: 'text' },
    ],
    formFields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      {
        name: 'permissionCategoryIds',
        label: 'Permission categories',
        type: 'remote-select',
        required: true,
        multiple: true,
        remote: {
          path: '/api/permission-categories',
          queryKey: 'permission-category-options',
          label: (record) => `${record.name ?? record.code ?? record.id}`,
        },
        getInitialValue: (record) =>
          Array.isArray(record.permissionCategories)
            ? record.permissionCategories
                .map((category) =>
                  category && typeof category === 'object' && 'id' in category
                    ? category.id
                    : undefined,
                )
                .filter((value) => value !== undefined)
            : [],
      },
    ],
    columns: [
      { key: 'code', title: 'Code', dataIndex: 'code', width: 220, render: renderCode },
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'description', title: 'Description', dataIndex: 'description' },
      {
        key: 'permissionCategories',
        title: 'Permission categories',
        render: (_value, record) =>
          renderTagList(
            Array.isArray(record.permissionCategories)
              ? (record.permissionCategories as Array<{ id?: number | string; code?: string; name?: string }>)
              : undefined,
          ),
      },
    ],
    getInitialFormValues: () => ({
      permissionCategoryIds: [],
    }),
  },
]

export function getResourceConfig(routePath: string) {
  return resourceConfigs.find((config) => config.routePath === routePath)
}

export function getResourceConfigByKey(key: string) {
  return resourceConfigs.find((config) => config.key === key)
}

export function renderFieldHelp(help: ReactNode) {
  return help
}

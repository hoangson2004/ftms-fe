import type { ReactNode } from 'react'
import { Space, Tag, Typography } from 'antd'
import { featureModules } from '@/app/config/navigation'
import { StatusTag } from '@/common/components/ui/StatusTag'
import { getValueByPath } from '@/common/lib/api'
import { formatCurrency, formatDateTime } from '@/common/utils/format'
import type { ResourceConfig, SelectOption } from '@/features/admin/types'

const statusOptions: SelectOption[] = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
]

const booleanOptions: SelectOption[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

const fundTableOptions: SelectOption[] = [
  { label: 'Member Debts', value: 'FUND_MEMBER_DEBTS' },
  { label: 'Member Contributions', value: 'FUND_MEMBER_CONTRIBUTIONS' },
  { label: 'Team Transactions', value: 'FUND_TEAM_TRANSACTIONS' },
]

const transactionTypeOptions: SelectOption[] = [
  { label: 'IN', value: 'IN' },
  { label: 'OUT', value: 'OUT' },
]

const debtStatusOptions: SelectOption[] = [
  { label: 'UNPAID', value: 'UNPAID' },
  { label: 'PAID', value: 'PAID' },
]

const teamMemberStatusOptions: SelectOption[] = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'LEFT', value: 'LEFT' },
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

function renderAmount(value: unknown) {
  return typeof value === 'number' ? formatCurrency(value) : '-'
}

function renderOptionLabel(value: unknown, options: SelectOption[]) {
  return options.find((option) => option.value === value)?.label ?? String(value ?? '-')
}

function renderBoolean(value: unknown) {
  return <Tag color={value ? 'green' : 'default'}>{value ? 'YES' : 'NO'}</Tag>
}

function getTeamMemberLabel(record: Record<string, unknown>) {
  const userName = getValueByPath(record, 'userName')
  const fullName = getValueByPath(record, 'fullName')
  const nestedFullName = getValueByPath(record, 'user.fullName')
  const name = getValueByPath(record, 'name')
  const userId = getValueByPath(record, 'userId')

  for (const candidate of [userName, fullName, nestedFullName, name]) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }
  }

  if (userId !== undefined && userId !== null) {
    return `User #${String(userId)}`
  }

  return `Member #${String(record.id ?? '-')}`
}

function renderTeamMemberCell(_value: unknown, record: Record<string, unknown>) {
  return getTeamMemberLabel(record)
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
    key: 'team-members',
    routePath: buildRoutePath('team-members'),
    title: 'Team Members',
    subtitle: getSubtitle('team-members'),
    singularLabel: 'team member',
    basePath: '/api/team-members',
    queryKey: 'team-members',
    allowDelete: false,
    note: 'User and role names are taken directly from backend response fields `userName` and `roleName`.',
    searchFields: [
      {
        name: 'userId',
        label: 'User',
        type: 'remote-select',
        placeholder: 'Select user',
        remote: {
          path: '/api/users',
          queryKey: 'team-member-user-search-options',
          label: (record) =>
            String(record.fullName ?? record.userName ?? record.name ?? record.email ?? record.id),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'roleId',
        label: 'Role',
        type: 'remote-select',
        placeholder: 'Select role',
        remote: {
          path: '/api/roles',
          queryKey: 'team-member-role-search-options',
          label: (record) => String(record.roleName ?? record.name ?? record.code ?? record.id),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      { name: 'status', label: 'Status', type: 'select', options: teamMemberStatusOptions },
    ],
    formFields: [
      {
        name: 'userId',
        label: 'User',
        type: 'remote-select',
        required: true,
        placeholder: 'Select user',
        remote: {
          path: '/api/users',
          queryKey: 'team-member-user-options',
          label: (record) =>
            String(record.fullName ?? record.userName ?? record.name ?? record.email ?? record.id),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'roleId',
        label: 'Role',
        type: 'remote-select',
        required: true,
        placeholder: 'Select role',
        remote: {
          path: '/api/roles',
          queryKey: 'team-member-role-options',
          label: (record) => String(record.roleName ?? record.name ?? record.code ?? record.id),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: teamMemberStatusOptions,
      },
      { name: 'joinedAt', label: 'Joined at', type: 'datetime', required: true },
      { name: 'leftAt', label: 'Left at', type: 'datetime', emptyValue: null },
    ],
    columns: [
      { key: 'userName', title: 'User', dataIndex: 'userName' },
      { key: 'roleName', title: 'Role', dataIndex: 'roleName' },
      { key: 'status', title: 'Status', dataIndex: 'status', width: 140, render: renderStatus },
      { key: 'joinedAt', title: 'Joined at', dataIndex: 'joinedAt', width: 180, render: (value) => formatDateTime(value) },
      { key: 'leftAt', title: 'Left at', dataIndex: 'leftAt', width: 180, render: (value) => formatDateTime(value) },
    ],
    getInitialFormValues: () => ({
      status: 'ACTIVE',
      leftAt: null,
    }),
  },
  {
    key: 'fund-categories',
    routePath: buildRoutePath('fund-categories'),
    title: 'Fund Categories',
    subtitle: getSubtitle('fund-categories'),
    singularLabel: 'fund category',
    basePath: '/api/fund-categories',
    queryKey: 'fund-categories',
    searchFields: [
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'tableName', label: 'Module', type: 'select', options: fundTableOptions },
      { name: 'isActive', label: 'Active', type: 'select', options: booleanOptions },
    ],
    formFields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'tableName',
        label: 'Module',
        type: 'select',
        required: true,
        options: fundTableOptions,
      },
      {
        name: 'transactionType',
        label: 'Transaction type',
        type: 'select',
        required: true,
        options: transactionTypeOptions,
        disabledWhen: (values) => values.tableName !== 'FUND_TEAM_TRANSACTIONS',
      },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isActive', label: 'Is active', type: 'switch' },
    ],
    columns: [
      { key: 'code', title: 'Code', dataIndex: 'code', width: 200, render: renderCode },
      { key: 'name', title: 'Name', dataIndex: 'name' },
      {
        key: 'tableName',
        title: 'Module',
        dataIndex: 'tableName',
        width: 240,
        render: (value) => renderOptionLabel(value, fundTableOptions),
      },
      {
        key: 'transactionType',
        title: 'Transaction type',
        dataIndex: 'transactionType',
        width: 150,
        render: renderStatus,
      },
      { key: 'isActive', title: 'Active', dataIndex: 'isActive', width: 120, render: renderBoolean },
    ],
    getInitialFormValues: () => ({
      tableName: 'FUND_TEAM_TRANSACTIONS',
      transactionType: 'IN',
      isActive: true,
    }),
  },
  {
    key: 'fund-member-debts',
    routePath: buildRoutePath('fund-member-debts'),
    title: 'Fund Member Debts',
    subtitle: getSubtitle('fund-member-debts'),
    singularLabel: 'member debt',
    batchCreateLabel: 'member debts',
    basePath: '/api/fund-member-debts',
    queryKey: 'fund-member-debts',
    note: 'Category options are loaded from active fund categories for Member Debts. Team member options are loaded from /api/team-members with limit 999 and can be filtered by typing in the combobox. Create supports batch selection of multiple team members.',
    searchFields: [
      {
        name: 'teamMemberId',
        label: 'Team member',
        type: 'remote-select',
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-debt-team-member-search-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'categoryCode',
        label: 'Category',
        type: 'remote-select',
        placeholder: 'Select category',
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-member-debt-category-search-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_MEMBER_DEBTS',
            isActive: true,
          },
        },
      },
      { name: 'status', label: 'Status', type: 'select', options: debtStatusOptions },
    ],
    formFields: [
      {
        name: 'teamMemberIds',
        label: 'Team members',
        type: 'remote-select',
        required: true,
        multiple: true,
        hiddenOnEdit: true,
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-debt-team-member-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'teamMemberId',
        label: 'Team member',
        type: 'remote-select',
        required: true,
        hiddenOnCreate: true,
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-debt-team-member-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'categoryCode',
        label: 'Category code',
        type: 'remote-select',
        required: true,
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-member-debt-category-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_MEMBER_DEBTS',
            isActive: true,
          },
        },
      },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, precision: 0 },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: debtStatusOptions,
      },
      { name: 'dueAt', label: 'Due at', type: 'datetime', required: true },
      { name: 'note', label: 'Note', type: 'textarea' },
    ],
    columns: [
      {
        key: 'userName',
        title: 'User name',
        dataIndex: 'userName',
        width: 240,
        render: (_value, record) => renderTeamMemberCell(undefined, record),
      },
      { key: 'categoryCode', title: 'Category code', dataIndex: 'categoryCode', width: 180, render: renderCode },
      { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 160, render: renderAmount },
      { key: 'status', title: 'Status', dataIndex: 'status', width: 120, render: renderStatus },
      { key: 'dueAt', title: 'Due at', dataIndex: 'dueAt', width: 180, render: (value) => formatDateTime(value) },
      { key: 'note', title: 'Note', dataIndex: 'note' },
    ],
    getInitialFormValues: () => ({
      teamMemberIds: [],
      status: 'UNPAID',
    }),
  },
  {
    key: 'fund-member-contributions',
    routePath: buildRoutePath('fund-member-contributions'),
    title: 'Fund Member Contributions',
    subtitle: getSubtitle('fund-member-contributions'),
    singularLabel: 'member contribution',
    batchCreateLabel: 'member contributions',
    basePath: '/api/fund-member-contributions',
    queryKey: 'fund-member-contributions',
    note: 'Category options are loaded from active fund categories for Member Contributions. Team member options are loaded from /api/team-members with limit 999 and can be filtered by typing in the combobox. Create supports batch selection of multiple team members.',
    searchFields: [
      {
        name: 'teamMemberId',
        label: 'Team member',
        type: 'remote-select',
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-contribution-team-member-search-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'categoryCode',
        label: 'Category',
        type: 'remote-select',
        placeholder: 'Select category',
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-member-contribution-category-search-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_MEMBER_CONTRIBUTIONS',
            isActive: true,
          },
        },
      },
    ],
    formFields: [
      {
        name: 'teamMemberIds',
        label: 'Team members',
        type: 'remote-select',
        help: 'Create mode supports batch contribution creation for multiple team members.',
        required: true,
        multiple: true,
        hiddenOnEdit: true,
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-contribution-team-member-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'teamMemberId',
        label: 'Team member',
        type: 'remote-select',
        required: true,
        hiddenOnCreate: true,
        placeholder: 'Search team member',
        remote: {
          path: '/api/team-members',
          queryKey: 'fund-member-contribution-team-member-options',
          label: (record) => getTeamMemberLabel(record),
          params: {
            offset: 0,
            limit: 999,
          },
        },
      },
      {
        name: 'categoryCode',
        label: 'Category code',
        type: 'remote-select',
        required: true,
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-member-contribution-category-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_MEMBER_CONTRIBUTIONS',
            isActive: true,
          },
        },
      },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, precision: 0 },
      { name: 'contributionAt', label: 'Contribution at', type: 'datetime', required: true },
      { name: 'note', label: 'Note', type: 'textarea' },
    ],
    columns: [
      {
        key: 'userName',
        title: 'User name',
        dataIndex: 'userName',
        width: 240,
        render: (_value, record) => renderTeamMemberCell(undefined, record),
      },
      { key: 'categoryCode', title: 'Category code', dataIndex: 'categoryCode', width: 180, render: renderCode },
      { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 160, render: renderAmount },
      {
        key: 'contributionAt',
        title: 'Contribution at',
        dataIndex: 'contributionAt',
        width: 180,
        render: (value) => formatDateTime(value),
      },
      { key: 'note', title: 'Note', dataIndex: 'note' },
    ],
    getInitialFormValues: () => ({
      teamMemberIds: [],
    }),
  },
  {
    key: 'fund-team-transactions',
    routePath: buildRoutePath('fund-team-transactions'),
    title: 'Fund Team Transactions',
    subtitle: getSubtitle('fund-team-transactions'),
    singularLabel: 'team transaction',
    basePath: '/api/fund-team-transactions',
    queryKey: 'fund-team-transactions',
    searchFields: [
      {
        name: 'categoryCode',
        label: 'Category',
        type: 'remote-select',
        placeholder: 'Select category',
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-team-transaction-category-search-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_TEAM_TRANSACTIONS',
            isActive: true,
          },
        },
      },
      { name: 'transactionType', label: 'Transaction type', type: 'select', options: transactionTypeOptions },
    ],
    formFields: [
      {
        name: 'categoryCode',
        label: 'Category code',
        type: 'remote-select',
        required: true,
        remote: {
          path: '/api/fund-categories',
          queryKey: 'fund-team-transaction-category-options',
          label: (record) => `${record.code ?? record.name ?? record.id}`,
          valuePath: 'code',
          params: {
            tableName: 'FUND_TEAM_TRANSACTIONS',
            isActive: true,
          },
        },
      },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, precision: 0 },
      { name: 'transactionAt', label: 'Transaction at', type: 'datetime', required: true },
      { name: 'note', label: 'Note', type: 'textarea' },
    ],
    columns: [
      { key: 'categoryCode', title: 'Category code', dataIndex: 'categoryCode', width: 180, render: renderCode },
      {
        key: 'transactionType',
        title: 'Transaction type',
        dataIndex: 'transactionType',
        width: 150,
        render: renderStatus,
      },
      { key: 'amount', title: 'Amount', dataIndex: 'amount', width: 160, render: renderAmount },
      {
        key: 'transactionAt',
        title: 'Transaction at',
        dataIndex: 'transactionAt',
        width: 180,
        render: (value) => formatDateTime(value),
      },
      { key: 'note', title: 'Note', dataIndex: 'note' },
    ],
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

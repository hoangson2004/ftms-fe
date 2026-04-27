import type { ElementType } from 'react'
import {
  AppstoreOutlined,
  BankOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  WalletOutlined,
  UserOutlined,
} from '@ant-design/icons'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type MenuGroupKey = 'overview' | 'organization' | 'authorization' | 'finance'

export type ApiEndpoint = {
  key: string
  name: string
  method: HttpMethod
  path: string
}

type BaseNavigationRoute = {
  key: string
  path: string
  label: string
  title: string
  subtitle: string
  description: string
  menuGroup: MenuGroupKey
  icon: ElementType
}

export type DashboardRoute = BaseNavigationRoute

export type FeatureModule = BaseNavigationRoute & {
  apiCollectionName: string
  endpoints: ApiEndpoint[]
  plannedSections: string[]
  note?: string
}

export type AppNavigationRoute = DashboardRoute | FeatureModule

export const MENU_GROUP_LABELS: Record<MenuGroupKey, string> = {
  overview: 'Overview',
  organization: 'Organization',
  authorization: 'Authorization',
  finance: 'Finance',
}

export const dashboardRoute: DashboardRoute = {
  key: 'dashboard',
  path: '/',
  label: 'Dashboard',
  title: 'FTMS Project Scaffold',
  subtitle: 'Frontend skeleton mapped from the backend Postman collection.',
  description: 'High-level view of routes, menu groups, and mapped backend endpoints.',
  menuGroup: 'overview',
  icon: DashboardOutlined,
}

export const featureModules: FeatureModule[] = [
  {
    key: 'users',
    path: '/users',
    label: 'Users',
    title: 'Users',
    subtitle: 'CRUD scaffold for `02. Users`.',
    description: 'Account administration area for search, create, update, and soft delete.',
    menuGroup: 'organization',
    icon: UserOutlined,
    apiCollectionName: '02. Users',
    endpoints: [
      {
        key: 'users-create',
        name: 'Create User (Public)',
        method: 'POST',
        path: '/api/users',
      },
      {
        key: 'users-search',
        name: 'Search Users',
        method: 'GET',
        path: '/api/users',
      },
      {
        key: 'users-update',
        name: 'Update User',
        method: 'PUT',
        path: '/api/users/:userId',
      },
      {
        key: 'users-delete',
        name: 'Delete User (Soft Delete)',
        method: 'DELETE',
        path: '/api/users/:userId',
      },
    ],
    plannedSections: [
      'Filterable data table with pagination and status chips.',
      'Create and update drawer/modal with shared form validation.',
      'Soft-delete action, optimistic refresh, and empty state handling.',
    ],
  },
  {
    key: 'fund-categories',
    path: '/fund-categories',
    label: 'Fund Categories',
    title: 'Fund Categories',
    subtitle: 'CRUD scaffold for fund categories.',
    description: 'Manage category codes used by debts, contributions, and team transactions.',
    menuGroup: 'finance',
    icon: WalletOutlined,
    apiCollectionName: 'Fund Categories',
    endpoints: [
      {
        key: 'fund-categories-create',
        name: 'Create Fund Category',
        method: 'POST',
        path: '/api/fund-categories',
      },
      {
        key: 'fund-categories-search',
        name: 'Search Fund Categories',
        method: 'GET',
        path: '/api/fund-categories',
      },
      {
        key: 'fund-categories-update',
        name: 'Update Fund Category',
        method: 'PUT',
        path: '/api/fund-categories/:fundCategoryId',
      },
      {
        key: 'fund-categories-delete',
        name: 'Delete Fund Category',
        method: 'DELETE',
        path: '/api/fund-categories/:fundCategoryId',
      },
    ],
    plannedSections: [
      'Category table with code, table name, transaction type, and active state.',
      'Create/edit form for category metadata aligned with backend enums.',
      'Delete flow for retired finance categories.',
    ],
  },
  {
    key: 'fund-member-debts',
    path: '/fund-member-debts',
    label: 'Member Debts',
    title: 'Fund Member Debts',
    subtitle: 'CRUD scaffold for member debt tracking.',
    description: 'Track unpaid and paid member obligations with due dates and notes.',
    menuGroup: 'finance',
    icon: CreditCardOutlined,
    apiCollectionName: 'Fund Member Debts',
    endpoints: [
      {
        key: 'fund-member-debts-create',
        name: 'Create Fund Member Debt',
        method: 'POST',
        path: '/api/fund-member-debts',
      },
      {
        key: 'fund-member-debts-search',
        name: 'Search Fund Member Debts',
        method: 'GET',
        path: '/api/fund-member-debts',
      },
      {
        key: 'fund-member-debts-update',
        name: 'Update Fund Member Debt',
        method: 'PUT',
        path: '/api/fund-member-debts/:fundMemberDebtId',
      },
      {
        key: 'fund-member-debts-delete',
        name: 'Delete Fund Member Debt',
        method: 'DELETE',
        path: '/api/fund-member-debts/:fundMemberDebtId',
      },
    ],
    plannedSections: [
      'Debt table with team member, category, amount, status, and due date.',
      'Create/edit flow for member debt entries.',
      'Delete action for invalid or retired debt rows.',
    ],
  },
  {
    key: 'fund-member-contributions',
    path: '/fund-member-contributions',
    label: 'Member Contributions',
    title: 'Fund Member Contributions',
    subtitle: 'CRUD scaffold for member contributions.',
    description: 'Track ad-hoc or planned contributions paid by team members.',
    menuGroup: 'finance',
    icon: DollarCircleOutlined,
    apiCollectionName: 'Fund Member Contributions',
    endpoints: [
      {
        key: 'fund-member-contributions-create',
        name: 'Create Fund Member Contribution',
        method: 'POST',
        path: '/api/fund-member-contributions',
      },
      {
        key: 'fund-member-contributions-search',
        name: 'Search Fund Member Contributions',
        method: 'GET',
        path: '/api/fund-member-contributions',
      },
      {
        key: 'fund-member-contributions-update',
        name: 'Update Fund Member Contribution',
        method: 'PUT',
        path: '/api/fund-member-contributions/:fundMemberContributionId',
      },
      {
        key: 'fund-member-contributions-delete',
        name: 'Delete Fund Member Contribution',
        method: 'DELETE',
        path: '/api/fund-member-contributions/:fundMemberContributionId',
      },
    ],
    plannedSections: [
      'Contribution table with member, category, amount, contribution date, and notes.',
      'Create/edit flow bound to the contribution API payload.',
      'Delete action for cleanup and corrections.',
    ],
  },
  {
    key: 'fund-team-transactions',
    path: '/fund-team-transactions',
    label: 'Team Transactions',
    title: 'Fund Team Transactions',
    subtitle: 'CRUD scaffold for team-level fund transactions.',
    description: 'Track incoming and outgoing team fund transactions by category code.',
    menuGroup: 'finance',
    icon: BankOutlined,
    apiCollectionName: 'Fund Team Transactions',
    endpoints: [
      {
        key: 'fund-team-transactions-create',
        name: 'Create Fund Team Transaction',
        method: 'POST',
        path: '/api/fund-team-transactions',
      },
      {
        key: 'fund-team-transactions-search',
        name: 'Search Fund Team Transactions',
        method: 'GET',
        path: '/api/fund-team-transactions',
      },
      {
        key: 'fund-team-transactions-update',
        name: 'Update Fund Team Transaction',
        method: 'PUT',
        path: '/api/fund-team-transactions/:fundTeamTransactionId',
      },
      {
        key: 'fund-team-transactions-delete',
        name: 'Delete Fund Team Transaction',
        method: 'DELETE',
        path: '/api/fund-team-transactions/:fundTeamTransactionId',
      },
    ],
    plannedSections: [
      'Transaction table with category, transaction type, amount, timestamp, and note.',
      'Create/edit flow for team income and expense entries.',
      'Delete action for correction workflows.',
    ],
  },
  {
    key: 'roles',
    path: '/roles',
    label: 'Roles',
    title: 'Roles',
    subtitle: 'CRUD scaffold for `05. Roles`.',
    description: 'Authorization role catalog with defaults and custom role definitions.',
    menuGroup: 'authorization',
    icon: SafetyCertificateOutlined,
    apiCollectionName: '05. Roles',
    endpoints: [
      {
        key: 'roles-create',
        name: 'Create Role',
        method: 'POST',
        path: '/api/roles',
      },
      {
        key: 'roles-search',
        name: 'Search Roles',
        method: 'GET',
        path: '/api/roles',
      },
      {
        key: 'roles-update',
        name: 'Update Role',
        method: 'PUT',
        path: '/api/roles/:roleId',
      },
      {
        key: 'roles-delete',
        name: 'Delete Role',
        method: 'DELETE',
        path: '/api/roles/:roleId',
      },
    ],
    plannedSections: [
      'Role list with code, name, and default-role indicators.',
      'Role create/edit form with reusable validation rules.',
      'Role removal flow and downstream permission dependency warnings.',
    ],
  },
  {
    key: 'permission-categories',
    path: '/permission-categories',
    label: 'Permission Categories',
    title: 'Permission Categories',
    subtitle: 'Permission categories management.',
    description: 'Lookup catalog for permission category codes, names, and sort order.',
    menuGroup: 'authorization',
    icon: AppstoreOutlined,
    apiCollectionName: '06. Permission Categories',
    endpoints: [
      {
        key: 'permission-categories-search',
        name: 'Search Permission Categories',
        method: 'GET',
        path: '/api/permission-categories',
      },
    ],
    plannedSections: [
      'Read-only table with filters for id, code, name, and sort order.',
      'Detail panel for category metadata and group associations.',
      'Placeholder for future create/update actions when BE exposes them.',
    ],
    note: 'The current backend collection only exposes search for this module, so the FE scaffold is intentionally read-focused.',
  },
  {
    key: 'permission-groups',
    path: '/permission-groups',
    label: 'Permission Groups',
    title: 'Permission Groups',
    subtitle: 'CRUD scaffold for `07. Permission Groups`.',
    description: 'Permission grouping area used to cluster functional access rules.',
    menuGroup: 'authorization',
    icon: SettingOutlined,
    apiCollectionName: '07. Permission Groups',
    endpoints: [
      {
        key: 'permission-groups-create',
        name: 'Create Permission Group',
        method: 'POST',
        path: '/api/permission-groups',
      },
      {
        key: 'permission-groups-search',
        name: 'Search Permission Groups',
        method: 'GET',
        path: '/api/permission-groups',
      },
      {
        key: 'permission-groups-update',
        name: 'Update Permission Group',
        method: 'PUT',
        path: '/api/permission-groups/:permissionGroupId',
      },
      {
        key: 'permission-groups-delete',
        name: 'Delete Permission Group',
        method: 'DELETE',
        path: '/api/permission-groups/:permissionGroupId',
      },
    ],
    plannedSections: [
      'Permission-group table with code, name, and sort order.',
      'Create/edit flow for custom groups coming from the admin UI.',
      'Delete action with safeguards for in-use mappings.',
    ],
  },
]

export const navigationRoutes: AppNavigationRoute[] = [dashboardRoute, ...featureModules]

export const navigationGroups = (Object.entries(MENU_GROUP_LABELS) as [
  MenuGroupKey,
  string,
][]).map(([key, label]) => ({
  key,
  label,
  items: navigationRoutes.filter((route) => route.menuGroup === key),
}))

export function findNavigationRoute(pathname: string) {
  if (pathname === '/') {
    return dashboardRoute
  }

  return navigationRoutes
    .filter((route) => route.path !== '/')
    .sort((left, right) => right.path.length - left.path.length)
    .find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
}

import type { ElementType } from 'react'
import {
  AppstoreOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type MenuGroupKey = 'overview' | 'organization' | 'authorization'

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
    subtitle: 'Read scaffold for `06. Permission Categories`.',
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

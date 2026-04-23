import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { findNavigationRoute, navigationGroups } from '@/app/config/navigation'

export function AppSidebar() {
  const location = useLocation()
  const selectedRoute = findNavigationRoute(location.pathname)
  const items: MenuProps['items'] = navigationGroups.map((group) => ({
    type: 'group',
    key: group.key,
    label: group.label,
    children: group.items.map((item) => {
      const Icon = item.icon

      return {
        key: item.path,
        icon: <Icon />,
        label: <Link to={item.path}>{item.label}</Link>,
      }
    }),
  }))

  return (
    <Layout.Sider
      breakpoint="lg"
      collapsedWidth={0}
      style={{
        background: '#f8f9fb',
        borderInlineEnd: '1px solid #dde5ee',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        overflowY: 'auto',
      }}
      theme="light"
      width={264}
    >
      <div className="sidebar-brand">
        <div className="brand-mark" />
        <h1>FTMS Console</h1>
        <p>Backend-aligned project scaffold</p>
      </div>

      <Menu
        items={items}
        selectedKeys={[selectedRoute?.path ?? '/']}
        style={{ background: 'transparent', padding: 12 }}
        theme="light"
      />
    </Layout.Sider>
  )
}

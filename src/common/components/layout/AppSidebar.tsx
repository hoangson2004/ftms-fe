import {
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

const items = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/users', icon: <UserOutlined />, label: <Link to="/users">Users</Link> },
  { key: '/teams', icon: <TeamOutlined />, label: <Link to="/teams">Teams</Link> },
  {
    key: '/members',
    icon: <UsergroupAddOutlined />,
    label: <Link to="/members">Members</Link>,
  },
  {
    key: '/availability',
    icon: <CalendarOutlined />,
    label: <Link to="/availability">Availability</Link>,
  },
  { key: '/matches', icon: <TrophyOutlined />, label: <Link to="/matches">Matches</Link> },
  { key: '/finance', icon: <DollarOutlined />, label: <Link to="/finance">Finance</Link> },
  {
    key: '/notifications',
    icon: <BellOutlined />,
    label: <Link to="/notifications">Notifications</Link>,
  },
  {
    key: '/matchmaking',
    icon: <TeamOutlined />,
    label: <Link to="/matchmaking">Matchmaking</Link>,
  },
]

export function AppSidebar() {
  const location = useLocation()

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
        <h1>Football Hub</h1>
        <p>Club operations cockpit</p>
      </div>

      <Menu
        items={items}
        selectedKeys={[location.pathname]}
        style={{ background: 'transparent', padding: 12 }}
        theme="light"
      />
    </Layout.Sider>
  )
}

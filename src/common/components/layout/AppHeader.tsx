import { LogoutOutlined } from '@ant-design/icons'
import { Avatar, Button, Layout, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { findNavigationRoute, MENU_GROUP_LABELS } from '@/app/config/navigation'
import { useAuthStore } from '@/app/store'
import { APP_NAME } from '@/common/constants/app'

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const displayName = user?.fullName ?? 'Guest User'
  const initial = displayName.charAt(0).toUpperCase()
  const currentRoute = findNavigationRoute(location.pathname)
  const currentGroup = currentRoute ? MENU_GROUP_LABELS[currentRoute.menuGroup] : 'Workspace'
  const headerTitle = currentRoute?.title ?? APP_NAME
  const headerSubtitle = currentRoute?.subtitle ?? 'Backend mapped frontend scaffold.'

  const handleSignOut = () => {
    signOut()
    navigate('/auth/login')
  }

  return (
    <Layout.Header
      style={{
        height: 'auto',
        lineHeight: 'normal',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid #dde5ee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        paddingBlock: 16,
        paddingInline: 24,
      }}
      >
      <div className="header-banner">
        <div className="brand-mark" />
        <div className="header-banner-copy">
          <span className="brand-chip">{currentGroup}</span>
          <h1>{headerTitle}</h1>
          <Typography.Text style={{ color: '#6a7a8d' }}>{headerSubtitle}</Typography.Text>
        </div>
      </div>

      <Space size={12} wrap>
        <Avatar style={{ backgroundColor: '#6fcf97', color: '#0b1f3a', fontWeight: 700 }}>
          {initial}
        </Avatar>
        <div style={{ minWidth: 0 }}>
          <Typography.Text strong style={{ display: 'block', color: '#0b1f3a' }}>
            {displayName}
          </Typography.Text>
          <Typography.Text style={{ color: '#6a7a8d' }}>
            {user?.role ?? 'visitor'}
          </Typography.Text>
        </div>
        <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
          Logout
        </Button>
      </Space>
    </Layout.Header>
  )
}

import { LogoutOutlined } from '@ant-design/icons'
import { Avatar, Button, Layout, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'

export function AppHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const displayName = user?.fullName ?? 'Guest User'
  const initial = displayName.charAt(0).toUpperCase()

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
          <span className="brand-chip">Operations Dashboard</span>
          <h1>Season Control Center</h1>
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

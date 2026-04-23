import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        placeItems: 'center',
        display: 'grid',
        padding: 24,
        background:
          'radial-gradient(circle at top, rgba(126, 214, 165, 0.2), transparent 28%), linear-gradient(180deg, #f8f9fb 0%, #eef3f8 100%)',
      }}
    >
      <Outlet />
    </Layout>
  )
}

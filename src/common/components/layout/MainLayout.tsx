import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/common/components/layout/AppHeader'
import { AppSidebar } from '@/common/components/layout/AppSidebar'

export function MainLayout() {
  return (
    <Layout>
      <AppSidebar />
      <Layout>
        <AppHeader />
        <Layout.Content
          style={{
            padding: 24,
            background:
              'linear-gradient(180deg, rgba(11, 31, 58, 0.03) 0%, rgba(248, 249, 251, 1) 24%)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

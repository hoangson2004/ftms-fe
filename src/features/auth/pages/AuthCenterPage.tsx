import { Button, Col, Descriptions, Row, Space, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { featureModules } from '@/app/config/navigation'
import { ErrorState } from '@/common/components/feedback/ErrorState'
import { Loading } from '@/common/components/feedback/Loading'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { getErrorMessage } from '@/common/lib/api'
import { truncateText } from '@/common/utils/format'
import { getCurrentUser } from '@/features/auth/api/authApi'

const authModule = featureModules.find((module) => module.key === 'auth-center')

export function AuthCenterPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me', 'panel'],
    queryFn: getCurrentUser,
    enabled: Boolean(accessToken),
  })

  return (
    <PageContainer
      extra={
        <Space wrap>
          <Tag color={accessToken ? 'green' : 'default'}>
            {accessToken ? 'Authenticated' : 'No session'}
          </Tag>
          <Link to="/auth/login">
            <Button type="primary">Open login</Button>
          </Link>
        </Space>
      }
      subtitle={authModule?.subtitle}
      title={authModule?.title ?? 'Auth'}
    >
      <Row gutter={[16, 16]}>
        <Col lg={12} xs={24}>
          <AppCard title="Stored session">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="User">{user?.fullName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Role">{user?.role ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Team ID">{user?.teamId ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Access token">
                <Typography.Text code>{truncateText(accessToken, 42)}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </AppCard>
        </Col>
        <Col lg={12} xs={24}>
          <AppCard title="Mapped endpoints">
            <Space direction="vertical" size={12} style={{ display: 'flex' }}>
              {authModule?.endpoints.map((endpoint) => (
                <div key={endpoint.key}>
                  <Tag color={endpoint.method === 'GET' ? 'blue' : 'green'}>{endpoint.method}</Tag>
                  <Typography.Text code>{endpoint.path}</Typography.Text>
                </div>
              ))}
            </Space>
          </AppCard>
        </Col>
        <Col span={24}>
          <AppCard title="Current user from API">
            {currentUserQuery.isPending ? <Loading /> : null}
            {currentUserQuery.isError ? (
              <ErrorState subTitle={getErrorMessage(currentUserQuery.error)} title="Cannot load /auth/me" />
            ) : null}
            {currentUserQuery.data ? (
              <Descriptions column={2} size="small">
                <Descriptions.Item label="ID">{currentUserQuery.data.id}</Descriptions.Item>
                <Descriptions.Item label="Full name">
                  {currentUserQuery.data.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{currentUserQuery.data.email ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Role">{currentUserQuery.data.role}</Descriptions.Item>
                <Descriptions.Item label="Team ID">{currentUserQuery.data.teamId ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Avatar URL">
                  {currentUserQuery.data.avatarUrl ?? '-'}
                </Descriptions.Item>
              </Descriptions>
            ) : null}
          </AppCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

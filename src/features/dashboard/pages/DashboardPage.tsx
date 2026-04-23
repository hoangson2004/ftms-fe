import { Col, Row, Space, Statistic, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'
import {
  dashboardRoute,
  featureModules,
  navigationGroups,
  type AppNavigationRoute,
} from '@/app/config/navigation'
import { AppCard } from '@/common/components/ui/AppCard'
import { PageContainer } from '@/common/components/layout/PageContainer'

type MetricCard = {
  key: string
  title: string
  value: number
  suffix: string
}

const metrics: MetricCard[] = [
  {
    key: 'modules',
    title: 'Collections mapped',
    value: featureModules.length,
    suffix: 'modules',
  },
  {
    key: 'endpoints',
    title: 'Endpoints mapped',
    value: featureModules.reduce((total, module) => total + module.endpoints.length, 0),
    suffix: 'apis',
  },
  {
    key: 'crud-modules',
    title: 'CRUD modules',
    value: featureModules.length,
    suffix: 'screens',
  },
  {
    key: 'menu-groups',
    title: 'Sidebar sections',
    value: navigationGroups.length,
    suffix: 'groups',
  },
]

function getEndpointCount(route: AppNavigationRoute) {
  return 'endpoints' in route ? route.endpoints.length : 0
}

export function DashboardPage() {
  return (
    <PageContainer
      subtitle={dashboardRoute.subtitle}
      title={dashboardRoute.title}
    >
      <Row gutter={[16, 16]}>
        {metrics.map((metric) => (
          <Col key={metric.key} lg={12} xl={6} xs={24}>
            <AppCard>
              <Statistic suffix={metric.suffix} title={metric.title} value={metric.value} />
            </AppCard>
          </Col>
        ))}
        <Col span={24}>
          <AppCard title="Mapped menu groups">
            <Row gutter={[16, 16]}>
              {navigationGroups.map((group) => (
                <Col key={group.key} lg={12} xl={6} xs={24}>
                  <AppCard title={group.label}>
                    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
                      {group.items.map((route) => (
                        <div key={route.key}>
                          <Space size={8} wrap>
                            <Link to={route.path}>
                              <Typography.Text strong>{route.label}</Typography.Text>
                            </Link>
                            <Tag color={route.path === '/' ? 'default' : 'processing'}>
                              {getEndpointCount(route)} endpoints
                            </Tag>
                          </Space>
                          <Typography.Paragraph
                            style={{ marginTop: 8, marginBottom: 0 }}
                            type="secondary"
                          >
                            {route.description}
                          </Typography.Paragraph>
                        </div>
                      ))}
                    </Space>
                  </AppCard>
                </Col>
              ))}
            </Row>
          </AppCard>
        </Col>
        <Col span={24}>
          <AppCard title="Next step">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Search, pagination, create, update, and delete scaffolds are wired to the backend
              modules on the sidebar. Refresh token handling now runs internally in the auth flow,
              not as a separate management menu.
            </Typography.Paragraph>
          </AppCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

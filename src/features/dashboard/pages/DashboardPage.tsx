import { Col, Row, Statistic, Typography } from 'antd'
import { AppCard } from '@/common/components/ui/AppCard'
import { PageContainer } from '@/common/components/layout/PageContainer'

const metrics = [
  { key: 'teams', title: 'Active teams', value: 8, suffix: 'squads' },
  { key: 'members', title: 'Registered members', value: 126, suffix: 'players' },
  { key: 'fixtures', title: 'Upcoming fixtures', value: 14, suffix: 'matches' },
  { key: 'budget', title: 'Monthly budget', value: 125000000, prefix: 'VND' },
]

export function DashboardPage() {
  return (
    <PageContainer
      subtitle="Base dashboard scaffold for the football management system."
      title="Dashboard"
    >
      <Row gutter={[16, 16]}>
        {metrics.map((metric) => (
          <Col key={metric.key} lg={12} xl={6} xs={24}>
            <AppCard>
              <Statistic
                prefix={metric.prefix}
                suffix={metric.suffix}
                title={metric.title}
                value={metric.value}
              />
            </AppCard>
          </Col>
        ))}
        <Col span={24}>
          <AppCard title="Next step">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Replace the hardcoded metrics with `react-query` calls inside each feature.
            </Typography.Paragraph>
          </AppCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

import { Alert, Col, List, Row, Space, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import type { ApiEndpoint, FeatureModule } from '@/app/config/navigation'
import { EmptyState } from '@/common/components/feedback/EmptyState'
import { PageContainer } from '@/common/components/layout/PageContainer'
import { AppCard } from '@/common/components/ui/AppCard'
import { AppTable } from '@/common/components/ui/AppTable'

type FeatureScaffoldPageProps = {
  module: FeatureModule
}

const methodColors: Record<ApiEndpoint['method'], string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
}

const endpointColumns: TableColumnsType<ApiEndpoint> = [
  {
    dataIndex: 'name',
    key: 'name',
    title: 'Endpoint',
  },
  {
    dataIndex: 'method',
    key: 'method',
    title: 'Method',
    width: 120,
    render: (method: ApiEndpoint['method']) => <Tag color={methodColors[method]}>{method}</Tag>,
  },
  {
    dataIndex: 'path',
    key: 'path',
    title: 'Path',
    render: (path: string) => <Typography.Text code>{path}</Typography.Text>,
  },
]

export function FeatureScaffoldPage({ module }: FeatureScaffoldPageProps) {
  return (
    <PageContainer
      extra={<Tag color="gold">Placeholder</Tag>}
      subtitle={module.subtitle}
      title={module.title}
    >
      <Row gutter={[16, 16]}>
        <Col lg={8} xs={24}>
          <AppCard title="Backend mapping">
            <Space direction="vertical" size={10} style={{ display: 'flex' }}>
              <Tag color="processing">{module.apiCollectionName}</Tag>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {module.description}
              </Typography.Paragraph>
              <Typography.Text type="secondary">
                {module.endpoints.length} endpoint{module.endpoints.length > 1 ? 's' : ''} mapped
                into this screen.
              </Typography.Text>
            </Space>
          </AppCard>
        </Col>
        <Col lg={8} xs={24}>
          <AppCard title="Planned FE sections">
            <List
              dataSource={module.plannedSections}
              renderItem={(item) => <List.Item>{item}</List.Item>}
              split={false}
            />
          </AppCard>
        </Col>
        <Col lg={8} xs={24}>
          <AppCard title="Implementation status">
            <EmptyState description="UI details are intentionally left empty until the feature is implemented." />
          </AppCard>
        </Col>
        {module.note ? (
          <Col span={24}>
            <Alert description={module.note} message="Scaffold note" showIcon type="info" />
          </Col>
        ) : null}
        <Col span={24}>
          <AppCard title="Mapped backend endpoints">
            <AppTable<ApiEndpoint>
              columns={endpointColumns}
              dataSource={module.endpoints}
              pagination={false}
              rowKey="key"
            />
          </AppCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

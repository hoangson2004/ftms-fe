import type { PropsWithChildren, ReactNode } from 'react'
import { Space, Typography } from 'antd'

type PageContainerProps = PropsWithChildren<{
  title: string
  subtitle?: string
  extra?: ReactNode
}>

export function PageContainer({
  title,
  subtitle,
  extra,
  children,
}: PageContainerProps) {
  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <Space direction="vertical" size={4}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          ) : null}
        </Space>
        {extra}
      </div>
      {children}
    </section>
  )
}

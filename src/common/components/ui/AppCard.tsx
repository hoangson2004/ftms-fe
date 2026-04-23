import type { PropsWithChildren, ReactNode } from 'react'
import { Card } from 'antd'

type AppCardProps = PropsWithChildren<{
  title?: ReactNode
  extra?: ReactNode
}>

export function AppCard({ title, extra, children }: AppCardProps) {
  return (
    <Card
      extra={extra}
      style={{ borderRadius: 24 }}
      styles={{ body: { padding: 20 } }}
      title={title}
    >
      {children}
    </Card>
  )
}

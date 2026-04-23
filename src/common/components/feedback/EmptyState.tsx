import { Empty } from 'antd'

type EmptyStateProps = {
  description?: string
}

export function EmptyState({ description = 'No data available yet.' }: EmptyStateProps) {
  return <Empty description={description} />
}

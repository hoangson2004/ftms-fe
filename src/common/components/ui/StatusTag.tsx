import { Tag } from 'antd'

type StatusTagProps = {
  status: 'active' | 'inactive' | 'pending'
}

const colorMap: Record<StatusTagProps['status'], string> = {
  active: 'green',
  inactive: 'default',
  pending: 'gold',
}

export function StatusTag({ status }: StatusTagProps) {
  return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>
}

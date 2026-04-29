import { Tag } from 'antd'

type StatusTagProps = {
  status?: string | null
}

const colorMap: Record<string, string> = {
  active: 'green',
  inactive: 'default',
  left: 'orange',
  pending: 'gold',
  deleted: 'red',
  revoked: 'volcano',
}

export function StatusTag({ status }: StatusTagProps) {
  const normalized = String(status ?? 'unknown').toLowerCase()

  return <Tag color={colorMap[normalized] ?? 'blue'}>{normalized.toUpperCase()}</Tag>
}

import { Table } from 'antd'
import type { TableProps } from 'antd'

export function AppTable<RecordType extends object>(props: TableProps<RecordType>) {
  return <Table pagination={{ pageSize: 10, showSizeChanger: true }} rowKey="id" {...props} />
}

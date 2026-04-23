import type { PropsWithChildren } from 'react'
import { Modal } from 'antd'

type AppModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onCancel: () => void
}>

export function AppModal({ open, title, onCancel, children }: AppModalProps) {
  return (
    <Modal footer={null} onCancel={onCancel} open={open} title={title}>
      {children}
    </Modal>
  )
}

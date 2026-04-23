import { Result } from 'antd'

type ErrorStateProps = {
  title?: string
  subTitle?: string
}

export function ErrorState({
  title = 'Something went wrong',
  subTitle = 'Please try again or reload the page.',
}: ErrorStateProps) {
  return <Result status="error" subTitle={subTitle} title={title} />
}

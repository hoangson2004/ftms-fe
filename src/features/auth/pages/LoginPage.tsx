import { App, Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { getErrorMessage } from '@/common/lib/api'
import { DEMO_CREDENTIALS } from '@/common/constants/app'
import { getCurrentUser, login } from '@/features/auth/api/authApi'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((state) => state.signIn)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const result = await login(values)
      const user = result.user ?? (await getCurrentUser())

      signIn({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
        expiresInMs: result.expiresInMs,
        refreshExpiresInMs: result.refreshExpiresInMs,
        user,
      })
    },
    onSuccess: () => {
      navigate(from, { replace: true })
    },
    onError: (error) => {
      const messageText = getErrorMessage(error)

      form.setFields([
        {
          name: 'password',
          errors: [messageText],
        },
      ])
      message.error(messageText)
    },
  })

  const handleSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values)
  }

  return (
    <Card
      className="surface-card"
      style={{ width: '100%', maxWidth: 460, borderRadius: 24 }}
      styles={{ body: { padding: 32 } }}
    >
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        <div>
          <Typography.Title level={2} style={{ marginTop: 0 }}>
            Sign in
          </Typography.Title>
          <Typography.Text type="secondary">
            Login now calls the backend auth API directly.
          </Typography.Text>
        </div>

        <Alert
          className="brand-panel"
          description={
            <Space direction="vertical" size={2}>
              <Typography.Text>
                Username: <strong>{DEMO_CREDENTIALS.email}</strong>
              </Typography.Text>
              <Typography.Text>
                Password: <strong>{DEMO_CREDENTIALS.password}</strong>
              </Typography.Text>
            </Space>
          }
          message="Demo account"
          showIcon
          type="warning"
        />

        <Form<LoginFormValues>
          form={form}
          initialValues={DEMO_CREDENTIALS}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Nhập email demo.' }]}
          >
            <Input placeholder="vinh.pham@fcsaokhuya.vn" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Nhập password demo.' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Button block htmlType="submit" loading={loginMutation.isPending} size="large" type="primary">
            {loginMutation.isPending ? 'Signing in...' : 'Continue'}
          </Button>
        </Form>
      </Space>
    </Card>
  )
}

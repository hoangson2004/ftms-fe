import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { DEMO_CREDENTIALS } from '@/common/constants/app'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)

  const handleSubmit = (values: LoginFormValues) => {
    if (
      values.email !== DEMO_CREDENTIALS.email ||
      values.password !== DEMO_CREDENTIALS.password
    ) {
      form.setFields([
        {
          name: 'password',
          errors: ['Sai tài khoản demo. Dùng đúng credential được ghi bên dưới.'],
        },
      ])

      return
    }

    signIn()
    navigate('/')
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
            Demo auth đã được khóa cố định để bạn test flow đăng nhập.
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
            <Input placeholder="admin@club.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Nhập password demo.' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Button block htmlType="submit" size="large" type="primary">
            Continue
          </Button>
        </Form>
      </Space>
    </Card>
  )
}

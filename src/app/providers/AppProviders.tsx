import type { PropsWithChildren } from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/common/lib/queryClient'

const themeConfig = {
  token: {
    colorPrimary: '#0d2a4a',
    colorInfo: '#0d2a4a',
    colorSuccess: '#6fcf97',
    colorWarning: '#7ed6a5',
    colorError: '#b91c1c',
    colorBgBase: '#f8f9fb',
    colorTextBase: '#182433',
    colorBorder: '#dde5ee',
    borderRadius: 16,
    fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f8f9fb',
      siderBg: '#f8f9fb',
      headerBg: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#5d7086',
      itemSelectedBg: '#0d2a4a',
      itemSelectedColor: '#f8fbff',
      itemHoverColor: '#0d2a4a',
    },
    Button: {
      defaultBorderColor: '#dde5ee',
      defaultColor: '#182433',
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
  },
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={themeConfig}>
      <QueryClientProvider client={queryClient}>
        <AntdApp>{children}</AntdApp>
      </QueryClientProvider>
    </ConfigProvider>
  )
}

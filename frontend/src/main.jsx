import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import esES from 'antd/locale/es_ES'
import App from './App'
import './index.css'
import { useThemeStore } from './store/themeStore'

function Root() {
  const tema = useThemeStore(s => s.tema)

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: tema === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorSuccess: '#16a34a',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 8,
          fontFamily: "'DM Sans', sans-serif",
          colorBgContainer: tema === 'dark' ? '#252526' : '#ffffff',
          colorBgElevated: tema === 'dark' ? '#2d2d30' : '#ffffff',
        },
        components: {
          Menu: {
            darkItemBg: '#0f172a',
            darkSubMenuItemBg: '#1e293b',
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
)
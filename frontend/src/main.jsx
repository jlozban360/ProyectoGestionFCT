import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#2563eb',
          colorSuccess: '#16a34a',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 8,
          fontFamily: "'DM Sans', sans-serif",
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
  </React.StrictMode>
)

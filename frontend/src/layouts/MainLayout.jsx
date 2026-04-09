import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Tooltip } from 'antd'
import {
  DashboardOutlined, BankOutlined, TeamOutlined, UserOutlined,
  PhoneOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SettingOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { profesorService } from '../services/api'
import NotificacionesDrawer from '../components/NotificacionesDrawer'

const { Sider, Header, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/empresas', icon: <BankOutlined />, label: 'Empresas' },
  { key: '/contactos', icon: <PhoneOutlined />, label: 'Contactos' },
  { key: '/alumnos', icon: <TeamOutlined />, label: 'Alumnos' },
  { key: '/profesores', icon: <UserOutlined />, label: 'Profesores', adminOnly: true },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAdmin } = useAuthStore()
  const { tema, toggleTema } = useThemeStore()

  const visibleItems = menuItems
    .filter(item => !item.adminOnly || isAdmin())
    .map(({ adminOnly, ...item }) => item)

  const userMenuItems = [
    { key: 'perfil', icon: <SettingOutlined />, label: 'Mi perfil' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true },
  ]

  const handleUserMenu = ({ key }) => {
    if (key === 'logout') logout()
    if (key === 'perfil') navigate('/perfil')
  }

  const handleToggleTema = async () => {
    const nuevoTema = tema === 'light' ? 'dark' : 'light'
    toggleTema()
    try {
      await profesorService.update(user.id, {
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: true,
        tema: nuevoTema,
      })
    } catch {
      // si falla la sync con el servidor el tema local igual se aplica
    }
  }

  const selectedKey = '/' + location.pathname.split('/')[1]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        theme="dark"
        style={{
          background: '#0f172a',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 16px' : '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'padding 0.2s',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>FCT</div>
          {!collapsed && (
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                Gestión FCT
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Panel de control</div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#0f172a', border: 'none', marginTop: 8 }}
        />

        {/* User info bottom */}
        {!collapsed && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="topLeft">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '8px', borderRadius: 8,
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar size={32} style={{ background: '#2563eb', flexShrink: 0 }}>
                  {user?.nombre?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.nombre}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>
                    {user?.rol === 'ADMIN' ? 'Administrador' : 'Colaborador'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: tema === 'dark' ? '#141414' : 'white',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${tema === 'dark' ? '#303030' : '#e2e8f0'}`,
          position: 'sticky', top: 0, zIndex: 99,
          height: 64,
          transition: 'background 0.3s',
        }}>
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, cursor: 'pointer', color: '#64748b', padding: '8px' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Space size={16}>
            <Tooltip title={tema === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
              <div
                onClick={handleToggleTema}
                style={{
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: 6,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                {tema === 'light' ? <MoonOutlined /> : <SunOutlined />}
              </div>
            </Tooltip>
            <NotificacionesDrawer />
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }}>
              <Avatar size={36} style={{ background: '#2563eb', cursor: 'pointer' }}>
                {user?.nombre?.[0]?.toUpperCase()}
              </Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          padding: '24px',
          background: tema === 'dark' ? '#1f1f1f' : '#f8fafc',
          minHeight: 'calc(100vh - 64px)',
          transition: 'background 0.3s',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
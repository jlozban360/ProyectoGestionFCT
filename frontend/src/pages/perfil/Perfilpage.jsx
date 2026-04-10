import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Row, Col, message, Avatar, Switch } from 'antd'
import { UserOutlined, LockOutlined, SaveOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { profesorService } from '../../services/api'

const { Title, Text } = Typography

export default function PerfilPage() {
  const { user, setAuth, token } = useAuthStore()
  const { tema, setTema } = useThemeStore()
  const [formDatos] = Form.useForm()
  const [formPassword] = Form.useForm()
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const isDark = tema === 'dark'

  const handleDatos = async (values) => {
    setLoadingDatos(true)
    try {
      const { data } = await profesorService.update(user.id, {
        nombre: values.nombre,
        email: values.email,
        telefono: values.telefono,
        rol: user.rol,
        activo: true,
        tema: tema,
      })
      setAuth(token, data)
      message.success('Datos actualizados correctamente')
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al actualizar datos')
    } finally {
      setLoadingDatos(false)
    }
  }

  const handlePassword = async (values) => {
    if (values.nueva !== values.confirmar) {
      message.error('Las contraseñas no coinciden')
      return
    }
    setLoadingPassword(true)
    try {
      await profesorService.update(user.id, {
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: true,
        tema: tema,
        password: values.nueva,
      })
      message.success('Contraseña actualizada correctamente')
      formPassword.resetFields()
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleToggleTema = async () => {
    const nuevoTema = isDark ? 'light' : 'dark'
    setTema(nuevoTema)
    try {
      const { data } = await profesorService.update(user.id, {
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: true,
        tema: nuevoTema,
      })
      setAuth(token, data)
      message.success(`Tema ${nuevoTema === 'dark' ? 'oscuro' : 'claro'} activado`)
    } catch {
      message.error('Error al guardar preferencia de tema')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Mi perfil</Title>
        <Text type="secondary">Gestiona tus datos personales y preferencias</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={7}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Avatar
              size={80}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                fontSize: 32, fontWeight: 700,
                marginBottom: 16,
              }}
            >
              {user?.nombre?.[0]?.toUpperCase()}
            </Avatar>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user?.nombre}</div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{user?.email}</Text>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                background: user?.rol === 'ADMIN' ? '#f5f3ff' : '#eff6ff',
                color: user?.rol === 'ADMIN' ? '#7c3aed' : '#2563eb',
                padding: '2px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>
                {user?.rol === 'ADMIN' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>

            <div style={{
              padding: '16px',
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              borderRadius: 10,
              border: `1px solid ${isDark ? '#303030' : '#e2e8f0'}`,
            }}>
              <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 13 }}>Apariencia</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <SunOutlined style={{ color: !isDark ? '#d97706' : undefined, fontSize: 16 }} />
                <Switch
                  checked={isDark}
                  onChange={handleToggleTema}
                  style={{ background: isDark ? '#2563eb' : undefined }}
                />
                <MoonOutlined style={{ color: isDark ? '#2563eb' : undefined, fontSize: 16 }} />
              </div>
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={17}>
          <Card
            title={<span><UserOutlined style={{ marginRight: 8 }} />Datos personales</span>}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Form
              form={formDatos}
              layout="vertical"
              onFinish={handleDatos}
              initialValues={{
                nombre: user?.nombre,
                email: user?.email,
                telefono: user?.telefono,
              }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="nombre" label="Nombre completo" rules={[{ required: true }]}>
                    <Input placeholder="Tu nombre" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="telefono" label="Teléfono">
                    <Input placeholder="Teléfono de contacto" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                <Input placeholder="tu@email.com" />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" loading={loadingDatos} icon={<SaveOutlined />}>
                  Guardar cambios
                </Button>
              </div>
            </Form>
          </Card>

          <Card
            title={<span><LockOutlined style={{ marginRight: 8 }} />Cambiar contraseña</span>}
            style={{ borderRadius: 12 }}
          >
            <Form form={formPassword} layout="vertical" onFinish={handlePassword}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="nueva"
                    label="Nueva contraseña"
                    rules={[{ required: true }, { min: 6, message: 'Mínimo 6 caracteres' }]}
                  >
                    <Input.Password placeholder="Nueva contraseña" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="confirmar" label="Confirmar contraseña" rules={[{ required: true }]}>
                    <Input.Password placeholder="Repite la contraseña" />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" loading={loadingPassword} icon={<LockOutlined />}>
                  Cambiar contraseña
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

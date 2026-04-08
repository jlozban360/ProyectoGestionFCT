import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Row, Col, message, Avatar, Divider } from 'antd'
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { profesorService } from '../../services/api'

const { Title, Text } = Typography

export default function PerfilPage() {
  const { user, setAuth, token } = useAuthStore()
  const [formDatos] = Form.useForm()
  const [formPassword] = Form.useForm()
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const handleDatos = async (values) => {
    setLoadingDatos(true)
    try {
      const { data } = await profesorService.update(user.id, {
        nombre: values.nombre,
        email: values.email,
        telefono: values.telefono,
        rol: user.rol,
        activo: true,
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Mi perfil</Title>
        <Text style={{ color: '#64748b' }}>Gestiona tus datos personales y contraseña</Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* Avatar y resumen */}
        <Col xs={24} lg={7}>
          <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
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
            <div style={{ color: '#64748b', marginBottom: 8 }}>{user?.email}</div>
            <div>
              <span style={{
                background: user?.rol === 'ADMIN' ? '#f5f3ff' : '#eff6ff',
                color: user?.rol === 'ADMIN' ? '#7c3aed' : '#2563eb',
                padding: '2px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>
                {user?.rol === 'ADMIN' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={17}>
          {/* Datos personales */}
          <Card
            title={<span><UserOutlined style={{ marginRight: 8 }} />Datos personales</span>}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}
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
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true }, { type: 'email' }]}
              >
                <Input placeholder="tu@email.com" />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingDatos}
                  icon={<SaveOutlined />}
                >
                  Guardar cambios
                </Button>
              </div>
            </Form>
          </Card>

          {/* Cambiar contraseña */}
          <Card
            title={<span><LockOutlined style={{ marginRight: 8 }} />Cambiar contraseña</span>}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
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
                  <Form.Item
                    name="confirmar"
                    label="Confirmar contraseña"
                    rules={[{ required: true }]}
                  >
                    <Input.Password placeholder="Repite la contraseña" />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loadingPassword}
                  icon={<LockOutlined />}
                >
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
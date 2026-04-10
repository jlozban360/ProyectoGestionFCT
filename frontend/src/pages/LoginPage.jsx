import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authService } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const setTema = useThemeStore(s => s.setTema)

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      useAuthStore.getState().login(response.data);
      navigate('/');
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        message.error("Credenciales incorrectas. Revisa tu email y contraseña.");
      } 
      else if (status >= 500 || !error.response) {
        message.error("Error del servidor. El servicio no está disponible.");
      } 
      else {
        message.error("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 300 + i * 100, height: 300 + i * 100,
            borderRadius: '50%',
            border: '1px solid rgba(37,99,235,0.15)',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
      </div>

      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
            borderRadius: 14,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: 'white',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          }}>FCT</div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Gestión FCT/FFEOE
          </Title>
          <Text style={{ color: '#64748b' }}>
            Accede con tu cuenta del departamento
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Introduce tu email' },
              { type: 'email', message: 'Email no válido' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Email"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Introduce tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Contraseña"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 44,
                borderRadius: 8,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                border: 'none',
              }}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: 24, padding: '12px 16px',
          background: '#f0f9ff', borderRadius: 8,
          fontSize: 12, color: '#64748b',
          borderLeft: '3px solid #2563eb',
        }}>
          <strong>Demo:</strong> admin@fct.edu / admin123
        </div>
      </div>
    </div>
  )
}
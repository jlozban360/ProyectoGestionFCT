import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Switch, Button, Card, Row, Col, Typography, Space, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { profesorService } from '../../services/api'

const { Title, Text } = Typography
const { Option } = Select

export default function ProfesorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      profesorService.getById(id)
        .then(({ data }) => form.setFieldsValue(data))
        .catch(() => {})
    }
  }, [id])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await profesorService.update(id, values)
        message.success('Profesor actualizado')
      } else {
        await profesorService.create(values)
        message.success('Profesor creado')
      }
      navigate('/profesores')
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profesores')}>Volver</Button>
        <div>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar profesor' : 'Nuevo profesor'}</Title>
          <Text style={{ color: '#64748b' }}>Datos del profesor del departamento</Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ rol: 'COLABORADOR', activo: true }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} lg={16}>
            <Card title="Datos personales" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="nombre" label="Nombre completo" rules={[{ required: true }]}>
                    <Input placeholder="Nombre y apellidos" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="telefono" label="Teléfono">
                    <Input placeholder="Teléfono de contacto" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="email" label="Email institucional" rules={[{ required: true }, { type: 'email' }]}>
                <Input placeholder="profesor@ies.edu" />
              </Form.Item>
              {!isEdit && (
                <Form.Item name="password" label="Contraseña inicial" rules={[{ required: true }, { min: 6 }]}>
                  <Input.Password placeholder="Mínimo 6 caracteres" />
                </Form.Item>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Permisos y estado" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Form.Item name="rol" label="Rol">
                <Select>
                  <Option value="COLABORADOR">Colaborador</Option>
                  <Option value="ADMIN">Administrador</Option>
                </Select>
              </Form.Item>
              <Form.Item name="activo" label="Activo" valuePropName="checked">
                <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
              </Form.Item>
            </Card>
            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block size="large" loading={loading} icon={<SaveOutlined />}>
                  {isEdit ? 'Guardar cambios' : 'Crear profesor'}
                </Button>
                <Button block onClick={() => navigate('/profesores')}>Cancelar</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

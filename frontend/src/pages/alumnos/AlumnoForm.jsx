import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form, Input, Select, Button, Card, Row, Col, Typography, Space, message
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { alumnoService } from '../../services/api'

const { Title, Text } = Typography
const { Option } = Select

export default function AlumnoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      alumnoService.getById(id)
        .then(({ data }) => form.setFieldsValue(data))
        .catch(() => {})
    }
  }, [id])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await alumnoService.update(id, values)
        message.success('Alumno actualizado')
      } else {
        await alumnoService.create(values)
        message.success('Alumno creado')
      }
      navigate('/alumnos')
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/alumnos')}>Volver</Button>
        <div>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Editar alumno' : 'Nuevo alumno'}</Title>
          <Text style={{ color: '#64748b' }}>Datos del alumno para FCT</Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ estado: 'DISPONIBLE' }}>
        <Row gutter={[16, 0]}>
          <Col xs={24} lg={16}>
            <Card title="Datos personales" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                    <Input placeholder="Nombre" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="apellidos" label="Apellidos" rules={[{ required: true }]}>
                    <Input placeholder="Apellidos" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                    <Input placeholder="alumno@centro.edu" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="telefono" label="Teléfono">
                    <Input placeholder="Teléfono de contacto" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="observaciones" label="Observaciones">
                <Input.TextArea rows={3} placeholder="Habilidades especiales, preferencias, disponibilidad..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Datos académicos" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Form.Item name="ciclo" label="Ciclo formativo" rules={[{ required: true }]}>
                <Select placeholder="Selecciona ciclo">
                  <Option value="DAM">DAM - Desarrollo Aplicaciones Multiplataforma</Option>
                  <Option value="DAW">DAW - Desarrollo Aplicaciones Web</Option>
                  <Option value="SMR">SMR - Sistemas Microinformáticos y Redes</Option>
                  <Option value="ASIR">ASIR - Administración Sistemas Informáticos</Option>
                </Select>
              </Form.Item>
              <Form.Item name="curso" label="Curso" rules={[{ required: true }]}>
                <Select placeholder="Curso">
                  <Option value="1">1º Curso</Option>
                  <Option value="2">2º Curso</Option>
                </Select>
              </Form.Item>
              <Form.Item name="estado" label="Estado">
                <Select>
                  <Option value="DISPONIBLE">Disponible</Option>
                  <Option value="ENVIADO">Enviado a empresa</Option>
                  <Option value="ACEPTADO">Aceptado</Option>
                  <Option value="RECHAZADO">Rechazado</Option>
                  <Option value="EN_PRACTICAS">En prácticas</Option>
                </Select>
              </Form.Item>
            </Card>
            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block size="large" loading={loading} icon={<SaveOutlined />}>
                  {isEdit ? 'Guardar cambios' : 'Crear alumno'}
                </Button>
                <Button block onClick={() => navigate('/alumnos')}>Cancelar</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

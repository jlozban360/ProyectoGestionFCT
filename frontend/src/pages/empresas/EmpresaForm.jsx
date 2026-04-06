import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form, Input, Select, Switch, Button, Card, Row, Col, Typography,
  InputNumber, message, Space
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { empresaService } from '../../services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

export default function EmpresaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      empresaService.getById(id)
        .then(({ data }) => form.setFieldsValue(data))
        .catch(() => {})
    }
  }, [id])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await empresaService.update(id, values)
        message.success('Empresa actualizada')
      } else {
        await empresaService.create(values)
        message.success('Empresa creada')
      }
      navigate('/empresas')
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/empresas')}>Volver</Button>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? 'Editar empresa' : 'Nueva empresa'}
          </Title>
          <Text style={{ color: '#64748b' }}>
            {isEdit ? 'Modifica los datos de la empresa' : 'Registra una nueva empresa colaboradora'}
          </Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ activa: true }}>
        <Row gutter={[16, 0]}>
          {/* Datos generales */}
          <Col xs={24} lg={16}>
            <Card title="Datos generales" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="cif" label="CIF" rules={[{ required: true }]}>
                    <Input placeholder="B12345678" />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item name="nombre" label="Nombre de la empresa" rules={[{ required: true }]}>
                    <Input placeholder="Nombre completo de la empresa" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="sector" label="Sector" rules={[{ required: true }]}>
                    <Select placeholder="Selecciona sector">
                      <Option value="Consultoría TI">Consultoría TI</Option>
                      <Option value="Software">Software / Desarrollo</Option>
                      <Option value="Telecomunicaciones">Telecomunicaciones</Option>
                      <Option value="Banca">Banca / Finanzas</Option>
                      <Option value="Industria">Industria / Manufactura</Option>
                      <Option value="Comercio">Comercio</Option>
                      <Option value="Sanidad">Sanidad</Option>
                      <Option value="Educación">Educación</Option>
                      <Option value="Otro">Otro</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="numTrabajadores" label="Número de trabajadores">
                    <InputNumber style={{ width: '100%' }} min={1} placeholder="Ej: 250" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="direccion" label="Dirección">
                <Input placeholder="Calle, número, ciudad" />
              </Form.Item>
              <Form.Item name="observaciones" label="Observaciones internas">
                <TextArea rows={3} placeholder="Notas relevantes sobre la empresa..." />
              </Form.Item>
            </Card>

            <Card title="Contacto principal" style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="contactoPrincipal" label="Nombre del contacto" rules={[{ required: true }]}>
                    <Input placeholder="Nombre y apellidos" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="cargoContacto" label="Cargo">
                    <Input placeholder="RRHH, Director, Gerente..." />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="telefono" label="Teléfono">
                    <Input placeholder="Teléfono de contacto" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email no válido' }]}>
                    <Input placeholder="email@empresa.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Panel derecho */}
          <Col xs={24} lg={8}>
            <Card title="Colaboración FCT" style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <Form.Item name="modalidad" label="Modalidad" rules={[{ required: true }]}>
                <Select placeholder="Tipo de colaboración">
                  <Option value="FCT">FCT (Formación en centro de trabajo)</Option>
                  <Option value="DUAL">Dual</Option>
                  <Option value="CONTRATACION">Contratación</Option>
                  <Option value="MIXTA">Mixta</Option>
                </Select>
              </Form.Item>

              <Form.Item name="perfilesSolicitados" label="Perfiles que solicitan">
                <Select mode="multiple" placeholder="Selecciona ciclos">
                  <Option value="DAM">DAM (Desarrollo de Apps Multiplataforma)</Option>
                  <Option value="DAW">DAW (Desarrollo de Apps Web)</Option>
                  <Option value="SMR">SMR (Sistemas Microinformáticos)</Option>
                  <Option value="ASIR">ASIR (Admin. Sistemas Informáticos)</Option>
                  <Option value="CFGM-SMR">CFGM SMR</Option>
                </Select>
              </Form.Item>

              <Form.Item name="activa" label="Estado" valuePropName="checked">
                <Switch checkedChildren="Activa" unCheckedChildren="Inactiva" />
              </Form.Item>
            </Card>

            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary" htmlType="submit" block size="large"
                  loading={loading} icon={<SaveOutlined />}
                >
                  {isEdit ? 'Guardar cambios' : 'Crear empresa'}
                </Button>
                <Button block onClick={() => navigate('/empresas')}>
                  Cancelar
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

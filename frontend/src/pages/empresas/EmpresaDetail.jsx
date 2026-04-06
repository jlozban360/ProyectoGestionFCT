import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row, Col, Card, Typography, Tag, Button, Timeline, Modal, Form,
  Input, Select, DatePicker, message, Tabs, Table, Spin, Descriptions, Space, Avatar
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, TeamOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { empresaService, contactoService } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const resultadoColors = {
  INTERESADO: 'green',
  PENDIENTE: 'orange',
  NO_INTERESADO: 'red',
  EN_PROCESO: 'blue',
}

const tipoIcons = {
  LLAMADA: <PhoneOutlined />,
  EMAIL: <MailOutlined />,
  VISITA: <EnvironmentOutlined />,
}

// Demo empresa
const demoEmpresa = {
  id: 1, cif: 'B12345678', nombre: 'Accenture Spain', sector: 'Consultoría TI',
  modalidad: 'FCT', contactoPrincipal: 'María García', telefono: '912345678',
  email: 'rrhh@accenture.es', direccion: 'C/ Gran Vía 12, Madrid',
  numTrabajadores: 5000, activa: true,
  perfilesSolicitados: ['DAM', 'DAW'],
  observaciones: 'Empresa muy interesada en alumnos de DAM. Buen histórico de acogida.',
}

const demoContactos = [
  {
    id: 1, fecha: '2024-03-15', tipo: 'LLAMADA', motivo: 'Seguimiento plazas FCT',
    resultado: 'INTERESADO', necesidades: 'Buscan 2 alumnos DAM para verano',
    proximaAccion: 'Enviar CVs la semana que viene', profesor: { nombre: 'Manuel García' },
  },
  {
    id: 2, fecha: '2024-02-10', tipo: 'EMAIL', motivo: 'Presentación programa FCT 2024',
    resultado: 'PENDIENTE', necesidades: 'Pendiente de respuesta RRHH',
    proximaAccion: 'Llamar en 2 semanas', profesor: { nombre: 'Julia López' },
  },
]

const demoAlumnos = [
  { id: 1, nombre: 'Carlos R.', ciclo: 'DAM', estado: 'ENVIADO', fecha: '2024-03-01' },
  { id: 2, nombre: 'Sara M.', ciclo: 'DAW', estado: 'ACEPTADO', fecha: '2024-02-15' },
]

export default function EmpresaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [empresa, setEmpresa] = useState(null)
  const [contactos, setContactos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [emp, cont, alum] = await Promise.all([
          empresaService.getById(id),
          empresaService.getContactos(id),
          empresaService.getAlumnos(id),
        ])
        setEmpresa(emp.data)
        setContactos(cont.data)
        setAlumnos(alum.data)
      } catch {
        setEmpresa(demoEmpresa)
        setContactos(demoContactos)
        setAlumnos(demoAlumnos)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleAddContacto = async (values) => {
    try {
      await contactoService.create({ ...values, empresaId: id })
      message.success('Contacto registrado')
      setModalVisible(false)
      form.resetFields()
      const { data } = await empresaService.getContactos(id)
      setContactos(data)
    } catch {
      // demo mode
      const nuevo = {
        id: Date.now(),
        ...values,
        fecha: values.fecha.format('YYYY-MM-DD'),
        profesor: { nombre: user?.nombre || 'Tú' },
      }
      setContactos(prev => [nuevo, ...prev])
      setModalVisible(false)
      form.resetFields()
      message.success('Contacto añadido (demo)')
    }
  }

  const alumnosColumns = [
    { title: 'Alumno', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Ciclo', dataIndex: 'ciclo', key: 'ciclo' },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: e => <Tag color={{ ENVIADO: 'blue', ACEPTADO: 'green', RECHAZADO: 'red', PENDIENTE: 'orange' }[e]}>{e}</Tag>
    },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: d => dayjs(d).format('DD/MM/YYYY') },
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
  if (!empresa) return null

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/empresas')}>Volver</Button>
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0 }}>{empresa.nombre}</Title>
          <Text style={{ color: '#64748b' }}>{empresa.cif} · {empresa.sector}</Text>
        </div>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/empresas/${id}/editar`)}>
          Editar
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Info card */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar size={64} style={{ background: '#eff6ff', color: '#2563eb', fontSize: 24, fontWeight: 700 }}>
                {empresa.nombre[0]}
              </Avatar>
              <div style={{ marginTop: 12 }}>
                <Tag color={empresa.activa ? 'green' : 'default'}>{empresa.activa ? 'Activa' : 'Inactiva'}</Tag>
                <Tag color="blue">{empresa.modalidad}</Tag>
              </div>
            </div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Contacto">{empresa.contactoPrincipal}</Descriptions.Item>
              <Descriptions.Item label="Teléfono">{empresa.telefono}</Descriptions.Item>
              <Descriptions.Item label="Email">{empresa.email}</Descriptions.Item>
              <Descriptions.Item label="Dirección">{empresa.direccion}</Descriptions.Item>
              <Descriptions.Item label="Trabajadores">{empresa.numTrabajadores?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Perfiles">
                {empresa.perfilesSolicitados?.map(p => <Tag key={p}>{p}</Tag>)}
              </Descriptions.Item>
            </Descriptions>
            {empresa.observaciones && (
              <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>{empresa.observaciones}</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Tabs: Timeline + Alumnos */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Tabs
              defaultActiveKey="contactos"
              tabBarExtraContent={
                <Button
                  type="primary" size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                >
                  Nuevo contacto
                </Button>
              }
              items={[
                {
                  key: 'contactos',
                  label: `Contactos (${contactos.length})`,
                  children: (
                    <Timeline
                      items={contactos.map(c => ({
                        color: resultadoColors[c.resultado] || 'blue',
                        dot: tipoIcons[c.tipo],
                        children: (
                          <div style={{
                            background: '#f8fafc', borderRadius: 10,
                            padding: '12px 16px', border: '1px solid #e2e8f0',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Space>
                                <Tag>{c.tipo}</Tag>
                                <Tag color={resultadoColors[c.resultado]}>{c.resultado?.replace('_', ' ')}</Tag>
                              </Space>
                              <Text style={{ fontSize: 12, color: '#64748b' }}>
                                {dayjs(c.fecha).format('DD MMM YYYY')}
                              </Text>
                            </div>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.motivo}</div>
                            {c.necesidades && (
                              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                                <strong>Necesidades:</strong> {c.necesidades}
                              </div>
                            )}
                            {c.proximaAccion && (
                              <div style={{ fontSize: 13, color: '#2563eb' }}>
                                → {c.proximaAccion}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                              Por {c.profesor?.nombre}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  ),
                },
                {
                  key: 'alumnos',
                  label: `Alumnos (${alumnos.length})`,
                  children: (
                    <Table
                      dataSource={alumnos}
                      columns={alumnosColumns}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal nuevo contacto */}
      <Modal
        title="Registrar contacto"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields() }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddContacto} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tipo" label="Tipo de contacto" rules={[{ required: true }]}>
                <Select>
                  <Option value="LLAMADA">📞 Llamada</Option>
                  <Option value="EMAIL">📧 Email</Option>
                  <Option value="VISITA">🏢 Visita presencial</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="motivo" label="Motivo del contacto" rules={[{ required: true }]}>
            <Input placeholder="¿Por qué se realizó el contacto?" />
          </Form.Item>

          <Form.Item name="resultado" label="Resultado" rules={[{ required: true }]}>
            <Select>
              <Option value="INTERESADO">✅ Interesado</Option>
              <Option value="PENDIENTE">⏳ Pendiente de respuesta</Option>
              <Option value="NO_INTERESADO">❌ No interesado</Option>
              <Option value="EN_PROCESO">🔄 En proceso</Option>
            </Select>
          </Form.Item>

          <Form.Item name="necesidades" label="Necesidades detectadas">
            <TextArea rows={2} placeholder="Perfiles, número de plazas, fechas..." />
          </Form.Item>

          <Form.Item name="proximaAccion" label="Próxima acción recomendada">
            <Input placeholder="Qué hacer a continuación..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalVisible(false); form.resetFields() }}>Cancelar</Button>
            <Button type="primary" htmlType="submit">Guardar contacto</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

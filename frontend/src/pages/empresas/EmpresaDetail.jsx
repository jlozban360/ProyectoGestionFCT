import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row, Col, Card, Typography, Tag, Button, Timeline, Modal, Form,
  Input, Select, DatePicker, message, Tabs, Table, Spin, Descriptions, Space, Avatar, Dropdown
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, TeamOutlined, DownOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { empresaService, contactoService, alumnoService } from '../../services/api'
import { useThemeStore } from '../../store/themeStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const ESTADOS_FINALES = ['INTERESADO', 'NO_INTERESADO', 'HECHO', 'DESCARTADO']

const resultadoColors = {
  INTERESADO: 'green', PENDIENTE: 'orange', NO_INTERESADO: 'red',
  EN_PROCESO: 'blue', HECHO: 'cyan', DESCARTADO: 'default',
}

const resultadoLabel = {
  INTERESADO: 'Interesado', PENDIENTE: 'Pendiente', NO_INTERESADO: 'No interesado',
  EN_PROCESO: 'En proceso', HECHO: 'Hecho', DESCARTADO: 'Descartado',
}

// Opciones disponibles según estado actual (siempre hacia adelante)
const siguientesEstados = {
  PENDIENTE: [
    { value: 'EN_PROCESO', label: '🔄 En proceso' },
    { value: 'INTERESADO', label: '✅ Interesado' },
    { value: 'NO_INTERESADO', label: '❌ No interesado' },
    { value: 'HECHO', label: '✔️ Hecho' },
    { value: 'DESCARTADO', label: '🚫 Descartado' },
  ],
  EN_PROCESO: [
    { value: 'INTERESADO', label: '✅ Interesado' },
    { value: 'NO_INTERESADO', label: '❌ No interesado' },
    { value: 'HECHO', label: '✔️ Hecho' },
    { value: 'DESCARTADO', label: '🚫 Descartado' },
  ],
}

const tipoIcons = {
  LLAMADA: <PhoneOutlined />, EMAIL: <MailOutlined />, VISITA: <EnvironmentOutlined />,
}

function ordenarContactos(contactos) {
  const activos = contactos.filter(c => !ESTADOS_FINALES.includes(c.resultado))
    .sort((a, b) => dayjs(b.fecha).unix() - dayjs(a.fecha).unix())
  const finales = contactos.filter(c => ESTADOS_FINALES.includes(c.resultado))
    .sort((a, b) => dayjs(b.fecha).unix() - dayjs(a.fecha).unix())
  return [...activos, ...finales]
}

export default function EmpresaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [empresa, setEmpresa] = useState(null)
  const [contactos, setContactos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalContacto, setModalContacto] = useState(false)
  const [modalAlumno, setModalAlumno] = useState(false)
  const [formContacto] = Form.useForm()
  const [formAlumno] = Form.useForm()

  const tema = useThemeStore(s => s.tema)
  const isDark = tema === 'dark'
  const itemBg = isDark ? '#1e1e1e' : '#f8fafc'
  const itemBorder = isDark ? '#303030' : '#e2e8f0'
  const obsBg = isDark ? '#1a1a1a' : '#f8fafc'

  const loadData = async () => {
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
      message.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const loadAlumnosDisponibles = async () => {
    try {
      const { data } = await alumnoService.getAll({ search: '' })
      const lista = data.content || data
      setAlumnosDisponibles(lista.filter(a => a.estado === 'DISPONIBLE' || !a.empresaId))
    } catch {
      setAlumnosDisponibles([])
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleAddContacto = async (values) => {
    try {
      await contactoService.create({
        ...values,
        empresaId: Number(id),
        fecha: values.fecha.format('YYYY-MM-DD'),
      })
      message.success('Contacto registrado')
      setModalContacto(false)
      formContacto.resetFields()
      const { data } = await empresaService.getContactos(id)
      setContactos(data)
    } catch {
      message.error('Error al guardar contacto')
    }
  }

  const handleAsignarAlumno = async (values) => {
    try {
      await alumnoService.asignarEmpresa(values.alumnoId, {
        empresaId: Number(id),
        estado: values.estado,
      })
      message.success('Alumno asignado correctamente')
      setModalAlumno(false)
      formAlumno.resetFields()
      const { data } = await empresaService.getAlumnos(id)
      setAlumnos(data)
    } catch {
      message.error('Error al asignar alumno')
    }
  }

  const handleAvanzarEstado = async (contactoId, nuevoResultado) => {
    try {
      await contactoService.patchResultado(contactoId, nuevoResultado)
      const { data } = await empresaService.getContactos(id)
      setContactos(data)
      message.success(`Estado actualizado a "${resultadoLabel[nuevoResultado]}"`)
    } catch {
      message.error('Error al actualizar el estado')
    }
  }

  const handleDesvincular = async (alumnoId) => {
    try {
      await alumnoService.asignarEmpresa(alumnoId, { empresaId: null, estado: 'DISPONIBLE' })
      message.success('Alumno desvinculado')
      const { data } = await empresaService.getAlumnos(id)
      setAlumnos(data)
    } catch {
      message.error('Error al desvincular alumno')
    }
  }

  const alumnosColumns = [
    {
      title: 'Alumno', key: 'nombre',
      render: (_, r) => `${r.nombre} ${r.apellidos}`
    },
    { title: 'Ciclo', dataIndex: 'ciclo', key: 'ciclo', render: c => <Tag>{c}</Tag> },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: e => (
        <Tag color={{ ENVIADO: 'blue', ACEPTADO: 'green', RECHAZADO: 'red', PENDIENTE: 'orange', EN_PRACTICAS: 'purple' }[e]}>
          {e}
        </Tag>
      )
    },
    {
      title: '', key: 'acciones',
      render: (_, r) => (
        <Button size="small" danger onClick={() => handleDesvincular(r.id)}>
          Desvincular
        </Button>
      )
    }
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
  if (!empresa) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/empresas')}>Volver</Button>
        <div style={{ flex: 1 }}>
          <Title level={3} style={{ margin: 0 }}>{empresa.nombre}</Title>
          <Text type="secondary">{empresa.cif} · {empresa.sector}</Text>
        </div>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/empresas/${id}/editar`)}>Editar</Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12 }}>
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
              <div style={{ marginTop: 16, padding: 12, background: obsBg, borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{empresa.observaciones}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }}>
            <Tabs
              defaultActiveKey="contactos"
              items={[
                {
                  key: 'contactos',
                  label: `Contactos (${contactos.length})`,
                  children: (
                    <div>
                      <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalContacto(true)}>
                          Nuevo contacto
                        </Button>
                      </div>
                      {contactos.length === 0
                        ? <Text type="secondary">No hay contactos registrados aún</Text>
                        : (
                          <Timeline items={ordenarContactos(contactos).map(c => {
                            const esFinal = ESTADOS_FINALES.includes(c.resultado)
                            const opciones = siguientesEstados[c.resultado] || []
                            return {
                              color: resultadoColors[c.resultado] || 'blue',
                              dot: tipoIcons[c.tipo],
                              children: (
                                <div style={{
                                  background: itemBg,
                                  borderRadius: 10,
                                  padding: '12px 16px',
                                  border: `1px solid ${esFinal ? itemBorder : (c.resultado === 'PENDIENTE' ? '#fed7aa' : '#bfdbfe')}`,
                                  opacity: esFinal ? 0.75 : 1,
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Space>
                                      <Tag>{c.tipo}</Tag>
                                      <Tag color={resultadoColors[c.resultado]}>
                                        {resultadoLabel[c.resultado] || c.resultado}
                                      </Tag>
                                    </Space>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {dayjs(c.fecha).format('DD MMM YYYY')}
                                    </Text>
                                  </div>
                                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.motivo}</div>
                                  {c.necesidades && (
                                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                                      <Text type="secondary"><strong>Necesidades:</strong> {c.necesidades}</Text>
                                    </div>
                                  )}
                                  {c.proximaAccion && (
                                    <div style={{ fontSize: 13, color: '#2563eb', marginBottom: 4 }}>
                                      → {c.proximaAccion}
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      Por {c.profesor?.nombre}
                                    </Text>
                                    {!esFinal && opciones.length > 0 && (
                                      <Dropdown
                                        menu={{
                                          items: opciones.map(o => ({ key: o.value, label: o.label })),
                                          onClick: ({ key }) => handleAvanzarEstado(c.id, key),
                                        }}
                                        trigger={['click']}
                                      >
                                        <Button size="small" icon={<DownOutlined />} iconPosition="end">
                                          Actualizar estado
                                        </Button>
                                      </Dropdown>
                                    )}
                                  </div>
                                </div>
                              ),
                            }
                          })} />
                        )
                      }
                    </div>
                  ),
                },
                {
                  key: 'alumnos',
                  label: `Alumnos (${alumnos.length})`,
                  children: (
                    <div>
                      <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Button
                          type="primary"
                          icon={<TeamOutlined />}
                          onClick={() => { loadAlumnosDisponibles(); setModalAlumno(true) }}
                        >
                          Asignar alumno
                        </Button>
                      </div>
                      <Table
                        dataSource={alumnos}
                        columns={alumnosColumns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        locale={{ emptyText: 'No hay alumnos asignados' }}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Registrar contacto"
        open={modalContacto}
        onCancel={() => { setModalContacto(false); formContacto.resetFields() }}
        footer={null}
        width={600}
      >
        <Form form={formContacto} layout="vertical" onFinish={handleAddContacto} style={{ marginTop: 16 }}>
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
              <Option value="PENDIENTE">⏳ Pendiente</Option>
              <Option value="EN_PROCESO">🔄 En proceso</Option>
              <Option value="INTERESADO">✅ Interesado</Option>
              <Option value="NO_INTERESADO">❌ No interesado</Option>
              <Option value="HECHO">✔️ Hecho</Option>
              <Option value="DESCARTADO">🚫 Descartado</Option>
            </Select>
          </Form.Item>
          <Form.Item name="necesidades" label="Necesidades detectadas">
            <TextArea rows={2} placeholder="Perfiles, número de plazas, fechas..." />
          </Form.Item>
          <Form.Item name="proximaAccion" label="Próxima acción recomendada">
            <Input placeholder="Qué hacer a continuación..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalContacto(false); formContacto.resetFields() }}>Cancelar</Button>
            <Button type="primary" htmlType="submit">Guardar contacto</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Asignar alumno a esta empresa"
        open={modalAlumno}
        onCancel={() => { setModalAlumno(false); formAlumno.resetFields() }}
        footer={null}
      >
        <Form form={formAlumno} layout="vertical" onFinish={handleAsignarAlumno} style={{ marginTop: 16 }}>
          <Form.Item name="alumnoId" label="Alumno disponible" rules={[{ required: true }]}>
            <Select placeholder="Selecciona alumno" showSearch optionFilterProp="children">
              {alumnosDisponibles.map(a => (
                <Option key={a.id} value={a.id}>
                  {a.nombre} {a.apellidos} — {a.ciclo}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="estado" label="Estado inicial" initialValue="ENVIADO" rules={[{ required: true }]}>
            <Select>
              <Option value="ENVIADO">Enviado</Option>
              <Option value="ACEPTADO">Aceptado</Option>
              <Option value="PENDIENTE">Pendiente</Option>
              <Option value="EN_PRACTICAS">En prácticas</Option>
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setModalAlumno(false); formAlumno.resetFields() }}>Cancelar</Button>
            <Button type="primary" htmlType="submit">Asignar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Table, Input, Select, Tag, Space, Typography, Card, Row, Col, Button, Modal, Form, DatePicker, message
} from 'antd'
import { SearchOutlined, PlusOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { contactoService, empresaService } from '../../services/api'

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const resultadoColors = { INTERESADO: 'green', PENDIENTE: 'orange', NO_INTERESADO: 'red', EN_PROCESO: 'blue' }
const tipoIcons = { LLAMADA: <PhoneOutlined />, EMAIL: <MailOutlined />, VISITA: <EnvironmentOutlined /> }

export default function ContactosList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Inicializar filtros desde URL (navegación desde dashboard)
  const [contactos, setContactos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState(null)
  const [resultadoFilter, setResultadoFilter] = useState(null)
  const [mesFilter, setMesFilter] = useState(() => {
    const v = searchParams.get('mes')
    return v ? Number(v) : null
  })
  const [yearFilter, setYearFilter] = useState(() => {
    const v = searchParams.get('year')
    return v ? Number(v) : null
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchContactos = async () => {
    setLoading(true)
    try {
      const params = { search, tipo: tipoFilter, resultado: resultadoFilter }
      if (mesFilter)  params.mes  = mesFilter
      if (yearFilter) params.year = yearFilter
      const { data } = await contactoService.getAll(params)
      setContactos(data.content || data)
    } catch {
      setContactos([])
    } finally {
      setLoading(false)
    }
  }

  const clearFechaFilter = () => {
    setMesFilter(null)
    setYearFilter(null)
    setSearchParams({})
  }

  const fetchEmpresas = async () => {
    try {
      const { data } = await empresaService.getAll({})
      setEmpresas(data.content || data)
    } catch {
      setEmpresas([])
    }
  }

  useEffect(() => { fetchContactos() }, [search, tipoFilter, resultadoFilter, mesFilter, yearFilter])
  useEffect(() => { fetchEmpresas() }, [])

  const handleCreate = async (values) => {
    try {
      await contactoService.create({
        ...values,
        fecha: values.fecha.format('YYYY-MM-DD'),
      })
      message.success('Contacto registrado')
      setModalVisible(false)
      form.resetFields()
      fetchContactos()
    } catch {
      message.error('Error al guardar el contacto')
    }
  }

  const columns = [
    {
      title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 110,
      render: d => dayjs(d).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Empresa', key: 'empresa',
      render: (_, r) => <strong>{r.empresaNombre || r.empresa?.nombre}</strong>
    },
    {
      title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 110,
      render: t => (
        <Space size={4}>
          <Text type="secondary">{tipoIcons[t]}</Text>
          <span>{t}</span>
        </Space>
      )
    },
    { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
    {
      title: 'Resultado', dataIndex: 'resultado', key: 'resultado', width: 140,
      render: r => <Tag color={resultadoColors[r]}>{r?.replace('_', ' ')}</Tag>
    },
    {
      title: 'Necesidades', dataIndex: 'necesidades', key: 'necesidades',
      render: n => n || <Text type="secondary">—</Text>
    },
    {
      title: 'Profesor', key: 'profesor',
      render: (_, r) => <Text style={{ fontSize: 13 }}>{r.profesor?.nombre}</Text>
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Contactos</Title>
          <Space size={8} style={{ marginTop: 4 }}>
            <Text type="secondary">Historial global de todos los contactos con empresas</Text>
            {(mesFilter || yearFilter) && (
              <Tag
                color="blue"
                closable
                onClose={clearFechaFilter}
                icon={null}
              >
                {mesFilter ? `${MESES[mesFilter]} ` : ''}{yearFilter}
              </Tag>
            )}
          </Space>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setModalVisible(true)}>
          Nuevo contacto
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Input
              placeholder="Buscar por empresa, motivo..."
              prefix={<SearchOutlined />}
              value={search} onChange={e => setSearch(e.target.value)} allowClear
            />
          </Col>
          <Col>
            <Select placeholder="Tipo" style={{ width: 130 }} allowClear onChange={setTipoFilter}>
              <Option value="LLAMADA">📞 Llamada</Option>
              <Option value="EMAIL">📧 Email</Option>
              <Option value="VISITA">🏢 Visita</Option>
            </Select>
          </Col>
          <Col>
            <Select placeholder="Resultado" style={{ width: 160 }} allowClear onChange={setResultadoFilter}>
              <Option value="INTERESADO">✅ Interesado</Option>
              <Option value="PENDIENTE">⏳ Pendiente</Option>
              <Option value="NO_INTERESADO">❌ No interesado</Option>
              <Option value="EN_PROCESO">🔄 En proceso</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={contactos}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ showTotal: total => `${total} contactos`, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Registrar contacto"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields() }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="empresaId" label="Empresa" rules={[{ required: true }]}>
                <Select placeholder="Selecciona empresa" showSearch optionFilterProp="children">
                  {empresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="tipo" label="Tipo de contacto" rules={[{ required: true }]}>
                <Select>
                  <Option value="LLAMADA">📞 Llamada</Option>
                  <Option value="EMAIL">📧 Email</Option>
                  <Option value="VISITA">🏢 Visita presencial</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="resultado" label="Resultado" rules={[{ required: true }]}>
                <Select>
                  <Option value="INTERESADO">✅ Interesado</Option>
                  <Option value="PENDIENTE">⏳ Pendiente</Option>
                  <Option value="NO_INTERESADO">❌ No interesado</Option>
                  <Option value="EN_PROCESO">🔄 En proceso</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="motivo" label="Motivo del contacto" rules={[{ required: true }]}>
            <Input placeholder="¿Por qué se realizó el contacto?" />
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

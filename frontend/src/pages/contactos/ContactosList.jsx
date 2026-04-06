import { useEffect, useState } from 'react'
import {
  Table, Input, Select, Tag, Space, Typography, Card, Row, Col, DatePicker
} from 'antd'
import { SearchOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { contactoService } from '../../services/api'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const resultadoColors = { INTERESADO: 'green', PENDIENTE: 'orange', NO_INTERESADO: 'red', EN_PROCESO: 'blue' }
const tipoIcons = { LLAMADA: <PhoneOutlined />, EMAIL: <MailOutlined />, VISITA: <EnvironmentOutlined /> }

const demoData = [
  { id: 1, empresa: { nombre: 'Accenture Spain' }, tipo: 'LLAMADA', motivo: 'Seguimiento plazas FCT', resultado: 'INTERESADO', fecha: '2024-03-15', profesor: { nombre: 'Manuel García' }, necesidades: '2 alumnos DAM' },
  { id: 2, empresa: { nombre: 'Indra Sistemas' }, tipo: 'EMAIL', motivo: 'Presentación programa FCT', resultado: 'PENDIENTE', fecha: '2024-03-14', profesor: { nombre: 'Julia López' }, necesidades: null },
  { id: 3, empresa: { nombre: 'Telefónica' }, tipo: 'VISITA', motivo: 'Visita anual de seguimiento', resultado: 'NO_INTERESADO', fecha: '2024-03-12', profesor: { nombre: 'Manuel García' }, necesidades: null },
  { id: 4, empresa: { nombre: 'Capgemini' }, tipo: 'LLAMADA', motivo: 'Captación nuevas empresas', resultado: 'INTERESADO', fecha: '2024-03-10', profesor: { nombre: 'Antonio Martín' }, necesidades: '1 alumno DAW' },
  { id: 5, empresa: { nombre: 'Deloitte' }, tipo: 'EMAIL', motivo: 'Envío dossier FCT', resultado: 'PENDIENTE', fecha: '2024-03-08', profesor: { nombre: 'Julia López' }, necesidades: null },
]

export default function ContactosList() {
  const [contactos, setContactos] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState(null)
  const [resultadoFilter, setResultadoFilter] = useState(null)

  const fetchContactos = async () => {
    setLoading(true)
    try {
      const { data } = await contactoService.getAll({ search, tipo: tipoFilter, resultado: resultadoFilter })
      setContactos(data.content || data)
    } catch {
      setContactos(demoData.filter(c =>
        (!search || c.empresa.nombre.toLowerCase().includes(search.toLowerCase()) || c.motivo.toLowerCase().includes(search.toLowerCase())) &&
        (!tipoFilter || c.tipo === tipoFilter) &&
        (!resultadoFilter || c.resultado === resultadoFilter)
      ))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContactos() }, [search, tipoFilter, resultadoFilter])

  const columns = [
    {
      title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 110,
      render: d => dayjs(d).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Empresa', key: 'empresa',
      render: (_, r) => <strong>{r.empresa?.nombre}</strong>
    },
    {
      title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 110,
      render: t => (
        <Space size={4}>
          <span style={{ color: '#64748b' }}>{tipoIcons[t]}</span>
          <span>{t}</span>
        </Space>
      )
    },
    { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
    {
      title: 'Resultado', dataIndex: 'resultado', key: 'resultado', width: 140,
      render: r => <Tag color={resultadoColors[r]}>{r?.replace('_', ' ')}</Tag>
    },
    { title: 'Necesidades', dataIndex: 'necesidades', key: 'necesidades', render: n => n || <Text type="secondary">—</Text> },
    {
      title: 'Profesor', key: 'profesor',
      render: (_, r) => <Text style={{ fontSize: 13 }}>{r.profesor?.nombre}</Text>
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Contactos</Title>
        <Text style={{ color: '#64748b' }}>Historial global de todos los contactos con empresas</Text>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Input
              placeholder="Buscar por empresa, motivo..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
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

      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Table
          dataSource={contactos}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ showTotal: total => `${total} contactos`, showSizeChanger: true }}
        />
      </Card>
    </div>
  )
}

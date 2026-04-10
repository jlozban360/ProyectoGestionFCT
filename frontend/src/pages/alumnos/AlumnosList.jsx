import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Input, Select, Tag, Space, Typography, Card,
  Popconfirm, message, Tooltip, Row, Col, Avatar
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { alumnoService } from '../../services/api'

const { Title, Text } = Typography
const { Option } = Select

const estadoConfig = {
  DISPONIBLE: { color: 'green', label: 'Disponible' },
  ENVIADO: { color: 'blue', label: 'Enviado' },
  ACEPTADO: { color: 'success', label: 'Aceptado' },
  RECHAZADO: { color: 'red', label: 'Rechazado' },
  EN_PRACTICAS: { color: 'purple', label: 'En prácticas' },
}

const demoAlumnos = [
  { id: 1, nombre: 'Carlos Rodríguez', apellidos: 'García', ciclo: 'DAM', curso: '2', email: 'carlos@alumno.es', estado: 'ENVIADO', empresa: 'Accenture Spain' },
  { id: 2, nombre: 'Sara', apellidos: 'Martínez López', ciclo: 'DAW', curso: '2', email: 'sara@alumno.es', estado: 'ACEPTADO', empresa: 'Indra Sistemas' },
  { id: 3, nombre: 'Miguel', apellidos: 'Fernández', ciclo: 'SMR', curso: '2', email: 'miguel@alumno.es', estado: 'DISPONIBLE', empresa: null },
  { id: 4, nombre: 'Laura', apellidos: 'Sánchez Ruiz', ciclo: 'DAM', curso: '1', email: 'laura@alumno.es', estado: 'DISPONIBLE', empresa: null },
]

export default function AlumnosList() {
  const navigate = useNavigate()
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [cicloFilter, setCicloFilter] = useState(null)

  const fetchAlumnos = async () => {
    setLoading(true)
    try {
      const { data } = await alumnoService.getAll({ search, ciclo: cicloFilter })
      setAlumnos(data.content || data)
    } catch {
      setAlumnos(demoAlumnos.filter(a =>
        (!search || `${a.nombre} ${a.apellidos}`.toLowerCase().includes(search.toLowerCase())) &&
        (!cicloFilter || a.ciclo === cicloFilter)
      ))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlumnos() }, [search, cicloFilter])

  const handleDelete = async (id) => {
    try {
      await alumnoService.delete(id)
      message.success('Alumno eliminado')
      fetchAlumnos()
    } catch {
      message.error('No se pudo eliminar')
    }
  }

  const columns = [
    {
      title: 'Alumno', key: 'alumno',
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
            {r.nombre[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nombre} {r.apellidos}</div>
            <div style={{ fontSize: 12 }}><Text type="secondary">{r.email}</Text></div>
          </div>
        </Space>
      )
    },
    { title: 'Ciclo', dataIndex: 'ciclo', key: 'ciclo', render: c => <Tag>{c}</Tag> },
    { title: 'Curso', dataIndex: 'curso', key: 'curso', render: c => `${c}º` },
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa', render: e => e || <Text type="secondary">Sin asignar</Text> },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: e => {
        const cfg = estadoConfig[e] || { color: 'default', label: e }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    {
      title: 'Acciones', key: 'acciones', width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/alumnos/${r.id}/editar`)} />
          </Tooltip>
          <Popconfirm title="¿Eliminar este alumno?" onConfirm={() => handleDelete(r.id)} okText="Sí" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Alumnos</Title>
          <Text type="secondary">Gestión de alumnos disponibles para FCT</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/alumnos/nuevo')} size="large">
          Nuevo alumno
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Input
              placeholder="Buscar alumno..."
              prefix={<SearchOutlined />}
              value={search} onChange={e => setSearch(e.target.value)} allowClear
            />
          </Col>
          <Col>
            <Select placeholder="Ciclo" style={{ width: 160 }} allowClear onChange={setCicloFilter}>
              <Option value="DAM">DAM</Option>
              <Option value="DAW">DAW</Option>
              <Option value="SMR">SMR</Option>
              <Option value="ASIR">ASIR</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={alumnos} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </div>
  )
}

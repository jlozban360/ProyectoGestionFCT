import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Tag, Space, Typography, Card, Popconfirm, message,
  Tooltip, Avatar, Input, Select, Row, Col
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { profesorService } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const { Title, Text } = Typography
const { Option } = Select

const demoData = [
  { id: 1, nombre: 'Manuel García', email: 'manuel.garcia@ies.edu', telefono: '600111222', rol: 'ADMIN', activo: true, totalContactos: 18 },
  { id: 2, nombre: 'Julia López', email: 'julia.lopez@ies.edu', telefono: '600333444', rol: 'COLABORADOR', activo: true, totalContactos: 9 },
  { id: 3, nombre: 'Antonio Martín', email: 'antonio.martin@ies.edu', telefono: '600555666', rol: 'COLABORADOR', activo: false, totalContactos: 6 },
]

const ROL_CONFIG = {
  SUPERADMIN: { color: 'red', label: 'Superadministrador' },
  ADMIN: { color: 'purple', label: 'Administrador' },
  COLABORADOR: { color: 'blue', label: 'Colaborador' },
}

const ROL_ORDER = { SUPERADMIN: 0, ADMIN: 1, COLABORADOR: 2 }

export default function ProfesoresList() {
  const navigate = useNavigate()
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin())
  const [profesores, setProfesores] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activoFilter, setActivoFilter] = useState(null)

  const fetchProfesores = async () => {
    setLoading(true)
    try {
      const { data } = await profesorService.getAll()
      setProfesores(data)
    } catch {
      setProfesores(demoData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfesores() }, [])

  const handleDelete = async (id) => {
    try {
      await profesorService.delete(id)
      message.success('Profesor eliminado')
      fetchProfesores()
    } catch (err) {
      message.error(err.response?.data?.message || 'No se pudo eliminar')
    }
  }

  const filtered = profesores.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search || (
      p.nombre?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.telefono?.toLowerCase().includes(q)
    )
    const matchActivo = activoFilter === null || p.activo === activoFilter
    return matchSearch && matchActivo
  })

  const canDelete = (r) => {
    if (r.rol === 'SUPERADMIN') return false
    if (r.rol === 'ADMIN' && !isSuperAdmin) return false
    return true
  }

  const columns = [
    {
      title: 'Profesor', key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      defaultSortOrder: 'ascend',
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: '#f5f3ff', color: '#7c3aed', fontWeight: 700 }}>
            {r.nombre[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nombre}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      )
    },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    {
      title: 'Rol', dataIndex: 'rol', key: 'rol',
      sorter: (a, b) => (ROL_ORDER[a.rol] ?? 3) - (ROL_ORDER[b.rol] ?? 3),
      render: r => {
        const cfg = ROL_CONFIG[r] ?? { color: 'default', label: r }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    {
      title: 'Contactos realizados', dataIndex: 'totalContactos', key: 'totalContactos',
      sorter: (a, b) => (a.totalContactos ?? 0) - (b.totalContactos ?? 0),
      render: n => <strong>{n ?? 0}</strong>
    },
    {
      title: 'Estado', dataIndex: 'activo', key: 'activo',
      sorter: (a, b) => Number(b.activo) - Number(a.activo),
      render: a => <Tag color={a ? 'green' : 'default'}>{a ? 'Activo' : 'Inactivo'}</Tag>
    },
    {
      title: 'Acciones', key: 'acciones', width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/profesores/${r.id}/editar`)} />
          </Tooltip>
          {canDelete(r) ? (
            <Popconfirm title="¿Eliminar este profesor?" onConfirm={() => handleDelete(r.id)} okText="Sí" cancelText="No">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : (
            <Tooltip title={r.rol === 'SUPERADMIN' ? 'No se puede eliminar el superadministrador' : 'Solo el superadministrador puede eliminar administradores'}>
              <Button size="small" danger icon={<DeleteOutlined />} disabled />
            </Tooltip>
          )}
        </Space>
      )
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Profesores</Title>
          <Text type="secondary">Gestión de profesores del departamento</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/profesores/nuevo')} size="large">
          Nuevo profesor
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Estado"
              style={{ width: 160 }}
              allowClear
              onChange={v => setActivoFilter(v ?? null)}
            >
              <Option value={true}>Activo</Option>
              <Option value={false}>Inactivo</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ showSizeChanger: true, showTotal: total => `${total} profesores` }}
        />
      </Card>
    </div>
  )
}

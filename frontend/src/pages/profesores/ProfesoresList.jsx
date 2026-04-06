import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Tag, Space, Typography, Card, Popconfirm, message, Tooltip, Avatar
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { profesorService } from '../../services/api'

const { Title, Text } = Typography

const demoData = [
  { id: 1, nombre: 'Manuel García', email: 'manuel.garcia@ies.edu', telefono: '600111222', rol: 'ADMIN', activo: true, totalContactos: 18 },
  { id: 2, nombre: 'Julia López', email: 'julia.lopez@ies.edu', telefono: '600333444', rol: 'COLABORADOR', activo: true, totalContactos: 9 },
  { id: 3, nombre: 'Antonio Martín', email: 'antonio.martin@ies.edu', telefono: '600555666', rol: 'COLABORADOR', activo: true, totalContactos: 6 },
]

export default function ProfesoresList() {
  const navigate = useNavigate()
  const [profesores, setProfesores] = useState([])
  const [loading, setLoading] = useState(false)

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
    } catch {
      message.error('No se pudo eliminar')
    }
  }

  const columns = [
    {
      title: 'Profesor', key: 'profesor',
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: '#f5f3ff', color: '#7c3aed', fontWeight: 700 }}>
            {r.nombre[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nombre}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{r.email}</div>
          </div>
        </Space>
      )
    },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    {
      title: 'Rol', dataIndex: 'rol', key: 'rol',
      render: r => <Tag color={r === 'ADMIN' ? 'purple' : 'blue'}>{r === 'ADMIN' ? 'Administrador' : 'Colaborador'}</Tag>
    },
    {
      title: 'Contactos realizados', dataIndex: 'totalContactos', key: 'totalContactos',
      render: n => <strong>{n}</strong>
    },
    {
      title: 'Estado', dataIndex: 'activo', key: 'activo',
      render: a => <Tag color={a ? 'green' : 'default'}>{a ? 'Activo' : 'Inactivo'}</Tag>
    },
    {
      title: 'Acciones', key: 'acciones', width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/profesores/${r.id}/editar`)} />
          </Tooltip>
          <Popconfirm title="¿Eliminar este profesor?" onConfirm={() => handleDelete(r.id)} okText="Sí" cancelText="No">
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
          <Title level={3} style={{ margin: 0 }}>Profesores</Title>
          <Text style={{ color: '#64748b' }}>Gestión de profesores del departamento</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/profesores/nuevo')} size="large">
          Nuevo profesor
        </Button>
      </div>
      <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Table dataSource={profesores} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </div>
  )
}

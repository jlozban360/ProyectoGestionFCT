import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Input, Select, Tag, Space, Typography, Card,
  Popconfirm, message, Tooltip, Row, Col
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined
} from '@ant-design/icons'
import { empresaService } from '../../services/api'

const { Title, Text } = Typography
const { Option } = Select

const modalidadColors = {
  FCT: 'blue',
  DUAL: 'purple',
  CONTRATACION: 'green',
  MIXTA: 'orange',
}

export default function EmpresasList() {
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchEmpresas = async (page = 1, pageSize) => {
    const size = pageSize || pagination.pageSize
    setLoading(true)
    try {
      const { data } = await empresaService.getAll({
        page: page - 1,
        size,
        search,
        sector: sectorFilter,
      })
      setEmpresas(data.content || data)
      setPagination(p => ({ ...p, total: data.totalElements || data.length, current: page, pageSize: size }))
    } catch {
      setEmpresas([
        { id: 1, cif: 'B12345678', nombre: 'Accenture Spain', sector: 'Consultoría TI', modalidad: 'FCT', contactoPrincipal: 'María García', telefono: '912345678', activa: true },
        { id: 2, cif: 'A87654321', nombre: 'Indra Sistemas', sector: 'Software', modalidad: 'DUAL', contactoPrincipal: 'Carlos López', telefono: '913456789', activa: true },
        { id: 3, cif: 'B11223344', nombre: 'Telefónica', sector: 'Telecomunicaciones', modalidad: 'CONTRATACION', contactoPrincipal: 'Ana Martín', telefono: '914567890', activa: false },
        { id: 4, cif: 'A99887766', nombre: 'Capgemini', sector: 'Consultoría TI', modalidad: 'FCT', contactoPrincipal: 'Pedro Sanz', telefono: '915678901', activa: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmpresas() }, [search, sectorFilter])

  const handleDelete = async (id) => {
    try {
      await empresaService.delete(id)
      message.success('Empresa eliminada')
      fetchEmpresas()
    } catch {
      message.error('No se pudo eliminar')
    }
  }

  const columns = [
    {
      title: 'Empresa', key: 'empresa',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nombre}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.cif}</Text>
        </div>
      )
    },
    { title: 'Sector', dataIndex: 'sector', key: 'sector' },
    {
      title: 'Modalidad', dataIndex: 'modalidad', key: 'modalidad',
      render: m => <Tag color={modalidadColors[m] || 'default'}>{m}</Tag>
    },
    { title: 'Contacto', dataIndex: 'contactoPrincipal', key: 'contactoPrincipal' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    {
      title: 'Estado', dataIndex: 'activa', key: 'activa',
      render: a => <Tag color={a ? 'green' : 'default'}>{a ? 'Activa' : 'Inactiva'}</Tag>
    },
    {
      title: 'Acciones', key: 'acciones', width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/empresas/${r.id}`)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/empresas/${r.id}/editar`)} />
          </Tooltip>
          <Popconfirm title="¿Eliminar esta empresa?" onConfirm={() => handleDelete(r.id)} okText="Sí" cancelText="No">
            <Tooltip title="Eliminar">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Empresas</Title>
          <Text type="secondary">Gestión de empresas colaboradoras</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/empresas/nueva')} size="large">
          Nueva empresa
        </Button>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Input
              placeholder="Buscar por nombre, CIF..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select placeholder="Sector" style={{ width: 180 }} allowClear onChange={setSectorFilter}>
              <Option value="Consultoría TI">Consultoría TI</Option>
              <Option value="Software">Software</Option>
              <Option value="Telecomunicaciones">Telecomunicaciones</Option>
              <Option value="Banca">Banca</Option>
              <Option value="Industria">Industria</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={empresas}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `${total} empresas`,
            onChange: fetchEmpresas,
          }}
        />
      </Card>
    </div>
  )
}

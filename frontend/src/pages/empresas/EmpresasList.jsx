import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, Button, Input, Select, Tag, Space, Typography, Card,
  Popconfirm, message, Tooltip, Row, Col, Switch
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

const demoEmpresas = [
  { id: 1, cif: 'B12345678', nombre: 'Accenture Spain', sector: 'Consultoría TI', modalidad: 'FCT', contactoPrincipal: 'María García', telefono: '912345678', activa: true },
  { id: 2, cif: 'A87654321', nombre: 'Indra Sistemas', sector: 'Software', modalidad: 'DUAL', contactoPrincipal: 'Carlos López', telefono: '913456789', activa: true },
  { id: 3, cif: 'B11223344', nombre: 'Telefónica', sector: 'Telecomunicaciones', modalidad: 'CONTRATACION', contactoPrincipal: 'Ana Martín', telefono: '914567890', activa: false },
  { id: 4, cif: 'A99887766', nombre: 'Capgemini', sector: 'Consultoría TI', modalidad: 'FCT', contactoPrincipal: 'Pedro Sanz', telefono: '915678901', activa: true },
]

export default function EmpresasList() {
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState(null)
  const [modalidadFilter, setModalidadFilter] = useState(null)
  const [soloActivas, setSoloActivas] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [sortInfo, setSortInfo] = useState({ columnKey: 'nombre', order: 'ascend' })

  const fetchEmpresas = async (page = 1, pageSize = pagination.pageSize, si = sortInfo, sa = soloActivas) => {
    setLoading(true)
    try {
      const params = { page: page - 1, size: pageSize, search, sector: sectorFilter, modalidad: modalidadFilter, ...(sa && { activa: 'true' }) }
      if (si?.order) {
        params.sortBy = si.columnKey
        params.sortDir = si.order === 'ascend' ? 'ASC' : 'DESC'
      }
      const { data } = await empresaService.getAll(params)
      setEmpresas(data.content || data)
      setPagination(p => ({ ...p, total: data.totalElements || data.length, current: page, pageSize }))
    } catch {
      setEmpresas(demoEmpresas)
      setPagination(p => ({ ...p, current: 1, total: demoEmpresas.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmpresas(1, pagination.pageSize, sortInfo, soloActivas) }, [search, sectorFilter, modalidadFilter, soloActivas])

  const handleTableChange = (pag, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    const newInfo = s?.order ? { columnKey: s.columnKey ?? s.field, order: s.order } : null
    setSortInfo(newInfo)
    fetchEmpresas(pag.current, pag.pageSize, newInfo, soloActivas)
  }

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
      title: 'Empresa',
      key: 'nombre',
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
      sortOrder: sortInfo?.columnKey === 'nombre' ? sortInfo.order : null,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.nombre}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.cif}</Text>
        </div>
      )
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      sorter: (a, b) => (a.sector || '').localeCompare(b.sector || ''),
      sortOrder: sortInfo?.columnKey === 'sector' ? sortInfo.order : null,
    },
    {
      title: 'Modalidad',
      dataIndex: 'modalidad',
      key: 'modalidad',
      sorter: (a, b) => (a.modalidad || '').localeCompare(b.modalidad || ''),
      sortOrder: sortInfo?.columnKey === 'modalidad' ? sortInfo.order : null,
      render: m => <Tag color={modalidadColors[m] || 'default'}>{m}</Tag>
    },
    { title: 'Contacto', dataIndex: 'contactoPrincipal', key: 'contactoPrincipal' },
    { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
    {
      title: 'Estado',
      dataIndex: 'activa',
      key: 'activa',
      sorter: (a, b) => (a.activa === b.activa ? 0 : a.activa ? -1 : 1),
      sortOrder: sortInfo?.columnKey === 'activa' ? sortInfo.order : null,
      render: a => <Tag color={a ? 'green' : 'default'}>{a ? 'Activa' : 'Inactiva'}</Tag>
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
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

      <Card style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[12, 8]} align="middle" wrap>
          <Col flex={1} style={{ minWidth: 200 }}>
            <Input
              placeholder="Buscar por nombre, CIF, contacto, teléfono..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select placeholder="Modalidad" style={{ minWidth: 130 }} allowClear onChange={setModalidadFilter}>
              {['FCT', 'DUAL', 'CONTRATACION', 'MIXTA'].map(m => (
                <Option key={m} value={m}>
                  <Tag color={modalidadColors[m]} style={{ margin: 0 }}>{m}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select placeholder="Sector" style={{ minWidth: 180 }} allowClear onChange={setSectorFilter}>
              {[
                'Tecnología', 'Desarrollo Software', 'Consultoría TI', 'Cloud & Datos',
                'Ciberseguridad', 'Telecomunicaciones', 'SaaS', 'E-commerce', 'Big Data',
                'IA & Machine Learning', 'Fintech', 'Marketing Digital', 'Videojuegos',
                'DevOps', 'Robótica & IoT', 'HealthTech', 'EdTech', 'Aeroespacial / TI',
                'Formación TI', 'Retail / Tecnología', 'SaaS / RRHH',
              ].map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Col>
          <Col>
            <Switch
              checked={soloActivas}
              onChange={setSoloActivas}
              checkedChildren="Activas"
              unCheckedChildren="Todas"
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={empresas}
          columns={columns}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `${total} empresas`,
          }}
        />
      </Card>
    </div>
  )
}

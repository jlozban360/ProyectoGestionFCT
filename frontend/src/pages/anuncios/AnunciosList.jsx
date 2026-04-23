import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography, Button, Card, Row, Col, Input, Select, Tag, Space,
  Tooltip, Popconfirm, Empty, Pagination, Avatar, Spin, message,
  Switch, Modal, Divider,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  PushpinOutlined, PushpinFilled, BankOutlined, TeamOutlined,
  InfoCircleOutlined, AlertOutlined, CalendarOutlined, ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { anuncioService } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const TIPO_CONFIG = {
  OFERTA:  { color: '#1677ff', label: 'Oferta',  icon: <BankOutlined />,       tagColor: 'blue'   },
  DEMANDA: { color: '#d97706', label: 'Demanda', icon: <TeamOutlined />,       tagColor: 'gold'   },
  INFO:    { color: '#16a34a', label: 'Info',    icon: <InfoCircleOutlined />, tagColor: 'green'  },
  URGENTE: { color: '#ff4d4f', label: 'Urgente', icon: <AlertOutlined />,      tagColor: 'red'    },
}

const DEMO_ANUNCIOS = [
  {
    id: 1, titulo: 'Indra Sistemas busca 3 alumnos DAM para prácticas', tipo: 'OFERTA', ciclo: 'DAM', numPlazas: 3,
    empresa: 'Indra Sistemas', empresaId: 1, autor: 'María González', autorId: 1,
    contenido: 'Indra Sistemas abre 3 plazas de prácticas FCT para alumnos de 2º DAM. Perfiles junior con conocimientos en Java, Spring Boot y bases de datos relacionales. El proyecto se desarrollará en las oficinas de Alcobendas. Alta posibilidad de contratación al finalizar.',
    activo: true, destacado: true, fechaInicio: '2026-04-01', fechaFin: '2026-06-30', createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 2, titulo: '¡URGENTE! Empresa cancela plazas — necesitamos alternativa', tipo: 'URGENTE', ciclo: null, numPlazas: null,
    empresa: null, empresaId: null, autor: 'Fernando Cano', autorId: 16,
    contenido: 'Grupo Soluciones IT ha cancelado sus 3 plazas previstas para mayo. Necesitamos encontrar empresas alternativas para los alumnos DAM ya comprometidos. Por favor, si conocéis empresas interesadas, contactad con el departamento a la mayor brevedad posible.',
    activo: true, destacado: true, fechaInicio: null, fechaFin: null, createdAt: '2026-04-20T08:00:00Z',
  },
  {
    id: 3, titulo: 'ASIR — 3 alumnos sin empresa, plazo cierra en 10 días', tipo: 'URGENTE', ciclo: 'ASIR', numPlazas: 3,
    empresa: null, empresaId: null, autor: 'Pablo Ruiz', autorId: 6,
    contenido: 'Quedan 3 alumnos de 2º ASIR sin empresa asignada y el plazo finaliza en 10 días. Redes Cisco, virtualización VMware, administración Windows Server y Linux. Se admiten empresas fuera de Madrid.',
    activo: true, destacado: true, fechaInicio: null, fechaFin: '2026-04-30', createdAt: '2026-04-21T08:30:00Z',
  },
  {
    id: 4, titulo: 'Telefónica Tech — 2 plazas DAW disponibles', tipo: 'OFERTA', ciclo: 'DAW', numPlazas: 2,
    empresa: 'Telefónica Tech', empresaId: 2, autor: 'Luis Martínez', autorId: 2,
    contenido: 'Telefónica Tech abre 2 plazas de prácticas para alumnos de 2º DAW. Se requiere conocimiento de React, TypeScript y APIs REST con Node.js. Modalidad presencial en Gran Vía, Madrid.',
    activo: true, destacado: false, fechaInicio: '2026-05-01', fechaFin: '2026-07-31', createdAt: '2026-04-15T09:30:00Z',
  },
  {
    id: 5, titulo: '5 alumnos DAW disponibles para prácticas inmediatas', tipo: 'DEMANDA', ciclo: 'DAW', numPlazas: 5,
    empresa: null, empresaId: null, autor: 'Carmen López', autorId: 3,
    contenido: 'El departamento tiene 5 alumnos de 2º DAW disponibles para comenzar prácticas de forma inmediata. Perfiles con React, Vue.js y APIs REST. Modalidad remota o presencial.',
    activo: true, destacado: false, fechaInicio: null, fechaFin: null, createdAt: '2026-04-18T11:00:00Z',
  },
  {
    id: 6, titulo: 'Accenture España — convocatoria abierta todos los ciclos', tipo: 'OFERTA', ciclo: null, numPlazas: 8,
    empresa: 'Accenture España', empresaId: 10, autor: 'Javier Sánchez', autorId: 4,
    contenido: 'Accenture España abre su convocatoria anual con 8 plazas para todos los ciclos: DAM, DAW, ASIR y SMR. Entrevistas la semana del 5 de mayo en sus oficinas de Joaquín Costa.',
    activo: true, destacado: false, fechaInicio: '2026-05-15', fechaFin: '2026-09-15', createdAt: '2026-04-17T16:30:00Z',
  },
  {
    id: 7, titulo: 'Alumnos SMR buscan empresa — 4 plazas libres', tipo: 'DEMANDA', ciclo: 'SMR', numPlazas: 4,
    empresa: null, empresaId: null, autor: 'Ana Fernández', autorId: 5,
    contenido: '4 alumnos de 2º SMR sin empresa asignada. Redes, sistemas Windows/Linux, virtualización Hyper-V y soporte técnico nivel 1/2. Disponibles desde el 1 de mayo.',
    activo: true, destacado: false, fechaInicio: null, fechaFin: null, createdAt: '2026-04-19T10:15:00Z',
  },
  {
    id: 8, titulo: 'Reunión coordinación FCT — 30 de abril a las 10:00h', tipo: 'INFO', ciclo: null, numPlazas: null,
    empresa: null, empresaId: null, autor: 'Fernando Cano', autorId: 16,
    contenido: 'Convocatoria de reunión de coordinación FCT el miércoles 30 de abril a las 10:00h en la sala B-204. Asistencia obligatoria para todos los tutores con alumnos asignados.',
    activo: true, destacado: false, fechaInicio: null, fechaFin: null, createdAt: '2026-04-21T14:00:00Z',
  },
  {
    id: 9, titulo: 'Nuevos convenios firmados con el parque tecnológico de Paterna', tipo: 'INFO', ciclo: null, numPlazas: null,
    empresa: null, empresaId: null, autor: 'María González', autorId: 1,
    contenido: 'El departamento ha firmado nuevos convenios con 5 empresas del parque tecnológico de Paterna: Lynx Tech Solutions, iQBit, Novait, Apliter y Thinkingroup. Consultad el apartado Empresas para más detalles.',
    activo: true, destacado: false, fechaInicio: null, fechaFin: null, createdAt: '2026-04-22T09:00:00Z',
  },
  {
    id: 10, titulo: 'Recordatorio: entrega de memorias — fecha límite 15 de mayo', tipo: 'INFO', ciclo: null, numPlazas: null,
    empresa: null, empresaId: null, autor: 'Fernando Cano', autorId: 16,
    contenido: 'Fecha límite para entrega de memorias de prácticas: 15 de mayo. Los tutores de empresa deben tener cumplimentada la evaluación intermedia antes del 30 de abril.',
    activo: true, destacado: false, fechaInicio: null, fechaFin: '2026-05-15', createdAt: '2026-04-20T12:00:00Z',
  },
  {
    id: 11, titulo: 'DataCloud Spain busca perfil Python/Data Science', tipo: 'OFERTA', ciclo: 'DAM', numPlazas: 1,
    empresa: 'DataCloud Spain', empresaId: 4, autor: 'Roberto Álvarez', autorId: 8,
    contenido: 'DataCloud Spain necesita un alumno de 2º DAM con conocimientos de Python y PostgreSQL. Proyecto de migración a cloud. Posibilidad real de incorporación directa al finalizar las prácticas.',
    activo: true, destacado: false, fechaInicio: '2026-05-01', fechaFin: '2026-07-31', createdAt: '2026-04-16T13:00:00Z',
  },
  {
    id: 12, titulo: 'Novait — empresa interesada en contratar tras prácticas', tipo: 'OFERTA', ciclo: 'DAW', numPlazas: 2,
    empresa: 'Novait', empresaId: 25, autor: 'Luis Martínez', autorId: 2,
    contenido: 'Novait (Valencia) ha manifestado interés en contratar a los alumnos de prácticas. Empresa pequeña con proyectos modernos en React, Node.js y PostgreSQL. Plazas por orden de solicitud.',
    activo: true, destacado: false, fechaInicio: '2026-05-01', fechaFin: '2026-08-31', createdAt: '2026-04-23T08:00:00Z',
  },
  {
    id: 13, titulo: 'Typeform Barcelona — oferta expirada (referencia)', tipo: 'OFERTA', ciclo: 'DAW', numPlazas: 2,
    empresa: 'Typeform', empresaId: 18, autor: 'Roberto Álvarez', autorId: 8,
    contenido: 'Typeform buscaba 2 alumnos DAW con nivel B2 de inglés. La oferta ya ha sido cubierta; se deja como referencia para futuras convocatorias similares.',
    activo: false, destacado: false, fechaInicio: '2026-03-01', fechaFin: '2026-04-01', createdAt: '2026-03-10T10:00:00Z',
  },
]

export default function AnunciosList() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthStore()
  const { tema } = useThemeStore()
  const isDark = tema === 'dark'

  const [anuncios, setAnuncios]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [search, setSearch]             = useState('')
  const [filterTipo, setFilterTipo]     = useState(null)
  const [filterCiclo, setFilterCiclo]   = useState(null)
  const [soloActivos, setSoloActivos]   = useState(true)
  const [pagination, setPagination]       = useState({ current: 1, pageSize: 9, total: 0 })
  const [detailAnuncio, setDetailAnuncio] = useState(null)

  const applyDemoFilters = useCallback((page = 1, pageSize = 9) => {
    const filtered = DEMO_ANUNCIOS.filter(a => {
      if (soloActivos && !a.activo) return false
      if (filterTipo  && a.tipo  !== filterTipo)  return false
      if (filterCiclo && a.ciclo !== filterCiclo) return false
      if (search) {
        const q = search.toLowerCase()
        if (!a.titulo.toLowerCase().includes(q) && !a.contenido.toLowerCase().includes(q)) return false
      }
      return true
    })
    filtered.sort((a, b) => Number(b.destacado) - Number(a.destacado) || new Date(b.createdAt) - new Date(a.createdAt))
    setAnuncios(filtered.slice((page - 1) * pageSize, page * pageSize))
    setPagination(p => ({ ...p, current: page, pageSize, total: filtered.length }))
  }, [search, filterTipo, filterCiclo, soloActivos])

  const fetchAnuncios = useCallback(async (page = 1, pageSize = 9) => {
    setLoading(true)
    try {
      const { data } = await anuncioService.getAll({
        page: page - 1,
        size: pageSize,
        ...(search      && { search }),
        ...(filterTipo  && { tipo:  filterTipo }),
        ...(filterCiclo && { ciclo: filterCiclo }),
        activo: soloActivos ? 'true' : 'all',
      })
      setAnuncios(data.content)
      setPagination(p => ({ ...p, current: page, pageSize, total: data.totalElements }))
    } catch {
      applyDemoFilters(page, pageSize)
    } finally {
      setLoading(false)
    }
  }, [search, filterTipo, filterCiclo, soloActivos, applyDemoFilters])

  useEffect(() => {
    fetchAnuncios(1, pagination.pageSize)
  }, [search, filterTipo, filterCiclo, soloActivos])

  const handleDelete = async (id) => {
    try {
      await anuncioService.delete(id)
      message.success('Anuncio eliminado')
      fetchAnuncios(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Error al eliminar el anuncio')
    }
  }

  const handleToggleDestacado = async (id) => {
    try {
      await anuncioService.toggleDestacado(id)
      fetchAnuncios(pagination.current, pagination.pageSize)
    } catch {
      message.error('Error al cambiar el estado del anuncio')
    }
  }

  const canEdit   = (a) => isAdmin() || a.autorId === user?.id
  const isExpired = (a) => a.fechaFin && dayjs(a.fechaFin).isBefore(dayjs(), 'day')

  // ── Detail modal ────────────────────────────────────────────────────────────
  const DetailModal = () => {
    if (!detailAnuncio) return null
    const a   = detailAnuncio
    const cfg = TIPO_CONFIG[a.tipo] ?? TIPO_CONFIG.INFO
    const exp = isExpired(a)
    return (
      <Modal
        open={!!detailAnuncio}
        onCancel={() => setDetailAnuncio(null)}
        width={680}
        footer={
          <Space>
            {canEdit(a) && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => { setDetailAnuncio(null); navigate(`/anuncios/${a.id}/editar`) }}
              >
                Editar
              </Button>
            )}
            <Button onClick={() => setDetailAnuncio(null)}>Cerrar</Button>
          </Space>
        }
        title={null}
        styles={{ body: { padding: '24px 28px 8px' } }}
      >
        {/* Modal header */}
        <div style={{ marginBottom: 16 }}>
          <Space size={6} wrap style={{ marginBottom: 10 }}>
            <Tag color={cfg.tagColor} icon={cfg.icon} style={{ fontWeight: 700, fontSize: 13, padding: '2px 10px' }}>
              {cfg.label}
            </Tag>
            {a.ciclo && <Tag color="default">{a.ciclo}</Tag>}
            {a.numPlazas != null && (
              <Tag color="purple">{a.numPlazas} {a.numPlazas === 1 ? 'plaza' : 'plazas'}</Tag>
            )}
            {a.destacado && (
              <Tag color="gold" icon={<PushpinFilled />} style={{ fontWeight: 700 }}>
                Fijado
              </Tag>
            )}
            {exp && <Tag color="red">Expirado</Tag>}
            {!a.activo && <Tag color="default">Inactivo</Tag>}
          </Space>
          <Title level={4} style={{ margin: 0, lineHeight: 1.4 }}>{a.titulo}</Title>
        </div>

        <Divider style={{ margin: '0 0 16px' }} />

        {/* Full content */}
        <Paragraph style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          {a.contenido}
        </Paragraph>

        {/* Empresa badge */}
        {a.empresa && (
          <div style={{ marginBottom: 16 }}>
            <Tag icon={<BankOutlined />} color="blue" style={{ fontSize: 13, padding: '3px 10px' }}>
              {a.empresa}
            </Tag>
          </div>
        )}

        <Divider style={{ margin: '0 0 16px' }} />

        {/* Meta grid */}
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Space size={6}>
              <UserOutlined style={{ color: '#64748b' }} />
              <Text type="secondary" style={{ fontSize: 13 }}>Autor:</Text>
              <Text strong style={{ fontSize: 13 }}>{a.autor ?? '—'}</Text>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space size={6}>
              <ClockCircleOutlined style={{ color: '#64748b' }} />
              <Text type="secondary" style={{ fontSize: 13 }}>Publicado:</Text>
              <Text style={{ fontSize: 13 }}>{dayjs(a.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </Space>
          </Col>
          {a.fechaInicio && (
            <Col xs={24} sm={12}>
              <Space size={6}>
                <CalendarOutlined style={{ color: '#64748b' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Desde:</Text>
                <Text style={{ fontSize: 13 }}>{dayjs(a.fechaInicio).format('DD/MM/YYYY')}</Text>
              </Space>
            </Col>
          )}
          {a.fechaFin && (
            <Col xs={24} sm={12}>
              <Space size={6}>
                <CalendarOutlined style={{ color: exp ? '#ff4d4f' : '#64748b' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>Hasta:</Text>
                <Text style={{ fontSize: 13, color: exp ? '#ff4d4f' : undefined }}>
                  {dayjs(a.fechaFin).format('DD/MM/YYYY')}
                  {exp && ' (expirado)'}
                </Text>
              </Space>
            </Col>
          )}
        </Row>
      </Modal>
    )
  }

  // ── Card styling ────────────────────────────────────────────────────────────
  const cardStyle = (anuncio) => {
    const typeColor = TIPO_CONFIG[anuncio.tipo]?.color ?? '#d9d9d9'
    if (anuncio.destacado) {
      return {
        borderRadius: 12,
        border: `2px solid ${typeColor}`,
        background: isDark ? '#141414' : 'white',
        boxShadow: `0 4px 20px ${typeColor}40`,
        opacity: !anuncio.activo ? 0.65 : 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
      }
    }
    const neutral = isDark ? '#303030' : '#e8e8e8'
    return {
      borderRadius: 12,
      borderTop:    `1px solid ${neutral}`,
      borderRight:  `1px solid ${neutral}`,
      borderBottom: `1px solid ${neutral}`,
      borderLeft:   `4px solid ${typeColor}`,
      background: isDark ? '#141414' : 'white',
      opacity: !anuncio.activo ? 0.65 : 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer',
    }
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tablón de Anuncios</Title>
          <Text type="secondary">Ofertas de empresas, demandas de alumnos y comunicados del departamento FCT</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/anuncios/nuevo')}>
          Nuevo anuncio
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[12, 8]} align="middle" wrap>
          <Col flex={1} style={{ minWidth: 200 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Buscar en título o contenido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Tipo"
              value={filterTipo}
              onChange={setFilterTipo}
              allowClear
              style={{ minWidth: 130 }}
            >
              {Object.entries(TIPO_CONFIG).map(([tipo, cfg]) => (
                <Option key={tipo} value={tipo}>
                  <Tag color={cfg.tagColor} style={{ margin: 0 }}>{cfg.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Ciclo"
              value={filterCiclo}
              onChange={setFilterCiclo}
              allowClear
              style={{ minWidth: 100 }}
            >
              {['DAM', 'DAW', 'SMR', 'ASIR'].map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Col>
          <Col>
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Solo activos</Text>
              <Switch checked={soloActivos} onChange={setSoloActivos} size="small" />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <Spin spinning={loading}>
        {anuncios.length === 0 && !loading ? (
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: '48px 24px', textAlign: 'center' }}>
            <Empty description="No hay anuncios que coincidan con los filtros actuales" />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {anuncios.map(anuncio => {
                const cfg = TIPO_CONFIG[anuncio.tipo] ?? TIPO_CONFIG.INFO
                const exp = isExpired(anuncio)

                return (
                  <Col xs={24} md={12} xl={8} key={anuncio.id}>
                    <Card
                      hoverable
                      style={cardStyle(anuncio)}
                      bodyStyle={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}
                      onClick={() => setDetailAnuncio(anuncio)}
                    >
                      {/* Tags + actions row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <Space size={4} wrap style={{ flex: 1, marginRight: 8 }}>
                          <Tag color={cfg.tagColor} icon={cfg.icon} style={{ margin: 0, fontWeight: 600 }}>
                            {cfg.label}
                          </Tag>
                          {anuncio.ciclo && <Tag color="default" style={{ margin: 0 }}>{anuncio.ciclo}</Tag>}
                          {anuncio.numPlazas != null && (
                            <Tag color="purple" style={{ margin: 0 }}>
                              {anuncio.numPlazas} {anuncio.numPlazas === 1 ? 'plaza' : 'plazas'}
                            </Tag>
                          )}
                          {anuncio.destacado && (
                            <Tag color="gold" icon={<PushpinFilled />} style={{ margin: 0, fontWeight: 700 }}>
                              Fijado
                            </Tag>
                          )}
                          {exp && <Tag color="red" style={{ margin: 0 }}>Expirado</Tag>}
                          {!anuncio.activo && <Tag color="default" style={{ margin: 0 }}>Inactivo</Tag>}
                        </Space>

                        {canEdit(anuncio) && (
                          <Space size={2} style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            {isAdmin() && (
                              <Tooltip title={anuncio.destacado ? 'Quitar fijado' : 'Fijar en tablón'}>
                                <Button
                                  type="text" size="small"
                                  icon={anuncio.destacado
                                    ? <PushpinFilled style={{ color: '#faad14' }} />
                                    : <PushpinOutlined />}
                                  onClick={() => handleToggleDestacado(anuncio.id)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip title="Editar">
                              <Button
                                type="text" size="small" icon={<EditOutlined />}
                                onClick={() => navigate(`/anuncios/${anuncio.id}/editar`)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="¿Eliminar este anuncio?"
                              description="Esta acción no se puede deshacer."
                              onConfirm={() => handleDelete(anuncio.id)}
                              okText="Eliminar" cancelText="Cancelar" okType="danger"
                              placement="topRight"
                            >
                              <Tooltip title="Eliminar">
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        )}
                      </div>

                      {/* Title */}
                      <Title
                        level={5}
                        style={{ margin: '0 0 8px', lineHeight: 1.4 }}
                        ellipsis={{ rows: 2, tooltip: anuncio.titulo }}
                      >
                        {anuncio.titulo}
                      </Title>

                      {/* Content excerpt */}
                      <Paragraph
                        type="secondary"
                        style={{ margin: '0 0 12px', fontSize: 13, flex: 1 }}
                        ellipsis={{ rows: 3 }}
                      >
                        {anuncio.contenido}
                      </Paragraph>

                      {/* Empresa badge */}
                      {anuncio.empresa && (
                        <div style={{ marginBottom: 10 }}>
                          <Tag icon={<BankOutlined />} color="blue" style={{ margin: 0 }}>
                            {anuncio.empresa}
                          </Tag>
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderTop: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                        paddingTop: 10, marginTop: 'auto',
                      }}>
                        <Space size={6}>
                          <Avatar size={22} style={{ background: '#2563eb', fontSize: 11, flexShrink: 0 }}>
                            {anuncio.autor?.[0]?.toUpperCase() ?? '?'}
                          </Avatar>
                          <Text type="secondary" style={{ fontSize: 12 }}>{anuncio.autor ?? 'Desconocido'}</Text>
                        </Space>
                        <Space size={8}>
                          {anuncio.fechaFin && (
                            <Tooltip title={`Válido hasta: ${dayjs(anuncio.fechaFin).format('DD/MM/YYYY')}`}>
                              <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                <CalendarOutlined style={{ marginRight: 3 }} />
                                {dayjs(anuncio.fechaFin).format('DD/MM')}
                              </Text>
                            </Tooltip>
                          )}
                          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                            <ClockCircleOutlined style={{ marginRight: 3 }} />
                            {dayjs(anuncio.createdAt).fromNow()}
                          </Text>
                        </Space>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>

            {/* ── Pagination — always rendered when there are results ── */}
            {pagination.total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={(page, pageSize) => fetchAnuncios(page, pageSize)}
                  showSizeChanger
                  pageSizeOptions={['9', '18', '27']}
                  showTotal={total => `${total} anuncios`}
                />
              </div>
            )}
          </>
        )}
      </Spin>

      {/* ── Detail modal ───────────────────────────────────────────────────── */}
      <DetailModal />
    </div>
  )
}

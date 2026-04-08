import { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Table, Tag } from 'antd'
import {
  BankOutlined, PhoneOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons'
import { Column, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import { dashboardService, contactoService } from '../../services/api'

const { Title, Text } = Typography

const mockStats = {
  empresasActivas: 0,
  contactadosMes: 0,
  alumnosDisponibles: 0,
  profesoresActivos: 0,
}
const mockContactosMes = [
  { mes: 'Oct', contactos: 0 },
  { mes: 'Nov', contactos: 0 },
  { mes: 'Dic', contactos: 0 },
  { mes: 'Ene', contactos: 0 },
  { mes: 'Feb', contactos: 0 },
  { mes: 'Mar', contactos: 0 },
]
const mockNecesidades = [
  { type: 'DAM', value: 1 },
  { type: 'DAW', value: 1 },
]

const resultadoColors = {
  INTERESADO: 'green',
  PENDIENTE: 'orange',
  NO_INTERESADO: 'red',
  EN_PROCESO: 'blue',
}
const resultadoLabels = {
  INTERESADO: 'Interesado',
  PENDIENTE: 'Pendiente',
  NO_INTERESADO: 'No interesado',
  EN_PROCESO: 'En proceso',
}

const statCards = (stats) => [
  {
    title: 'Empresas activas',
    value: stats.empresasActivas,
    icon: <BankOutlined />,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    title: 'Contactos este mes',
    value: stats.contactadosMes,
    icon: <PhoneOutlined />,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    title: 'Alumnos disponibles',
    value: stats.alumnosDisponibles,
    icon: <TeamOutlined />,
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    title: 'Profesores activos',
    value: stats.profesoresActivos,
    icon: <UserOutlined />,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats)
  const [contactosMes, setContactosMes] = useState(mockContactosMes)
  const [necesidades, setNecesidades] = useState(mockNecesidades)
  const [ultimosContactos, setUltimosContactos] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, cm, nec, cont] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getContactosPorMes(),
          dashboardService.getNecesidades(),
          contactoService.getAll({ size: 5 }),
        ])
        setStats(s.data)
        if (cm.data && cm.data.length > 0) setContactosMes(cm.data)
        if (nec.data && nec.data.length > 0) setNecesidades(nec.data)
        const contactosData = cont.data.content || cont.data
        setUltimosContactos(contactosData.map(c => ({
          id: c.id,
          empresa: c.empresaNombre,
          tipo: c.tipo,
          resultado: c.resultado,
          fecha: c.fecha,
          profesor: c.profesor?.nombre,
        })))
      } catch {
        // usa mock data
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  const columns = [
    {
      title: 'Empresa',
      dataIndex: 'empresa',
      key: 'empresa',
      render: t => <strong>{t}</strong>
    },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    {
      title: 'Resultado',
      dataIndex: 'resultado',
      key: 'resultado',
      render: r => <Tag color={resultadoColors[r]}>{resultadoLabels[r]}</Tag>
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: d => dayjs(d).format('DD/MM/YYYY')
    },
    { title: 'Profesor', dataIndex: 'profesor', key: 'profesor' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Text style={{ color: '#64748b' }}>
          Resumen general · {dayjs().format('dddd, D MMMM YYYY')}
        </Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards(stats).map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <Card
              style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 13 }}>{card.title}</Text>
                  <div style={{
                    fontSize: 32, fontWeight: 700, color: '#0f172a',
                    lineHeight: 1.2, marginTop: 4,
                  }}>
                    {card.value}
                  </div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Contactos por mes */}
        <Col xs={24} lg={16}>
          <Card
            title="Contactos por mes"
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          >
            {loaded && contactosMes.length > 0 && (
              <Column
                data={contactosMes}
                xField="mes"
                yField="contactos"
                color="#2563eb"
                radius={[4, 4, 0, 0]}
                yAxis={{ grid: { line: { style: { stroke: '#f1f5f9' } } } }}
                height={220}
              />
            )}
            {loaded && contactosMes.every(c => c.contactos === 0) && (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">No hay contactos registrados aún</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Necesidades */}
        <Col xs={24} lg={8}>
          <Card
            title="Perfiles más demandados"
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          >
            {loaded && necesidades.length > 0 && (
              <Pie
                data={necesidades}
                angleField="value"
                colorField="type"
                radius={0.8}
                innerRadius={0.5}
                height={220}
                legend={{ position: 'bottom' }}
                color={['#2563eb', '#16a34a', '#d97706', '#7c3aed']}
              />
            )}
            {loaded && necesidades.length === 0 && (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">Sin datos</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Últimos contactos */}
      <Card
        title="Últimos contactos"
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        extra={<a href="/contactos">Ver todos</a>}
      >
        {ultimosContactos.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Text type="secondary">No hay contactos registrados aún</Text>
            </div>
          )
          : (
            <Table
              dataSource={ultimosContactos}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          )
        }
      </Card>
    </div>
  )
}
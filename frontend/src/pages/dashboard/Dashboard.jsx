import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Progress } from 'antd'
import {
  BankOutlined, PhoneOutlined, TeamOutlined, UserOutlined,
  RiseOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import { Column, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import { dashboardService } from '../../services/api'

const { Title, Text } = Typography

// Mock data mientras conecta el backend
const mockStats = {
  empresasActivas: 24,
  contactadosMes: 8,
  alumnosDisponibles: 15,
  profesoresActivos: 4,
}
const mockContactosMes = [
  { mes: 'Oct', contactos: 5 },
  { mes: 'Nov', contactos: 9 },
  { mes: 'Dic', contactos: 3 },
  { mes: 'Ene', contactos: 7 },
  { mes: 'Feb', contactos: 12 },
  { mes: 'Mar', contactos: 8 },
]
const mockNecesidades = [
  { type: 'DAM', value: 12 },
  { type: 'DAW', value: 8 },
  { type: 'SMR', value: 5 },
  { type: 'ASIR', value: 4 },
]
const mockUltimosContactos = [
  { id: 1, empresa: 'Accenture Spain', tipo: 'Llamada', resultado: 'INTERESADO', fecha: '2024-03-15', profesor: 'M. García' },
  { id: 2, empresa: 'Indra Sistemas', tipo: 'Email', resultado: 'PENDIENTE', fecha: '2024-03-14', profesor: 'J. López' },
  { id: 3, empresa: 'Telefónica', tipo: 'Visita', resultado: 'NO_INTERESADO', fecha: '2024-03-12', profesor: 'M. García' },
  { id: 4, empresa: 'Capgemini', tipo: 'Llamada', resultado: 'INTERESADO', fecha: '2024-03-10', profesor: 'A. Martín' },
]

const resultadoColors = {
  INTERESADO: 'green',
  PENDIENTE: 'orange',
  NO_INTERESADO: 'red',
}
const resultadoLabels = {
  INTERESADO: 'Interesado',
  PENDIENTE: 'Pendiente',
  NO_INTERESADO: 'No interesado',
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
  const [ultimosContactos, setUltimosContactos] = useState(mockUltimosContactos)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, cm, nec] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getContactosPorMes(),
          dashboardService.getNecesidades(),
        ])
        setStats(s.data)
        setContactosMes(cm.data)
        setNecesidades(nec.data)
      } catch {
        // usa mock data
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    { title: 'Empresa', dataIndex: 'empresa', key: 'empresa', render: t => <strong>{t}</strong> },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    {
      title: 'Resultado', dataIndex: 'resultado', key: 'resultado',
      render: r => <Tag color={resultadoColors[r]}>{resultadoLabels[r]}</Tag>
    },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: d => dayjs(d).format('DD/MM/YYYY') },
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
            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ color: '#64748b', fontSize: 13 }}>{card.title}</Text>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginTop: 4 }}>
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
            <Column
              data={contactosMes}
              xField="mes"
              yField="contactos"
              color="#2563eb"
              radius={[4, 4, 0, 0]}
              label={{ style: { fill: '#64748b', fontSize: 12 } }}
              yAxis={{ grid: { line: { style: { stroke: '#f1f5f9' } } } }}
              height={220}
            />
          </Card>
        </Col>

        {/* Necesidades */}
        <Col xs={24} lg={8}>
          <Card
            title="Perfiles más demandados"
            style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
          >
            <Pie
              data={necesidades}
              angleField="value"
              colorField="type"
              radius={0.8}
              innerRadius={0.5}
              label={{ type: 'inner', offset: '-30%', content: '{value}', style: { fill: '#fff', fontSize: 12 } }}
              height={220}
              legend={{ position: 'bottom' }}
              color={['#2563eb', '#16a34a', '#d97706', '#7c3aed']}
            />
          </Card>
        </Col>
      </Row>

      {/* Últimos contactos */}
      <Card
        title="Últimos contactos"
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
        extra={<a href="/contactos">Ver todos</a>}
      >
        <Table
          dataSource={ultimosContactos}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

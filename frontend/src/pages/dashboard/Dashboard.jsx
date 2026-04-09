import { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Table, Tag } from 'antd'
import {
  BankOutlined, PhoneOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons'
import { Column, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import { dashboardService, contactoService } from '../../services/api'
import { useThemeStore } from '../../store/themeStore'

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

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats)
  const [contactosMes, setContactosMes] = useState(mockContactosMes)
  const [necesidades, setNecesidades] = useState(mockNecesidades)
  const [ultimosContactos, setUltimosContactos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const tema = useThemeStore(s => s.tema)
  const isDark = tema === 'dark'

  // Colores adaptativos al tema
  const colors = {
    cardBg: isDark ? '#252526' : '#ffffff',
    cardBorder: isDark ? '#3e3e42' : '#e2e8f0',
    textPrimary: isDark ? '#cccccc' : '#0f172a',
    textMuted: isDark ? '#858585' : '#64748b',
    gridLine: isDark ? '#3e3e42' : '#f1f5f9',
    tooltipBg: isDark ? '#252526' : '#ffffff',
    statBgs: [
      { bg: isDark ? '#1a2a4a' : '#eff6ff', color: '#3b82f6' },
      { bg: isDark ? '#1a3a2a' : '#f0fdf4', color: '#16a34a' },
      { bg: isDark ? '#3a2a1a' : '#fffbeb', color: '#d97706' },
      { bg: isDark ? '#2a1a3a' : '#f5f3ff', color: '#7c3aed' },
    ]
  }

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

  const statCards = [
    { title: 'Empresas activas', value: stats.empresasActivas, icon: <BankOutlined />, ...colors.statBgs[0] },
    { title: 'Contactos este mes', value: stats.contactadosMes, icon: <PhoneOutlined />, ...colors.statBgs[1] },
    { title: 'Alumnos disponibles', value: stats.alumnosDisponibles, icon: <TeamOutlined />, ...colors.statBgs[2] },
    { title: 'Profesores activos', value: stats.profesoresActivos, icon: <UserOutlined />, ...colors.statBgs[3] },
  ]

  const columns = [
    {
      title: 'Empresa',
      dataIndex: 'empresa',
      key: 'empresa',
      render: t => <strong style={{ color: colors.textPrimary }}>{t}</strong>
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

  const columnChartConfig = {
    data: contactosMes,
    xField: 'mes',
    yField: 'contactos',
    color: '#3b82f6',
    radius: [4, 4, 0, 0],
    height: 220,
    theme: isDark ? 'dark' : 'light',
  }

  const pieChartConfig = {
    data: necesidades,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    height: 220,
    legend: { position: 'bottom' },
    color: ['#3b82f6', '#16a34a', '#d97706', '#7c3aed'],
    theme: isDark ? 'dark' : 'light',
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: colors.textPrimary }}>Dashboard</Title>
        <Text style={{ color: colors.textMuted }}>
          Resumen general · {dayjs().format('dddd, D MMMM YYYY')}
        </Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <Card
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.cardBorder}`,
                background: colors.cardBg,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="stat-label" style={{ color: colors.textMuted, fontSize: 13 }}>
                    {card.title}
                  </div>
                  <div className="stat-value" style={{
                    fontSize: 32, fontWeight: 700,
                    color: colors.textPrimary,
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
            title={<span style={{ color: colors.textPrimary }}>Contactos por mes</span>}
            style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg }}
          >
            {loaded && !contactosMes.every(c => c.contactos === 0) ? (
              <Column key={tema} {...columnChartConfig} />
            ) : loaded ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>No hay contactos registrados aún</Text>
              </div>
            ) : null}
          </Card>
        </Col>

        {/* Necesidades */}
        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ color: colors.textPrimary }}>Perfiles más demandados</span>}
            style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg }}
          >
            {loaded && necesidades.length > 0 ? (
              <Pie key={tema} {...pieChartConfig} />
            ) : loaded ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>Sin datos</Text>
              </div>
            ) : null}
          </Card>
        </Col>
      </Row>

      {/* Últimos contactos */}
      <Card
        title={<span style={{ color: colors.textPrimary }}>Últimos contactos</span>}
        style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg }}
        extra={<a href="/contactos" style={{ color: '#3b82f6' }}>Ver todos</a>}
      >
        {ultimosContactos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Text style={{ color: colors.textMuted }}>No hay contactos registrados aún</Text>
          </div>
        ) : (
          <Table
            dataSource={ultimosContactos}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Card>
    </div>
  )
}
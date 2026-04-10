import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Table, Tag, Tabs } from 'antd'
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
  { mes: 'Ene', contactos: 0 }, { mes: 'Feb', contactos: 0 }, { mes: 'Mar', contactos: 0 },
  { mes: 'Abr', contactos: 0 }, { mes: 'May', contactos: 0 }, { mes: 'Jun', contactos: 0 },
  { mes: 'Jul', contactos: 0 }, { mes: 'Ago', contactos: 0 }, { mes: 'Sep', contactos: 0 },
  { mes: 'Oct', contactos: 0 }, { mes: 'Nov', contactos: 0 }, { mes: 'Dic', contactos: 0 },
]
const mockNecesidades = []

// Mes abreviado → número (1-12)
const mesNumero = {
  Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6,
  Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12,
}

// Intervalo de tick adaptado al máximo de la serie
function calcTickInterval(max) {
  if (max <= 5)   return 1
  if (max <= 20)  return 5
  if (max <= 50)  return 10
  if (max <= 100) return 20
  if (max <= 200) return 50
  if (max <= 500) return 100
  return Math.ceil(max / 5 / 100) * 100
}

const resultadoColors = {
  INTERESADO: 'green', PENDIENTE: 'orange', NO_INTERESADO: 'red', EN_PROCESO: 'blue',
}
const resultadoLabels = {
  INTERESADO: 'Interesado', PENDIENTE: 'Pendiente',
  NO_INTERESADO: 'No interesado', EN_PROCESO: 'En proceso',
}

const currentYear = dayjs().year()
const yearTabs = [currentYear - 2, currentYear - 1, currentYear].map(y => ({
  key: String(y), label: String(y),
}))

const CHART_COLORS = {
  light: {
    column: '#3b82f6',
    pie: ['#3b82f6', '#16a34a', '#d97706', '#7c3aed'],
  },
  dark: {
    column: '#60a5fa',
    pie: ['#60a5fa', '#4ade80', '#fbbf24', '#a78bfa'],
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats]                   = useState(mockStats)
  const [contactosMes, setContactosMes]     = useState(mockContactosMes)
  const [necesidades, setNecesidades]       = useState(mockNecesidades)
  const [ultimosContactos, setUltimosContactos] = useState([])
  const [loaded, setLoaded]                 = useState(false)
  const [selectedYear, setSelectedYear]     = useState(String(currentYear))
  const [loadingChart, setLoadingChart]     = useState(false)
  const tema  = useThemeStore(s => s.tema)
  const isDark = tema === 'dark'

  const colors = {
    cardBg:      isDark ? '#252526' : '#ffffff',
    cardBorder:  isDark ? '#3e3e42' : '#e2e8f0',
    textPrimary: isDark ? '#cccccc' : '#0f172a',
    textMuted:   isDark ? '#858585' : '#64748b',
    statBgs: [
      { bg: isDark ? '#1a2a4a' : '#eff6ff', color: '#3b82f6' },
      { bg: isDark ? '#1a3a2a' : '#f0fdf4', color: '#16a34a' },
      { bg: isDark ? '#3a2a1a' : '#fffbeb', color: '#d97706' },
      { bg: isDark ? '#2a1a3a' : '#f5f3ff', color: '#7c3aed' },
    ],
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [s, cm, nec, cont] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getContactosPorMes(currentYear),
          dashboardService.getNecesidades(),
          contactoService.getAll({ size: 5 }),
        ])
        setStats(s.data)
        if (cm.data?.length  > 0) setContactosMes(cm.data)
        if (nec.data?.length > 0) setNecesidades(nec.data)
        const contactosData = cont.data.content || cont.data
        setUltimosContactos(contactosData.map(c => ({
          id:       c.id,
          empresa:  c.empresaNombre,
          tipo:     c.tipo,
          resultado: c.resultado,
          fecha:    c.fecha,
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

  const handleYearChange = async (year) => {
    setSelectedYear(year)
    setLoadingChart(true)
    try {
      const cm = await dashboardService.getContactosPorMes(Number(year))
      setContactosMes(cm.data?.length > 0 ? cm.data : mockContactosMes)
    } catch {
      setContactosMes(mockContactosMes)
    } finally {
      setLoadingChart(false)
    }
  }

  // ── Configs de gráficas ────────────────────────────────────────────

  const maxContactos = Math.max(...contactosMes.map(c => c.contactos), 1)
  const tickInterval = calcTickInterval(maxContactos)

  const themeColors = isDark ? CHART_COLORS.dark : CHART_COLORS.light

  const columnChartConfig = {
    data: contactosMes,
    xField: 'mes',
    yField: 'contactos',
    color: themeColors.column,
    radius: [4, 4, 0, 0],
    height: 240,
    theme: isDark ? 'dark' : 'light',
    axis: {
      y: { tickInterval, nice: true },
    },
    style: { cursor: 'pointer' },
  }

  const pieChartConfig = {
    data: necesidades,
    angleField: 'value',
    colorField: 'type',
    radius: 0.82,
    innerRadius: 0.5,
    height: 240,
    color: themeColors.pie,
    theme: isDark ? 'dark' : 'light',
    legend: { position: 'bottom' },
    label: {
      text: (d) => d.type,
      style: { fontSize: 11, fill: isDark ? '#c0c0c0' : '#444', fontWeight: 600 },
    },
    tooltip: {
      items: [(d) => ({ name: d.type, value: `${d.value} alumno${d.value !== 1 ? 's' : ''}` })],
    },
    state: {
      active: {
        style: { offset: 10, stroke: isDark ? '#6b7280' : '#ffffff', strokeWidth: 2 },
      },
    },
    interactions: [{ type: 'element-active' }],
    style: { cursor: 'pointer' },
  }

  // ── Handlers de click en gráficas ─────────────────────────────────

  const handleColumnReady = (chart) => {
    chart.on('element:click', (evt) => {
      const d = evt.data?.data
      if (!d) return
      const mes = mesNumero[d.mes]
      if (mes) navigate(`/contactos?mes=${mes}&year=${selectedYear}`)
    })
  }

  const handlePieReady = (chart) => {
    chart.on('element:click', (evt) => {
      const d = evt.data?.data
      if (d?.type) navigate(`/alumnos?ciclo=${d.type}&noDisponible=1`)
    })
  }

  // ── Columnas tabla ─────────────────────────────────────────────────

  const statCards = [
    { title: 'Empresas activas',    value: stats.empresasActivas,    icon: <BankOutlined />,  ...colors.statBgs[0] },
    { title: 'Contactos este mes',  value: stats.contactadosMes,     icon: <PhoneOutlined />, ...colors.statBgs[1] },
    { title: 'Alumnos disponibles', value: stats.alumnosDisponibles, icon: <TeamOutlined />,  ...colors.statBgs[2] },
    { title: 'Profesores activos',  value: stats.profesoresActivos,  icon: <UserOutlined />,  ...colors.statBgs[3] },
  ]

  const columns = [
    {
      title: 'Empresa', dataIndex: 'empresa', key: 'empresa',
      render: t => <strong style={{ color: colors.textPrimary }}>{t}</strong>,
    },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    {
      title: 'Resultado', dataIndex: 'resultado', key: 'resultado',
      render: r => <Tag color={resultadoColors[r]}>{resultadoLabels[r]}</Tag>,
    },
    {
      title: 'Fecha', dataIndex: 'fecha', key: 'fecha',
      render: d => dayjs(d).format('DD/MM/YYYY'),
    },
    { title: 'Profesor', dataIndex: 'profesor', key: 'profesor' },
  ]

  const hayContactos = !contactosMes.every(c => c.contactos === 0)

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
              style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: colors.textMuted, fontSize: 13 }}>{card.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2, marginTop: 4 }}>
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

      {/* Charts row — misma altura con flex */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch">

        {/* Contactos por mes */}
        <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            title={<span style={{ color: colors.textPrimary }}>Contactos por mes</span>}
            style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, flex: 1 }}
            styles={{ body: { paddingTop: 8 } }}
            extra={
              <Tabs
                size="small"
                activeKey={selectedYear}
                items={yearTabs}
                onChange={handleYearChange}
                style={{ marginBottom: 0 }}
              />
            }
          >
            {loadingChart ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>Cargando...</Text>
              </div>
            ) : loaded && hayContactos ? (
              <Column
                key={`col-${tema}-${selectedYear}`}
                {...columnChartConfig}
                onReady={handleColumnReady}
              />
            ) : loaded ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>No hay contactos en {selectedYear}</Text>
              </div>
            ) : null}
          </Card>
        </Col>

        {/* Perfiles más demandados */}
        <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            title={<span style={{ color: colors.textPrimary }}>Perfiles más demandados</span>}
            style={{ borderRadius: 12, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, flex: 1 }}
            styles={{ body: { paddingTop: 8 } }}
          >
            {loaded && necesidades.length > 0 ? (
              <Pie
                key={`pie-${tema}`}
                {...pieChartConfig}
                onReady={handlePieReady}
              />
            ) : loaded ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>No hay datos</Text>
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

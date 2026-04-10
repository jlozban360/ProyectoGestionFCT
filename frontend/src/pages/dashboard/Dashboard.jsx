import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Table, Tag, Tabs } from 'antd'
import {
  BankOutlined, PhoneOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons'
// @ant-design/charts ya no se usa — gráficas SVG nativas
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

const PIE_COLORS = ['#3b82f6', '#16a34a', '#d97706', '#7c3aed']

// Escala secuencial: color mínimo (valor bajo) → color máximo (valor alto)
const COLOR_SCALE = {
  light: { min: '#bfdbfe', max: '#1e3a8a' }, // azul claro → azul navy
  dark:  { min: '#99f6e4', max: '#0f766e' }, // teal claro → teal oscuro
}

function lerpColor(a, b, t) {
  const p = (h, s, e) => parseInt(h.slice(s, e), 16)
  const ch = (ca, cb, i) => Math.round(p(ca,i,i+2) + (p(cb,i,i+2) - p(ca,i,i+2)) * t).toString(16).padStart(2,'0')
  return `#${ch(a,b,1)}${ch(a,b,3)}${ch(a,b,5)}`
}

// ==================== BAR CHART - VERSIÓN CORREGIDA (Sin error selectedYear) ====================
function BarChart({ data, colorScale, isDark, onBarClick }) {
  const [hovered, setHovered] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [animReady, setAnimReady] = useState(false)

  const maxVal = Math.max(...data.map(d => d.contactos), 1)

  function getTickConfig(max) {
    if (max <= 8)   return { count: 5, interval: 2 }
    if (max <= 12)  return { count: 6, interval: 2 }
    if (max <= 25)  return { count: 6, interval: 5 }
    if (max <= 60)  return { count: 5, interval: 10 }
    if (max <= 120) return { count: 5, interval: 25 }
    if (max <= 300) return { count: 5, interval: 50 }
    return { count: 5, interval: 100 }
  }

  const { count, interval } = getTickConfig(maxVal)
  let niceMax = Math.ceil(maxVal / interval) * interval
  if (niceMax < maxVal) niceMax += interval

  const ticks = Array.from({ length: count }, (_, i) => i * interval)

  const VW = 560
  const VH = 160
  const pad = { t: 16, r: 12, b: 26, l: 38 }
  const cW = VW - pad.l - pad.r
  const cH = VH - pad.t - pad.b
  const step = cW / data.length
  const barW = step * 0.95
  const barOff = (step - barW) / 2

  const getColor = (v) =>
    lerpColor(colorScale.min, colorScale.max, maxVal > 0 ? v / maxVal : 0)

  // Animación corregida
  useEffect(() => {
    setAnimReady(false)
    const timer = setTimeout(() => setAnimReady(true), 50)
    return () => clearTimeout(timer)
  }, [data])        // ← Solo dependemos de 'data', no de selectedYear

  return (
    <div style={{ position: 'relative' }} onMouseLeave={() => setHovered(null)}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {data.map((item, i) => {
            const c = getColor(item.contactos)
            return (
              <linearGradient key={i} id={`bcg-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c} stopOpacity={1} />
                <stop offset="100%" stopColor={c} stopOpacity={0.55} />
              </linearGradient>
            )
          })}
        </defs>

        {/* Grid + Eje Y */}
        {ticks.map((tick, i) => {
          const y = pad.t + cH - (tick / niceMax) * cH
          return (
            <g key={i}>
              <line
                x1={pad.l} y1={y}
                x2={VW - pad.r} y2={y}
                stroke={isDark ? '#2f2f2f' : '#e5e7eb'}
                strokeWidth={i === 0 ? 1 : 0.6}
                strokeDasharray={i === 0 ? 'none' : '3 3'}
              />
              <text
                x={pad.l - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill={isDark ? '#777' : '#94a3b8'}
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Barras con animación */}
        {data.map((item, i) => {
          const active = hovered === i
          const bH = (item.contactos / niceMax) * cH || 0
          const bX = pad.l + i * step + barOff
          const bY = pad.t + cH - bH

          return (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                setHovered(i)
                setMouse({ x: e.clientX, y: e.clientY })
              }}
              onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
              onClick={() => onBarClick?.(item)}
            >
              <rect
                x={bX}
                y={bY}
                width={barW}
                height={bH}
                rx={4}
                fill={`url(#bcg-${i})`}
                opacity={hovered !== null && !active ? 0.35 : 1}
                style={{
                  transformOrigin: `${bX + barW / 2}px ${pad.t + cH}px`,
                  transform: `scaleY(${animReady ? 1 : 0})`,
                  transition: 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />

              {item.contactos > 0 && (
                <text
                  x={bX + barW / 2}
                  y={bY - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={isDark ? '#ddd' : '#1e293b'}
                  style={{ opacity: animReady ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}
                >
                  {item.contactos}
                </text>
              )}

              <text
                x={bX + barW / 2}
                y={VH - 6}
                textAnchor="middle"
                fontSize={9.0}
                fill={active ? (isDark ? '#fff' : '#111827') : (isDark ? '#666' : '#94a3b8')}
                fontWeight={active ? 600 : 400}
              >
                {item.mes}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div
          style={{
            position: 'fixed',
            left: mouse.x + 12,
            top: mouse.y - 20,
            background: isDark ? '#1f1f1f' : '#fff',
            border: `1px solid ${isDark ? '#444' : '#e5e7eb'}`,
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 13,
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <strong>{data[hovered].contactos}</strong> contactos en {data[hovered].mes}
        </div>
      )}
    </div>
  )
}

// ── Donut chart SVG nativo ─────────────────────────────────────────
function arcPath(cx, cy, R, r, a0, a1) {
  const x = (a, rad) => cx + Math.cos(a) * rad
  const y = (a, rad) => cy + Math.sin(a) * rad
  const large = a1 - a0 > Math.PI ? 1 : 0
  return [
    `M ${x(a0,R)} ${y(a0,R)}`,
    `A ${R} ${R} 0 ${large} 1 ${x(a1,R)} ${y(a1,R)}`,
    `L ${x(a1,r)} ${y(a1,r)}`,
    `A ${r} ${r} 0 ${large} 0 ${x(a0,r)} ${y(a0,r)}`,
    'Z',
  ].join(' ')
}

function DonutChart({ data, colors, isDark, onSliceClick }) {
  const [hovered, setHovered] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [anim, setAnim] = useState(0)

  useEffect(() => {
    requestAnimationFrame(() => setAnim(1))
  }, [])

  const total = data.reduce((s, d) => s + d.value, 0)

  const SIZE = 240
  const cx = SIZE / 2
  const cy = SIZE / 2
  const outerR = SIZE * 0.44
  const innerR = outerR * 0.58

  function arcPath(cx, cy, R, r, a0, a1) {
    const x = (a, rad) => cx + Math.cos(a) * rad
    const y = (a, rad) => cy + Math.sin(a) * rad
    const large = a1 - a0 > Math.PI ? 1 : 0
    return [
      `M ${x(a0, R)} ${y(a0, R)}`,
      `A ${R} ${R} 0 ${large} 1 ${x(a1, R)} ${y(a1, R)}`,
      `L ${x(a1, r)} ${y(a1, r)}`,
      `A ${r} ${r} 0 ${large} 0 ${x(a0, r)} ${y(a0, r)}`,
      'Z',
    ].join(' ')
  }

  let acc = -Math.PI / 2

  const slices = data.map((item, i) => {
    const sweep =
      total > 0
        ? (item.value / total) * Math.PI * 2
        : (Math.PI * 2) / data.length

    const a0 = acc
    acc += sweep

    return {
      d: arcPath(cx, cy, outerR, innerR, a0, acc),
      mid: a0 + sweep / 2,
      color: colors[i % colors.length],
      item,
      i,
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          width={SIZE}
          height={SIZE}
          onMouseLeave={() => setHovered(null)}
        >
          {/* 🎯 Gradientes */}
          <defs>
            {slices.map(({ color }, i) => (
              <linearGradient
                id={`grad-${i}`}
                key={i}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor="#00000020" />
              </linearGradient>
            ))}
          </defs>

          {/* 🎯 Centro (peso visual) */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 4}
            fill={isDark ? '#1f1f1f' : '#f8fafc'}
          />

          {slices.map(({ d, mid, item, i }) => {
            const active = hovered === i
            const inactive = hovered !== null && !active

            const off = active ? 14 : 0

            return (
              <path
                key={i}
                d={d}
                fill={`url(#grad-${i})`}
                stroke={active ? '#fff' : 'none'}
                strokeWidth={3}
                opacity={inactive ? 0.28 : 1}
                transform={`
                  translate(${Math.cos(mid) * off}, ${Math.sin(mid) * off})
                  scale(${anim})
                `}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  cursor: 'pointer',
                  transition:
                    'transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  setHovered(i)
                  setMouse({ x: e.clientX, y: e.clientY })
                }}
                onMouseMove={(e) =>
                  setMouse({ x: e.clientX, y: e.clientY })
                }
                onClick={() => onSliceClick?.(item)}
              />
            )
          })}
        </svg>
      </div>

      {/* 💬 Tooltip */}
      {hovered !== null && (
        <div
          style={{
            position: 'fixed',
            left: mouse.x + 14,
            top: mouse.y - 20,
            background: isDark ? '#2a2a2a' : '#fff',
            border: `1px solid ${isDark ? '#444' : '#e2e8f0'}`,
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            color: isDark ? '#ccc' : '#1e293b',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{slices[hovered].item.type}</strong>
          {' · '}
          {slices[hovered].item.value} alumno
          {slices[hovered].item.value !== 1 ? 's' : ''}
        </div>
      )}

      {/* 🧠 Leyenda interactiva */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px 12px',
          marginTop: 8,
        }}
      >
        {data.map((item, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSliceClick?.(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              color: isDark ? '#888' : '#64748b',
              cursor: 'pointer',
              opacity: hovered !== null && hovered !== i ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
            {item.type}
          </div>
        ))}
      </div>
    </div>
  )
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

  const colorScale = isDark ? COLOR_SCALE.dark : COLOR_SCALE.light

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
              <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textMuted }}>Cargando...</Text>
              </div>
            ) : loaded && hayContactos ? (
              <BarChart
                key={`bar-${tema}-${selectedYear}`}
                data={contactosMes}
                colorScale={colorScale}
                isDark={isDark}
                onBarClick={item => {
                  const mes = mesNumero[item.mes]
                  if (mes) navigate(`/contactos?mes=${mes}&year=${selectedYear}`)
                }}
              />
            ) : loaded ? (
              <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <DonutChart
                key={`pie-${tema}`}
                data={necesidades}
                colors={PIE_COLORS}
                isDark={isDark}
                onSliceClick={(item) => navigate(`/alumnos?ciclo=${item.type}&noDisponible=1`)}
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

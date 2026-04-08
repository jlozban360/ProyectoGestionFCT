import { useEffect, useState } from 'react'
import { Drawer, Badge, List, Tag, Typography, Button, Empty, Spin, Tooltip } from 'antd'
import {
  BellOutlined, PhoneOutlined, ClockCircleOutlined, TeamOutlined, WarningOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { contactoService, alumnoService } from '../services/api'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Text } = Typography

function calcularNotificaciones(contactos, alumnos) {
  const notifs = []
  const hoy = dayjs()

  // Contactos pendientes con más de 7 días sin actualizar
  contactos.forEach(c => {
    if (c.resultado === 'PENDIENTE') {
      const dias = hoy.diff(dayjs(c.fecha), 'day')
      if (dias >= 7) {
        notifs.push({
          id: `contacto-${c.id}`,
          tipo: 'pendiente',
          titulo: `Seguimiento pendiente — ${c.empresaNombre || c.empresa?.nombre}`,
          descripcion: c.motivo,
          fecha: c.fecha,
          dias,
          empresaId: c.empresaId,
          icon: <PhoneOutlined />,
          color: 'orange',
        })
      }
    }
  })

  // Contactos con próxima acción definida y fecha ya pasada
  contactos.forEach(c => {
    if (c.proximaAccion && c.resultado !== 'INTERESADO' && c.resultado !== 'NO_INTERESADO') {
      const dias = hoy.diff(dayjs(c.fecha), 'day')
      if (dias >= 3) {
        notifs.push({
          id: `accion-${c.id}`,
          tipo: 'accion',
          titulo: `Acción pendiente — ${c.empresaNombre || c.empresa?.nombre}`,
          descripcion: c.proximaAccion,
          fecha: c.fecha,
          dias,
          empresaId: c.empresaId,
          icon: <ClockCircleOutlined />,
          color: 'blue',
        })
      }
    }
  })

  // Alumnos enviados hace más de 14 días sin respuesta
  alumnos.forEach(a => {
    if (a.estado === 'ENVIADO' && a.createdAt) {
      const dias = hoy.diff(dayjs(a.createdAt), 'day')
      if (dias >= 14) {
        notifs.push({
          id: `alumno-${a.id}`,
          tipo: 'alumno',
          titulo: `Sin respuesta — ${a.nombre} ${a.apellidos}`,
          descripcion: `Enviado a ${a.empresa || 'empresa'} hace ${dias} días sin respuesta`,
          fecha: a.createdAt,
          dias,
          icon: <TeamOutlined />,
          color: 'red',
        })
      }
    }
  })

  // Ordenar por días descendente (más urgentes primero)
  return notifs.sort((a, b) => b.dias - a.dias)
}

const tipoLabels = {
  pendiente: { label: 'Pendiente', color: 'orange' },
  accion: { label: 'Acción requerida', color: 'blue' },
  alumno: { label: 'Sin respuesta', color: 'red' },
}

export default function NotificacionesDrawer() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const navigate = useNavigate()

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      const [contRes, alumRes] = await Promise.all([
        contactoService.getAll({ size: 100 }),
        alumnoService.getAll({ size: 100 }),
      ])
      const contactos = contRes.data.content || contRes.data
      const alumnos = alumRes.data.content || alumRes.data
      setNotificaciones(calcularNotificaciones(contactos, alumnos))
    } catch {
      setNotificaciones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) cargarNotificaciones()
  }, [open])

  const handleClick = (notif) => {
    if (notif.empresaId) {
      navigate(`/empresas/${notif.empresaId}`)
    } else {
      navigate('/alumnos')
    }
    setOpen(false)
  }

  return (
    <>
      <Tooltip title="Notificaciones">
        <Badge count={notificaciones.length} size="small" offset={[-2, 2]}>
          <BellOutlined
            style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }}
            onClick={() => setOpen(true)}
          />
        </Badge>
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellOutlined />
            <span>Notificaciones</span>
            {notificaciones.length > 0 && (
              <Tag color="red" style={{ marginLeft: 4 }}>{notificaciones.length}</Tag>
            )}
          </div>
        }
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        styles={{ body: { padding: 0 } }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : notificaciones.length === 0 ? (
          <div style={{ padding: 40 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#64748b' }}>
                  Todo al día, no hay pendientes
                </span>
              }
            />
          </div>
        ) : (
          <List
            dataSource={notificaciones}
            renderItem={(notif) => (
              <List.Item
                key={notif.id}
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => handleClick(notif)}
              >
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: notif.color === 'orange' ? '#fffbeb'
                      : notif.color === 'blue' ? '#eff6ff' : '#fef2f2',
                    color: notif.color === 'orange' ? '#d97706'
                      : notif.color === 'blue' ? '#2563eb' : '#dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Tag color={tipoLabels[notif.tipo].color} style={{ fontSize: 11, margin: 0 }}>
                        {tipoLabels[notif.tipo].label}
                      </Tag>
                      <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                        {dayjs(notif.fecha).fromNow()}
                      </Text>
                    </div>
                    <div style={{
                      fontWeight: 500, fontSize: 13, marginBottom: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {notif.titulo}
                    </div>
                    <Text style={{
                      fontSize: 12, color: '#64748b',
                      display: 'block',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {notif.descripcion}
                    </Text>
                    {notif.dias >= 14 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <WarningOutlined style={{ color: '#dc2626', fontSize: 11 }} />
                        <Text style={{ fontSize: 11, color: '#dc2626' }}>
                          Lleva {notif.dias} días sin atender
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}

        {notificaciones.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0' }}>
            <Button block onClick={() => { navigate('/contactos'); setOpen(false) }}>
              Ver todos los contactos
            </Button>
          </div>
        )}
      </Drawer>
    </>
  )
}
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form, Input, Select, Switch, Button, Card, Row, Col, Typography,
  InputNumber, DatePicker, message, Space, Tag,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, BankOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { anuncioService, empresaService } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const TIPO_LABELS = {
  OFERTA:  { label: 'Oferta — empresa busca alumnos',    color: 'blue'   },
  DEMANDA: { label: 'Demanda — alumnos buscan empresa',  color: 'orange' },
  INFO:    { label: 'Info — comunicado del departamento', color: 'green'  },
  URGENTE: { label: 'Urgente — atención inmediata',      color: 'red'    },
}

export default function AnuncioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState('INFO')
  const isEdit = Boolean(id)

  useEffect(() => {
    empresaService.getAll({ size: 500, page: 0 })
      .then(({ data }) => setEmpresas(data.content ?? []))
      .catch(() => setEmpresas([]))
  }, [])

  useEffect(() => {
    if (isEdit) {
      anuncioService.getById(id)
        .then(({ data }) => {
          form.setFieldsValue({
            ...data,
            fechaInicio: data.fechaInicio ? dayjs(data.fechaInicio) : null,
            fechaFin:    data.fechaFin    ? dayjs(data.fechaFin)    : null,
          })
          setTipoSeleccionado(data.tipo)
        })
        .catch(() => {
          message.error('No se pudo cargar el anuncio')
          navigate('/anuncios')
        })
    }
  }, [id])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        fechaInicio: values.fechaInicio ? values.fechaInicio.format('YYYY-MM-DD') : null,
        fechaFin:    values.fechaFin    ? values.fechaFin.format('YYYY-MM-DD')    : null,
        empresaId:   values.empresaId   ?? null,
        numPlazas:   values.numPlazas   ?? null,
        ciclo:       values.ciclo       ?? null,
      }

      if (isEdit) {
        await anuncioService.update(id, payload)
        message.success('Anuncio actualizado correctamente')
      } else {
        await anuncioService.create(payload)
        message.success('Anuncio publicado correctamente')
      }
      navigate('/anuncios')
    } catch (err) {
      message.error(err.response?.data?.message || 'Error al guardar el anuncio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/anuncios')}>Volver</Button>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? 'Editar anuncio' : 'Nuevo anuncio'}
          </Title>
          <Text type="secondary">
            {isEdit
              ? 'Modifica el contenido del anuncio en el tablón'
              : 'Publica un nuevo anuncio en el tablón del departamento FCT'}
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ tipo: 'INFO', activo: true, destacado: false }}
        onValuesChange={(changed) => {
          if (changed.tipo) setTipoSeleccionado(changed.tipo)
        }}
      >
        <Row gutter={[16, 0]}>
          {/* ── Left column ─────────────────────────────────────────────── */}
          <Col xs={24} lg={16}>
            <Card title="Contenido del anuncio" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'El título es obligatorio' }]}>
                <Input placeholder="Escribe un título claro y descriptivo" maxLength={255} showCount />
              </Form.Item>
              <Form.Item name="tipo" label="Tipo de anuncio" rules={[{ required: true }]}>
                <Select placeholder="Selecciona el tipo">
                  {Object.entries(TIPO_LABELS).map(([val, cfg]) => (
                    <Option key={val} value={val}>
                      <Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="contenido"
                label="Contenido"
                rules={[{ required: true, message: 'El contenido es obligatorio' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Describe el anuncio con detalle: perfiles necesarios, requisitos, condiciones, fechas relevantes..."
                  showCount
                  maxLength={3000}
                />
              </Form.Item>
            </Card>

            <Card title="Detalles adicionales" style={{ borderRadius: 12 }}>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="ciclo" label="Ciclo formativo (opcional)">
                    <Select placeholder="Todos los ciclos" allowClear>
                      <Option value="DAM">DAM — Desarrollo Aplicaciones Multiplataforma</Option>
                      <Option value="DAW">DAW — Desarrollo Aplicaciones Web</Option>
                      <Option value="SMR">SMR — Sistemas Microinformáticos y Redes</Option>
                      <Option value="ASIR">ASIR — Administración Sistemas Informáticos</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="numPlazas" label="Número de plazas (opcional)">
                    <InputNumber style={{ width: '100%' }} min={1} max={999} placeholder="Ej: 3" />
                  </Form.Item>
                </Col>
              </Row>

              {tipoSeleccionado === 'OFERTA' && (
                <Form.Item name="empresaId" label="Empresa (para ofertas)">
                  <Select
                    placeholder="Selecciona la empresa ofertante"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children?.toLowerCase().includes(input.toLowerCase())
                    }
                    suffixIcon={<BankOutlined />}
                  >
                    {empresas.map(e => (
                      <Option key={e.id} value={e.id}>{e.nombre}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </Card>
          </Col>

          {/* ── Right column ────────────────────────────────────────────── */}
          <Col xs={24} lg={8}>
            <Card title="Vigencia y opciones" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item name="fechaInicio" label="Fecha de inicio (opcional)">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Desde cuándo es válido" />
              </Form.Item>
              <Form.Item name="fechaFin" label="Fecha de vencimiento (opcional)">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Hasta cuándo es válido" />
              </Form.Item>
              <Form.Item
                name="activo"
                label="Estado del anuncio"
                valuePropName="checked"
                style={{ marginBottom: isAdmin() ? undefined : 0 }}
              >
                <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
              </Form.Item>
              {isAdmin() && (
                <Form.Item name="destacado" label="Fijar en tablón" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="Fijado" unCheckedChildren="Normal" />
                </Form.Item>
              )}
            </Card>

            <Card style={{ borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary" htmlType="submit" block size="large"
                  loading={loading} icon={<SaveOutlined />}
                >
                  {isEdit ? 'Guardar cambios' : 'Publicar anuncio'}
                </Button>
                <Button block onClick={() => navigate('/anuncios')}>Cancelar</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

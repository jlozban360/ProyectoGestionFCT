import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: añade token JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ────────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// ── Empresas ────────────────────────────────────────────────────────
export const empresaService = {
  getAll: (params) => api.get('/empresas', { params }),
  getById: (id) => api.get(`/empresas/${id}`),
  create: (data) => api.post('/empresas', data),
  update: (id, data) => api.put(`/empresas/${id}`, data),
  delete: (id) => api.delete(`/empresas/${id}`),
  getContactos: (id) => api.get(`/empresas/${id}/contactos`),
  getAlumnos: (id) => api.get(`/empresas/${id}/alumnos`),
}

// ── Contactos ───────────────────────────────────────────────────────
export const contactoService = {
  getAll: (params) => api.get('/contactos', { params }),
  getById: (id) => api.get(`/contactos/${id}`),
  create: (data) => api.post('/contactos', data),
  update: (id, data) => api.put(`/contactos/${id}`, data),
  delete: (id) => api.delete(`/contactos/${id}`),
}

// ── Alumnos ─────────────────────────────────────────────────────────
export const alumnoService = {
  getAll: (params) => api.get('/alumnos', { params }),
  getById: (id) => api.get(`/alumnos/${id}`),
  create: (data) => api.post('/alumnos', data),
  update: (id, data) => api.put(`/alumnos/${id}`, data),
  delete: (id) => api.delete(`/alumnos/${id}`),
  asignarEmpresa: (alumnoId, req) =>
    api.post(`/alumnos/${alumnoId}/asignar`, req),
}

// ── Profesores ──────────────────────────────────────────────────────
export const profesorService = {
  getAll: () => api.get('/profesores'),
  getById: (id) => api.get(`/profesores/${id}`),
  create: (data) => api.post('/profesores', data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`),
}

// ── Dashboard ───────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getContactosPorMes: () => api.get('/dashboard/contactos-mes'),
  getProfesoresActivos: () => api.get('/dashboard/profesores-activos'),
  getNecesidades: () => api.get('/dashboard/necesidades'),
}

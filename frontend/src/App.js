import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/dashboard/Dashboard'
import EmpresasList from './pages/empresas/EmpresasList'
import EmpresaDetail from './pages/empresas/EmpresaDetail'
import EmpresaForm from './pages/empresas/EmpresaForm'
import AlumnosList from './pages/alumnos/AlumnosList'
import AlumnoForm from './pages/alumnos/AlumnoForm'
import ProfesoresList from './pages/profesores/ProfesoresList'
import ProfesorForm from './pages/profesores/ProfesorForm'
import ContactosList from './pages/contactos/ContactosList'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.rol !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="empresas" element={<EmpresasList />} />
          <Route path="empresas/nueva" element={<EmpresaForm />} />
          <Route path="empresas/:id" element={<EmpresaDetail />} />
          <Route path="empresas/:id/editar" element={<EmpresaForm />} />
          <Route path="alumnos" element={<AlumnosList />} />
          <Route path="alumnos/nuevo" element={<AlumnoForm />} />
          <Route path="alumnos/:id/editar" element={<AlumnoForm />} />
          <Route path="profesores" element={
            <AdminRoute><ProfesoresList /></AdminRoute>
          } />
          <Route path="profesores/nuevo" element={
            <AdminRoute><ProfesorForm /></AdminRoute>
          } />
          <Route path="contactos" element={<ContactosList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

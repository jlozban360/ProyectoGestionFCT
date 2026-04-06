# 🎓 Gestión FCT/FFEOE

Plataforma centralizada para la gestión del departamento de FCT. Proyecto Final de Grado Superior DAM.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Ant Design |
| Estado | Zustand |
| HTTP | Axios |
| Backend | Spring Boot 3.2 + Spring Security |
| Auth | JWT (jjwt 0.12) |
| ORM | JPA / Hibernate |
| Base de datos | PostgreSQL 15 |
| Servidor web | Nginx (reverse proxy) |
| Contenedor | Docker + Docker Compose |

**Puerto: `3050`** (libre de Odoo y Apache)

---

## Requisitos del servidor

- Docker Engine 24+
- Docker Compose v2+
- 2 GB RAM mínimo
- Puerto 3050 libre

---

## Despliegue rápido

```bash
# 1. Clonar / copiar el proyecto al servidor
scp -r gestion-fct/ usuario@IP_SERVIDOR:/opt/

# 2. Conectarse al servidor
ssh usuario@IP_SERVIDOR

# 3. Entrar en el directorio
cd /opt/gestion-fct

# 4. Dar permisos al script y desplegar
chmod +x deploy.sh
./deploy.sh
```

La aplicación estará disponible en `http://IP_SERVIDOR:3050`

**Credenciales iniciales:**
- Email: `admin@fct.edu`
- Password: `admin123`

---

## Estructura del proyecto

```
gestion-fct/
├── docker-compose.yml          # Orquestación de servicios
├── deploy.sh                   # Script de despliegue
├── docker/
│   ├── nginx.conf              # Configuración Nginx (proxy /api → backend)
│   └── init.sql                # Init BD (estructura la crea Hibernate)
├── frontend/                   # React + Vite
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx             # Rutas principales
│   │   ├── layouts/            # MainLayout con sidebar
│   │   ├── pages/
│   │   │   ├── dashboard/      # Panel principal con gráficas
│   │   │   ├── empresas/       # CRUD + timeline de contactos
│   │   │   ├── contactos/      # Vista global de contactos
│   │   │   ├── alumnos/        # CRUD alumnos
│   │   │   └── profesores/     # CRUD profesores (solo ADMIN)
│   │   ├── services/api.js     # Axios + todos los servicios REST
│   │   └── store/authStore.js  # Zustand (auth persistido)
└── backend/                    # Spring Boot
    ├── Dockerfile
    ├── pom.xml
    └── src/main/java/com/fct/
        ├── entity/             # Profesor, Empresa, Contacto, Alumno
        ├── repository/         # JPA Repositories con queries custom
        ├── service/            # Lógica de negocio
        ├── controller/         # REST controllers
        ├── dto/                # Request/Response DTOs
        ├── security/           # JwtService + JwtAuthFilter
        └── config/             # SecurityConfig + DataInitializer
```

---

## Endpoints REST

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → devuelve JWT |
| GET | `/api/auth/me` | Perfil del usuario actual |

### Empresas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/empresas` | Listar (paginado, filtros) |
| GET | `/api/empresas/{id}` | Detalle empresa |
| POST | `/api/empresas` | Crear empresa |
| PUT | `/api/empresas/{id}` | Actualizar empresa |
| DELETE | `/api/empresas/{id}` | Eliminar empresa |
| GET | `/api/empresas/{id}/contactos` | Timeline de contactos |
| GET | `/api/empresas/{id}/alumnos` | Alumnos asignados |

### Contactos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/contactos` | Listar todos (filtros) |
| POST | `/api/contactos` | Registrar contacto |
| PUT | `/api/contactos/{id}` | Editar contacto |
| DELETE | `/api/contactos/{id}` | Eliminar contacto |

### Alumnos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/alumnos` | Listar (filtros) |
| POST | `/api/alumnos` | Crear alumno |
| PUT | `/api/alumnos/{id}` | Actualizar alumno |
| POST | `/api/alumnos/{id}/asignar` | Asignar a empresa |
| DELETE | `/api/alumnos/{id}` | Eliminar alumno |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Estadísticas generales |
| GET | `/api/dashboard/contactos-mes` | Contactos por mes |
| GET | `/api/dashboard/profesores-activos` | Ranking profesores |
| GET | `/api/dashboard/necesidades` | Perfiles más demandados |

---

## Roles y permisos

| Acción | COLABORADOR | ADMIN |
|--------|-------------|-------|
| Ver empresas / alumnos / contactos | ✅ | ✅ |
| Crear / editar empresas | ✅ | ✅ |
| Registrar contactos | ✅ | ✅ |
| Gestionar alumnos | ✅ | ✅ |
| Ver profesores | ✅ | ✅ |
| Crear / editar / borrar profesores | ❌ | ✅ |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Logs solo del backend
docker compose logs -f backend

# Reiniciar solo el frontend (tras cambios)
docker compose build frontend && docker compose up -d frontend

# Acceder a la base de datos
docker compose exec postgres psql -U fct_user -d gestion_fct

# Parar todo
docker compose down

# Parar y borrar datos (¡cuidado!)
docker compose down -v
```

---

## Desarrollo local (sin Docker)

### Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

El proxy de Vite redirige `/api` → `http://localhost:8080`

### Backend
```bash
cd backend
# Requiere PostgreSQL local en puerto 5432
mvn spring-boot:run
```

---

## Variables de entorno (producción)

Editar en `docker-compose.yml`:

```yaml
JWT_SECRET: "cambiar-por-clave-segura-de-al-menos-32-chars"
POSTGRES_PASSWORD: "cambiar-password-bd"
```
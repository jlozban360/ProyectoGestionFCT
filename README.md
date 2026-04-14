# Gestión FCT

Plataforma web centralizada para la gestión del departamento de Formación en Centros de Trabajo (FCT). Permite a los equipos docentes hacer seguimiento de empresas colaboradoras, alumnos en prácticas y el historial de contactos, todo desde una interfaz unificada con panel de estadísticas en tiempo real.

Proyecto Final de Grado Superior — **Desarrollo de Aplicaciones Multiplataforma (DAM)**

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [Requisitos](#requisitos)
4. [Puesta en marcha](#puesta-en-marcha)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [API REST](#api-rest)
7. [Roles y permisos](#roles-y-permisos)
8. [Desarrollo local](#desarrollo-local)
9. [Variables de entorno](#variables-de-entorno)
10. [Comandos útiles](#comandos-útiles)
11. [Autoría y licencia](#autoría-y-licencia)

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2 | Framework UI |
| Vite | 5.1 | Bundler y servidor de desarrollo |
| Ant Design | 5.14 | Biblioteca de componentes |
| Zustand | 4.5 | Gestión de estado global |
| Axios | 1.6 | Cliente HTTP |
| React Router | 6.22 | Enrutamiento SPA |

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 26 | Entorno de ejecución |
| Express | 4.19 | Framework HTTP |
| node-postgres (pg) | 8.11 | Driver PostgreSQL nativo |
| jsonwebtoken | 9.0 | Tokens de sesión stateless |
| bcryptjs | 2.4 | Hash de contraseñas |

### Infraestructura

| Tecnología | Uso |
|---|---|
| PostgreSQL 15 | Base de datos relacional |
| Nginx | Servidor web y reverse proxy |
| Docker + Docker Compose | Contenedorización y orquestación |

---

## Arquitectura

```
         ┌──────────────────────────────┐
         │       Usuario (Navegador)    │
         └───────────────┬──────────────┘
                         │ :3050
         ┌───────────────▼──────────────┐
         │      Nginx (fct_frontend)    │
         │  Sirve SPA React + proxy /api│
         └───────────────┬──────────────┘
                         │ /api → backend:8080
         ┌───────────────▼──────────────┐
         │   Node.js + Express          │
         │   (fct_backend)              │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │       PostgreSQL 15          │
         │       (fct_postgres)         │
         └──────────────────────────────┘
```

---

## Requisitos

- **Docker Engine** 24+
- **Docker Compose** v2+
- 2 GB RAM mínimo disponible
- Puerto **3050** libre en el host

---

## Puesta en marcha

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd gestion-fct

# 2. Levantar la aplicación
docker compose up -d --build
```

La aplicación queda disponible en `http://localhost:3050`

**Credenciales iniciales:**

| Campo | Valor |
|---|---|
| Email | `admin@fct.edu` |
| Contraseña | `admin123` |

> Cambia la contraseña del administrador tras el primer acceso.

---

## Estructura del proyecto

```
gestion-fct/
├── docker-compose.yml            # Orquestación de servicios
├── deploy.sh                     # Script de despliegue en servidor
│
├── docker/
│   ├── nginx.conf                # Proxy /api → backend:8080
│   └── init.sql                  # Inicialización de la base de datos
│
├── frontend/                     # React + Vite
│   ├── Dockerfile
│   └── src/
│       ├── App.jsx               # Rutas y guardas de autenticación
│       ├── layouts/              # MainLayout con sidebar
│       ├── pages/
│       │   ├── dashboard/        # Panel con gráficas y KPIs
│       │   ├── empresas/         # CRUD + timeline de contactos
│       │   ├── contactos/        # Vista global de interacciones
│       │   ├── alumnos/          # CRUD y asignación a empresa
│       │   ├── profesores/       # Gestión de usuarios (solo ADMIN)
│       │   └── perfil/           # Perfil y preferencias
│       ├── services/api.js       # Axios + servicios REST
│       └── store/                # Estado global (Zustand)
│
└── backend/                 # Node.js + Express
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js              # Punto de entrada (puerto 8080)
        ├── config/db.js          # Pool de conexiones PostgreSQL
        ├── middleware/
        │   ├── auth.js           # Verificación JWT + control de roles
        │   └── errorHandler.js   # Manejador global de errores
        ├── routes/               # auth, empresas, alumnos, contactos,
        │                         # profesores, dashboard, health
        └── utils/pagination.js   # Formato de paginación
```

---

## API REST

Todos los endpoints requieren cabecera `Authorization: Bearer <token>` salvo los indicados.

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Pública | Login — devuelve JWT + datos de usuario |
| GET | `/api/auth/me` | JWT | Perfil del usuario autenticado |

### Empresas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/empresas` | Listado paginado con filtros (`search`, `sector`, `page`, `size`) |
| GET | `/api/empresas/{id}` | Detalle de una empresa |
| POST | `/api/empresas` | Crear empresa |
| PUT | `/api/empresas/{id}` | Actualizar empresa |
| DELETE | `/api/empresas/{id}` | Eliminar empresa |
| GET | `/api/empresas/{id}/contactos` | Historial de contactos de la empresa |
| GET | `/api/empresas/{id}/alumnos` | Alumnos asignados a la empresa |

### Contactos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/contactos` | Listado paginado con filtros (`search`, `tipo`, `resultado`, `mes`, `year`) |
| GET | `/api/contactos/{id}` | Detalle de un contacto |
| POST | `/api/contactos` | Registrar contacto (se asocia al usuario autenticado) |
| PUT | `/api/contactos/{id}` | Editar contacto |
| PATCH | `/api/contactos/{id}/resultado` | Actualizar únicamente el resultado |
| DELETE | `/api/contactos/{id}` | Eliminar contacto |

### Alumnos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/alumnos` | Listado paginado con filtros (`search`, `ciclo`, `page`, `size`) |
| GET | `/api/alumnos/{id}` | Detalle de un alumno |
| POST | `/api/alumnos` | Crear alumno |
| PUT | `/api/alumnos/{id}` | Actualizar alumno |
| POST | `/api/alumnos/{id}/asignar` | Asignar alumno a una empresa |
| DELETE | `/api/alumnos/{id}` | Eliminar alumno |

### Profesores

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/profesores` | JWT | Listado de profesores |
| GET | `/api/profesores/{id}` | JWT | Detalle de un profesor |
| POST | `/api/profesores` | ADMIN | Crear profesor |
| PUT | `/api/profesores/{id}` | JWT | Actualizar (ADMIN o el propio usuario) |
| DELETE | `/api/profesores/{id}` | ADMIN | Eliminar profesor |

### Dashboard

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/stats` | KPIs generales (empresas activas, contactos del mes, alumnos disponibles, profesores activos) |
| GET | `/api/dashboard/contactos-mes` | Contactos agrupados por mes (param `year`) |
| GET | `/api/dashboard/profesores-activos` | Ranking de profesores por número de contactos |
| GET | `/api/dashboard/necesidades` | Distribución de alumnos por ciclo formativo |

### Enumeraciones

| Entidad | Campo | Valores posibles |
|---|---|---|
| Empresa | `modalidad` | `FCT` `DUAL` `CONTRATACION` `MIXTA` |
| Alumno | `ciclo` | `DAM` `DAW` `SMR` `ASIR` |
| Alumno | `estado` | `DISPONIBLE` `ENVIADO` `ACEPTADO` `RECHAZADO` `EN_PRACTICAS` |
| Contacto | `tipo` | `LLAMADA` `EMAIL` `VISITA` |
| Contacto | `resultado` | `INTERESADO` `PENDIENTE` `NO_INTERESADO` `EN_PROCESO` `HECHO` `DESCARTADO` |

---

## Roles y permisos

| Acción | COLABORADOR | ADMIN |
|---|---|---|
| Consultar empresas, alumnos y contactos | Sí | Sí |
| Crear y editar empresas | Sí | Sí |
| Registrar y editar contactos | Sí | Sí |
| Gestionar alumnos | Sí | Sí |
| Ver listado de profesores | Sí | Sí |
| Crear profesores | No | Sí |
| Eliminar profesores | No | Sí |
| Editar perfil propio | Sí | Sí |
| Editar perfil de otros | No | Sí |

---

## Desarrollo local

### Frontend

```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
# El proxy de Vite redirige /api → http://localhost:8080
```

### Backend

Requiere PostgreSQL accesible en `localhost:5432` (puedes levantarlo solo con Docker: `docker compose up -d postgres`).

```bash
cd backend
npm install

# Variables de entorno para desarrollo local
echo "DATABASE_URL=postgresql://fct_user:fct_secure_202420252026@localhost:5432/gestion_fct" > .env
echo "JWT_SECRET=nX7mK2pQvR9sL4wY8jF3hD6tA1cE5uB0" >> .env
echo "JWT_EXPIRATION=86400000" >> .env

npm run dev
# Disponible en http://localhost:8080
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | — |
| `JWT_SECRET` | Clave secreta para firma de tokens | Cambiar en producción |
| `JWT_EXPIRATION` | Expiración del token en ms | `86400000` (24 h) |
| `PORT` | Puerto del servidor Node.js | `8080` |

> **Importante:** cambia `JWT_SECRET` y `POSTGRES_PASSWORD` antes de cualquier despliegue en un entorno accesible públicamente.

---

## Comandos útiles

```bash
# Levantar en segundo plano
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Logs del backend
docker compose logs -f fct_backend

# Reiniciar solo el frontend
docker compose build frontend && docker compose up -d frontend

# Acceder a la base de datos
docker compose exec postgres psql -U fct_user -d gestion_fct

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (borra todos los datos)
docker compose down -v
```

---

## Autoría y licencia

**Autor:** José María Lozano Banqueri
**Titulación:** CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)
**Curso:** 2025 / 2026

---

Este proyecto ha sido desarrollado por **José María Lozano Banqueri** como Proyecto Final del CFGS DAM.

Se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.

**GitHub:** https://github.com/jlozban360

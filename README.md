# CE_JUTTA API

API REST desarrollada en **Node.js + Express** para la gestión de alumnos y autenticación de usuarios (coordinadores/administradores), utilizando **PostgreSQL** como base de datos y **Prisma ORM** para el acceso a datos.

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Endpoints de la API](#endpoints-de-la-api)
  - [Auth](#auth-apiauth)
  - [Alumnos](#alumnos-apialumnos)
- [Manejo de errores](#manejo-de-errores)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Notas y posibles mejoras](#notas-y-posibles-mejoras)

## Descripción general

CE_JUTTA es un backend tipo **CRUD + autenticación** pensado para administrar el registro de **alumnos** (nombre, apellido, grado y sección) y gestionar **usuarios** del sistema con roles (`ADMIN` y `COORDINADOR`). El acceso de escritura a los alumnos está protegido mediante una **API key**, mientras que ciertas rutas de usuarios están protegidas mediante **JWT** y **control de acceso por rol**.

El proyecto sigue una arquitectura en capas (rutas → controladores → servicios → repositorios → Prisma/PostgreSQL), lo que facilita separar responsabilidades y realizar pruebas o mantenimiento de forma aislada.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **Node.js** (ESM, `type: module`) | Entorno de ejecución |
| **Express 5** | Framework HTTP / enrutamiento |
| **Prisma 7** (`@prisma/client`, `@prisma/adapter-pg`) | ORM y acceso a PostgreSQL |
| **PostgreSQL** (`pg`) | Base de datos relacional |
| **jsonwebtoken** | Generación y verificación de tokens JWT |
| **bcryptjs** | Hash y verificación de contraseñas |
| **dotenv** | Carga de variables de entorno |

## Arquitectura del proyecto

El flujo de una petición típica es:

```
Cliente → Rutas (routes) → Middlewares (apiKey / auth / requireRole)
        → Controladores (controllers) → Servicios (services, reglas de negocio)
        → Repositorios (repositories, acceso a datos con Prisma) → PostgreSQL
```

- **routes/**: definen los endpoints y qué middlewares/controladores aplican a cada uno.
- **controllers/**: reciben el `req`/`res`, extraen los datos de entrada y delegan la lógica a los servicios.
- **services/**: contienen las reglas de negocio (validaciones, mensajes de error, orquestación).
- **repositories/**: encapsulan las consultas a la base de datos mediante Prisma.
- **middlewares/**: validaciones transversales (API key, JWT, roles, manejo de errores).
- **errors/**: clase `AppError` para errores controlados con código HTTP.

## Modelo de datos

Definido en `prisma/schema.prisma`, con PostgreSQL como proveedor.

### Alumno (`alumnos`)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int | Autoincremental, clave primaria |
| `nombre` | String | Requerido |
| `apellido` | String | Requerido |
| `grado` | String | Requerido |
| `seccion` | String | Requerido |

### Usuario (`usuarios`)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int | Autoincremental, clave primaria |
| `nombre` | String | Requerido |
| `email` | String | Único |
| `passwordHash` | String | Password hasheada con bcrypt |
| `rol` | Enum `Rol` | `ADMIN` \| `COORDINADOR` (por defecto `COORDINADOR`) |

**Historial de migraciones:**
1. `init` — creación de la tabla `alumnos`.
2. `add_usuario` — creación de la tabla `usuarios` con email único.
3. `add_rol_a_usuario` — se agrega el enum `Rol` y la columna `rol` a `usuarios`.

## Variables de entorno

Basado en `.env.example`, se deben definir las siguientes variables en un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
API_KEY=una_clave_secreta_para_operaciones_de_escritura
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd
JWT_SECRET=una_clave_secreta_para_firmar_los_tokens
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que se levanta el servidor Express (por defecto `3000` si no se define). |
| `API_KEY` | Clave requerida en el header `x-api-key` para crear, actualizar o eliminar alumnos. |
| `DATABASE_URL` | Cadena de conexión a la base de datos PostgreSQL, usada por Prisma. |
| `JWT_SECRET` | Secreto usado para firmar y verificar los tokens JWT de autenticación. |

## Instalación y puesta en marcha

```bash
# 1. Clonar / descomprimir el proyecto e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 3. Ejecutar migraciones de Prisma (crea las tablas en la BD indicada en DATABASE_URL)
npx prisma migrate deploy
# (en desarrollo, alternativamente: npx prisma migrate dev)

# 4. Generar el cliente de Prisma (si no se genera automáticamente)
npx prisma generate

# 5. Levantar el servidor en modo desarrollo (con recarga automática vía --watch)
npm run dev
```

Al iniciar correctamente, verás en consola:

```
Servidor corriendo en: http://localhost:<PORT>
```

> **Nota:** el `package.json` actual no define un script `start` para producción; solo `dev` (`node --watch index.js`). Para producción se recomienda agregar un script `"start": "node index.js"`.

## Autenticación y seguridad

El proyecto combina **dos mecanismos de protección** distintos según el recurso:

### 1. API Key (`x-api-key`)
Usada para proteger las operaciones de escritura sobre **alumnos** (`POST`, `PATCH`, `DELETE`). El cliente debe enviar el header:

```
x-api-key: <valor de API_KEY en .env>
```

### 2. JWT (Bearer Token)
Usado para proteger rutas relacionadas con **usuarios** (perfil, listado de usuarios). El flujo es:

1. El usuario se registra (`POST /api/auth/registro`).
2. El usuario inicia sesión (`POST /api/auth/login`) y recibe un token JWT válido por **1 hora**.
3. El token se envía en las siguientes peticiones protegidas mediante:

```
Authorization: Bearer <token>
```

### 3. Roles
El enum `Rol` (`ADMIN`, `COORDINADOR`) permite restringir rutas específicas. Por ejemplo, `GET /api/auth/usuarios` solo es accesible para usuarios con rol `ADMIN`, gracias al middleware `requireRole('ADMIN')`.

### Seguridad de contraseñas
Las contraseñas nunca se almacenan en texto plano: se hashean con **bcrypt** (factor de costo `12`) antes de guardarse, y se validan reglas de longitud (entre 8 y 72 caracteres) tanto al registrar como al cambiar contraseña.

## Endpoints de la API

Prefijo base: `/api`

### Auth (`/api/auth`)

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/registro` | Ninguna | Registra un nuevo usuario (`nombre`, `email`, `password`). Devuelve `201` con `{id, nombre, email}`. |
| `POST` | `/api/auth/login` | Ninguna | Inicia sesión (`email`, `password`). Devuelve `{usuario, token}`. |
| `PATCH` | `/api/auth/usuarios/:id/password` | Ninguna* | Cambia la contraseña de un usuario (`passwordActual`, `passwordNueva`). Devuelve `204`. |
| `GET` | `/api/auth/perfil` | JWT (`requireAuth`) | Devuelve el perfil del usuario autenticado (`id, nombre, email, rol`). |
| `GET` | `/api/auth/usuarios` | JWT + Rol `ADMIN` | Lista todos los usuarios registrados. |

> \* **Importante:** a diferencia de las demás rutas sensibles, `PATCH /api/auth/usuarios/:id/password` actualmente **no** tiene el middleware `requireAuth` aplicado en `auth.routes.js`, por lo que cualquiera que conozca el `id` y la contraseña actual podría cambiarla sin estar autenticado. Se recomienda agregar `requireAuth` a esta ruta (ver [Notas y posibles mejoras](#notas-y-posibles-mejoras)).

#### Ejemplo — Registro
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Erick García",
  "email": "erick@example.com",
  "password": "contraseñaSegura123"
}
```

#### Ejemplo — Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "erick@example.com",
  "password": "contraseñaSegura123"
}
```

### Alumnos (`/api/alumnos`)

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| `GET` | `/api/alumnos` | Ninguna | Lista todos los alumnos. Admite `?grado=` como filtro opcional. |
| `GET` | `/api/alumnos/:id` | Ninguna | Devuelve un alumno por su `id`. |
| `POST` | `/api/alumnos` | API Key | Crea un nuevo alumno (`nombre`, `apellido`, `grado`, `seccion`). |
| `PATCH` | `/api/alumnos/:id` | API Key | Actualiza uno o varios campos permitidos (`nombre`, `apellido`, `grado`, `seccion`). |
| `DELETE` | `/api/alumnos/:id` | API Key | Elimina un alumno por su `id`. Devuelve `204`. |

#### Ejemplo — Crear alumno
```http
POST /api/alumnos
Content-Type: application/json
x-api-key: <API_KEY>

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "grado": "9",
  "seccion": "A"
}
```

#### Reglas de negocio relevantes
- No se permite crear un alumno con el mismo `nombre` y `apellido` que otro ya existente (`409 Conflict`).
- Todos los campos son obligatorios al crear un alumno (`400 Bad Request` si falta alguno).
- Al actualizar, solo se aceptan los campos `nombre`, `apellido`, `grado` y `seccion`; cualquier otro campo enviado es ignorado, y si no se envía ninguno válido se responde `400`.

## Manejo de errores

El proyecto centraliza el manejo de errores en `src/middlewares/errorHandler.js`:

- **Errores de negocio (`AppError`)**: se devuelven con el `statusCode` definido al lanzarlos (400, 401, 403, 404, 409, etc.) junto con un mensaje descriptivo en español.
- **Errores de Prisma**: se contemplan los códigos `P2002` (violación de restricción única → `400`) y `P2025` (registro no encontrado → `404`).
- **Errores no controlados**: responden `500 Internal Server Error` con un mensaje genérico, y se registran en consola con método, URL y mensaje del error.

## Estructura de carpetas

```
CE_JUTTA/
├── index.js                     # Punto de entrada: configura Express y monta las rutas
├── prisma.config.js              # Configuración de Prisma (schema, migraciones, datasource)
├── prisma/
│   ├── schema.prisma              # Definición de modelos Alumno y Usuario
│   └── migrations/                 # Historial de migraciones SQL
├── src/
│   ├── config/
│   │   └── prisma.js               # Instancia del PrismaClient con adapter de PostgreSQL
│   ├── controllers/
│   │   ├── alumno.controller.js
│   │   └── auth.controller.js
│   ├── errors/
│   │   └── appError.js             # Clase de error personalizada con código HTTP
│   ├── middlewares/
│   │   ├── apiKey.js               # Verifica el header x-api-key
│   │   ├── auth.js                 # Verifica el JWT (Bearer token)
│   │   ├── requireRole.js          # Verifica el rol del usuario autenticado
│   │   └── errorHandler.js         # Middleware global de manejo de errores
│   ├── repositories/
│   │   ├── alumno.repository.js    # Acceso a datos de Alumno vía Prisma
│   │   └── usuario.repository.js   # Acceso a datos de Usuario vía Prisma
│   ├── routes/
│   │   ├── alumno.routes.js
│   │   └── auth.routes.js
│   ├── services/
│   │   ├── alumno.service.js       # Reglas de negocio de Alumno
│   │   └── auth.service.js         # Reglas de negocio de autenticación
│   └── utils/
│       ├── password.js             # hashPassword / comparePassword (bcrypt)
│       └── token.js                # generarToken / verificarToken (JWT)
├── .env.example
└── package.json
```

## Notas y posibles mejoras

Durante el análisis del código se identificaron algunos puntos que conviene tener en cuenta para robustecer el proyecto:

1. **Ruta de cambio de contraseña sin autenticación**: `PATCH /api/auth/usuarios/:id/password` no aplica el middleware `requireAuth`. Se recomienda protegerla y validar que el `id` del token coincida con el `id` de la ruta (o restringirla al propio usuario/administrador).
2. **`listarUsuarios` en `auth.service.js` no retorna datos**: la función obtiene `usuarios` del repositorio pero no incluye un `return`, por lo que el endpoint `GET /api/auth/usuarios` actualmente devolvería `undefined`. Falta agregar `return usuarios;`.
3. **Captura de errores de Prisma**: en `errorHandler.js` se comprueba `err instanceof Prisma.PrismaClientUnknownRequestError` para los códigos `P2002`/`P2025`, pero estos códigos pertenecen normalmente a `Prisma.PrismaClientKnownRequestError`. Conviene revisar y ajustar la clase usada para que el manejo de errores de restricción única y "no encontrado" funcione como se espera.
4. **Script de producción**: agregar `"start": "node index.js"` en `package.json` para desplegar sin `--watch`.
5. **Validación de entrada**: actualmente las validaciones son manuales dentro de los servicios; para un proyecto más grande podría convenir una librería de validación de esquemas (por ejemplo, Zod o Joi).
6. **Documentación de API**: no se encontró una colección de Postman ni documentación Swagger en este proyecto (a diferencia de otros proyectos recientes del autor); podría añadirse para facilitar las pruebas manuales.

---

*README generado a partir del análisis del código fuente del proyecto `CE_JUTTA` (Node.js/Express + Prisma + PostgreSQL).*

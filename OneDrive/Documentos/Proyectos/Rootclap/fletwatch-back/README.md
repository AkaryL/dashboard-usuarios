# FleetWatch Backend API 🚚

Backend API REST para el sistema de monitoreo de flotas vehiculares FleetWatch.

## 🛠️ Stack Tecnológico

- **Node.js** con **TypeScript**
- **Express.js** - Framework web
- **Better-SQLite3** - Base de datos SQLite
- **Socket.io** - WebSockets para tiempo real
- **CORS** - Configuración de seguridad

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/AkaryL/fletwatch-back.git
cd fletwatch-back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📝 Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/:id` - Obtener vehículo
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Historial de Vehículos
- `GET /api/vehicles/:id/history` - Obtener historial completo
- `GET /api/vehicles/:id/history/dates` - Fechas disponibles
- `GET /api/vehicles/:id/history/date/:date` - Historial de un día específico
- `GET /api/vehicles/:id/history/stats` - Estadísticas del historial
- `POST /api/vehicles/:id/history` - Agregar punto al historial

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Geocercas
- `GET /api/geofences` - Listar geocercas
- `POST /api/geofences` - Crear geocerca
- `DELETE /api/geofences/:id` - Eliminar geocerca

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas

## 🔌 WebSocket Events

El servidor emite eventos en tiempo real vía Socket.io:

- `vehicle:created` - Nuevo vehículo creado
- `vehicle:updated` - Vehículo actualizado
- `vehicle:deleted` - Vehículo eliminado
- `client:created` - Nuevo cliente
- `client:updated` - Cliente actualizado
- `client:deleted` - Cliente eliminado
- `geofence:created` - Nueva geocerca
- `geofence:deleted` - Geocerca eliminada
- `notification:updated` - Notificación actualizada

## 🚀 Deployment en Railway

### 1. Preparar el proyecto

Ya está preparado para deployment con:
- ✅ Script `start` para producción
- ✅ Variables de entorno configuradas
- ✅ CORS dinámico
- ✅ TypeScript compilado

### 2. Subir a GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Deploy en Railway

1. Ve a [railway.app](https://railway.app)
2. Click en "New Project" → "Deploy from GitHub repo"
3. Selecciona `fletwatch-back`
4. Configura las variables de entorno:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.vercel.app
```

5. Railway detectará automáticamente:
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. Obtén tu URL: `https://fletwatch-back.up.railway.app`

### 4. Actualizar Frontend

En tu frontend, actualiza las variables de entorno:

```env
VITE_API_URL=https://fletwatch-back.up.railway.app
VITE_WS_URL=wss://fletwatch-back.up.railway.app
```

## 🗄️ Base de Datos

El proyecto usa **SQLite** con las siguientes tablas:

- `users` - Usuarios del sistema
- `user_vehicles` - Relación usuarios-vehículos
- `vehicles` - Vehículos de la flota
- `vehicle_history` - Historial de posiciones
- `clients` - Clientes
- `geofences` - Geocercas
- `notifications` - Notificaciones

### Migrar a PostgreSQL (Producción)

Para producción seria, se recomienda migrar a PostgreSQL:

1. En Railway, agrega un servicio de PostgreSQL
2. Instala `pg`: `npm install pg`
3. Reemplaza `better-sqlite3` por `pg`
4. Actualiza las queries a sintaxis PostgreSQL

## 🔐 Seguridad

### Recomendaciones para Producción

- [ ] Implementar autenticación JWT real
- [ ] Agregar rate limiting (express-rate-limit)
- [ ] Implementar helmet.js para headers HTTP seguros
- [ ] Validación de entrada con Zod o Joi
- [ ] Encriptar contraseñas con bcrypt
- [ ] Implementar logs con Winston o Pino
- [ ] Monitoreo con Sentry o similar

## 📊 Estructura del Proyecto

```
fletwatch-back/
├── server/
│   ├── index.ts          # Servidor Express principal
│   └── database.ts       # Configuración y seeders de SQLite
├── dist/                 # Build de producción (generado)
├── .env.example          # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Estados de Vehículos

- `moving` - En movimiento
- `stopped` - Detenido
- `offline` - Sin señal
- `critical` - Estado crítico

## 👥 Roles de Usuario

- `superuser` - Acceso total al sistema
- `admin` - Gestión de vehículos y clientes
- `cliente` - Solo visualización

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado para FleetWatch

---

**Nota**: Este backend incluye datos de prueba (seed data). Para producción, eliminar o modificar el seeder en `server/database.ts`.

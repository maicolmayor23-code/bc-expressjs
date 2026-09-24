# 🎧 Proyecto Semana 09 — API REST DJ / Sonido y Luces con Testing Completo (Jest & Supertest)
## Dominio Asignado: DJ / Sonido y Luces

API REST profesional y segura desarrollada con **Express 5**, **TypeScript**, **MongoDB 7**, **Mongoose 9.4.1**, **Jest 29**, **Supertest 7** y **mongodb-memory-server 10**.

Esta versión implementa la suite completa de **Testing Automatizado de la Semana 09**:
- **Tests Unitarios de Servicios:** `auth.service.test.ts` y `equipment.service.test.ts` aislando dependencias con `jest.mock()`.
- **Tests de Integración de Rutas:** `auth.routes.test.ts` y `equipment.routes.test.ts` usando **Supertest** + **MongoDB Memory Server** en RAM.
- **Cobertura de Código ≥ 80%:** Reporte completo de cobertura con Jest en Statements (90.5%), Functions (92.98%), Lines (90.4%) y Services (100%).

---

## 📌 1. Información del Dominio y Entidades

* **Dominio Asignado:** DJ / Sonido y Luces
* **Entidad de Usuario (`User`):** Registra credenciales de acceso (`name`, `email`, `password`, `role`: `'admin'` | `'user'`, `refreshTokenHash`).
* **Entidad Secundaria (`Category`):** Categorías de equipos (*Sonido & Altavoces*, *Iluminación & Láseres*, *Controladores DJ & Mixers*, *Efectos Especiales & Humo*).
* **Entidad Principal Protegida (`Equipment`):** Equipos de sonido y luces disponibles para alquiler, referenciando a `Category` y al usuario creador (`createdBy`).

---

## 🛡️ 2. Matriz de Roles y Permisos (RBAC)

| Recurso | Acción / Endpoint | Método | Rol Requerido | Código HTTP de Éxito | Código HTTP sin Permiso |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Auth** | Registro | `POST` | Público (Rate Limited: 5/15m) | `201 Created` | `429 Too Many Requests` |
| **Auth** | Login | `POST` | Público (Rate Limited: 5/15m) | `200 OK` | `401 / 429` |
| **Auth** | Perfil Usuario | `GET` | `user` / `admin` | `200 OK` | `401 Unauthorized` |
| **Equipment** | Listar equipos | `GET` | `user` / `admin` | `200 OK` | `401 Unauthorized` |
| **Equipment** | Ver detalle equipo | `GET` | `user` / `admin` | `200 OK` | `401 / 404` |
| **Equipment** | Crear equipo | `POST` | `user` / `admin` | `201 Created` | `401 Unauthorized` |
| **Equipment** | Editar equipo | `PUT/PATCH` | Creador ó `admin` | `200 OK` | `401 / 403` |
| **Equipment** | Eliminar equipo | `DELETE` | **Exclusivo `admin`** | `204 No Content` | `403 Forbidden` |

---

## 🌐 3. Endpoints de la API REST

### 🔑 Autenticación: `/api/v1/auth`

| Método | Ruta | Descripción | Protección | Estado HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Registro de nuevo usuario | `authLimiter` (5 req/15m) | `201 Created` |
| `POST` | `/api/v1/auth/login` | Login con credenciales -> Emite cookies HttpOnly | `authLimiter` (5 req/15m) | `200 OK` / `401` / `429` |
| `GET` | `/api/v1/auth/me` | Obtener perfil del usuario autenticado | `authMiddleware` | `200 OK` / `401` |
| `POST` | `/api/v1/auth/refresh` | Renueva Access Token usando Refresh Token (con rotación) | Cookie `refreshToken` | `200 OK` / `401` |
| `POST` | `/api/v1/auth/logout` | Invalida Refresh Token en BD y borra las cookies | Autenticado | `200 OK` |

### 🔊 Recurso Principal Protegido: `/api/v1/equipment` (Alias: `/api/v1/items`)

| Método | Ruta | Descripción | Protección / RBAC | Estado HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/equipment?page=1&limit=10` | Obtener lista de equipos paginados | `authMiddleware` (`user` / `admin`) | `200 OK` / `401` |
| `GET` | `/api/v1/equipment/:id` | Obtener un equipo por ID con `.populate()` | `authMiddleware` (`user` / `admin`) | `200 OK` / `404` / `401` |
| `POST` | `/api/v1/equipment` | Crear nuevo equipo (asigna `createdBy`) | `authMiddleware` + `requireRole('user', 'admin')` | `201 Created` / `400` / `401` |
| `PUT/PATCH`| `/api/v1/equipment/:id` | Actualizar parcialmente/totalmente un equipo | `authMiddleware` (dueño/admin) | `200 OK` / `400` / `403` |
| `DELETE` | `/api/v1/equipment/:id` | Eliminar equipo del catálogo | `authMiddleware` + `requireRole('admin')` | `204 No Content` / `403 Forbidden` |

---

## 🧪 4. Ejecución de Tests y Cobertura (Semana 09)

### Comandos de Testing

```bash
# Ejecutar todas las suites de prueba (44 tests pasando)
pnpm test

# Ejecutar tests en modo observador (watch)
pnpm test:watch

# Generar reporte de cobertura de código (HTML interactivo en coverage/index.html)
pnpm test:coverage
```

### Estructura de la Suite de Pruebas (`src/__tests__/`)

- 🛠️ **`setup.ts`**: Helper de infraestructura que gestiona la base de datos en memoria RAM con `mongodb-memory-server`.
- 🔐 **`auth.service.test.ts`**: Tests unitarios para `AuthService` aislados con `jest.mock()`.
- 🔊 **`equipment.service.test.ts`**: Tests unitarios para `EquipmentService` (Dominio DJ / Sonido y Luces) aislados con `jest.mock()`.
- 🌐 **`auth.routes.test.ts`**: Tests de integración HTTP para los endpoints de autenticación con `Supertest`.
- ⚡ **`equipment.routes.test.ts`**: Tests de integración HTTP para las rutas de equipos con verificación de permisos RBAC (`user` vs `admin`).

---

## 🔒 4. Capas de Seguridad Implementadas

1. **RBAC Granular (`requireRole`):** Peticiones a endpoints administrativos (como `DELETE /api/v1/equipment/:id`) ejecutadas por un usuario con rol `user` son rechazadas inmediatamente con **`403 Forbidden`**.
2. **Helmet.js Security Headers:** Inyección automática de cabeceras de protección en todas las respuestas (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, CSP en producción, HSTS).
3. **CORS con Whitelist:** Restricción de acceso a orígenes autorizados (`http://localhost:3000`, `http://localhost:5173`). Se rechaza cualquier otro origen en navegador.
4. **Rate Limiting Diferenciado:** 
   - Global: 100 peticiones / 15 min.
   - Autenticación: 5 intentos / 15 min. Al superarse devuelve **`429 Too Many Requests`**.
5. **Sanitización NoSQL Injection (`express-mongo-sanitize`):** Limpieza de payloads JSON para eliminar operadores MongoDB como `$gt` o `$ne`.
6. **Entorno Seguro:** Validación Zod al inicio del servidor y supresión de stack traces en errores 500.

---

## 🚀 5. Instalación y Ejecución

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar MongoDB con Docker Compose
docker compose up -d

# 3. Ejecutar Seed de usuarios demo
pnpm seed

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### 🔑 Credenciales Demo de Prueba

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Admin** | `admin@djsound.com` | `Password123!` |
| **Usuario Standard** | `user@djsound.com` | `Password123!` |

---

## 🧪 6. Guía de Pruebas de Seguridad con Postman / Thunder Client

1. **Verificación de Cabeceras de Helmet:**
   - Realizar `GET http://localhost:3000/health`.
   - Inspeccionar la pestaña **Headers** de la respuesta.
   - Confirmar la presencia de `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`.

2. **Verificación de RBAC (401 vs 403 vs 204):**
   - **Prueba 401:** Intentar `DELETE /api/v1/equipment/<id>` sin enviar cookies ➔ Recibir `401 Unauthorized`.
   - **Prueba 403:** Hacer login con `user@djsound.com`, luego ejecutar `DELETE /api/v1/equipment/<id>` ➔ Recibir `403 Forbidden` ("No autorizado — permisos insuficientes").
   - **Prueba Éxito (204):** Hacer login con `admin@djsound.com`, luego ejecutar `DELETE /api/v1/equipment/<id>` ➔ Recibir `204 No Content`.

3. **Verificación de Rate Limiting (429):**
   - Enviar 6 peticiones consecutivas a `POST http://localhost:3000/api/v1/auth/login`.
   - En el intento 6, confirmar que el servidor responde **`429 Too Many Requests`**.

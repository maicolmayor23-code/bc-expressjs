# 🎧 Proyecto Semana 07 — API REST con Autenticación JWT Completa y Cookies HttpOnly
## Dominio Asignado: DJ / Sonido y Luces

API REST profesional desarrollada con **Express 5**, **TypeScript**, **MongoDB 7**, **Mongoose 9.4.1**, **bcrypt 6**, **jsonwebtoken 9** y **Zod 4**.

Esta versión implementa la arquitectura completa de **Autenticación y Autorización de la Semana 07**:
- Hashing seguro de contraseñas con `bcrypt` (10 salt rounds).
- Autenticación mediante tokens JWT (Access Token de 15 min y Refresh Token de 7 días).
- Transmisión exclusiva de tokens en cookies **`HttpOnly`** con `secure` y `sameSite: lax`.
- Rotación automática de Refresh Tokens en el endpoint `/refresh`.
- Almacenamiento únicamente del hash del Refresh Token en la base de datos (`refreshTokenHash` con `select: false`).
- Protección global de todas las rutas del recurso principal **`Equipment`** mediante `authMiddleware`.
- Prevención de ataques de enumeración de usuarios en el proceso de login.

---

## 📌 1. Información del Dominio y Entidades

* **Dominio Asignado:** DJ / Sonido y Luces
* **Entidad de Usuario (`User`):** Registra credenciales de acceso (`name`, `email`, `password`, `role`, `refreshTokenHash`).
* **Entidad Secundaria (`Category`):** Categorías de equipos (*Sonido & Altavoces*, *Iluminación & Láseres*, *Controladores DJ & Mixers*, *Efectos Especiales & Humo*).
* **Entidad Principal Protegida (`Equipment`):** Equipos de sonido y luces disponibles para alquiler, referenciando a `Category` y al usuario creador (`createdBy`).

---

## 📐 2. Modelo de Datos Mongoose

### Usuario (`User`)
```ts
const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false }, // Oculto por defecto
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  refreshTokenHash: { type: String, default: null, select: false } // Hash en DB
}, { timestamps: true });
```

### Equipo (`Equipment`)
```ts
const equipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  serialNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  brand: { type: String, required: true, trim: true },
  dailyRate: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

---

## 🚀 3. Instalación y Ejecución

### Requisitos Previos
* Node.js >= 22.0.0
* pnpm >= 10.0.0
* Docker y Docker Compose (para MongoDB 7)

### Pasos de Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Levantar MongoDB 7 con Docker**:
   ```bash
   docker compose up -d
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```

4. **Ejecutar Seed de usuarios y datos demo**:
   ```bash
   pnpm seed
   ```

5. **Iniciar servidor en modo desarrollo**:
   ```bash
   pnpm dev
   ```
   *Servidor escuchando en:* `http://localhost:3000`

---

## 🔑 4. Credenciales de Prueba (Generadas en `pnpm seed`)

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Admin** | `admin@djsound.com` | `Password123!` |
| **Usuario** | `user@djsound.com` | `Password123!` |

---

## 🌐 5. Endpoints de la API REST

### 🔑 Autenticación: `/api/v1/auth`

| Método | Ruta | Descripción | Protección | Estado HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Registro de nuevo usuario (password hasheado) | Pública | `201 Created` |
| `POST` | `/api/v1/auth/login` | Login con credenciales -> Emite cookies HttpOnly | Pública | `200 OK` / `401` |
| `GET` | `/api/v1/auth/me` | Obtener perfil del usuario autenticado | `authMiddleware` | `200 OK` / `401` |
| `POST` | `/api/v1/auth/refresh` | Renueva Access Token usando Refresh Token (con rotación) | Cookie `refreshToken` | `200 OK` / `401` |
| `POST` | `/api/v1/auth/logout` | Invalida Refresh Token en BD y borra las cookies | Pública/Autenticada | `200 OK` |

### 🔊 Recurso Principal Protegido: `/api/v1/equipment` (Alias: `/api/v1/items`)

> 🔒 **Todas las rutas CRUD del recurso principal requieren autenticación mediante la cookie `accessToken`.**

| Método | Ruta | Descripción | Protección | Estado HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/equipment?page=1&limit=10` | Obtener lista de equipos paginados | `authMiddleware` | `200 OK` / `401` |
| `GET` | `/api/v1/equipment/:id` | Obtener un equipo por ID con `.populate()` | `authMiddleware` | `200 OK` / `404` / `401` |
| `POST` | `/api/v1/equipment` | Crear nuevo equipo (asigna `createdBy`) | `authMiddleware` | `201 Created` / `400` / `401` |
| `PUT/PATCH`| `/api/v1/equipment/:id` | Actualizar parcialmente/totalmente un equipo | `authMiddleware` | `200 OK` / `400` / `404` / `401` |
| `DELETE` | `/api/v1/equipment/:id` | Eliminar un equipo por ObjectId | `authMiddleware` | `204 No Content` / `404` / `401` |

---

## 🔒 6. Medidas de Seguridad Implementadas

1. **Passwords no expuestas:** El atributo `{ select: false }` en Mongoose impide el retorno de hashes de contraseñas.
2. **Protección contra User Enumeration:** `/login` retorna exactamente el mismo error de credenciales inválidas para email no encontrado y password incorrecto.
3. **Secretos Independientes:** `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son totalmente independientes en `.env`.
4. **Protección XSS con Cookies HttpOnly:** Se desaconseja e impide guardar tokens en `localStorage`. Las cookies cuentan con los atributos `httpOnly`, `secure` (en producción) y `sameSite: 'lax'`.
5. **Rotación de Refresh Tokens:** Cada invocación a `/refresh` genera un nuevo par de tokens e invalida el anterior en la BD.
6. **Cuestionario Teórico:** Se incluye el archivo `CUESTIONARIO_TEORICO.md` respondiendo a los 10 temas evaluativos de la rúbrica.

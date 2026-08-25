# 🎧 Proyecto Semana 04 — Validación, Errores y Logging
## Dominio: DJ / Sonido y Luces (Equipment API)

API REST desarrollada con **Express.js** y **TypeScript**, refactorizada y evolucionada para la **Semana 04** del Bootcamp. Incorpora validación runtime con **Zod**, manejo estructurado de errores con **AppError**, middleware global de errores y logging profesional con **Winston** y **Morgan**.

---

## 📌 1. Información del Dominio

* **Dominio Asignado:** DJ / Sonido y Luces
* **Recurso Principal:** `Equipment` (`equipment`)
* **Categorías Válidas:**
  * `sound`: Equipos de sonido (bafles, consolas, micrófonos).
  * `lights`: Iluminación (cabezas móviles, leds, par leds).
  * `dj_gear`: Consolas DJ y controladores.
  * `effects`: Efectos especiales (máquinas de humo, ventiscas).

---

## 📋 2. Estructura de la Entidad `Equipment`

```typescript
interface Equipment {
  id: number;           // Identificador único (autoincremental)
  name: string;         // Nombre del equipo (ej: "Consola DJ Pioneer DDJ-FLX6")
  category: "sound" | "lights" | "dj_gear" | "effects"; // Categoría del equipo
  dailyRate: number;    // Tarifa diaria de alquiler (número positivo > 0)
  isAvailable: boolean; // Disponibilidad para alquiler (por defecto: true)
  createdAt: string;    // Fecha de creación en formato ISO 8601
}
```

---

## 🛡️ 3. Validaciones Runtime con Zod

Ubicación: `src/schemas/equipment.schema.ts`

* **`createEquipmentSchema`**:
  * `name`: string obligatorio, no vacío, `.trim()`.
  * `category`: enum exacto (`sound`, `lights`, `dj_gear`, `effects`).
  * `dailyRate`: número positivo mayor a `0`.
  * `isAvailable`: booleano opcional (default `true`).
* **`updateEquipmentSchema`**:
  * Reutiliza `createEquipmentSchema.partial()` para permitir actualizaciones parciales.
* **`equipmentIdParamSchema`**:
  * Valida el parámetro `:id` en rutas convirtiendo a entero positivo (`z.coerce.number().int().positive()`).
* **`queryPaginationSchema`**:
  * Valida parámetros `page` (default 1) y `limit` (default 10) para la paginación.

Los tipos DTOs TypeScript se infieren directamente de los esquemas Zod utilizando `z.infer<>`.

---

## 💥 4. Manejo de Errores Estructurado

* **Clase `AppError`** (`src/errors/AppError.ts`):
  * Modela errores operacionales del dominio especificando `statusCode` e `isOperational = true`.
  * La capa de servicio lanza `throw new AppError(404, "Equipment with ID X not found")`.
* **Middleware `notFound`** (`src/middlewares/notFound.ts`):
  * Captura cualquier ruta inexistente y responde en JSON `404 Not Found` (`{ "error": "Not Found", "message": "Route not found" }`).
* **Middleware Global `errorHandler`** (`src/middlewares/errorHandler.ts`):
  * Firma de 4 parámetros: `(err, req, res, next)`.
  * **`ZodError`**: Responde `400 Bad Request` con arreglo estructurado de `issues[]`.
  * **`AppError`**: Responde `err.statusCode`, emite `logger.warn()` y entrega JSON descriptivo.
  * **Error Genérico (500)**: Registra mediante `logger.error()` y oculta detalles internos en producción.

---

## 📝 5. Logging Profesional (Winston + Morgan)

Ubicación: `src/config/logger.ts`

* **Winston Logger**:
  * **Desarrollo (`NODE_ENV !== 'production'`)**: Nivel `http`, salida en consola formateada con timestamp y colores.
  * **Producción (`NODE_ENV === 'production'`)**: Nivel `warn`, salida JSON estructurada en consola y archivo log `logs/error.log`.
* **Morgan Middleware**:
  * Captura peticiones HTTP automáticamente y redirige los logs al stream `logger.http()`.
* **Cero `console.*`**: Todo el código en `src/` utiliza exclusivamente Winston (`logger.info`, `logger.warn`, `logger.error`, `logger.http`).

---

## 🏗️ 6. Arquitectura en Capas

```text
src/
├── config/
│   └── logger.ts          # Winston logger + Morgan stream
├── errors/
│   └── AppError.ts        # Clase para errores operacionales HTTP
├── middlewares/
│   ├── errorHandler.ts    # Handler de errores de 4 parámetros
│   └── notFound.ts        # Handler para rutas 404 JSON
├── schemas/
│   └── equipment.schema.ts # Esquemas Zod y tipos DTOs inferidos
├── repositories/
│   └── equipment.repository.ts # Persistencia en memoria
├── services/
│   └── equipment.service.ts   # Lógica de negocio y disparo de AppError
├── controllers/
│   └── equipment.controller.ts # Thin controllers con safeParse() y next(err)
├── routes/
│   ├── equipment.routes.ts    # 5 endpoints CRUD
│   └── items.routes.ts        # Re-exportación para alias
├── types.ts               # Interfaces globales y contratos de respuesta
├── app.ts                 # Configuración de Express, middlewares y rutas
└── server.ts              # Bootstrap del servidor y graceful shutdown
```

---

## 🚀 7. Endpoints API

### Recurso Principal: `/api/v1/equipment`
### Alias de Compatibilidad: `/api/v1/items`

| Método | Ruta | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/equipment` | Obtener equipos paginados (`?page=1&limit=10`) | `200 OK` |
| `GET` | `/api/v1/equipment/:id` | Obtener equipo por ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/v1/equipment` | Crear nuevo equipo (validación Zod) | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/v1/equipment/:id` | Actualizar equipo parcial/total | `200 OK` / `400` / `404` |
| `DELETE` | `/api/v1/equipment/:id` | Eliminar equipo por ID | `204 No Content` / `404` |

---

## 💻 8. Instalación y Ejecución

### Requisitos Previos
* Node.js >= 22.0.0
* pnpm >= 10.0.0

### Pasos

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Iniciar servidor en modo desarrollo**:
   ```bash
   pnpm dev
   ```
   Servidor disponible en: `http://localhost:3000`

3. **Compilar proyecto (verificación TypeScript)**:
   ```bash
   pnpm run build
   ```

4. **Iniciar en producción**:
   ```bash
   NODE_ENV=production pnpm start
   ```

# 🎧 Proyecto Semana 06 — API REST con MongoDB + Mongoose
## Dominio Asignado: DJ / Sonido y Luces

API REST profesional desarrollada con **Express 5**, **TypeScript**, **MongoDB 7** y **Mongoose 9.4.1** para la **Semana 06** del Bootcamp. Implementa arquitectura en capas, relaciones por referencia con **`.populate()`**, validación con **Zod**, manejo estructurado de errores nativos de MongoDB (`CastError`, `11000`), paginación en lecturas optimizada con **`.lean()`**, y script de sembrado de datos demo (**`seed`**).

---

## 📌 1. Información del Dominio y Entidades

* **Dominio Asignado:** DJ / Sonido y Luces
* **Entidad Secundaria (Sin referencias):** `Category` (`/api/v1/categories`)
  - Representa las categorías de equipos (ej. *Sonido & Altavoces*, *Iluminación & Láseres*, *Controladores DJ & Mixers*, *Efectos Especiales & Humo*).
* **Entidad Principal (Con referencia a Secundaria):** `Equipment` (`/api/v1/equipment` y alias `/api/v1/items`)
  - Representa los equipos de sonido y luces disponibles para alquiler.
  - Guarda una referencia mediante `Schema.Types.ObjectId` (con `ref: 'Category'`) hacia la categoría correspondiente.

---

## 📐 2. Modelo de Datos y Esquemas Mongoose

### Categoría (`Category`)
```ts
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  active: { type: Boolean, default: true }
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
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
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

4. **Ejecutar Seed de datos iniciales**:
   ```bash
   pnpm seed
   ```

5. **Iniciar servidor en modo desarrollo**:
   ```bash
   pnpm dev
   ```
   *Servidor escuchando en:* `http://localhost:3000`

---

## 📜 4. Logs de Ejecución del Seed (`pnpm seed`)

```text
🌱 Iniciando proceso de seeding para DJ / Sonido y Luces...
🍃 Connected to MongoDB successfully
🧹 Limpiando colecciones existentes...
🏷️ Insertando categorías secundarias...
✅ Se crearon 4 categorías.
🔊 Insertando equipos principales...
✅ Se crearon 7 equipos con sus referencias asociadas.
🎉 Proceso de seed completado exitosamente.
🍃 Disconnected from MongoDB
```

---

## 🌐 5. Endpoints de la API REST

### Entidad Secundaria: `/api/v1/categories`

| Método | Ruta | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Obtener todas las categorías (con `.lean()`) | `200 OK` |
| `GET` | `/api/v1/categories/:id` | Obtener categoría por ObjectId | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `POST` | `/api/v1/categories` | Crear categoría (validación Zod) | `201 Created` / `400` / `409` |
| `PUT` | `/api/v1/categories/:id` | Actualizar categoría parcial/total | `200 OK` / `400` / `404` / `409` |
| `DELETE` | `/api/v1/categories/:id` | Eliminar categoría por ObjectId | `204 No Content` / `404` / `400` |

### Entidad Principal: `/api/v1/equipment` (Alias compatibilidad: `/api/v1/items`)

| Método | Ruta | Descripción | Estado HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/equipment?page=1&limit=10` | Obtener equipos paginados con `.lean()` y `.populate('category')` | `200 OK` |
| `GET` | `/api/v1/equipment/:id` | Obtener equipo por ObjectId con `.populate('category')` | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `POST` | `/api/v1/equipment` | Crear equipo (valida Regex ObjectId 24-hex de categoría) | `201 Created` / `400` / `409` |
| `PUT` | `/api/v1/equipment/:id` | Actualizar equipo | `200 OK` / `400` / `404` / `409` |
| `DELETE` | `/api/v1/equipment/:id` | Eliminar equipo por ObjectId | `204 No Content` / `404` / `400` |

---

## 💥 6. Manejo de Errores Nativos de MongoDB y Mongoose

| Error Nativo | Causa | Mapeo HTTP | Respuesta JSON |
| :--- | :--- | :--- | :--- |
| **`mongoose.Error.CastError`** | Formato de ObjectId inválido (ej. `"abc123"`). | `400 Bad Request` | `{ "error": "Application Error", "message": "ID inválido" }` |
| **`MongoServerError (11000)`** | Violación de índice único (`unique: true`), ej. `serialNumber` o `name` duplicado. | `409 Conflict` | `{ "error": "Application Error", "message": "Ya existe un registro con ese valor" }` |
| **`null` en lectura/escritura** | Documento no encontrado al consultar por ObjectId válido. | `404 Not Found` | `{ "error": "Application Error", "message": "Equipo no encontrado" }` |

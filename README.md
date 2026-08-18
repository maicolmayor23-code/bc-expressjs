# Proyecto Semana 03 — API REST DJ / Sonido y Luces 🎧🔊

API REST construida con **Express 5** y **TypeScript** aplicando **Arquitectura en 4 Capas** (`routes` → `controllers` → `services` → `repositories`) y contratos de respuesta tipados con paginación.

---

## 📋 Descripción del Dominio y Entidad Principal

* **Dominio:** Servicio de DJ, Sonido profesional e Iluminación para eventos.
* **Recurso Principal:** `equipment` (Equipos de sonido, luces, DJ y efectos).

### Esquema de la Entidad `Equipment`:

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Identificador único autoincremental | `1` |
| `name` | `string` | Nombre del equipo | `"Consola DJ Pioneer DDJ-FLX6"` |
| `category` | `string` | Categoría (`sound`, `lights`, `dj_gear`, `effects`) | `"dj_gear"` |
| `dailyRate` | `number` | Tarifa de alquiler por día | `45.0` |
| `isAvailable` | `boolean` | Estado de disponibilidad actual | `true` |
| `createdAt` | `string` | Fecha de creación en formato ISO | `"2026-01-10T10:00:00.000Z"` |

---

## 🏗️ Arquitectura en 4 Capas

```text
src/
├── app.ts                         # Configuración de Express y Middlewares
├── server.ts                      # Entry point de la aplicación (listen y graceful shutdown)
├── types.ts                       # Entidad, DTOs y Contratos de Respuesta
├── routes/
│   ├── equipment.routes.ts        # Mapeo URL + Verbo HTTP -> Controller
│   └── items.routes.ts            # Alias de compatibilidad con la rúbrica
├── controllers/
│   └── equipment.controller.ts   # Thin controller (Extraer req -> Service -> Responder res.json)
├── services/
│   └── equipment.service.ts      # Lógica de negocio pura (Paginación, sin Express)
└── repositories/
    └── equipment.repository.ts   # Acceso a datos asíncrono (async Promise<T> + copias defensivas)
```

---

## 📡 Contratos de Respuesta HTTP

### 1. Listado Paginado (`GET /api/v1/equipment?page=1&limit=2`)
**Status:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Consola DJ Pioneer DDJ-FLX6",
      "category": "dj_gear",
      "dailyRate": 45,
      "isAvailable": true,
      "createdAt": "2026-01-10T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Bafle Amplificado JBL EON715 1300W",
      "category": "sound",
      "dailyRate": 35,
      "isAvailable": true,
      "createdAt": "2026-01-12T11:30:00.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 2
}
```

### 2. Recurso Individual (`GET /api/v1/equipment/1`)
**Status:** `200 OK`
```json
{
  "data": {
    "id": 1,
    "name": "Consola DJ Pioneer DDJ-FLX6",
    "category": "dj_gear",
    "dailyRate": 45,
    "isAvailable": true,
    "createdAt": "2026-01-10T10:00:00.000Z"
  }
}
```

### 3. Creación de Recurso (`POST /api/v1/equipment`)
**Status:** `201 Created`
```json
{
  "data": {
    "id": 5,
    "name": "Micrófono Inalámbrico Shure BLX24/SM58",
    "category": "sound",
    "dailyRate": 18.5,
    "isAvailable": true,
    "createdAt": "2026-08-18T16:39:00.000Z"
  }
}
```

### 4. Recurso No Encontrado (`GET /api/v1/equipment/999`)
**Status:** `404 Not Found`
```json
{
  "error": "Not Found",
  "message": "Equipment with ID 999 not found"
}
```

---

## 🚀 Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   pnpm dev
   ```

3. **Compilar para producción:**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 🧪 Pruebas con `curl`

### 1. Listar equipos con paginación
```bash
curl -X GET "http://localhost:3000/api/v1/equipment?page=1&limit=2"
```

### 2. Obtener equipo por ID
```bash
curl -X GET http://localhost:3000/api/v1/equipment/1
```

### 3. Crear nuevo equipo
```bash
curl -X POST http://localhost:3000/api/v1/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Micrófono Inalámbrico Shure BLX24/SM58",
    "category": "sound",
    "dailyRate": 18.5,
    "isAvailable": true
  }'
```

### 4. Actualizar equipo
```bash
curl -X PUT http://localhost:3000/api/v1/equipment/1 \
  -H "Content-Type: application/json" \
  -d '{
    "dailyRate": 50.0,
    "isAvailable": false
  }'
```

### 5. Eliminar equipo
```bash
curl -X DELETE http://localhost:3000/api/v1/equipment/1
```

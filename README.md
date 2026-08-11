# Proyecto Semana 02 — API REST DJ / Sonido y Luces 🎧🔊

API REST construida con **Express 5** y **TypeScript** para la gestión del inventario y alquiler de equipos en un dominio de **DJ, Sonido e Iluminación**.

---

## 📋 Descripción del Dominio y Entidad Principal

* **Dominio:** Servicio de DJ, Sonido profesional e Iluminación para eventos.
* **Recurso Principal:** `equipment` (Equipos de sonido, luces, DJ y efectos).
* **Entidades Relacionadas en el Dominio:** `equipment`, `events`, `clients`, `bookings`.

### Esquema de la Entidad `Equipment`:

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Identificador único autoincremental | `1` |
| `name` | `string` | Nombre del equipo | `"Consola DJ Pioneer DDJ-FLX6"` |
| `category` | `string` | Categoría (`sound`, `lights`, `dj_gear`, `effects`) | `"dj_gear"` |
| `dailyRate` | `number` | Tarifa de alquiler por día | `45.0` |
| `isAvailable` | `boolean` | Estado de disponibilidad actual | `true` |

---

## 🚀 Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   pnpm install
   # o bien
   npm install
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

## 📡 Endpoints de la API REST

| Método | Ruta | Descripción | Status Code Esperado |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Estado del servidor | `200 OK` |
| **GET** | `/api/v1/equipment` | Listar todos los equipos | `200 OK` |
| **GET** | `/api/v1/equipment/:id` | Obtener un equipo por ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/v1/equipment` | Crear un nuevo equipo | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/v1/equipment/:id` | Actualizar un equipo completo | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/v1/equipment/:id` | Eliminar un equipo por ID | `204 No Content` / `404 Not Found` |

---

## 🧪 Pruebas con `curl`

### 1. Listar todos los equipos
```bash
curl -X GET http://localhost:3000/api/v1/equipment
```

### 2. Obtener equipo por ID
```bash
curl -X GET http://localhost:3000/api/v1/equipment/1
```

### 3. Crear un nuevo equipo
```bash
curl -X POST http://localhost:3000/api/v1/equipment \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Microfono Inalambrico Shure BLX24/SM58",
    "category": "sound",
    "dailyRate": 18.5,
    "isAvailable": true
  }'
```

### 4. Actualizar un equipo
```bash
curl -X PUT http://localhost:3000/api/v1/equipment/1 \
  -H "Content-Type: application/json" \
  -d '{
    "dailyRate": 50.0,
    "isAvailable": false
  }'
```

### 5. Eliminar un equipo
```bash
curl -X DELETE http://localhost:3000/api/v1/equipment/1
```

---

## 🛠️ Decisiones de Diseño y Arquitectura

1. **Separación de Responsabilidades:**
   - `src/app.ts`: Configura el servidor de Express, registra el pipeline de middlewares y monta las rutas.
   - `src/server.ts`: Punto de entrada que lee variables de entorno y maneja el *Graceful Shutdown* (`SIGTERM`/`SIGINT`).
2. **Store en Memoria:** Encapsula la lógica CRUD dentro de `src/store.ts` utilizando TypeScript de forma estricta.
3. **Pipeline de Middlewares:** 
   - `express.json()` -> Logger personalizado (`[ISO_DATE] METHOD URL STATUS - TIMEms`) -> Rutas REST -> 404 Handler -> Global Error Handler.

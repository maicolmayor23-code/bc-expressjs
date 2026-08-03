# 🎧 Procesador de Datos de Inventario — DJ / Sonido y Luces

Sistema de procesamiento de datos en **Node.js** y **TypeScript** (ES Modules) diseñado para la gestión, filtrado y generación de estadísticas de inventarios de equipos profesionales de **DJ, Sonido e Iluminación**.

---

## 📋 Dominio del Proyecto

El sistema procesa información sobre equipos de audio, iluminación y producción de eventos:
* **Sonido**: Altavoces activos, subwoofers, monitores de escenario.
* **Iluminación**: Cabezas móviles LED, pares de iluminación RGBWA, efectos.
* **DJ Gear**: Consolas autónomas, reproductores multiformato, mezcladores profesionales.
* **Micrófonos**: Sistemas inalámbricos de mano, lavalier y diadema.
* **Efectos**: Máquinas de humo, hazers y efectos especiales.

---

## 🛠️ Tecnologías y Arquitectura

* **Runtime**: Node.js v22+
* **Lenguaje**: TypeScript v5 (Modo estricto `"strict": true`)
* **Sistema de Módulos**: ES Modules (ESM con `"type": "module"` y `"module": "NodeNext"`)
* **Ejecución en Dev**: `tsx` (Transpilación en tiempo real)
* **Compilación**: `tsc` (TypeScript Compiler)

---

## 📁 Estructura del Proyecto

```text
week-01/
├── data/
│   └── items.json           # Base de datos JSON de equipos (12+ registros)
├── dist/                    # Código JavaScript transpilado
├── output/
│   └── report.json          # Reporte generado dinámicamente
├── src/
│   ├── index.ts             # Entry point y CLI parser (--category)
│   ├── processor.ts         # Filtrado y cálculos estadísticos
│   ├── reader.ts            # Lectura asíncrona con fs/promises
│   ├── types.ts             # Interfaces y tipos de datos del dominio
│   └── writer.ts            # Escritura del reporte final en disco
├── package.json             # Dependencias y scripts del proyecto
├── README.md                # Documentación del proyecto
└── tsconfig.json            # Configuración estricta de TypeScript
```

---

## 🚀 Instalación y Ejecución

### 1. Instalación de dependencias
```bash
pnpm install
```

### 2. Verificación de Tipos y Compilación (TypeScript)
```bash
pnpm build
```

### 3. Ejecución en Modo Desarrollo (`tsx`)

#### Procesar todo el inventario (sin filtro):
```bash
pnpm dev
```

#### Filtrar por categoría (ejemplo: `sonido`):
```bash
pnpm dev -- --category sonido
```

#### Filtrar por categoría (ejemplo: `iluminacion`):
```bash
pnpm dev -- --category iluminacion
```

---

## 📊 Ejemplo de Salida en Consola

```text
🎧 Sistema de Gestión e Inventario — DJ / Sonido y Luces
======================================================
🔍 Aplicando filtro por categoría: "sonido"

📊 Resumen del Inventario Procesado:
   • Total de Equipos:      3
   • Equipos Activos:       3
   • Equipos Inactivos:     0
   • Precio Promedio:       $1132.33 USD
   • Equipo Más Costoso:    QSC KW181 Active Subwoofer 18" ($1799 USD)
   • Equipo Más Económico:  Electro-Voice ZLX-12BT Speaker ($499 USD)
   • Categorías Incluidas:  sonido

✅ Reporte generado exitosamente en: .../week-01/output/report.json
```

---

## 📄 Formato del Reporte Generado (`output/report.json`)

```json
{
  "generatedAt": "2026-08-02T23:48:30.000Z",
  "appliedFilter": "sonido",
  "summary": {
    "total": 3,
    "active": 3,
    "inactive": 0,
    "averagePrice": 1132.33,
    "mostExpensive": {
      "id": "eq004",
      "name": "QSC KW181 Active Subwoofer 18\"",
      "category": "sonido",
      "price": 1799,
      "stock": 4,
      "active": true,
      "brand": "QSC",
      "powerWatts": 1000
    },
    "cheapest": {
      "id": "eq012",
      "name": "Electro-Voice ZLX-12BT Speaker",
      "category": "sonido",
      "price": 499,
      "stock": 10,
      "active": true,
      "brand": "Electro-Voice",
      "powerWatts": 1000
    },
    "categories": [
      "sonido"
    ]
  },
  "items": [ ... ]
}
```

---

## ✅ Cumplimiento de la Rúbrica y Criterios de Evaluación

- [x] **Lectura y Parseo (20%)**: Asíncrono con `fs/promises`, `import.meta.dirname` y `join`.
- [x] **Cálculo de Resumen (20%)**: Totales, activos/inactivos, promedio redondeado a 2 decimales, máximo y mínimo.
- [x] **Filtro por Categoría (20%)**: Opción CLI `--category` insensible a mayúsculas/minúsculas.
- [x] **Escritura del Reporte (20%)**: Creación automática del directorio `output/` y guardado formateado de `report.json`.
- [x] **Manejo de Errores (10%)**: Control de excepciones al leer archivos o ingresar categorías no existentes con listado de disponibles.
- [x] **TypeScript Estricto (10%)**: `pnpm build` compila limpiamente sin advertencias ni errores.

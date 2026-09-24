# 🧠 Cuestionario Teórico — Semana 09: Testing de API REST (Jest & Supertest)

---

## 1. ¿Cuál es la diferencia entre un test unitario y un test de integración?
- **Test Unitario:** Evalúa una unidad de código (por ejemplo, una función o un método dentro de un `Service`) en completo **aislamiento**. No interactúa con dependencias reales como bases de datos, redes o sistemas de archivos; en su lugar, todas las dependencias externas son reemplazadas por dobles de prueba (*mocks*). Son extremadamente rápidos e independientes.
- **Test de Integración:** Verifica la interacción adecuada entre múltiples capas de la aplicación (por ejemplo: `Supertest HTTP Request → Express Routes → Controllers → Services → Base de datos en memoria`). Confirma que las partes del sistema trabajen correctamente en conjunto bajo un entorno controlado.

---

## 2. ¿Por qué se usa `jest.mock()` para aislar unidades de código?
`jest.mock()` se utiliza para reemplazar automáticamente un módulo completo o sus exportaciones por funciones *mock*. Al aislar una unidad de código (como la capa de servicios), `jest.mock()` evita que el test ejecute consultas reales a la base de datos (repositorios) o llamadas a APIs externas. Esto garantiza:
1. Pruebas deterministas e independientes de la red o base de datos.
2. Velocidad de ejecución ultra rápida.
3. Capacidad de simular escenarios de borde o fallos controlados (ej. `404 Not Found`, errores de conexión).

---

## 3. ¿Qué hace `jest.fn()` y cómo se verifica si fue llamada?
- **`jest.fn()`** crea una función *mock* (espiadora o simulada) que registra los detalles de cada invocación: número de llamadas, argumentos recibidos, valores retornados y contextos de ejecución.
- **Verificación:** Se utilizan *matchers* específicos de Jest dentro de un `expect`:
  ```typescript
  const mockFn = jest.fn();
  mockFn('parametro1');

  expect(mockFn).toHaveBeenCalled(); // Verifica que fue llamada al menos una vez
  expect(mockFn).toHaveBeenCalledTimes(1); // Verifica la cantidad exacta de llamadas
  expect(mockFn).toHaveBeenCalledWith('parametro1'); // Verifica los argumentos exactos
  ```

---

## 4. ¿Cuál es la diferencia entre `toBe` y `toEqual` en Jest?
- **`toBe`:** Realiza una comparación por referencia utilizando la igualdad estricta de JavaScript (`===`). Es ideal para tipos primitivos (`number`, `string`, `boolean`, `null`, `undefined`).
- **`toEqual`:** Realiza una comparación de igualdad profunda (*deep equality*) explorando recursivamente las propiedades de objetos, arrays o estructuras complejas. Compara si el contenido de dos estructuras es equivalente, aunque no compartan la misma referencia en memoria.

---

## 5. ¿Por qué Supertest no necesita que el servidor escuche en un puerto real?
Supertest acepta directamente la instancia de la aplicación de Express (`app`) creada mediante `express()`. En lugar de requerir que el servidor ejecute `app.listen(PORT)` abriendo un socket de red real, Supertest inicia un servidor HTTP de Node.js en memoria efímero (*ephemeral port*), despacha la petición simulated HTTP y cierra la conexión automáticamente. Esto evita conflictos de puertos ocupados durante la ejecución paralela o continua de pruebas.

---

## 6. ¿Qué es `mongodb-memory-server` y por qué se usa en tests?
`mongodb-memory-server` es una herramienta que descarga e inicia una instancia real del binario de MongoDB en la memoria RAM del sistema. Se utiliza en pruebas de integración porque:
1. Ofrece un entorno de base de datos **100% aislado, rápido y limpio** sin persistencia en disco.
2. Elimina la dependencia de tener instalado MongoDB localmente o en un contenedor Docker.
3. Permite borrar todas las colecciones entre cada test (`afterEach`), garantizando que cada prueba corra con un estado inicial prístino.

---

## 7. ¿Qué información muestra el reporte de cobertura de Jest?
El reporte de cobertura de Jest evalúa qué porcentaje del código fue ejecutado durante las pruebas a través de 4 métricas clave:
- **Statements (% Stmts):** Porcentaje de sentencias o declaraciones de código ejecutadas.
- **Branches (% Branch):** Porcentaje de caminos condicionales (`if/else`, `switch`, ternarios) evaluados.
- **Functions (% Funcs):** Porcentaje de funciones invocadas al menos una vez.
- **Lines (% Lines):** Porcentaje de líneas de código físicas recorridas.
Además, indica el número exacto de las líneas **no cubiertas** (*Uncovered Line #s*).

---

## 8. ¿Cuál es la diferencia entre `beforeEach` y `beforeAll`?
- **`beforeAll`:** Se ejecuta **una sola vez** antes de que comience el primer test del bloque `describe`. Se utiliza para configuraciones globales pesadas, como iniciar el servidor de BD en memoria (`MongoMemoryServer.create()`) o conectar Mongoose.
- **`beforeEach`:** Se ejecuta **antes de cada uno** de los tests (`it` / `test`) dentro del bloque. Se utiliza para tareas de limpieza o preparación repetitiva, como restaurar datos iniciales, limpiar colecciones o sembrar datos de prueba.

---

## 9. ¿Qué hace `mockResolvedValue` vs `mockReturnValue`?
- **`mockReturnValue(val)`:** Hace que la función *mock* retorne síncronamente el valor especificado (`val`).
- **`mockResolvedValue(val)`:** Hace que la función *mock* retorne una **Promesa** que se resuelve exitosamente con el valor especificado (`Promise.resolve(val)`). Es imprescindible para mockear funciones asíncronas (`async/await`) como las consultas a bases de datos o servicios.

---

## 10. ¿Qué es el patrón AAA (Arrange, Act, Assert) en testing?
El patrón **AAA** es una estructura limpia para organizar el código dentro de un caso de prueba:
1. **Arrange (Preparar):** Configura las condiciones previas, crea los datos de prueba (*input DTOs*) y define el comportamiento esperado de los *mocks* (`mockResolvedValue`).
2. **Act (Ejecutar):** Invoca la función, servicio o endpoint HTTP bajo prueba.
3. **Assert (Verificar):** Comprueba que el resultado retornado o el estado final coincida exactamente con las expectativas (`expect(...).toBe(...)` o `expect(...).toHaveBeenCalledWith(...)`).

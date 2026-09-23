# 🧠 Cuestionario Teórico — Semana 08: Autorización y Seguridad

---

## 1. ¿Cuál es la diferencia entre autenticación y autorización? Da un ejemplo con Express.
- **Autenticación (Authentication — AuthN):** Responde a la pregunta **"¿Quién eres?"**. Es el proceso mediante el cual el sistema verifica la identidad de un usuario (por ejemplo, validando su email y contraseña contra la base de datos o comprobando la validez de su token JWT). Si falla, retorna `401 Unauthorized`.
- **Autorización (Authorization — AuthZ):** Responde a la pregunta **"¿Qué tienes permitido hacer?"**. Ocurre *después* de la autenticación y determina si el usuario identificado tiene los permisos necesarios para acceder a un recurso específico o ejecutar una acción (por ejemplo, verificar si el usuario es `admin`). Si falla, retorna `403 Forbidden`.
- **Ejemplo en Express.js:**
  ```typescript
  // authMiddleware autentica (quién eres); requireRole('admin') autoriza (qué puedes hacer)
  router.delete(
    '/api/v1/equipment/:id',
    authMiddleware,         // 1. Verifica token JWT y adjunta req.user (AuthN)
    requireRole('admin'),   // 2. Verifica que req.user.role === 'admin' (AuthZ)
    equipmentController.remove
  );
  ```

---

## 2. ¿Cómo funciona RBAC? Define roles, recursos y permisos en el contexto de una API REST.
- **RBAC (Role-Based Access Control):** Es un modelo de seguridad donde los permisos no se asignan directamente a cada usuario individual, sino a **roles** abstractos. Los usuarios reciben un rol y heredan sus permisos asociados.
- **Roles:** Categorías o conjuntos de responsabilidades asignadas a los usuarios (ej. `'user'`, `'editor'`, `'admin'`).
- **Recursos:** Las entidades y endpoints protegidos expuestos por la API REST (ej. `/api/v1/equipment`, `/api/v1/users`).
- **Permisos:** Acciones permitidas sobre un recurso representadas por verbos HTTP (ej. `READ` (GET), `CREATE` (POST), `UPDATE` (PUT/PATCH), `DELETE`).
- **Ejemplo en API REST DJ / Sonido y Luces:**
  - Rol `user`: Puede consultar equipos (`GET`) y crear sus propios equipos (`POST`).
  - Rol `admin`: Posee permisos absolutos de lectura, creación, actualización y eliminación (`DELETE`) sobre cualquier equipo del sistema.

---

## 3. ¿Qué hace `helmet()` al aplicarlo en Express? Menciona 3 cabeceras que configura.
- **Función:** `helmet()` es una colección de middlewares que ayuda a asegurar una aplicación Express configurando diversas **cabeceras HTTP de respuesta**. Protege contra vectores comunes de ataque en navegadores mediante el ajuste seguro de políticas de seguridad.
- **Tres cabeceras clave que configura:**
  1. `X-Content-Type-Options: nosniff`: Evita que los navegadores intenten adivinar (MIME sniffing) el tipo de contenido del archivo, forzándolos a seguir el `Content-Type` declarado por el servidor.
  2. `X-Frame-Options: SAMEORIGIN` (o `DENY`): Previene ataques de **Clickjacking** impidiendo que la API o sitio web sea incrustado dentro de marcos `<iframe>` en sitios de terceros.
  3. `Strict-Transport-Security` (HSTS): Le ordena al navegador que recuerde comunicarse exclusivamente mediante HTTPS durante un período determinado (ej. 1 año).

---

## 4. ¿Qué es Content-Security-Policy (CSP) y para qué sirve en una API?
- **Definición:** `Content-Security-Policy` (CSP) es una cabecera de seguridad HTTP que especifica al navegador qué fuentes u orígenes de contenido (scripts, hojas de estilo, imágenes, conexiones WebSocket, etc.) tienen permitido cargarse y ejecutarse en la página.
- **Utilidad en una API REST:**
  - En una API REST pura (que sirve JSON y no renderiza plantillas HTML), una política CSP estricta (ej. `default-src 'none'`) sirve como una potente capa de defensa en profundidad contra inyecciones XSS en caso de que alguna ruta por error sirva contenido interpretable por el navegador.
  - Impide que scripts maliciosos inyectados ejecuten peticiones HTTP externas (exfiltración de datos via `fetch`/`XHR`) desde el cliente.

---

## 5. ¿Qué es HSTS y cuándo se activa? ¿Por qué no se aplica en HTTP?
- **HSTS (HTTP Strict Transport Security):** Es un mecanismo donde el servidor informa al navegador (a través de la cabecera `Strict-Transport-Security`) que todas las comunicaciones futuras deben realizarse **exclusivamente sobre HTTPS**, convirtiendo automáticamente cualquier intento de conexión `http://` a `https://`.
- **Cuándo se activa:** Se activa únicamente cuando la petición inicial se realiza a través de un canal seguro HTTPS verificado.
- **Por qué NO se aplica en HTTP puro:** Si un navegador aceptara la cabecera HSTS recibida a través de una conexión no cifrada HTTP, un atacante Man-In-The-Middle (MITM) podría inyectar o falsificar dicha cabecera para bloquear el acceso legítimo al sitio (ataques Man-In-The-Middle y Stripping SSL). Por especificación del estándar RFC 6797, los navegadores ignoran la cabecera HSTS si se recibe sobre HTTP no seguro.

---

## 6. ¿Cómo funciona `express-rate-limit`? ¿Qué diferencia hay entre un rate limit global y uno por ruta?
- **Funcionamiento:** `express-rate-limit` registra el número de peticiones recibidas por cada IP cliente durante una ventana de tiempo definida (`windowMs`). Si una IP excede el límite configurado (`limit`), el middleware intercepta la petición, bloquea la ejecución del controlador y responde automáticamente con un código HTTP **`429 Too Many Requests`** junto con cabeceras explicativas (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).
- **Diferencia entre Global y Por Ruta:**
  - **Rate Limit Global:** Se aplica a todas las rutas de la aplicación (`app.use(globalLimiter)`). Utiliza umbrales permisivos (ej. 100 req / 15 min) para prevenir abusos generales, scrapers masivos o DoS involuntario.
  - **Rate Limit Por Ruta (Diferenciado):** Se aplica específicamente en endpoints de alto riesgo o costosos (ej. `/api/v1/auth/login`, `/api/v1/auth/register`). Utiliza un umbral estricto (ej. 5 req / 15 min) diseñado para frenar ataques de **fuerza bruta** y credential stuffing.

---

## 7. ¿Qué es un origin en CORS y por qué `Access-Control-Allow-Origin: *` es peligroso en producción?
- **Origin en CORS:** Un origen se define por la combinación exacta de **Protocolo + Dominio + Puerto** (ej. `http://localhost:3000` vs `https://miapp.com`).
- **Peligro de `Access-Control-Allow-Origin: *` en Producción:**
  1. **Exposición Universal:** Otorga permiso a cualquier sitio web del mundo para ejecutar scripts en el navegador del usuario y leer las respuestas de tu API.
  2. **Incompatibilidad con Cookies / Credenciales:** El estándar de navegadores **prohíbe estrictamente** el uso de `credentials: true` (cookies HttpOnly, encabezados Authorization) si la respuesta contiene `*`. Si se desactiva el chequeo, cualquier sitio malicioso podría realizar peticiones autenticadas en nombre de la víctima.

---

## 8. ¿Qué es NoSQL injection? ¿Cómo puede un atacante explotar `{ "$gt": "" }` en un login?
- **NoSQL Injection:** Es una vulnerabilidad que ocurre cuando entradas no sanitizadas del usuario se pasan directamente a los motores de consulta NoSQL (como MongoDB/Mongoose), permitiendo al atacante modificar la estructura y lógica de la consulta mediante operadores del motor.
- **Explotación de `{ "$gt": "" }` en Login:**
  - Supongamos una consulta vulnerable en la API: `UserModel.findOne({ email: req.body.email, password: req.body.password })`.
  - Si el atacante envía un JSON con operadores MongoDB:
    ```json
    {
      "email": { "$gt": "" },
      "password": { "$gt": "" }
    }
    ```
  - La consulta ejecutada se transforma en `findOne({ email: { $gt: "" }, password: { $gt: "" } })`, la cual evalúa si el email y password son mayores a una cadena vacía (lo cual es verdadero para cualquier registro).
  - La base de datos devuelve el **primer usuario de la colección** (usualmente el administrador), permitiendo al atacante autenticarse sin conocer credenciales reales.
- **Mitigación:** Aplicación del middleware `express-mongo-sanitize`, que elimina o reemplaza cualquier carácter `$` o `.` de `req.body`, `req.query` y `req.params`.

---

## 9. ¿Qué es XSS (Cross-Site Scripting)? ¿Cómo afecta a una API REST vs una aplicación web?
- **XSS (Cross-Site Scripting):** Es una vulnerabilidad en la cual un atacante inyecta scripts maliciosos de JavaScript en los datos almacenados o transmitidos por una aplicación, los cuales son posteriormente ejecutados en el navegador de otros usuarios.
- **Impacto en Aplicación Web Monolítica / Frontend:**
  - Es crítico e inmediato si el frontend renderiza cadenas de texto no escapadas directamente como HTML (`innerHTML` o `v-html`), permitiendo al script inyectado robar tokens guardados en `localStorage` o secuestrar sesiones.
- **Impacto en API REST pura (JSON):**
  - La API REST por sí misma no ejecuta JavaScript ni renderiza HTML (devuelve JSON plano con `Content-Type: application/json`). Sin embargo, actúa como el **vector de almacenamiento (Stored XSS)** si no valida ni sanitiza los campos de texto enviados por usuarios maliciosos.
  - Si la API entrega estos textos con HTML malicioso a un cliente (web/móvil) y este último los renderiza sin sanitizar, el ataque se concreta en el cliente.

---

## 10. Menciona 3 vulnerabilidades del OWASP Top 10 y cómo se mitigan con las herramientas vistas en esta semana.

| # | Vulnerabilidad OWASP | Descripción | Mitigación en esta semana |
|---|----------------------|-------------|---------------------------|
| **A01** | **Broken Access Control** | Los usuarios pueden acceder a recursos o ejecutar acciones fuera de sus permisos previstos. | **RBAC + `requireRole('admin')`**: Control riguroso de autorización mediante middlewares en Express. Si un usuario no posee el rol adecuado, se detiene el flujo y se responde `403 Forbidden`. |
| **A03** | **Injection (NoSQL Injection)** | Inyección de sintaxis de comandos u operadores en las consultas a la base de datos. | **`express-mongo-sanitize` + Zod**: Limpieza automática de operadores `$` y `.` en todo el payload del request, complementado con validación de tipos e inputs estrictos con schemas de Zod. |
| **A05** | **Security Misconfiguration** | Cabeceras de seguridad faltantes, configuraciones por defecto inseguras o exposición de stack traces. | **Helmet.js + CORS Whitelist + Centralized Errors**: Configuración de cabeceras de protección (`nosniff`, `SAMEORIGIN`), restricción estricta de orígenes autorizados y supresión de stack traces en producción mediante `errorHandler`. |

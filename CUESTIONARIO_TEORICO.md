# 🧠 Cuestionario Teórico — Semana 07: Autenticación con JWT

## 1. ¿Por qué NO se deben almacenar contraseñas en texto plano y por qué MD5/SHA-256 no son seguros para este caso?
- **Texto plano:** Si la base de datos es vulnerada o filtrada, las contraseñas de todos los usuarios quedan expuestas inmediatamente. Debido a la reutilización común de contraseñas, los atacantes pueden acceder a cuentas de los usuarios en otros servicios.
- **MD5 / SHA-256:** Son algoritmos de hashing genéricos diseñados para ser extremamente **rápidos**. Un atacante utilizando hardware moderno (GPUs o ASICs) puede calcular miles de millones de hashes por segundo, permitiendo ataques de fuerza bruta y ataques por diccionario en cuestión de minutos. Además, carecen de mecanismo de ralentización deliberada (cost factor).

---

## 2. ¿Qué es el "salt" en bcrypt y cómo previene los ataques de rainbow table?
- **Salt:** Es una cadena de caracteres aleatorios generada de forma única para cada contraseña antes de aplicar el proceso de hash.
- **Prevención de Rainbow Tables:** Una *rainbow table* es una tabla precalculada de hashes para millones de contraseñas comunes. Sin salt, dos usuarios con la misma contraseña tendrían exactamente el mismo hash. El salt único garantiza que incluso si dos usuarios tienen la misma clave (ej. `"Password123!"`), sus hashes finales resultantes serán completamente distintos, haciendo inútiles las tablas precalculadas y obligando al atacante a calcular el hash de cada usuario de forma individual.

---

## 3. Explica las tres partes de un JWT (header, payload, signature). ¿Por qué la información del payload es legible pero no modificable?
- **Header:** Contiene metadatos del token, principalmente el algoritmo de firma (ej. `HS256`) y el tipo de token (`JWT`).
- **Payload:** Contiene las aseveraciones (*claims*) sobre la entidad (ID de usuario `sub`, `email`, `role`, fechas de emisión `iat` y expiración `exp`).
- **Signature:** Se calcula tomando el `Header` y el `Payload` codificados en Base64URL, concatenándolos con un punto y aplicando una función criptográfica de hash con la clave secreta del servidor.
- **Legible pero no modificable:** Es **legible** porque Header y Payload solo están codificados en Base64URL (no cifrados). Sin embargo, es **no modificable (íntegro)** porque cualquier alteración en el Payload cambiará el resultado matemático de la firma. Si un atacante modifica un claim (ej. cambia su rol de `"user"` a `"admin"`), la firma adjunta ya no coincidirá con la recalculada por el servidor, rechazando el token.

---

## 4. ¿Cuál es la diferencia entre un access token y un refresh token? ¿Por qué tienen duraciones distintas?
- **Access Token:** Se utiliza para autorizar llamadas inmediatas a endpoints protegidos de la API. Tiene una duración **corta (≤ 15 minutos)** para minimizar la ventana de oportunidad en caso de intercepción o robo.
- **Refresh Token:** Se utiliza exclusivamente para solicitar nuevos Access Tokens cuando el actual ha expirado. Tiene una duración **larga (7 a 30 días)**.
- **Razones de la diferencia de duración:** La brevedad del Access Token mitiga riesgos de seguridad sin requerir consultas constantes a la base de datos (stateless). La longevidad del Refresh Token permite al usuario mantener la sesión abierta sin reintroducir sus credenciales constantemente, siendo verificado e invalidado de forma controlada en el servidor (stateful).

---

## 5. ¿Por qué almacenar el JWT en una cookie HttpOnly es más seguro que almacenarlo en localStorage?
- **LocalStorage:** Es accesible mediante JavaScript del lado del cliente (`localStorage.getItem()`). Si la aplicación sufre una vulnerabilidad de **Cross-Site Scripting (XSS)**, un script malicioso inyectado puede extraer el token y enviarlo a un servidor atacante.
- **Cookie HttpOnly:** La propiedad `HttpOnly` le prohíbe explícitamente al motor de JavaScript acceder a la cookie. Ante un ataque XSS, el script atacante no puede leer ni robar el token. Además, combinada con las propiedades `Secure` (exclusivo HTTPS) y `SameSite=Lax/Strict`, ofrece protección adicional contra ataques **CSRF**.

---

## 6. ¿Qué es la "rotación de refresh tokens"? ¿Qué problema de seguridad resuelve?
- **Definición:** Es la técnica de seguridad donde cada vez que un cliente utiliza su Refresh Token en el endpoint `/refresh`, el servidor emite un nuevo Access Token **y un nuevo Refresh Token**, invalidando inmediatamente el Refresh Token anterior.
- **Problema que resuelve:** Resuelve el riesgo de la **sustracción/reutilización ilegítima de tokens de refresco**. Si un atacante intercepta un Refresh Token y el cliente legítimo intenta renovar, la reutilización del token viejo activa las alertas del servidor, permitiendo invalidar toda la familia de tokens del usuario y forzar un nuevo inicio de sesión seguro.

---

## 7. En el middleware de autenticación, ¿qué respuesta debe retornar si el token es válido pero ya expiró?
- Debe retornar una respuesta HTTP con código **`401 Unauthorized`** y un cuerpo JSON indicando claramente que el token ha expirado (ej. `{ "message": "Token expirado" }`). Esto le indica al cliente HTTP/frontend que no intente reintentar la llamada directamente, sino que debe ejecutar el flujo de refresco de tokens (`/api/v1/auth/refresh`).

---

## 8. ¿Por qué el endpoint de login debe devolver el mismo mensaje de error para "email no encontrado" y "contraseña incorrecta"?
- Para prevenir **Ataques de Enumeración de Usuarios (User Enumeration)**. Si la API retornara *"El usuario no existe"* o *"Contraseña incorrecta"*, un atacante podría probar listas masivas de emails para descubrir qué personas tienen cuenta registrada en la plataforma. Devolver un mensaje neutro y unificado como `"Credenciales inválidas"` impide descubrir la existencia de cuentas registradas.

---

## 9. ¿Qué hace `{ select: false }` en un campo de Mongoose y para qué se usa en el campo password?
- **Efecto:** Le indica a Mongoose que excluya explícitamente dicho campo de los resultados de las consultas `find()`, `findOne()`, `findById()`, etc., a menos que se incluya intencionalmente con `.select('+password')`.
- **Uso en password:** Garantiza que las contraseñas (incluso en su formato hasheado) nunca sean expuestas involuntariamente en las respuestas de la API REST cuando se leen documentos de usuarios.

---

## 10. ¿Cuántos secretos JWT distintos se usan en el patrón access/refresh y por qué son dos, no uno?
- Se utilizan **dos secretos JWT distintos** (`JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`).
- **Razón:** La separación de secretos garantiza el principio de mínimo privilegio y aislamiento de daños. Si el secreto del Access Token es comprometido o expuesto, un atacante no podrá generar ni falsificar Refresh Tokens de larga duración. Asimismo, permite invalidar o rotar las claves del Access Token sin cancelar las sesiones de larga duración activas de los usuarios.

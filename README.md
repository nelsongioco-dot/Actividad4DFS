
# Actividad 4 - Desarrollo Full Stack

Proyecto de gestión de productos desarrollado con Node.js, Express, MongoDB Atlas y Jest.

## Funcionalidades

- Registro de usuarios e inicio de sesión.
- Autenticación mediante JWT.
- Crear, consultar, actualizar y eliminar productos.
- Pruebas automatizadas con Jest y Supertest.
- Integración continua con GitHub Actions.
- Despliegue automático en Render.

## Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Jest
- Supertest
- HTML, CSS y JavaScript
- GitHub Actions
- Render

## Requisitos para ejecutar el proyecto

- Tener Node.js instalado.
- Contar con acceso a MongoDB Atlas.
- Tener Git instalado para clonar el repositorio.

## Instalación y ejecución local

### 1. Descargar el proyecto

Abre una terminal y ejecuta:

```bash
git clone https://github.com/nelsongioco-dot/Actividad4DFS.git
cd Actividad4DFS
```

### 2. Instalar las dependencias

```bash
npm ci
```

### 3. Configurar las variables de entorno

Crea un archivo llamado `.env` en la carpeta principal del proyecto.

Agrega las siguientes variables utilizando tus propias credenciales:

```env
MONGO_URI=TU_URI_DE_MONGODB_ATLAS
JWT_SECRET=TU_CLAVE_SECRETA_SEGURA
```

No publiques el archivo `.env` ni compartas contraseñas o claves.

También debes autorizar la dirección IP correspondiente desde MongoDB Atlas.

### 4. Ejecutar las pruebas unitarias

```bash
npm test
```

El proyecto cuenta con 24 pruebas aprobadas mediante Jest.

### 5. Iniciar el servidor

```bash
node server.js
```

### 6. Abrir la aplicación

En el navegador, abre la dirección local indicada por el servidor.

Si utilizas el puerto 3000:

http://localhost:3000

## Pruebas automatizadas

El proyecto utiliza Jest y Supertest para comprobar el funcionamiento de los controladores y rutas.

Se realizaron pruebas para operaciones CRUD, validaciones y manejo de errores.

Resultado verificado:

- 24 pruebas aprobadas.
- 2 suites aprobadas.
- Ejecución correcta mediante GitHub Actions.

## Integración y despliegue continuo (CI/CD)

El proyecto utiliza GitHub Actions para ejecutar automáticamente las pruebas.

Archivo de configuración:

`.github/workflows/main.yml`

Proceso:

1. Se envían los cambios a GitHub.
2. GitHub Actions descarga el proyecto.
3. Se configura Node.js.
4. Se instalan las dependencias.
5. Se ejecutan las pruebas de Jest.
6. Render realiza el despliegue automático de la aplicación.

## Despliegue en Render

Configuración utilizada:

- Plataforma: Render.
- Entorno: Node.js.
- Rama: main.
- Build Command: `npm ci`.
- Start Command: `node server.js`.
- Base de datos: MongoDB Atlas.

Las credenciales se administran mediante variables de entorno privadas.

## Aplicación publicada

https://actividad4dfs.onrender.com

La aplicación permite registrar usuarios, iniciar sesión y administrar productos desde internet.

El plan gratuito de Render puede tardar en responder después de un periodo de inactividad.

## Repositorio del proyecto

https://github.com/nelsongioco-dot/Actividad4DFS

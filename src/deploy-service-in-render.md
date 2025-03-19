---
title: "Guía para Desplegar un Servicio Web en Render"
category: "Guía"
image: "deploy-service-in-render.jpg"
---
# Guía para Desplegar un Servicio Web en Render.com con Docker y Bun

Render.com es una plataforma en la nube que permite desplegar, alojar y escalar aplicaciones web, APIs y sitios estáticos de forma sencilla y automática. En este ejemplo, utilizaremos Bun como runtime para un servicio web, aunque puedes adaptar la guía a otros entornos o lenguajes.

## 1. Pre-requisitos

- **Proyecto funcional:** Asegúrate de que tu aplicación o API funciona correctamente en tu entorno local.
- **Docker instalado:** Necesitas Docker para construir y probar tu imagen localmente.
- **Cuenta en GitHub/GitLab/Bitbucket:** Para conectar tu repositorio con Render.
- **Cuenta en Render.com:** Regístrate en [Render](https://dashboard.render.com/register) si aún no lo has hecho.

## 2. Configuración del Proyecto

### a. Crear el Dockerfile

Crea un archivo llamado `Dockerfile` en la raíz de tu proyecto con el siguiente contenido. Este Dockerfile utiliza una imagen base de Alpine para mantener la imagen liviana, instala las dependencias necesarias y descarga Bun:

```dockerfile
# Usa la imagen base Alpine, que es muy liviana
FROM alpine:latest

# Instala las dependencias necesarias para descargar y extraer Bun
RUN apk update && \
    apk add --no-cache bash curl tar libstdc++

# Descarga Bun desde el script oficial y extrae el binario
RUN curl -fsSL https://bun.sh/install | bash

# Define la variable HOME para que $HOME esté disponible
ENV HOME=/root

# Asegura que el binario de Bun esté en el PATH
ENV BUN_INSTALL="$HOME/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# Establece el directorio de trabajo y copia el contenido de la aplicación
WORKDIR /app
COPY . .

# Instala las dependencias definidas en package.json (Bun usará bun.lock para mayor precisión)
RUN bun install

# Expone el puerto que utilizará la aplicación (por defecto Render usará la variable de entorno PORT, se expone 10000)
EXPOSE 10000

# Comando de inicio: se utiliza "index.ts" como punto de entrada
CMD ["bun", "run", "index.ts"]
```

### b. Crear el archivo .dockerignore

Crea un archivo llamado `.dockerignore` para excluir archivos y directorios que no necesitas en la imagen. Un ejemplo de configuración es:

```dockerignore
dist/
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.env
.env.production
.git/
```

### c. Ejemplo de Configuración del Puerto en Bun

Para asegurarte de que tu aplicación utilice el puerto correcto proporcionado por Render, puedes configurar Bun de la siguiente forma en tu archivo de entrada (por ejemplo, `index.ts`):

```ts
const server = Bun.serve({
  port: process.env.PORT || 3000
});
```

Con este ejemplo, la aplicación utilizará el puerto definido en la variable de entorno `PORT` (como lo requiere Render) o, en caso de no estar definida, se usará el puerto `3000` por defecto.

## 3. Construir y Probar la Imagen Localmente

Antes de desplegar en Render, es importante asegurarse de que la imagen Docker funcione correctamente en tu entorno local. Ejecuta los siguientes comandos:

1. **Construir la imagen:**

   ```sh
   sudo docker buildx build --load -t bun-hello-world .
   ```

2. **Ejecutar la imagen en modo contenedor:**

   ```sh
   sudo docker run -d -p 10000:10000 bun-hello-world
   ```

3. **Verificar el servicio:**

   Abre en tu navegador la URL [http://localhost:10000/](http://localhost:10000/) y asegúrate de que la aplicación responda correctamente.

## 4. Subir el Código al Repositorio

Una vez que la imagen funcione correctamente, realiza el commit y push de los cambios a tu repositorio:

```sh
git add .
git commit -m "Configurar Dockerfile y .dockerignore para Render"
git push origin main
```

## 5. Desplegar en Render.com

### a. Crear un Nuevo Web Service

1. **Inicia sesión en Render Dashboard:** Ingresa a [Render Dashboard](https://dashboard.render.com/).
2. **Nuevo Servicio Web:** Haz clic en **New > Web Service**.
3. **Elige el origen del código:** Selecciona “Build and deploy from a Git repository”. Si aún no has vinculado tu cuenta (GitHub, GitLab o Bitbucket), hazlo siguiendo las indicaciones.
4. **Selecciona el repositorio y la rama:** Elige el repositorio en el que subiste el código y la rama (por ejemplo, `main`).

### b. Configurar el Servicio

En el formulario de creación del servicio, completa los siguientes campos:

- **Name:** Un nombre identificativo para tu servicio. Este nombre se utilizará para generar el subdominio `onrender.com`.
- **Region:** Selecciona la región geográfica donde deseas desplegar tu servicio. Esto afecta la latencia y la comunicación entre servicios en la misma red privada.
- **Branch:** La rama de tu repositorio que se usará para construir el servicio.
- **Language & Build:** Como se utiliza Docker, Render utilizará el `Dockerfile` para construir la imagen. Asegúrate de que el comando de build y el de inicio (start) estén configurados correctamente.
- **Instance Type:** Selecciona el tipo de instancia (ten en cuenta las limitaciones de la opción gratuita, si aplica).

> **Nota:** Render espera que tu servicio web se vincule a la IP `0.0.0.0` y al puerto definido en la variable de entorno `PORT` (por defecto `10000`). Esto ya está contemplado en nuestro Dockerfile mediante la instrucción `EXPOSE 10000`. Si usas otro puerto, asegúrate de que Render pueda detectarlo o configúralo en el dashboard.

### c. Opciones Avanzadas

Render permite configurar variables de entorno, secretos, discos persistentes y rutas de health check. Estas configuraciones son útiles para personalizar el entorno de ejecución y para la escalabilidad o el monitoreo del servicio.

### d. Crear y Desplegar

Haz clic en **Create Web Service**. Render iniciará automáticamente el proceso de construcción y despliegue del servicio. Puedes monitorear el progreso y ver los logs en la sección **Events** del dashboard.

Si el despliegue falla, revisa los [solucionadores de problemas de Render](https://render.com/docs/troubleshooting-deploys) para identificar y corregir los errores.

## 6. Conectar y Probar tu Servicio

Una vez desplegado, Render asigna un subdominio único (por ejemplo, `tu-servicio.onrender.com`). Ingresa a esta URL para verificar que tu servicio web funcione correctamente. También puedes configurar [dominios personalizados](https://render.com/docs/custom-domains) si lo deseas.

---

## Resumen

Esta guía te ha mostrado cómo:

- Preparar y probar localmente tu aplicación usando Docker y Bun.
- Configurar correctamente el `Dockerfile` y el `.dockerignore`.
- Incluir un ejemplo de configuración del puerto en Bun para que se ajuste a la variable de entorno `PORT`.
- Realizar el commit y push a tu repositorio.
- Configurar y desplegar tu servicio web en Render.com conectando tu repositorio y utilizando las configuraciones adecuadas (puerto, variables de entorno, etc.).

Con estos pasos, tendrás tu servicio web corriendo en la nube y listo para escalar según tus necesidades.

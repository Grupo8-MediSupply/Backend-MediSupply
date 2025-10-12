# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

ARG APP_NAME
ENV APP_NAME=$APP_NAME

# 📦 Copiar solo archivos de dependencias primero (cache layer)

COPY package*.json ./

COPY nx.json ./

COPY tsconfig*.json ./



# 🚀 Instalar Nx globalmente y dependencias

RUN npm install -g nx@21.6.4

RUN npm ci --only=production=false



# 📁 Copiar código fuente después de instalar dependencias

COPY . .

# 🏗️ Construir la aplicación específica (Usa el nombre completo: @medi-supply/perfiles)
RUN nx build $APP_NAME --prod

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

# Declaramos APP_NAME de nuevo para la etapa de producción
ARG APP_NAME
ENV NODE_ENV=production

# --- 🎯 CORRECCIÓN CLAVE EN EL DOCKERFILE ---

# 1. Definir una variable de entorno temporal (usando shell) para la carpeta de salida
#    (ej. de "@medi-supply/perfiles" a "perfiles")
RUN APP_FOLDER_NAME=$(echo $APP_NAME | sed 's|^@.*/||') && \
    export APP_FOLDER_NAME=$APP_FOLDER_NAME && \
    echo "Using build folder: $APP_FOLDER_NAME"

# ... (resto de la configuración del usuario y npm ci)

# 📁 Copiar artefactos de build y scripts
# 2. Usar $APP_FOLDER_NAME para la ruta de origen
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/$APP_FOLDER_NAME ./dist
COPY --chown=nextjs:nodejs apps/$APP_FOLDER_NAME/docker-entrypoint.sh ./docker-entrypoint.sh

# 🔐 Establecer permisos y usuario

RUN chmod +x docker-entrypoint.sh

USER nextjs



# 🌐 Exponer puerto

EXPOSE 3000



# 🚀 Punto de entrada

ENTRYPOINT ["./docker-entrypoint.sh"]
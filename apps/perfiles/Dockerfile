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

ARG APP_NAME
ENV NODE_ENV=production

# ✅ Solución al error de ruta (persistencia de variable):
# 1. Definimos la variable de entorno persistente APP_FOLDER_NAME, eliminando el scope.
ENV APP_FOLDER_NAME=$(echo $APP_NAME | sed 's|^@.*/||')

# 👤 Crear usuario no-root por seguridad
# Corregir para incluir todo el comando
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 📦 Copiar solo las dependencias de producción
COPY package*.json ./
# Usar el comando correcto para producción
RUN npm ci --only=production && npm cache clean --force 

# 📁 Copiar artefactos de build y scripts
# Usamos la variable ENV que acabamos de definir
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/$APP_FOLDER_NAME ./dist
COPY --chown=nextjs:nodejs apps/$APP_FOLDER_NAME/docker-entrypoint.sh ./docker-entrypoint.sh

# 🔐 Establecer permisos y usuario
RUN chmod +x docker-entrypoint.sh
USER nextjs

# 🌐 Exponer puerto
EXPOSE 3000

# 🚀 Punto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
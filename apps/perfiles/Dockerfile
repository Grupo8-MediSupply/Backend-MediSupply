# ============================
# Etapa de construcción
# ============================
FROM node:22.18-alpine AS builder
WORKDIR /app

# 1️⃣ Recibir argumentos de build
ARG APP_NAME
ARG APP_FOLDER_NAME
ENV APP_NAME=$APP_NAME

# 📦 Copiar archivos de dependencias
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# 🚀 Instalar todas las dependencias (incluyendo devDeps para Nx)
RUN npm ci

# 📁 Copiar código fuente completo
COPY . .

# 🏗️ Construir la aplicación específica (usa el nombre completo de Nx)
RUN npx nx build $APP_NAME --prod

# ============================
# Etapa de producción
# ============================
FROM node:22.18-alpine AS production
WORKDIR /app

# 1️⃣ Recibir argumentos
ARG APP_NAME
ARG APP_FOLDER_NAME
ENV NODE_ENV=production

# 👤 Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 📦 Copiar solo las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 📁 Copiar artefactos de build y scripts desde builder
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/$APP_FOLDER_NAME ./dist
COPY --from=builder --chown=nextjs:nodejs apps/$APP_FOLDER_NAME/docker-entrypoint.sh ./docker-entrypoint.sh

# 🔐 Establecer permisos y usuario
RUN chmod +x docker-entrypoint.sh
USER nextjs

# 🌐 Exponer puerto
EXPOSE 3000

# 🚀 Punto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]

# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

# 1. Recibir el nombre COMPLETO de Nx (ej: @medi-supply/perfiles)
ARG APP_NAME 
ENV APP_NAME=$APP_NAME

# 📦 Copiar archivos de dependencias
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# 🚀 Instalar TODAS las dependencias (incluyendo devDeps para Nx)
RUN npm ci

# 📁 Copiar código fuente
COPY . .

# 🏗️ Construir la aplicación específica (Usa el nombre COMPLETO, requerido por Nx)
RUN npx nx build $APP_NAME --prod


# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

# Redefinir ARG para que el valor de Cloud Build persista en esta etapa
ARG APP_NAME 
ENV NODE_ENV=production

# 👤 Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 📦 Copiar solo las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 📁 Copiar artefactos de build y scripts
# ✅ SOLUCIÓN AL COPY FAILED: Usamos sustitución de shell:
# ${APP_NAME##*/} toma el valor de $APP_NAME y elimina el prefijo más largo 
# que termina en '/' (es decir, elimina el scope '@medi-supply/'). 
# El resultado es solo 'perfiles', que es la carpeta de salida en /dist/apps/.
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/${APP_NAME##*/} ./dist
COPY --chown=nextjs:nodejs apps/${APP_NAME##*/}/docker-entrypoint.sh ./docker-entrypoint.sh

# 🔐 Establecer permisos y usuario
RUN chmod +x docker-entrypoint.sh
USER nextjs

# 🌐 Exponer puerto
EXPOSE 3000

# 🚀 Punto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
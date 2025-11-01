# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

# Solo necesitas el nombre completo de Nx si quieres pasarlo como ARG
ARG APP_NAME=@medi-supply/inventario
ENV NODE_ENV=production

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY . .

# 👇 Sincronizamos Nx antes del build (esto corrige el error)
RUN npx nx sync
# Construir la app
RUN npx nx build $APP_NAME --prod

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build desde builder (hardcodeado)
COPY --from=builder --chown=nextjs:nodejs /app/apps/inventario/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/inventario/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh
USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

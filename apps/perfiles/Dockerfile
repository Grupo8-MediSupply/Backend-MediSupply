# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

# Copiamos dependencias del root del monorepo
COPY package*.json ./
RUN npm install

# Copiamos todo el monorepo
COPY . .

# Build de la app perfiles
RUN npx nx build perfiles

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

# Copiamos solo lo necesario
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/perfiles/dist ./dist

# Entrypoint
COPY apps/perfiles/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

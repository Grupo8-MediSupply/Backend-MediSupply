# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

# ARG para recibir el nombre de la app (normalizado)
ARG APP_NAME
ENV APP_NAME=$APP_NAME

# Copiamos dependencias del root del monorepo
COPY package*.json ./
RUN npm install

# Copiamos todo el monorepo
COPY . .

# Build de la app dinámica
RUN npx nx build $APP_NAME

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

# Copiamos solo lo necesario
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/$APP_NAME/dist ./dist

# Entrypoint dinámico (si cada app tiene su script, también se puede parametrizar)
COPY apps/$APP_NAME/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

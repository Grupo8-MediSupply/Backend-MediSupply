# Etapa de construcción
FROM node:22.18-alpine AS builder

# Instalamos bash y git (algunas operaciones Nx los requieren)
RUN apk add --no-cache bash git

# WORKDIR raíz del monorepo
WORKDIR /workspace

# ARG para recibir el nombre de la app
ARG APP_NAME
ENV APP_NAME=$APP_NAME

# Copiamos todo el monorepo al WORKDIR
COPY . .

# Instalar Nx globalmente y dependencias del root
RUN npm install -g nx@21.6.4
RUN npm install

# Verificar que Nx detecta el workspace
RUN nx --version
RUN ls -la

# Build de la app dinámica
RUN nx build $APP_NAME --verbose

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

# Copiamos solo lo necesario
COPY --from=builder /workspace/package*.json ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/$APP_NAME/dist ./dist

# Entrypoint dinámico
COPY --from=builder /workspace/apps/$APP_NAME/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

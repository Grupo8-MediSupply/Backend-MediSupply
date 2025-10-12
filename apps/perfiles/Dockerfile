# Etapa de construcción
FROM node:22.18-alpine AS builder
WORKDIR /app

ARG APP_NAME
ENV APP_NAME=$APP_NAME

COPY . .

RUN npm install -g nx@21.6.4
RUN npm install

RUN nx build $APP_NAME

# Etapa de producción
FROM node:22.18-alpine AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/$APP_NAME/dist ./dist
COPY apps/$APP_NAME/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .
EXPOSE 3000
# Exec form (no npm wrapper) so Cloud Run SIGTERM reaches node for graceful shutdown
CMD ["node", "dist/main"]
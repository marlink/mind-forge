FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=server --workspace=shared

# Copy source code
COPY server ./server
COPY shared ./shared

# Generate Prisma Client
WORKDIR /app/server
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/

# Create logs directory
RUN mkdir -p /app/server/logs

WORKDIR /app/server

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]


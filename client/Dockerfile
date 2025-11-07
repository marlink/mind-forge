FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=client --workspace=shared

# Copy source code
COPY client ./client
COPY shared ./shared

WORKDIR /app/client

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package*.json ./

WORKDIR /app/client

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]


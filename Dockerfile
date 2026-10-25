# Production Dockerfile for KATA Car Dealership Inventory System
FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma SQLite engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package descriptors
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm --prefix backend install
RUN npm --prefix frontend install

# Copy source code and Prisma migrations
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate Prisma client and compile code
RUN npm --prefix backend run prisma:generate
RUN npm --prefix backend run build
RUN npm --prefix frontend run build

# Default environment configuration
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:./dev.db"

EXPOSE 3001

# Run migrations, seed if empty, and start unified server
CMD ["sh", "-c", "npx --prefix backend prisma migrate deploy && npx --prefix backend ts-node-dev prisma/seed.ts || true; node backend/dist/server.js"]

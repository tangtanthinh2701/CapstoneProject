# Stage 1: Build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies and dev dependencies for building
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client and build the NestJS application
RUN npx prisma generate --schema=./prisma/schema.prisma && npm run build 
# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3001

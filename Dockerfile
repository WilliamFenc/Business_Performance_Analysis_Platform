# ----------------------------
# Build Stage
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install all dependencies (needed for Vite build)
RUN npm install --legacy-peer-deps

COPY . .

# Build the React Frontend (Vite)
RUN npm run build

# Prune dependencies
RUN npm prune --production

# ----------------------------
# Production Stage
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json so 'npm run server' works
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy the built Frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy your Backend Source Code
COPY server.js ./

# Copy database abstraction layer
COPY api ./api

# Copy lib directory (repository pattern)
COPY lib ./lib

EXPOSE 3000

USER node

CMD ["npm", "run", "server"]
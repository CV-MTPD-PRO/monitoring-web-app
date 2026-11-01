FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install dependencies using bun
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the SvelteKit app
RUN bun run build

# ==========================================
# Production Stage
# ==========================================
FROM oven/bun:alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

# Set Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the listening port
EXPOSE 3000

# Start the server using bun
CMD ["bun", "run", "build/index.js"]

FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy application code
COPY . .

EXPOSE 3000

# Production: single process (clustering handled at runtime if NODE_ENV=production)
CMD ["bun", "run", "src/index.ts"]

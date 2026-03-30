FROM oven/bun:1.3

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY docker/dev-entrypoint.sh ./docker/dev-entrypoint.sh
RUN bun install

# Copy rest of the app
COPY . .

RUN bunx prisma generate && chmod +x docker/dev-entrypoint.sh

EXPOSE 3000

CMD ["sh", "./docker/dev-entrypoint.sh"]
FROM oven/bun:1.3-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/producer/package.json ./apps/producer/
COPY packages/db/package.json ./packages/db/
COPY packages/redisstream/package.json ./packages/redisstream/

RUN bun install

COPY packages/db ./packages/db
COPY packages/redisstream ./packages/redisstream
COPY apps/producer ./apps/producer

WORKDIR /app/packages/db
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN bunx prisma generate

WORKDIR /app/apps/producer

CMD ["bun", "run", "index.ts"]

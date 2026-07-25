FROM oven/bun:1.3-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

RUN bun install

COPY packages/db ./packages/db
COPY apps/api ./apps/api

WORKDIR /app/packages/db
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN bunx prisma generate

WORKDIR /app/apps/api

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "index.ts"]

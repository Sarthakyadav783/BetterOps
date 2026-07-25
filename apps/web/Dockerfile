FROM oven/bun:1.3-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/

RUN bun install

COPY apps/web ./apps/web

WORKDIR /app/apps/web

ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN bun run build

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "start", "--", "-p", "3001"]

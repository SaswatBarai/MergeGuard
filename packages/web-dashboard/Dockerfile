FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

COPY packages/web-dashboard ./packages/web-dashboard

RUN pnpm install --filter @mergeguard/web-dashboard...

WORKDIR /app/packages/web-dashboard

EXPOSE 3004

CMD ["pnpm", "run", "dev"]

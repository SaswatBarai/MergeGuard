FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

COPY packages/db ./packages/db
COPY packages/auth-service ./packages/auth-service

RUN pnpm install --filter @mergeguard/auth-service...

# Regenerate Prisma client inside the container so import paths resolve correctly
RUN cd packages/db && npx prisma generate && pnpm exec tsc --project tsconfig.json

WORKDIR /app/packages/auth-service

EXPOSE 3001

CMD ["pnpm", "run", "dev"]

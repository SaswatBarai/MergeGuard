FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

COPY packages/db ./packages/db
COPY packages/events ./packages/events
COPY packages/review-service ./packages/review-service

RUN pnpm install --filter @mergeguard/review-service...

# Build events package, then regenerate Prisma client
RUN cd packages/events && pnpm exec tsc --project tsconfig.json
RUN cd packages/db && npx prisma generate && pnpm exec tsc --project tsconfig.json

WORKDIR /app/packages/review-service

EXPOSE 3002

CMD ["pnpm", "run", "dev"]

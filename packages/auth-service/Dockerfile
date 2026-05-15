FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

# Copy the db package and auth-service package
COPY packages/db ./packages/db
COPY packages/auth-service ./packages/auth-service

# Install dependencies for the whole workspace (or just what's needed)
RUN pnpm install --filter @mergeguard/auth-service...

WORKDIR /app/packages/auth-service

EXPOSE 3001

CMD ["pnpm", "run", "dev"]

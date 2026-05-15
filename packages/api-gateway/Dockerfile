FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

# Copy the api-gateway package
COPY packages/api-gateway ./packages/api-gateway

# Install dependencies for the api-gateway
RUN pnpm install --filter @mergeguard/api-gateway...

WORKDIR /app/packages/api-gateway

EXPOSE 3000

CMD ["pnpm", "run", "dev"]

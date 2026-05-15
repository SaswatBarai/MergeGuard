FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . .

EXPOSE 3002

CMD ["sh", "-c", "pnpm install && pnpm run dev"]

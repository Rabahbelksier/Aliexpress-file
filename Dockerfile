FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install -g pnpm@10.26.1

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]

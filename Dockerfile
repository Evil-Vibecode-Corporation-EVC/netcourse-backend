FROM node:24-alpine AS base

RUN apk add --no-cache python3 make g++
RUN corepack enable

WORKDIR /usr/src/app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile 

FROM deps AS builder

COPY . .

RUN pnpm build

RUN pnpm prune --prod

FROM node:24-alpine AS runner

RUN corepack enable

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

USER node

EXPOSE 3000

CMD ["./entrypoint.sh"]

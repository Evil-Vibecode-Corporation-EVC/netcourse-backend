FROM node:24-alpine AS base

RUN apk add --no-cache python3 make g++
RUN corepack enable

WORKDIR /usr/src/app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
ENV PNPM_IGNORE_SCRIPTS=false
ENV PNPM_ENABLE_PREPOST_SCRIPTS=true
RUN pnpm install --frozen-lockfile --ignore-scripts=false

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
COPY --from=builder /usr/src/app/fonts ./fonts
COPY --from=builder /usr/src/app/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

RUN mkdir -p logs && chown node:node logs

USER node

EXPOSE 3000

CMD ["./entrypoint.sh"]

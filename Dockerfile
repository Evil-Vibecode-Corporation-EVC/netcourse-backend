FROM node:20-alpine AS builder

RUN apk add --no-cache python3 build-base

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --unsafe-perm --no-audit --no-fund

COPY . .
RUN npm run build

RUN npm prune --production --silent

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production PORT=3000

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]

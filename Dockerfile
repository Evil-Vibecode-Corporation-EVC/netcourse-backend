FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package.json package-lock.json pnpm-lock.yaml ./

RUN npm ci --silent

COPY . .
RUN npm run build

RUN npm prune --production --silent


FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# COPY --from=builder /usr/src/app/public ./public
# COPY --from=builder /usr/src/app/fonts ./fonts

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
# TradeNot.es: one image serving the API (server/) and the built frontend, for tradenot.es and for
# self-hosting (docs/self-hosting.md)
FROM node:22-alpine AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js components.json ./
COPY public ./public
COPY src ./src
COPY scripts/seo-pages.mjs ./scripts/
RUN npm run build

FROM node:22-alpine AS server
WORKDIR /build
COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund --omit=optional
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npx tsc -p tsconfig.json && npm prune --omit=dev --no-audit --no-fund

FROM node:22-alpine
# Postgres for self-hosting with one container (used only when DATABASE_URL is not set, see
# server/src/start.ts); tini reaps processes, su-exec/shadow let the entrypoint switch user
RUN apk add --no-cache postgresql18 postgresql18-contrib tini su-exec shadow
ARG APP_VERSION=dev
# The image defaults to a self-hosted installation; tradenot.es sets SELF_HOSTED=false
ENV NODE_ENV=production PORT=3000 STATIC_DIR=/app/public DATA_DIR=/data UPLOAD_DIR=/data/uploads \
    SELF_HOSTED=true APP_VERSION=$APP_VERSION
WORKDIR /app/server
COPY --from=server /build/node_modules ./node_modules
COPY --from=server /build/dist ./dist
COPY server/package.json ./
COPY server/migrations ./migrations
COPY --from=frontend /build/dist /app/public
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN mkdir -p /data/uploads && chown -R node:node /data
VOLUME /data
EXPOSE 3000
# generous start period: the first start creates the database
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/start.js"]

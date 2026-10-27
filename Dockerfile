# tradenot.es: one image serving the API (server/) and the built frontend
FROM node:22-alpine AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js components.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:22-alpine AS server
WORKDIR /build
COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund --omit=optional
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npx tsc -p tsconfig.json && npm prune --omit=dev --no-audit --no-fund

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000 STATIC_DIR=/app/public UPLOAD_DIR=/data/uploads
WORKDIR /app/server
COPY --from=server /build/node_modules ./node_modules
COPY --from=server /build/dist ./dist
COPY server/package.json ./
COPY server/migrations ./migrations
COPY --from=frontend /build/dist /app/public
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "dist/index.js"]

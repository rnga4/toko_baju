# Syntax: docker/build Dockerfile
# Tahap 1: build situs statis dengan Node 22 + pnpm/npm
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Pasang dependensi dulu (cache layer Docker lebih awet saat package.json berubah)
COPY package.json package-lock.json* ./
RUN npm ci

# Salin source lalu build
COPY . .
ARG SITE_URL=http://localhost:8095
ENV SITE_URL=$SITE_URL
RUN npm run build

# Tahap 2: serve output statis dengan Nginx
FROM nginx:1.27-alpine

# Konfigurasi Nginx khusus situs statis (gzip, cache, security headers)
COPY nginx/web/default.conf /etc/nginx/conf.d/default.conf

# Copy artifact hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root user (best practice sekaligus mengurangi permukaan serangan)
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1
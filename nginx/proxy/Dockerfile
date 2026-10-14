# Reverse proxy publik (nginx) — konfigurasi di-bake ke image, tidak pakai volume :ro.
# Alasan: bind mount ro pada /etc/nginx/conf.d + master non-root + rootfs read-only
# memicu bug "open() "/etc/nginx/on" failed" pada nginx 1.27 (lihat catatan deploy).
FROM nginx:1.27-alpine

# Hapus default server bawaan image agar tidak bentrok.
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Master jalan non-root; cache & pid ditulis ke tmpfs yang di-set di compose.
USER nginx
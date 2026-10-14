// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:8095';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  // Astro 7 memakai compiler Rust: tag wajib ditutup dengan benar, tidak ada lagi auto-koreksi.
  compressHTML: true,
  build: {
    // Aset dengan hash di cache selamanya; Astro sudah handle immutable untuk /_astro/*
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
  devToolbar: { enabled: false },
});

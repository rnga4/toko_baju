import { SITE } from '../data/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = (ctx) => {
  const origin = ctx.site?.origin ?? 'http://localhost:8095';

  const robots = `# robots.txt untuk ${SITE.namaLengkap}
User-agent: *
Allow: /
Disallow: /404

Sitemap: ${origin}/sitemap-index.xml
`;

  return new Response(robots.trim() + '\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
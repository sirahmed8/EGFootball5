import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://egfootball5.web.app';
  const lastModified = new Date();

  const routes = [
    '',
    '/home',
    '/book',
    '/matches',
    '/tournaments',
    '/challenges',
    '/communities',
    '/leaderboard',
    '/subscription',
    '/jersey-designer',
    '/var-highlights',
    '/live-stream',
    '/goal-of-the-month',
    '/ceremony',
    '/announcements',
    '/guide',
    '/support',
    '/privacy',
    '/terms',
    '/refund',
    '/cookies',
    '/thank-you',
  ];

  const locales = ['ar', 'en'];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified,
        changeFrequency: route === '' || route === '/home' || route === '/book' || route === '/matches' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/home' || route === '/book' ? 0.9 : 0.8,
        alternates: {
          languages: {
            ar: `${baseUrl}/ar${route}`,
            en: `${baseUrl}/en${route}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}

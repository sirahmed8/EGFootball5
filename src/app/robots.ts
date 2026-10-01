import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://egfootball5.web.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ar/', '/en/', '/ar/home', '/en/home', '/ar/matches', '/en/matches', '/ar/tournaments', '/en/tournaments'],
        disallow: ['/api/', '/ar/admin/', '/en/admin/', '/ar/owner/', '/en/owner/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

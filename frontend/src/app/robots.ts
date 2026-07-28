import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/crm',
          '/crm/',
          '/employee',
          '/employee/',
          '/hr',
          '/hr/',
          '/portal',
          '/portal/',
          '/sales',
          '/sales/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
    ],
    sitemap: 'https://amplivo.in/sitemap.xml',
  };
}

import type { MetadataRoute } from 'next';

// AI crawler policy from workbook tab 36. Verify user agent names before launch (open item O13).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'], disallow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://maxbid.com.au/sitemap.xml',
  };
}

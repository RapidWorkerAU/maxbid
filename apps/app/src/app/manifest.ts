import type { MetadataRoute } from 'next';

// Installable web app manifest, workbook tab 39 rule MF06. Add icons to public/icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MaxBid',
    short_name: 'MaxBid',
    description: 'Know the most you should pay before the hammer falls.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F7FA',
    theme_color: '#0E2A47',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

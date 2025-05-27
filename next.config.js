/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: `
                default-src 'self';
                script-src 'self' 'unsafe-eval' 'unsafe-inline';
                style-src 'self' 'unsafe-inline';
                img-src 'self' data: https://unpkg.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://*.basemaps.cartocdn.com;
                connect-src 'self' https://api.citybik.es https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com https://*.basemaps.cartocdn.com;
                font-src 'self';
                frame-src 'self';
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                frame-ancestors 'self';
                block-all-mixed-content;
                upgrade-insecure-requests;
              `.replace(/\s+/g, ' ').trim(), // Verwijder overtollige spaties en nieuwe regels
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;
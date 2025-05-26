// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // De CSP-string om alle benodigde externe bronnen veilig te laden.
            // Dit omvat OpenStreetMap tegels en Leaflet iconen van unpkg.com,
            // en de Citybikes API.
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://unpkg.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org; connect-src 'self' https://api.citybik.es https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com; font-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; block-all-mixed-content; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
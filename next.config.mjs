/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better error handling
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent XSS attacks
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Enable browser XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Only allow HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://cdn.fontshare.com",
              "connect-src 'self' https://*.supabase.co https://api.openai.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization configuration
  images: {
    domains: [
      'uioikszdjrjugynriilf.supabase.co', // Your Supabase storage domain
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Exclude test and backup files from production build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude backup and test files
      config.module.rules.push({
        test: /_old_backup\.|_new\.|\.test\.|\.spec\./,
        loader: 'ignore-loader',
      });
    }
    return config;
  },

  // Output standalone for better deployment
  output: 'standalone',

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental features
  experimental: {
    // Disable optimizeCss temporarily due to critters module issue in Turbopack
    // optimizeCss: true,
  },
};

export default nextConfig;

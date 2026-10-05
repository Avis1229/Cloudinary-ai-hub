// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Render

  staticPageGenerationTimeout: 600,
  
  // Handle large external packages like mongoose
  serverExternalPackages: ['mongoose'],
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Handle case sensitivity issues
    config.resolve.symlinks = false;
    
    // Add fallbacks for node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '195.35.22.92',
        port: '9010',
      },
      {
        protocol: 'http',
        hostname: 'minio',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    const cspProd = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' checkout.razorpay.com https://checkout.razorpay.com cdn.razorpay.com https://cdn.razorpay.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: res.cloudinary.com lh3.googleusercontent.com http://195.35.22.92:*",
      "media-src 'self' blob: http://195.35.22.92:*",
      "connect-src 'self' api.razorpay.com lumberjack.razorpay.com https://api.cloudinary.com https://res.cloudinary.com http://195.35.22.92:*",
      "frame-src checkout.razorpay.com api.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    const cspDev = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://vercel.live checkout.razorpay.com https://checkout.razorpay.com cdn.razorpay.com https://cdn.razorpay.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: res.cloudinary.com lh3.googleusercontent.com http://195.35.22.92:*",
      "media-src 'self' blob: http://195.35.22.92:* http://localhost:*",
      "connect-src 'self' ws: wss: http://localhost:* https://vercel.live api.razorpay.com lumberjack.razorpay.com https://api.cloudinary.com https://res.cloudinary.com http://195.35.22.92:*",
      "frame-src 'self' checkout.razorpay.com api.razorpay.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors *",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          ...common,
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
          { key: 'Content-Security-Policy', value: isProd ? cspProd : cspDev },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://minio:9000/aethravia/:path*',
      },
    ];
  },
};

export default nextConfig;

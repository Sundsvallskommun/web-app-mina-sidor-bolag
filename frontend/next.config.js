/* eslint-disable @typescript-eslint/no-require-imports */
const envalid = require('envalid');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const authDependent = envalid.makeValidator((x) => {
  const authEnabled = process.env.HEALTH_AUTH === 'true';

  if (authEnabled && !x.length) {
    throw new Error(`Can't be empty if "HEALTH_AUTH" is true`);
  }

  return x;
});

envalid.cleanEnv(process.env, {
  NEXT_PUBLIC_API_URL: envalid.str(),
  HEALTH_AUTH: envalid.bool(),
  HEALTH_USERNAME: authDependent(),
  HEALTH_PASSWORD: authDependent(),
  NEXT_PUBLIC_FEATURE_AI_ASSISTANT: envalid.bool(),
});

module.exports = withBundleAnalyzer({
  output: 'standalone',
  turbopack: {},
  images: {
    remotePatterns: [{ hostname: process.env.DOMAIN_NAME || 'localhost' }],
    formats: ['image/avif', 'image/webp'],
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  transpilePackages: ['lucide-react'],
  experimental: {
    swcPlugins: process.env.COVERAGE === 'true' ? [['swc-plugin-coverage-instrument', {}]] : [],
    optimizePackageImports: [
      '@sk-web-gui/core',
      '@sk-web-gui/react',
      '@sk-web-gui/ai',
      '@sk-web-gui/alert',
      '@sk-web-gui/next',
      '@sk-web-gui/countrycode-select',
    ],
  },
  async rewrites() {
    return [{ source: '/napi/:path*', destination: '/api/:path*' }];
  },
});

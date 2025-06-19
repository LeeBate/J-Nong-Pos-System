/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { resolve: { fallback: any } }, { isServer }: any) => {
    if (!isServer) {
      // ป้องกันการ bundle Node.js modules ใน client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'mongodb-client-encryption': false,
        aws4: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        'snappy': false,
        'supports-color': false,
        'bson-ext': false,
        'kerberos': false,
      }
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "express",
    "helmet",
    "cors",
    "cookie-parser",
    "multer",
    "bcryptjs",
    "jsonwebtoken",
    "razorpay",
    "serverless-http",
    "dotenv",
    "zod"
  ],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/_uploads/:path*"
      }
    ];
  }
};

export default nextConfig;

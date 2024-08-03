/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/comets",
  output: "export",
  reactStrictMode: true,

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;

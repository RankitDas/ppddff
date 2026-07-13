/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep native/heavy binaries external so they aren't bundled by webpack.
  serverExternalPackages: [
    "sharp",
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "pdfjs-dist",
    "mammoth",
    "xlsx",
    "@napi-rs/canvas",
    "archiver-lite-store",
  ],
  experimental: {
    // Route handlers may stream large-ish files.
    serverActions: { bodySizeLimit: "50mb" },
  },
};

export default nextConfig;
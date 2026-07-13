import puppeteer from "puppeteer";

export async function getBrowser() {
  const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";

  if (isProd) {
    const puppeteerCore = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");

    return await puppeteerCore.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    });
  }

  // Local development fallback
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

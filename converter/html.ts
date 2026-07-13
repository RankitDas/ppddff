import puppeteer from "puppeteer";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * HTML conversions:
 *  - → PDF  : Puppeteer PDF print
 *  - → PNG  : Puppeteer fullPage screenshot
 */
export async function convertHtml(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { to, data } = input;
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const htmlString = data.toString("utf8");
    await page.setContent(htmlString, { waitUntil: "networkidle0" });

    if (to === "pdf") {
      const pdf = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        printBackground: true,
      });
      return {
        buffer: Buffer.from(pdf),
        ext: "pdf",
        mime: MIME_BY_EXT.pdf!,
      };
    }

    if (to === "png") {
      const png = await page.screenshot({ fullPage: true, type: "png" });
      return {
        buffer: Buffer.from(png),
        ext: "png",
        mime: MIME_BY_EXT.png!,
      };
    }

    throw new Error(`Unsupported HTML conversion target: .${to}`);
  } finally {
    await browser.close();
  }
}

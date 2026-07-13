import puppeteer from "puppeteer";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * Handles txt/rtf/odt/ods/odp. 
 * Since LibreOffice is not installed, we fallback to Puppeteer for plain text:
 *  - txt → html : wraps text in <pre> tags
 *  - txt → pdf  : wraps in <pre> and prints to PDF using Puppeteer
 */
export async function convertOffice(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { from, to, data } = input;

  if (from === "txt") {
    const textString = data.toString("utf8");
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Text Document</title>
  <style>
    body {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 2.5rem;
      font-size: 13px;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #ffffff;
    }
  </style>
</head>
<body>${escapeHtml(textString)}</body>
</html>`;

    if (to === "html") {
      return {
        buffer: Buffer.from(html, "utf8"),
        ext: "html",
        mime: MIME_BY_EXT.html!,
      };
    }

    if (to === "pdf") {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
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
      } finally {
        await browser.close();
      }
    }
  }

  throw new Error(`Legacy/Office format .${from} conversion requires LibreOffice which is not installed in this environment.`);
}

/** Stub for LibreOffice commands if ever installed. */
export async function libreConvert(
  input: ConvertInput,
  targetFormat: string,
): Promise<ConversionResult> {
  throw new Error(`LibreOffice conversions are not supported in this environment (missing soffice binary).`);
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

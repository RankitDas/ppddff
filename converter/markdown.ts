import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import puppeteer from "puppeteer";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * Markdown conversions:
 *  - → HTML : unified + remark
 *  - → PDF  : HTML conversion + Puppeteer PDF print
 */
export async function convertMarkdown(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { to, data } = input;
  const mdString = data.toString("utf8");

  // Compile markdown to HTML
  const processed = await unified()
    .use(remarkParse)
    .use(remarkHtml)
    .process(mdString);
  const htmlContent = String(processed);

  if (to === "html") {
    const html = wrapHtml(htmlContent);
    return {
      buffer: Buffer.from(html, "utf8"),
      ext: "html",
      mime: MIME_BY_EXT.html!,
    };
  }

  if (to === "pdf") {
    const html = wrapHtml(htmlContent);
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

  throw new Error(`Unsupported Markdown target: .${to}`);
}

function wrapHtml(body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Markdown Document</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #111;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    p {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    pre {
      background: #f4f4f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: monospace;
      background: #f4f4f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5rem 0;
    }
    th, td {
      border: 1px solid #e4e4e7;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #f4f4f5;
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

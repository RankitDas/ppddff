import mammoth from "mammoth";
import puppeteer from "puppeteer";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * DOC/DOCX conversions:
 *  - → PDF  : Mammoth HTML → Puppeteer PDF print (pure JS path)
 *  - → HTML : Mammoth (semantic HTML)
 *  - → TXT  : Mammoth raw text
 *  - → MD   : Mammoth HTML → naive markdown pass
 */
export async function convertWord(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { to, data, from } = input;

  // Mammoth only understands .docx. Legacy .doc requires LibreOffice which is not installed.
  if (from === "doc") {
    throw new Error("Legacy .doc format conversion requires LibreOffice which is not installed. Please convert to .docx first.");
  }

  if (to === "pdf") {
    const { value: html } = await mammoth.convertToHtml({ buffer: data });
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(wrapHtml(html), { waitUntil: "networkidle0" });
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

  if (to === "txt") {
    const { value } = await mammoth.extractRawText({ buffer: data });
    return text(value, "txt");
  }

  if (to === "html") {
    const { value } = await mammoth.convertToHtml({ buffer: data });
    return text(wrapHtml(value), "html");
  }

  if (to === "md") {
    const { value } = await mammoth.convertToHtml({ buffer: data });
    return text(htmlToMarkdown(value), "md");
  }

  throw new Error(`Unsupported Word target: .${to}`);
}

function text(s: string, ext: "txt" | "html" | "md"): ConversionResult {
  return {
    buffer: Buffer.from(s, "utf8"),
    ext,
    mime: MIME_BY_EXT[ext] ?? "text/plain",
  };
}

function wrapHtml(body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #111;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
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

/** Deliberately small HTML→MD pass. Covers headings, bold, italics, lists, links. */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_m, l, t) => `\n${"#".repeat(Number(l))} ${strip(t)}\n`)
    .replace(/<(strong|b)>(.*?)<\/\1>/gi, (_m, _t, t) => `**${strip(t)}**`)
    .replace(/<(em|i)>(.*?)<\/\1>/gi, (_m, _t, t) => `*${strip(t)}*`)
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_m, href, t) => `[${strip(t)}](${href})`)
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (_m, t) => `- ${strip(t)}\n`)
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim();

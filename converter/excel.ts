import * as XLSX from "xlsx";
import puppeteer from "puppeteer";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * Spreadsheet conversions via SheetJS.
 *  - xls/xlsx → csv  : first sheet serialized as CSV
 *  - csv → xlsx/xls  : single sheet workbook
 *  - xls ↔ xlsx      : re-encode
 *  - xls/xlsx/csv → pdf : convert to HTML tables then print to PDF via Puppeteer
 */
export async function convertExcel(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { data, to } = input;
  const wb = XLSX.read(data, { type: "buffer" });

  if (to === "pdf") {
    // Generate clean HTML markup representing the sheets
    let htmlContent = "";
    wb.SheetNames.forEach((sheetName) => {
      const sheet = wb.Sheets[sheetName];
      if (sheet) {
        const sheetHtml = XLSX.utils.sheet_to_html(sheet);
        htmlContent += `<h2 class="sheet-title">${sheetName}</h2><div class="table-container">${sheetHtml}</div>`;
      }
    });

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Excel Document</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      color: #1a1a1a;
      background-color: #ffffff;
    }
    .sheet-title {
      font-size: 16px;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      color: #111;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 0.5rem;
    }
    .sheet-title:first-of-type {
      margin-top: 0;
    }
    .table-container {
      overflow-x: auto;
      margin-bottom: 2rem;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #e4e4e7;
      padding: 8px 12px;
      text-align: left;
      font-size: 11px;
    }
    th {
      background-color: #f4f4f5;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

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

  if (to === "csv") {
    const first = wb.SheetNames[0];
    if (!first) throw new Error("Spreadsheet has no sheets.");
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[first]!);
    return {
      buffer: Buffer.from(csv, "utf8"),
      ext: "csv",
      mime: MIME_BY_EXT.csv ?? "text/csv",
    };
  }

  if (to === "xlsx" || to === "xls") {
    const bookType = to === "xls" ? "biff8" : "xlsx";
    const out = XLSX.write(wb, { type: "buffer", bookType }) as Buffer;
    return {
      buffer: out,
      ext: to,
      mime: MIME_BY_EXT[to]!,
    };
  }

  throw new Error(`Unsupported spreadsheet target: .${to}`);
}

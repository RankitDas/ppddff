import type { ConversionResult, InputFormat, OutputFormat } from "@/types";
import { convertImage } from "./image";
import { convertPdf } from "./pdf";
import { convertWord } from "./word";
import { convertExcel } from "./excel";
import { convertPowerpoint } from "./powerpoint";
import { convertMarkdown } from "./markdown";
import { convertHtml } from "./html";
import { convertJson } from "./json";
import { convertXml } from "./xml";
import { convertEpub } from "./epub";
import { convertOffice } from "./office";

const IMAGE = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "svg"]);

export interface ConvertInput {
  from: InputFormat;
  to: OutputFormat;
  data: Buffer;
  /** Sanitized original filename, used by binary-shelling converters. */
  safeName: string;
  workDir: string;
}

/**
 * Routes a validated conversion request to the correct engine.
 * Ordering matters: more specific rules first, generic families last.
 */
export async function runConversion(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { from, to } = input;

  // Images (Sharp) — image↔image and svg→pdf handled in module.
  if (IMAGE.has(from) && (IMAGE.has(to) || to === "pdf")) {
    return convertImage(input);
  }

  // PDF → images (pdfjs + sharp)
  if (from === "pdf") return convertPdf(input);

  // Word family
  if (from === "doc" || from === "docx") return convertWord(input);

  // PowerPoint
  if (from === "ppt" || from === "pptx") return convertPowerpoint(input);

  // Spreadsheets
  if (from === "xls" || from === "xlsx" || from === "csv") {
    return convertExcel(input);
  }

  // Markdown
  if (from === "md") return convertMarkdown(input);

  // HTML
  if (from === "html") return convertHtml(input);

  // Data formats
  if (from === "json" || from === "yaml" || from === "yml") {
    return convertJson(input);
  }
  if (from === "xml") return convertXml(input);

  // EPUB
  if (from === "epub") return convertEpub(input);

  // OpenDocument + txt/rtf → office pipeline (LibreOffice)
  if (["odt", "ods", "odp", "txt", "rtf"].includes(from)) {
    return convertOffice(input);
  }

  throw new Error(`No converter registered for .${from} → .${to}`);
}
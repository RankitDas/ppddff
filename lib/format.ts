import type { InputFormat, ConversionTarget } from "@/types";

/**
 * The single source of truth for what converts to what.
 * Keyed by input extension → list of allowed output targets.
 */
export const CONVERSION_MAP: Record<InputFormat, ConversionTarget[]> = {
  // ---- Images (Sharp) ----
  png:  imageTargets("png"),
  jpg:  imageTargets("jpg"),
  jpeg: imageTargets("jpeg"),
  webp: imageTargets("webp"),
  gif:  imageTargets("gif"),
  bmp:  imageTargets("bmp"),
  tiff: imageTargets("tiff"),
  svg: [
    ...imageTargets("svg"),
    { to: "pdf", label: "PDF" },
  ],

  // ---- PDF ----
  pdf: [
    { to: "png", label: "PNG (per page)" },
    { to: "jpg", label: "JPG (per page)" },
    { to: "xlsx", label: "Excel Spreadsheet" },
    { to: "split", label: "Split PDF (extract pages)" },
    { to: "compress", label: "Compress PDF" },
  ],

  // ---- Word (LibreOffice + Mammoth) ----
  doc: [
    { to: "pdf", label: "PDF" },
    { to: "txt", label: "Plain text" },
    { to: "html", label: "HTML" },
    { to: "md", label: "Markdown" },
  ],
  docx: [
    { to: "pdf", label: "PDF" },
    { to: "txt", label: "Plain text" },
    { to: "html", label: "HTML" },
    { to: "md", label: "Markdown" },
  ],

  // ---- PowerPoint (LibreOffice) ----
  ppt:  [{ to: "pdf", label: "PDF" }],
  pptx: [{ to: "pdf", label: "PDF" }],

  // ---- Spreadsheets (xlsx) ----
  xls:  [{ to: "csv", label: "CSV" }, { to: "xlsx", label: "XLSX" }, { to: "pdf", label: "PDF Document" }],
  xlsx: [{ to: "csv", label: "CSV" }, { to: "xls", label: "XLS" }, { to: "pdf", label: "PDF Document" }],
  csv:  [{ to: "xlsx", label: "XLSX" }, { to: "xls", label: "XLS" }, { to: "pdf", label: "PDF Document" }],

  // ---- Text / RTF ----
  txt: [
    { to: "pdf", label: "PDF" },
    { to: "docx", label: "DOCX" },
    { to: "html", label: "HTML" },
  ],
  rtf: [{ to: "pdf", label: "PDF" }, { to: "txt", label: "Plain text" }],

  // ---- HTML (Puppeteer) ----
  html: [
    { to: "pdf", label: "PDF" },
    { to: "png", label: "PNG image" },
  ],

  // ---- Markdown (remark/rehype) ----
  md: [
    { to: "html", label: "HTML" },
    { to: "pdf", label: "PDF" },
  ],

  // ---- Data formats ----
  json: [{ to: "yaml", label: "YAML" }, { to: "xml", label: "XML" }],
  yaml: [{ to: "json", label: "JSON" }],
  yml:  [{ to: "json", label: "JSON" }],
  xml:  [{ to: "json", label: "JSON" }],

  // ---- EPUB (LibreOffice / Calibre-free path) ----
  epub: [{ to: "pdf", label: "PDF" }, { to: "txt", label: "Plain text" }],

  // ---- OpenDocument (LibreOffice) ----
  odt: [{ to: "pdf", label: "PDF" }, { to: "docx", label: "DOCX" }],
  ods: [{ to: "pdf", label: "PDF" }, { to: "csv", label: "CSV" }],
  odp: [{ to: "pdf", label: "PDF" }],
};

/** Shared image → image target list (excludes the source format itself). */
function imageTargets(self: InputFormat): ConversionTarget[] {
  const all: ConversionTarget[] = [
    { to: "png", label: "PNG" },
    { to: "jpg", label: "JPG" },
    { to: "webp", label: "WEBP" },
    { to: "gif", label: "GIF" },
    { to: "bmp", label: "BMP" },
    { to: "tiff", label: "TIFF" },
    { to: "pdf", label: "PDF" },
  ];
  return all.filter((t) => t.to !== self);
}

/** MIME type per extension, used for validation and response headers. */
export const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  rtf: "application/rtf",
  html: "text/html",
  md: "text/markdown",
  json: "application/json",
  xml: "application/xml",
  epub: "application/epub+zip",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
};

export const SUPPORTED_INPUT_EXTS = Object.keys(CONVERSION_MAP) as InputFormat[];

/** Returns allowed targets for an input, or [] if unsupported. */
export function targetsFor(ext: string): ConversionTarget[] {
  return CONVERSION_MAP[ext as InputFormat] ?? [];
}

/** Is `from → to` a conversion we actually support? */
export function isConversionAllowed(from: string, to: string): boolean {
  return targetsFor(from).some((t) => t.to === to);
}

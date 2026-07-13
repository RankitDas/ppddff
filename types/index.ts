// Central type + format definitions for PPDDFF.

/** Every input extension we accept (lowercase, no dot). */
export type InputFormat =
  | "pdf"
  | "png" | "jpg" | "jpeg" | "webp" | "gif" | "bmp" | "tiff" | "svg"
  | "doc" | "docx"
  | "ppt" | "pptx"
  | "xls" | "xlsx" | "csv"
  | "txt" | "rtf"
  | "html"
  | "md"
  | "json"
  | "xml"
  | "epub"
  | "odt" | "ods" | "odp"
  | "yaml" | "yml";

export type OutputFormat = InputFormat | "split" | "compress" | "merge";

/** A single supported conversion target. */
export interface ConversionTarget {
  /** Output extension, no dot. */
  to: OutputFormat;
  /** Human label shown in the UI select. */
  label: string;
}

/** Result returned by every converter. */
export interface ConversionResult {
  buffer: Buffer;
  /** Output extension (no dot). */
  ext: OutputFormat;
  /** MIME type for the response. */
  mime: string;
}

export interface ConvertApiError {
  error: string;
}
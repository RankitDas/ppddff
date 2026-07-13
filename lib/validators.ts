import { MIME_BY_EXT, SUPPORTED_INPUT_EXTS, isConversionAllowed } from "@/lib/format";
import type { InputFormat, OutputFormat } from "@/types";

export const MAX_UPLOAD_BYTES = Number(
  process.env.MAX_UPLOAD_BYTES ?? 52_428_800, // 50 MB
);

export class ValidationError extends Error {}

/** Extract a lowercase, dot-free extension from a filename. */
export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx < 0 || idx === filename.length - 1) return "";
  return filename.slice(idx + 1).toLowerCase();
}

/** Strip path segments and dangerous chars; keep it recognizable. */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/^.*[\\/]/, ""); // drop any path
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, "_") // whitelist
    .replace(/_{2,}/g, "_")
    .replace(/^\.+/, ""); // no leading dots (hidden / traversal)
  return cleaned.slice(0, 200) || "file";
}

/** Filename without extension (for building the output name). */
export function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx < 0 ? filename : filename.slice(0, idx);
}

interface ValidateArgs {
  filename: string;
  size: number;
  mime: string;
  to: string;
}

export interface ValidatedRequest {
  from: InputFormat;
  to: OutputFormat;
  safeName: string;
}

/**
 * Runs every security check up front. Throws ValidationError on any failure.
 * - size limit
 * - extension is supported
 * - MIME roughly matches the extension (defense in depth, not sole gatekeeper)
 * - the requested conversion is in our matrix
 */
export function validateRequest({
  filename,
  size,
  mime,
  to,
}: ValidateArgs): ValidatedRequest {
  if (!filename) throw new ValidationError("Missing filename.");
  if (size <= 0) throw new ValidationError("Empty file.");
  if (size > MAX_UPLOAD_BYTES) {
    throw new ValidationError(
      `File exceeds the ${(MAX_UPLOAD_BYTES / 1_048_576).toFixed(0)} MB limit.`,
    );
  }

  const from = getExtension(filename);
  if (!SUPPORTED_INPUT_EXTS.includes(from as InputFormat)) {
    throw new ValidationError(`Unsupported input format: .${from || "?"}`);
  }

  // MIME sanity check. Text-ish formats vary a lot across browsers, so we only
  // hard-fail when the declared MIME clearly contradicts the extension family.
  const expected = MIME_BY_EXT[from];
  if (expected && mime && !mimeIsCompatible(from, mime, expected)) {
    throw new ValidationError("File content does not match its extension.");
  }

  if (!isConversionAllowed(from, to)) {
    throw new ValidationError(`Cannot convert .${from} to .${to}.`);
  }

  return {
    from: from as InputFormat,
    to: to as OutputFormat,
    safeName: sanitizeFilename(filename),
  };
}

const TEXTY = new Set([
  "txt", "csv", "html", "md", "json", "xml", "yaml", "yml", "svg", "rtf",
]);

function mimeIsCompatible(ext: string, actual: string, expected: string): boolean {
  if (actual === expected) return true;
  if (actual === "application/octet-stream") return true; // generic upload
  // Browsers frequently label text formats as text/plain or empty.
  if (TEXTY.has(ext) && (actual.startsWith("text/") || actual === "")) return true;
  // jpg/jpeg share a MIME; png/jpeg families already covered by expected match.
  if (ext === "jpg" || ext === "jpeg") return actual === "image/jpeg";
  return false;
}
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import type { ConversionResult, InputFormat, OutputFormat } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

// Map our extension to the Sharp output format id.
const SHARP_FORMAT: Record<string, keyof sharp.FormatEnum> = {
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  webp: "webp",
  gif: "gif",
  tiff: "tiff",
  // BMP has no native Sharp encoder; handled via a fallback below.
};

/**
 * Image → image (any supported raster/SVG source) or image → PDF.
 * SVG is rasterized by Sharp's librsvg backing at a sensible density.
 */
export async function convertImage(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { data, from, to } = input;
  // Density boost so SVGs don't come out blurry.
  const pipeline = sharp(data, from === "svg" ? { density: 300 } : undefined);

  if (to === "pdf") {
    // Rasterize to PNG, then embed into a single-page PDF sized to the image.
    const png = await pipeline.png().toBuffer();
    const meta = await sharp(png).metadata();
    const pdf = await PDFDocument.create();
    const embedded = await pdf.embedPng(png);
    const width = meta.width ?? embedded.width;
    const height = meta.height ?? embedded.height;
    const page = pdf.addPage([width, height]);
    page.drawImage(embedded, { x: 0, y: 0, width, height });
    const bytes = await pdf.save();
    return { buffer: Buffer.from(bytes), ext: "pdf", mime: MIME_BY_EXT.pdf! };
  }

  if (to === "bmp") {
    // Sharp can't encode BMP; emit uncompressed TIFF-free fallback via raw→bmp.
    // Simplest reliable path: go through PNG then hand-write a BMP header.
    const { data, info } = await pipeline
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const bmp = encodeBmp(data, info.width, info.height);
    return { buffer: bmp, ext: "bmp", mime: MIME_BY_EXT.bmp! };
  }

  const target = SHARP_FORMAT[to];
  if (!target) throw new Error(`Unsupported image target: ${to}`);

  const buffer = await pipeline.toFormat(target).toBuffer();
  return { buffer, ext: to, mime: MIME_BY_EXT[to]! };
}

/** Minimal 32-bit BGRA BMP encoder (bottom-up), for the BMP output path. */
function encodeBmp(rgba: Buffer, width: number, height: number): Buffer {
  const rowSize = width * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = Buffer.alloc(fileSize);

  // BITMAPFILEHEADER
  buf.write("BM", 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10); // pixel data offset
  // BITMAPINFOHEADER
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(32, 28);
  buf.writeUInt32LE(pixelArraySize, 34);

  // Pixel data, bottom-up, RGBA → BGRA
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * rowSize;
    const dstRow = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const s = srcRow + x * 4;
      const d = dstRow + x * 4;
      buf[d] = rgba[s + 2]!; // B
      buf[d + 1] = rgba[s + 1]!; // G
      buf[d + 2] = rgba[s]!; // R
      buf[d + 3] = rgba[s + 3]!; // A
    }
  }
  return buf;
}
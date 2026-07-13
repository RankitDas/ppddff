import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import { writeTemp } from "@/lib/fileUtils";
import type { ConvertInput } from "./index";
import * as XLSX from "xlsx";

/**
 * PDF → images. Uses pdfjs-dist (legacy build for Node) to render each page to
 * a canvas, then Sharp to encode. Multi-page PDFs return a ZIP of images;
 * single-page returns the bare image so download stays clean.
 */
export async function convertPdf(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { data, to, workDir } = input;

  if (to === "xlsx") {
    const xlsxBuffer = await convertPdfToExcel(data);
    return {
      buffer: xlsxBuffer,
      ext: "xlsx",
      mime: MIME_BY_EXT.xlsx!,
    };
  }

  if (to === "compress") {
    const compressedBuffer = await compressPdf(data);
    return {
      buffer: compressedBuffer,
      ext: "pdf",
      mime: MIME_BY_EXT.pdf!,
    };
  }

  if (to === "split") {
    const pages = await splitPdf(data);
    if (pages.length === 1) {
      return {
        buffer: pages[0]!.buf,
        ext: "pdf",
        mime: MIME_BY_EXT.pdf!,
      };
    }
    const zip = await zipFiles(pages, workDir);
    return {
      buffer: zip,
      ext: "zip" as any,
      mime: "application/zip",
    };
  }

  const fmt = to === "jpg" || to === "jpeg" ? "jpeg" : "png";

  // pdfjs legacy build works in Node without a DOM. Dynamic import keeps it out
  // of the client bundle and plays nice with its ESM packaging.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createCanvas } = await import("@napi-rs/canvas");

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(data),
    // Disable worker; we're already off the main thread on the server.
    disableWorker: true,
  } as unknown as Parameters<typeof pdfjs.getDocument>[0]).promise;

  const pageBuffers: { name: string; buf: Buffer }[] = [];
  const scale = 2; // ~144 DPI, good balance of quality vs. size.

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    const raw = canvas.toBuffer("image/png");
    const encoded =
      fmt === "jpeg"
        ? await sharp(raw).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer()
        : await sharp(raw).png().toBuffer();

    pageBuffers.push({
      name: `page-${String(i).padStart(3, "0")}.${to}`,
      buf: encoded,
    });
  }

  await doc.destroy();

  if (pageBuffers.length === 1) {
    return {
      buffer: pageBuffers[0]!.buf,
      ext: to,
      mime: MIME_BY_EXT[to] ?? "application/octet-stream",
    };
  }

  // Multi-page → zip. We shell out is overkill; use a tiny store-only zip.
  const zip = await zipFiles(pageBuffers, workDir);
  return { buffer: zip, ext: "zip" as ConversionResult["ext"], mime: "application/zip" };
}

/**
 * Minimal ZIP writer via the OS `zip` binary is avoided for portability.
 * We embed with a small dependency-free store: write files then use
 * Node's zlib-based archive through pdf-lib? No — simplest correct path is
 * to lean on the `archiver`-free approach: use the built-in `node:zlib`
 * with a hand-rolled store. To keep this readable we use a tiny helper.
 */
async function zipFiles(
  files: { name: string; buf: Buffer }[],
  workDir: string,
): Promise<Buffer> {
  return buildStoreZip(files);
}

/** Dependency-free store-only ZIP (good enough for already-compressed PNG/JPG). */
function buildStoreZip(files: { name: string; buf: Buffer }[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  const crcTable = getCrcTable();
  const crc32 = (b: Buffer) => {
    let c = ~0;
    for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]!) & 0xff]! ^ (c >>> 8);
    return ~c >>> 0;
  };

  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const crc = crc32(f.buf);
    const size = f.buf.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // store
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, name, f.buf);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(0, 12);
    cen.writeUInt16LE(0, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(size, 20);
    cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);

    offset += local.length + name.length + f.buf.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuf, end]);
}

let _crc: number[] | null = null;
function getCrcTable(): number[] {
  if (_crc) return _crc;
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  _crc = table;
  return table;
}

/** Extracts text and reconstructs Excel tabular grid based on layout coordinates. */
async function convertPdfToExcel(data: Buffer): Promise<Buffer> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(data),
    disableWorker: true,
  } as unknown as Parameters<typeof pdfjs.getDocument>[0]).promise;

  const wb = XLSX.utils.book_new();

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();

    const tolerance = 5;
    const rowsMap = new Map<number, typeof textContent.items>();

    textContent.items.forEach((item: any) => {
      if (!item.str || item.str.trim() === "") return;
      const y = item.transform[5];
      
      let foundYKey: number | null = null;
      for (const key of rowsMap.keys()) {
        if (Math.abs(key - y) <= tolerance) {
          foundYKey = key;
          break;
        }
      }

      if (foundYKey !== null) {
        rowsMap.get(foundYKey)!.push(item);
      } else {
        rowsMap.set(y, [item]);
      }
    });

    const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) => b - a);

    const sheetData = sortedRowKeys.map((yKey) => {
      const items = rowsMap.get(yKey)!;
      items.sort((a: any, b: any) => a.transform[4] - b.transform[4]);
      return items.map((item: any) => item.str);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${p}`);
  }

  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return out;
}

/** Compresses PDF using object stream optimization. */
async function compressPdf(data: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(data);
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
  });
  return Buffer.from(compressedBytes);
}

/** Splits a multi-page PDF into an array of page buffers. */
async function splitPdf(data: Buffer): Promise<{ name: string; buf: Buffer }[]> {
  const pdfDoc = await PDFDocument.load(data);
  const pageCount = pdfDoc.getPageCount();
  const pages: { name: string; buf: Buffer }[] = [];

  for (let i = 0; i < pageCount; i++) {
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(pdfDoc, [i]);
    singleDoc.addPage(copiedPage!);
    const bytes = await singleDoc.save();
    pages.push({
      name: `page-${String(i + 1).padStart(3, "0")}.pdf`,
      buf: Buffer.from(bytes),
    });
  }

  return pages;
}

/** Merges multiple PDF buffers into a single document buffer. */
export async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();
  for (const buffer of buffers) {
    const pdfDoc = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  const bytes = await mergedPdf.save();
  return Buffer.from(bytes);
}
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const TMP_ROOT = process.env.TMP_DIR || path.join(os.tmpdir(), "ppddff");

/** Ensure the temp root exists and return it. */
export async function ensureTmpRoot(): Promise<string> {
  await fs.mkdir(TMP_ROOT, { recursive: true });
  return TMP_ROOT;
}

/**
 * Create an isolated working directory for a single conversion.
 * Everything for one request lives here so cleanup is a single rm.
 */
export async function createWorkDir(): Promise<string> {
  const root = await ensureTmpRoot();
  const dir = path.join(root, `${Date.now()}-${randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Write a buffer to disk inside a work dir and return the full path. */
export async function writeTemp(
  dir: string,
  filename: string,
  data: Buffer,
): Promise<string> {
  const full = path.join(dir, filename);
  await fs.writeFile(full, data);
  return full;
}

/** Best-effort recursive delete. Never throws. */
export async function removeDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    /* swallow — cleanup must never break a response */
  }
}

export { TMP_ROOT };
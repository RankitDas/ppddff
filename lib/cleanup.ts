import { promises as fs } from "node:fs";
import path from "node:path";
import { TMP_ROOT } from "./fileUtils";

const TTL_MINUTES = Number(process.env.TMP_TTL_MINUTES || 15);

/**
 * Sweeps the temporary root directory and deletes any folders older than TTL.
 * Best effort, swallows all errors.
 */
export async function runCleanup(): Promise<void> {
  try {
    const entries = await fs.readdir(TMP_ROOT, { withFileTypes: true });
    const now = Date.now();
    const threshold = TTL_MINUTES * 60 * 1000;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(TMP_ROOT, entry.name);
      try {
        const stats = await fs.stat(fullPath);
        const age = now - stats.mtime.getTime();
        if (age > threshold) {
          await fs.rm(fullPath, { recursive: true, force: true });
          console.log(`[cleanup] Removed old temp dir: ${entry.name} (age: ${Math.round(age / 60000)}m)`);
        }
      } catch {
        // swallow per-folder errors
      }
    }
  } catch {
    // swallow top-level errors
  }
}
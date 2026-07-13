import type { ConversionResult } from "@/types";
import type { ConvertInput } from "./index";

/** EPUB conversions are not supported in this environment. */
export async function convertEpub(
  input: ConvertInput,
): Promise<ConversionResult> {
  throw new Error(`EPUB conversions are not supported in this environment.`);
}

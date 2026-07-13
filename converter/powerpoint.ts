import type { ConversionResult } from "@/types";
import { libreConvert } from "./office";
import type { ConvertInput } from "./index";

/** PPT/PPTX → PDF via headless LibreOffice. */
export async function convertPowerpoint(
  input: ConvertInput,
): Promise<ConversionResult> {
  if (input.to !== "pdf") {
    throw new Error("PowerPoint can only be converted to PDF.");
  }
  return libreConvert(input, "pdf");
}
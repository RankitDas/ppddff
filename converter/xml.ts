import { XMLParser } from "fast-xml-parser";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * XML conversions:
 *  - xml → json : fast-xml-parser XMLParser + JSON.stringify
 */
export async function convertXml(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { to, data } = input;
  const raw = data.toString("utf8");

  if (to === "json") {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(raw);
    const jsonStr = JSON.stringify(parsed, null, 2);
    return {
      buffer: Buffer.from(jsonStr, "utf8"),
      ext: "json",
      mime: MIME_BY_EXT.json!,
    };
  }

  throw new Error(`Unsupported XML target: .${to}`);
}

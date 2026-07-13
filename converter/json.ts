import yaml from "js-yaml";
import { XMLBuilder } from "fast-xml-parser";
import type { ConversionResult } from "@/types";
import { MIME_BY_EXT } from "@/lib/format";
import type { ConvertInput } from "./index";

/**
 * JSON/YAML conversions:
 *  - json → yaml : js-yaml.dump
 *  - json → xml  : fast-xml-parser XMLBuilder
 *  - yaml/yml → json : js-yaml.load + JSON.stringify
 */
export async function convertJson(
  input: ConvertInput,
): Promise<ConversionResult> {
  const { from, to, data } = input;
  const raw = data.toString("utf8");

  if (from === "json" && to === "yaml") {
    const parsed = JSON.parse(raw);
    const ymlStr = yaml.dump(parsed);
    return {
      buffer: Buffer.from(ymlStr, "utf8"),
      ext: "yaml",
      mime: MIME_BY_EXT.yaml!,
    };
  }

  if (from === "json" && to === "xml") {
    const parsed = JSON.parse(raw);
    const builder = new XMLBuilder({ format: true });
    
    // XML requires a single root element. Wrap arrays or primitive values.
    let wrapped = parsed;
    if (typeof parsed !== "object" || parsed === null) {
      wrapped = { root: parsed };
    } else if (Array.isArray(parsed)) {
      wrapped = { root: { item: parsed } };
    } else if (Object.keys(parsed).length !== 1) {
      wrapped = { root: parsed };
    }
    
    const xmlStr = builder.build(wrapped);
    return {
      buffer: Buffer.from(xmlStr, "utf8"),
      ext: "xml",
      mime: MIME_BY_EXT.xml!,
    };
  }

  if ((from === "yaml" || from === "yml") && to === "json") {
    const parsed = yaml.load(raw);
    const jsonStr = JSON.stringify(parsed, null, 2);
    return {
      buffer: Buffer.from(jsonStr, "utf8"),
      ext: "json",
      mime: MIME_BY_EXT.json!,
    };
  }

  throw new Error(`Unsupported JSON/YAML conversion target: .${to}`);
}

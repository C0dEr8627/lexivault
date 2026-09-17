import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = require("pdf-parse") as typeof import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }
}

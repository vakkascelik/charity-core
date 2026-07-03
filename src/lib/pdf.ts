import { PDFDocument } from "pdf-lib";

/**
 * Lossless PDF shrink: re-serialise with object streams (structural
 * compression + dead-object removal). Page content, images and quality are
 * untouched. Falls back to the original bytes if parsing fails or the result
 * isn't smaller. Note: drops linearization and would invalidate digital
 * signatures — fine for newsletters/reports.
 *
 * Host app must install `pdf-lib` (peer dependency).
 */
export async function compressPdf(bytes: ArrayBuffer): Promise<ArrayBuffer> {
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    const out = await doc.save({ useObjectStreams: true });
    if (out.byteLength < bytes.byteLength) {
      return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
    }
  } catch {
    /* encrypted or malformed — upload as-is */
  }
  return bytes;
}

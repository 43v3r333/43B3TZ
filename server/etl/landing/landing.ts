import crypto from "crypto";
import zlib from "zlib";
import { LandingRecord, EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLLandingLayer");

export class LandingLayer {
  /**
   * Generates a deterministic SHA-256 hash checksum for an input payload
   */
  public static generateChecksum(payload: any): string {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Compresses an object or string into a base64 gzipped string
   */
  public static compress(payload: any): string {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
    const compressedBuffer = zlib.gzipSync(Buffer.from(serialized, "utf-8"));
    return compressedBuffer.toString("base64");
  }

  /**
   * Decompresses a base64 gzipped string back into its original parsed format
   */
  public static decompress<T = any>(compressedBase64: string): T {
    const compressedBuffer = Buffer.from(compressedBase64, "base64");
    const decompressedBuffer = zlib.gunzipSync(compressedBuffer);
    const serialized = decompressedBuffer.toString("utf-8");
    return JSON.parse(serialized);
  }

  /**
   * Accepts a raw payload from a provider, creates an immutable landing record with metadata, 
   * checksum, and compressed data storage.
   */
  public ingest(
    providerName: string,
    entityType: EntityType,
    rawPayload: any,
    version: string = "1.0"
  ): LandingRecord {
    const timestamp = new Date().toISOString();
    const checksum = LandingLayer.generateChecksum(rawPayload);
    const landingId = `land-${entityType}-${checksum.substring(0, 12)}-${Date.now()}`;

    // Compress payload to save space and test compression requirements
    const compressedPayload = LandingLayer.compress(rawPayload);

    logger.debug(`Raw payload landed in landing layer`, {
      landingId,
      providerName,
      entityType,
      checksum,
      originalSize: JSON.stringify(rawPayload).length,
      compressedSize: compressedPayload.length
    });

    return {
      landingId,
      providerName,
      entityType,
      rawPayload: compressedPayload, // Stored compressed
      checksum,
      timestamp,
      version,
      compressed: true
    };
  }

  /**
   * Retrieves the raw payload decompressed back to its original state
   */
  public extractRaw(record: LandingRecord): any {
    if (record.compressed) {
      return LandingLayer.decompress(record.rawPayload);
    }
    return typeof record.rawPayload === "string" ? JSON.parse(record.rawPayload) : record.rawPayload;
  }
}

export const etlLandingLayer = new LandingLayer();

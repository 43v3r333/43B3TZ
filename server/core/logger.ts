/**
 * Simple Logger utility for the platform.
 */
export const createLogger = (context: string) => ({
  info: (msg: string, ...args: any[]) => console.log(`[INFO][${context}] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR][${context}] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN][${context}] ${msg}`, ...args),
});

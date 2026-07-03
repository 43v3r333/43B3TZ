/**
 * Utility class for tracking execution timing of operations.
 * Supports synchronous and asynchronous timing wrappers.
 */
export class PerformanceTimer {
  private startTime: [number, number];

  constructor() {
    this.startTime = process.hrtime();
  }

  /**
   * Resets the timer.
   */
  public reset(): void {
    this.startTime = process.hrtime();
  }

  /**
   * Returns elapsed time in milliseconds.
   */
  public getElapsedMs(): number {
    const diff = process.hrtime(this.startTime);
    // diff[0] is seconds, diff[1] is nanoseconds
    return diff[0] * 1000 + diff[1] / 1000000;
  }

  /**
   * Measures duration of a synchronous function execution.
   */
  public static measureSync<T>(fn: () => T): { result: T; durationMs: number } {
    const timer = new PerformanceTimer();
    const result = fn();
    const durationMs = timer.getElapsedMs();
    return { result, durationMs };
  }

  /**
   * Measures duration of an asynchronous function execution.
   */
  public static async measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
    const timer = new PerformanceTimer();
    const result = await fn();
    const durationMs = timer.getElapsedMs();
    return { result, durationMs };
  }
}

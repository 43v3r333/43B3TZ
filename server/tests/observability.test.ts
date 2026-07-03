import { createLogger, Logger } from "../logging/Logger";
import { correlationMiddleware } from "../logging/Correlation";
import { PerformanceTimer } from "../logging/PerformanceTimer";
import { metricsCollector } from "../logging/Metrics";
import { AuditLogger } from "../logging/AuditLogger";
import { Request, Response } from "express";

const testLogger = createLogger("TestRunner", "ObservabilityTests");

let obsTestCount = 0;
let obsFailCount = 0;

function obsAssert(condition: boolean, name: string) {
  obsTestCount++;
  if (condition) {
    testLogger.info(`✅ [OBS-TEST] PASS: ${name}`);
  } else {
    obsFailCount++;
    testLogger.error(`❌ [OBS-TEST] FAIL: ${name}`);
  }
}

export async function runObservabilityTestSuite() {
  testLogger.info("Initializing Enterprise Observability & Logging Test Suite...");

  // Reset metrics
  metricsCollector.reset();

  // 1. PERFORMANCE TIMER TESTS
  const timer = new PerformanceTimer();
  await new Promise((resolve) => setTimeout(resolve, 50));
  const elapsed = timer.getElapsedMs();
  obsAssert(elapsed >= 45 && elapsed < 200, "PerformanceTimer tracks elapsed milliseconds accurately");

  const syncResult = PerformanceTimer.measureSync(() => {
    let sum = 0;
    for (let i = 0; i < 100000; i++) sum += i;
    return sum;
  });
  obsAssert(syncResult.durationMs >= 0, "PerformanceTimer.measureSync records synchronous operation timing");
  obsAssert(syncResult.result > 0, "PerformanceTimer.measureSync retains returned value of function");

  // 2. METRICS COLLECTOR TESTS
  metricsCollector.incrementRequests();
  metricsCollector.incrementRequests();
  metricsCollector.incrementPredictions(true);
  metricsCollector.incrementPredictions(false);
  metricsCollector.incrementDatabaseReads();
  metricsCollector.incrementDatabaseWrites();
  metricsCollector.incrementAiCalls();
  metricsCollector.incrementCache(true);
  metricsCollector.incrementCache(false);
  metricsCollector.incrementErrors("validation");
  metricsCollector.incrementErrors("auth");

  metricsCollector.recordResponseTime(100);
  metricsCollector.recordResponseTime(200);
  metricsCollector.recordAiLatency(50);

  const snapshot = metricsCollector.getSnapshot();
  obsAssert(snapshot.totalRequests === 2, "MetricsCollector increments total requests accurately");
  obsAssert(snapshot.predictionCount === 2, "MetricsCollector tracks prediction pipeline counts");
  obsAssert(snapshot.predictionSuccess === 1, "MetricsCollector tracks successful predictions");
  obsAssert(snapshot.predictionFailure === 1, "MetricsCollector tracks failed predictions");
  obsAssert(snapshot.databaseReads === 1, "MetricsCollector tracks database reads");
  obsAssert(snapshot.databaseWrites === 1, "MetricsCollector tracks database writes");
  obsAssert(snapshot.aiCalls === 1, "MetricsCollector tracks AI calls");
  obsAssert(snapshot.cacheHits === 1, "MetricsCollector tracks cache hits");
  obsAssert(snapshot.cacheMisses === 1, "MetricsCollector tracks cache misses");
  obsAssert(snapshot.validationErrors === 1, "MetricsCollector tracks validation errors");
  obsAssert(snapshot.authenticationFailures === 1, "MetricsCollector tracks authentication errors");
  obsAssert(snapshot.averageResponseTimeMs === 150, "MetricsCollector calculates correct moving average response latency");

  // 3. LOGGER SANITIZATION & BUFFER TESTS
  Logger.clearLogs();
  const loggerInstance = new Logger("AuthService", "UserLogin");
  
  // Log metadata with sensitive info to verify redaction/sanitization
  loggerInstance.info("User requested token", {
    password: "UnsafeRawPassword123!",
    token: "jwt-token-to-hide",
    api_key: "gemini-api-key-to-hide",
    user_id: "user-123"
  });

  const logs = Logger.getLogs();
  obsAssert(logs.length === 1, "Logger registers entries in central buffer");
  
  const entry = logs[0];
  obsAssert(entry.service === "AuthService", "Logger captures service metadata");
  obsAssert(entry.module === "UserLogin", "Logger captures module metadata");
  obsAssert(entry.userId === "user-123", "Logger hoists standard attributes like userId out of metadata");
  
  // Check sanitization/redaction
  obsAssert(entry.metadata !== undefined, "Logger retains extra metadata fields");
  obsAssert(entry.metadata?.password === "[REDACTED]", "Logger successfully redacts sensitive key 'password'");
  obsAssert(entry.metadata?.token === "[REDACTED]", "Logger successfully redacts sensitive key 'token'");
  obsAssert(entry.metadata?.api_key === "[REDACTED]", "Logger successfully redacts sensitive key 'api_key'");

  // 4. CORRELATION MIDDLEWARE TESTS
  let nextCalled = false;
  const mockReq = {
    headers: {
      "x-correlation-id": "custom-correlation-123"
    },
    ip: "127.0.0.1"
  } as unknown as Request;

  const mockRes = {
    setHeader: (key: string, value: string) => {
      obsAssert(key === "x-correlation-id", "Correlation middleware returns correlation header");
      obsAssert(value === "custom-correlation-123", "Correlation middleware reuses incoming correlation ID");
    }
  } as unknown as Response;

  correlationMiddleware(mockReq, mockRes, () => {
    nextCalled = true;
  });

  obsAssert(nextCalled, "Correlation middleware calls next() correctly");
  obsAssert(mockReq.context !== undefined, "Correlation middleware initializes req.context");
  obsAssert(mockReq.context?.requestId === "custom-correlation-123", "Correlation middleware assigns requestId to context");

  // 5. AUDIT LOGGER TESTS
  const auditStartLength = AuditLogger.getRegistry().length;
  AuditLogger.logEvent({
    category: "RoleChanges",
    action: "PromoteTraderToAdmin",
    actor: {
      userId: "admin-99",
      role: "admin",
      ip: "127.0.0.1"
    },
    details: {
      targetUserId: "user-456",
      newRole: "admin"
    },
    status: "success"
  });

  const registry = AuditLogger.getRegistry();
  obsAssert(registry.length === auditStartLength + 1, "AuditLogger logs critical security events to immutable ledger");
  obsAssert(registry[registry.length - 1].category === "RoleChanges", "AuditLogger records event category accurately");
  obsAssert(registry[registry.length - 1].actor.userId === "admin-99", "AuditLogger records actor context accurately");
  
  // Enforce Immutability (check that freezing occurred)
  let threwOnMutation = false;
  try {
    const latestEvent = registry[registry.length - 1] as any;
    latestEvent.action = "MUTATED_ACTION";
  } catch (err) {
    threwOnMutation = true;
  }
  obsAssert(threwOnMutation, "AuditLogger enforces immutable event records that cannot be modified after logging");

  testLogger.info(`================================================================`);
  testLogger.info(`  OBSERVABILITY TEST SUITE COMPLETED: Passed ${obsTestCount - obsFailCount}/${obsTestCount} assertions`);
  testLogger.info(`================================================================`);

  if (obsFailCount > 0) {
    throw new Error(`Observability test suite failed with ${obsFailCount} failing checks.`);
  }
}

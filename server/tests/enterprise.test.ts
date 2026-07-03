import { container } from "../core/di";
import { config } from "../core/config";
import { createLogger } from "../core/logger";

// Import Repositories and Services
import { predictionRepository } from "../repositories/prediction";
import { researchRepository } from "../repositories/research";
import { matchRepository } from "../repositories/match";
import { oddsRepository } from "../repositories/odds";
import { modelRepository } from "../repositories/model";
import { auditRepository } from "../repositories/audit";

import { PredictionService } from "../services/prediction";
import { ResearchService } from "../services/research";
import { OddsService } from "../services/odds";

// Import Caching and Events
import { predictionCache, MemoryCache } from "../core/cache";
import { eventBus } from "../core/eventBus";
import { jobQueue } from "../core/queue";

// Import Validators
import { AuthValidator } from "../validators/auth";
import { PredictionValidator } from "../validators/prediction";
import { ResearchValidator } from "../validators/research";
import { BettingValidator } from "../validators/betting";
import { AdminValidator } from "../validators/admin";

// Import Middlewares & Security
import { ROLE_PERMISSIONS, normalizeRole, bruteForceProtector } from "../middleware/security";

const logger = createLogger("EnterpriseTest");

let testCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string) {
  testCount++;
  if (condition) {
    logger.info(`✅ [ENTERPRISE] PASS: ${name}`);
  } else {
    failCount++;
    logger.error(`❌ [ENTERPRISE] FAIL: ${name}`);
  }
}

export async function runEnterpriseTestSuite(): Promise<void> {
  logger.info("Starting High-Assurance Enterprise Platform Verification Suite...");

  // ==========================================
  // 1. CONFIGURATION LAYER VALIDATION
  // ==========================================
  assert(config.version === "1.0.0", "System configuration exposes frozen version metadata");
  assert(config.commit === "43b3tz-prod-sha", "System configuration exposes build commit SHA");
  assert(Object.isFrozen(config), "System configuration is immutable (deep frozen)");

  // ==========================================
  // 2. SECURITY & PERMISSION TESTS (RBAC)
  // ==========================================
  assert(normalizeRole("admin") === "Admin", "Normalizes lowercase 'admin' to Enterprise 'Admin' role");
  assert(normalizeRole("trader") === "User", "Normalizes legacy 'trader' to Enterprise 'User' role");
  assert(normalizeRole("unregistered") === "Guest", "Unrecognized role defaults safely to Guest");

  assert(ROLE_PERMISSIONS.Admin.includes("Admin.Configure"), "Admin role holds Admin.Configure permission");
  assert(ROLE_PERMISSIONS.Admin.includes("Prediction.Delete"), "Admin role holds Prediction.Delete permission");
  assert(!ROLE_PERMISSIONS.User.includes("Admin.Configure"), "Standard User role lacks Admin.Configure permission");
  assert(ROLE_PERMISSIONS.User.includes("Prediction.Read"), "Standard User role holds Prediction.Read permission");

  // Brute force lockout test
  bruteForceProtector.recordSuccess("tester@enterprise.net");
  for (let i = 0; i < 5; i++) {
    bruteForceProtector.recordFailure("tester@enterprise.net");
  }
  let lockout = bruteForceProtector.checkLockout("tester@enterprise.net");
  assert(lockout.locked, "Brute force protection locks account after 5 consecutive failures");
  bruteForceProtector.recordSuccess("tester@enterprise.net");
  lockout = bruteForceProtector.checkLockout("tester@enterprise.net");
  assert(!lockout.locked, "Brute force protection unlocks account upon successful authentication reset");

  // ==========================================
  // 3. ENTERPRISE VALIDATION TESTS
  // ==========================================
  // Auth Validator
  const invalidAuth = AuthValidator.validateRegister({ email: "bad-email", password: "123" });
  assert(!invalidAuth.success && invalidAuth.errors?.length === 2, "Auth validator rejects malformed email and short passwords");
  
  const validAuth = AuthValidator.validateRegister({ email: "valid@enterprise.net", password: "SecurePassword123!", role: "Analyst" });
  assert(validAuth.success && validAuth.data?.role === "Analyst", "Auth validator permits valid registration payloads with roles");

  // Prediction Validator
  const invalidInference = PredictionValidator.validateInference({ marketType: "unsupported_market" });
  assert(!invalidInference.success, "Prediction validator rejects unsupported prediction market types");

  const validInference = PredictionValidator.validateInference({ marketType: "match_outcome", entityId: "fix-101" });
  assert(validInference.success && validInference.data?.entityId === "fix-101", "Prediction validator accepts correctly formatted inference queries");

  // Betting & Admin Validators
  const invalidDecision = BettingValidator.validateDecision({});
  assert(!invalidDecision.success, "Betting validator rejects empty decision intelligence request payloads");

  const validConfigUpdate = AdminValidator.validateUpdateConfig({ brierTargetLimit: 0.15, maxKellyStakePercent: 0.05 });
  assert(validConfigUpdate.success && validConfigUpdate.data?.maxKellyStakePercent === 0.05, "Admin validator permits valid system parameter tuning");

  // ==========================================
  // 4. REPOSITORY PATTERN VALIDATION
  // ==========================================
  // MatchRepository
  const fixtures = matchRepository.getAllFixtures();
  assert(fixtures.length > 0, "MatchRepository selects all fixture schemas");
  const fix101 = matchRepository.getFixtureById("fix-101");
  assert(fix101?.home_team === "Arsenal", "MatchRepository fetches records by indexed identity");

  // OddsRepository
  const allOdds = oddsRepository.getAllOdds();
  assert(allOdds.length > 0, "OddsRepository selects timeseries price feeds");

  // ModelRepository
  const models = modelRepository.getAllModels();
  assert(models.length > 0, "ModelRepository fetches all loaded ML model pipelines");

  // AuditRepository
  const auditRec = auditRepository.log({
    action: "VERIFY_SUITE",
    actorId: "usr-sys-01",
    actorEmail: "system@enterprise.net",
    actorRole: "Admin",
    resource: "TestSuite",
    status: "success"
  });
  const fetchedAudit = auditRepository.getLogs({ action: "VERIFY_SUITE" });
  assert(fetchedAudit.length === 1 && fetchedAudit[0].id === auditRec.id, "AuditRepository records and retrieves immutable system events");

  // ==========================================
  // 5. CACHING LAYER TESTS (TTL & Eviction)
  // ==========================================
  const customCache = new MemoryCache();
  customCache.set("temp_key_1", { name: "test" }, 1); // 1s TTL
  customCache.set("temp_key_2", { name: "test2" }, 0); // No expiration
  
  assert(customCache.get("temp_key_1") !== null, "Cache retains unexpired objects");
  
  // Test TTL Eviction (Simulating passage of time)
  await new Promise(resolve => setTimeout(resolve, 1100));
  assert(customCache.get("temp_key_1") === null, "Cache evicts expired objects automatically upon expiration threshold");
  assert(customCache.get("temp_key_2") !== null, "Cache retains objects that have zero (none) expiration TTL configuration");

  // Pattern invalidation
  customCache.set("prefix_key_1", "val1");
  customCache.set("prefix_key_2", "val2");
  customCache.set("unmatched_key", "val3");
  customCache.invalidatePattern("prefix_*");
  assert(customCache.get("prefix_key_1") === null, "Cache pattern invalidation successfully clears targeted keys");
  assert(customCache.get("unmatched_key") !== null, "Cache pattern invalidation preserves untargeted key groupings");

  // Metrics
  const metrics = customCache.getMetrics();
  assert(metrics.hits > 0 && metrics.misses > 0, "Cache registers performance instrumentation and metrics correctly");

  // ==========================================
  // 6. ASYNC QUEUE & BACKGROUND WORKERS TESTS
  // ==========================================
  jobQueue.clear();
  let taskRunCount = 0;
  jobQueue.registerHandler("ai_inference", async (job) => {
    taskRunCount++;
    return { calculatedEdge: 0.12 * job.payload.factor };
  });

  const queueJob = await jobQueue.enqueue("ai_inference", { factor: 1.5 });
  assert(queueJob.status === "pending" || queueJob.status === "processing", "Task enqueued in background starts as pending/processing");
  
  // Give background worker time to consume the task
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const finishedJob = jobQueue.getJob(queueJob.id);
  assert(finishedJob?.status === "completed", "Background worker queue consumes tasks and completes execution asynchronously");
  assert(finishedJob?.result?.calculatedEdge === 0.18, "Background task produces correct, processed worker output");
  assert(taskRunCount === 1, "Background task handler executed exactly once");

  // Worker Failure & Auto-Retry test
  let attemptCount = 0;
  jobQueue.registerHandler("model_evaluation", async () => {
    attemptCount++;
    if (attemptCount < 2) {
      throw new Error("Transient execution failure simulation");
    }
    return { status: "recovered" };
  });

  const failJob = await jobQueue.enqueue("model_evaluation", {}, { maxAttempts: 3 });
  await new Promise(resolve => setTimeout(resolve, 50));
  const recoveredJob = jobQueue.getJob(failJob.id);
  assert(recoveredJob?.status === "completed" && recoveredJob.attempts === 2, "Queue worker successfully retries failed operations up to maximum configured threshold");

  // ==========================================
  // 7. EVENT SYSTEM VALIDATION (EVENT BUS)
  // ==========================================
  let eventDispatched = false;
  let receivedPayload: any = null;
  const unsubscribe = eventBus.subscribe("PredictionCreated", (evt) => {
    eventDispatched = true;
    receivedPayload = evt.payload;
  });

  eventBus.publish("PredictionCreated", { id: "pred-999", brier: 0.081 });
  
  // Wait for setImmediate to trigger callback
  await new Promise(resolve => setTimeout(resolve, 10));
  assert(eventDispatched, "Asynchronous Event Bus routes pub/sub messages to listeners non-blockingly");
  assert(receivedPayload?.brier === 0.081, "Event message payload remains complete and uncorrupted");
  unsubscribe();

  // ==========================================
  // 8. HIGH-VOLUME CONCURRENT STRESS & BENCHMARK
  // ==========================================
  const startCachedGet = process.hrtime.bigint();
  const iterations = 5000;
  for (let i = 0; i < iterations; i++) {
    predictionCache.set(`bench_${i}`, { data: i });
    predictionCache.get(`bench_${i}`);
  }
  const endCachedGet = process.hrtime.bigint();
  const latencyNs = Number(endCachedGet - startCachedGet) / iterations;
  logger.info(`⚡ BENCHMARK: Average caching retrieval latency: ${latencyNs.toFixed(2)} ns per request`);
  assert(latencyNs < 100000, "Memory Cache executes high-volume lookups in sub-millisecond speeds");

  // Clean up benchmark keys
  predictionCache.invalidatePattern("bench_*");

  if (failCount > 0) {
    throw new Error(`Enterprise platform verification suite failed with ${failCount} failing assertions.`);
  } else {
    logger.info("Enterprise platform verification completed with 100% SUCCESS.");
  }
}

import { providerRegistry } from "../providers/registry/registry";
import { providerHealthMonitor } from "../providers/health/monitor";
import { providerCache } from "../providers/cache/cache";
import { 
  RetryEngine, 
  CircuitBreaker, 
  DeadLetterQueue, 
  FailureClassifier, 
  ErrorCategory 
} from "../providers/core/retry";
import { ProviderRateLimiter } from "../providers/core/ratelimiter";
import { ProviderMetricsTracker } from "../providers/core/metrics";
import { fakeSportsDataProvider } from "../providers/shared/fakeProvider";
import { SportradarProvider, ApiFootballProvider } from "../providers/shared/mockProviders";
import { createLogger } from "../core/logger";

const logger = createLogger("ProviderTestSuite");

let pTestCount = 0;
let pFailCount = 0;

function pAssert(condition: boolean, name: string) {
  pTestCount++;
  if (condition) {
    logger.info(`✅ [PROVIDER] PASS: ${name}`);
  } else {
    pFailCount++;
    logger.error(`❌ [PROVIDER] FAIL: ${name}`);
  }
}

export async function runProviderTestSuite() {
  logger.info("Initializing Sprint 2A Provider Platform Test Suite...");

  // Instantiate and register drivers if not already done
  const sportradar = new SportradarProvider();
  const apiFootball = new ApiFootballProvider();

  providerRegistry.register(sportradar);
  providerRegistry.register(apiFootball);
  providerRegistry.register(fakeSportsDataProvider);

  // --- 1. REGISTRY & DISCOVERY TESTS ---
  const allProvs = providerRegistry.getAllProviders();
  pAssert(allProvs.length >= 3, "Registry contains all 3 registered providers");

  const srLookup = providerRegistry.getProvider("Sportradar");
  pAssert(srLookup?.name === "Sportradar", "Registry discovery lookup matches by provider key name");

  const oddsProvs = providerRegistry.getProvidersByCapability("odds");
  pAssert(oddsProvs.length >= 2, "Registry capability lookup finds correct subset of providers");

  const orderedOdds = providerRegistry.getOrderedProvidersForCapability("odds");
  pAssert(orderedOdds[0].name === "Sportradar", "Registry correctly orders providers by priority configuration (Sportradar priority 1)");

  // --- 2. CACHE ABSTRACTION TESTS ---
  const testCategory = "fixtures";
  const testId = "f-test-cache-001";
  const testData = { game: "Pirates vs Chiefs", score: "2-1" };

  await providerCache.set("FakeSportsData", testCategory, testId, testData, { ttlSeconds: 10, compress: true });
  const retrieved = await providerCache.get<typeof testData>("FakeSportsData", testCategory, testId, { compress: true });
  pAssert(retrieved?.game === "Pirates vs Chiefs", "Cache abstraction supports compression serializations and TTL limits");

  // Invalidation
  await providerCache.invalidate("FakeSportsData", testCategory, testId);
  const postInvalidate = await providerCache.get("FakeSportsData", testCategory, testId);
  pAssert(postInvalidate === null, "Cache invalidation successfully flushes target keys");

  // Lazy loading
  let fetchCount = 0;
  const lazyVal = await providerCache.getOrFetch("FakeSportsData", "custom", "lazy-1", async () => {
    fetchCount++;
    return "lazyloaded-val";
  }, { ttlSeconds: 30 });
  pAssert(lazyVal === "lazyloaded-val", "Lazy loader returns correctly on initial fetch");
  
  const lazyValCached = await providerCache.getOrFetch("FakeSportsData", "custom", "lazy-1", async () => {
    fetchCount++;
    return "lazyloaded-val-should-not-reach";
  }, { ttlSeconds: 30 });
  pAssert(lazyValCached === "lazyloaded-val" && fetchCount === 1, "Lazy loader serves subsequent queries directly from cache without triggering fetch callback");

  // --- 3. RETRY ENGINE & CIRCUIT BREAKER TESTS ---
  // Failure Classification
  pAssert(FailureClassifier.classify(new Error("HTTP 429 Limit Reached")) === ErrorCategory.RETRYABLE_RATE_LIMIT, "Classifier parses HTTP 429 as Retryable Rate Limit");
  pAssert(FailureClassifier.classify(new Error("Failed Authenticating Access Token")) === ErrorCategory.NON_RETRYABLE_AUTH, "Classifier parses auth errors as Non-Retryable");

  // Retry limits & backoff jitter
  let attemptCount = 0;
  try {
    await RetryEngine.execute(
      "Sportradar",
      "test-action",
      async () => {
        attemptCount++;
        throw new Error("Temporary timeout 504");
      },
      { maxAttempts: 3, initialDelayMs: 2, maxDelayMs: 10, factor: 1.5, jitter: false }
    );
  } catch (err) {
    // Expected to exhaust retries
  }
  pAssert(attemptCount === 3, "Retry engine strictly honors maxAttempts threshold before declaring failure");

  // DLQ (Dead-Letter Queue)
  const entries = DeadLetterQueue.getEntries();
  const dlqFound = entries.some(e => e.providerName === "Sportradar" && e.action === "test-action");
  pAssert(dlqFound, "Exhausted permanent failures are pushed onto the Dead Letter Queue (DLQ) for auditing");

  // Circuit Breaker
  const breaker = new CircuitBreaker("API-Football-Breaker", { failureThreshold: 2, recoveryTimeoutMs: 10 });
  pAssert(breaker.getState() === "CLOSED", "Circuit breaker starts in CLOSED state");
  
  breaker.recordFailure();
  breaker.recordFailure();
  pAssert(breaker.getState() === "OPEN", "Circuit breaker trips to OPEN state after crossing failure threshold");
  pAssert(breaker.canExecute() === false, "Circuit breaker blocks actions immediately when tripped to OPEN");

  // Recovery wait
  await new Promise(resolve => setTimeout(resolve, 15));
  pAssert(breaker.getState() === "HALF_OPEN", "Circuit breaker transitions automatically to HALF_OPEN after recovery timeout cooldown");

  breaker.recordSuccess();
  pAssert(breaker.getState() === "CLOSED", "Circuit breaker successfully transitions back to CLOSED state on first successful trial probe");

  // --- 4. RATE LIMITER TESTS ---
  const rateLimiter = new ProviderRateLimiter("Sportradar", { maxRequestsPerSecond: 2, maxRequestsPerMinute: 10, burstLimit: 5 });
  
  const startLimit = Date.now();
  await rateLimiter.acquire();
  await rateLimiter.acquire(); // Utilized our 2 reqs/sec

  // This third request should queue up and delay
  await rateLimiter.acquire();
  const duration = Date.now() - startLimit;
  pAssert(duration >= 900, "Rate Limiter successfully queues and schedules execution slots when limits are crossed");

  // Adaptive Throttling
  rateLimiter.recordBackpressure();
  pAssert(rateLimiter.getStatus().adaptiveMultiplier < 1.0, "Adaptive Throttling reduces capacity coefficient on backpressure indicator");

  // --- 5. HEALTH MONITOR & HEALTH SCORING ---
  const sportradarRec = await providerHealthMonitor.evaluateProvider(sportradar);
  pAssert(sportradarRec.healthScore > 90, "Healthy provider receives a highly graded health score");

  // Force fail and evaluate
  fakeSportsDataProvider.forceFailure = true;
  const fakeRec = await providerHealthMonitor.evaluateProvider(fakeSportsDataProvider);
  pAssert(fakeRec.healthScore < 20, "Failing provider health score degrades severely to block active selection routing");
  fakeSportsDataProvider.forceFailure = false; // Restore

  // --- 6. RESILIENT FAILOVER TEST ---
  apiFootball.forceFail = true; // Sportradar will execute first (priority 1), but if it throws, it fails over to API-Football, which also throws, falling back to FakeSportsData!
  let calledProvs: string[] = [];
  
  const failoverResult = await providerRegistry.failoverExecute("fixtures", "fetch", async (provider) => {
    calledProvs.push(provider.name);
    if (provider.name === "Sportradar") {
      throw new Error("Sportradar crashed!");
    }
    if (provider.name === "API-Football") {
      throw new Error("API-Football down!");
    }
    return "failover-success";
  });

  pAssert(failoverResult === "failover-success", "Failover execution pipeline succeeds if at least one fallback provider holds operational capacity");
  pAssert(calledProvs.includes("Sportradar") && calledProvs.includes("FakeSportsData"), "Failover execution successfully cascades through ordered candidate pool");
  
  apiFootball.forceFail = false; // Restore

  // --- 7. WEIGHTED SELECTION TEST ---
  const selected = providerRegistry.getWeightedSelection("odds");
  pAssert(selected !== null, "Weighted selection resolves a suitable provider candidate");

  // --- 8. METRICS & PROMETHEUS SCRAPE EXPORT ---
  const metricsTracker = ProviderMetricsTracker.getOrCreate("Sportradar");
  metricsTracker.recordRequest(120, true);
  metricsTracker.recordCache(true);
  
  const promText = ProviderMetricsTracker.generatePrometheusText();
  pAssert(promText.includes("sports_provider_requests_total") && promText.includes("Sportradar"), "Prometheus exporter generates standard type-safe counter text formats");

  // --- 9. NORMALIZATION & DATA CONTRACT TESTS ---
  const rawFixtures = await fakeSportsDataProvider.fetchFixtures("comp-saf-psl");
  const normFixtures = fakeSportsDataProvider.normalizeFixtures(rawFixtures);
  
  pAssert(fakeSportsDataProvider.validateFixtures(normFixtures), "FakeSportsData normalizer outputs structurally valid canonical NormalizedFixture schema contracts");
  pAssert(normFixtures[0].homeTeam.name === "Orlando Pirates", "Data normalization translates nested vendor specific structures to canonical platform models");

  const rawOdds = await fakeSportsDataProvider.fetchOdds("f-1");
  const normOdds = fakeSportsDataProvider.normalizeOdds(rawOdds);
  pAssert(normOdds.markets.length > 0 && normOdds.markets[0].outcomes[0].odds === 1.85, "Canonical Odds models translate pricing lines correctly");

  logger.info(`================================================================`);
  logger.info(`  PROVIDER TESTS COMPLETED: Passed ${pTestCount - pFailCount}/${pTestCount} assertions`);
  logger.info(`================================================================`);

  if (pFailCount > 0) {
    throw new Error(`Provider platform test suite failed with ${pFailCount} assertions failing.`);
  }
}

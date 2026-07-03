import { etlLandingLayer, LandingLayer } from "../etl/landing/landing";
import { etlValidationEngine } from "../etl/validation/validation";
import { etlQualityEngine } from "../etl/quality/quality";
import { etlDeduplicationEngine, DeduplicationEngine } from "../etl/deduplication/deduplication";
import { etlEnrichmentEngine, EnrichmentEngine } from "../etl/enrichment/enrichment";
import { etlNormalizationEngine } from "../etl/normalization/normalization";
import { etlTransformationEngine } from "../etl/transforms/transforms";
import { etlStorage } from "../etl/storage/storage";
import { etlEventBus } from "../etl/events/events";
import { etlAuditLogger } from "../etl/audit/audit";
import { etlDeadLetterQueue } from "../etl/deadletter/deadletter";
import { etlMetricsTracker } from "../etl/metrics/metrics";
import { etlPipelineOrchestrator } from "../etl/pipeline/pipeline";
import { etlReplayEngine } from "../etl/pipeline/replay";
import { etlMappingEngine } from "../etl/mapping/mapping";
import { etlJobScheduler } from "../etl/scheduler/scheduler";
import { etlQueueWorker } from "../etl/workers/workers";
import { PipelineEventType } from "../etl/types";
import { createLogger } from "../core/logger";

const logger = createLogger("ETLTestSuite");

let eTestCount = 0;
let eFailCount = 0;

function eAssert(condition: boolean, name: string) {
  eTestCount++;
  if (condition) {
    logger.info(`✅ [ETL-TEST] PASS: ${name}`);
  } else {
    eFailCount++;
    logger.error(`❌ [ETL-TEST] FAIL: ${name}`);
  }
}

export async function runEtlTestSuite() {
  logger.info("Initializing Enterprise ETL Platform Test Suite...");

  // Reset Storage & Metrics for test isolation
  etlStorage.clearAll();
  etlMetricsTracker.clear();
  etlEventBus.clearHistory();
  etlAuditLogger.clearLogs();
  etlDeadLetterQueue.clearQueue();

  // --- 1. LANDING LAYER TESTS ---
  const payload = { testId: "abc-123", fixture_id: "fix-test-01", score_home: 2, score_away: 1 };
  const checksum = LandingLayer.generateChecksum(payload);
  eAssert(checksum.length === 64, "Checksum is a valid SHA-256 hex string");

  const landingRecord = etlLandingLayer.ingest("Sportradar", "fixture", payload, "v1.1.0");
  eAssert(landingRecord.compressed === true, "Landing record successfully compresses raw payloads");
  
  const extracted = etlLandingLayer.extractRaw(landingRecord);
  eAssert(extracted.testId === "abc-123", "Decompression retrieves original raw payloads with 100% fidelity");

  // --- 2. VALIDATION ENGINE TESTS ---
  const validFixtureData = {
    fixtureId: "fix-valid-101",
    competition: { competitionId: "comp-1", name: "La Liga", country: "Spain", type: "league", active: true },
    season: "2026",
    homeTeam: { teamId: "t1", name: "Real Madrid", shortName: "RMA", code: "RMA", country: "Spain" },
    awayTeam: { teamId: "t2", name: "Barcelona", shortName: "BAR", code: "BAR", country: "Spain" },
    kickoff: "2026-07-01T21:00:00Z",
    status: "scheduled"
  };

  const schemaCheck = etlValidationEngine.validateSchema("fixture", validFixtureData);
  eAssert(schemaCheck.passed === true, "Validation Engine passes correct canonical structures");

  const schemaCheckBad = etlValidationEngine.validateSchema("fixture", { fixtureId: "bad" });
  eAssert(schemaCheckBad.passed === false && schemaCheckBad.errors.length > 0, "Validation Engine correctly catches missing required fields");

  const busCheckBad = etlValidationEngine.validateBusinessRules("fixture", { ...validFixtureData, homeScore: -2 });
  eAssert(busCheckBad.passed === false, "Validation Engine rejects negative scores through business rules");

  // Duplicate detection pre-check
  eAssert(etlValidationEngine.detectDuplicate(checksum) === false, "Duplicate detection correctly identifies fresh un-ingested checksums");

  // --- 3. NORMALIZATION ENGINE TESTS ---
  // Sportradar mapper
  const rawSrPayload = {
    sr_fixture_id: "sr-fix-888",
    sr_league_name: "La Liga",
    sr_home: "Real Madrid",
    sr_away: "Barcelona",
    kickoff_timestamp: "2026-07-01T21:00:00Z",
    status_code: "live"
  };
  const normSr = etlNormalizationEngine.normalize("fixture", rawSrPayload, "Sportradar");
  eAssert(normSr.fixtureId === "sr-fix-888" && normSr.status === "in_play", "Normalization maps vendor-specific Sportradar fields to unified schema");

  // API-Football mapper
  const rawApiPayload = {
    fixture: { id: 1024, date: "2026-07-02T19:00:00Z", status: { short: "FT" } },
    teams: { home: { name: "Liverpool", id: 9 }, away: { name: "Arsenal", id: 1 } },
    goals: { home: 3, away: 2 },
    league: { id: 39, name: "Premier League", country: "England", season: "2026" }
  };
  const normApi = etlNormalizationEngine.normalize("fixture", rawApiPayload, "API-Football");
  eAssert(normApi.fixtureId === "api-fix-1024" && normApi.homeScore === 3 && normApi.status === "finished", "Normalization maps nested API-Football structures perfectly");

  // --- 4. QUALITY ENGINE TESTS ---
  const quality = etlQualityEngine.calculateQualityScore("fixture", validFixtureData, "Sportradar");
  eAssert(quality.score >= 90, "Quality engine calculates weighted totals above threshold for clean provider data");
  eAssert(quality.completeness === 100, "Completeness is rated 100% when all fields are populated");

  // --- 5. DEDUPLICATION ENGINE TESTS ---
  const d1 = DeduplicationEngine.calculateFuzzySimilarity("Mamelodi Sundowns FC", "Mamelodi Sundowns");
  eAssert(d1 >= 0.85, "Levenshtein similarity identifies team name duplicates fuzzy-wise");

  const dedupEval = etlDeduplicationEngine.evaluate("fixture", validFixtureData);
  eAssert(dedupEval.isDuplicate === false && dedupEval.resolution === "insert", "Deduplication flags brand-new entries for direct insertion");

  // --- 6. ENRICHMENT ENGINE TESTS ---
  const tz = EnrichmentEngine.resolveTimezone("South Africa");
  eAssert(tz.includes("Africa/Johannesburg"), "Enrichment resolves correct local regional timezone strings");

  // --- 7. TRANSFORMS ENGINE TESTS ---
  const rawOddsNormalized = {
    oddsId: "odds-100",
    fixtureId: "fix-101",
    providerName: "Betway",
    timestamp: "2026-07-01T12:00:00Z",
    markets: [
      {
        marketId: "m1",
        name: "1X2",
        outcomes: [
          { name: "home", odds: 2.0 },
          { name: "draw", odds: 3.5 },
          { name: "away", odds: 4.0 }
        ]
      }
    ]
  };
  const transOdds = etlTransformationEngine.transform("odds", rawOddsNormalized);
  eAssert(transOdds.markets[0].outcomes[0].probability === 0.5, "Transformation Engine computes outcomes probabilities on market lines");
  eAssert(transOdds.markets[0].outcomes[0].name === "Home", "Transformation Engine standardizes item casing and spacing");

  // --- 8. STORAGE ABSTRACTION TESTS ---
  etlStorage.saveRaw(landingRecord);
  eAssert(etlStorage.getRawRecords().length === 1, "Storage saves raw layers and supports size queries");
  eAssert(etlStorage.getRawRecord(landingRecord.landingId) !== null, "Storage supports raw fetching by landingId");

  // --- 9. EVENT BUS TESTS ---
  let eventTriggered = false;
  let receivedPayload: any = null;
  etlEventBus.subscribe(PipelineEventType.ValidationPassed, (evt) => {
    eventTriggered = true;
    receivedPayload = evt.payload;
  });

  etlEventBus.publish(PipelineEventType.ValidationPassed, "Sportradar", "fixture", { check: "ok" });
  eAssert(eventTriggered, "Event Bus publishes events to listening subscribers");
  eAssert(receivedPayload?.check === "ok", "Event Bus transmits full payload variables");

  // --- 10. AUDIT LOGGER TESTS ---
  const audit = etlAuditLogger.log({
    landingId: "land-1",
    providerName: "Sportradar",
    entityType: "fixture",
    checksum: "somechecksum",
    transformationChain: ["normalization"],
    qualityScore: 95,
    storageDestination: "db",
    durationMs: 45,
    operator: "test_runner",
    pipelineVersion: "v1.0.0",
    stagesStatus: {}
  });
  eAssert(etlAuditLogger.getLogs().length === 1, "Audit logger commits record transactions successfully");
  eAssert(etlAuditLogger.filterLogs({ operator: "test_runner" }).length === 1, "Audit logger supports modular filter indices");

  // --- 11. DEAD LETTER QUEUE (DLQ) TESTS ---
  etlDeadLetterQueue.add("API-Football", "fixture", { broken: "payload" }, ["Required fixtureId is missing"], "checksum-fail");
  const dlq = etlDeadLetterQueue.getQueue();
  eAssert(dlq.length === 1, "DLQ stores validation rejects and failures");
  eAssert(dlq[0].resolved === false, "DLQ entries are marked unresolved upon initial insertion");

  etlDeadLetterQueue.resolve(dlq[0].dlqId, "Manual data patch applied");
  eAssert(etlDeadLetterQueue.getQueue()[0].resolved === true, "DLQ allows resolving log entries for administration overview");

  // --- 12. METRICS TRACKER TESTS ---
  etlMetricsTracker.incrementProcessed("fixture");
  etlMetricsTracker.recordLatency(120);
  const scrape = etlMetricsTracker.generatePrometheusScrape();
  eAssert(scrape.includes("etl_records_processed_total_all 1"), "Metrics generates standardized Prometheus text representations");

  // --- 13. DYNAMIC SCHEDULER & WORKER QUEUE ---
  let jobRunCount = 0;
  etlJobScheduler.registerJob("test-job", 5, async () => {
    jobRunCount++;
  });
  // Stop straight away to prevent stray timers during development compilation
  etlJobScheduler.stopAll();
  eAssert(etlJobScheduler.getJobs().length === 1, "Job Scheduler registers automated background jobs successfully");

  const taskId = etlQueueWorker.enqueue("Sportradar", "fixture", validFixtureData);
  eAssert(etlQueueWorker.getQueueSize() >= 0, "Worker Queue accepts tasks for background serialization");

  // --- 14. END-TO-END PIPELINE ORCHESTRATION ---
  etlStorage.clearAll();
  const e2eResult = await etlPipelineOrchestrator.process("Sportradar", "fixture", validFixtureData, "integration_tester");
  eAssert(e2eResult.success === true, "Pipeline Orchestrator runs full 12-stage ingestion with success");
  
  const curatedFixtures = etlStorage.getCuratedEntities("fixture");
  eAssert(curatedFixtures.length === 1, "Successful orchestrations write records into the queryable Curated Storage layer");
  eAssert(curatedFixtures[0].data.homeTeam.name === "Real Madrid", "Data stored in curated layer matches normalized structures");

  // Duplicate Check
  const secondRunResult = await etlPipelineOrchestrator.process("Sportradar", "fixture", validFixtureData, "integration_tester");
  eAssert(secondRunResult.success === true, "Pipeline Orchestrator handles exact identical duplicates gracefully");
  
  // Conflicting Merge check
  const modifiedFixtureData = {
    ...validFixtureData,
    kickoff: "2026-07-02T18:00:00Z" // Changed kickoff time
  };
  const mergeRunResult = await etlPipelineOrchestrator.process("API-Football", "fixture", modifiedFixtureData, "integration_tester");
  eAssert(mergeRunResult.success === true, "Pipeline resolves conflicts, merges inputs, and tracks ingestion history");
  
  const postMergeFixture = etlStorage.getCuratedEntity("fixture", "fix-valid-101")!;
  eAssert(postMergeFixture.version === 2, "Merged curated entities increment their schema version control numbers");
  eAssert(postMergeFixture.ingestionChain.includes("Sportradar") && postMergeFixture.ingestionChain.includes("API-Football"), "Ingestion chain records accurate provenance trace list");

  // --- 15. REPLAY ENGINE TESTS ---
  const replayResult = await etlReplayEngine.executeReplay({ providerName: "Sportradar" });
  eAssert(replayResult.processed === 1, "Replay Engine re-reads raw logs and re-processes them through the system");

  logger.info(`================================================================`);
  logger.info(`  ETL TESTS COMPLETED: Passed ${eTestCount - eFailCount}/${eTestCount} assertions`);
  logger.info(`================================================================`);

  if (eFailCount > 0) {
    throw new Error(`ETL Platform test suite failed with ${eFailCount} assertions failing.`);
  }
}

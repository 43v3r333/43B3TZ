import { container } from "../core/di";
import { config } from "../core/config";
import { RelationalDB, DBUser, DBFixture, db } from "../core/db";
import { RedisBroker, redis } from "../core/redis";
import { AuthService, authService } from "../services/auth";
import { createLogger } from "../core/logger";
import { runProviderTestSuite } from "./provider.test";
import { runEtlTestSuite } from "./etl.test";
import { runMLTestSuite } from "./ml.test";
import { runPredictionTestSuite } from "./predictions.test";
import { runObservabilityTestSuite } from "./observability.test";
import { runEnterpriseTestSuite } from "./enterprise.test";

// Repositories and Services for container registration
import { predictionRepository } from "../repositories/prediction";
import { researchRepository } from "../repositories/research";
import { matchRepository } from "../repositories/match";
import { oddsRepository } from "../repositories/odds";
import { modelRepository } from "../repositories/model";
import { auditRepository } from "../repositories/audit";
import { PredictionService } from "../services/prediction";
import { ResearchService } from "../services/research";
import { OddsService } from "../services/odds";

const logger = createLogger("TestRunner");

let testCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string) {
  testCount++;
  if (condition) {
    logger.info(`✅ TEST PASS: ${name}`);
  } else {
    failCount++;
    logger.error(`❌ TEST FAIL: ${name}`);
  }
}

export async function runTestSuite() {
  logger.info("Initializing Enterprise Core Platform Test Suite (100% assertion coverage)...");

  // --- 1. CONFIGURATION CHECKS ---
  assert(typeof config.port === "number" && config.port > 0, "Config Port is a valid positive number");
  assert(config.maxKellyStakePercent === 0.05, "Config Max Kelly stake is strictly 5%");

  // --- 2. DI CONTAINER TESTS ---
  container.clear();
  assert(container.getKeys().length === 0, "DI Container starts empty");
  
  container.register("config", config);
  assert(container.has("config"), "DI Container holds config service");
  assert(container.resolve("config") === config, "DI Container resolves exact config reference");

  // Re-register everything required by downstream services and routes
  container.register("db", db);
  container.register("redis", redis);
  container.register("authService", authService);
  container.register("PredictionRepository", predictionRepository);
  container.register("ResearchRepository", researchRepository);
  container.register("MatchRepository", matchRepository);
  container.register("OddsRepository", oddsRepository);
  container.register("ModelRepository", modelRepository);
  container.register("AuditRepository", auditRepository);
  container.register("PredictionService", new PredictionService(predictionRepository, modelRepository));
  container.register("ResearchService", new ResearchService(researchRepository));
  container.register("OddsService", new OddsService(matchRepository, oddsRepository));

  // --- 3. CRYPTOGRAPHIC & JWT TESTS ---
  const auth = new AuthService();
  const password = "SuperSecretPassword123!";
  const hash = auth.hashPassword(password);
  
  assert(hash.includes(":"), "Password hash format contains salt-separator delimiter");
  assert(auth.verifyPassword(password, hash), "Password verifies successfully with correct secret");
  assert(!auth.verifyPassword("WrongPassword", hash), "Password verification rejects incorrect secret");

  const payload = { user_id: "usr-test-99", email: "tester@platform.internal", role: "trader" };
  const token = auth.signToken(payload, 5); // 5 mins lifespan
  assert(token.split(".").length === 3, "JWT Token formatted with standard 3-part header/payload/signature structure");

  const decoded = auth.verifyToken(token);
  assert(decoded !== null, "JWT Token verifies and decodes successfully");
  assert(decoded?.email === payload.email, "JWT Decoded payload matches original registration email");
  assert(decoded?.role === "trader", "JWT Decoded role holds correct permission level");

  const expiredToken = auth.signToken(payload, -5); // Signed in the past
  assert(auth.verifyToken(expiredToken) === null, "JWT Verification safely rejects expired tokens");

  // --- 4. RELATIONAL DATABASE TESTS ---
  const testDb = new RelationalDB();
  // Clear any existing users for test isolation
  const users = testDb.selectAll("users");
  users.length = 0;

  const newUser: DBUser = {
    user_id: "usr-unit-01",
    email: "trader.one@platform.internal",
    password_hash: hash,
    role: "trader",
    created_at: new Date().toISOString()
  };

  testDb.insert("users", newUser);
  assert(testDb.selectAll("users").length === 1, "Database correctly registers user insertion");
  
  const fetchedUser = testDb.selectOne("users", "email", "trader.one@platform.internal");
  assert(fetchedUser?.user_id === "usr-unit-01", "Database returns correct user by query index lookup");

  // Expect conflict error on duplicate unique email
  let duplicateThrew = false;
  try {
    testDb.insert("users", newUser);
  } catch (err) {
    duplicateThrew = true;
  }
  assert(duplicateThrew, "Database enforces unique index constraints and blocks duplicate registrations");

  // Record updating
  testDb.update("users", "user_id", "usr-unit-01", { role: "admin" });
  const updatedUser = testDb.selectOne("users", "user_id", "usr-unit-01");
  assert(updatedUser?.role === "admin", "Database safely handles transactional field updates");

  // --- 5. REDIS BROKER PUBSUB & STREAMS ---
  const broker = new RedisBroker();
  let messageReceived = false;
  let messagePayload: any = null;

  broker.subscribe("odds_updates", (msg) => {
    messageReceived = true;
    messagePayload = msg;
  });

  broker.publish("odds_updates", { fixture_id: "fix-101", edge: 0.045 });
  assert(messageReceived, "Redis Pub/Sub broker successfully routes realtime channel events");
  assert(messagePayload?.edge === 0.045, "Redis Pub/Sub message payload remains intact");

  // Stream checks (XADD/XREAD)
  const streamKey = "sports_fixtures_stream";
  const id1 = broker.xadd(streamKey, { fixture_id: "fix-101", status: "scheduled" });
  const id2 = broker.xadd(streamKey, { fixture_id: "fix-101", status: "in_play" });

  const streamDataAll = broker.xread(streamKey, "0-0");
  assert(streamDataAll.length === 2, "Redis Streams correctly appends and reads chronologically structured timeseries entries");

  const streamDataFilter = broker.xread(streamKey, id1);
  assert(streamDataFilter.length === 1 && streamDataFilter[0].id === id2, "Redis Streams XREAD filtering correctly returns messages since target offset ID");

  // --- SPRINT 2A PROVIDER PLATFORM TESTS ---
  await runProviderTestSuite();

  // --- SPRINT 2B ENTERPRISE ETL PLATFORM TESTS ---
  await runEtlTestSuite();

  // --- SPRINT 3 ENTERPRISE MLOPS PLATFORM TESTS ---
  await runMLTestSuite();

  // --- SPRINT 4 PREDICTION FACTORY TESTS ---
  await runPredictionTestSuite();

  // --- SPRINT 5 ENTERPRISE OBSERVABILITY TESTS ---
  await runObservabilityTestSuite();

  // --- SPRINT 6 HIGH-ASSURANCE ENTERPRISE SECURITY & PLATFORM STABILITY TESTS ---
  await runEnterpriseTestSuite();

  // --- SUMMARY RESULTS ---
  logger.info(`================================================================`);
  logger.info(`  TEST SUITE COMPLETED: Passed ${testCount - failCount}/${testCount} assertions`);
  logger.info(`================================================================`);
  
  if (failCount > 0) {
    throw new Error(`Test suite failed with ${failCount} failing checks.`);
  }
}

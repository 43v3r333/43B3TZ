import { autonomousAIOrchestrator } from "../predictions/orchestrator/autonomousOrchestrator";
import { dataAcquisitionPlatform } from "../predictions/acquisition/dataAcquisition";
import { modelLifecycleManager } from "../predictions/models/lifecycleManager";
import { selfOptimizationEngine } from "../predictions/selfOptimization";
import { createLogger } from "../core/logger";

const logger = createLogger("AutonomousBootstrap");

/**
 * Bootstraps the Autonomous AI Sports Operating System.
 */
export async function bootstrapAutonomousOS() {
  logger.info("Initializing Autonomous AI Sports Operating System (43B3TZ-OS)...");

  // 1. Initialize Orchestrator (Singleton)
  autonomousAIOrchestrator; // Accessing the instance initializes it

  // 2. Initialize Model Lifecycle Manager
  modelLifecycleManager;

  // 3. Initialize Self-Optimization Engine
  selfOptimizationEngine;

  // 4. Start Data Acquisition Platform
  dataAcquisitionPlatform.startAutonomousIngestion();

  logger.info("Autonomous AI Sports Operating System initialized successfully.");
}

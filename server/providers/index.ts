import { providerRegistry } from "./registry/registry";
import { providerHealthMonitor } from "./health/monitor";
import { fakeSportsDataProvider } from "./shared/fakeProvider";
import { SportradarProvider, ApiFootballProvider } from "./shared/mockProviders";
import { createLogger } from "../core/logger";

const logger = createLogger("ProviderPlatform");

export * from "./interfaces/dto";
export * from "./interfaces/provider";
export * from "./core/config";
export * from "./core/retry";
export * from "./core/ratelimiter";
export * from "./core/metrics";
export * from "./cache/cache";
export * from "./health/monitor";
export * from "./registry/registry";
export * from "./shared/fakeProvider";
export * from "./shared/mockProviders";

// Initialize the entire Provider Platform foundation
export async function initializeProviderPlatform(): Promise<void> {
  logger.info("Initializing Provider Platform foundation & registering drivers...");

  // Instantiate providers
  const sportradar = new SportradarProvider();
  const apiFootball = new ApiFootballProvider();

  // Register providers
  providerRegistry.register(sportradar);
  providerRegistry.register(apiFootball);
  providerRegistry.register(fakeSportsDataProvider);

  // Initialize all registered providers
  const providers = providerRegistry.getAllProviders();
  for (const provider of providers) {
    try {
      await provider.initialize();
      // Run initial health evaluation
      await providerHealthMonitor.evaluateProvider(provider);
      logger.info(`Provider [${provider.name}] initialized and health checked successfully.`);
    } catch (err: any) {
      logger.error(`Failed to initialize provider [${provider.name}]:`, { error: err.message });
    }
  }

  logger.info("Provider Platform successfully initialized.");
}

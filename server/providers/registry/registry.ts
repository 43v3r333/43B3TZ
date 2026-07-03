import { BaseProvider } from "../interfaces/provider";
import { providerHealthMonitor } from "../health/monitor";
import { createLogger } from "../../core/logger";

const logger = createLogger("ProviderRegistry");

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, BaseProvider> = new Map();

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  // Dynamic registration
  public register(provider: BaseProvider) {
    this.providers.set(provider.name, provider);
    logger.info(`Dynamically registered provider [${provider.name}] version [${provider.version}] with priority ${provider.priority}`);
  }

  // Discovery / lookup
  public getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  public getAllProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  // Capability lookup
  public getProvidersByCapability(capability: string): BaseProvider[] {
    return this.getAllProviders().filter(p => p.capabilities.includes(capability));
  }

  // Priority ordering & Failover discovery
  public getOrderedProvidersForCapability(capability: string): BaseProvider[] {
    const list = this.getProvidersByCapability(capability);
    
    // Sort based on priority (lower number = higher priority), and health score if records exist
    return list.sort((a, b) => {
      const recordA = providerHealthMonitor.getRecord(a.name);
      const recordB = providerHealthMonitor.getRecord(b.name);
      
      const healthA = recordA ? recordA.healthScore : 100;
      const healthB = recordB ? recordB.healthScore : 100;

      // If one is completely unavailable, deprioritize it
      const availA = recordA ? recordA.status.available : true;
      const availB = recordB ? recordB.status.available : true;

      if (availA !== availB) {
        return availA ? -1 : 1;
      }

      // If both available/healthy, compare priority config first
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // If priorities match, sort by health score descending
      return healthB - healthA;
    });
  }

  // Weighted Selection based on Health Scores
  public getWeightedSelection(capability: string): BaseProvider | null {
    const list = this.getOrderedProvidersForCapability(capability);
    if (list.length === 0) return null;

    // Filter to only active and healthy ones (score > 20)
    const candidates = list.filter(p => {
      const rec = providerHealthMonitor.getRecord(p.name);
      return rec ? rec.status.available && rec.healthScore > 20 : true;
    });

    if (candidates.length === 0) {
      // Fallback to highest ordered candidate if all are poorly graded
      return list[0];
    }

    // Accumulate scores to build cumulative distribution
    const items = candidates.map(p => {
      const rec = providerHealthMonitor.getRecord(p.name);
      const score = rec ? rec.healthScore : 80;
      return { provider: p, weight: Math.max(1, score) };
    });

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const item of items) {
      rand -= item.weight;
      if (rand <= 0) {
        return item.provider;
      }
    }

    return candidates[0];
  }

  // Resilient Failover engine: tries primary, fallback 1, fallback 2...
  public async failoverExecute<T>(
    capability: string,
    actionName: string,
    operation: (provider: BaseProvider) => Promise<T>
  ): Promise<T> {
    const providers = this.getOrderedProvidersForCapability(capability);
    if (providers.length === 0) {
      throw new Error(`No registered providers discovered supporting capability: ${capability}`);
    }

    const errors: Array<{ provider: string; error: string }> = [];

    for (const provider of providers) {
      try {
        logger.info(`Failover execution attempting [${actionName}] via provider [${provider.name}]`);
        const result = await operation(provider);
        return result;
      } catch (err: any) {
        logger.error(`Failover execution failed with provider [${provider.name}]. Tripping failover path...`, {
          error: err.message
        });
        errors.push({ provider: provider.name, error: err.message });
      }
    }

    // If all providers failed completely
    throw new Error(
      `Failover pipeline completely exhausted for capability [${capability}] action [${actionName}]. Errors: ` +
      errors.map(e => `[${e.provider}: ${e.error}]`).join(", ")
    );
  }

  public getRegistryStatus() {
    return this.getAllProviders().map(p => {
      const rec = providerHealthMonitor.getRecord(p.name);
      return {
        name: p.name,
        version: p.version,
        priority: p.priority,
        capabilities: p.capabilities,
        healthScore: rec ? rec.healthScore : "UNCHECKED",
        available: rec ? rec.status.available : "UNCHECKED"
      };
    });
  }
}

export const providerRegistry = ProviderRegistry.getInstance();

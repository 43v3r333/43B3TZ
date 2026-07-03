export interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  rateLimit: {
    maxRequestsPerSecond: number;
    maxRequestsPerMinute: number;
    burstLimit: number;
  };
  retry: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    factor: number;
    jitter: boolean;
  };
  circuitBreaker: {
    failureThreshold: number; // consecutive failures to open the circuit
    recoveryTimeoutMs: number; // time to wait before trying to close the circuit
  };
  cache: {
    ttlSeconds: number;
    version: string;
    compression: boolean;
  };
}

export const defaultProviderConfigs: Record<string, ProviderConfig> = {
  "Sportradar": {
    name: "Sportradar",
    enabled: true,
    priority: 1,
    rateLimit: {
      maxRequestsPerSecond: 5,
      maxRequestsPerMinute: 120,
      burstLimit: 15,
    },
    retry: {
      maxAttempts: 4,
      initialDelayMs: 200,
      maxDelayMs: 3000,
      factor: 2,
      jitter: true,
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeoutMs: 15000,
    },
    cache: {
      ttlSeconds: 300,
      version: "v1.0",
      compression: false,
    }
  },
  "API-Football": {
    name: "API-Football",
    enabled: true,
    priority: 2,
    rateLimit: {
      maxRequestsPerSecond: 10,
      maxRequestsPerMinute: 300,
      burstLimit: 30,
    },
    retry: {
      maxAttempts: 3,
      initialDelayMs: 100,
      maxDelayMs: 2000,
      factor: 2,
      jitter: true,
    },
    circuitBreaker: {
      failureThreshold: 4,
      recoveryTimeoutMs: 10000,
    },
    cache: {
      ttlSeconds: 180,
      version: "v1.0",
      compression: false,
    }
  },
  "FakeSportsData": {
    name: "FakeSportsData",
    enabled: true,
    priority: 3,
    rateLimit: {
      maxRequestsPerSecond: 100,
      maxRequestsPerMinute: 6000,
      burstLimit: 200,
    },
    retry: {
      maxAttempts: 5,
      initialDelayMs: 50,
      maxDelayMs: 500,
      factor: 1.5,
      jitter: true,
    },
    circuitBreaker: {
      failureThreshold: 10,
      recoveryTimeoutMs: 5000,
    },
    cache: {
      ttlSeconds: 60,
      version: "v1.0",
      compression: false,
    }
  }
};

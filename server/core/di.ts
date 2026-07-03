import { createLogger, Logger } from "./logger";

type Constructor<T = any> = new (...args: any[]) => T;

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = createLogger("DIContainer");
    this.logger.info("Initializing enterprise dependency injection container");
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      this.logger.warn(`Service override registered for key: "${name}"`);
    } else {
      this.logger.info(`Service registered successfully: "${name}"`);
    }
    this.services.set(name, service);
  }

  public resolve<T>(name: string): T {
    if (!this.services.has(name)) {
      this.logger.error(`Failed to resolve service for key: "${name}"`);
      throw new Error(`Service "${name}" not found in DI Container`);
    }
    return this.services.get(name) as T;
  }

  public has(name: string): boolean {
    return this.services.has(name);
  }

  public clear(): void {
    this.services.clear();
    this.logger.info("Dependency injection container cleared");
  }

  public getKeys(): string[] {
    return Array.from(this.services.keys());
  }
}

export const container = DIContainer.getInstance();

import { ContextId, DiscoveryService, ModuleRef } from '@nestjs/core';
import { Injectable, Logger, Type } from '@nestjs/common';

@Injectable()
export class Explorer {
  private readonly logger: Logger;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private moduleRef: ModuleRef,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  exploreProviders<T = unknown>(
    metadataKey: string,
    contextId?: ContextId,
  ): Promise<T[]> {
    const wrappers = this.discoveryService.getProviders();
    const providers = wrappers
      .map((wrapper) => {
        if (this.filter(metadataKey, wrapper.metatype)) {
          this.logger.log(contextId);
          return this.moduleRef.resolve(wrapper.token, contextId);
        }
        return null;
      })
      .filter((item) => !!item);

    this.logger.debug(
      `Found ${providers.length} providers that has ${metadataKey} metadata`,
    );

    return Promise.all(providers);
  }

  filter(metadataKey: string, type: Type | Function): boolean {
    return !!this.getMetadata(metadataKey, type);
  }

  getMetadata<T = any>(metadataKey: string, type: Type | Function): T {
    try {
      return (
        Reflect.getMetadata(metadataKey, type) ||
        Reflect.getMetadata(metadataKey, type.prototype)
      );
    } catch (e) {
      return null;
    }
  }
}

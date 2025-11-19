import { PubSubService } from '@medi-supply/messaging-pubsub';
import { Injectable } from '@nestjs/common';

export interface AuditStrategy {
  handle(auditData: any): Promise<void>;
}

@Injectable()
export class AuthAuditStrategy implements AuditStrategy {
  constructor(private readonly pubSub: PubSubService) {}
  async handle(auditData: any) {
    const {
      response,
      action,
      module,
      body: { email },
      ip,
      userId,
      timestamp,
    } = auditData;

    const event = {
      module,
      timestamp,
      response: {
        status: response?.access_token ? 'SUCCESS' : 'FAILED',
      },
      action,
      email,
      ip,
      userId,
      severity: response?.access_token ? 'BAJA' : 'ALTA',
    };

    await this.pubSub.publish('auditoria', event);
  }
}

@Injectable()
export class ProductAuditStrategy implements AuditStrategy {
  constructor(private readonly pubSub: PubSubService) {}

  async handle(auditData: any) {
    const { response, ip, email, action, timestamp, userId, module } =
      auditData;

    const event = {
      module,
      timestamp,
      action,
      email,
      ip,
      response,
      userId,
    };

    await this.pubSub.publish('auditoria', event);
  }
}

@Injectable()
export class GenericAuditStrategy implements AuditStrategy {
  constructor(private readonly pubSub: PubSubService) {}

  async handle(auditData: any) {
    const { response, ip, email, action, timestamp, userId, module } =
      auditData;

    const event = {
      module,
      timestamp,
      action,
      email,
      ip,
      response,
      userId,
    };

    await this.pubSub.publish('auditoria', event);
  }
}

@Injectable()
export class AuditStrategyFactory {
  constructor(
    private readonly authStrategy: AuthAuditStrategy,
    private readonly productStrategy: ProductAuditStrategy,
    private readonly genericStrategy: GenericAuditStrategy,
  ) {}

  getStrategy(module: string): AuditStrategy | null {
    switch (module) {
      case 'Auth':
        return this.authStrategy;
      case 'Product':
        return this.productStrategy;
      default:
        return this.genericStrategy;
    }
  }
}

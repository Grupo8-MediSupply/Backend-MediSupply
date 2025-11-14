import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_META_KEY, AuditMetadata } from '../auth/decorators/audit.decorator';
import { AuditStrategyFactory } from '../auth/strategies/audit.strategy';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private strategyFactory: AuditStrategyFactory,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditMetadata>(
      AUDIT_META_KEY,
      context.getHandler(),
    );

    if (!metadata) return next.handle();

    const request = context.switchToHttp().getRequest();
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip;

    return next.handle().pipe(
      tap(async (result) => {
        const auditData = {
          timestamp: new Date().toISOString(),
          module: metadata.module,
          action: metadata.action,
          userId: request.user?.id ?? request.user?.sub ?? null,
          ip,
          userAgent: request.headers['user-agent'],
          body: request.body,
          response: result,
          ...(request.user?.email ? { email: request.user.email } : {})
        };

        const strategy = this.strategyFactory.getStrategy(metadata.module);
        if (strategy) {
          await strategy.handle(auditData);
        }
        
      }),
    );
  }
}

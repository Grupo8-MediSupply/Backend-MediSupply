import { Module } from '@nestjs/common';
import { JwtReadGuard } from './guards/jwt-auth.guard';
import { AuditStrategyFactory, AuthAuditStrategy, GenericAuditStrategy, ProductAuditStrategy } from './strategies/audit.strategy';

@Module({
    imports: [],
  providers: [JwtReadGuard, AuditStrategyFactory, AuthAuditStrategy, ProductAuditStrategy,GenericAuditStrategy],
  exports: [ JwtReadGuard, AuditStrategyFactory, AuthAuditStrategy, ProductAuditStrategy,GenericAuditStrategy ],
})
export class AuthModule {}

import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpManagerService } from './http/http-manager.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { JwtReadGuard } from './auth/guards/jwt-auth.guard';

@Global()
@Module({
  imports: [HttpModule, AuthModule],
  providers: [
    HttpManagerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtReadGuard, // 🔐 Todos los endpoints protegidos globalmente
    },
  ],
  exports: [HttpManagerService, AuthModule],
})
export class MediSupplySharedModule {}

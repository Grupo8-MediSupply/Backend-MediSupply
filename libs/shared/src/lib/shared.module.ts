import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpManagerService } from './http/http-manager.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    HttpManagerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // <-- se registra globalmente
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [
    HttpManagerService,
  ],
})
export class MediSupplySharedModule {}

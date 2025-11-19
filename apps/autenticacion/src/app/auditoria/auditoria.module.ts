import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaConsumerService } from './auditoria-consumer.service';
import { AuditoriaRepository } from './repositories/auditoria.repository';
import { AuditoriaController } from './auditoria.controller';

@Module({
  providers: [
    AuditoriaService,
    AuditoriaConsumerService,
    {
      provide: 'IAuditoriaRepository',
      useClass: AuditoriaRepository,
    },
  ],
  controllers: [AuditoriaController],
})
export class AuditoriaModule {}

import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaConsumerService } from './auditoria-consumer.service';
import { AuditoriaRepository } from './repositories/auditoria.repository';

@Module({
  providers: [AuditoriaService, AuditoriaConsumerService,
    {
      provide: 'IAuditoriaRepository',
      useClass: AuditoriaRepository,
    }
  ],
})
export class AuditoriaModule {}

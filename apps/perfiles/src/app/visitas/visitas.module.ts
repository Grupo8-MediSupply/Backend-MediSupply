import { Module } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { VisitasController } from './visitas.controller';
import { VisitaRepository } from './repositories/visita.repository';

@Module({
  controllers: [VisitasController],
  providers: [
    VisitasService,
    {
      provide: 'IVisitaRepository',
      useClass: VisitaRepository,
    },
  ],
})
export class VisitasModule {}

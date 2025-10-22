import { Module } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { VisitasController } from './visitas.controller';
import { VisitaRepository } from './repositories/visita.repository';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  controllers: [VisitasController],
  providers: [
    VisitasService,
    {
      provide: 'IVisitaRepository',
      useClass: VisitaRepository,
    },
  ],
  imports: [ClientesModule]
})
export class VisitasModule {}

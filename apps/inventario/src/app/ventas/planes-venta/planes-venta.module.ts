import { Module } from '@nestjs/common';
import { PlanesVentaController } from './planes-venta.controller';
import { PlanesVentaService } from './planes-venta.service';
import { PlanesVentaRepository } from './repositories/planes-venta.repository';

@Module({
  controllers: [PlanesVentaController],
  providers: [
    PlanesVentaService,
    {
      provide: 'IPlanesVentaRepository',
      useClass: PlanesVentaRepository,
    },
  ],
})
export class PlanesVentaModule {}

import { Module } from '@nestjs/common';
import { BodegasController } from './bodegas.controller';
import { BodegasService } from './bodegas.service';
import { BodegaRepository } from './repositories/bodega.repository';

@Module({
  controllers: [BodegasController],
  providers: [
    BodegasService,
    {
      provide: 'IBodegaRepository',
      useClass: BodegaRepository,
    },
  ],
})
export class BodegasModule {}

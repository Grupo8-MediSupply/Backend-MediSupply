import { Module } from '@nestjs/common';
import { BodegasController } from './bodegas.controller';
import { BodegasService } from './bodegas.service';
import { BodegaRepository } from './repositories/bodega.repository';
import { ProductoModule } from '../productos/producto.module';

@Module({
  controllers: [BodegasController],
  providers: [
    BodegasService,
    {
      provide: 'IBodegaRepository',
      useClass: BodegaRepository,
    },
  ],
  imports: [ProductoModule],
})
export class BodegasModule {}

import { Module } from '@nestjs/common';
import { RutasService } from './services/google-maps.service';

@Module({
  controllers: [],
  providers: [RutasService],
  exports: [RutasService],
})
export class MediSupplyOrdenesDmModule {}

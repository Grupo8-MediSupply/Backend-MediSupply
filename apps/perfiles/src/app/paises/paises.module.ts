import { Module } from '@nestjs/common';
import { PaisesController } from './paises.controller';
import { PaisesService } from './paises.service';
import { PaisRepository } from './repositories/pais.repository';

@Module({
  controllers: [PaisesController],
  providers: [
    PaisesService,
    {
      provide: 'IPaisRepository',
      useClass: PaisRepository,
    },
  ],
})
export class PaisesModule {}

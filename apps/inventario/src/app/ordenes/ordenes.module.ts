import { Module } from '@nestjs/common';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { ProductoModule } from '../productos/producto.module';
import { OrdenesRepository } from './repositories/Ordenes.repository';
import { BodegasModule } from '../bodegas/bodegas.module';

@Module({
  controllers: [OrdenesController],
  providers: [OrdenesService,
    {
      provide: 'IOrdenesRepository',
      useClass: OrdenesRepository,
    }
  ],
  imports: [ProductoModule,BodegasModule],
})
export class OrdenesModule {}

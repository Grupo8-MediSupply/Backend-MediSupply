import { Module } from '@nestjs/common';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { ProductoModule } from '../productos/producto.module';
import { OrdenesRepository } from './repositories/Ordenes.repository';

@Module({
  controllers: [OrdenesController],
  providers: [OrdenesService,
    {
      provide: 'IOrdenesRepository',
      useClass: OrdenesRepository,
    }
  ],
  imports: [ProductoModule],
})
export class OrdenesModule {}

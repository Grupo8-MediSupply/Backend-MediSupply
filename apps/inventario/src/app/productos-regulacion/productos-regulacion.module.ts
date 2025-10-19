import { Module } from '@nestjs/common';
import { ProductosRegulacionController } from './productos-regulacion.controller';
import { ProductosRegulacionService } from './productos-regulacion.service';
import { ProductoRegulacionRepository } from './repositories/producto-regulacion.repository';

@Module({
  controllers: [ProductosRegulacionController],
  providers: [
    ProductosRegulacionService,
    {
      provide: 'IProductoRegulacionRepository',
      useClass: ProductoRegulacionRepository,
    },
  ],
})
export class ProductosRegulacionModule {}

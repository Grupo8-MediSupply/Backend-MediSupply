import { Module } from '@nestjs/common';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { ProductoRepository } from './repositories/producto.repository';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService,
    {
      provide: 'IProductoRepository',
      useClass: ProductoRepository, 
    }
  ],
})
export class ProductoModule {}

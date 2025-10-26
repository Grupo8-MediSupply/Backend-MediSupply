import { Module } from '@nestjs/common';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { ProductoModule } from '../productos/producto.module';

@Module({
  controllers: [OrdenesController],
  providers: [OrdenesService],
  imports: [ProductoModule],
})
export class OrdenesModule {}

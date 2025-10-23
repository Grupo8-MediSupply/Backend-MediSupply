import { Controller, Post, Get, Param, ParseIntPipe, Body } from '@nestjs/common';
import { ProductosRegulacionService } from './productos-regulacion.service';
import { ProductoRegulacionDto } from './dtos/request/producto-regulacion.dto';

@Controller('v1/regulacion')
export class ProductosRegulacionController {
  constructor(private readonly service: ProductosRegulacionService) {}

  @Post(':productoId')
  asociarRegulaciones(
    @Param('productoId') productoId: string,
    @Body() dto: ProductoRegulacionDto,
  ) {
    return this.service.asociarRegulaciones(productoId, dto.regulacionIds);
  }

  @Get(':productoId')
  listarPorProducto(@Param('productoId') productoId: string) {
    return this.service.listarPorProducto(productoId);
  }
}

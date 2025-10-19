import { Controller, Post, Get, Param, ParseIntPipe, Body } from '@nestjs/common';
import { ProductosRegulacionService } from './productos-regulacion.service';
import { ProductoRegulacionDto } from './dtos/request/producto-regulacion.dto';

@Controller('productos/:productoId/regulaciones')
export class ProductosRegulacionController {
  constructor(private readonly service: ProductosRegulacionService) {}

  @Post()
  asociarRegulaciones(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() dto: ProductoRegulacionDto,
  ) {
    return this.service.asociarRegulaciones(productoId, dto.regulacionIds);
  }

  @Get()
  listarPorProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.service.listarPorProducto(productoId);
  }
}

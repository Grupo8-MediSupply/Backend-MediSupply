import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  async createProducto(@Body() producto: CreateProductoDto) {
    return await this.productoService.createProducto(producto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR, RolesEnum.ADMIN, RolesEnum.CLIENTE)
  @Get('ObtenerProductos')
  async obtenerProductosPorRegion(@User() userRequest: JwtPayloadDto) {
    return await this.productoService.obtenerProductosDeUnaRegion(
      userRequest.pais
    );
  }
}

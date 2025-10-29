import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import { UpdateProductoDto } from './dtos/request/update-producto.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';

@Controller('v1/producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  async createProducto(@Body() producto: CreateProductoDto, @User() user: JwtPayloadDto) {
    return await this.productoService.createProducto(producto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR, RolesEnum.ADMIN)
  @Patch(':id')
  async actualizarProducto(
    @Param('id') id: string,
    @Body() producto: UpdateProductoDto,
    @User() user: JwtPayloadDto,
  ) {
    return await this.productoService.actualizarProducto(id, producto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR, RolesEnum.ADMIN, RolesEnum.CLIENTE)
  @Get('ObtenerProductos')
  async obtenerProductosPorRegion(@User() userRequest: JwtPayloadDto) {
    return await this.productoService.obtenerProductosDeUnaRegion(
      userRequest.pais
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string,@User() user: JwtPayloadDto) {
    return await this.productoService.findById(id,user);
  }
}

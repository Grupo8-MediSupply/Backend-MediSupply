import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { ProductoOrdenDto } from '../ordenes/dtos/crear-orden.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { SolicitarLoteProducto } from './dtos/request/solicitar-lote-productos';

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

  @Post('actualizar-stock')
  @HttpCode(200)
  async actualizarStock(@Body() productos: ProductoOrdenDto[]) {
    await this.productoService.actualizarStockProductos(productos);
    return ApiOkResponse();
  }

  @Post('solicitar-lote')
  async solicitarLote(@Body() productos: SolicitarLoteProducto[], @User() jwt: JwtPayloadDto) {
    await this.productoService.solicitarLoteProductos(productos, jwt);
    return ApiCreatedResponse();
  }
}

import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';

@Controller('producto')
export class ProductoController {

    constructor(private readonly productoService: ProductoService) {}

    @Post()
    async createProducto(@Body() producto: CreateProductoDto) {
        return await this.productoService.createProducto(producto);
    }

    @Get('ObtenerProductosPorRegion')
    async obtenerProductosPorRegion(@Query('regionId', ParseIntPipe) regionId: number) {
        return await this.productoService.obtenerProductosDeUnaRegion(regionId);
    }
}

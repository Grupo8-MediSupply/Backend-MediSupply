import { Body, Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';

@Controller('producto')
export class ProductoController {

    constructor(private readonly productoService: ProductoService) {}

    @Post()
    async createProducto(@Body() producto: CreateProductoDto) {
        return await this.productoService.createProducto(producto);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return await this.productoService.findById(id);
  }
}

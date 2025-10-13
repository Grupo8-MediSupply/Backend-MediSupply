import { Body, Controller, Post } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';

@Controller('producto')
export class ProductoController {

    constructor(private readonly productoService: ProductoService) {}

    @Post()
    async createProducto(@Body() producto: CreateProductoDto) {
        return await this.productoService.createProducto(producto);
    }
}

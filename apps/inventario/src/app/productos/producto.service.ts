import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dtos/request/create-producto.dto';

@Injectable()
export class ProductoService {

    createProducto(producto: CreateProductoDto) {
        console.log('Producto creado:', producto);
    }
}

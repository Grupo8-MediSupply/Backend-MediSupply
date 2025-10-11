import { Body, Controller, Post } from '@nestjs/common';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedoresService } from './vendedores.service';

@Controller('vendedores')
export class VendedoresController {

    constructor(private readonly vendedoresService: VendedoresService) {}

    @Post()
    createVendedor(@Body() createVendedorDto: CreateVendedorDto) {
        return this.vendedoresService.create(createVendedorDto);
    }
}
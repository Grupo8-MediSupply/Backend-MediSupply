import { Body, Controller, Post } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  async createProveedor(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }
}
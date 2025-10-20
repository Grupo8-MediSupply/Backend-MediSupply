import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedoresService } from './proveedores.service';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';

@Controller('v1/proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}
  
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post()
  async createProveedor(@Body() createProveedorDto: CreateProveedorDto, @User() token:JwtPayloadDto) {
    return this.proveedoresService.create(createProveedorDto, token.pais);
  }
}
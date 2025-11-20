import { Body, Controller, Get, Param, Post, UseGuards, Query } from '@nestjs/common';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedoresService } from './proveedores.service';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { HistorialComprasQueryDto } from './dtos/request/historial-compras.query.dto';


@Controller('v1/proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}
  
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post()
  async createProveedor(@Body() createProveedorDto: CreateProveedorDto, @User() token:JwtPayloadDto) {
    return this.proveedoresService.create(createProveedorDto, token.pais);
  }

  @Get(':pais')
  async obtenerProveedoresPorPais(@Param('pais') pais: number) {
    return this.proveedoresService.findByPais(pais);
  }

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Get('compras/historial')
  async obtenerHistorialCompras(
    @Query() query: HistorialComprasQueryDto,
    @User() token: JwtPayloadDto,
  ) {
    return this.proveedoresService.obtenerHistorialCompras(query, token.pais);
  }
}
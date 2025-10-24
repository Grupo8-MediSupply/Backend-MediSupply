import { Controller, Get, Param } from '@nestjs/common';
import { BodegasService } from './bodegas.service';
import type { JwtPayloadDto } from '@medi-supply/shared';
import {  Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';


@Controller('v1/bodegas')
export class BodegasController {
  constructor(private readonly service: BodegasService) {}

  @Get()
  async listarBodegas(@User() user: JwtPayloadDto) {
    return this.service.findByPaisId(user.pais);
  }

  @Get(':id')
  async obtenerBodega(@Param('id') id: string, @User() user: JwtPayloadDto) {
    return this.service.findById(id, user);
  }

  @Get('/:id/productos/')
  async obtenerProductosEnBodega(@Param('id') id: string, @User() user: JwtPayloadDto) {
    return this.service.obtenerProductosEnBodega(id, user.pais);
  }
}

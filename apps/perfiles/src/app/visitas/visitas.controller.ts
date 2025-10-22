import { Controller, Post, Patch, Body, Param, Get, UseGuards } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita } from '@medi-supply/perfiles-dm';
import { CreateVisitaDto } from './dtos/request/create-visita.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';
import {  Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';


@Controller('v1/visitas')
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR)
  @Post()
  registrar(
    @Body()
    visitaDto : CreateVisitaDto,
    @User() user: JwtPayloadDto
  ) {
    return this.visitasService.registrarVisita(
      visitaDto,
      user
    );
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoVisita }
  ) {
    return this.visitasService.cambiarEstado(id, body.estado);
  }

  @Patch(':id/comentario')
  agregarComentario(
    @Param('id') id: string,
    @Body() body: { comentario: string }
  ) {
    return this.visitasService.agregarComentario(id, body.comentario);
  }

  @Get('cliente/:clienteId')
  listar(@Param('clienteId') clienteId: string) {
    return this.visitasService.listarPorCliente(clienteId);
  }
}

import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita } from '@medi-supply/perfiles-dm';
import { CreateVisitaDto } from './dtos/request/create-visita.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { Roles, RolesEnum, RolesGuard, User } from '@medi-supply/shared';
import type { FastifyRequest } from 'fastify';

@Controller('v1/visitas')
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR)
  @Post()
  registrar(
    @Body()
    visitaDto: CreateVisitaDto,
    @User() user: JwtPayloadDto
  ) {
    return this.visitasService.registrarVisita(visitaDto, user);
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

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.VENDEDOR, RolesEnum.ADMIN)
  @Post('/:id/cargar-video')
  async uploadVideo(@Param('id') id: string, @Req() req: FastifyRequest, @User() jwt: JwtPayloadDto) {
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type !== 'file') continue;

      if (!part.mimetype.startsWith('video/')) {
        throw new BadRequestException('Solo se permiten archivos de video');
      }

      const chunks: Buffer[] = [];
      for await (const chunk of part.file) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const maxSize = 30 * 1024 * 1024;

      if (buffer.length > maxSize) {
        throw new BadRequestException('El archivo supera el límite de 30MB');
      }

      const url = await this.visitasService.cargarVideoVisita(
        id,
        buffer,
        part.mimetype,
        part.filename,
        jwt
      );

      return {
        message: 'Video subido correctamente',
        url,
        size: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
      };
    }

    throw new BadRequestException('No se recibió ningún archivo');
  }
}

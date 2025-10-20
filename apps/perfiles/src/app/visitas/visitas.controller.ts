import { Controller, Post, Patch, Body, Param, Get } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita } from '@medi-supply/perfiles-dm';

@Controller('v1/visitas')
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @Post()
  registrar(
    @Body()
    body: {
      clienteId: string;
      vendedorId: string;
      fechaVisita: string;
      comentarios?: string;
    },
  ) {
    return this.visitasService.registrarVisita(
      body.clienteId,
      body.vendedorId,
      new Date(body.fechaVisita),
      body.comentarios,
    );
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoVisita },
  ) {
    return this.visitasService.cambiarEstado(id, body.estado);
  }

  @Patch(':id/comentario')
  agregarComentario(
    @Param('id') id: string,
    @Body() body: { comentario: string },
  ) {
    return this.visitasService.agregarComentario(id, body.comentario);
  }

  @Get('cliente/:clienteId')
  listar(@Param('clienteId') clienteId: string) {
    return this.visitasService.listarPorCliente(clienteId);
  }
}

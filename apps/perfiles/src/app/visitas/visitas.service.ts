import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type { IVisitaRepository } from '@medi-supply/perfiles-dm';
import { VisitaCliente, EstadoVisita } from '@medi-supply/perfiles-dm';

@Injectable()
export class VisitasService {
  constructor(
    @Inject('IVisitaRepository')
    private readonly visitaRepo: IVisitaRepository,
  ) {}

  async registrarVisita(
    clienteId: string,
    vendedorId: string,
    fechaVisita: Date,
    comentarios?: string,
  ) {
    if (fechaVisita < new Date()) {
      throw new BadRequestException('La fecha debe ser futura');
    }

    const nuevaVisita = new VisitaCliente(
      null,
      clienteId,
      vendedorId,
      fechaVisita,
      EstadoVisita.PROGRAMADA,
      comentarios,
    );

    return this.visitaRepo.create(nuevaVisita);
  }

  async cambiarEstado(id: string, estado: EstadoVisita) {
    return this.visitaRepo.updateEstado(id, estado);
  }

  async agregarComentario(id: string, comentario: string) {
    return this.visitaRepo.addComentario(id, comentario);
  }

  async listarPorCliente(clienteId: string) {
    return this.visitaRepo.findByCliente(clienteId);
  }
}

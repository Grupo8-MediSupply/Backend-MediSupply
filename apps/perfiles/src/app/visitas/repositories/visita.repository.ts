import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import {
  IVisitaRepository,
  VisitaCliente,
  EstadoVisita,
} from '@medi-supply/perfiles-dm';

@Injectable()
export class VisitaRepository implements IVisitaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async create(visita: VisitaCliente): Promise<VisitaCliente> {
    try {
      const [created] = await this.db('usuarios.visita_cliente')
        .insert({
          cliente_id: visita.clienteId,
          vendedor_id: visita.vendedorId,
          fecha_visita: visita.fechaVisita,
          estado: visita.estado,
          comentarios: visita.comentarios ?? null,
        })
        .returning('*');

      return new VisitaCliente({
        id: created.id,
        clienteId: created.cliente_id,
        vendedorId: created.vendedor_id,
        fechaVisita: created.fecha_visita,
        estado: created.estado,
        comentarios: created.comentarios,
      });
    } catch (error) {
      console.error('Error creando visita:', error);
      throw new InternalServerErrorException('Error al registrar la visita');
    }
  }

  async findByCliente(clienteId: string): Promise<VisitaCliente[]> {
    try {
      const visitas = await this.db('usuarios.visita_cliente')
        .where({ cliente_id: clienteId })
        .orderBy('fecha_visita', 'desc');

      return visitas.map((v) =>
        new VisitaCliente({
          id: v.id,
          clienteId: v.cliente_id,
          vendedorId: v.vendedor_id,
          fechaVisita: v.fecha_visita,
          estado: v.estado,
          comentarios: v.comentarios,
        })
      );
    } catch (error) {
      console.error('Error listando visitas:', error);
      throw new InternalServerErrorException('Error al listar visitas');
    }
  }

  async updateEstado(id: string, estado: EstadoVisita): Promise<void> {
    const updated = await this.db('usuarios.visita_cliente')
      .where({ id })
      .update({ estado, updated_at: this.db.fn.now() });

    if (updated === 0) throw new NotFoundException('Visita no encontrada');
  }

  async addComentario(id: string, comentarios: string): Promise<void> {
    const updated = await this.db('usuarios.visita_cliente')
      .where({ id })
      .update({ comentarios, updated_at: this.db.fn.now() });

    if (updated === 0) throw new NotFoundException('Visita no encontrada');
  }
}

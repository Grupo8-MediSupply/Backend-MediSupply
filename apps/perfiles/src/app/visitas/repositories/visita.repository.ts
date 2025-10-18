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

      return new VisitaCliente(
        created.id,
        created.cliente_id,
        created.vendedor_id,
        created.fecha_visita,
        created.estado,
        created.comentarios,
        created.created_at,
        created.updated_at,
      );
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

      return visitas.map(
        (v) =>
          new VisitaCliente(
            v.id,
            v.cliente_id,
            v.vendedor_id,
            v.fecha_visita,
            v.estado,
            v.comentarios,
            v.created_at,
            v.updated_at,
          ),
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

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
  RutaVisitaProgramada,
} from '@medi-supply/perfiles-dm';

@Injectable()
export class VisitaRepository implements IVisitaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  async updateEvidenciaVideo(id: string, urlVideo: string): Promise<void> {
    return await this.db('usuarios.visita_cliente')
      .where({ id })
      .update({ url_video: urlVideo, updated_at: this.db.fn.now() })
      .then((updated) => {
        if (updated === 0) {
          throw new NotFoundException('Visita no encontrada');
        }
      });
  }
  
  async findById(id: string): Promise<VisitaCliente | null> {
    return await this.db('usuarios.visita_cliente')
      .where({ id })
      .first()
      .then((v) => {
        if (!v) return null;
        return new VisitaCliente({
          id: v.id,
          clienteId: v.cliente_id,
          vendedorId: v.vendedor_id,
          fechaVisita: v.fecha_visita,
          estado: v.estado,
          comentarios: v.comentarios,
        });
      });
  }

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
  
  async findRutaPorFecha(
    vendedorId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<RutaVisitaProgramada[]> {
    type RutaRow = {
      id: string;
      cliente_id: string;
      fecha_visita: Date;
      estado: EstadoVisita;
      cliente_nombre: string;
      latitud: number | null;
      longitud: number | null;
    };

    try {
      const registros = (await this.db('usuarios.visita_cliente as vc')
        .select(
          'vc.id',
          'vc.cliente_id',
          'vc.fecha_visita',
          'vc.estado',
          this.db.raw('c.nombre as cliente_nombre'),
          this.db.raw('ST_Y(u.ubicacion::geometry) as latitud'),
          this.db.raw('ST_X(u.ubicacion::geometry) as longitud')
        )
        .join('usuarios.cliente as c', 'c.id', 'vc.cliente_id')
        .leftJoin('usuarios.usuario as u', 'u.id', 'c.id')
        .where('vc.vendedor_id', vendedorId)
        .andWhereBetween('vc.fecha_visita', [fechaInicio, fechaFin])
        .orderBy('vc.fecha_visita', 'asc')) as RutaRow[];

      return registros.map((row) => {
        const lat =
          row.latitud !== null && row.latitud !== undefined
            ? Number(row.latitud)
            : null;
        const lng =
          row.longitud !== null && row.longitud !== undefined
            ? Number(row.longitud)
            : null;

        return {
          visitaId: row.id,
          clienteId: row.cliente_id,
          fechaVisita: row.fecha_visita,
          estado: row.estado,
          nombreCliente: row.cliente_nombre,
          direccion:
            lat !== null && lng !== null
              ? `Lat: ${lat}, Lng: ${lng}`
              : null,
          latitud: lat,
          longitud: lng,
        };
      });
    } catch (error) {
      console.error('Error consultando la ruta de visitas:', error);
      throw new InternalServerErrorException(
        'Error al consultar la ruta de visitas'
      );
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

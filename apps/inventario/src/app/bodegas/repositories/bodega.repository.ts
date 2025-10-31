import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { Lote } from 'node_modules/@medi-supply/bodegas-dm/src/lib/entities/lote.entity';

export class BodegaRepository implements IBodegaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  async findLoteEnBodega(
    loteId: string,
    bodegaId: string
  ): Promise<Lote | null> {
    return await this.db('logistica.inventario as i')
      .join('logistica.lote as l', 'l.id', 'i.lote_id')
      .select(
        'l.id',
        'l.producto_regional_id as productoId',
        'l.cantidad_inicial as cantidad',
        'l.fecha_vencimiento as fechaVencimiento',
        'l.estado',
        'l.numero',
        'i.created_at as createdAt',
        'i.updated_at as updatedAt'
      )
      .where('l.id', loteId)
      .andWhere('i.bodega_id', bodegaId)
      .first();
  }

  findByPaisId(paisId: number): Promise<Bodega[]> {
    return this.db('logistica.bodega')
      .select(
        'id',
        'pais_id as paisId',
        'nombre',
        'ubicacion',
        'capacidad',
        'responsable',
        'created_at as createdAt',
        'updated_at as updatedAt',
        'estado'
      )
      .where({ pais_id: paisId })
      .then((rows) => rows.map((r) => new Bodega(r)));
  }

  async findAll(): Promise<Bodega[]> {
    try {
      const records = await this.db('logistica.bodega')
        .select(
          'id',
          'pais_id as paisId',
          'nombre',
          'ubicacion',
          'capacidad',
          'responsable',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .orderBy('nombre', 'asc');

      return records.map(
        (r) =>
          new Bodega({
            id: r.id,
            paisId: r.paisId,
            nombre: r.nombre,
            ubicacion: r.ubicacion,
            capacidad: r.capacidad,
            responsable: r.responsable,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            estado: r.estado,
          })
      );
    } catch (error) {
      console.error('❌ Error al consultar bodegas:', error);
      throw new InternalServerErrorException('Error al listar las bodegas');
    }
  }

  async findById(id: string): Promise<Bodega | null> {
    try {
      const record = await this.db('logistica.bodega')
        .select(
          'id',
          'pais_id as paisId',
          'nombre',
          'ubicacion',
          'capacidad',
          'responsable',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .where({ id })
        .first();

      if (!record) return null;

      return new Bodega({
        id: record.id,
        paisId: record.paisId,
        nombre: record.nombre,
        ubicacion: record.ubicacion,
        capacidad: record.capacidad,
        responsable: record.responsable,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        estado: record.estado,
      });
    } catch (error) {
      console.error('❌ Error al consultar bodega:', error);
      throw new InternalServerErrorException('Error al obtener la bodega');
    }
  }
}

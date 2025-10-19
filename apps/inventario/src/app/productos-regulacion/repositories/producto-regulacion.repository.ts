import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductoRegulacion, IProductoRegulacionRepository } from '@medi-supply/productos-dm';

@Injectable()
export class ProductoRegulacionRepository implements IProductoRegulacionRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async asociarRegulaciones(productoId: number, regulacionIds: string[]): Promise<ProductoRegulacion[]> {
    try {
      const inserted = await this.db('productos.producto_regulacion')
        .insert(
          regulacionIds.map((id) => ({
            producto_id: productoId,
            regulacion_id: id,
          })),
        )
        .returning(['id', 'producto_id', 'regulacion_id', 'fecha_asociacion', 'cumplimiento']);

      return inserted.map(
        (r) =>
          new ProductoRegulacion(
            r.id,
            r.producto_id,
            r.regulacion_id,
            r.fecha_asociacion,
            r.cumplimiento,
          ),
      );
    } catch (error) {
      console.error('❌ Error al asociar regulaciones:', error);
      throw new InternalServerErrorException('Error al asociar regulaciones al producto');
    }
  }

  async listarRegulacionesPorProducto(productoId: number): Promise<ProductoRegulacion[]> {
    try {
      const result = await this.db('productos.producto_regulacion')
        .select('*')
        .where({ producto_id: productoId });

      return result.map(
        (r) =>
          new ProductoRegulacion(r.id, r.producto_id, r.regulacion_id, r.fecha_asociacion, r.cumplimiento),
      );
    } catch (error) {
      console.error('❌ Error al listar regulaciones:', error);
      throw new InternalServerErrorException('Error al listar regulaciones asociadas');
    }
  }
}

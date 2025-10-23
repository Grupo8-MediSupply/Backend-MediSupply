import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Knex } from 'knex';
import {
  ProductoRegulacion,
  IProductoRegulacionRepository,
  RegulacionDetalle,
} from '@medi-supply/productos-dm';

@Injectable()
export class ProductoRegulacionRepository
  implements IProductoRegulacionRepository
{
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async asociarRegulaciones(
    productoId: string,
    regulacionIds: string[]
  ): Promise<ProductoRegulacion[]> {
    try {
      const inserted = await this.db('productos.producto_regulacion')
        .insert(
          regulacionIds.map((id) => ({
            producto_id: productoId,
            regulacion_id: id,
          }))
        )
        .returning([
          'id',
          'producto_id',
          'regulacion_id',
          'fecha_asociacion',
          'cumplimiento',
        ]);

      return inserted.map(
        (r) =>
          new ProductoRegulacion(
            r.id,
            r.producto_id,
            r.regulacion_id,
            r.fecha_asociacion,
            r.cumplimiento
          )
      );
    } catch (error) {
      console.error('❌ Error al asociar regulaciones:', error);
      throw new InternalServerErrorException(
        'Error al asociar regulaciones al producto'
      );
    }
  }

  async listarRegulacionesPorProducto(
  productoId: string
): Promise<RegulacionDetalle[]> {
  const result = await this.db('productos.producto_regulacion as pr')
    .join('regulacion.regulacion as r', 'pr.regulacion_id', 'r.id')
    .select(
      'pr.id',
      'pr.producto_id',
      'pr.regulacion_id',
      'pr.fecha_asociacion',
      'pr.cumplimiento',
      'r.nombre',
      'r.descripcion',
      'r.tipo_norma',
      'r.pais_id',
    )
    .where('pr.producto_id', productoId);

  return result.map(
    (r) =>
      new RegulacionDetalle(
        r.id,
        r.producto_id,
        r.regulacion_id,       
        r.fecha_asociacion,
        r.cumplimiento,
        r.nombre,              
        r.descripcion,
        r.tipo_norma,
        r.pais_id,
      ),
  );
}

}

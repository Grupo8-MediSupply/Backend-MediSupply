import {
  IProductoRepository,
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  ProductoVariant,
  ProductoInfoRegion
} from '@medi-supply/productos-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProductoRepository implements IProductoRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}


  async findByPais(regionId: number): Promise<ProductoInfoRegion[]> {
    const productos = await this.db('productos.producto_regional as pr')
  .join('productos.producto_global as pg', 'pg.id', 'pr.producto_global_id')
  .leftJoin('productos.equipo_medico as eq', 'eq.producto_global_id', 'pg.id')
  .leftJoin('productos.insumo_medico as ins', 'ins.producto_global_id', 'pg.id')
  .leftJoin('productos.medicamento as med', 'med.producto_global_id', 'pg.id')
  .select(
    'pg.sku',
    'pg.nombre',
    'pg.descripcion',
    'pr.precio',
    'pr.id as productoRegionalId',
    'pg.id as productoGlobalId',
    this.db.raw(`
      CASE
        WHEN eq.producto_global_id IS NOT NULL THEN 'EQUIPO_MEDICO'
        WHEN ins.producto_global_id IS NOT NULL THEN 'INSUMO_MEDICO'
        WHEN med.producto_global_id IS NOT NULL THEN 'MEDICAMENTO'
        ELSE 'DESCONOCIDO'
      END AS tipo
    `)
  )
  .where('pr.pais_id', regionId);
  return productos;
  }
  

  async create(producto: ProductoVariant): Promise<ProductoVariant> {
    return this.db.transaction(async (trx) => {
      try {
        // 1️⃣ Insertar en producto_global
        const [global] = await trx('productos.producto_global')
          .insert({
            sku: producto.sku,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
          })
          .returning([
            'id',
            'sku',
            'nombre',
            'descripcion',
            'created_at',
            'updated_at',
          ]);

        // 2️⃣ Insertar en tabla especializada según tipo
        if (producto instanceof ProductoMedicamento) {
          await trx('productos.medicamento').insert({
            producto_global_id: global.id,
            principio_activo: producto.principioActivo,
            concentracion: producto.concentracion,
            forma_farmaceutica: producto.formaFarmaceutica,
          });
        } else if (producto instanceof ProductoInsumoMedico) {
          await trx('productos.insumo_medico').insert({
            producto_global_id: global.id,
            material: producto.material,
            esteril: producto.esteril,
            uso_unico: producto.usoUnico,
          });
        } else if (producto instanceof ProductoEquipoMedico) {
          await trx('productos.equipo_medico').insert({
            producto_global_id: global.id,
            marca: producto.marca,
            modelo: producto.modelo,
            vida_util: producto.vidaUtil,
            requiere_mantenimiento: producto.requiereMantenimiento,
          });
        } else {
          throw new Error(`Tipo de producto no reconocido`);
        }

        // 3️⃣ Retornar instancia actualizada
        return Object.assign(Object.create(Object.getPrototypeOf(producto)), {
          ...producto,
          id: global.id,
        });
      } catch (error) {
        throw new InternalServerErrorException('Error al crear el producto.');
      }
    });
  }

  findById(id: number): Promise<ProductoVariant | null> {
    throw new Error('Method not implemented.');
  }
}

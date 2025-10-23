import {
  IProductoRepository,
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  ProductoVariant,
  ProductoInfoRegion,
} from '@medi-supply/productos-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProductoRepository implements IProductoRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async findByPais(regionId: number): Promise<ProductoInfoRegion[]> {
    const productos = await this.db('productos.producto_regional as pr')
      .join('productos.producto_global as pg', 'pg.id', 'pr.producto_global_id')
      .leftJoin(
        'productos.equipo_medico as eq',
        'eq.producto_global_id',
        'pg.id'
      )
      .leftJoin(
        'productos.insumo_medico as ins',
        'ins.producto_global_id',
        'pg.id'
      )
      .leftJoin(
        'productos.medicamento as med',
        'med.producto_global_id',
        'pg.id'
      )
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

  async create(producto: ProductoInfoRegion): Promise<ProductoInfoRegion> {
    return this.db.transaction(async (trx) => {

        // 1️⃣ Insertar en producto_global
        const [global] = await trx('productos.producto_global')
          .insert({
            sku: producto.productoGlobal.sku,
            nombre: producto.productoGlobal.nombre,
            descripcion: producto.productoGlobal.descripcion,
            tipo_producto: producto.productoGlobal.tipoProducto.toUpperCase(),
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
        if (producto.productoGlobal instanceof ProductoMedicamento) {
          await trx('productos.medicamento').insert({
            producto_global_id: global.id,
            principio_activo: producto.productoGlobal.principioActivo,
            concentracion: producto.productoGlobal.concentracion,
            forma_farmaceutica: producto.productoGlobal.formaFarmaceutica,
          });
        } else if (producto.productoGlobal instanceof ProductoInsumoMedico) {
          await trx('productos.insumo_medico').insert({
            producto_global_id: global.id,
            material: producto.productoGlobal.material,
            esteril: producto.productoGlobal.esteril,
            uso_unico: producto.productoGlobal.usoUnico,
          });
        } else if (producto.productoGlobal instanceof ProductoEquipoMedico) {
          await trx('productos.equipo_medico').insert({
            producto_global_id: global.id,
            marca: producto.productoGlobal.marca,
            modelo: producto.productoGlobal.modelo,
            vida_util: producto.productoGlobal.vidaUtil,
            requiere_mantenimiento: producto.productoGlobal.requiereMantenimiento,
          });
        } else {
          throw new Error(`Tipo de producto no reconocido`);
        }

        //Insertar en producto_regional con precio
        const [regionalId] = await trx('productos.producto_regional').insert({
          producto_global_id: global.id,
          pais_id: producto.detalleRegional.pais,
          precio: producto.detalleRegional.precio,
          proveedor_id: producto.detalleRegional.proveedor,
        }).returning('id');

        if (producto.detalleRegional.regulaciones.length > 0) {
          const rows = producto.detalleRegional.regulaciones.map((r) => ({
            producto_id: regionalId,
            regulacion_id: r,
          }));

          await trx('productos.producto_regulacion').insert(rows);
        }

        // 3️⃣ Retornar instancia actualizada
        return Object.assign(Object.create(Object.getPrototypeOf(producto)), {
          ...producto,
          id: regionalId,
        });

    });
  }

  async findById(id: number): Promise<ProductoVariant | null> {
    try {
      // 1️⃣ Consultar producto base
      const base = await this.db('productos.producto_global')
        .select('*')
        .where({ id })
        .first();

      if (!base) return null;

      // 2️⃣ Buscar detalle en tabla medicamento
      const medicamento = await this.db('productos.medicamento')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (medicamento) {
        return new ProductoMedicamento({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          principioActivo: medicamento.principio_activo,
          concentracion: medicamento.concentracion,
          formaFarmaceutica: medicamento.forma_farmaceutica,
          tipoProducto: base.tipo_producto,
        });
      }

      // 3️⃣ Buscar detalle en tabla insumo_medico
      const insumo = await this.db('productos.insumo_medico')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (insumo) {
        return new ProductoInsumoMedico({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          material: insumo.material,
          esteril: insumo.esteril,
          usoUnico: insumo.uso_unico,
          tipoProducto: base.tipo_producto,
        });
      }

      // 4️⃣ Buscar detalle en tabla equipo_medico
      const equipo = await this.db('productos.equipo_medico')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (equipo) {
        return new ProductoEquipoMedico({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          marca: equipo.marca,
          modelo: equipo.modelo,
          vidaUtil: equipo.vida_util,
          requiereMantenimiento: equipo.requiere_mantenimiento,
          tipoProducto: base.tipo_producto,
        });
      }

      // Si no está en ninguna tabla hija
      return null;
    } catch (error) {
      console.error('❌ Error al consultar producto por ID:', error);
      throw new InternalServerErrorException('Error al consultar el producto.');
    }
  }
}

import {
  IProductoRepository,
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  ProductoVariant,
  ProductoInfoRegion,
  TipoProducto,
} from '@medi-supply/productos-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProductoRepository implements IProductoRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async findByPais(regionId: number): Promise<ProductoInfoRegion[]> {
    const rows = await this.db('productos.producto_regional as pr')
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
        'pg.id as productoGlobalId',
        'pg.sku',
        'pg.nombre',
        'pg.descripcion',
        'pg.tipo_producto',
        'pr.id as productoRegionalId',
        'pr.precio',
        'pr.proveedor_id',
        'pr.pais_id',
        // Campos específicos de cada tipo:
        'eq.marca',
        'eq.modelo',
        'eq.vida_util',
        'eq.requiere_mantenimiento',
        'ins.material',
        'ins.esteril',
        'ins.uso_unico',
        'med.principio_activo',
        'med.concentracion'
      )
      .where('pr.pais_id', regionId);

    console.log(rows[0]);

    const mappedRows = rows.map((row) => {
      let productoGlobal;

      const tipo = (row.tipo_producto as string)?.toLowerCase();
      switch (tipo) {
        case TipoProducto.MEDICAMENTO:
          productoGlobal = new ProductoMedicamento({
            id: row.productoGlobalId,
            sku: row.sku,
            nombre: row.nombre,
            descripcion: row.descripcion,
            tipoProducto: row.tipo_producto,
            principioActivo: row.principio_activo,
            concentracion: row.concentracion,
          });
          break;

        case TipoProducto.INSUMO:
          productoGlobal = new ProductoInsumoMedico({
            id: row.productoGlobalId,
            sku: row.sku,
            nombre: row.nombre,
            descripcion: row.descripcion,
            tipoProducto: row.tipo_producto,
            material: row.material,
            esteril: row.esteril,
            usoUnico: row.uso_unico,
          });
          break;

        case TipoProducto.EQUIPO:
          productoGlobal = new ProductoEquipoMedico({
            id: row.productoGlobalId,
            sku: row.sku,
            nombre: row.nombre,
            descripcion: row.descripcion,
            tipoProducto: row.tipo_producto,
            marca: row.marca,
            modelo: row.modelo,
            vidaUtil: row.vida_util,
            requiereMantenimiento: row.requiere_mantenimiento,
          });
          break;

        default:
      }

      const detalleRegional = {
        id: row.productoRegionalId,
        pais: row.pais_id,
        proveedor: row.proveedor_id,
        precio: Number(row.precio),
        regulaciones: [], // si aún no las tienes, lo dejas vacío
      };

      return {
        productoGlobal,
        detalleRegional,
      } as ProductoInfoRegion;
    });

    return mappedRows;
  }

  async create(producto: ProductoInfoRegion): Promise<ProductoInfoRegion> {
    return this.db.transaction(async (trx) => {
      // 1️⃣ Insertar en producto_global
      //Buscar producto global existente por SKU
      const productoExistente = await this.findBySku(
        producto.productoGlobal.sku
      );

      let globalId: number;

      if (!productoExistente) {
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

        globalId = global.id;

        // 2️⃣ Insertar en tabla especializada según tipo
        if (producto.productoGlobal instanceof ProductoMedicamento) {
          await trx('productos.medicamento').insert({
            producto_global_id: globalId,
            principio_activo: producto.productoGlobal.principioActivo,
            concentracion: producto.productoGlobal.concentracion,
            forma_farmaceutica: producto.productoGlobal.formaFarmaceutica,
          });
        } else if (producto.productoGlobal instanceof ProductoInsumoMedico) {
          await trx('productos.insumo_medico').insert({
            producto_global_id: globalId,
            material: producto.productoGlobal.material,
            esteril: producto.productoGlobal.esteril,
            uso_unico: producto.productoGlobal.usoUnico,
          });
        } else if (producto.productoGlobal instanceof ProductoEquipoMedico) {
          await trx('productos.equipo_medico').insert({
            producto_global_id: globalId,
            marca: producto.productoGlobal.marca,
            modelo: producto.productoGlobal.modelo,
            vida_util: producto.productoGlobal.vidaUtil,
            requiere_mantenimiento:
              producto.productoGlobal.requiereMantenimiento,
          });
        } else {
          throw new Error(`Tipo de producto no reconocido`);
        }
      } else {
        globalId = productoExistente.productoGlobal.id!;
      }

      //Insertar en producto_regional con precio
      const [regionalId] = await trx('productos.producto_regional')
        .insert({
          producto_global_id: globalId,
          pais_id: producto.detalleRegional.pais,
          precio: producto.detalleRegional.precio,
          proveedor_id: producto.detalleRegional.proveedor,
        })
        .returning('id');

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

  async findBySku(sku: string): Promise<ProductoInfoRegion | null> {
    try {
      const producto = await this.db('productos.producto_global')
        .select('*')
        .where({ sku })
        .first();

      if (!producto) return null;

      const detalle = await this.db('productos.producto_regional')
        .select('*')
        .where({ producto_global_id: producto.id })
        .first();

      if (!detalle) return null;

      return {
        productoGlobal: producto,
        detalleRegional: detalle,
      };
    } catch (error) {
      console.error('❌ Error al consultar producto por SKU:', error);
      throw new InternalServerErrorException('Error al consultar el producto.');
    }
  }
}

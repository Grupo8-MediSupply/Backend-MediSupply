import {
  IProductoRepository,
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  ProductoInfoRegion,
  TipoProducto,
  ProductoDetalle,
  ProductoBodega,
  DetalleRegional,
} from '@medi-supply/productos-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { ProductoOrden } from 'libs/domain/ordenes-dm/src';

export class ProductoRepository implements IProductoRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  
  async findByLote(loteId: string): Promise<DetalleRegional | null> {
    const result = await this.db('logistica.lote as l')
      .select(
        'pr.id',
        'pr.pais_id as pais',
        'pr.proveedor_id as proveedor',
        'pr.precio'
      )
      .join('productos.producto_regional as pr', 'pr.id', 'l.producto_regional_id')
      .where('l.id', loteId)
      .first();

    return result || null;
  }

  async updateStock(productos: ProductoOrden[]): Promise<void> {
    if (!productos || productos.length === 0) return;

    // construimos los valores
    const values = productos
      .map((p) => `('${p.bodega}'::uuid, '${p.lote}'::uuid, ${p.cantidad})`)
      .join(',\n  ');

    await this.db.transaction(async (trx) => {
      // 1️⃣ Verificar stock insuficiente
      const sinStock = await trx.raw(`
      SELECT i.bodega_id, i.lote_id, i.cantidad_disponible, v.cantidad
      FROM logistica.inventario AS i
      JOIN (VALUES
        ${values}
      ) AS v(bodega_id, lote_id, cantidad)
      ON i.bodega_id = v.bodega_id AND i.lote_id = v.lote_id
      WHERE i.cantidad_disponible < v.cantidad;
    `);

      if (sinStock.rows.length > 0) {
        throw new Error(
          'Stock insuficiente para uno o más productos: ' +
            sinStock.rows
              .map((r) => `bodega=${r.bodega_id}, lote=${r.lote_id}`)
              .join('; ')
        );
      }

      // 2️⃣ Hacer el UPDATE en una sola operación
      const result = await trx.raw(`
      UPDATE logistica.inventario AS i
      SET cantidad_disponible = i.cantidad_disponible - v.cantidad,
          fecha_ultimo_movimiento = NOW(),
          updated_at = NOW()
      FROM (VALUES
        ${values}
      ) AS v(bodega_id, lote_id, cantidad)
      WHERE i.bodega_id = v.bodega_id
        AND i.lote_id = v.lote_id
      RETURNING i.bodega_id, i.lote_id, i.cantidad_disponible;
    `);

      if (result.rows.length === 0) {
        console.warn('⚠️ No se actualizó ningún inventario.');
      }

      // opcional: log
      // console.log('Inventario actualizado:', result.rows);
    });
  }

  async findByBodega(bodegaId: string): Promise<ProductoBodega[]> {
    return await this.db('logistica.inventario as inv')
      .leftJoin('logistica.lote as lote', 'lote.id', 'inv.lote_id')
      .leftJoin(
        'productos.producto_regional as pr',
        'pr.id',
        'lote.producto_regional_id'
      )
      .leftJoin(
        'productos.producto_global as pg',
        'pg.id',
        'pr.producto_global_id'
      )
      .select(
        'inv.bodega_id as BodegaId',
        'pg.nombre as nombreProducto',
        'inv.cantidad_disponible as cantidad',
        'lote.fecha_vencimiento as FechaVencimiento',
        'pg.sku as sku',
        'pr.id as productoRegionalId',
        'lote.numero as numeroLote',
        'lote.id as loteId'
      )
      .where('inv.bodega_id', bodegaId);
  }

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

  async findById(id: string, paisId: number): Promise<ProductoDetalle | null> {
    const producto = await this.db('productos.producto_regional as pr')
      .join('productos.producto_global as pg', 'pg.id', 'pr.producto_global_id')
      .leftJoin('usuarios.usuario as usu', 'usu.id', 'pr.proveedor_id')
      .leftJoin('geografia.pais as pais', 'pais.id', 'usu.pais_id')
      .leftJoin('usuarios.proveedor as prov', 'prov.id', 'usu.id')
      .select(
        'pg.id as productoGlobalId',
        'pg.sku',
        'pg.nombre',
        'pg.descripcion',
        this.db.raw('pg.tipo_producto::text as tipo'),
        'pr.id as productoRegionalId',
        'pr.precio',
        'prov.id as proveedorId',
        'prov.nombre as proveedorNombre',
        'pais.id as paisId',
        'pais.nombre as paisNombre',
        'pr.pais_id as productoPaisId'
      )
      .where('pr.id', id)
      .andWhere('pr.pais_id', paisId)
      .first();

    if (!producto) {
      return null;
    }

    const detalle: ProductoDetalle = {
      id: producto.productoRegionalId,
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      tipo: producto.tipo,
      precio: Number(producto.precio),
      proveedor: {
        id: producto.proveedorId,
        nombre: producto.proveedorNombre,
        pais: producto.paisNombre,
      },
      productoPaisId: producto.productoPaisId,
    };

    return detalle;
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

  async update(productoRegionalId: string, producto: ProductoInfoRegion): Promise<ProductoInfoRegion> {
    try {
      return await this.db.transaction(async (trx) => {
        const registro = await trx('productos.producto_regional')
          .select('producto_global_id')
          .where({ id: productoRegionalId })
          .first();

        if (!registro) {
          throw new InternalServerErrorException(
            'Producto no encontrado para actualizar.',
          );
        }

        const globalId = registro.producto_global_id;

        await trx('productos.producto_global')
          .update({
            sku: producto.productoGlobal.sku,
            nombre: producto.productoGlobal.nombre,
            descripcion: producto.productoGlobal.descripcion,
            tipo_producto: producto.productoGlobal.tipoProducto.toUpperCase(),
          })
          .where({ id: globalId });

        await trx('productos.medicamento')
          .where({ producto_global_id: globalId })
          .del();
        await trx('productos.insumo_medico')
          .where({ producto_global_id: globalId })
          .del();
        await trx('productos.equipo_medico')
          .where({ producto_global_id: globalId })
          .del();

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
        }

        await trx('productos.producto_regional')
          .update({
            precio: producto.detalleRegional.precio,
            proveedor_id: producto.detalleRegional.proveedor,
            pais_id: producto.detalleRegional.pais,
          })
          .where({ id: productoRegionalId });

        await trx('productos.producto_regulacion')
          .where({ producto_id: productoRegionalId })
          .del();

        if (producto.detalleRegional.regulaciones?.length) {
          const rows = producto.detalleRegional.regulaciones.map(
            (regulacionId) => ({
              producto_id: productoRegionalId,
              regulacion_id: regulacionId,
            }),
          );

          await trx('productos.producto_regulacion').insert(rows);
        }

        return {
          productoGlobal: producto.productoGlobal,
          detalleRegional: {
            ...producto.detalleRegional,
            id: productoRegionalId,
          },
        };
      });
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      throw new InternalServerErrorException(
        'Error al actualizar la información del producto.',
      );
    }
  }
  
}

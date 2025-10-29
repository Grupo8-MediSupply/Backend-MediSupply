import { IOrdenesRepository, Orden, ProductoOrden } from '@medi-supply/ordenes-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { DomainException } from '@medi-supply/core';

export class OrdenesRepository implements IOrdenesRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden> {
    return this.db.transaction(async (trx) => {
      // 1️⃣ Verificar que la orden exista
      const existente = await trx('pedidos.orden').where({ id }).first();
      if (!existente) {
        throw new DomainException('La orden no existe', 'ORDEN_NO_ENCONTRADA');
      }

      // 2️⃣ Construir los cambios sobre la orden
      const cambiosOrden: Record<string, any> = {};
      if (cambios.estado) cambiosOrden.estado = cambios.estado;


      let productosPlano: ProductoOrden[] = [];

      // 3️⃣ Si llegan productos, los insertamos como nuevos detalles
      if (cambios.productos?.length) {
        productosPlano = cambios.productos.map((p) => ({
          lote: p.lote,
          cantidad: p.cantidad,
          bodega: p.bodega,
          precioUnitario: p.precioUnitario ?? 0,
          productoRegional: p.productoRegional ?? undefined,
        }));

        // Calcular total parcial
        const total = productosPlano.reduce(
          (acc, p) => acc + p.cantidad * (p.precioUnitario ?? 0),
          existente.total ?? 0
        );

        // // Actualizar el snapshot de productos si aún no estaba definido
        // const snapshotExistente = existente.productos_snapshot
        //   ? JSON.parse(existente.productos_snapshot)
        //   : [];
        // const nuevoSnapshot = [...snapshotExistente, ...productosPlano];

        cambiosOrden.total = total;
        // cambiosOrden.productos_snapshot = JSON.stringify(nuevoSnapshot);

        // Insertar los nuevos productos
        await trx('pedidos.orden_detalle').insert(
          productosPlano.map((p) => ({
            orden_id: id,
            lote_id: p.lote,
            bodega_id: p.bodega,
            producto_regional_id: p.productoRegional,
            cantidad: p.cantidad,
            precio_unitario: p.precioUnitario,
          }))
        );
      }

      // 4️⃣ Actualizar cabecera de la orden
      const [actualizada] = await trx('pedidos.orden')
        .where({ id })
        .update(cambiosOrden)
        .returning('*');

      // 5️⃣ Retornar entidad reconstruida
      return new Orden({
        id: actualizada.id,
        cliente: actualizada.cliente_id,
        vendedor: actualizada.vendedor_id,
        estado: actualizada.estado,
        productos: actualizada.productos_snapshot ?? '[]',
      });
    });
  }

  crearOrden(orden: Orden): Promise<Orden> {
    throw new Error('Method not implemented.');
  }

  buscarOrdenes(filtros: any): Promise<Orden[]> {
    throw new Error('Method not implemented.');
  }
}

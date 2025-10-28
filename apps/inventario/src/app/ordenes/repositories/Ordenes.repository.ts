import { IOrdenesRepository, Orden } from '@medi-supply/ordenes-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

export class OrdenesRepository implements IOrdenesRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  actualizarOrden(id: string, cambios: Partial<Orden>): Promise<Orden> {
    throw new Error('Method not implemented.');
  }
  buscarOrdenes(filtros: any): Promise<Orden[]> {
    throw new Error('Method not implemented.');
  }

  async crearOrden(orden: Orden): Promise<Orden> {
    // Convierte los productos a objetos puros
    const productosPlano = orden.productos.map((p) => ({
      lote: p.lote,
      cantidad: p.cantidad,
      bodega: p.bodega,
    }));

    console.log('productosPlano:', productosPlano);
    console.log(
      'JSON.stringify(productosPlano):',
      JSON.stringify(productosPlano)
    );

    const [nuevoRegistro] = await this.db('pedidos.orden')
      .insert({
        id: orden.id,
        cliente_id: orden.cliente,
        vendedor_id: orden.vendedor || null,
        total: 0,
        productos_snapshot: this.db.raw('?::jsonb', [
          JSON.stringify(productosPlano),
        ]), // ✅ ahora sí será JSON válido
      })
      .returning('*');

    return new Orden({
      id: nuevoRegistro.id,
      cliente: nuevoRegistro.cliente_id,
      vendedor: nuevoRegistro.vendedor_id,
      productos: nuevoRegistro.productos_snapshot,
      estado: nuevoRegistro.estado,
    });
  }
}

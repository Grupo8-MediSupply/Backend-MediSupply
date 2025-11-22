import {
  FiltrosEntrega,
  HistorialVenta,
  InformacionGeneralOrden,
  IOrdenesRepository,
  Orden,
  OrdenEntrega,
  ProductoOrden,
  RutaGenerada,
  Vehiculo,
} from '@medi-supply/ordenes-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { Ubicacion } from 'libs/domain/core/src';

export class OrdenesRepository implements IOrdenesRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  obtenerOrdenesParaEntregar(filtros: FiltrosEntrega): Promise<OrdenEntrega[]> {
    throw new Error('Method not implemented.');
  }
  obtenerVehiculoMasCercano(bodegas: Ubicacion[]): Promise<Vehiculo | null> {
    throw new Error('Method not implemented.');
  }
  guardarRutaDeReparto(vehiculoId: string, ruta: RutaGenerada): Promise<string> {
    throw new Error('Method not implemented.');
  }
  buscarOrdenPorId(ordenId: string): Promise<Orden | null> {
    throw new Error('Method not implemented.');
  }
  buscarRutaPorOrdenId(ordenId: string): Promise<RutaGenerada | null> {
    throw new Error('Method not implemented.');
  }
  obtenerOrdenesPorCliente(clienteId: string): Promise<InformacionGeneralOrden[]> {
    throw new Error('Method not implemented.');
  }
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
      precioUnitario: p.precioUnitario ?? 0,
      productoRegional: p.productoRegional ?? undefined,
    }));

    const [nuevoRegistro] = await this.db('pedidos.orden')
      .insert({
        id: orden.id,
        cliente_id: orden.cliente,
        vendedor_id: orden.vendedor || null,
        total: productosPlano.reduce((acc, p) => acc + p.cantidad * p.precioUnitario, 0),
        productos_snapshot: this.db.raw('?::jsonb', [
          JSON.stringify(productosPlano),
        ]), // ✅ ahora sí será JSON válido
        pais_id: orden.pais,
      })
      .returning('*');

    return new Orden({
      id: nuevoRegistro.id,
      cliente: nuevoRegistro.cliente_id,
      vendedor: nuevoRegistro.vendedor_id,
      productos: nuevoRegistro.productos_snapshot,
      estado: nuevoRegistro.estado,
      pais: nuevoRegistro.pais_id,
    });
  }

  async obtenerHistorialVentasPorCliente(
    vendedorId: string,
    clienteId: string
  ): Promise<HistorialVenta[]> {
    const rows = await this.db('pedidos.orden as o')
      .select(
        'o.id',
        'o.estado',
        'o.total',
        'o.created_at',
        'o.updated_at',
        'o.productos_snapshot',
        'o.cliente_id',
        'o.vendedor_id'
      )
      .where('o.vendedor_id', vendedorId)
      .andWhere('o.cliente_id', clienteId)
      .orderBy('o.created_at', 'desc');

    return rows.map((row) => ({
      ordenId: row.id,
      clienteId: row.cliente_id,
      vendedorId: row.vendedor_id ?? undefined,
      estado: row.estado,
      total: Number(row.total ?? 0),
      fechaCreacion: this.toDate(row.created_at),
      fechaActualizacion: this.toDate(row.updated_at),
      productos: this.parseProductosSnapshot(row.productos_snapshot),
    }));
  }

  private parseProductosSnapshot(snapshot: unknown): ProductoOrden[] {
    if (!snapshot) {
      return [];
    }

    if (Array.isArray(snapshot)) {
      return snapshot.map((producto) => this.normalizeProducto(producto));
    }

    if (typeof snapshot === 'string') {
      try {
        const parsed = JSON.parse(snapshot);
        return Array.isArray(parsed)
          ? parsed.map((producto) => this.normalizeProducto(producto))
          : [];
      } catch (error) {
        return [];
      }
    }

    if (typeof snapshot === 'object') {
      return Object.values(snapshot as Record<string, unknown>)
        .filter((value) => typeof value === 'object' && value !== null)
        .map((producto) => this.normalizeProducto(producto));
    }

    return [];
  }

  private normalizeProducto(producto: unknown): ProductoOrden {
    const record = producto as Record<string, unknown>;
    const cantidad = Number(record.cantidad ?? 0);
    const rawPrecioUnitario =
      record.precioUnitario ?? record.precio_unitario ?? undefined;
    const rawProductoRegional =
      record.productoRegional ?? record.producto_regional ?? undefined;
    const rawBodega = record.bodega;

    const precioUnitario =
      rawPrecioUnitario === null || rawPrecioUnitario === undefined
        ? undefined
        : Number(rawPrecioUnitario);
    const productoRegional =
      rawProductoRegional === null || rawProductoRegional === undefined
        ? undefined
        : String(rawProductoRegional);

    return {
      lote: String(record.lote ?? ''),
      cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
      bodega:
        typeof rawBodega === 'string'
          ? rawBodega
          : rawBodega === null || rawBodega === undefined
            ? ''
            : String(rawBodega),
      precioUnitario,
      productoRegional,
    };
  }

  private toDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }
}

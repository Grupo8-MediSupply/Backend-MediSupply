import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import type { ReporteVendedorQueryDto } from '../dtos/request/reporte-vendedor.query.dto';

export interface ReporteVendedorRow {
  vendedorId: string;
  vendedorNombre: string | null;
  planId: string | null;
  planNombre: string | null;
  ventasTotales: string | number;
  pedidosGestionados: string | number;
  valorPromedioPedido: string | number;
}

export interface IReportesRepository {
  obtenerReporteVendedores(
    filtros: ReporteVendedorQueryDto,
  ): Promise<ReporteVendedorRow[]>;
}

@Injectable()
export class ReportesRepository implements IReportesRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async obtenerReporteVendedores(
    filtros: ReporteVendedorQueryDto,
  ): Promise<ReporteVendedorRow[]> {
    const query = this.db('pedidos.orden as o')
      .leftJoin('pedidos.orden_detalle as od', 'od.orden_id', 'o.id')
      .leftJoin('usuarios.vendedor as v', 'v.id', 'o.vendedor_id')
      .leftJoin('ventas.plan_venta as pv', 'pv.id', 'o.plan_venta_id')
      .leftJoin('ventas.plan_producto as pp', function joinPlanProducto() {
        this.on('pp.plan_id', '=', 'pv.id');
        this.on('pp.producto_regional_id', '=', 'od.producto_regional_id');
      })
      .leftJoin('productos.producto_regional as pr', 'pr.id', 'od.producto_regional_id')
      .leftJoin('productos.producto_global as pg', 'pg.id', 'pr.producto_global_id')
      .select({
        vendedorId: 'v.id',
        vendedorNombre: 'v.nombre',
        planId: 'pv.id',
        planNombre: 'pv.nombre',
      })
      .select(
        this.db.raw(
          'COALESCE(SUM(od.cantidad * od.precio_unitario), 0) AS ventas_totales',
        ),
      )
      .select(
        this.db.raw('COUNT(DISTINCT o.id) AS pedidos_gestionados'),
      )
      .select(
        this.db.raw(
          'CASE WHEN COUNT(DISTINCT o.id) = 0 THEN 0 ELSE COALESCE(SUM(od.cantidad * od.precio_unitario) / NULLIF(COUNT(DISTINCT o.id), 0), 0) END AS valor_promedio_pedido',
        ),
      )
      .groupBy('v.id', 'v.nombre', 'pv.id', 'pv.nombre');

    if (filtros.vendedorId) {
      query.where('o.vendedor_id', filtros.vendedorId);
    }

    if (filtros.planId) {
      query.where('o.plan_venta_id', filtros.planId);
    }

    if (filtros.productoId) {
      query.where(function productFilter() {
        this.where('pr.id', filtros.productoId).orWhere(
          'pg.id',
          filtros.productoId,
        );
      });
    }

    if (filtros.fechaInicio) {
      query.where('o.created_at', '>=', filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      query.where('o.created_at', '<=', filtros.fechaFin);
    }

    return query;
  }
}

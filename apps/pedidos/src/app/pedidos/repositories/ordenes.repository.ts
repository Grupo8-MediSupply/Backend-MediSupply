import {
  BodegaOrigen,
  FiltrosEntrega,
  IOrdenesRepository,
  Orden,
  OrdenEntrega,
  ProductoOrden,
  RutaGenerada,
  RutaVehiculo,
  Vehiculo,
} from '@medi-supply/ordenes-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { DomainException, Ubicacion } from '@medi-supply/core';

export class OrdenesRepository implements IOrdenesRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  async buscarRutaPorOrdenId(ordenId: string): Promise<RutaGenerada | null> {
    const consulta = await this.db('logistica.rutas as r')
      .join('pedidos.orden as o', 'o.ruta_id', 'r.id')
      .select('r.ruta_json', 'r.id')
      .where('o.id', ordenId)
      .first();

    if (!consulta.ruta_json) {
      return null;
    }

    return {
      vehiculoId: consulta.ruta_json.vehiculoId,
      ordenesIds: consulta.ruta_json.ordenesIds,
      distancia: consulta.ruta_json.distancia,
      duracion: consulta.ruta_json.duracion,
      polilinea: consulta.ruta_json.polilinea,
      legs: consulta.ruta_json.legs,
      rutaId: consulta.id,
    };
  }

  async obtenerVehiculoMasCercano(
    bodegas: Ubicacion[]
  ): Promise<Vehiculo | null> {
    if (!bodegas.length) return null;

    const values = bodegas
      .map(
        (b) => `(ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geography)`
      )
      .join(',');

    const query = `
    SELECT
      v.id,
      v.marca,
      v.modelo,
      v.placa,
      v.pais_id,
      ST_Y(v.ubicacion::geometry) AS lat,
      ST_X(v.ubicacion::geometry) AS lng,
      AVG(ST_Distance(v.ubicacion::geography, b.ubicacion)) AS distancia_promedio
    FROM logistica.vehiculo v
    CROSS JOIN (VALUES ${values}) AS b(ubicacion)
    WHERE v.activo = true
    GROUP BY v.id, v.marca, v.modelo, v.placa
    ORDER BY distancia_promedio ASC
    LIMIT 1;
  `;

    const result = await this.db.raw(query);
    const vehiculo = result.rows?.[0];

    if (!vehiculo) return null;

    return new Vehiculo({
      id: vehiculo.id,
      placa: vehiculo.placa,
      modelo: vehiculo.modelo,
      pais: vehiculo.pais_id,
      ubicacionGeografica: { lat: vehiculo.lat, lng: vehiculo.lng },
    });
  }

  async obtenerOrdenesParaEntregar(
    filtros: FiltrosEntrega
  ): Promise<OrdenEntrega[]> {
    // 1️⃣ Buscar las órdenes que cumplen los filtros
    const ordenes = await this.db('pedidos.orden as o')
      .join('usuarios.usuario as u', 'u.id', 'o.cliente_id')
      .join('usuarios.cliente as c', 'c.id', 'u.id')
      .select(
        'o.id as orden_id',
        'o.cliente_id',
        'c.nombre',
        'o.estado',
        this.db.raw(`
      CASE 
        WHEN u.ubicacion IS NOT NULL 
        THEN ST_X(u.ubicacion::geometry)
        ELSE NULL 
      END as cliente_lng
    `),
        this.db.raw(`
      CASE 
        WHEN u.ubicacion IS NOT NULL 
        THEN ST_Y(u.ubicacion::geometry)
        ELSE NULL 
      END as cliente_lat
    `)
      )
      .where('o.estado', 'RECIBIDO')
      .andWhere('o.pais_id', filtros.paisId)
      .andWhere('o.ruta_id', null)
      .modify((qb) => {
        if (filtros.fechaInicio && filtros.fechaFin) {
          qb.andWhereBetween('o.created_at', [
            filtros.fechaInicio,
            filtros.fechaFin,
          ]);
        }
      });

    if (!ordenes.length) return [];

    // 2️⃣ Obtener las bodegas relacionadas por orden
    const ordenIds = ordenes.map((o) => o.orden_id);

    const detalles = await this.db('pedidos.orden_detalle as od')
      .join('logistica.bodega as b', 'b.id', 'od.bodega_id')
      .select(
        'od.orden_id',
        'b.id as bodega_id',
        this.db.raw(`
      CASE 
        WHEN b.ubicacion IS NOT NULL 
          AND b.ubicacion != '' 
        THEN ST_X(b.ubicacion_geografica::geometry)
        ELSE NULL 
      END as bodega_lng
    `),
        this.db.raw(`
      CASE 
        WHEN b.ubicacion IS NOT NULL 
          AND b.ubicacion != '' 
        THEN ST_Y(b.ubicacion_geografica::geometry)
        ELSE NULL 
      END as bodega_lat
    `)
      )
      .whereIn('od.orden_id', ordenIds);

    // 3️⃣ Agrupar bodegas por orden
    const bodegasPorOrden = detalles.reduce<Record<string, BodegaOrigen[]>>(
      (acc, det) => {
        if (!acc[det.orden_id]) acc[det.orden_id] = [];
        acc[det.orden_id].push({
          id: det.bodega_id,
          ubicacion: {
            lat: det.bodega_lat,
            lng: det.bodega_lng,
          },
        });
        return acc;
      },
      {}
    );

    // 4️⃣ Armar estructura final del resultado
    return ordenes.map((o) => ({
      id: o.orden_id,
      estado: o.estado,
      cliente: {
        id: o.cliente_id,
        ubicacion: {
          lat: o.cliente_lat,
          lng: o.cliente_lng,
        },
        nombre: o.nombre,
      },
      bodegasOrigen: bodegasPorOrden[o.orden_id] ?? [],
    }));
  }

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
      if (cambios.ruta_id) cambiosOrden.ruta_id = cambios.ruta_id;

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
        cambiosOrden.vehiculo_asignado = cambios.vehiculoAsignado ?? null;
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
        ruta_id: actualizada.ruta_id ?? undefined,
      });
    });
  }

  crearOrden(orden: Orden): Promise<Orden> {
    throw new Error('Method not implemented.');
  }

  buscarOrdenes(filtros: any): Promise<Orden[]> {
    throw new Error('Method not implemented.');
  }

  async guardarRutaDeReparto(vehiculoId:string, ruta:RutaGenerada): Promise<string> {
    const [id] = await this.db('logistica.rutas').insert({
      vehiculo_id: vehiculoId,
      ruta_json: JSON.stringify(ruta),
    }).returning('id');
    return id.id;
  }

  async buscarOrdenPorId(ordenId:string): Promise<Orden | null> {
    const resultado = await this.db('pedidos.orden')
      .where({ id: ordenId })
      .first();

    if (!resultado) {
      return null;
    }

    return new Orden({
      id: resultado.id,
      cliente: resultado.cliente_id,
      vendedor: resultado.vendedor_id,
      estado: resultado.estado,
      productos: resultado.productos_snapshot ?? '[]',
      ruta_id: resultado.ruta_id ?? undefined,
    });
  }

}

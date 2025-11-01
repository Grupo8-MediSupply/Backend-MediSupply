import { Inject, Injectable } from '@nestjs/common';
import { HttpManagerService } from '@medi-supply/shared';
import {
  EstadoOrden,
  FiltrosEntrega,
  type IOrdenesRepository,
  Orden,
  ProductoOrden,
  RutasService,
  RutaVehiculo,
} from '@medi-supply/ordenes-dm';
import { ConfigService } from '@nestjs/config';
import { RepartoOrden } from '@medi-supply/ordenes-dm';

@Injectable()
export class PedidosService {
  private readonly inventarioServiceUrl: string;

  constructor(
    private httpCall: HttpManagerService,
    private readonly config: ConfigService,
    @Inject('IOrdenesRepository') private ordenesRepository: IOrdenesRepository,
    private readonly rutasService: RutasService
  ) {
    this.inventarioServiceUrl = this.config.get<string>(
      'INVENTARIO_SERVICE_URL',
      'http://localhost:3002/api/v1'
    );
  }

  async reducirStockProductos(productos: ProductoOrden[]): Promise<void> {
    await this.httpCall.post<void>(
      `${this.inventarioServiceUrl}/producto/actualizar-stock`,
      productos,
      {
        headers: {
          Authorization: `Bearer ${this.config.get<string>('INTERNAL_SECRET')}`,
        },
      }
    );
  }

  async ActualizarOrden(orden: Orden) {
    const actualizada = new Orden({
      id: orden.id,
      cliente: orden.cliente,
      vendedor: orden.vendedor,
      estado: EstadoOrden.RECIBIDO,
      productos: orden.productos,
    });
    await this.ordenesRepository.actualizarOrden(orden.id, actualizada);
    await this.reducirStockProductos(orden.productos);
  }

  async ObtenerOrdenesParaEntregar(
    paisId: number,
    fechaInicio?: string,
    fechaFin?: string
  ) {
    const filtros: FiltrosEntrega = { paisId, fechaInicio, fechaFin };

    const ordenesParaEntregar =
      await this.ordenesRepository.obtenerOrdenesParaEntregar(filtros);

    if (!ordenesParaEntregar.length) {
      return [];
    }

    const ordenesReparto: RepartoOrden[] = [];

    for (const orden of ordenesParaEntregar) {
      const bodegas = orden.bodegasOrigen.map((b) => b.ubicacion);

      if (!bodegas.length) {
        continue;
      }

      const vehiculo = await this.ordenesRepository.obtenerVehiculoMasCercano(
        bodegas
      );
      if (!vehiculo) {
        continue;
      }

      ordenesReparto.push({
        orden: orden,
        vehiculoAsignado: vehiculo,
      });
    }

    return ordenesReparto;
  }

  async GenerarRutasDeReparto(repartoOrdenes: RepartoOrden[]) {
    const rutas = agruparPorVehiculo(repartoOrdenes);

    const resultados = [];

    for (const ruta of rutas) {
      
      const r = await this.rutasService.generarRuta(
        ruta.origen,
        ruta.bodegas,
        ruta.clientes
      );
      for (const ordenId of ruta.ordenesIds) {
        await this.ordenesRepository.guardarRutaDeReparto(
          ruta.vehiculoId,
          ordenId,
          ruta
        );
        await this.ordenesRepository.actualizarOrden(ordenId, { estado: EstadoOrden.ENVIADO });
      }
      resultados.push(r);
    }

    return resultados;
  }
}

function agruparPorVehiculo(pedidos: RepartoOrden[]): RutaVehiculo[] {
  const mapaVehiculos = new Map<string, RutaVehiculo>();

  for (const pedido of pedidos) {
    const v = pedido.vehiculoAsignado;
    if (!mapaVehiculos.has(v.id)) {
      mapaVehiculos.set(v.id, {
        vehiculoId: v.id,
        placa: v.placa,
        modelo: v.modelo,
        origen: v.ubicacionGeografica,
        bodegas: [],
        clientes: [],
        ordenesIds: [],
      });
    }

    const grupo = mapaVehiculos.get(v.id)!;

    const ordenId = pedido.orden.id;
    if (!grupo.ordenesIds.includes(ordenId)) {
      grupo.ordenesIds.push(ordenId);
    }

    for (const bodega of pedido.orden.bodegasOrigen) {
      const existe = grupo.bodegas.some(
        (b) => b.lat === bodega.ubicacion.lat && b.lng === bodega.ubicacion.lng,
      );
      if (!existe) grupo.bodegas.push(bodega.ubicacion);
    }

    const cliente = pedido.orden.cliente;
    const existeCliente = grupo.clientes.some(
      (c) => c.lat === cliente.ubicacion.lat && c.lng === cliente.ubicacion.lng,
    );
    if (!existeCliente) grupo.clientes.push(cliente.ubicacion);
  }

  return Array.from(mapaVehiculos.values());
}

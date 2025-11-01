import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpManagerService } from '@medi-supply/shared';
import {
  EstadoOrden,
  FiltrosEntrega,
  type IOrdenesRepository,
  Orden,
  ProductoOrden,
  RutaGenerada,
  RutasService,
  RutaVehiculo,
} from '@medi-supply/ordenes-dm';
import { ConfigService } from '@nestjs/config';
import { RepartoOrden } from '@medi-supply/ordenes-dm';

@Injectable()
export class PedidosService {
  private readonly inventarioServiceUrl: string;
  private readonly logger = new Logger(PedidosService.name);

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

  async GenerarRutasDeReparto(
    repartoOrdenes: RepartoOrden[]
  ): Promise<RutaGenerada[]> {
    // 1️⃣ Primero verificamos cuáles órdenes ya tienen ruta asignada
    const resultadosOrdenes = await Promise.all(
      repartoOrdenes.map(async (ro) => {
        const orden = await this.ordenesRepository.buscarOrdenPorId(
          ro.orden.id
        );
        return {
          ro,
          tieneRuta: !!orden?.ruta_id,
        };
      })
    );

    // Luego filtramos fuera las que ya tienen ruta
    const filtrarOrdenesSinRuta = resultadosOrdenes
      .filter((r) => !r.tieneRuta)
      .map((r) => r.ro);

    // Agrupamos por vehículo
    const rutas = agruparPorVehiculo(filtrarOrdenesSinRuta);

    // Ejecutamos todas las rutas en paralelo
    const resultados = await Promise.all(
      rutas.map(async (ruta) => {
        try {
          const r = await this.rutasService.generarRuta(
            ruta.origen,
            ruta.bodegas,
            ruta.clientes
          );

          if (!r) {
            return null; // no se encontró ruta
          }

          const rutaGenerada: RutaGenerada = {
            vehiculoId: ruta.vehiculoId,
            ordenesIds: ruta.ordenesIds,
            distancia: r.distancia || 0,
            duracion: r.duracion?.seconds || 0,
            polilinea: r.polilinea || '',
            legs: r.legs || [],
          };

          const rutaId = await this.ordenesRepository.guardarRutaDeReparto(
            ruta.vehiculoId,
            rutaGenerada
          );

          // Actualizamos las órdenes en paralelo también
          await Promise.all(
            ruta.ordenesIds.map((ordenId) =>
              this.ordenesRepository.actualizarOrden(ordenId, {
                estado: EstadoOrden.ENVIADO,
                ruta_id: rutaId,
              })
            )
          );

          const rutaRetornar: RutaGenerada = {
            vehiculoId: ruta.vehiculoId,
            rutaId: rutaId,
            ordenesIds: ruta.ordenesIds,
            distancia: r.distancia || 0,
            duracion: r.duracion?.seconds || 0,
            polilinea: r.polilinea || '',
            legs: r.legs || [],
          };

          return rutaRetornar;
        } catch (error) {
          this.logger.error(
            `Error generando ruta para vehículo ${ruta.vehiculoId}:`,
            error
          );
          return null;
        }
      })
    );

    const rutasGeneradas = resultados.filter((r) => r !== null);

    // 2️⃣ Si tienes un arreglo de órdenes (por ejemplo, repartoOrdenes), filtra las que ya tienen ruta
    const rutasGuardadas: RepartoOrden[] = resultadosOrdenes
      .filter((r) => r.tieneRuta)
      .map((r) => r.ro);

    // 3️⃣ Obtener las rutas desde la base de datos en paralelo
    const rutasDesdeDb: RutaGenerada[] = (
      await Promise.all(
        rutasGuardadas.map(async (rg) => {
          const rutaVehiculo =
            await this.ordenesRepository.buscarRutaPorOrdenId(rg.orden.id);
          if (!rutaVehiculo) return null;

          // 🔁 Adaptamos el resultado a RutaGenerada
          return {
            vehiculoId: rutaVehiculo.vehiculoId,
            ordenesIds: [rg.orden.id],
            distancia: rutaVehiculo.distancia || 0,
            duracion: rutaVehiculo.duracion || 0,
            polilinea: rutaVehiculo.polilinea || '',
            legs: rutaVehiculo.legs || [],
            rutaId: rutaVehiculo.rutaId,
          } as RutaGenerada;
        })
      )
    )
      .filter((r): r is RutaGenerada => r !== null)
      .filter(
        ((set) => (r) => {
          const exists = set.has(r.rutaId);
          set.add(r.rutaId);
          return !exists;
        })(new Set<string>())
      ); 

    // 4️⃣ Retornar las rutas generadas (podrías también combinar con las rutasDesdeDb si quieres)
    return [...rutasGeneradas, ...rutasDesdeDb];
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
        (b) => b.lat === bodega.ubicacion.lat && b.lng === bodega.ubicacion.lng
      );
      if (!existe) grupo.bodegas.push(bodega.ubicacion);
    }

    const cliente = pedido.orden.cliente;
    const existeCliente = grupo.clientes.some(
      (c) => c.lat === cliente.ubicacion.lat && c.lng === cliente.ubicacion.lng
    );
    if (!existeCliente) grupo.clientes.push(cliente.ubicacion);
  }

  return Array.from(mapaVehiculos.values());
}

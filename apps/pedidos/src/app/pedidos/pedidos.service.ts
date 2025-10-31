import { Inject, Injectable } from '@nestjs/common';
import { HttpManagerService } from '@medi-supply/shared';
import {
  EstadoOrden,
  FiltrosEntrega,
  type IOrdenesRepository,
  Orden,
  ProductoOrden,
} from '@medi-supply/ordenes-dm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PedidosService {
  private readonly inventarioServiceUrl: string;

  constructor(
    private httpCall: HttpManagerService,
    private readonly config: ConfigService,
    @Inject('IOrdenesRepository') private ordenesRepository: IOrdenesRepository
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

    // 1️⃣ Obtener las órdenes con sus bodegas y ubicaciones
    const ordenesParaEntregar =
      await this.ordenesRepository.obtenerOrdenesParaEntregar(filtros);

    // 2️⃣ Si no hay órdenes, devolvemos vacío
    if (!ordenesParaEntregar.length) {
      return [];
    }

    // 3️⃣ Procesar cada orden y asignar vehículo más cercano
    const resultado = [];

    for (const orden of ordenesParaEntregar) {
      const bodegas = orden.bodegasOrigen.map((b) => b.ubicacion);

      // Si no hay bodegas con ubicación, no intentamos calcular
      if (!bodegas.length) {
        resultado.push({
          ...orden,
          vehiculoAsignado: null,
        });
        continue;
      }

      // Buscar el vehículo más cercano promedio
      const vehiculo = await this.ordenesRepository.obtenerVehiculoMasCercano(
        bodegas
      );

      resultado.push({
        ...orden,
        vehiculoAsignado: vehiculo ?? null,
      });
    }

    // 4️⃣ Retornar el resultado final
    return resultado;
  }
}

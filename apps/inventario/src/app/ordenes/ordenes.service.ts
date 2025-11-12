import { Inject, Injectable } from '@nestjs/common';
import { CrearOrdenDto, OrdenCreadaDto } from './dtos/crear-orden.dto';
import { HistorialOrdenResponseDto } from './dtos/historial-orden.response.dto';
import {
  type IOrdenesRepository,
  Orden,
  ProductoOrden,
} from '@medi-supply/ordenes-dm';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { ProductoService } from '../productos/producto.service';
import { BodegasService } from '../bodegas/bodegas.service';

@Injectable()
export class OrdenesService {
  constructor(
    private pubsub: PubSubService,
    @Inject('IOrdenesRepository') private ordenesRepository: IOrdenesRepository,
    private readonly productoService: ProductoService,
    private readonly bodegasService: BodegasService,
  ) {}

  async crearOrden(
    crearOrdenDto: CrearOrdenDto,
    clienteId: string,
    paisId: number,
    vendedorId?: string
  ): Promise<OrdenCreadaDto> {


    const productosConInfo: ProductoOrden[] = await Promise.all(
      crearOrdenDto.productos.map(async (producto) => {

        const lote = await this.bodegasService.findLoteEnBodega(producto.lote, producto.bodega);
        if (!lote) {
          throw new Error(`El lote ${producto.lote} no existe en la bodega ${producto.bodega}.`);
        }

        const info = await this.productoService.findByLote(producto.lote);

        return {
          ...producto,
          productoRegional: info?.id,
          precioUnitario: info?.precio,
        };
      })
    );

    const nuevaOrden = new Orden({
      cliente: clienteId,
      productos: productosConInfo,
      vendedor: vendedorId,
      pais: paisId,
    });

    const ordenCreada = await this.ordenesRepository.crearOrden(nuevaOrden);

    await this.pubsub.publish('ordenes', ordenCreada);

    return {
      id: ordenCreada.id,
      estado: ordenCreada.estado,
    };
  }

  async obtenerHistorialPorCliente(
    clienteId: string,
    vendedorId: string
  ): Promise<HistorialOrdenResponseDto[]> {
    const historial = await this.ordenesRepository.obtenerHistorialVentasPorCliente(
      vendedorId,
      clienteId
    );

    return historial.map(
      (venta) =>
        new HistorialOrdenResponseDto({
          ordenId: venta.ordenId,
          estado: venta.estado,
          total: venta.total,
          fechaCreacion: venta.fechaCreacion,
          fechaActualizacion: venta.fechaActualizacion,
          productos: venta.productos,
        })
    );
  }
}

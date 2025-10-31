import { Inject, Injectable } from '@nestjs/common';
import { CrearOrdenClienteDto, OrdenCreadaDto } from './dtos/crear-orden.dto';
import {
  type IOrdenesRepository,
  Orden,
  ProductoOrden,
} from '@medi-supply/ordenes-dm';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { ProductoService } from '../productos/producto.service';

@Injectable()
export class OrdenesService {
  constructor(
    private pubsub: PubSubService,
    @Inject('IOrdenesRepository') private ordenesRepository: IOrdenesRepository,
    private readonly productoService: ProductoService
  ) {}

  async crearOrdenPorCliente(
    crearOrdenDto: CrearOrdenClienteDto,
    clienteId: string,
    paisId: number,
    vendedorId?: string
  ): Promise<OrdenCreadaDto> {
    const productosConInfo: ProductoOrden[] = await Promise.all(
      crearOrdenDto.productos.map(async (producto) => {
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
      vendedor: crearOrdenDto.vendedor,
      pais: paisId,
    });

    const ordenCreada = await this.ordenesRepository.crearOrden(nuevaOrden);

    await this.pubsub.publish('ordenes', ordenCreada);

    return {
      id: ordenCreada.id,
      estado: ordenCreada.estado,
    };
  }
}

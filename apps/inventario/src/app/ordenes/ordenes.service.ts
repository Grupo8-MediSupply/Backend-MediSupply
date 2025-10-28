import { Inject, Injectable } from '@nestjs/common';
import { CrearOrdenClienteDto, OrdenCreadaDto } from './dtos/crear-orden.dto';
import { type IOrdenesRepository, Orden } from '@medi-supply/ordenes-dm';
import { PubSubService } from '@medi-supply/messaging-pubsub';

@Injectable()
export class OrdenesService {
    constructor(private pubsub: PubSubService, @Inject('IOrdenesRepository')private ordenesRepository: IOrdenesRepository) {}


    async crearOrdenPorCliente(crearOrdenDto: CrearOrdenClienteDto, clienteId: string) : Promise<OrdenCreadaDto> {
        const nuevaOrden = new Orden({
            cliente: clienteId,
            productos: crearOrdenDto.productos,
            vendedor: crearOrdenDto.vendedor,
        })

        const ordenCreada =  await this.ordenesRepository.crearOrden(nuevaOrden);

        await this.pubsub.publish('ordenes', { ordenCreada });

        return {
            id: ordenCreada.id,
            estado: ordenCreada.estado,
        };

    }
}

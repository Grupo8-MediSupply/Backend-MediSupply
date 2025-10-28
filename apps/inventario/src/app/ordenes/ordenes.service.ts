import { Injectable } from '@nestjs/common';
import { CrearOrdenClienteDto } from './dtos/crear-orden.dto';
import { Orden } from '@medi-supply/ordenes-dm';
import { PubSubService } from '@medi-supply/messaging-pubsub';

@Injectable()
export class OrdenesService {
    constructor(private pubsub: PubSubService) {}
    async crearOrdenPorCliente(crearOrdenDto: CrearOrdenClienteDto, clienteId: string) {
        const nuevaOrden = new Orden({
            cliente: clienteId,
            productos: crearOrdenDto.productos,
            vendedor: crearOrdenDto.vendedor,
        })

        await this.pubsub.publish('ordenes', { nuevaOrden });

    }
}

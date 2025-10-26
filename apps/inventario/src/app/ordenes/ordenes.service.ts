import { Injectable } from '@nestjs/common';
import { CrearOrdenClienteDto } from './dtos/crear-orden.dto';
import { Orden } from '@medi-supply/ordenes-dm';

@Injectable()
export class OrdenesService {
    crearOrdenPorCliente(crearOrdenDto: CrearOrdenClienteDto, clienteId: string) {
        const nuevaOrden = new Orden({
            cliente: clienteId,
            productos: crearOrdenDto.productos,
            vendedor: crearOrdenDto.vendedor,
        })

        
    }
}

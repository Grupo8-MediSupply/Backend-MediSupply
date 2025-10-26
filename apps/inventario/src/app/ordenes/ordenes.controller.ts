import { Body, Controller, Post } from '@nestjs/common';
import { CrearOrdenClienteDto } from './dtos/crear-orden.dto';
import { OrdenesService } from './ordenes.service';
import { User, type JwtPayloadDto } from '@medi-supply/shared';

@Controller('ordenes')
export class OrdenesController {
    constructor(private readonly ordenesService: OrdenesService) {}

    @Post('/porCliente')
    crearOrden(@Body() crearOrdenDto: CrearOrdenClienteDto,@User() jwt: JwtPayloadDto) {
        return this.ordenesService.crearOrdenPorCliente(crearOrdenDto, jwt.sub);
    }
}

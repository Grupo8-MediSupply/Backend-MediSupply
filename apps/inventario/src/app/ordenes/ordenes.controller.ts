import { Body, Controller, Param, Post } from '@nestjs/common';
import { CrearOrdenDto, CrearOrdenVendedorDto } from './dtos/crear-orden.dto';
import { OrdenesService } from './ordenes.service';
import { User, type JwtPayloadDto } from '@medi-supply/shared';

@Controller('v1/ordenes')
export class OrdenesController {
    constructor(private readonly ordenesService: OrdenesService) {}

    @Post('porCliente')
    async crearOrden(@Body() crearOrdenDto: CrearOrdenDto,@User() jwt: JwtPayloadDto) {
        return await this.ordenesService.crearOrden(crearOrdenDto, jwt.sub, jwt.pais);
    }

    @Post('porVendedor/:clienteId')
    async crearOrdenVendedor(@Param('clienteId') clienteId: string,@Body() crearOrdenDto: CrearOrdenVendedorDto,@User() jwt: JwtPayloadDto) {
        return await this.ordenesService.crearOrden(crearOrdenDto, clienteId, jwt.pais, jwt.sub);
    }
}

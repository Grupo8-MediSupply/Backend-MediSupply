import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearOrdenDto, CrearOrdenVendedorDto } from './dtos/crear-orden.dto';
import { OrdenesService } from './ordenes.service';
import { Auditable, User, type JwtPayloadDto } from '@medi-supply/shared';

@Controller('v1/ordenes')
export class OrdenesController {
    constructor(private readonly ordenesService: OrdenesService) {}

    @Post('porCliente')
    async crearOrden(@Body() crearOrdenDto: CrearOrdenDto,@User() jwt: JwtPayloadDto) {
        return await this.ordenesService.crearOrden(crearOrdenDto, jwt.sub, jwt.pais);
    }

    @Auditable({ module: 'Order', action: 'Crear Orden por Vendedor' })
    @Post('porVendedor/:clienteId')
    async crearOrdenVendedor(@Param('clienteId') clienteId: string,@Body() crearOrdenDto: CrearOrdenVendedorDto,@User() jwt: JwtPayloadDto) {
        return await this.ordenesService.crearOrden(crearOrdenDto, clienteId, jwt.pais, jwt.sub);
    }

    @Get('porVendedor/:clienteId/historial')
    async obtenerHistorialCliente(@Param('clienteId') clienteId: string, @User() jwt: JwtPayloadDto) {
        return this.ordenesService.obtenerHistorialPorCliente(clienteId, jwt.sub);
    }
}

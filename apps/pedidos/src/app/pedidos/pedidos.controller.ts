import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { User, type JwtPayloadDto } from '@medi-supply/shared';
import { RepartoOrden } from '@medi-supply/ordenes-dm';

@Controller('v1/pedidos')
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}

    @Get('entregar')
    async obtenerOrdenesParaEntregar(
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @User() jwt: JwtPayloadDto
    ) {
        return this.pedidosService.ObtenerOrdenesParaEntregar(
            jwt.pais,
            fechaInicio,
            fechaFin
        );

    }

    @Post('rutas')
    async generarRutasDeReparto(
        @Body() ordenesEntrega: RepartoOrden[],
        @User() jwt: JwtPayloadDto
    ) {
        return this.pedidosService.GenerarRutasDeReparto(ordenesEntrega);
    }
}

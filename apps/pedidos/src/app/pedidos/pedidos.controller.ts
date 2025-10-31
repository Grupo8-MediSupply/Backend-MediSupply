import { Controller, Get, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { User, type JwtPayloadDto } from '@medi-supply/shared';

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
}

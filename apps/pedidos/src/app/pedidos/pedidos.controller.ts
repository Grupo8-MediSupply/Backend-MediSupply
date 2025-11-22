import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { Roles, RolesEnum, RolesGuard, User, type JwtPayloadDto } from '@medi-supply/shared';
import { RepartoOrden } from '@medi-supply/ordenes-dm';
import { ObtenerPedidosQueryDto } from './dtos/filtro-obtener-ordenes.dto';

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

  @UseGuards(RolesGuard)
  @Roles(RolesEnum.CLIENTE)
  @Get('cliente')
  async obtenerPedidosPorCliente(@Query() query: ObtenerPedidosQueryDto, @User() jwt: JwtPayloadDto) {
    return this.pedidosService.ObtenerPedidosPorCliente(jwt.sub, query);
  }
}

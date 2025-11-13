import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  Roles,
  RolesEnum,
  RolesGuard,
  User,
} from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { PlanesVentaService } from './planes-venta.service';
import { CrearPlanVentaDto } from './dtos/request/crear-plan-venta.dto';
import { PlanVentaResponseDto } from './dtos/response/plan-venta.response.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Ventas')
@Controller('v1/ventas/planes')
@UseGuards(RolesGuard)
@Roles(RolesEnum.ADMIN)
export class PlanesVentaController {
  constructor(private readonly planesVentaService: PlanesVentaService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea un plan de venta asignado a un vendedor',
  })
  @ApiCreatedResponse({ type: PlanVentaResponseDto })
  async crearPlanVenta(
    @Body() crearPlanVentaDto: CrearPlanVentaDto,
    @User() usuario: JwtPayloadDto,
  ): Promise<PlanVentaResponseDto> {
    return this.planesVentaService.crearPlanVenta(crearPlanVentaDto, usuario);
  }
}

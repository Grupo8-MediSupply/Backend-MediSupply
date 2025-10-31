import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReporteVendedorQueryDto } from './dtos/request/reporte-vendedor.query.dto';
import { ReporteVendedorResponseDto } from './dtos/response/reporte-vendedor.response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesEnum, RolesGuard } from '@medi-supply/shared';

@ApiTags('Reportes')
@Controller('v1/reportes')
@UseGuards(RolesGuard)
@Roles(RolesEnum.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('vendedores')
  @ApiOperation({
    summary: 'Consulta reportes de desempeño de vendedores',
  })
  @ApiOkResponse({ type: ReporteVendedorResponseDto, isArray: true })
  async obtenerReporteVendedores(
    @Query() filtros: ReporteVendedorQueryDto,
  ): Promise<ReporteVendedorResponseDto[]> {
    return this.reportesService.obtenerReporteVendedores(filtros);
  }
}

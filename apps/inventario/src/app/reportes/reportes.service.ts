import { Inject, Injectable } from '@nestjs/common';
import { ReporteVendedorQueryDto } from './dtos/request/reporte-vendedor.query.dto';
import { ReporteVendedorResponseDto } from './dtos/response/reporte-vendedor.response.dto';
import type {
  IReportesRepository,
  ReporteVendedorRow,
} from './repositories/reportes.repository';

@Injectable()
export class ReportesService {
  constructor(
    @Inject('IReportesRepository')
    private readonly reportesRepository: IReportesRepository,
  ) {}

  async obtenerReporteVendedores(
    filtros: ReporteVendedorQueryDto,
  ): Promise<ReporteVendedorResponseDto[]> {
    const rows: ReporteVendedorRow[] =
      await this.reportesRepository.obtenerReporteVendedores(filtros);

    return rows.map(
      (row) =>
        new ReporteVendedorResponseDto({
          vendedorId: row.vendedorId,
          vendedorNombre: row.vendedorNombre,
          planId: row.planId ?? undefined,
          planNombre: row.planNombre ?? undefined,
          ventasTotales: Number(row.ventasTotales ?? 0),
          pedidosGestionados: Number(row.pedidosGestionados ?? 0),
          valorPromedioPedido: Number(row.valorPromedioPedido ?? 0),
        }),
    );
  }
}

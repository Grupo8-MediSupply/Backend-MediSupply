import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaFiltroDto } from '../dtos/request/auditoria-filtro.dto';
import { Roles, RolesEnum, RolesGuard } from '@medi-supply/shared';

@Controller('v1/auditorias')
@UseGuards(RolesGuard)
@Roles(RolesEnum.ADMIN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  async listar(@Query() filtros: AuditoriaFiltroDto) {
    return this.auditoriaService.listarAuditorias(filtros);
  }
}

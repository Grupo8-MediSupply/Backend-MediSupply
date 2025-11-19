import { Inject, Injectable } from '@nestjs/common';
import { Auditoria, type IAuditoriaRepository } from "@medi-supply/perfiles-dm";
import { AuditoriaFiltroDto } from '../dtos/request/auditoria-filtro.dto';

@Injectable()
export class AuditoriaService {
    constructor(@Inject('IAuditoriaRepository') private readonly auditoriaRepository: IAuditoriaRepository) {}

    async crearAuditoria(auditoria: Auditoria): Promise<void> {
        await this.auditoriaRepository.guardarAuditoria(auditoria);
    }

    async listarAuditorias(filtros: AuditoriaFiltroDto) {
    return this.auditoriaRepository.listarAuditorias({
      usuario: filtros.usuario,
      accion: filtros.accion,
      fechaDesde: filtros.fechaDesde ? new Date(filtros.fechaDesde) : undefined,
      fechaHasta: filtros.fechaHasta ? new Date(filtros.fechaHasta) : undefined,
    });
  }
}

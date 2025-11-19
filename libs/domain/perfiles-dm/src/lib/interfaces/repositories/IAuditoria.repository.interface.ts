import { Auditoria, NivelSeveridad } from "src/lib/entities/auditoria.entity";

export interface FiltroAuditoria {
  usuario?: string;      // email o userId
  accion?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface IAuditoriaRepository {
  guardarAuditoria(auditoria: Auditoria): Promise<void>;
  listarAuditorias(filtro: FiltroAuditoria): Promise<Auditoria[]>;
}

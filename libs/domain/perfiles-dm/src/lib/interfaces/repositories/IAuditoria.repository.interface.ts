import { Auditoria } from "src/lib/entities/auditoria.entity";

export interface IAuditoriaRepository {
    guardarAuditoria(auditoria: Auditoria): Promise<void>; 
}
import { Inject, Injectable } from '@nestjs/common';
import { Auditoria, type IAuditoriaRepository } from "@medi-supply/perfiles-dm";

@Injectable()
export class AuditoriaService {
    constructor(@Inject('IAuditoriaRepository') private readonly auditoriaRepository: IAuditoriaRepository) {}

    async crearAuditoria(auditoria: Auditoria): Promise<void> {
        await this.auditoriaRepository.guardarAuditoria(auditoria);
    }
}

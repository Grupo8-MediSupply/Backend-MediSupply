import { Auditoria, IAuditoriaRepository } from "@medi-supply/perfiles-dm";
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class AuditoriaRepository implements IAuditoriaRepository {

    constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}


    async guardarAuditoria(auditoria: Auditoria): Promise<void> {

      await this.db('seguridad.auditoria').insert({
        id: auditoria.id,
        accion: auditoria.accion,
        email: auditoria.email,
        ip: auditoria.ip,
        user_id: auditoria?.userId ?? null,
        detalles: this.db.raw('?::jsonb', [JSON.stringify(auditoria.detalles)]),
        created_at: auditoria.createdAt ?? new Date(),
        updated_at: auditoria.updatedAt ?? new Date(),
      });

  }
}
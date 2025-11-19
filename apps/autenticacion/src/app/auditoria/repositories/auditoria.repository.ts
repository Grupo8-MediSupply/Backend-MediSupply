import {
  Auditoria,
  FiltroAuditoria,
  IAuditoriaRepository,
  NivelSeveridad,
} from '@medi-supply/perfiles-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

export class AuditoriaRepository implements IAuditoriaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  private calcularSeveridad(accion: string, detalles: any): NivelSeveridad {
    const texto = `${accion} ${JSON.stringify(detalles ?? {})}`.toLowerCase();
    if (
      texto.includes('eliminar') ||
      texto.includes('delete') ||
      texto.includes('modificar') ||
      texto.includes('update') ||
      texto.includes('acceso') ||
      texto.includes('access')
    ) {
      return 'ALTA';
    }
    if (texto.includes('crear') || texto.includes('create')) {
      return 'MEDIA';
    }
    return 'BAJA';
  }

  async guardarAuditoria(auditoria: Auditoria): Promise<void> {
    await this.db('seguridad.auditoria').insert({
      id: auditoria.id,
      accion: auditoria.accion,
      modulo: auditoria.modulo,
      severidad:
        auditoria.severidad ??
        this.calcularSeveridad(auditoria.accion, auditoria.detalles),
      email: auditoria.email,
      ip: auditoria.ip,
      user_id: auditoria?.userId ?? null,
      detalles: this.db.raw('?::jsonb', [JSON.stringify(auditoria.detalles)]),
      created_at: auditoria.createdAt ?? new Date(),
      updated_at: auditoria.updatedAt ?? new Date(),
    });
  }

  async listarAuditorias(filtro: FiltroAuditoria): Promise<Auditoria[]> {
    const query = this.db('seguridad.auditoria')
      .select(
        'id',
        'accion',
        'modulo',
        'severidad',
        'email',
        'ip',
        'user_id',
        'detalles',
        'created_at',
      )
      .orderBy('created_at', 'desc');

    if (filtro.usuario) {
      query.andWhere((qb) => {
        qb.whereILike('email', `%${filtro.usuario}%`).orWhere(
          'user_id',
          filtro.usuario,
        );
      });
    }

    if (filtro.accion) {
      query.andWhereILike('accion', `%${filtro.accion}%`);
    }

    if (filtro.fechaDesde || filtro.fechaHasta) {
      const desde = filtro.fechaDesde ?? new Date('1970-01-01');
      const hasta = filtro.fechaHasta ?? new Date();
      query.andWhereBetween('created_at', [desde, hasta]);
    }

    const rows = await query;

    return rows.map(
      (row) =>
        new Auditoria({
          id: row.id,
          accion: row.accion,
          modulo: row.modulo,
          severidad: row.severidad as NivelSeveridad,
          email: row.email,
          ip: row.ip,
          userId: row.user_id ?? undefined,
          detalles: row.detalles,
          fecha: row.created_at,
        }),
    );
  }
}

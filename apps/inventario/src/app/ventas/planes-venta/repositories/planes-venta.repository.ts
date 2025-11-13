import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { IPlanesVentaRepository, PlanVenta } from '@medi-supply/ventas-dm';

interface PlanVentaRow {
  id: string;
  nombre: string;
  vendedor_id: string;
  monto_meta: string | number;
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
  descripcion: string;
  pais_id?: number | null;
  coordinador_id?: string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

@Injectable()
export class PlanesVentaRepository implements IPlanesVentaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async crearPlan(plan: PlanVenta): Promise<PlanVenta> {
    const payload: Record<string, unknown> = {
      id: plan.id,
      nombre: plan.nombre,
      vendedor_id: plan.vendedorId,
      monto_meta: plan.montoMeta,
      fecha_inicio: plan.fechaInicio,
      fecha_fin: plan.fechaFin,
      descripcion: plan.descripcion,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    };

    if (plan.paisId != null) {
      payload.pais_id = plan.paisId;
    }

    if (plan.creadoPor) {
      payload.coordinador_id = plan.creadoPor;
    }

    try {
      const [row] = await this.db<PlanVentaRow>('ventas.plan_venta')
        .insert(payload)
        .returning([
          'id',
          'nombre',
          'vendedor_id',
          'monto_meta',
          'fecha_inicio',
          'fecha_fin',
          'descripcion',
          'pais_id',
          'coordinador_id',
          'created_at',
          'updated_at',
        ]);

      if (!row) {
        throw new Error('No se obtuvo respuesta al crear el plan de venta.');
      }

      return new PlanVenta({
        id: row.id,
        nombre: row.nombre,
        vendedorId: row.vendedor_id,
        montoMeta: Number(row.monto_meta),
        fechaInicio: new Date(row.fecha_inicio),
        fechaFin: new Date(row.fecha_fin),
        descripcion: row.descripcion,
        paisId: row.pais_id ?? undefined,
        creadoPor: row.coordinador_id ?? undefined,
        createdAt: row.created_at ? new Date(row.created_at) : undefined,
        updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      });
    } catch (error) {
      console.error('❌ Error al crear plan de venta:', error);
      throw new InternalServerErrorException(
        'No se pudo crear el plan de venta, intente nuevamente.',
      );
    }
  }
}

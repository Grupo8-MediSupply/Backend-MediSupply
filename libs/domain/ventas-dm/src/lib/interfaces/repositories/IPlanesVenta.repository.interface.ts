import { PlanVenta } from '../../entities/plan-venta.entity';

export interface IPlanesVentaRepository {
  crearPlan(plan: PlanVenta): Promise<PlanVenta>;
}

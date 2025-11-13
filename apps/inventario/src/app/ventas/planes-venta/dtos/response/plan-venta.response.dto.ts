import { PlanVenta } from '@medi-supply/ventas-dm';

function formatFecha(fecha: Date): string {
  const dia = fecha.getUTCDate().toString().padStart(2, '0');
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

export class PlanVentaResponseDto {
  id!: string;
  nombre!: string;
  vendedorId!: string;
  montoMeta!: number;
  inicio!: string;
  fin!: string;
  descripcion!: string;

  constructor(plan: PlanVenta) {
    const props = plan.toPrimitives();
    this.id = props.id;
    this.nombre = props.nombre;
    this.vendedorId = props.vendedorId;
    this.montoMeta = props.montoMeta;
    this.inicio = formatFecha(props.fechaInicio);
    this.fin = formatFecha(props.fechaFin);
    this.descripcion = props.descripcion;
  }
}

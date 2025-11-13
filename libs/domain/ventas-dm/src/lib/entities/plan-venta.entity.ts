import { BaseEntity } from '@medi-supply/core';
import { randomUUID } from 'crypto';

export interface PlanVentaProps {
  id?: string;
  nombre: string;
  vendedorId: string;
  montoMeta: number;
  fechaInicio: Date;
  fechaFin: Date;
  descripcion: string;
  paisId?: number;
  creadoPor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlanVenta extends BaseEntity<string> {
  readonly nombre: string;
  readonly vendedorId: string;
  readonly montoMeta: number;
  readonly fechaInicio: Date;
  readonly fechaFin: Date;
  readonly descripcion: string;
  readonly paisId?: number;
  readonly creadoPor?: string;

  constructor(props: PlanVentaProps) {
    super({
      id: props.id ?? randomUUID(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.nombre = props.nombre;
    this.vendedorId = props.vendedorId;
    this.montoMeta = props.montoMeta;
    this.fechaInicio = props.fechaInicio;
    this.fechaFin = props.fechaFin;
    this.descripcion = props.descripcion;
    this.paisId = props.paisId;
    this.creadoPor = props.creadoPor;
  }

  toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      vendedorId: this.vendedorId,
      montoMeta: this.montoMeta,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      descripcion: this.descripcion,
      paisId: this.paisId,
      creadoPor: this.creadoPor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class ProductoRegulacion {
  constructor(
    public id: string | null,
    public productoId: string,
    public regulacionId: string,
    public fechaAsociacion?: Date,
    public cumplimiento?: boolean,
  ) {}
}

export class RegulacionDetalle extends ProductoRegulacion {
  constructor(
    id: string | null,
    productoId: string,
    regulacionId: string,
    fechaAsociacion?: Date,
    cumplimiento?: boolean,
    public nombre?: string,
    public descripcion?: string,
    public tipo_norma?: string,
    public pais_id?: number,
  ) {
    super(id, productoId, regulacionId, fechaAsociacion, cumplimiento);
  }
}

export class ProductoRegulacion {
  constructor(
    public id: string | null,
    public productoId: number,
    public regulacionId: string,
    public fechaAsociacion?: Date,
    public cumplimiento?: boolean,
  ) {}
}

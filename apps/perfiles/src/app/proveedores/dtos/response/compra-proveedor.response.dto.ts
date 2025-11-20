export class CompraProveedorResponseDto {
  constructor(
    readonly producto: string,
    readonly cantidad: number,
    readonly valorTotal: number,
    readonly fechaCompra: Date,
    readonly proveedorId?: string,
  ) {}
}

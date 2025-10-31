export class ReporteVendedorResponseDto {
  vendedorId!: string;
  vendedorNombre: string | null = null;
  planId?: string;
  planNombre?: string;
  ventasTotales!: number;
  pedidosGestionados!: number;
  valorPromedioPedido!: number;

  constructor(partial: Partial<ReporteVendedorResponseDto>) {
    Object.assign(this, partial);
  }
}

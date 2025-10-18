export enum EstadoVisita {
  PROGRAMADA = 'PROGRAMADA',
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
}

export class VisitaCliente {
  constructor(
    public id: string | null,           // UUID del registro de visita
    public clienteId: string,           // UUID del cliente
    public vendedorId: string,          // UUID del vendedor
    public fechaVisita: Date,           // Fecha programada
    public estado: EstadoVisita = EstadoVisita.PROGRAMADA, // Estado por defecto
    public comentarios?: string | null, // Campo opcional
    public createdAt?: Date,            // Timestamps opcionales
    public updatedAt?: Date,
  ) {}
}

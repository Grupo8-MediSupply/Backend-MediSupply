import { Cliente } from 'src/lib/entities/cliente.entity';

export interface IClienteRepository {
  create(cliente: Cliente): Promise<Cliente>;
  findById(id: string): Promise<Cliente | null>;
}

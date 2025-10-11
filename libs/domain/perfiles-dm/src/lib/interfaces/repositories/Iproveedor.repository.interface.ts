import { Proveedor } from 'src/lib/entities/proveedor.entity';

export interface IProveedorRepository {
  create(proveedor: Proveedor): Promise<Proveedor>;
  findById(id: string): Promise<Proveedor | null>;
}

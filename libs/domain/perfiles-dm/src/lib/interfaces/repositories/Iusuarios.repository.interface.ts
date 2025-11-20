import { Usuario } from "src/lib/entities/usuario.entity";

export interface IUsuariosRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findAllByPais(pais: number): Promise<Usuario[]>;
  updateUsuario(id: string, cambios: Partial<Usuario>): Promise<void> 
}

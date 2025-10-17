import { Usuario } from "src/lib/entities/usuario.entity";

export interface IUsuariosRepository {
  findByEmail(email: string): Promise<Usuario | null>;
}

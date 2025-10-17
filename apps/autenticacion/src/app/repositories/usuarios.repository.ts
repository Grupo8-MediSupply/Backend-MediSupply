import { Knex } from "knex";
import { Usuario,IUsuariosRepository } from "@medi-supply/perfiles-dm";
import { Inject } from "@nestjs/common";

export class UsuariosRepository implements IUsuariosRepository {
    constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

    async findByEmail(email: string): Promise<Usuario | null> {
        const usuarioRow = await this.db('usuarios.usuario')
            .where({ email })
            .first();

        if (!usuarioRow) {
            return null;
        }

        return {
            id: usuarioRow.id,
            email: usuarioRow.email,
            password: usuarioRow.password_hash,
            rolId: usuarioRow.rol_id,
            paisId: usuarioRow.pais_id,
        } as Usuario;
    }
}
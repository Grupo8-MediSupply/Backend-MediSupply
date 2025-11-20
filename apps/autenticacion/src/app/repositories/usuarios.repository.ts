import { Knex } from 'knex';
import { Usuario, IUsuariosRepository } from '@medi-supply/perfiles-dm';
import { Inject } from '@nestjs/common';

export class UsuariosRepository implements IUsuariosRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}
  updateUsuario(id: string, cambios: Partial<Usuario>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findAllByPais(pais: number): Promise<Usuario[]> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuarioRow = await this.db('usuarios.usuario')
      .where({ email })
      .first();

    if (!usuarioRow) {
      return null;
    }

    return new Usuario({
      id: usuarioRow.id,
      email: usuarioRow.email,
      rolId: usuarioRow.rol_id,
      paisId: usuarioRow.pais_id,
      password: usuarioRow.password_hash,
      createdAt: usuarioRow.created_at,
      updatedAt: usuarioRow.updated_at,
      tipoIdentificacion: usuarioRow.tipo_identificacion,
      identificacion: usuarioRow.numero_identificacion,
      activo: usuarioRow.activo,
    });
  }
}

import { Usuario, IUsuariosRepository } from '@medi-supply/perfiles-dm';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

export class UsuarioRepository implements IUsuariosRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async findAllByPais(pais: number): Promise<Usuario[]> {
    const rows = await this.db('usuarios.usuario')
      .where({ pais_id: pais })
      .select();

    return rows.map(
      (usuarioRow) =>
        new Usuario({
          id: usuarioRow.id,
          email: usuarioRow.email,
          rolId: usuarioRow.rol_id,
          paisId: usuarioRow.pais_id,
          password: usuarioRow.password_hash,
          createdAt: usuarioRow.created_at,
          updatedAt: usuarioRow.updated_at,
          tipoIdentificacion: Number(usuarioRow.tipo_identificacion_id),
          identificacion: usuarioRow.identificacion,
          activo: usuarioRow.activo,
        })
    );
  }

  findByEmail(email: string): Promise<Usuario | null> {
    throw new Error('Method not implemented.');
  }

  async updateUsuario(id: string, cambios: Partial<Usuario>): Promise<void> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const updateData: any = {
      updated_at: this.db.fn.now(),
    };

    if (cambios.rolId !== undefined && cambios.rolId !== usuario.rolId) updateData.rol_id = cambios.rolId;
    if (cambios.password !== undefined && cambios.password !== usuario.password) updateData.password_hash = cambios.password;
    if (cambios.identificacion && cambios.identificacion !== usuario.identificacion) updateData.identificacion = cambios.identificacion;
    if (cambios.tipoIdentificacion !== undefined && cambios.tipoIdentificacion !== usuario.tipoIdentificacion)
      updateData.tipo_identificacion_id = cambios.tipoIdentificacion;
    if (cambios.activo !== undefined && cambios.activo !== usuario.activo) updateData.activo = cambios.activo;

    if (Object.keys(updateData).length === 0) {
      return;
    }

    await this.db('usuarios.usuario').where({ id }).update(updateData);
  }

  async findById(id: string): Promise<Usuario | null> {
    const usuarioRow = await this.db('usuarios.usuario')
      .where({ id })
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
      tipoIdentificacion: Number(usuarioRow.tipo_identificacion_id),
      identificacion: usuarioRow.identificacion,
      activo: usuarioRow.activo,
    });
  }
}

import { IProveedorRepository, Proveedor } from '@medi-supply/perfiles-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProveedorRepository implements IProveedorRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async create(proveedor: Proveedor): Promise<Proveedor> {
    const trx = await this.db.transaction();
    try {
      const [usuario] = await trx('usuarios.usuario')
        .insert({
          email: proveedor.email.Value,
            identificacion: proveedor.identificacion,
            tipo_identificacion_id: proveedor.tipoIdentificacion,
            rol_id: proveedor.rolId,
            pais_id: proveedor.paisId,
            password_hash: proveedor.password,
        })
        .returning(['id']);

      const [created] = await trx('usuarios.proveedor')
        .insert({
          id: usuario.id,
          nombre: proveedor.nombreProveedor.Value,
          contacto_principal: proveedor.contactoPrincipal.Value,
          telefono: proveedor.telefonoContacto,
        })
        .returning(['id', 'nombre', 'contacto_principal', 'telefono']);

      await trx.commit();

      return new Proveedor({
        id: created.id,
        email: proveedor.email.Value,
        paisId: proveedor.paisId,
        nombreProveedor: proveedor.nombreProveedor.Value,
        numeroIdentificacion: proveedor.identificacion,
        contactoPrincipal: proveedor.contactoPrincipal.Value,
        telefonoContacto: proveedor.telefonoContacto,
        rolId: proveedor.rolId,
        password: proveedor.password,
        tipoIdentificacion: proveedor.tipoIdentificacion,
      });
    } catch (error) {
      await trx.rollback();
      console.error('❌ Error al crear proveedor:', error);
      throw new InternalServerErrorException('Error al crear el proveedor.');
    }
  }

  async findById(id: string): Promise<Proveedor | null> {
    try {
      const proveedor = await this.db('usuarios.proveedor')
        .select(
          'proveedor.id',
          'proveedor.nombre',
          'proveedor.contacto_principal',
          'proveedor.telefono_contacto',
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
          'usuario.password',
          'usuario.identificacion',
          'usuario.tipo_identificacion'
        )
        .innerJoin('usuario', 'usuario.id', 'proveedor.usuario_id')
        .where('proveedor.id', id)
        .first();

      if (!proveedor) return null;

      return new Proveedor({
        id: proveedor.id,
        email: proveedor.email,
        nombreProveedor: proveedor.nombre,
        numeroIdentificacion: proveedor.identificacion,
        contactoPrincipal: proveedor.contacto_principal,
        telefonoContacto: proveedor.telefono_contacto,
        rolId: proveedor.rol_id,
        paisId: proveedor.pais_id,
        password: '***',
        tipoIdentificacion: proveedor.tipo_identificacion,
      });
    } catch (error) {
      console.error('❌ Error al buscar proveedor por ID:', error);
      throw new InternalServerErrorException('Error al buscar proveedor.');
    }
  }
}

import { IProveedorRepository, Proveedor } from '@medi-supply/perfiles-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProveedorRepository implements IProveedorRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async create(proveedor: Proveedor): Promise<Proveedor> {
    const trx = await this.db.transaction();
    try {
      const [usuario] = await trx('usuario')
        .insert({
          email: proveedor.email.Value,
          password_hash: proveedor.password,
          rol_id: proveedor.rolId,
          pais_id: proveedor.paisId,
        })
        .returning(['id']);

      const [created] = await trx('proveedor')
        .insert({
          usuario_id: usuario.id,
          nombre_proveedor: proveedor.nombreProveedor.Value,
          numero_identificacion: proveedor.numeroIdentificacion,
          pais: proveedor.pais,
          email: proveedor.email.Value,
          contacto_principal: proveedor.contactoPrincipal.Value,
          telefono_contacto: proveedor.telefonoContacto,
        })
        .returning(['id', 'nombre_proveedor', 'email', 'pais']);

      await trx.commit();

      return new Proveedor({
        id: created.id,
        email: created.email,
        pais: created.pais,
        nombreProveedor: created.nombre_proveedor,
        numeroIdentificacion: proveedor.numeroIdentificacion,
        contactoPrincipal: proveedor.contactoPrincipal.Value,
        telefonoContacto: proveedor.telefonoContacto,
        rolId: proveedor.rolId,
        paisId: proveedor.paisId,
        password: proveedor.password,
      });
    } catch (error) {
      await trx.rollback();
      console.error('❌ Error al crear proveedor:', error);
      throw new InternalServerErrorException('Error al crear el proveedor.');
    }
  }

  async findById(id: string): Promise<Proveedor | null> {
    try {
      const proveedor = await this.db('proveedor')
        .select(
          'proveedor.id',
          'proveedor.nombre_proveedor',
          'proveedor.numero_identificacion',
          'proveedor.pais',
          'proveedor.email',
          'proveedor.contacto_principal',
          'proveedor.telefono_contacto',
          'usuario.rol_id',
          'usuario.pais_id'
        )
        .innerJoin('usuario', 'usuario.id', 'proveedor.usuario_id')
        .where('proveedor.id', id)
        .first();

      if (!proveedor) return null;

      return new Proveedor({
        id: proveedor.id,
        email: proveedor.email,
        pais: proveedor.pais,
        nombreProveedor: proveedor.nombre_proveedor,
        numeroIdentificacion: proveedor.numero_identificacion,
        contactoPrincipal: proveedor.contacto_principal,
        telefonoContacto: proveedor.telefono_contacto,
        rolId: proveedor.rol_id,
        paisId: proveedor.pais_id,
        password: '***',
      });
    } catch (error) {
      console.error('❌ Error al buscar proveedor por ID:', error);
      throw new InternalServerErrorException('Error al buscar proveedor.');
    }
  }
}

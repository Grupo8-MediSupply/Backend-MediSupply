import { IClienteRepository, Cliente } from '@medi-supply/perfiles-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ClienteRepository implements IClienteRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  /**
   * Crea un nuevo cliente (y su usuario asociado)
   */
  async create(cliente: Cliente): Promise<Cliente> {
    try {
      let createdUserId: string;

      await this.db.transaction(async (trx) => {
        // 1️⃣ Inserta el usuario y obtiene el ID generado
        const [user] = await trx('usuarios.usuario')
          .insert({
            email: cliente.email.Value,
            rol_id: cliente.rolId,
            pais_id: cliente.paisId,
            password_hash: cliente.password,
          })
          .returning('id');

        createdUserId = user.id;

        // 2️⃣ Inserta el cliente con el mismo ID
        await trx('usuarios.cliente').insert({
          id: createdUserId,
          nombre: cliente.nombre.Value,
          tipo_institucion: cliente.tipoInstitucion,
          clasificacion: cliente.clasificacion,
          responsable_contacto: cliente.responsableContacto,
        });
      });

      // 3️⃣ Devuelve el cliente creado
      const clienteCreado = new Cliente({
        id: createdUserId!,
        email: cliente.email.Value,
        rolId: cliente.rolId,
        paisId: cliente.paisId,
        password: cliente.password,
        nombre: cliente.nombre.Value,
        tipoInstitucion: cliente.tipoInstitucion,
        clasificacion: cliente.clasificacion,
        responsableContacto: cliente.responsableContacto,
      });

      return clienteCreado;
    } catch (error) {
      console.error('❌ Error al crear cliente:', error);

      if ((error as any).code === '23505') {
        throw new InternalServerErrorException(
          'Ya existe un usuario o cliente con este email o ID.',
        );
      }

      throw new InternalServerErrorException('Error al crear el cliente.');
    }
  }

  /**
   * Busca un cliente por su ID
   */
  async findById(id: string): Promise<Cliente | null> {
    try {
      const record = await this.db('usuarios.cliente')
        .select(
          'cliente.id',
          'cliente.nombre',
          'cliente.tipo_institucion',
          'cliente.clasificacion',
          'cliente.responsable_contacto',
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
        )
        .join('usuarios.usuario', 'usuario.id', '=', 'cliente.id')
        .where('cliente.id', id)
        .first();

      if (!record) return null;

      return new Cliente({
        id: record.id,
        email: record.email,
        rolId: record.rol_id,
        paisId: record.pais_id,
        password: '***',
        nombre: record.nombre,
        tipoInstitucion: record.tipo_institucion,
        clasificacion: record.clasificacion,
        responsableContacto: record.responsable_contacto,
      });
    } catch (error) {
      console.error('❌ Error al buscar cliente:', error);
      throw new InternalServerErrorException('Error al buscar el cliente.');
    }
  }
}

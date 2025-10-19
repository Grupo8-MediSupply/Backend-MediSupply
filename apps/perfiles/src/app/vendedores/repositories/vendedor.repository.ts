import { IVendedorRepository, Vendedor } from "@medi-supply/perfiles-dm";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Knex } from "knex";

export class VendedorRepository implements IVendedorRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  /**
   * Crea un nuevo vendedor (y su usuario asociado) usando la generación
   * automática de UUID en la base de datos.
   */
  async create(vendedor: Vendedor): Promise<Vendedor> {
    try {
      let createdUserId: string;

      await this.db.transaction(async (trx) => {
        // Inserta el usuario y captura el ID generado por la DB
        const [user] = await trx('usuarios.usuario')
          .insert({
            email: vendedor.email.Value,
            rol_id: vendedor.rolId,
            pais_id: vendedor.paisId,
            password_hash: vendedor.password,
          })
          .returning('id');

        createdUserId = user.id;

        // Inserta el vendedor usando el mismo ID
        await trx('usuarios.vendedor').insert({
          id: createdUserId,
          nombre: vendedor.nombre.Value,
          territorio: vendedor.territorio ?? null,
        });
      });

      // Devuelve el vendedor con el ID asignado por la base
      const vendedorCreado = new Vendedor({
        email: vendedor.email.Value,
        rolId: vendedor.rolId,
        paisId: vendedor.paisId,
        password: vendedor.password,
        nombre: vendedor.nombre.Value,
        territorio: vendedor.territorio,
        id: createdUserId!,
      });
      return vendedorCreado;
    } catch (error) {
      console.error('❌ Error al crear vendedor:', error);

      if ((error as any).code === '23505') {
        throw new InternalServerErrorException(
          'Ya existe un usuario o vendedor con este email o ID.',
        );
      }

      throw new InternalServerErrorException('Error al crear el vendedor.');
    }
  }

  /**
   * Busca un vendedor por su ID.
   */
  async findById(id: string): Promise<Vendedor | null> {
    try {
      const record = await this.db('usuarios.vendedor')
        .select(
          'vendedor.id',
          'vendedor.nombre',
          'vendedor.territorio',
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
          'usuario.password',
        )
        .join('usuario', 'usuario.id', '=', 'vendedor.id')
        .where('vendedor.id', id)
        .first();

      if (!record) return null;

      return new Vendedor({
        id: record.id,
        email: record.email,
        rolId: record.rol_id,
        paisId: record.pais_id,
        password: record.password,
        nombre: record.nombre,
        territorio: record.territorio,
      });
    } catch (error) {
      console.error('❌ Error al buscar vendedor:', error);
      throw new InternalServerErrorException('Error al buscar el vendedor.');
    }
  }

  /**
   * Obtiene todos los clientes asociados al país del vendedor
   */
  async findClientesByVendedorId(vendedorId: string): Promise<any[]> {
    try {
      // Primero obtenemos el país del vendedor
      const vendedor = await this.db('usuarios.vendedor')
        .join('usuarios.usuario', 'usuario.id', '=', 'vendedor.id')
        .select('usuario.pais_id')
        .where('vendedor.id', vendedorId)
        .first();

      if (!vendedor) {
        throw new InternalServerErrorException('Vendedor no encontrado');
      }

      // Luego obtenemos todos los clientes que pertenecen a ese país
      const clientes = await this.db('usuarios.cliente')
        .join('usuarios.usuario', 'usuario.id', '=', 'cliente.id')
        .select(
          'cliente.id',
          'cliente.nombre',
          'cliente.tipo_institucion',
          'cliente.clasificacion',
          'cliente.responsable_contacto',
          'usuario.email'
        )
        .where('usuario.pais_id', vendedor.pais_id);

      return clientes;
    } catch (error) {
      console.error('❌ Error al obtener clientes del vendedor:', error);
      throw new InternalServerErrorException('Error al listar los clientes.');
    }
  }
}

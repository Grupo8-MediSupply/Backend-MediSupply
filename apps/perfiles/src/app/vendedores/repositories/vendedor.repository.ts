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
      let createdUserId: string;

      await this.db.transaction(async (trx) => {
        // Inserta el usuario y captura el ID generado por la DB
        const [user] = await trx('usuarios.usuario')
          .insert({
            email: vendedor.email.Value,
            identificacion: vendedor.identificacion,
            tipo_identificacion_id: vendedor.tipoIdentificacion,
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
        identificacion: vendedor.identificacion,
        tipoIdentificacion: vendedor.tipoIdentificacion,
        nombre: vendedor.nombre.Value,
        id: createdUserId!,
      });
      return vendedorCreado;
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
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
          'usuario.password',
          'usuario.identificacion',
          'usuario.tipo_identificacion'
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
        identificacion: record.identificacion,
        tipoIdentificacion: record.tipo_identificacion,
        password: record.password,
        nombre: record.nombre,
      });
    } catch (error) {
      console.error('❌ Error al buscar vendedor:', error);
      throw new InternalServerErrorException('Error al buscar el vendedor.');
    }
  }


}
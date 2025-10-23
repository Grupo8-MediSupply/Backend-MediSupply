import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { ITipoIdentificacionRepository, TipoIdentificacion } from '@medi-supply/perfiles-dm';

export class TipoIdentificacionRepository implements ITipoIdentificacionRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async findByPaisId(paisId: number): Promise<TipoIdentificacion[]> {
    try {
      const records = await this.db('usuarios.tipo_identificacion')
        .select(
          'id',
          'descripcion as nombre',        // ✅ ajustado al nombre real
          'codigo as abreviatura',        // ✅ ajustado al nombre real
          'pais_id as paisId'             // ✅ mantiene relación con pais
        )
        .where('pais_id', paisId)
        .orderBy('id', 'asc');

      return records.map((r) => new TipoIdentificacion(r));
    } catch (error) {
      console.error('❌ Error al consultar tipos de identificación:', error);
      throw new InternalServerErrorException('Error al listar los tipos de identificación');
    }
  }
}

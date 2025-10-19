import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { IPaisRepository, Pais } from '@medi-supply/perfiles-dm';

export class PaisRepository implements IPaisRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async findAll(): Promise<Pais[]> {
    try {
      const records = await this.db('geografia.pais')
        .select(
          'id',
          'codigo_iso as codigoIso',
          'nombre',
          'moneda',
          'simbolo_moneda as simboloMoneda',
          'zona_horaria as zonaHoraria',
          'idioma_oficial as idiomaOficial',
          'regulador_sanitario as reguladorSanitario',
        )
        .orderBy('id', 'asc');

      return records.map(
        (r) =>
          new Pais({
            id: r.id,
            codigoIso: r.codigoIso,
            nombre: r.nombre,
            moneda: r.moneda,
            simboloMoneda: r.simboloMoneda,
            zonaHoraria: r.zonaHoraria,
            idiomaOficial: r.idiomaOficial,
            reguladorSanitario: r.reguladorSanitario,
          }),
      );
    } catch (error) {
      console.error('❌ Error al consultar países:', error);
      throw new InternalServerErrorException('Error al listar los países');
    }
  }

  async findById(id: number): Promise<Pais | null> {
    try {
      const record = await this.db('geografia.pais')
        .select(
          'id',
          'codigo_iso as codigoIso',
          'nombre',
          'moneda',
          'simbolo_moneda as simboloMoneda',
          'zona_horaria as zonaHoraria',
          'idioma_oficial as idiomaOficial',
          'regulador_sanitario as reguladorSanitario',
        )
        .where({ id })
        .first();

      if (!record) return null;

      return new Pais({
        id: record.id,
        codigoIso: record.codigoIso,
        nombre: record.nombre,
        moneda: record.moneda,
        simboloMoneda: record.simboloMoneda,
        zonaHoraria: record.zonaHoraria,
        idiomaOficial: record.idiomaOficial,
        reguladorSanitario: record.reguladorSanitario,
      });
    } catch (error) {
      console.error('❌ Error al consultar país:', error);
      throw new InternalServerErrorException('Error al obtener país');
    }
  }
}

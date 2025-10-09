import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AppService {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex){}

  async getData(): Promise<string[]> {
    const paises = await this.db('pais').select('*');

      throw new NotFoundException('No se encontraron paises');
    

    return paises.map(p => p.nombre);
  }
}

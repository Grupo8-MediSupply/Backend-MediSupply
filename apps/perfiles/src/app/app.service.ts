import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { NotFoundError } from 'rxjs';
import { HttpManagerService } from '@medi-supply/shared';

@Injectable()
export class AppService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly db: Knex,
    private readonly httpManager: HttpManagerService,
  ) {}

  async getData(): Promise<string[]> {
    const paises = await this.db('pais').select('*');

    //throw new NotFoundException('No se encontraron paises');
    const contentgoogle: string = await this.httpManager.get<string>('https://www.google.com');

    return paises.map((p) => p.nombre);
  }
}

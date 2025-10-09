import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';



export const dbKnexProvider = {
  provide: 'KNEX_CONNECTION',
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<Knex> => {
    return knex({
      client: 'pg',
      connection: {
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
      },
    });
  },
};
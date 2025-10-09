import { Global, Module } from '@nestjs/common';
import { dbKnexProvider } from './knex-connection';

@Global()
@Module({
  controllers: [],
  providers: [dbKnexProvider],
  exports: ['KNEX_CONNECTION'],
})
export class MediSupplyDatabaseModule {}

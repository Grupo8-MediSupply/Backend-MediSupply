import { Module } from '@nestjs/common';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { MediSupplyPerfilesDmModule } from '@medi-supply/perfiles-dm';
import { VendedoresModule } from './vendedores/vendedores.module';
import { AppController } from './controller.controller';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyPerfilesDmModule,
    VendedoresModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

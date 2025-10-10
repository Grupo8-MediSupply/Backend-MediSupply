import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { MediSupplyPerfilesDmModule } from '@medi-supply/perfiles-dm';
import { VendedoresModule } from './vendedores/vendedores.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyPerfilesDmModule,
    VendedoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

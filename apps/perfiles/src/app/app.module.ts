import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { MediSupplyPerfilesDmModule } from '@medi-supply/perfiles-dm';


@Module({
  imports: [MediSupplyConfigEnvModule, MediSupplyDatabaseModule, MediSupplySharedModule, MediSupplyPerfilesDmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

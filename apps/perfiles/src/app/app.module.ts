import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';

@Module({
  imports: [MediSupplyConfigEnvModule, MediSupplyDatabaseModule, MediSupplySharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

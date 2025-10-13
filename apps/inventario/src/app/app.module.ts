import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { ProductoModule } from './productos/producto.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    ProductoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

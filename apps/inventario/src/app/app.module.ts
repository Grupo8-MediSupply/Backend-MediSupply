import { Module } from '@nestjs/common';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { ProductoModule } from './productos/producto.module';
import { MediSupplyProductosDmModule } from '@medi-supply/productos-dm';
import { ProductosRegulacionModule } from './productos-regulacion/productos-regulacion.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyProductosDmModule,
    ProductoModule,
    ProductosRegulacionModule,
  ],
})
export class AppModule {}

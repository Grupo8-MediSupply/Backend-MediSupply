import { Module } from '@nestjs/common';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { ProductoModule } from './productos/producto.module';
import { MediSupplyProductosDmModule } from '@medi-supply/productos-dm';
import { ProductosRegulacionModule } from './productos-regulacion/productos-regulacion.module';
import { BodegasModule } from './bodegas/bodegas.module';
import { MediSupplyOrdenesDmModule } from '@medi-supply/ordenes-dm';
import { OrdenesModule } from './ordenes/ordenes.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyProductosDmModule,
    ProductoModule,
    ProductosRegulacionModule,
    BodegasModule,
    MediSupplyOrdenesDmModule,
    OrdenesModule,
  ],
})
export class AppModule {}

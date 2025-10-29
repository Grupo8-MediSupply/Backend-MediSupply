import { Module } from '@nestjs/common';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { MediSupplyProductosDmModule } from '@medi-supply/productos-dm';
import { MediSupplyOrdenesDmModule } from '@medi-supply/ordenes-dm';
import { MediSupplyMessagingPubsubModule } from '@medi-supply/messaging-pubsub';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyProductosDmModule,
    MediSupplyOrdenesDmModule,
    MediSupplyMessagingPubsubModule,
    PedidosModule,
  ],
})
export class AppModule {}

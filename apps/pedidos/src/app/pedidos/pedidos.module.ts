import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { OrdenesRepository } from './repositories/ordenes.repository';
import { PedidosConsumerService } from './pedidos-consumer.service';
import { RutasService } from '@medi-supply/ordenes-dm';

@Module({
  controllers: [PedidosController],
  providers: [
    PedidosService,
    {
      provide: 'IOrdenesRepository',
      useClass: OrdenesRepository,
    },
    PedidosConsumerService,
    RutasService,
  ],
})
export class PedidosModule {}

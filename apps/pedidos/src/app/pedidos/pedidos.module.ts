import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { OrdenesRepository } from './repositories/ordenes.repository';
import { PedidosConsumerService } from './pedidos-consumer.service';

@Module({
  controllers: [PedidosController],
  providers: [
    PedidosService,
    {
      provide: 'IOrdenesRepository',
      useClass: OrdenesRepository,
    },
    PedidosConsumerService,
  ],
})
export class PedidosModule {}

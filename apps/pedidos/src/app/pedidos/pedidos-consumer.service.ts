import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { Orden } from '@medi-supply/ordenes-dm';

@Injectable()
export class PedidosConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PedidosConsumerService.name);

  constructor(
    private readonly pedidosService: PedidosService,
    private readonly pubSub: PubSubService
  ) {}

  async onModuleInit() {
    await this.pubSub.subscribe('ordenes-sub', async (message) => {
      try {
        this.logger.log(
          `📦 Mensaje recibido en topic 'ordenes': ${message.id}`,
          'data: ' + message.data.toString()

        );

        const data: Orden = JSON.parse(message.data.toString());
        await this.pedidosService.ActualizarOrden(data);

        this.logger.log(`✅ Orden procesada: ${data.id}`);
        message.ack(); // Marca el mensaje como procesado
      } catch (error) {
        this.logger.error(
          `❌ Error procesando orden: ${error.message}`,
          error.stack
        );
        message.nack(); // Deja el mensaje en la cola para reintentar
      }
    });
  }
}

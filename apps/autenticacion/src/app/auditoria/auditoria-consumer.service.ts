import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from '@medi-supply/perfiles-dm';

@Injectable()
export class AuditoriaConsumerService implements OnModuleInit {
    private readonly logger = new Logger(AuditoriaConsumerService.name);
  constructor(private readonly pubSub: PubSubService, private readonly auditoriaService: AuditoriaService) {}

  async onModuleInit() {
    await this.pubSub.subscribe('auditoria-sub', async (message) => {
      try {
        const rawMsg = JSON.parse(message.data.toString());
        const data: Auditoria = new Auditoria({
          id: rawMsg.id,
          accion: rawMsg.action,
          email: rawMsg.email,
          ip: rawMsg.ip,
          userId: rawMsg.userId,
          detalles: rawMsg.response,
          fecha: rawMsg.timestamp ? new Date(rawMsg.timestamp) : new Date(),
        });
        await this.auditoriaService.crearAuditoria(data);

        this.logger.log(`✅ Auditoria procesada : ${data.id}`);
        message.ack(); // Marca el mensaje como procesado
      } catch (error) {
        this.logger.error(
          `❌ Error procesando auditoria: ${error.message}`,
          error.stack
        );
        message.nack(); // Deja el mensaje en la cola para reintentar
      }
    });
  }
}

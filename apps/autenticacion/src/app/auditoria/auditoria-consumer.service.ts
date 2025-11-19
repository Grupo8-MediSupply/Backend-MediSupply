import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { Auditoria } from '@medi-supply/perfiles-dm';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class AuditoriaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AuditoriaConsumerService.name);
  constructor(
    private readonly pubSub: PubSubService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async onModuleInit() {
    await this.pubSub.subscribe('auditoria-sub', async (message) => {
      try {
        const rawMsg = JSON.parse(message.data.toString());
        const data: Auditoria = new Auditoria({
          id: rawMsg.id,
          accion: rawMsg.action,
          modulo: rawMsg.module,
          email: rawMsg.email,
          ip: rawMsg.ip,
          userId: rawMsg.userId,
          detalles: rawMsg.response,
          severidad: rawMsg.severity,
          fecha: rawMsg.timestamp ? new Date(rawMsg.timestamp) : new Date(),
        });
        await this.auditoriaService.crearAuditoria(data);

        this.logger.log(`✅ Auditoria procesada : ${data.id}`);
        message.ack();
      } catch (error) {
        this.logger.error(
          `❌ Error procesando auditoria: ${error.message}`,
          error.stack,
        );
        message.nack();
      }
    });
  }
}

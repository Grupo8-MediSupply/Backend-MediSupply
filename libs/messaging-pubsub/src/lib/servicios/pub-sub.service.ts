import {
  Global,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PubSub, Subscription } from '@google-cloud/pubsub';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private pubsub!: PubSub;
  private subscriptions: Subscription[] = [];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');

    // Detectar si se está usando el emulador local
    const isLocalEmulator = !!this.configService.get<string>(
      'PUBSUB_EMULATOR_HOST'
    );

    this.pubsub = new PubSub({
      projectId,
      ...(isLocalEmulator
        ? {} // el emulador no requiere credenciales
        : { keyFilename: this.configService.get<string>('GCP_KEYFILE_PATH') }),
    });

    this.logger.log(
      isLocalEmulator
        ? '📦 Conectado al emulador local de Pub/Sub'
        : `🌩️ Conectado a GCP Pub/Sub (proyecto: ${projectId})`
    );
  }

  async publish(topicName: string, message: any) {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(message));
      await this.pubsub.topic(topicName).publishMessage({ data: dataBuffer });
      this.logger.log(`✅ Mensaje publicado en topic "${topicName}"`);
    } catch (err) {
      this.logger.error(
        `❌ Error publicando en "${topicName}": ${err.message}`
      );
    }
  }

  async subscribe(subscriptionName: string, handler: (data: any) => void) {
    try {
      const subscription = this.pubsub.subscription(subscriptionName);

      subscription.on('message', async (message) => {
        try {
          await handler(message);
          message.ack();
        } catch (err: any) {
          this.logger.error(`❌ Error procesando mensaje: ${err}`);
        }
      });

      subscription.on('error', (error) => {
        this.logger.error(
          `Error en suscripción ${subscriptionName}: ${error.message}`
        );
      });

      this.subscriptions.push(subscription);
      this.logger.log(`📡 Suscrito a "${subscriptionName}"`);
    } catch (err) {
      this.logger.error(`❌ Error creando suscripción: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('🧹 Cerrando suscripciones Pub/Sub...');
    for (const sub of this.subscriptions) {
      await sub.close().catch(() => null);
    }
  }
}

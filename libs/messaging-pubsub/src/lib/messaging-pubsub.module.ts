import { Global, Module } from '@nestjs/common';
import { PubSubService } from './servicios/pub-sub.service';

@Global()
@Module({
  controllers: [],
  providers: [PubSubService],
  exports: [PubSubService],
})
export class MediSupplyMessagingPubsubModule {}

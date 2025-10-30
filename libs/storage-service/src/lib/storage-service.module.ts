import { Module } from '@nestjs/common';
import { GcpStorageService } from './gcp-storage/gcp-storage.service';

@Module({
  controllers: [],
  providers: [GcpStorageService],
  exports: [GcpStorageService],
})
export class MediSupplyStorageServiceModule {}

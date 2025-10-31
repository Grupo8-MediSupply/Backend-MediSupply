import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReportesRepository } from './repositories/reportes.repository';

@Module({
  controllers: [ReportesController],
  providers: [
    ReportesService,
    {
      provide: 'IReportesRepository',
      useClass: ReportesRepository,
    },
  ],
  exports: [ReportesService],
})
export class ReportesModule {}

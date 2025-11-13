import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaConsumerService } from './auditoria-consumer.service';

describe('AuditoriaConsumerService', () => {
  let service: AuditoriaConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditoriaConsumerService],
    }).compile();

    service = module.get<AuditoriaConsumerService>(AuditoriaConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

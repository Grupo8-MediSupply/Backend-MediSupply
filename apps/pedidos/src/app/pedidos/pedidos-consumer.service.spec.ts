import { Test, TestingModule } from '@nestjs/testing';
import { PedidosConsumerService } from './pedidos-consumer.service';

describe('PedidosConsumerService', () => {
  let service: PedidosConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PedidosConsumerService],
    }).compile();

    service = module.get<PedidosConsumerService>(PedidosConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

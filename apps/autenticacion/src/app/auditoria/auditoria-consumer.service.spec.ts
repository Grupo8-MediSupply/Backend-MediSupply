import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaConsumerService } from './auditoria-consumer.service';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaConsumerService', () => {
  let service: AuditoriaConsumerService;
  let mockPubSub: { subscribe: jest.Mock };
  let mockAuditoriaService: { crearAuditoria: jest.Mock };

  beforeEach(async () => {
    mockPubSub = { subscribe: jest.fn().mockResolvedValue(undefined) };
    mockAuditoriaService = { crearAuditoria: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaConsumerService,
        { provide: PubSubService, useValue: mockPubSub },
        { provide: AuditoriaService, useValue: mockAuditoriaService },
      ],
    }).compile();

    service = module.get<AuditoriaConsumerService>(AuditoriaConsumerService);
  // silence logger outputs from the service during tests
  (service as any).logger = { log: jest.fn(), error: jest.fn() };
  });

  afterEach(() => jest.resetAllMocks());

  it('onModuleInit -> process message and ack on success (AAA)', async () => {
    // Arrange
    const rawMsg = {
      id: 'a1',
      action: 'do',
      email: 'u@x.com',
      ip: '1.2.3.4',
      userId: 'u1',
      response: { ok: true },
      timestamp: Date.now(),
    };

    // Act: initialize (will register handler)
    await service.onModuleInit();

    expect(mockPubSub.subscribe).toHaveBeenCalledWith('auditoria-sub', expect.any(Function));

    const handler = mockPubSub.subscribe.mock.calls[0][1];

    const message: any = {
      data: Buffer.from(JSON.stringify(rawMsg)),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    // Act: call handler
    await handler(message);

    // Assert
    expect(mockAuditoriaService.crearAuditoria).toHaveBeenCalledTimes(1);
    expect(message.ack).toHaveBeenCalled();
    expect(message.nack).not.toHaveBeenCalled();
  });

  it('onModuleInit -> nack on service error (AAA)', async () => {
    // Arrange
    const rawMsg = { id: 'a2', action: 'err' };
    (mockAuditoriaService.crearAuditoria as jest.Mock).mockRejectedValue(new Error('fail'));

    await service.onModuleInit();
    const handler = mockPubSub.subscribe.mock.calls[0][1];

    const message: any = { data: Buffer.from(JSON.stringify(rawMsg)), ack: jest.fn(), nack: jest.fn() };

    // Act
    await handler(message);

    // Assert
    expect(mockAuditoriaService.crearAuditoria).toHaveBeenCalled();
    expect(message.nack).toHaveBeenCalled();
    expect(message.ack).not.toHaveBeenCalled();
  });

  it('onModuleInit -> nack when message JSON invalid (AAA)', async () => {
    // Arrange
    await service.onModuleInit();
    const handler = mockPubSub.subscribe.mock.calls[0][1];

    const message: any = { data: Buffer.from('invalid json'), ack: jest.fn(), nack: jest.fn() };

    // Act
    await handler(message);

    // Assert
    expect(message.nack).toHaveBeenCalled();
    expect(message.ack).not.toHaveBeenCalled();
  });
});

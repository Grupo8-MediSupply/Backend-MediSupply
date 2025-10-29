import { PedidosConsumerService } from './pedidos-consumer.service';
import { PedidosService } from './pedidos.service';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { Logger } from '@nestjs/common'; // ...existing code...

type MockMessage = {
  id: string;
  data: Buffer;
  ack: jest.Mock<void, []>;
  nack: jest.Mock<void, []>;
};

describe('PedidosConsumerService', () => {
  let consumer: PedidosConsumerService;
  let mockPubSub: {
    subscribe: jest.Mock<Promise<void>, [string, (message: MockMessage) => Promise<void>]>;
  };
  let mockPedidosService: {
    ActualizarOrden: jest.Mock<Promise<void>, [unknown]>;
  };

  let capturedHandler: ((message: MockMessage) => Promise<void>) | undefined;

  beforeEach(() => {
    capturedHandler = undefined;

    // Silence Nest Logger to avoid noisy output during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    mockPubSub = {
      subscribe: jest.fn().mockImplementation(async (_topic: string, handler: (m: MockMessage) => Promise<void>) => {
        // simulate subscribe registering the handler
        capturedHandler = handler;
      }),
    };

    mockPedidosService = {
      ActualizarOrden: jest.fn().mockResolvedValue(undefined),
    };

    // instantiate service with mocks
    consumer = new PedidosConsumerService(
      // cast to expected types
      mockPedidosService as unknown as PedidosService,
      mockPubSub as unknown as PubSubService
    );
  });

  afterEach(() => {
    // restore original Logger implementations and reset mocks
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("subscribes to 'ordenes-sub' on module init and processes a valid message (calls ActualizarOrden and ack)", async () => {
    await consumer.onModuleInit();

    expect(mockPubSub.subscribe).toHaveBeenCalledTimes(1);
    expect(mockPubSub.subscribe).toHaveBeenCalledWith('ordenes-sub', expect.any(Function));
    expect(typeof capturedHandler).toBe('function');

    // prepare a sample order payload
    const sampleOrder = {
      id: 'order-1',
      cliente: 'cliente-1',
      vendedor: 'vend-1',
      productos: [{ lote: 'L1', cantidad: 2 }],
    };

    const message: MockMessage = {
      id: 'msg-1',
      data: Buffer.from(JSON.stringify(sampleOrder)),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    // invoke the captured handler as pubsub would do
    await capturedHandler!(message);

    expect(mockPedidosService.ActualizarOrden).toHaveBeenCalledTimes(1);
    expect(mockPedidosService.ActualizarOrden).toHaveBeenCalledWith(sampleOrder);
    expect(message.ack).toHaveBeenCalledTimes(1);
    expect(message.nack).not.toHaveBeenCalled();
  });

  it('calls nack when ActualizarOrden throws and does not ack', async () => {
    // make ActualizarOrden throw
    const error = new Error('fail update');
    mockPedidosService.ActualizarOrden.mockRejectedValueOnce(error);

    await consumer.onModuleInit();
    expect(typeof capturedHandler).toBe('function');

    const sampleOrder = { id: 'order-2', cliente: 'c2', productos: [] };

    const message: MockMessage = {
      id: 'msg-2',
      data: Buffer.from(JSON.stringify(sampleOrder)),
      ack: jest.fn(),
      nack: jest.fn(),
    };

    // handler should catch and call nack
    await capturedHandler!(message);

    expect(mockPedidosService.ActualizarOrden).toHaveBeenCalledTimes(1);
    expect(mockPedidosService.ActualizarOrden).toHaveBeenCalledWith(sampleOrder);
    expect(message.nack).toHaveBeenCalledTimes(1);
    expect(message.ack).not.toHaveBeenCalled();
  });

  it('handles non-JSON payload by calling nack', async () => {
    await consumer.onModuleInit();
    expect(typeof capturedHandler).toBe('function');

    const invalidBuffer = Buffer.from('not-a-json');

    const message: MockMessage = {
      id: 'msg-3',
      data: invalidBuffer,
      ack: jest.fn(),
      nack: jest.fn(),
    };

    // handler should throw inside and call nack
    await capturedHandler!(message);

    expect(mockPedidosService.ActualizarOrden).not.toHaveBeenCalled();
    expect(message.nack).toHaveBeenCalledTimes(1);
    expect(message.ack).not.toHaveBeenCalled();
  });
});
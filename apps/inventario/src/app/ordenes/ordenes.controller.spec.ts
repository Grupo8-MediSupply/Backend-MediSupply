import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';

describe('OrdenesController', () => {
  let controller: OrdenesController;
  let ordenesServiceMock: { crearOrdenPorCliente: jest.Mock };

  beforeEach(async () => {
    ordenesServiceMock = {
      crearOrdenPorCliente: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdenesController],
      providers: [
        {
          provide: OrdenesService,
          useValue: ordenesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<OrdenesController>(OrdenesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('crearOrden llama a crearOrdenPorCliente con el dto y el userId (jwt.sub)', () => {
    const dto = { /* campos mínimos según el DTO si se requieren */ } as any;
    const jwt = { sub: 'user-123' } as any;

    controller.crearOrden(dto, jwt);

    expect(ordenesServiceMock.crearOrdenPorCliente).toHaveBeenCalledTimes(1);
    const callArgs = ordenesServiceMock.crearOrdenPorCliente.mock.calls[0];
    expect(callArgs[0]).toBe(dto);
    expect(callArgs[1]).toBe('user-123');
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesController } from './ordenes.controller';
import { OrdenesService } from './ordenes.service';
import { CrearOrdenDto } from './dtos/crear-orden.dto';
import { type JwtPayloadDto } from '@medi-supply/shared';

describe('OrdenesController', () => {
  let controller: OrdenesController;
  let ordenesServiceMock: {
    crearOrden: jest.Mock;
    obtenerHistorialPorCliente: jest.Mock;
  };

  beforeEach(async () => {
    ordenesServiceMock = {
      crearOrden: jest.fn(),
      obtenerHistorialPorCliente: jest.fn(),
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

    expect(ordenesServiceMock.crearOrden).toHaveBeenCalledTimes(1);
    const callArgs = ordenesServiceMock.crearOrden.mock.calls[0];
    expect(callArgs[0]).toBe(dto);
    expect(callArgs[1]).toBe('user-123');
  });

  it('crearOrdenVendedor (porVendedor/:clienteId) llama a crearOrden con dto, clienteId, jwt.pais y jwt.sub', async () => {
    const clienteId = 'cliente-999';
    const dto = { productos: [] } as CrearOrdenDto;
    const jwt = { sub: 'vendedor-abc', pais: 22 } as unknown as JwtPayloadDto;

    await controller.crearOrdenVendedor(clienteId, dto, jwt);

    expect(ordenesServiceMock.crearOrden).toHaveBeenCalledTimes(1);
    const callArgs = ordenesServiceMock.crearOrden.mock.calls[0];
    expect(callArgs[0]).toBe(dto);
    expect(callArgs[1]).toBe(clienteId); // clienteId from route param
    expect(callArgs[2]).toBe(jwt.pais); // paisId from jwt
    expect(callArgs[3]).toBe(jwt.sub); // vendedorId from jwt.sub
  });

  it('obtenerHistorialCliente delega en el servicio con clienteId y vendedorId', async () => {
    const clienteId = 'cliente-222';
    const jwt = { sub: 'vend-xyz' } as unknown as JwtPayloadDto;
    const historialEsperado = [{ ordenId: 'orden-1' }];
    ordenesServiceMock.obtenerHistorialPorCliente.mockResolvedValueOnce(historialEsperado);

    const resultado = await controller.obtenerHistorialCliente(clienteId, jwt);

    expect(ordenesServiceMock.obtenerHistorialPorCliente).toHaveBeenCalledTimes(1);
    expect(ordenesServiceMock.obtenerHistorialPorCliente).toHaveBeenCalledWith(
      clienteId,
      jwt.sub
    );
    expect(resultado).toBe(historialEsperado);
  });
});

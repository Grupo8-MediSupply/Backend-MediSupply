import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ObtenerPedidosQueryDto } from './dtos/filtro-obtener-ordenes.dto';

describe('PedidosController', () => {
  let controller: PedidosController;
  let mockPedidosService: {
    ObtenerOrdenesParaEntregar: jest.Mock<Promise<unknown[]>, [number, string | undefined, string | undefined]>;
    ObtenerPedidosPorCliente: jest.Mock<Promise<unknown[]>, [string, ObtenerPedidosQueryDto | undefined]>;
  };

  beforeEach(async () => {
    mockPedidosService = {
      ObtenerOrdenesParaEntregar: jest.fn(),
      ObtenerPedidosPorCliente: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        {
          provide: PedidosService,
          useValue: mockPedidosService,
        },
      ],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debe llamar al servicio con fechas cuando se proveen y devolver resultado', async () => {
    const fechaInicio = '2025-10-01';
    const fechaFin = '2025-10-31';
    const jwt: JwtPayloadDto = { sub: 'u1', pais: 51, role: 1, email: 'a@b.com' } as JwtPayloadDto;
    const expected = [{ id: 'o1' }, { id: 'o2' }] as unknown[];

    mockPedidosService.ObtenerOrdenesParaEntregar.mockResolvedValueOnce(expected);

    const res = await controller.obtenerOrdenesParaEntregar(fechaInicio, fechaFin, jwt);

    expect(mockPedidosService.ObtenerOrdenesParaEntregar).toHaveBeenCalledTimes(1);
    expect(mockPedidosService.ObtenerOrdenesParaEntregar).toHaveBeenCalledWith(jwt.pais, fechaInicio, fechaFin);
    expect(res).toBe(expected);
  });

  it('debe llamar al servicio con fechas undefined cuando no se proveen', async () => {
    const jwt: JwtPayloadDto = { sub: 'u2', pais: 99, role: 1, email: 'x@y.com' } as JwtPayloadDto;
    const expected: unknown[] = [];

    mockPedidosService.ObtenerOrdenesParaEntregar.mockResolvedValueOnce(expected);

    const res = await controller.obtenerOrdenesParaEntregar(undefined, undefined, jwt);

    expect(mockPedidosService.ObtenerOrdenesParaEntregar).toHaveBeenCalledTimes(1);
    expect(mockPedidosService.ObtenerOrdenesParaEntregar).toHaveBeenCalledWith(jwt.pais, undefined, undefined);
    expect(res).toBe(expected);
  });

  it('propaga el error si el servicio falla', async () => {
    const jwt: JwtPayloadDto = { sub: 'u3', pais: 1, role: 1, email: 'e@e.com' } as JwtPayloadDto;
    const err = new Error('boom');
    mockPedidosService.ObtenerOrdenesParaEntregar.mockRejectedValueOnce(err);

    await expect(controller.obtenerOrdenesParaEntregar(undefined, undefined, jwt)).rejects.toThrow(err);
    expect(mockPedidosService.ObtenerOrdenesParaEntregar).toHaveBeenCalledWith(jwt.pais, undefined, undefined);
  });

  it('debe llamar a ObtenerPedidosPorCliente con jwt.sub y query y devolver resultado', async () => {
    const jwt: JwtPayloadDto = { sub: 'cliente1', pais: 51, role: 2, email: 'c@d.com' } as JwtPayloadDto;
  const query: ObtenerPedidosQueryDto = { page: 1, limit: 10 } as unknown as ObtenerPedidosQueryDto;
    const expected = [{ id: 'p1' }, { id: 'p2' }] as unknown[];
  mockPedidosService.ObtenerPedidosPorCliente.mockResolvedValueOnce(expected);

  const res = await controller.obtenerPedidosPorCliente(query, jwt);

  expect(mockPedidosService.ObtenerPedidosPorCliente).toHaveBeenCalledTimes(1);
  expect(mockPedidosService.ObtenerPedidosPorCliente).toHaveBeenCalledWith(jwt.sub, query);
  expect(res).toBe(expected);
  });

  it('propaga el error si ObtenerPedidosPorCliente falla', async () => {
    const jwt: JwtPayloadDto = { sub: 'cliente2', pais: 51, role: 2, email: 'd@e.com' } as JwtPayloadDto;
  const query: ObtenerPedidosQueryDto = { page: 2 } as unknown as ObtenerPedidosQueryDto;
    const err = new Error('cliente-error');
  mockPedidosService.ObtenerPedidosPorCliente.mockRejectedValueOnce(err);

  await expect(controller.obtenerPedidosPorCliente(query, jwt)).rejects.toThrow(err);
  expect(mockPedidosService.ObtenerPedidosPorCliente).toHaveBeenCalledWith(jwt.sub, query);
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesService } from './ordenes.service';
import { PubSubService } from '@medi-supply/messaging-pubsub';
import { ProductoService } from '../productos/producto.service';
import { CrearOrdenClienteDto } from './dtos/crear-orden.dto';

// TypeScript
// Additional tests to append to apps/inventario/src/app/ordenes/ordenes.service.spec.ts

type ProductoDto = { lote: string; cantidad: number };
type CrearOrdenClienteDtoLocal = { productos: ProductoDto[]; vendedor?: string };
type ProductoInfo = { id: string; precio: number } | undefined;
type OrdenPersisted = { id: string; estado: string; [key: string]: unknown };

describe('OrdenesService - crearOrdenPorCliente', () => {
  let service: OrdenesService;

  // typed mocks
  let mockPubSub: { publish: jest.Mock };
  let mockProductoService: { findByLote: jest.Mock<Promise<ProductoInfo>, [string]> };
  let mockRepository: { crearOrden: jest.Mock<Promise<OrdenPersisted>, [unknown]> };

  beforeEach(async () => {
    mockPubSub = { publish: jest.fn() };

    mockProductoService = {
      findByLote: jest.fn<Promise<ProductoInfo>, [string]>(),
    };

    mockRepository = {
      crearOrden: jest.fn<Promise<OrdenPersisted>, [unknown]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        { provide: PubSubService, useValue: mockPubSub },
        { provide: 'IOrdenesRepository', useValue: mockRepository },
        { provide: ProductoService, useValue: mockProductoService },
      ],
    }).compile();

    service = module.get<OrdenesService>(OrdenesService);
  });

  it('creates order, enriches productos when producto info exists, publishes and returns id/estado', async () => {
    const crearDto: CrearOrdenClienteDtoLocal = {
      productos: [{ lote: 'L1', cantidad: 2 }],
      vendedor: 'v-1',
    };
    const clienteId = 'c-1';

    mockProductoService.findByLote.mockResolvedValueOnce({ id: 'regional-1', precio: 500 });

    const persisted: OrdenPersisted = { id: 'order-1', estado: 'CREADA', cliente: clienteId };
    mockRepository.crearOrden.mockImplementationOnce(async (orden) => {
      // return persisted order; preserve orden structure not required but helpful
      return persisted;
    });

    const result = await service.crearOrdenPorCliente(crearDto as unknown as CrearOrdenClienteDto, clienteId);

    expect(mockProductoService.findByLote).toHaveBeenCalledTimes(1);
    expect(mockProductoService.findByLote).toHaveBeenCalledWith('L1');

    expect(mockRepository.crearOrden).toHaveBeenCalledTimes(1);
    const calledWith = mockRepository.crearOrden.mock.calls[0][0] as { cliente: string; vendedor?: string; productos: Array<Record<string, unknown>> };
    expect(calledWith.cliente).toBe(clienteId);
    expect(calledWith.vendedor).toBe('v-1');
    expect(Array.isArray(calledWith.productos)).toBe(true);
    expect(calledWith.productos[0].lote).toBe('L1');
    expect(calledWith.productos[0].cantidad).toBe(2);
    expect(calledWith.productos[0].productoRegional).toBe('regional-1');
    expect(calledWith.productos[0].precioUnitario).toBe(500);

    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledWith('ordenes', persisted);

    expect(result).toEqual({ id: 'order-1', estado: 'CREADA' });
  });

  it('sets productoRegional and precioUnitario undefined when producto info is not found', async () => {
    const crearDto: CrearOrdenClienteDtoLocal = {
      productos: [{ lote: 'L2', cantidad: 1 }],
      vendedor: 'v-2',
    };
    const clienteId = 'c-2';

    mockProductoService.findByLote.mockResolvedValueOnce(undefined);

    const persisted: OrdenPersisted = { id: 'order-2', estado: 'PENDIENTE' };
    mockRepository.crearOrden.mockResolvedValueOnce(persisted);

    const result = await service.crearOrdenPorCliente(crearDto as unknown as CrearOrdenClienteDto, clienteId);

    const calledWith = mockRepository.crearOrden.mock.calls[0][0] as { productos: Array<Record<string, unknown>> };
    expect(calledWith.productos[0].productoRegional).toBeUndefined();
    expect(calledWith.productos[0].precioUnitario).toBeUndefined();

    expect(mockPubSub.publish).toHaveBeenCalledWith('ordenes', persisted);
    expect(result).toEqual({ id: 'order-2', estado: 'PENDIENTE' });
  });

  it('calls findByLote for each producto when multiple productos provided', async () => {
    const crearDto: CrearOrdenClienteDtoLocal = {
      productos: [
        { lote: 'A', cantidad: 1 },
        { lote: 'B', cantidad: 3 },
      ],
      vendedor: 'v-3',
    };
    const clienteId = 'c-3';

    mockProductoService.findByLote
      .mockResolvedValueOnce({ id: 'rA', precio: 10 })
      .mockResolvedValueOnce({ id: 'rB', precio: 20 });

    const persisted: OrdenPersisted = { id: 'order-3', estado: 'CREADA' };
    mockRepository.crearOrden.mockResolvedValueOnce(persisted);

    await service.crearOrdenPorCliente(crearDto as unknown as CrearOrdenClienteDto, clienteId);

    expect(mockProductoService.findByLote).toHaveBeenCalledTimes(2);
    expect(mockProductoService.findByLote).toHaveBeenNthCalledWith(1, 'A');
    expect(mockProductoService.findByLote).toHaveBeenNthCalledWith(2, 'B');

    const productosEnviados = (mockRepository.crearOrden.mock.calls[0][0] as { productos: Array<Record<string, unknown>> }).productos;
    expect(productosEnviados[0].productoRegional).toBe('rA');
    expect(productosEnviados[0].precioUnitario).toBe(10);
    expect(productosEnviados[1].productoRegional).toBe('rB');
    expect(productosEnviados[1].precioUnitario).toBe(20);
  });

  it('propagates errors from repository and does not publish when creation fails', async () => {
    const crearDto: CrearOrdenClienteDtoLocal = {
      productos: [{ lote: 'X', cantidad: 5 }],
    };
    const clienteId = 'c-err';

    mockProductoService.findByLote.mockResolvedValueOnce({ id: 'rX', precio: 99 });

    const error = new Error('DB failure');
    mockRepository.crearOrden.mockRejectedValueOnce(error);

    await expect(service.crearOrdenPorCliente(crearDto as unknown as CrearOrdenClienteDto, clienteId)).rejects.toThrow('DB failure');

    expect(mockRepository.crearOrden).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).not.toHaveBeenCalled();
  });

  it('handles empty productos array without calling findByLote', async () => {
    const crearDto: CrearOrdenClienteDtoLocal = {
      productos: [],
      vendedor: 'v-empty',
    };
    const clienteId = 'c-empty';

    const persisted: OrdenPersisted = { id: 'order-empty', estado: 'CREADA' };
    mockRepository.crearOrden.mockResolvedValueOnce(persisted);

    const result = await service.crearOrdenPorCliente(crearDto as unknown as CrearOrdenClienteDto, clienteId);

    expect(mockProductoService.findByLote).not.toHaveBeenCalled();
    expect(mockRepository.crearOrden).toHaveBeenCalledTimes(1);
    const calledWith = mockRepository.crearOrden.mock.calls[0][0] as { productos: unknown[] };
    expect(Array.isArray(calledWith.productos)).toBe(true);
    expect(calledWith.productos.length).toBe(0);

    expect(mockPubSub.publish).toHaveBeenCalledWith('ordenes', persisted);
    expect(result).toEqual({ id: 'order-empty', estado: 'CREADA' });
  });
});

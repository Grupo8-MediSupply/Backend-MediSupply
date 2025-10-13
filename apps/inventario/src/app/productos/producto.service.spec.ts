import { BadRequestException } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto, TipoProducto } from './dtos/request/create-producto.dto';
import {
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  type IProductoRepository,
  type ProductoVariant,
} from '@medi-supply/productos-dm';

describe('ProductoService (unit)', () => {
  let service: ProductoService;
  let mockRepo: jest.Mocked<IProductoRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      // si IProductoRepository tiene más métodos, agrégalos como jest.fn()
    } as unknown as jest.Mocked<IProductoRepository>;

    service = new ProductoService(mockRepo);
  });

  test('crea medicamento correctamente y llama al repo con ProductoMedicamento', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-001',
      nombre: 'Paracetamol',
      descripcion: 'Analgesico',
      tipo: TipoProducto.MEDICAMENTO,
      medicamento: {
        principioActivo: 'Paracetamol',
        concentracion: '500mg',
      },
    };

    const createdFromRepo = { id: 'm-1' } as unknown as ProductoVariant;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ProductoMedicamento);
    expect(result).toBe(createdFromRepo);
  });

  test('crea insumo medico y convierte fechaVencimiento a Date cuando es string', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-002',
      nombre: 'Guantes',
      descripcion: 'Desechables',
      tipo: TipoProducto.INSUMO_MEDICO,
      insumoMedico: {
        marca: 'MarcaX',
        modelo: 'M1',
        fabricante: 'Fab',
        unidad: 'par',
        lote: 'L-123',
        fechaVencimiento: '2025-12-31',
      },
    };

    const createdFromRepo = { id: 'i-1' } as unknown as ProductoVariant;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ProductoInsumoMedico);
    // verificar conversión de fecha si la propiedad es accesible
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(arg.fechaVencimiento).toBeInstanceOf(Date);
    expect(result).toBe(createdFromRepo);
  });

  test('crea equipo medico y convierte fechaCompra a Date cuando es string', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-003',
      nombre: 'Monitor',
      descripcion: 'Monitor de signos',
      tipo: TipoProducto.EQUIPO_MEDICO,
      equipoMedico: {
        marca: 'MarcaY',
        modelo: 'XY-1',
        numeroSerie: 'SN123',
        proveedor: 'ProveedorX',
        fechaCompra: '2024-06-01',
        garantiaMeses: 24,
      },
    };

    const createdFromRepo = { id: 'e-1' } as unknown as ProductoVariant;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ProductoEquipoMedico);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(arg.fechaCompra).toBeInstanceOf(Date);
    expect(result).toBe(createdFromRepo);
  });

  test('lanza BadRequestException cuando faltan datos de medicamento', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-004',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.MEDICAMENTO,
      medicamento: undefined as any,
    };

    await expect(service.createProducto(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException cuando faltan datos de insumo medico', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-005',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.INSUMO_MEDICO,
      insumoMedico: undefined as any,
    };

    await expect(service.createProducto(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException cuando faltan datos de equipo medico', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-006',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.EQUIPO_MEDICO,
      equipoMedico: undefined as any,
    };

    await expect(service.createProducto(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException para tipo de producto no valido', async () => {
    const dto = {
      sku: 'SKU-007',
      nombre: 'X',
      descripcion: 'Y',
      tipo: 'INVALID_TIPO',
    } as unknown as CreateProductoDto;

    await expect(service.createProducto(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('maneja insumo médico sin fechaVencimiento', async () => {
  const dto: CreateProductoDto = {
    sku: 'SKU-010',
    nombre: 'Jeringa',
    descripcion: 'Uso hospitalario',
    tipo: TipoProducto.INSUMO_MEDICO,
    insumoMedico: {
      marca: 'MarcaZ',
      modelo: 'XZ-10',
      fabricante: 'FabZ',
      unidad: 'unidad',
      lote: 'L-999',
      fechaVencimiento: undefined,
    },
  };

  const createdFromRepo = { id: 'i-2' } as any;
  mockRepo.create.mockResolvedValue(createdFromRepo);

  const result = await service.createProducto(dto);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(arg.fechaVencimiento).toBeUndefined();
  expect(result).toBe(createdFromRepo);
});

test('maneja equipo médico sin fechaCompra', async () => {
  const dto: CreateProductoDto = {
    sku: 'SKU-011',
    nombre: 'Balanza',
    descripcion: 'Equipo de medición',
    tipo: TipoProducto.EQUIPO_MEDICO,
    equipoMedico: {
      marca: 'MarcaQ',
      modelo: 'Q-10',
      numeroSerie: 'SN999',
      proveedor: 'ProvQ',
      fechaCompra: undefined,
      garantiaMeses: 12,
    },
  };

  const createdFromRepo = { id: 'e-2' } as any;
  mockRepo.create.mockResolvedValue(createdFromRepo);

  const result = await service.createProducto(dto);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(arg.fechaCompra).toBeUndefined();
  expect(result).toBe(createdFromRepo);
});


});
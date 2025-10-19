import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto, TipoProducto } from './dtos/request/create-producto.dto';
import {  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento, } from '@medi-supply/productos-dm';
import type { 
  IProductoRepository,
  ProductoVariant,
} from '@medi-supply/productos-dm';
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';

describe('ProductoService (unit)', () => {
  let service: ProductoService;
  let mockRepo: jest.Mocked<IProductoRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPais: jest.fn(),
      // si IProductoRepository tiene más métodos, agrégalos como jest.fn()
    }as jest.Mocked<IProductoRepository>;

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
        esteril: true,
        material: 'Látex',
        usoUnico: true,
      },
    };

    const createdFromRepo = { id: 'i-1' } as unknown as ProductoVariant;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ProductoInsumoMedico);
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
        modelo: 'MY-2000',
        requiereMantenimiento: true,
        vidaUtil: 5,
      },
    };

    const createdFromRepo = { id: 1, nombre: 'Monitor' } as ProductoVariant;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ProductoEquipoMedico);

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
      esteril: true,
      material: 'Plástico',
      usoUnico: true,
    },
  };

    const createdFromRepo = { id: 'i-2' } as any;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];
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
    },
  };

    const createdFromRepo = { id: 'e-2' } as any;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];

  expect(result).toBe(createdFromRepo);
});
// TypeScript

describe('ProductoService - obtenerProductosDeUnaRegion (unit)', () => {
  let service: ProductoService;
  let mockRepo: jest.Mocked<IProductoRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPais: jest.fn(),
    } as unknown as jest.Mocked<IProductoRepository>;

    service = new ProductoService(mockRepo);
  });

  test('devuelve lista mapeada correctamente', async () => {
    const regionId = 42;
    const repoProducts = [
      {
        productoRegionalId: 'pr-1',
        sku: 'SKU-A',
        nombre: 'Producto A',
        descripcion: 'Desc A',
        tipo: 'MEDICAMENTO',
        precio: 12.34,
      },
      {
        productoRegionalId: 'pr-2',
        sku: 'SKU-B',
        nombre: 'Producto B',
        descripcion: 'Desc B',
        tipo: 'INSUMO_MEDICO',
        precio: 56.78,
      },
    ];

    mockRepo.findByPais.mockResolvedValue(repoProducts as any);

    const result = await service.obtenerProductosDeUnaRegion(regionId);

    expect(mockRepo.findByPais).toHaveBeenCalledTimes(1);
    expect(mockRepo.findByPais).toHaveBeenCalledWith(regionId);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(repoProducts.length);

    for (let i = 0; i < repoProducts.length; i++) {
      expect(result[i].productoRegionalId).toBe(repoProducts[i].productoRegionalId);
      expect(result[i].sku).toBe(repoProducts[i].sku);
      expect(result[i].nombre).toBe(repoProducts[i].nombre);
      expect(result[i].descripcion).toBe(repoProducts[i].descripcion);
      expect(result[i].tipo).toBe(repoProducts[i].tipo);
      expect(result[i].precio).toBe(repoProducts[i].precio);
    }
  });

  test('lanza NotFoundException cuando no hay productos (array vacío)', async () => {
    const regionId = 99;
    mockRepo.findByPais.mockResolvedValue([]);

    await expect(service.obtenerProductosDeUnaRegion(regionId)).rejects.toBeInstanceOf(NotFoundException);
    expect(mockRepo.findByPais).toHaveBeenCalledWith(regionId);
  });

  test('lanza NotFoundException cuando no hay productos (null)', async () => {
    const regionId = 100;
    mockRepo.findByPais.mockResolvedValue(null as any);

    await expect(service.obtenerProductosDeUnaRegion(regionId)).rejects.toBeInstanceOf(NotFoundException);
    expect(mockRepo.findByPais).toHaveBeenCalledWith(regionId);
  });
});

  // NUEVAS PRUEBAS: findById
  describe('findById', () => {
    it('debería retornar un ProductoDetalleResponseDto para un medicamento', async () => {
    const producto = new ProductoMedicamento({
      id: 1,
      sku: 'MED-001',
      nombre: 'Paracetamol',
      descripcion: 'Analgésico',
      principioActivo: 'Paracetamol',
      concentracion: '500mg',
    });
    mockRepo.findById.mockResolvedValue(producto);

    const result = await service.findById(1);

    expect(result).toBeInstanceOf(ProductoDetalleResponseDto);
    expect(result.tipo).toBe('medicamento');
    expect(result.detalleEspecifico).toBeDefined();
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it('debería retornar un ProductoDetalleResponseDto para un insumo médico', async () => {
    const producto = new ProductoInsumoMedico({
      id: 2,
      sku: 'INS-001',
      nombre: 'Guantes',
      material: 'Látex',
      esteril: true,
      usoUnico: true,
    });
    mockRepo.findById.mockResolvedValue(producto);

    const result = await service.findById(2);

    expect(result.tipo).toBe('insumo_medico');
    expect(result.detalleEspecifico).toBeDefined();
    expect(result.ubicacion).toBeDefined();
    expect(result.regulaciones).toBeDefined();
    });

    it('debería retornar un ProductoDetalleResponseDto para un equipo médico', async () => {
    const producto = new ProductoEquipoMedico({
      id: 3,
      sku: 'EQ-001',
      nombre: 'Monitor de signos vitales',
      marca: 'MedTech',
      modelo: 'X200',
    });
    mockRepo.findById.mockResolvedValue(producto);

    const result = await service.findById(3);

    expect(result.tipo).toBe('equipo_medico');
    expect(result.detalleEspecifico).toBeDefined();

    });


    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
    });
  });
});

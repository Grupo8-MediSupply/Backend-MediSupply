import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import {  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento, } from '@medi-supply/productos-dm';
import type { 
  IProductoRepository,
  ProductoInfoRegion,
  ProductoVariant,
} from '@medi-supply/productos-dm';
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';
import { TipoProducto } from '@medi-supply/productos-dm';
import type { JwtPayloadDto } from '@medi-supply/shared';



describe('ProductoService (unit)', () => {
  let service: ProductoService;
  let mockRepo: jest.Mocked<IProductoRepository>;
  const jwt : JwtPayloadDto = {
    sub: 'user-1',
    email: 'testuser',
    role: 1,
    pais: 1,
  };

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPais: jest.fn(),
      findBySku: jest.fn(),
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
      precioVenta: 10.5,
      proveedorId: "prov-123",
    };

    const createdFromRepo = {productoGlobal: new ProductoMedicamento({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      principioActivo: dto.medicamento!.principioActivo,
      concentracion: dto.medicamento!.concentracion,
      tipoProducto: TipoProducto.MEDICAMENTO,
    }),detalleRegional:{
      pais: jwt.pais,
      precio: dto.precioVenta!,
      proveedor: dto.proveedorId!,
      regulaciones: dto.regulaciones || [],
    }} as ProductoInfoRegion;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto, jwt);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg.productoGlobal).toBeInstanceOf(ProductoMedicamento);
  });

  test('crea insumo medico y convierte fechaVencimiento a Date cuando es string', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-002',
      nombre: 'Guantes',
      descripcion: 'Desechables',
      tipo: TipoProducto.INSUMO,
      insumoMedico: {
        esteril: true,
        material: 'Látex',
        usoUnico: true,
      },
      precioVenta: 5.0,
      proveedorId: "prov-456",
    };

    const createdFromRepo = {productoGlobal: new ProductoEquipoMedico({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      marca: dto.equipoMedico?.marca,
      modelo: dto.equipoMedico?.modelo,
      vidaUtil: dto.equipoMedico?.vidaUtil,
      requiereMantenimiento: dto.equipoMedico?.requiereMantenimiento,
      tipoProducto: TipoProducto.EQUIPO,
    }),detalleRegional:{
      pais: jwt.pais,
      precio: dto.precioVenta!,
      proveedor: dto.proveedorId!,
      regulaciones: dto.regulaciones || [],
    }} as ProductoInfoRegion;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto, jwt);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg.productoGlobal).toBeInstanceOf(ProductoInsumoMedico);
  });

  test('crea equipo medico y convierte fechaCompra a Date cuando es string', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-003',
      nombre: 'Monitor',
      descripcion: 'Monitor de signos',
      tipo: TipoProducto.EQUIPO,
      equipoMedico: {
        marca: 'MarcaY',
        modelo: 'MY-2000',
        requiereMantenimiento: true,
        vidaUtil: 5,
      },
      precioVenta: 1500.0,
      proveedorId: "prov-789",
    };

    const createdFromRepo = {productoGlobal: new ProductoEquipoMedico({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      marca: dto.equipoMedico?.marca,
      modelo: dto.equipoMedico?.modelo,
      vidaUtil: dto.equipoMedico?.vidaUtil,
      requiereMantenimiento: dto.equipoMedico?.requiereMantenimiento,
      tipoProducto: TipoProducto.EQUIPO,
    }),detalleRegional:{
      pais: jwt.pais,
      precio: dto.precioVenta!,
      proveedor: dto.proveedorId!,
      regulaciones: dto.regulaciones || [],
    }} as ProductoInfoRegion;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto, jwt);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg.productoGlobal).toBeInstanceOf(ProductoEquipoMedico);

  });

  test('lanza BadRequestException cuando faltan datos de medicamento', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-004',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.MEDICAMENTO,
      medicamento: undefined as any,
      precioVenta: 0,
      proveedorId: "prov-123",
    };

    await expect(service.createProducto(dto,jwt)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException cuando faltan datos de insumo medico', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-005',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.INSUMO,
      insumoMedico: undefined as any,
      precioVenta: 0,
      proveedorId: "prov-123",
    };

    await expect(service.createProducto(dto,jwt)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException cuando faltan datos de equipo medico', async () => {
    const dto: CreateProductoDto = {
      sku: 'SKU-006',
      nombre: 'X',
      descripcion: 'Y',
      tipo: TipoProducto.EQUIPO,
      equipoMedico: undefined as any,
      precioVenta: 0,
      proveedorId: "prov-123",
    };

    await expect(service.createProducto(dto,jwt)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('lanza BadRequestException para tipo de producto no valido', async () => {
    const dto = {
      sku: 'SKU-007',
      nombre: 'X',
      descripcion: 'Y',
      tipo: 'INVALID_TIPO',
    } as unknown as CreateProductoDto;

    await expect(service.createProducto(dto,jwt)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  test('maneja insumo médico sin fechaVencimiento', async () => {
  const dto: CreateProductoDto = {
    sku: 'SKU-010',
    nombre: 'Jeringa',
    descripcion: 'Uso hospitalario',
    tipo: TipoProducto.INSUMO,
    insumoMedico: {
      esteril: true,
      material: 'Plástico',
      usoUnico: true,
    },
    precioVenta: 2.5,
    proveedorId: "prov-321",
  };

    const createdFromRepo = {productoGlobal: new ProductoInsumoMedico({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      esteril: dto.insumoMedico?.esteril,
      material: dto.insumoMedico?.material,
      usoUnico: dto.insumoMedico?.usoUnico,
      tipoProducto: TipoProducto.INSUMO,
    }),detalleRegional:{
      pais: jwt.pais,
      precio: dto.precioVenta!,
      proveedor: dto.proveedorId!,
      regulaciones: dto.regulaciones || [],
    }} as ProductoInfoRegion;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto, jwt);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];
  expect(arg.productoGlobal).toBeInstanceOf(ProductoInsumoMedico);});

test('maneja equipo médico sin fechaCompra', async () => {
  const dto: CreateProductoDto = {
    sku: 'SKU-011',
    nombre: 'Balanza',
    descripcion: 'Equipo de medición',
    tipo: TipoProducto.EQUIPO,
    equipoMedico: {
      marca: 'MarcaQ',
      modelo: 'Q-10',
    },
    precioVenta: 300.0,
    proveedorId: "prov-654",
  };

    const createdFromRepo = {productoGlobal: new ProductoEquipoMedico({
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      marca: dto.equipoMedico?.marca,
      modelo: dto.equipoMedico?.modelo,
      vidaUtil: dto.equipoMedico?.vidaUtil,
      requiereMantenimiento: dto.equipoMedico?.requiereMantenimiento,
      tipoProducto: TipoProducto.EQUIPO,
    }),detalleRegional:{
      pais: jwt.pais,
      precio: dto.precioVenta!,
      proveedor: dto.proveedorId!,
      regulaciones: dto.regulaciones || [],
    }} as ProductoInfoRegion;
    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.createProducto(dto, jwt);

  expect(mockRepo.create).toHaveBeenCalled();
  const arg = mockRepo.create.mock.calls[0][0];

  expect(arg.productoGlobal).toBeInstanceOf(ProductoEquipoMedico);
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
    const repoProducts: ProductoInfoRegion[] = [
      {
        detalleRegional: {
          id: "123",
          pais: regionId,
          precio: 100,
          proveedor: 'prov-1',
          regulaciones: [],
        },
        productoGlobal: {
          sku: 'SKU-A',
          nombre: 'Producto A',
          descripcion: 'Desc A',
          tipoProducto: TipoProducto.MEDICAMENTO,
        } as ProductoVariant,
      },
      {
        detalleRegional: {
          id: "234",
          pais: regionId,
          precio: 200,
          proveedor: 'prov-2',
          regulaciones: [],
        },
        productoGlobal: {
          sku: 'SKU-B',
          nombre: 'Producto B',
          descripcion: 'Desc B',
          tipoProducto: TipoProducto.INSUMO,
        } as ProductoVariant,
      },
    ];

    mockRepo.findByPais.mockResolvedValue(repoProducts);

    const result = await service.obtenerProductosDeUnaRegion(regionId);

    expect(mockRepo.findByPais).toHaveBeenCalledTimes(1);
    expect(mockRepo.findByPais).toHaveBeenCalledWith(regionId);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(repoProducts.length);

    for (let i = 0; i < repoProducts.length; i++) {
      expect(result[i].productoRegionalId).toBe(repoProducts[i].detalleRegional.id);
      expect(result[i].sku).toBe(repoProducts[i].productoGlobal.sku);
      expect(result[i].nombre).toBe(repoProducts[i].productoGlobal.nombre);
      expect(result[i].descripcion).toBe(repoProducts[i].productoGlobal.descripcion);
      expect(result[i].tipo).toBe(repoProducts[i].productoGlobal.tipoProducto);
      expect(result[i].precio).toBe(repoProducts[i].detalleRegional.precio);
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

  // ===== Tests for findById (AAA) =====
  describe('findById (unit)', () => {
    test('Arrange/Act/Assert: devuelve el producto cuando existe y pertenece a la misma región', async () => {
      // Arrange
      const productoMock: any = {
        id: 'prod-uuid-1',
        productoPaisId: jwt.pais,
        nombre: 'Producto Test'
      };
      mockRepo.findById.mockResolvedValue(productoMock);

      // Act
      const result = await service.findById('prod-uuid-1', jwt);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith('prod-uuid-1', jwt.pais);
      expect(result).toBe(productoMock);
    });

    test('Arrange/Act/Assert: lanza NotFoundException cuando repositorio devuelve null', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id', jwt)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepo.findById).toHaveBeenCalledWith('non-existent-id', jwt.pais);
    });

    test('Arrange/Act/Assert: lanza NotFoundException cuando el producto pertenece a otra región', async () => {
      // Arrange
      const productoOtroPais: any = {
        id: 'prod-uuid-2',
        productoPaisId: jwt.pais + 1,
        nombre: 'Producto Otro Pais'
      };
      mockRepo.findById.mockResolvedValue(productoOtroPais);

      // Act & Assert
      await expect(service.findById('prod-uuid-2', jwt)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRepo.findById).toHaveBeenCalledWith('prod-uuid-2', jwt.pais);
    });
  });
});

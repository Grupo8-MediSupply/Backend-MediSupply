import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import { UpdateProductoDto } from './dtos/request/update-producto.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ProductoDetalle, TipoProducto } from '@medi-supply/productos-dm';

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: jest.Mocked<ProductoService>;
  const jwt : JwtPayloadDto = {
    sub: 'user-1',
    email: 'testuser',
    role: 1,
    pais: 1,
  };

  beforeEach(async () => {
    const mockProductoService = {
      createProducto: jest.fn(),
      findById: jest.fn(),
      obtenerProductosDeUnaRegion: jest.fn(),
      actualizarProducto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: mockProductoService,
        },
      ],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
    service = module.get(ProductoService) as jest.Mocked<ProductoService>;
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createProducto', () => {
    it('debería llamar al servicio con el DTO correcto y retornar su resultado (medicamento)', async () => {
      const dto: CreateProductoDto = {
        sku: 'SKU-001',
        nombre: 'Paracetamol',
        descripcion: 'Analgesico',
        tipo: TipoProducto.MEDICAMENTO,
        medicamento: {
          principioActivo: 'Paracetamol',
          concentracion: '500mg',
        },
      } as unknown as CreateProductoDto;

      const expected = { id: 'm-1', sku: dto.sku } as any;
      service.createProducto.mockResolvedValue(expected);

      const result = await controller.createProducto(dto, jwt);

      expect(service.createProducto).toHaveBeenCalledWith(dto, jwt);
      expect(result).toBe(expected);
    });

    it('debería propagar el error si el servicio falla', async () => {
      const dto: CreateProductoDto = {
        sku: 'SKU-002',
        nombre: 'X',
        descripcion: 'Y',
        tipo: TipoProducto.MEDICAMENTO,
        medicamento: { principioActivo: 'X', concentracion: '1' },
      } as CreateProductoDto;

      service.createProducto.mockRejectedValue(new BadRequestException('bad'));

      await expect(controller.createProducto(dto, jwt)).rejects.toThrow(BadRequestException);
      expect(service.createProducto).toHaveBeenCalledWith(dto, jwt);
    });
  });

  describe('actualizarProducto', () => {
    it('debería delegar en el servicio y retornar el resultado', async () => {
      const dto: UpdateProductoDto = {
        sku: 'SKU-100',
        nombre: 'Producto Actualizado',
        descripcion: 'Descripción',
        tipo: TipoProducto.EQUIPO,
        equipoMedico: {
          marca: 'Marca',
          modelo: 'Modelo',
          vidaUtil: 5,
          requiereMantenimiento: true,
        },
        precioVenta: 1500,
        proveedorId: 'prov-xyz',
      } as UpdateProductoDto;

      const expected = {
        productoRegionalId: 'prod-123',
        sku: dto.sku,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        precio: dto.precioVenta,
      };

      service.actualizarProducto.mockResolvedValue(expected as any);

      const result = await controller.actualizarProducto('prod-123', dto, jwt);

      expect(service.actualizarProducto).toHaveBeenCalledWith('prod-123', dto, jwt);
      expect(result).toBe(expected);
    });

    it('propaga los errores lanzados por el servicio', async () => {
      const dto = {
        sku: 'SKU-FAIL',
        nombre: 'Falla',
        descripcion: '',
        tipo: TipoProducto.INSUMO,
        insumoMedico: { material: 'Plástico', esteril: true, usoUnico: true },
        precioVenta: 3,
        proveedorId: 'prov',
      } as UpdateProductoDto;

      service.actualizarProducto.mockRejectedValue(new NotFoundException());

      await expect(
        controller.actualizarProducto('prod-404', dto, jwt),
      ).rejects.toThrow(NotFoundException);
      expect(service.actualizarProducto).toHaveBeenCalledWith('prod-404', dto, jwt);
    });
  });

  // 🧪 TESTS FALTANTES: obtenerProductosPorRegion
  describe('obtenerProductosPorRegion', () => {
    it('debería llamar al servicio con el país del usuario y retornar los productos', async () => {
      const userRequest = { pais: 1 } as JwtPayloadDto;
      const expected = [
        { sku: 'SKU-001', nombre: 'Paracetamol', precio: 1000 },
        { sku: 'SKU-002', nombre: 'Ibuprofeno', precio: 1500 },
      ];

      service.obtenerProductosDeUnaRegion.mockResolvedValue(expected);

      const result = await controller.obtenerProductosPorRegion(userRequest);

      expect(service.obtenerProductosDeUnaRegion).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });

    it('debería lanzar el error si el servicio falla', async () => {
      const userRequest = { pais: 1 } as JwtPayloadDto;
      service.obtenerProductosDeUnaRegion.mockRejectedValue(
        new BadRequestException('Error al obtener productos'),
      );

      await expect(controller.obtenerProductosPorRegion(userRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.obtenerProductosDeUnaRegion).toHaveBeenCalledWith(1);
    });
  });
  

  describe('findById', () => {
    it('debería llamar al servicio con el ID y retornar su resultado', async () => {
      const expected:ProductoDetalle = {
        id: 1,
        nombre: 'Paracetamol',
        tipo: 'medicamento',
        sku: 'SKU-001',
        descripcion: 'Analgesico',
        precio: 1000,
        proveedor: {
          id: '1',
          nombre: 'ProveedorX',
          pais: 'PaisY',
        },
        productoPaisId: 1,
      }

      service.findById.mockResolvedValue(expected);

      const result = await controller.findById('1', jwt);

      expect(service.findById).toHaveBeenCalledWith('1', jwt);
      expect(result).toBe(expected);
    });

    it('debería propagar NotFoundException si el servicio lanza error', async () => {
      service.findById.mockRejectedValue(new NotFoundException('No encontrado'));

      await expect(controller.findById('1',jwt)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith('1', jwt);
    });
  });


});
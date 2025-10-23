import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';
import { TipoProducto } from '@medi-supply/productos-dm';

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
      const expected = new ProductoDetalleResponseDto();
      expected.id = 1;
      expected.nombre = 'Paracetamol';
      expected.tipo = 'medicamento';

      service.findById.mockResolvedValue(expected);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });

    it('debería propagar NotFoundException si el servicio lanza error', async () => {
      service.findById.mockRejectedValue(new NotFoundException('No encontrado'));

      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(999);
    });
  });


});
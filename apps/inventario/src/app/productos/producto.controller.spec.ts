import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { CreateProductoDto, TipoProducto } from './dtos/request/create-producto.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: jest.Mocked<ProductoService>;

  beforeEach(async () => {
    const mockProductoService = {
      createProducto: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ProductoService>;

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

      const result = await controller.createProducto(dto);

      expect(service.createProducto).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });

    it('debería propagar el error si el servicio falla', async () => {
      const dto: CreateProductoDto = {
        sku: 'SKU-002',
        nombre: 'X',
        descripcion: 'Y',
        tipo: TipoProducto.MEDICAMENTO,
        medicamento: { principioActivo: 'X', concentracion: '1' },
      } as unknown as CreateProductoDto;

      service.createProducto.mockRejectedValue(new BadRequestException('bad'));

      await expect(controller.createProducto(dto)).rejects.toThrow(BadRequestException);
      expect(service.createProducto).toHaveBeenCalledWith(dto);
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
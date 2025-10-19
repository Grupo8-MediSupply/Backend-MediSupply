import { Test, TestingModule } from '@nestjs/testing';
import { ProductosRegulacionController } from './productos-regulacion.controller';
import { ProductosRegulacionService } from './productos-regulacion.service';
import { ProductoRegulacionDto } from './dtos/request/producto-regulacion.dto';

describe('ProductosRegulacionController', () => {
  let controller: ProductosRegulacionController;
  let service: jest.Mocked<ProductosRegulacionService>;

  beforeEach(async () => {
    const mockService: Partial<ProductosRegulacionService> = {
      asociarRegulaciones: jest.fn(),
      listarPorProducto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosRegulacionController],
      providers: [
        {
          provide: ProductosRegulacionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductosRegulacionController>(ProductosRegulacionController);
    service = module.get(ProductosRegulacionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('asociarRegulaciones', () => {
    it('debe llamar al servicio para asociar regulaciones', async () => {
      const dto: ProductoRegulacionDto = { regulacionIds: ['uuid-test'] };
      const mockResponse = [
        {
          id: '1',
          productoId: 1,
          regulacionId: 'uuid-test',
          fechaAsociacion: new Date(),
          cumplimiento: false,
        },
      ];

      service.asociarRegulaciones.mockResolvedValue(mockResponse);

      const result = await controller.asociarRegulaciones(1, dto);

      expect(service.asociarRegulaciones).toHaveBeenCalledWith(1, ['uuid-test']);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listarPorProducto', () => {
    it('debe llamar al servicio para listar regulaciones por producto', async () => {
      const mockResponse = [
        {
          id: '2',
          productoId: 5,
          regulacionId: 'uuid-xyz',
          fechaAsociacion: new Date(),
          cumplimiento: true,
        },
      ];

      service.listarPorProducto.mockResolvedValue(mockResponse);

      const result = await controller.listarPorProducto(5);

      expect(service.listarPorProducto).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockResponse);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosRegulacionService } from './productos-regulacion.service';
import { IProductoRegulacionRepository, ProductoRegulacion } from '@medi-supply/productos-dm';

describe('ProductosRegulacionService', () => {
  let service: ProductosRegulacionService;
  let repo: jest.Mocked<IProductoRegulacionRepository>;

  beforeEach(async () => {
    const mockRepo: Partial<IProductoRegulacionRepository> = {
      asociarRegulaciones: jest.fn(),
      listarRegulacionesPorProducto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosRegulacionService,
        {
          provide: 'IProductoRegulacionRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProductosRegulacionService>(ProductosRegulacionService);
    repo = module.get('IProductoRegulacionRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('asociarRegulaciones', () => {
    it('debe asociar regulaciones correctamente y devolver DTOs', async () => {
      const mockData: ProductoRegulacion[] = [
        {
          id: '1',
          productoId: 1,
          regulacionId: 'abc-123',
          fechaAsociacion: new Date('2025-10-18'),
          cumplimiento: false,
        } as ProductoRegulacion,
      ];

      repo.asociarRegulaciones.mockResolvedValue(mockData);

      const result = await service.asociarRegulaciones(1, ['abc-123']);

      expect(repo.asociarRegulaciones).toHaveBeenCalledWith(1, ['abc-123']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        productoId: 1,
        regulacionId: 'abc-123',
        cumplimiento: false,
      });
    });
  });

  describe('listarPorProducto', () => {
    it('debe listar regulaciones asociadas a un producto', async () => {
      const mockData: ProductoRegulacion[] = [
        {
          id: '2',
          productoId: 5,
          regulacionId: 'xyz-999',
          fechaAsociacion: new Date('2025-10-19'),
          cumplimiento: true,
        } as ProductoRegulacion,
      ];

      repo.listarRegulacionesPorProducto.mockResolvedValue(mockData);

      const result = await service.listarPorProducto(5);

      expect(repo.listarRegulacionesPorProducto).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        productoId: 5,
        regulacionId: 'xyz-999',
        cumplimiento: true,
      });
    });
  });
});

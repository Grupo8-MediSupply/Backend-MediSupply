import { Test, TestingModule } from '@nestjs/testing';
import { BodegasController } from './bodegas.controller';
import { BodegasService } from './bodegas.service';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';

describe('BodegasController', () => {
  let controller: BodegasController;
  let service: BodegasService;

  const mockBodegaDto = new BodegaResponseDto(
    'uuid-123',
    1,
    'Bodega Central',
    'Medellín',
    5000,
    'Juan Pérez',
    new Date('2025-01-01T00:00:00Z'),
    new Date('2025-01-02T00:00:00Z'),
  );

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegasController],
      providers: [
        {
          provide: BodegasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BodegasController>(BodegasController);
    service = module.get<BodegasService>(BodegasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listarBodegas', () => {
    it('should return an array of bodegas', async () => {
      mockService.findAll.mockResolvedValue([mockBodegaDto]);

      const result = await controller.listarBodegas();

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Bodega Central');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerBodega', () => {
    it('should return a bodega by id', async () => {
  mockService.findById.mockResolvedValue(mockBodegaDto);

  const result = await controller.obtenerBodega('uuid-123');

  expect(result!).toBeInstanceOf(BodegaResponseDto);
  expect(result!.nombre).toBe('Bodega Central');
  expect(service.findById).toHaveBeenCalledWith('uuid-123');
});


    it('should return null when no bodega is found', async () => {
      mockService.findById.mockResolvedValue(null);

      const result = await controller.obtenerBodega('uuid-x');

      expect(result).toBeNull();
      expect(service.findById).toHaveBeenCalledWith('uuid-x');
    });
  });
});

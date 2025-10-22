import { Test, TestingModule } from '@nestjs/testing';
import { BodegasController } from './bodegas.controller';
import { BodegasService } from './bodegas.service';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';
import { JwtPayloadDto } from '@medi-supply/shared';
import { find } from 'rxjs';

describe('BodegasController', () => {
  let controller: BodegasController;
  let service: BodegasService;
  const jwt: JwtPayloadDto = {
      sub: 'user-123',
      email: 'testuser',
      pais: 1,
      role: 1,
    }

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
    findByPaisId: jest.fn(),

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
      mockService.findByPaisId.mockResolvedValue([mockBodegaDto]);

      const result = await controller.listarBodegas(jwt);

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Bodega Central');
      expect(service.findByPaisId).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerBodega', () => {
    it('should return a bodega by id', async () => {
  mockService.findById.mockResolvedValue(mockBodegaDto);

  const result = await controller.obtenerBodega('uuid-123', jwt);

  expect(result!).toBeInstanceOf(BodegaResponseDto);
  expect(result!.nombre).toBe('Bodega Central');
  expect(service.findById).toHaveBeenCalledWith('uuid-123', jwt);
});


    it('should return null when no bodega is found', async () => {
      mockService.findById.mockResolvedValue(null);

      const result = await controller.obtenerBodega('uuid-x', jwt);

      expect(result).toBeNull();
      expect(service.findById).toHaveBeenCalledWith('uuid-x', jwt);
    });
  });
});

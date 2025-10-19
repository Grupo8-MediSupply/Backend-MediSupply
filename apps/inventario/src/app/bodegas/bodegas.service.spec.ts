import { Test, TestingModule } from '@nestjs/testing';
import { BodegasService } from './bodegas.service';
import { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';

describe('BodegasService', () => {
  let service: BodegasService;
  let mockRepo: jest.Mocked<IBodegaRepository>;

  const mockBodega = new Bodega({
    id: 'uuid-123',
    paisId: 1,
    nombre: 'Bodega Central',
    ubicacion: 'Medellín',
    capacidad: 5000,
    responsable: 'Juan Pérez',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  });

  beforeEach(async () => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BodegasService,
        {
          provide: 'IBodegaRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<BodegasService>(BodegasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of bodegas mapped to DTOs', async () => {
      mockRepo.findAll.mockResolvedValue([mockBodega]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BodegaResponseDto);
      expect(result[0].nombre).toBe('Bodega Central');
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a bodega when found', async () => {
      mockRepo.findById.mockResolvedValue(mockBodega);

      const result = await service.findById('uuid-123');

      expect(result).toBeInstanceOf(BodegaResponseDto);
      expect(result?.id).toBe('uuid-123');
      expect(result?.responsable).toBe('Juan Pérez');
      expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should return null when bodega not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const result = await service.findById('no-existe');

      expect(result).toBeNull();
      expect(mockRepo.findById).toHaveBeenCalledWith('no-existe');
    });
  });
});

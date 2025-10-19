import { Test, TestingModule } from '@nestjs/testing';
import { PaisesService } from './paises.service';
import { PaisResponseDto } from './dtos/response/pais.response.dto';

// Mock del repositorio
const mockPaisRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
};

describe('PaisesService', () => {
  let service: PaisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaisesService,
        {
          provide: 'IPaisRepository',
          useValue: mockPaisRepository,
        },
      ],
    }).compile();

    service = module.get<PaisesService>(PaisesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería devolver un arreglo de PaisResponseDto', async () => {
      // Arrange
      const paisesMock = [
        {
          id: 10,
          codigoIso: 'COL',
          nombre: 'Colombia',
          moneda: 'Peso colombiano',
          simboloMoneda: '$',
          zonaHoraria: 'America/Bogota',
          idiomaOficial: 'Español',
          reguladorSanitario: null,
        },
        {
          id: 20,
          codigoIso: 'MEX',
          nombre: 'México',
          moneda: 'Peso mexicano',
          simboloMoneda: '$',
          zonaHoraria: 'America/Mexico_City',
          idiomaOficial: 'Español',
          reguladorSanitario: null,
        },
      ];
      mockPaisRepository.findAll.mockResolvedValue(paisesMock);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PaisResponseDto);
      expect(result[0].nombre).toBe('Colombia');
      expect(mockPaisRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('debería devolver un PaisResponseDto cuando el país existe', async () => {
      const paisMock = {
        id: 10,
        codigoIso: 'COL',
        nombre: 'Colombia',
        moneda: 'Peso colombiano',
        simboloMoneda: '$',
        zonaHoraria: 'America/Bogota',
        idiomaOficial: 'Español',
        reguladorSanitario: null,
      };
      mockPaisRepository.findById.mockResolvedValue(paisMock);

      const result = await service.findById(10);

      expect(result).toBeInstanceOf(PaisResponseDto);
      expect(result?.nombre).toBe('Colombia');
      expect(mockPaisRepository.findById).toHaveBeenCalledWith(10);
    });

    it('debería devolver null cuando el país no existe', async () => {
      mockPaisRepository.findById.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(mockPaisRepository.findById).toHaveBeenCalledWith(999);
    });
  });
});

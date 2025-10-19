import { Test, TestingModule } from '@nestjs/testing';
import { PaisesController } from './paises.controller';
import { PaisesService } from './paises.service';
import { PaisResponseDto } from './dtos/response/pais.response.dto';

describe('PaisesController', () => {
  let controller: PaisesController;
  let service: PaisesService;

  const mockPaisesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaisesController],
      providers: [
        {
          provide: PaisesService,
          useValue: mockPaisesService,
        },
      ],
    }).compile();

    controller = module.get<PaisesController>(PaisesController);
    service = module.get<PaisesService>(PaisesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listarPaises', () => {
    it('debería devolver todos los países', async () => {
      const mockResponse = [
        new PaisResponseDto(10, 'COL', 'Colombia', 'Peso colombiano', '$', 'America/Bogota', 'Español', null),
      ];
      mockPaisesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.listarPaises();

      expect(result).toEqual(mockResponse);
      expect(mockPaisesService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerPais', () => {
    it('debería devolver un país por ID', async () => {
      const mockPais = new PaisResponseDto(20, 'MEX', 'México', 'Peso mexicano', '$', 'America/Mexico_City', 'Español', null);
      mockPaisesService.findById.mockResolvedValue(mockPais);

      const result = await controller.obtenerPais(20);

      expect(result).toEqual(mockPais);
      expect(mockPaisesService.findById).toHaveBeenCalledWith(20);
    });

    it('debería devolver null si el país no existe', async () => {
      mockPaisesService.findById.mockResolvedValue(null);

      const result = await controller.obtenerPais(999);

      expect(result).toBeNull();
      expect(mockPaisesService.findById).toHaveBeenCalledWith(999);
    });
  });
});

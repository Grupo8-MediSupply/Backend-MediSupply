import { ConfiguracionService } from './configuracion.service';
import { Pais } from '@medi-supply/perfiles-dm';

describe('ConfiguracionService', () => {
  let service: ConfiguracionService;
  let mockPaisRepo: any;
  let mockTipoRepo: any;

  beforeEach(() => {
    mockPaisRepo = {
      findById: jest.fn(),
    };

    mockTipoRepo = {
      findByPaisId: jest.fn(),
    };

    service = new ConfiguracionService(mockPaisRepo, mockTipoRepo);
  });

  describe('getConfiguracionPorPais', () => {
    it('debe retornar la configuración completa si el país existe', async () => {
      // 🧱 Arrange
      const mockPais = {
        toPrimitives: jest.fn().mockReturnValue({
          id: 1,
          codigoIso: 'COL',
          nombre: 'Colombia',
          moneda: 'Peso colombiano',
          simboloMoneda: '$',
          zonaHoraria: 'America/Bogota',
          idiomaOficial: 'Español',
          reguladorSanitario: 'INVIMA',
          sigla_moneda: 'COP',
        }),
      };

      const mockTipos = [
        {
          toPrimitives: jest.fn().mockReturnValue({
            id: 10,
            nombre: 'Cédula de Ciudadanía',
            abreviatura: 'CC',
            paisId: 1,
          }),
        },
        {
          toPrimitives: jest.fn().mockReturnValue({
            id: 11,
            nombre: 'NIT',
            abreviatura: 'NIT',
            paisId: 1,
          }),
        },
      ];

      mockPaisRepo.findById.mockResolvedValue(mockPais);
      mockTipoRepo.findByPaisId.mockResolvedValue(mockTipos);

      // 🚀 Act
      const result = await service.getConfiguracionPorPais(1);

      // ✅ Assert
      expect(mockPaisRepo.findById).toHaveBeenCalledWith(1);
      expect(mockTipoRepo.findByPaisId).toHaveBeenCalledWith(1);
      expect(mockPais.toPrimitives).toHaveBeenCalled();
      expect(mockTipos[0].toPrimitives).toHaveBeenCalled();
      expect(mockTipos[1].toPrimitives).toHaveBeenCalled();

      expect(result).toEqual({
        pais: {
          id: 1,
          codigoIso: 'COL',
          nombre: 'Colombia',
          moneda: 'Peso colombiano',
          simboloMoneda: '$',
          zonaHoraria: 'America/Bogota',
          idiomaOficial: 'Español',
          reguladorSanitario: 'INVIMA',
          sigla_moneda: 'COP',
        },
        tiposIdentificacion: [
          {
            id: 10,
            nombre: 'Cédula de Ciudadanía',
            abreviatura: 'CC',
            paisId: 1,
          },
          {
            id: 11,
            nombre: 'NIT',
            abreviatura: 'NIT',
            paisId: 1,
          },
        ],
      });
    });

    it('debe retornar un mensaje si el país no existe', async () => {
      // 🧱 Arrange
      mockPaisRepo.findById.mockResolvedValue(null);

      // 🚀 Act
      const result = await service.getConfiguracionPorPais(999);

      // ✅ Assert
      expect(result).toEqual({
        message: 'No se encontró el país con id 999',
      });
      expect(mockPaisRepo.findById).toHaveBeenCalledWith(999);
      expect(mockTipoRepo.findByPaisId).not.toHaveBeenCalled();
    });

    it('debe manejar correctamente cuando no hay tipos de identificación', async () => {
      // 🧱 Arrange
      const mockPais = {
        toPrimitives: jest.fn().mockReturnValue({ id: 1, nombre: 'Colombia' }),
      };

      mockPaisRepo.findById.mockResolvedValue(mockPais);
      mockTipoRepo.findByPaisId.mockResolvedValue([]);

      // 🚀 Act
      const result = await service.getConfiguracionPorPais(1);

      // ✅ Assert
      expect(result).toEqual({
        pais: { id: 1, nombre: 'Colombia' },
        tiposIdentificacion: [],
      });
    });
  });
});

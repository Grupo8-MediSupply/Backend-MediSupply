import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';
import {  RolesGuard } from '@medi-supply/shared';
import type { JwtPayloadDto } from '@medi-supply/shared';


describe('ConfiguracionController', () => {
  let controller: ConfiguracionController;
  let service: ConfiguracionService;
  const mockConfiguration = {
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
    {
      id: 12,
      nombre: 'Pasaporte',
      abreviatura: 'PA',
      paisId: 1,
    },
  ],
};


  beforeEach(async () => {
    const mockConfiguracionService = {
      getConfiguracionPorPais: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracionController],
      providers: [
        {
          provide: ConfiguracionService,
          useValue: mockConfiguracionService,
        },
      ],
    })
      // 👇 Evitamos que el guard bloquee el test
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConfiguracionController>(ConfiguracionController);
    service = module.get<ConfiguracionService>(ConfiguracionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfiguracion', () => {
    it('debería devolver la configuración según el país del usuario', async () => {
      const mockUser : JwtPayloadDto = {
        sub: 'user123',
        email: 'testuser',
        pais: 1,
        role: 1,
      }

      jest
        .spyOn(service, 'getConfiguracionPorPais')
        .mockResolvedValue(mockConfiguration);

      const result = await controller.getConfiguracion(mockUser);

      expect(service.getConfiguracionPorPais).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConfiguration);
    });
  });
describe('getConfiguracionPorPais', () => {
  it('debería devolver la configuración según el id de país', async () => {
    jest
      .spyOn(service, 'getConfiguracionPorPais')
      .mockResolvedValue(mockConfiguration);

    const result = await controller.getConfiguracionPorPais(1);

    expect(service.getConfiguracionPorPais).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockConfiguration);
  });

  it('debería propagar errores del servicio', async () => {
    jest
      .spyOn(service, 'getConfiguracionPorPais')
      .mockRejectedValue(new Error('fail'));

    await expect(controller.getConfiguracionPorPais(99)).rejects.toThrow('fail');
    expect(service.getConfiguracionPorPais).toHaveBeenCalledWith(99);
  });
});
});

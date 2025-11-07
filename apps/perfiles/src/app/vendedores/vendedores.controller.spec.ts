import { Test, TestingModule } from '@nestjs/testing';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';
import { VendedorPorPaisResponseDto } from './dtos/response/vendedor-por-pais.response.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';

describe('VendedoresController (unit)', () => {
  let controller: VendedoresController;
  let service: jest.Mocked<VendedoresService>;
  const jwt: JwtPayloadDto = {
    sub: 'admin123',
    email: 'admin@medisupply.com',
    role: 2, // ADMIN
    pais: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendedoresController],
      providers: [
        {
          provide: VendedoresService,
          useValue: {
            create: jest.fn(),
            listarPorPais: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VendedoresController>(VendedoresController);
    service = module.get(VendedoresService);
  });

  // -----------------------------
  // TESTS CREATE
  // -----------------------------
  test('createVendedor delega en service.create y devuelve respuesta', async () => {
    const dto: CreateVendedorDto = {
      nombre: 'Pedro',
      email: 'pedro@correo.com',
      identificacion: '999',
      tipoIdentificacion: 1,
    };

    const mockResponse = new VendedorResponseDto('pedro@correo.com', '1');
    service.create.mockResolvedValue(mockResponse);

    const result = await controller.createVendedor(dto, jwt);

    expect(service.create).toHaveBeenCalledWith(dto, jwt);
    expect(result).toEqual(mockResponse);
  });

  // -----------------------------
  // TESTS LISTAR POR PAÍS
  // -----------------------------
  test('listarVendedoresPorPais delega en service.listarPorPais', async () => {
    const paisId = 1;
    const mockResponse = [
      new VendedorPorPaisResponseDto('id1', 'Juan', 'juan@correo.com', 1),
      new VendedorPorPaisResponseDto('id2', 'María', 'maria@correo.com', 1),
    ];

    service.listarPorPais.mockResolvedValue(mockResponse);

    const result = await controller.listarVendedoresPorPais(paisId);

    expect(service.listarPorPais).toHaveBeenCalledWith(paisId);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(VendedorPorPaisResponseDto);
  });

  test('listarVendedoresPorPais propaga error si service falla', async () => {
    service.listarPorPais.mockRejectedValue(new Error('DB error'));

    await expect(controller.listarVendedoresPorPais(1)).rejects.toThrow('DB error');
  });
});

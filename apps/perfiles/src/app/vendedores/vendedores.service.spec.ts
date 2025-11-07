import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';
import { VendedorPorPaisResponseDto } from './dtos/response/vendedor-por-pais.response.dto';
import { Vendedor } from '@medi-supply/perfiles-dm';
import type { IVendedorRepository } from '@medi-supply/perfiles-dm';
import { JwtPayloadDto } from '@medi-supply/shared';

describe('VendedoresService (unit)', () => {
  let service: VendedoresService;
  let mockRepo: jest.Mocked<IVendedorRepository>;
  let jwt: JwtPayloadDto;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCountry: jest.fn(),
    } as unknown as jest.Mocked<IVendedorRepository>;

    service = new VendedoresService(mockRepo);

    jwt = {
      sub: 'user123',
      email: 'ana@ejemplo.com',
      role: 1,
      pais: 51,
    };
  });

  // -----------------------------
  // TESTS PARA CREACIÓN
  // -----------------------------
  test('crea vendedor correctamente y devuelve VendedorResponseDto', async () => {
    const dto: CreateVendedorDto = {
      nombre: 'Ana',
      email: 'ana@ejemplo.com',
      identificacion: '123456',
      tipoIdentificacion: 1,
    };

    const createdFromRepo = {
      email: { Value: 'juan@ejemplo.com' },
      paisId: 51,
      nombre: { Value: 'Juan' },
    } as unknown as Vendedor;

    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.create(dto, jwt);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(VendedorResponseDto);
    expect(result.email).toBe('juan@ejemplo.com');
    expect(result.paisCreacion).toBe('51');
  });

  test('lanza cuando repo.create devuelve null/undefined', async () => {
    const dto: CreateVendedorDto = {
      nombre: 'Ana',
      email: 'ana@ejemplo.com',
      identificacion: '123456',
      tipoIdentificacion: 1,
    };

    mockRepo.create.mockResolvedValue(null as any);

    await expect(service.create(dto, jwt)).rejects.toThrow();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test('propaga error si repo.create falla', async () => {
    const dto: CreateVendedorDto = {
      nombre: 'Pedro',
      email: 'pedro@ejemplo.com',
      identificacion: '654321',
      tipoIdentificacion: 2,
    };

    mockRepo.create.mockRejectedValue(new Error('db failure'));

    await expect(service.create(dto, jwt)).rejects.toThrow('db failure');
  });

  // -----------------------------
  // TESTS PARA LISTAR POR PAÍS
  // -----------------------------
  test('listarPorPais devuelve arreglo de VendedorPorPaisResponseDto', async () => {
    const mockVendedores = [
      {
        id: '1',
        nombre: { Value: 'Juan Pérez' },
        email: { Value: 'juan@correo.com' },
        paisId: 1,
      },
      {
        id: '2',
        nombre: { Value: 'María Gómez' },
        email: { Value: 'maria@correo.com' },
        paisId: 1,
      },
    ] as unknown as Vendedor[];

    mockRepo.findByCountry.mockResolvedValue(mockVendedores);

    const result = await service.listarPorPais(1);

    expect(mockRepo.findByCountry).toHaveBeenCalledWith(1);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(VendedorPorPaisResponseDto);
    expect(result[0].nombre).toBe('Juan Pérez');
    expect(result[1].email).toBe('maria@correo.com');
  });

  test('listarPorPais devuelve arreglo vacío cuando repo retorna vacío', async () => {
    mockRepo.findByCountry.mockResolvedValue([]);

    const result = await service.listarPorPais(99);

    expect(result).toEqual([]);
    expect(mockRepo.findByCountry).toHaveBeenCalledWith(99);
  });

  test('listarPorPais propaga error si repo.findByCountry falla', async () => {
    mockRepo.findByCountry.mockRejectedValue(new Error('query failed'));

    await expect(service.listarPorPais(5)).rejects.toThrow('query failed');
  });
});

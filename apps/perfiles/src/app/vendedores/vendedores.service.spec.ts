import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';
import { Vendedor } from '@medi-supply/perfiles-dm';
import type { IVendedorRepository } from '@medi-supply/perfiles-dm';
import { JwtPayloadDto } from '@medi-supply/shared';

describe('VendedoresService (unit)', () => {
  let service: VendedoresService;
  let mockRepo: jest.Mocked<IVendedorRepository>;
  let jwt : JwtPayloadDto;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<IVendedorRepository>;

    service = new VendedoresService(mockRepo);

    jwt = {
      sub: 'user123',
      email: 'ana@ejemplo.com',
      role: 1,
      pais: 51,
    };
  });

  test('crea vendedor correctamente y devuelve VendedorResponseDto', async () => {
    // Arrange
    const dto: CreateVendedorDto = {
      nombre: 'Ana',
      email: 'ana@ejemplo.com',
      identificacion: '123456',
      tipoIdentificacion: 1,
    };

    const createdFromRepo = {
      email: { Value: 'juan@ejemplo.com' },
      paisId: 51,
      territorio: 'PE',
    } as unknown as Vendedor; // tipado más exacto

    mockRepo.create.mockResolvedValue(createdFromRepo);

    // Act
    const result = await service.create(dto, jwt);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(Vendedor);
    expect(result).toBeInstanceOf(VendedorResponseDto);
    expect(result.email).toBe('juan@ejemplo.com');
    expect(result.paisCreacion).toBe(String(createdFromRepo.paisId));
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
      tipoIdentificacion: 2,};

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto, jwt)).rejects.toThrow('db failure');
  });
});

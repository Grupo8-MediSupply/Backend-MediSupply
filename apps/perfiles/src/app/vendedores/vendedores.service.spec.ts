import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';
import { Vendedor } from '@medi-supply/perfiles-dm';
import type { IVendedorRepository } from '@medi-supply/perfiles-dm';

describe('VendedoresService (unit)', () => {
  let service: VendedoresService;
  let mockRepo: jest.Mocked<IVendedorRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<IVendedorRepository>;

    service = new VendedoresService(mockRepo);
  });

  test('crea vendedor correctamente y devuelve VendedorResponseDto', async () => {
    // Arrange
    const dto: CreateVendedorDto = {
      nombre: 'Juan',
      email: 'juan@ejemplo.com',
      territorio: 'PE',
    };

    const createdFromRepo = {
      email: { Value: 'juan@ejemplo.com' },
      paisId: 51,
      territorio: 'PE',
    } as unknown as Vendedor; // tipado más exacto

    mockRepo.create.mockResolvedValue(createdFromRepo);

    // Act
    const result = await service.create(dto);

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
      territorio: 'CL',
    };

    mockRepo.create.mockResolvedValue(null as any);

    await expect(service.create(dto)).rejects.toThrow();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test('propaga error si repo.create falla', async () => {
    const dto: CreateVendedorDto = {
      nombre: 'Pedro',
      email: 'pedro@ejemplo.com',
      territorio: 'AR',
    };

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto)).rejects.toThrow('db failure');
  });
});

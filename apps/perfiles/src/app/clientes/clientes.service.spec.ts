import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClienteResponseDto } from './dtos/response/cliente.response.dto';
import { Cliente } from '@medi-supply/perfiles-dm';
import type { IClienteRepository } from '@medi-supply/perfiles-dm';

describe('ClientesService (unit)', () => {
  let service: ClientesService;
  let mockRepo: jest.Mocked<IClienteRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<IClienteRepository>;

    service = new ClientesService(mockRepo);
  });

  test('crea cliente correctamente y devuelve ClienteResponseDto', async () => {
    // Arrange
    const dto: CreateClienteDto = {
      nombre: 'Clínica Santa María',
      tipoInstitucion: 'Hospital Universitario',
      clasificacion: 'Alta complejidad',
      responsableContacto: 'Dra. Laura Gómez',
      email: 'contacto@clinicasantamaria.com',
    };

    const createdFromRepo = {
      id: 'uuid-123',
      nombre: { Value: 'Clínica Santa María' },
      tipoInstitucion: 'Hospital Universitario',
      clasificacion: 'Alta complejidad',
      responsableContacto: 'Dra. Laura Gómez',
    } as unknown as Cliente;

    mockRepo.create.mockResolvedValue(createdFromRepo);

    // Act
    const result = await service.create(dto);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(Cliente);
    expect(result).toBeInstanceOf(ClienteResponseDto);
    expect(result.nombre).toBe('Clínica Santa María');
    expect(result.tipoInstitucion).toBe('Hospital Universitario');
    expect(result.clasificacion).toBe('Alta complejidad');
    expect(result.responsableContacto).toBe('Dra. Laura Gómez');
  });

  test('lanza cuando repo.create devuelve null/undefined', async () => {
    const dto: CreateClienteDto = {
      nombre: 'Hospital Central',
      tipoInstitucion: 'Hospital',
      clasificacion: 'Media',
      responsableContacto: 'Dr. López',
      email: 'dr.lopez@hospital.com',
    };

    mockRepo.create.mockResolvedValue(null as any);

    await expect(service.create(dto)).rejects.toThrow();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test('propaga error si repo.create falla', async () => {
    const dto: CreateClienteDto = {
      nombre: 'Clínica del Norte',
      tipoInstitucion: 'Clínica',
      clasificacion: 'Alta',
      responsableContacto: 'Dra. Pérez',
      email: 'draperez@clinicadelnorte.com',
    };

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto)).rejects.toThrow('db failure');
  });
});

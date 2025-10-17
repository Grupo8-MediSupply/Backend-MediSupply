import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';
import { ProveedorResponseDto } from './dtos/response/proveedor.response.dto';
import { Proveedor } from '@medi-supply/perfiles-dm';
import type { IProveedorRepository } from '@medi-supply/perfiles-dm';

describe('ProveedoresService (unit)', () => {
  let service: ProveedoresService;
  let mockRepo: jest.Mocked<IProveedorRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<IProveedorRepository>;

    service = new ProveedoresService(mockRepo);
  });

  test('crea proveedor correctamente y devuelve ProveedorResponseDto', async () => {
    // Arrange
    const dto: CreateProveedorDto = {
      nombreProveedor: 'Laboratorios Sanar',
      numeroIdentificacion: '900123456-7',
      pais: 'Colombia',
      email: 'contacto@sanar.com',
      contactoPrincipal: 'María Gómez',
      telefonoContacto: '+57 3102345678',
    };

    const createdFromRepo = {
      id: 'uuid-123',
      nombreProveedor: { Value: 'Laboratorios Sanar' },
      email: { Value: 'contacto@sanar.com' },
      pais: 'Colombia',
    } as unknown as Proveedor;

    mockRepo.create.mockResolvedValue(createdFromRepo);

    // Act
    const result = await service.create(dto);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(Proveedor);
    expect(result).toBeInstanceOf(ProveedorResponseDto);
    expect(result.id).toBe('uuid-123');
    expect(result.nombreProveedor).toBe('Laboratorios Sanar');
    expect(result.email).toBe('contacto@sanar.com');
    expect(result.pais).toBe('Colombia');
  });

  test('lanza error cuando repo.create devuelve null/undefined', async () => {
    const dto: CreateProveedorDto = {
      nombreProveedor: 'Farmacéutica XYZ',
      numeroIdentificacion: '901122334-5',
      pais: 'Chile',
      email: 'info@farmaceuticaxyz.com',
      contactoPrincipal: 'Pedro Rojas',
      telefonoContacto: '+56 912345678',
    };

    mockRepo.create.mockResolvedValue(null as any);

    await expect(service.create(dto)).rejects.toThrow();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test('propaga error si repo.create falla', async () => {
    const dto: CreateProveedorDto = {
      nombreProveedor: 'BioSalud',
      numeroIdentificacion: '123456789',
      pais: 'Argentina',
      email: 'contacto@biosalud.com',
      contactoPrincipal: 'Lucía Martínez',
      telefonoContacto: '+54 91122223333',
    };

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto)).rejects.toThrow('db failure');
  });
});

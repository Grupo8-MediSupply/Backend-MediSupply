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
      findByPais: jest.fn(),
    } as jest.Mocked<IProveedorRepository>;

    service = new ProveedoresService(mockRepo);
  });

  test('crea proveedor correctamente y devuelve ProveedorResponseDto', async () => {
    // Arrange
    const dto: CreateProveedorDto = {
      nombreProveedor: 'Laboratorios Sanar',
      numeroIdentificacion: '900123456-7',
      pais: 1,
      email: 'contacto@sanar.com',
      contactoPrincipal: 'María Gómez',
      telefonoContacto: '+57 3102345678',
      tipoIdentificacion: 1,
    };

    const paisId = 1;

    const createdFromRepo = {
      id: 'uuid-123',
      nombreProveedor: { Value: 'Laboratorios Sanar' },
      email: { Value: 'contacto@sanar.com' },
      pais: 'Colombia',
    } as unknown as Proveedor;

    mockRepo.create.mockResolvedValue(createdFromRepo);

    // Act
    const result = await service.create(dto, paisId);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(Proveedor);
    expect(result).toBeInstanceOf(ProveedorResponseDto);
    expect(result.id).toBe('uuid-123');
    expect(result.nombreProveedor).toBe('Laboratorios Sanar');
    expect(result.email).toBe('contacto@sanar.com');
  });

  test('lanza error cuando repo.create devuelve null/undefined', async () => {
    const dto: CreateProveedorDto = {
      nombreProveedor: 'Farmacéutica XYZ',
      numeroIdentificacion: '901122334-5',
      pais: 2,
      email: 'info@farmaceuticaxyz.com',
      contactoPrincipal: 'Pedro Rojas',
      telefonoContacto: '+56 912345678',
      tipoIdentificacion: 2,
    };

    const paisId = 2;

    mockRepo.create.mockResolvedValue(null as any);

    await expect(service.create(dto, paisId)).rejects.toThrow();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  test('propaga error si repo.create falla', async () => {
    const dto: CreateProveedorDto = {
      nombreProveedor: 'BioSalud',
      numeroIdentificacion: '123456789',
      pais: 1,
      email: 'contacto@biosalud.com',
      contactoPrincipal: 'Lucía Martínez',
      telefonoContacto: '+54 91122223333',
      tipoIdentificacion: 1,
    };

    const paisId = 3;

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto, paisId)).rejects.toThrow('db failure');
  });

  test('debería retornar lista mapeada de ProveedorResponseDto (AAA)', async () => {
    // Arrange
    const pais = 1;
    const repoResult = [
      {
        id: 'p1',
        nombreProveedor: { Value: 'Proveedor Uno' },
        email: { Value: 'p1@ejemplo.com' },
        paisId: pais,
        tipoIdentificacion: 1,
        identificacion: '9001',
      },
      {
        id: 'p2',
        nombreProveedor: { Value: 'Proveedor Dos' },
        email: { Value: 'p2@ejemplo.com' },
        paisId: pais,
        tipoIdentificacion: 2,
        identificacion: '9002',
      },
    ] as unknown as Proveedor[];

    mockRepo.findByPais.mockResolvedValue(repoResult);

    // Act
    const result = await service.findByPais(pais);

    // Assert
    expect(mockRepo.findByPais).toHaveBeenCalledWith(pais);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(ProveedorResponseDto);
    expect(result[0].id).toBe('p1');
    expect(result[0].nombreProveedor).toBe('Proveedor Uno');
    expect(result[0].email).toBe('p1@ejemplo.com');
    expect(result[1].id).toBe('p2');
  });

  test('debería retornar arreglo vacío cuando repo devuelve vacío (AAA)', async () => {
    // Arrange
    const pais = 99;
    mockRepo.findByPais.mockResolvedValue([]);

    // Act
    const result = await service.findByPais(pais);

    // Assert
    expect(mockRepo.findByPais).toHaveBeenCalledWith(pais);
    expect(result).toEqual([]);
  });

  test('debería propagar errores del repositorio (AAA)', async () => {
    // Arrange
    const pais = 2;
    mockRepo.findByPais.mockRejectedValue(new Error('db fail'));

    // Act & Assert
    await expect(service.findByPais(pais)).rejects.toThrow('db fail');
    expect(mockRepo.findByPais).toHaveBeenCalledWith(pais);
  });
});

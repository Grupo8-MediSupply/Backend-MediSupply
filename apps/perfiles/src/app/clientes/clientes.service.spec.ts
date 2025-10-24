import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';
import { ClienteResponseDto } from './dtos/response/cliente.response.dto';
import { Cliente } from '@medi-supply/perfiles-dm';
import type { IClienteRepository } from '@medi-supply/perfiles-dm';
import { RolesEnum } from '@medi-supply/shared';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

describe('ClientesService (unit)', () => {
  let service: ClientesService;
  let mockRepo: jest.Mocked<IClienteRepository>;

  beforeEach(() => {
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByVendedor: jest.fn(),
    } as jest.Mocked<IClienteRepository>;

    service = new ClientesService(mockRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('crea cliente correctamente y devuelve ClienteResponseDto', async () => {
    const dto: CreateClienteDto = {
      nombre: 'Clínica Santa María',
      tipoInstitucion: 'Hospital Universitario',
      clasificacion: 'Alta complejidad',
      responsableContacto: 'Dra. Laura Gómez',
      email: 'contacto@clinicasantamaria.com',
      pais: 2,
      identificacion: '123456789',
      password: 'securepassword',
      tipoIdentificacion: 1,
    };

    const createdFromRepo = new Cliente({
      id: 'uuid-123',
      email: dto.email,
      rolId: RolesEnum.CLIENTE,
      paisId: dto.pais,
      password: '***',
      nombre: dto.nombre,
      tipoInstitucion: dto.tipoInstitucion,
      clasificacion: dto.clasificacion,
      responsableContacto: dto.responsableContacto,
      identificacion: dto.identificacion,
      tipoIdentificacion: dto.tipoIdentificacion,
    });

    mockRepo.create.mockResolvedValue(createdFromRepo);

    const result = await service.create(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(Cliente);
    expect(result).toBeInstanceOf(ClienteResponseDto);
    expect(result).toEqual(
      new ClienteResponseDto(
        'uuid-123',
        'Clínica Santa María',
        'Hospital Universitario',
        'Alta complejidad',
        'Dra. Laura Gómez',
      ),
    );
  });

  test('lanza cuando repo.create devuelve null/undefined', async () => {
    const dto: CreateClienteDto = {
      nombre: 'Hospital Central',
      tipoInstitucion: 'Hospital',
      clasificacion: 'Media',
      responsableContacto: 'Dr. López',
      email: 'dr.lopez@hospital.com',
      pais: 2,
      identificacion: '123456789',
      password: 'securepassword',
      tipoIdentificacion: 1,
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
      pais: 2,
      identificacion: '123456789',
      password: 'securepassword',
      tipoIdentificacion: 1,
    };

    const repoError = new Error('db failure');
    mockRepo.create.mockRejectedValue(repoError);

    await expect(service.create(dto)).rejects.toThrow('db failure');
  });

  test('findById devuelve el cliente cuando existe', async () => {
    const repoCliente = new Cliente({
      id: 'cliente-1',
      email: 'cliente1@example.com',
      rolId: RolesEnum.CLIENTE,
      paisId: 2,
      password: '***',
      nombre: 'Cliente Uno',
      tipoInstitucion: 'Hospital',
      clasificacion: 'A',
      responsableContacto: 'Contacto Uno',
      identificacion: '111111111',
      tipoIdentificacion: 1,
    });

    mockRepo.findById.mockResolvedValue(repoCliente);

    const result = await service.findById('cliente-1');

    expect(mockRepo.findById).toHaveBeenCalledWith('cliente-1');
    expect(result).toBe(repoCliente);
  });

  test('findById lanza NotFoundException cuando no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.findById('no-existe')).rejects.toThrow(
      NotFoundException,
    );
  });

  test('listarPorVendedor devuelve DTOs mapeados', async () => {
    const repoClientes = [
      new Cliente({
        id: 'cliente-1',
        email: 'cliente1@example.com',
        rolId: RolesEnum.CLIENTE,
        paisId: 2,
        password: '***',
        nombre: 'Cliente Uno',
        tipoInstitucion: 'Hospital',
        clasificacion: 'A',
        responsableContacto: 'Contacto Uno',
        identificacion: '111111111',
        tipoIdentificacion: 1,
      }),
      new Cliente({
        id: 'cliente-2',
        email: 'cliente2@example.com',
        rolId: RolesEnum.CLIENTE,
        paisId: 2,
        password: '***',
        nombre: 'Cliente Dos',
        tipoInstitucion: 'Clínica',
        clasificacion: 'B',
        responsableContacto: 'Contacto Dos',
        identificacion: '222222222',
        tipoIdentificacion: 1,
      }),
    ];

    mockRepo.findByVendedor.mockResolvedValue(repoClientes);

    const result = await service.listarPorVendedor('vendedor-1');

    expect(mockRepo.findByVendedor).toHaveBeenCalledWith('vendedor-1');
    expect(result).toEqual([
      new ClienteResponseDto(
        'cliente-1',
        'Cliente Uno',
        'Hospital',
        'A',
        'Contacto Uno',
      ),
      new ClienteResponseDto(
        'cliente-2',
        'Cliente Dos',
        'Clínica',
        'B',
        'Contacto Dos',
      ),
    ]);
  });
});

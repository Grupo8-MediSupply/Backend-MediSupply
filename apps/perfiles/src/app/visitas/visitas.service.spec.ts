import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita, VisitaCliente } from '@medi-supply/perfiles-dm';
import type { IVisitaRepository, RutaVisitaProgramada } from '@medi-supply/perfiles-dm';
import { ClientesService } from '../clientes/clientes.service';
import { CreateVisitaDto } from './dtos/request/create-visita.dto';
import { JwtPayloadDto, RolesEnum } from '@medi-supply/shared';
import { GcpStorageService } from '@medi-supply/storage-service';

describe('VisitasService (unit)', () => {
  let service: VisitasService;
  let mockRepo: jest.Mocked<IVisitaRepository>;
  let serviciosClientesMock: jest.Mocked<ClientesService>;
  let servicioGcpStorageMock: jest.Mocked<GcpStorageService>;
  let crearVisitaDto: CreateVisitaDto;
  let jwt: JwtPayloadDto;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByCliente: jest.fn(),
      updateEstado: jest.fn(),
      addComentario: jest.fn(),
      findRutaPorFecha: jest.fn(),
      findById: jest.fn(),
      updateEvidenciaVideo: jest.fn(),
    } as unknown as jest.Mocked<IVisitaRepository>;

    serviciosClientesMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ClientesService>;

    servicioGcpStorageMock = {
      uploadBuffer: jest.fn(),
    } as unknown as jest.Mocked<GcpStorageService>;

    service = new VisitasService(mockRepo, serviciosClientesMock, servicioGcpStorageMock);
    crearVisitaDto = {
      clienteId: 'uuid-cliente',
      fechaVisita: new Date(Date.now() + 10000), // fecha futura
      comentarios: 'Primera visita',
    };
    jwt = {
      sub: 'uuid-vendedor',
      email: 'vendedor@example.com',
      role: 2,
      pais: 51,
    };
  });

  // ✅ Crear visita correctamente
  test('debería registrar una visita correctamente', async () => {
    const clienteId = 'uuid-cliente';
    const vendedorId = 'uuid-vendedor';
    const fechaVisita = new Date(Date.now() + 10000);
    const comentarios = 'Visita programada para seguimiento';

    const props = {
      clienteId: crearVisitaDto.clienteId,
      vendedorId: vendedorId,
      fechaVisita: crearVisitaDto.fechaVisita,
      comentarios: crearVisitaDto.comentarios,
    };

    const createdVisita = new VisitaCliente(props);
    mockRepo.create.mockResolvedValue(createdVisita);

    const result = await service.registrarVisita(crearVisitaDto, jwt);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(VisitaCliente);
    expect(result).toEqual(createdVisita);
  });

  // ❌ Fecha pasada lanza error
  test('debería lanzar BadRequestException si la fecha es pasada', async () => {
    const fechaPasada = new Date(Date.now() - 10000);
    crearVisitaDto.fechaVisita = fechaPasada;

    await expect(service.registrarVisita(crearVisitaDto, jwt)).rejects.toThrow(BadRequestException);
  });

  // ✅ Cambiar estado
  test('debería llamar al repositorio al cambiar estado', async () => {
    const id = 'uuid-visita';
    mockRepo.updateEstado.mockResolvedValue();

    await service.cambiarEstado(id, EstadoVisita.EN_CURSO);

    expect(mockRepo.updateEstado).toHaveBeenCalledWith(id, EstadoVisita.EN_CURSO);
  });

  // ✅ Agregar comentario
  test('debería llamar al repositorio al agregar comentario', async () => {
    const id = 'uuid-visita';
    const comentario = 'Cliente interesado en nuevo producto';
    mockRepo.addComentario.mockResolvedValue();

    await service.agregarComentario(id, comentario);

    expect(mockRepo.addComentario).toHaveBeenCalledWith(id, comentario);
  });

  // ✅ Listar por cliente
  test('debería listar visitas por cliente correctamente', async () => {
    const clienteId = 'uuid-cliente';
    const props1 = {
      id: 'uuid-visita-1',
      clienteId: clienteId,
      vendedorId: 'vend1',
      fechaVisita: new Date(),
      estado: EstadoVisita.PROGRAMADA,
    };
    const props2 = {
      id: 'uuid-visita-2',
      clienteId: clienteId,
      vendedorId: 'vend2',
      fechaVisita: new Date(),
      estado: EstadoVisita.FINALIZADA,
    };
    const visitas = [new VisitaCliente(props1), new VisitaCliente(props2)];

    mockRepo.findByCliente.mockResolvedValue(visitas);

    const result = await service.listarPorCliente(clienteId);

    expect(mockRepo.findByCliente).toHaveBeenCalledWith(clienteId);
    expect(result).toEqual(visitas);
  });

  // ✅ Consultar ruta sin resultados
  test('debería retornar mensaje cuando no hay visitas en la fecha consultada', async () => {
    mockRepo.findRutaPorFecha.mockResolvedValue([]);

    const result = await service.consultarRutaPorFecha('2024-07-20', jwt);

    expect(mockRepo.findRutaPorFecha).toHaveBeenCalledWith(
      jwt.sub,
      expect.any(Date),
      expect.any(Date)
    );

    const [, inicio, fin] = mockRepo.findRutaPorFecha.mock.calls[0];
    expect(inicio.toISOString()).toContain('T00:00:00.000Z');
    expect(fin.toISOString()).toContain('T23:59:59.999Z');

    expect(result.visitas).toEqual([]);
    expect(result.totalVisitas).toBe(0);
    expect(result.mensaje).toContain('No tiene visitas programadas');
  });

  // ✅ Consultar ruta con resultados
  test('debería mapear visitas programadas y devolver totales', async () => {
    const visitasProgramadas: RutaVisitaProgramada[] = [
      {
        visitaId: 'visita-1',
        clienteId: 'cliente-1',
        fechaVisita: new Date('2024-07-20T14:00:00Z'),
        estado: EstadoVisita.PROGRAMADA,
        nombreCliente: 'Clínica Central',
        direccion: 'Av. Principal 123',
        latitud: 4.65,
        longitud: -74.1,
      },
    ];

    mockRepo.findRutaPorFecha.mockResolvedValue(visitasProgramadas);

    const result = await service.consultarRutaPorFecha('2024-07-20', jwt);

    expect(result.totalVisitas).toBe(1);
    expect(result.visitas).toHaveLength(1);
    expect(result.visitas[0].nombreCliente).toBe('Clínica Central');
    expect(result.visitas[0].ubicacion).toEqual({ lat: 4.65, lng: -74.1 });
    expect(result).not.toHaveProperty('mensaje');
  });

  // ❌ Fecha inválida
  test('debería lanzar BadRequestException si la fecha tiene formato inválido', async () => {
    await expect(service.consultarRutaPorFecha('fecha-invalida', jwt)).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(mockRepo.findRutaPorFecha).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------
// 🧩 Pruebas unitarias de VisitasService.cargarVideoVisita
// --------------------------------------------------------------

type VisitaEntity = {
  id: string;
  vendedorId: string;
  clienteId: string;
};

describe('VisitasService.cargarVideoVisita', () => {
  let service: VisitasService;
  let mockVisitaRepo: {
    findById: jest.Mock<Promise<VisitaEntity | null>, [string]>;
    updateEvidenciaVideo: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockGcpStorage: {
    uploadBuffer: jest.Mock<
      Promise<{ objectUrl: string; signedUrl: string }>,
      [Buffer, string, string]
    >;
  };
  let mockClientesService: {
    findById: jest.Mock<Promise<unknown>, [string]>;
  };

  beforeEach(() => {
    mockVisitaRepo = {
      findById: jest.fn(),
      updateEvidenciaVideo: jest.fn().mockResolvedValue(undefined),
    };

    mockGcpStorage = {
      uploadBuffer: jest.fn(),
    };

    mockClientesService = {
      findById: jest.fn().mockResolvedValue(undefined),
    };

    service = new VisitasService(
      mockVisitaRepo as unknown as any,
      mockClientesService as unknown as any,
      mockGcpStorage as unknown as any
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sube el video correctamente siendo propietario (devuelve signedUrl y actualiza evidencia)', async () => {
    const visita: VisitaEntity = { id: 'v1', vendedorId: 'user-1', clienteId: 'c1' };
    mockVisitaRepo.findById.mockResolvedValueOnce(visita);

    const objectUrl = 'https://storage/object.mp4';
    const signedUrl = 'https://storage/signed/object.mp4';
    mockGcpStorage.uploadBuffer.mockResolvedValueOnce({ objectUrl, signedUrl });

    const buffer = Buffer.from('video-data');
    const mimetype = 'video/mp4';
    const originalName = 'video.mp4';
    const jwt: JwtPayloadDto = { sub: 'user-1', role: RolesEnum.VENDEDOR } as JwtPayloadDto;

    const result = await service.cargarVideoVisita(visita.id, buffer, mimetype, originalName, jwt);

    expect(result).toBe(signedUrl);
    expect(mockGcpStorage.uploadBuffer).toHaveBeenCalledTimes(1);
    expect(mockGcpStorage.uploadBuffer).toHaveBeenCalledWith(buffer, mimetype, originalName);
    expect(mockVisitaRepo.updateEvidenciaVideo).toHaveBeenCalledTimes(1);
    expect(mockVisitaRepo.updateEvidenciaVideo).toHaveBeenCalledWith(visita.id, objectUrl);
  });

  it('lanza NotFoundException si la visita no existe', async () => {
    mockVisitaRepo.findById.mockResolvedValueOnce(null);

    const buffer = Buffer.from('x');
    const jwt: JwtPayloadDto = { sub: 'u', role: RolesEnum.VENDEDOR } as JwtPayloadDto;

    await expect(
      service.cargarVideoVisita('missing-id', buffer, 'video/mp4', 'f.mp4', jwt)
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(mockGcpStorage.uploadBuffer).not.toHaveBeenCalled();
    expect(mockVisitaRepo.updateEvidenciaVideo).not.toHaveBeenCalled();
  });

  it('lanza ForbiddenException si no es admin ni propietario', async () => {
    const visita: VisitaEntity = { id: 'v2', vendedorId: 'owner-id', clienteId: 'c2' };
    mockVisitaRepo.findById.mockResolvedValueOnce(visita);

    const buffer = Buffer.from('x');
    const jwt: JwtPayloadDto = { sub: 'other-user', role: RolesEnum.VENDEDOR } as JwtPayloadDto;

    await expect(
      service.cargarVideoVisita(visita.id, buffer, 'video/mp4', 'f.mp4', jwt)
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(mockGcpStorage.uploadBuffer).not.toHaveBeenCalled();
    expect(mockVisitaRepo.updateEvidenciaVideo).not.toHaveBeenCalled();
  });

  // ✅ NUEVO 1: permite admin aunque no sea propietario
  it('permite admin aunque no sea propietario', async () => {
    const visita: VisitaEntity = { id: 'v3', vendedorId: 'owner-x', clienteId: 'c3' };
    mockVisitaRepo.findById.mockResolvedValueOnce(visita);

    const objectUrl = 'o';
    const signedUrl = 's';
    mockGcpStorage.uploadBuffer.mockResolvedValueOnce({ objectUrl, signedUrl });

    const buffer = Buffer.from('x');
    const jwt: JwtPayloadDto = { sub: 'other', role: RolesEnum.ADMIN } as JwtPayloadDto;

    const result = await service.cargarVideoVisita(visita.id, buffer, 'video/mp4', 'f.mp4', jwt);

    expect(result).toBe(signedUrl);
    expect(mockVisitaRepo.updateEvidenciaVideo).toHaveBeenCalledWith(visita.id, objectUrl);
  });

  // ✅ NUEVO 2: propaga error de uploadBuffer y no actualiza evidencia
  it('propaga error de uploadBuffer y no actualiza la evidencia', async () => {
    const visita: VisitaEntity = { id: 'v4', vendedorId: 'user-4', clienteId: 'c4' };
    mockVisitaRepo.findById.mockResolvedValueOnce(visita);

    const uploadError = new Error('upload failed');
    mockGcpStorage.uploadBuffer.mockRejectedValueOnce(uploadError);

    const buffer = Buffer.from('x');
    const jwt: JwtPayloadDto = { sub: 'user-4', role: RolesEnum.VENDEDOR } as JwtPayloadDto;

    await expect(
      service.cargarVideoVisita(visita.id, buffer, 'video/mp4', 'f.mp4', jwt)
    ).rejects.toBe(uploadError);

    expect(mockVisitaRepo.updateEvidenciaVideo).not.toHaveBeenCalled();
  });
});

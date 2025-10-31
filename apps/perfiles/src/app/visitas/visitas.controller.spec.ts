import { Test, TestingModule } from '@nestjs/testing';
import { VisitasController } from './visitas.controller';
import { VisitasService } from './visitas.service';
import { EstadoVisita } from '@medi-supply/perfiles-dm';
import { JwtPayloadDto } from '@medi-supply/shared';
import type { FastifyRequest } from 'fastify';
import { BadRequestException } from '@nestjs/common';

describe('VisitasController (unit)', () => {
  let controller: VisitasController;
  let service: VisitasService;
  let jwt: JwtPayloadDto;

  beforeEach(async () => {
    const mockVisitasService = {
      registrarVisita: jest.fn(),
      cambiarEstado: jest.fn(),
      agregarComentario: jest.fn(),
      listarPorCliente: jest.fn(),
      consultarRutaPorFecha: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitasController],
      providers: [
        {
          provide: VisitasService,
          useValue: mockVisitasService,
        },
      ],
    }).compile();

    controller = module.get<VisitasController>(VisitasController);
    service = module.get<VisitasService>(VisitasService);

    jwt = {
      sub: 'user123',
      email: 'ana@ejemplo.com',
      role: 1,
      pais: 51,
    };
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // ✅ registrar()
  it('debería llamar al servicio registrarVisita con los datos correctos', async () => {
    const body = {
      clienteId: 'uuid-cliente',
      fechaVisita: new Date('2024-07-01T10:00:00Z'),
      comentarios: 'Visita de prueba',
    };

    const expected = { id: 'uuid-visita', ...body };
    jest.spyOn(service, 'registrarVisita').mockResolvedValue(expected as any);

    const result = await controller.registrar(body, jwt);

    expect(service.registrarVisita).toHaveBeenCalledWith(body, jwt);
    expect(result).toEqual(expected);
  });

  // ✅ cambiarEstado()
  it('debería llamar al servicio cambiarEstado con id y estado correctos', async () => {
    const id = 'uuid-visita';
    const body = { estado: EstadoVisita.EN_CURSO };

    jest.spyOn(service, 'cambiarEstado').mockResolvedValue(undefined);

    await controller.cambiarEstado(id, body);

    expect(service.cambiarEstado).toHaveBeenCalledWith(id, body.estado);
  });

  // ✅ agregarComentario()
  it('debería llamar al servicio agregarComentario con id y comentario correctos', async () => {
    const id = 'uuid-visita';
    const body = { comentario: 'Cliente satisfecho' };

    jest.spyOn(service, 'agregarComentario').mockResolvedValue(undefined);

    await controller.agregarComentario(id, body);

    expect(service.agregarComentario).toHaveBeenCalledWith(id, body.comentario);
  });

  // ✅ listar()
  it('debería llamar al servicio listarPorCliente con clienteId correcto', async () => {
    const clienteId = 'uuid-cliente';
    const expected = [{ id: 'uuid1' }, { id: 'uuid2' }];

    jest.spyOn(service, 'listarPorCliente').mockResolvedValue(expected as any);

    const result = await controller.listar(clienteId);

    expect(service.listarPorCliente).toHaveBeenCalledWith(clienteId);
    expect(result).toEqual(expected);
  });

  // ✅ consultarRutaPorFecha()
  it('debería delegar en el servicio la consulta de ruta por fecha', async () => {
    const query = { fecha: '2024-07-20' };
    const expected = { totalVisitas: 0, visitas: [] };
    jest.spyOn(service, 'consultarRutaPorFecha').mockResolvedValue(expected as any);

    const result = await controller.consultarRutaPorFecha(query as any, jwt);

    expect(service.consultarRutaPorFecha).toHaveBeenCalledWith(query.fecha, jwt);
    expect(result).toEqual(expected);
  });
});

// ----------------------------------------------------------
// 🔽 Utilidades auxiliares para pruebas de carga de video
// ----------------------------------------------------------

type FilePart = {
  type: 'file' | 'field';
  mimetype?: string;
  filename?: string;
  file?: AsyncIterable<Buffer>;
};

function partsGenerator(parts: FilePart[]): AsyncIterable<FilePart> {
  return (async function* () {
    for (const p of parts) {
      yield p;
    }
  })();
}

function fileChunks(...chunks: Buffer[]): AsyncIterable<Buffer> {
  return (async function* () {
    for (const c of chunks) yield c;
  })();
}

// ----------------------------------------------------------
// 🔽 Pruebas unitarias del método uploadVideo()
// ----------------------------------------------------------

describe('VisitasController - uploadVideo', () => {
  let controller: VisitasController;
  let mockVisitasService: jest.Mocked<VisitasService>;

  beforeEach(() => {
    mockVisitasService = {
      cargarVideoVisita: jest.fn(),
    } as unknown as jest.Mocked<VisitasService>;

    controller = new VisitasController(
      mockVisitasService as unknown as VisitasService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ✅ caso exitoso
  it('sube video correctamente, llama al servicio y devuelve url y tamaño', async () => {
    const id = 'visita-1';
    const jwt = { sub: 'user-1' } as unknown as JwtPayloadDto;
    const chunks = [Buffer.from('hello'), Buffer.from('world')];
    const part: FilePart = {
      type: 'file',
      mimetype: 'video/mp4',
      filename: 'video.mp4',
      file: fileChunks(...chunks),
    };

    const req = {
      parts: () => partsGenerator([part]),
    } as unknown as FastifyRequest;
    const expectedUrl = 'https://storage/video.mp4';
    mockVisitasService.cargarVideoVisita.mockResolvedValueOnce(expectedUrl);

    const result = await controller.uploadVideo(id, req, jwt);

    const expectedBuffer = Buffer.concat(chunks);
    expect(mockVisitasService.cargarVideoVisita).toHaveBeenCalledTimes(1);
    expect(mockVisitasService.cargarVideoVisita).toHaveBeenCalledWith(
      id,
      expectedBuffer,
      'video/mp4',
      'video.mp4',
      jwt
    );

    expect(result).toHaveProperty('message', 'Video subido correctamente');
    expect(result).toHaveProperty('url', expectedUrl);
    expect(result).toHaveProperty('size');
    expect(typeof result.size).toBe('string');
    expect(result.size).toMatch(/MB$/);
  });

  // ⚠️ tipo inválido
  it('lanza BadRequestException si el archivo no es video', async () => {
    const id = 'visita-2';
    const jwt = { sub: 'user-2' } as unknown as JwtPayloadDto;
    const part: FilePart = {
      type: 'file',
      mimetype: 'image/png',
      filename: 'image.png',
      file: fileChunks(Buffer.from('data')),
    };

    const req = {
      parts: () => partsGenerator([part]),
    } as unknown as FastifyRequest;

    await expect(controller.uploadVideo(id, req, jwt)).rejects.toBeInstanceOf(
      BadRequestException
    );
    await expect(controller.uploadVideo(id, req, jwt)).rejects.toThrow(
      'Solo se permiten archivos de video'
    );
    expect(mockVisitasService.cargarVideoVisita).not.toHaveBeenCalled();
  });

  // ⚠️ archivo demasiado grande
  it('lanza BadRequestException si el archivo supera 30MB', async () => {
    const id = 'visita-3';
    const jwt = { sub: 'user-3' } as unknown as JwtPayloadDto;
    const bigChunk = Buffer.alloc(31 * 1024 * 1024, 0);
    const part: FilePart = {
      type: 'file',
      mimetype: 'video/mp4',
      filename: 'big.mp4',
      file: fileChunks(bigChunk),
    };

    const req = {
      parts: () => partsGenerator([part]),
    } as unknown as FastifyRequest;

    await expect(controller.uploadVideo(id, req, jwt)).rejects.toThrow(
      'El archivo supera el límite de 30MB'
    );

    expect(mockVisitasService.cargarVideoVisita).not.toHaveBeenCalled();
  });

  // ⚠️ sin archivo recibido
  it('lanza BadRequestException si no se recibió ningún archivo', async () => {
    const id = 'visita-4';
    const jwt = { sub: 'user-4' } as unknown as JwtPayloadDto;
    const fieldPart: FilePart = { type: 'field' };
    const req = {
      parts: () => partsGenerator([fieldPart]),
    } as unknown as FastifyRequest;

    await expect(controller.uploadVideo(id, req, jwt)).rejects.toBeInstanceOf(
      BadRequestException
    );
    await expect(controller.uploadVideo(id, req, jwt)).rejects.toThrow(
      'No se recibió ningún archivo'
    );
    expect(mockVisitasService.cargarVideoVisita).not.toHaveBeenCalled();
  });
});

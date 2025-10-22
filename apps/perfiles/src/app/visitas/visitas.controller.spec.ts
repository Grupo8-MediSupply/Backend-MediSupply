import { Test, TestingModule } from '@nestjs/testing';
import { VisitasController } from './visitas.controller';
import { VisitasService } from './visitas.service';
import { EstadoVisita } from '@medi-supply/perfiles-dm';
import { JwtPayloadDto } from '@medi-supply/shared';

describe('VisitasController (unit)', () => {
  let controller: VisitasController;
  let service: VisitasService;
    let jwt : JwtPayloadDto;
  

  beforeEach(async () => {
    const mockVisitasService = {
      registrarVisita: jest.fn(),
      cambiarEstado: jest.fn(),
      agregarComentario: jest.fn(),
      listarPorCliente: jest.fn(),
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

    const result = await controller.registrar(body,jwt);

    expect(service.registrarVisita).toHaveBeenCalledWith(
      body,
      jwt
    );
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
});

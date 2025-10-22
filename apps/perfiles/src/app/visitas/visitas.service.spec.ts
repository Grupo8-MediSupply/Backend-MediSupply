import { BadRequestException } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita, VisitaCliente } from '@medi-supply/perfiles-dm';
import type { IVisitaRepository } from '@medi-supply/perfiles-dm';
import { ClientesService } from '../clientes/clientes.service';
import { CreateVisitaDto } from './dtos/request/create-visita.dto';
import { JwtPayloadDto } from '@medi-supply/shared';

describe('VisitasService (unit)', () => {
  let service: VisitasService;
  let mockRepo: jest.Mocked<IVisitaRepository>;
  let serviciosClientesMock: jest.Mocked<ClientesService>;
  let crearVisitaDto: CreateVisitaDto;
  let jwt: JwtPayloadDto

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByCliente: jest.fn(),
      updateEstado: jest.fn(),
      addComentario: jest.fn(),
    } as unknown as jest.Mocked<IVisitaRepository>;

    serviciosClientesMock = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ClientesService>;

    service = new VisitasService(mockRepo, serviciosClientesMock);
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
    const fechaVisita = new Date(Date.now() + 10000); // fecha futura
    const comentarios = 'Visita programada para seguimiento';

    const props ={
      clienteId:crearVisitaDto.clienteId,
      vendedorId:vendedorId,
      fechaVisita:crearVisitaDto.fechaVisita,
      comentarios:crearVisitaDto.comentarios,
    }

    const createdVisita = new VisitaCliente(
      props
    );

    mockRepo.create.mockResolvedValue(createdVisita);

    const result = await service.registrarVisita(
      crearVisitaDto,jwt
    );

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(VisitaCliente);
    expect(result).toEqual(createdVisita);
  });

  // ❌ Fecha pasada lanza error
  test('debería lanzar BadRequestException si la fecha es pasada', async () => {
    const fechaPasada = new Date(Date.now() - 10000);

    crearVisitaDto.fechaVisita = fechaPasada;

    await expect(
      service.registrarVisita(crearVisitaDto,jwt),
    ).rejects.toThrow(BadRequestException);
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
    const props1 ={
      id:'uuid-visita-1',
      clienteId:clienteId,
      vendedorId:'vend1',
      fechaVisita:new Date(),
      estado:EstadoVisita.PROGRAMADA,
    }
    const props2 ={
      id:'uuid-visita-2',
      clienteId:clienteId,
      vendedorId:'vend2',
      fechaVisita:new Date(),
      estado:EstadoVisita.FINALIZADA,
    }
    const visitas = [
      new VisitaCliente(props1),
      new VisitaCliente(props2),
    ];

    mockRepo.findByCliente.mockResolvedValue(visitas);

    const result = await service.listarPorCliente(clienteId);

    expect(mockRepo.findByCliente).toHaveBeenCalledWith(clienteId);
    expect(result).toEqual(visitas);
  });
});

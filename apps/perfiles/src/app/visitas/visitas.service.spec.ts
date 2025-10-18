import { BadRequestException } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { EstadoVisita, VisitaCliente } from '@medi-supply/perfiles-dm';
import type { IVisitaRepository } from '@medi-supply/perfiles-dm';

describe('VisitasService (unit)', () => {
  let service: VisitasService;
  let mockRepo: jest.Mocked<IVisitaRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByCliente: jest.fn(),
      updateEstado: jest.fn(),
      addComentario: jest.fn(),
    } as unknown as jest.Mocked<IVisitaRepository>;

    service = new VisitasService(mockRepo);
  });

  // ✅ Crear visita correctamente
  test('debería registrar una visita correctamente', async () => {
    const clienteId = 'uuid-cliente';
    const vendedorId = 'uuid-vendedor';
    const fechaVisita = new Date(Date.now() + 10000); // fecha futura
    const comentarios = 'Visita programada para seguimiento';

    const createdVisita = new VisitaCliente(
      'uuid-visita',
      clienteId,
      vendedorId,
      fechaVisita,
      EstadoVisita.PROGRAMADA,
      comentarios,
    );

    mockRepo.create.mockResolvedValue(createdVisita);

    const result = await service.registrarVisita(
      clienteId,
      vendedorId,
      fechaVisita,
      comentarios,
    );

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create.mock.calls[0][0]).toBeInstanceOf(VisitaCliente);
    expect(result).toEqual(createdVisita);
  });

  // ❌ Fecha pasada lanza error
  test('debería lanzar BadRequestException si la fecha es pasada', async () => {
    const fechaPasada = new Date(Date.now() - 10000);

    await expect(
      service.registrarVisita('cliente', 'vendedor', fechaPasada),
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
    const visitas = [
      new VisitaCliente('1', clienteId, 'vend1', new Date(), EstadoVisita.PROGRAMADA),
      new VisitaCliente('2', clienteId, 'vend2', new Date(), EstadoVisita.FINALIZADA),
    ];

    mockRepo.findByCliente.mockResolvedValue(visitas);

    const result = await service.listarPorCliente(clienteId);

    expect(mockRepo.findByCliente).toHaveBeenCalledWith(clienteId);
    expect(result).toEqual(visitas);
  });
});

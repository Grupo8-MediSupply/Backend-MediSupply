import { Test, TestingModule } from '@nestjs/testing';
import { PlanesVentaService } from './planes-venta.service';
import { IPlanesVentaRepository, PlanVenta } from '@medi-supply/ventas-dm';
import { CrearPlanVentaDto } from './dtos/request/crear-plan-venta.dto';
import { JwtPayloadDto } from '@medi-supply/shared';
import { BadRequestException } from '@nestjs/common';

describe('PlanesVentaService', () => {
  let service: PlanesVentaService;
  let repository: jest.Mocked<IPlanesVentaRepository>;

  const usuario: JwtPayloadDto = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: 1,
    pais: 34,
  };

  beforeEach(async () => {
    repository = {
      crearPlan: jest.fn(),
    } as unknown as jest.Mocked<IPlanesVentaRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanesVentaService,
        { provide: 'IPlanesVentaRepository', useValue: repository },
      ],
    }).compile();

    service = module.get<PlanesVentaService>(PlanesVentaService);
  });

  it('debería crear un plan de venta y devolver la respuesta formateada', async () => {
    const dto = {
      nombre: 'Plan Q1',
      vendedorId: 'b3c8bb5d-9f04-4f0c-b632-6cd0ab5d1234',
      montoMeta: 50000,
      inicio: '01/02/2025',
      fin: '30/04/2025',
      descripcion: 'Objetivo trimestral',
    } as CrearPlanVentaDto;

    const planPersistido = new PlanVenta({
      id: 'plan-1',
      nombre: dto.nombre,
      vendedorId: dto.vendedorId,
      montoMeta: dto.montoMeta,
      fechaInicio: new Date(Date.UTC(2025, 1, 1)),
      fechaFin: new Date(Date.UTC(2025, 3, 30)),
      descripcion: dto.descripcion,
      paisId: usuario.pais,
      creadoPor: usuario.sub,
    });

    repository.crearPlan.mockResolvedValue(planPersistido);

    const result = await service.crearPlanVenta(dto, usuario);

    expect(repository.crearPlan).toHaveBeenCalledTimes(1);
    const planGuardado = repository.crearPlan.mock.calls[0][0];
    expect(planGuardado).toBeInstanceOf(PlanVenta);
    expect(planGuardado.fechaInicio.toISOString()).toBe('2025-02-01T00:00:00.000Z');
    expect(planGuardado.fechaFin.toISOString()).toBe('2025-04-30T00:00:00.000Z');
    expect(result).toMatchObject({
      id: planPersistido.id,
      nombre: planPersistido.nombre,
      vendedorId: planPersistido.vendedorId,
      montoMeta: planPersistido.montoMeta,
      inicio: '01/02/2025',
      fin: '30/04/2025',
      descripcion: planPersistido.descripcion,
    });
  });

  it('debería lanzar un error cuando la fecha de fin es menor a la de inicio', async () => {
    const dto = {
      nombre: 'Plan inválido',
      vendedorId: 'b3c8bb5d-9f04-4f0c-b632-6cd0ab5d1234',
      montoMeta: 1000,
      inicio: '10/05/2025',
      fin: '09/05/2025',
      descripcion: 'Fechas incorrectas',
    } as CrearPlanVentaDto;

    await expect(service.crearPlanVenta(dto, usuario)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.crearPlan).not.toHaveBeenCalled();
  });

  it('debería rechazar fechas inexistentes', async () => {
    const dto = {
      nombre: 'Plan inválido',
      vendedorId: 'b3c8bb5d-9f04-4f0c-b632-6cd0ab5d1234',
      montoMeta: 1000,
      inicio: '31/02/2025',
      fin: '10/03/2025',
      descripcion: 'Fecha inválida',
    } as CrearPlanVentaDto;

    await expect(service.crearPlanVenta(dto, usuario)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.crearPlan).not.toHaveBeenCalled();
  });
});

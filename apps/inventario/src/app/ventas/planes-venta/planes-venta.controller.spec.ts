import { Test, TestingModule } from '@nestjs/testing';
import { PlanesVentaController } from './planes-venta.controller';
import { PlanesVentaService } from './planes-venta.service';
import { CrearPlanVentaDto } from './dtos/request/crear-plan-venta.dto';
import { PlanVentaResponseDto } from './dtos/response/plan-venta.response.dto';
import { JwtPayloadDto } from '@medi-supply/shared';

describe('PlanesVentaController', () => {
  let controller: PlanesVentaController;
  let service: jest.Mocked<PlanesVentaService>;

  const usuario: JwtPayloadDto = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: 1,
    pais: 34,
  };

  beforeEach(async () => {
    const serviceMock = {
      crearPlanVenta: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanesVentaController],
      providers: [
        {
          provide: PlanesVentaService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PlanesVentaController>(PlanesVentaController);
    service = module.get(PlanesVentaService) as jest.Mocked<PlanesVentaService>;
  });

  it('debería delegar en el servicio y retornar su respuesta', async () => {
    const dto = {
      nombre: 'Plan Q1',
      vendedorId: 'b3c8bb5d-9f04-4f0c-b632-6cd0ab5d1234',
      montoMeta: 50000,
      inicio: '01/02/2025',
      fin: '30/04/2025',
      descripcion: 'Objetivo trimestral',
    } as CrearPlanVentaDto;

    const respuesta = {
      id: 'plan-1',
      nombre: dto.nombre,
      vendedorId: dto.vendedorId,
      montoMeta: dto.montoMeta,
      inicio: dto.inicio,
      fin: dto.fin,
      descripcion: dto.descripcion,
    } as PlanVentaResponseDto;

    service.crearPlanVenta.mockResolvedValue(respuesta);

    const result = await controller.crearPlanVenta(dto, usuario);

    expect(service.crearPlanVenta).toHaveBeenCalledWith(dto, usuario);
    expect(result).toBe(respuesta);
  });

  it('debería propagar los errores del servicio', async () => {
    const dto = {
      nombre: 'Plan Q1',
      vendedorId: 'b3c8bb5d-9f04-4f0c-b632-6cd0ab5d1234',
      montoMeta: 50000,
      inicio: '01/02/2025',
      fin: '30/04/2025',
      descripcion: 'Objetivo trimestral',
    } as CrearPlanVentaDto;

    service.crearPlanVenta.mockRejectedValue(new Error('falló'));

    await expect(controller.crearPlanVenta(dto, usuario)).rejects.toThrow('falló');
    expect(service.crearPlanVenta).toHaveBeenCalledWith(dto, usuario);
  });
});

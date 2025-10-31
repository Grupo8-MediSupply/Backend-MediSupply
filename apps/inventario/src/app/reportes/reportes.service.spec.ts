import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import type { IReportesRepository } from './repositories/reportes.repository';
import { ReporteVendedorQueryDto } from './dtos/request/reporte-vendedor.query.dto';
import { ReporteVendedorResponseDto } from './dtos/response/reporte-vendedor.response.dto';

describe('ReportesService', () => {
  let service: ReportesService;
  let mockRepository: jest.Mocked<IReportesRepository>;

  beforeEach(async () => {
    mockRepository = {
      obtenerReporteVendedores: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: 'IReportesRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debería llamar al repositorio con los filtros y retornar el mapeo correcto', async () => {
    const filtros: ReporteVendedorQueryDto = { vendedorId: 'abc-123' } as any;

    mockRepository.obtenerReporteVendedores.mockResolvedValue([
      {
        vendedorId: 'abc-123',
        vendedorNombre: 'Juan Pérez',
        planId: 'plan-1',
        planNombre: 'Plan Dorado',
        ventasTotales: '1000',
        pedidosGestionados: '5',
        valorPromedioPedido: '200',
      },
    ]);

    const result = await service.obtenerReporteVendedores(filtros);

    expect(mockRepository.obtenerReporteVendedores).toHaveBeenCalledWith(filtros);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(ReporteVendedorResponseDto);
    expect(result[0]).toMatchObject({
      vendedorId: 'abc-123',
      vendedorNombre: 'Juan Pérez',
      planId: 'plan-1',
      planNombre: 'Plan Dorado',
      ventasTotales: 1000,
      pedidosGestionados: 5,
      valorPromedioPedido: 200,
    });
  });

  it('debería asignar 0 y undefined a campos nulos', async () => {
    mockRepository.obtenerReporteVendedores.mockResolvedValue([
      {
        vendedorId: 'v1',
        vendedorNombre: 'Sin Plan',
        planId: null,
        planNombre: null,
        ventasTotales: null,
        pedidosGestionados: null,
        valorPromedioPedido: null,
      },
    ]);

    const result = await service.obtenerReporteVendedores({} as any);
    expect(result[0]).toMatchObject({
      planId: undefined,
      planNombre: undefined,
      ventasTotales: 0,
      pedidosGestionados: 0,
      valorPromedioPedido: 0,
    });
  });
});

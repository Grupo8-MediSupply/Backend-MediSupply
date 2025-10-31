import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReporteVendedorResponseDto } from './dtos/response/reporte-vendedor.response.dto';

describe('ReportesController', () => {
  let controller: ReportesController;
  let mockService: jest.Mocked<ReportesService>;

  beforeEach(async () => {
    mockService = {
      obtenerReporteVendedores: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [{ provide: ReportesService, useValue: mockService }],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debería retornar los reportes del servicio', async () => {
    const filtros = { vendedorId: 'v1' } as any;
    const mockResponse: ReporteVendedorResponseDto[] = [
      {
        vendedorId: 'v1',
        vendedorNombre: 'Juan',
        planId: 'p1',
        planNombre: 'Plan Premium',
        ventasTotales: 2000,
        pedidosGestionados: 3,
        valorPromedioPedido: 666.67,
      },
    ];

    mockService.obtenerReporteVendedores.mockResolvedValue(mockResponse);

    const result = await controller.obtenerReporteVendedores(filtros);

    expect(mockService.obtenerReporteVendedores).toHaveBeenCalledWith(filtros);
    expect(result).toEqual(mockResponse);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  const mockService = { listarAuditorias: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [{ provide: AuditoriaService, useValue: mockService }],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('listar delega en el servicio con los filtros recibidos', async () => {
    const filtros = { usuario: 'admin', accion: 'LOGIN' } as any;
    mockService.listarAuditorias.mockResolvedValue(['ok']);

    const result = await controller.listar(filtros);

    expect(mockService.listarAuditorias).toHaveBeenCalledWith(filtros);
    expect(result).toEqual(['ok']);
  });
});
